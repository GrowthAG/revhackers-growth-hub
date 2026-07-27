import type { IdentityRepository } from '../identity/postgres-identity-repository';
import type { TokenVerifier } from '../identity/verifier';
import type { InternalUser } from '../contracts/tenant';

export const DEFAULT_STAGING_TENANT_ID = '11111111-1111-4111-8111-111111111111';

export interface AuthContext {
  user: InternalUser;
  tenantId: string;
}

export interface AuthMiddlewareDependencies {
  verifier: TokenVerifier;
  identities: IdentityRepository;
}

export class AuthMiddleware {
  constructor(private readonly deps: AuthMiddlewareDependencies) {}

  async authenticate(request: Request): Promise<AuthContext | Response> {
    const authHeader = request.headers.get('authorization');
    const match = authHeader?.match(/^Bearer ([^\s]+)$/);
    if (!match) {
      return this.json(401, { error: { code: 'unauthenticated', message: 'Token de autenticação ausente.' } });
    }
    const token = match[1]!;

    let user: InternalUser;
    try {
      const verified = await this.deps.verifier.verify(token);
      user = await this.deps.identities.findOrCreateUser({ issuer: verified.issuer, subject: verified.subject });
    } catch {
      return this.json(401, { error: { code: 'unauthenticated', message: 'Token inválido ou expirado.' } });
    }

    if (user.status !== 'active') {
      return this.json(403, { error: { code: 'forbidden', message: 'Usuário inativo ou desabilitado.' } });
    }

    const tenantId = user.memberships[0]?.tenantId ?? DEFAULT_STAGING_TENANT_ID;
    return { user, tenantId };
  }

  private json(status: number, value: unknown): Response {
    return new Response(JSON.stringify(value), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}
