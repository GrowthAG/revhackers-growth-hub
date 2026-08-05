import type { QueryResultRow } from 'pg';
import type { VerifiedToken } from '../contracts/identity';
import type { GlobalRole, InternalUser, Membership, MembershipStatus, TenantId, TenantRole } from '../contracts/tenant';
import { withTenantTransaction, type QueryablePool } from '../db/postgres';

interface UserRow extends QueryResultRow {
  id: string;
  global_role: GlobalRole | null;
  status: 'active' | 'disabled';
  tenant_id: string | null;
  membership_role: TenantRole | null;
  membership_status: MembershipStatus | null;
}

export interface IdentityRepository {
  findUser(token: Pick<VerifiedToken, 'issuer' | 'subject'>): Promise<InternalUser | null>;
  findOrCreateUser(token: Pick<VerifiedToken, 'issuer' | 'subject'>): Promise<InternalUser>;
  resolveProjectTenant(user: InternalUser, projectId: string): Promise<TenantId | null>;
}

export class PostgresIdentityRepository implements IdentityRepository {
  constructor(private readonly pool: QueryablePool) {}

  async findUser(token: Pick<VerifiedToken, 'issuer' | 'subject'>): Promise<InternalUser | null> {
    const result = await this.pool.query<UserRow>(`
      SELECT u.id::text, u.global_role, u.status,
             m.tenant_id::text, m.role AS membership_role,
             m.status AS membership_status
      FROM app.user_identities i
      JOIN app.internal_users u ON u.id = i.user_id
      LEFT JOIN app.tenant_memberships m ON m.user_id = u.id
      WHERE i.issuer = $1 AND i.subject = $2
      ORDER BY m.tenant_id
    `, [token.issuer, token.subject]);
    const first = result.rows[0];
    if (!first) return null;

    const memberships: Membership[] = result.rows.flatMap((row) =>
      row.tenant_id && row.membership_role && row.membership_status
        ? [{ userId: first.id, tenantId: row.tenant_id, role: row.membership_role, status: row.membership_status }]
        : [],
    );
    return { id: first.id, globalRole: first.global_role, status: first.status, memberships };
  }

  /**
   * Verifica se email está na allowlist (match exato ou por domínio).
   * Retorna true se autorizado, false se bloqueado.
   */
  async isEmailAllowed(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase();
    const domain = '@' + normalizedEmail.split('@')[1];
    
    const result = await this.pool.query<{ id: string }>(`
      SELECT id FROM admin_allowlist 
      WHERE email_pattern = $1 OR email_pattern = $2
      LIMIT 1
    `, [normalizedEmail, domain]);
    
    return result.rows.length > 0;
  }

  /**
   * Garante que o usuario existe no banco. Se nao existir, cria com role=null e
   * status=active. Nunca cria tenant nem membership — isso e feito fora daqui.
   * Seguro porque o token ja foi verificado pelo Firebase antes desta chamada.
   * 
   * BLOQUEIA automaticamente emails fora da allowlist (retorna erro 403).
   */
  async findOrCreateUser(token: Pick<VerifiedToken, 'issuer' | 'subject'>): Promise<InternalUser> {
    const existing = await this.findUser(token);
    if (existing) return existing;

    // Extrair email do token subject (formato Firebase: "google-oauth2|123456|email")
    const email = this.extractEmailFromSubject(token.subject);
    if (!email) {
      throw new Error('findOrCreateUser: não foi possível extrair email do token.');
    }

    // Verificar allowlist antes de criar usuário
    const isAllowed = await this.isEmailAllowed(email);
    if (!isAllowed) {
      throw new Error('EMAIL_NOT_ALLOWED:' + email);
    }

    // Upsert atomico: cria internal_user + user_identity em uma transacao sem tenant
    const result = await this.pool.query<{ id: string; global_role: GlobalRole | null; status: 'active' | 'disabled' }>(`
      WITH new_user AS (
        INSERT INTO internal_users (global_role, status)
        VALUES (NULL, 'active')
        RETURNING id, global_role, status
      ),
      new_identity AS (
        INSERT INTO user_identities (user_id, provider, provider_id)
        SELECT id, $1, $2 FROM new_user
        RETURNING user_id
      )
      SELECT id, global_role, status FROM new_user
    `, [token.issuer, token.subject]);

    const row = result.rows[0];
    if (!row) throw new Error('findOrCreateUser: insert returned no row.');
    return { id: row.id, globalRole: row.global_role, status: row.status, memberships: [] };
  }

  /**
   * Extrai email do subject do token Firebase.
   * Formato: "google-oauth2|123456|email@domain.com"
   */
  private extractEmailFromSubject(subject: string): string | null {
    // Firebase subject format: provider|provider_id|email
    const parts = subject.split('|');
    if (parts.length === 3) {
      const email = parts[2];
      if (email && email.includes('@')) {
        return email.toLowerCase();
      }
    }
    return null;
  }

  async resolveProjectTenant(user: InternalUser, projectId: string): Promise<TenantId | null> {
    if (user.status !== 'active') return null;
    const activeTenantIds = user.memberships
      .filter((membership) => membership.status === 'active')
      .map((membership) => membership.tenantId);

    const matches: TenantId[] = [];
    for (const tenantId of activeTenantIds) {
      const found = await withTenantTransaction(this.pool, tenantId, async (client) => {
        const result = await client.query<{ tenant_id: string }>(`
          SELECT tenant_id::text
          FROM app.project_tenant_registry
          WHERE tenant_id = $1::uuid AND project_id = $2::uuid
          LIMIT 1
        `, [tenantId, projectId]);
        return result.rows[0]?.tenant_id ?? null;
      });
      if (found) matches.push(found);
      if (matches.length > 1) return null;
    }

    // Mesmo administradores globais precisam de membership explícita para resolver
    // tenant nesta fase; não existe lookup privilegiado que contorne FORCE RLS.
    return matches.length === 1 ? matches[0]! : null;
  }
}
