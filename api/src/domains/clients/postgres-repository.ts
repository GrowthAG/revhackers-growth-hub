import type { QueryResultRow } from 'pg';
import type { TenantId } from '../../contracts/tenant';
import { withTenantTransaction, type QueryablePool } from '../../db/postgres';
import type { ClientRecord, CreateClientInput, UpdateClientInput } from './contracts';
import type { ClientRepository } from './repository';

interface ClientRow extends QueryResultRow {
  id: string;
  name: string;
  email: string;
  trade_name: string | null;
  company: string | null;
  phone: string | null;
  cnpj: string | null;
  cep: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  logo_url: string | null;
  website: string | null;
  linkedin_url: string | null;
  city: string | null;
  state: string | null;
  country: string;
  segment: string | null;
  company_size: string | null;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
}

function iso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid timestamp returned by database.');
  return date.toISOString();
}

function mapRow(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    tradeName: row.trade_name,
    company: row.company,
    phone: row.phone,
    cnpj: row.cnpj,
    cep: row.cep,
    address: row.address,
    number: row.number,
    complement: row.complement,
    neighborhood: row.neighborhood,
    logoUrl: row.logo_url,
    website: row.website,
    linkedinUrl: row.linkedin_url,
    city: row.city,
    state: row.state,
    country: row.country,
    segment: row.segment,
    companySize: row.company_size,
    status: (row.status ?? 'onboarding') as ClientRecord['status'],
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

const SELECT_COLUMNS = `
  id, name, email, trade_name, company, phone, cnpj, cep, address, number,
  complement, neighborhood, logo_url, website, linkedin_url,
  city, state, country, segment, company_size, status, created_at, updated_at
`;

export class PostgresClientRepository implements ClientRepository {
  constructor(private readonly pool: QueryablePool) {}

  async list(tenantId: TenantId): Promise<ClientRecord[]> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<ClientRow>(
        `SELECT ${SELECT_COLUMNS} FROM app.clients ORDER BY created_at DESC`
      );
      return result.rows.map(mapRow);
    });
  }

  async findById(tenantId: TenantId, id: string): Promise<ClientRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<ClientRow>(
        `SELECT ${SELECT_COLUMNS} FROM app.clients WHERE id = $1::uuid LIMIT 1`,
        [id]
      );
      const row = result.rows[0];
      return row ? mapRow(row) : null;
    });
  }

  async create(tenantId: TenantId, input: CreateClientInput): Promise<ClientRecord> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<ClientRow>(
        `INSERT INTO app.clients (
          name, email, trade_name, company, phone, cnpj, cep, address, number,
          complement, neighborhood, logo_url, website, linkedin_url,
          city, state, country, segment, company_size, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        RETURNING ${SELECT_COLUMNS}`,
        [
          input.name.trim(),
          input.email.trim().toLowerCase(),
          input.tradeName?.trim() ?? null,
          input.company?.trim() ?? null,
          input.phone?.trim() ?? null,
          input.cnpj?.trim() ?? null,
          input.cep?.trim() ?? null,
          input.address?.trim() ?? null,
          input.number?.trim() ?? null,
          input.complement?.trim() ?? null,
          input.neighborhood?.trim() ?? null,
          input.logoUrl?.trim() ?? null,
          input.website?.trim() ?? null,
          input.linkedinUrl?.trim() ?? null,
          input.city?.trim() ?? null,
          input.state?.trim() ?? null,
          input.country?.trim() ?? 'Brasil',
          input.segment?.trim() ?? null,
          input.companySize?.trim() ?? null,
          input.status ?? 'onboarding',
        ]
      );
      const row = result.rows[0];
      if (!row) throw new Error('Client creation returned no row.');
      return mapRow(row);
    });
  }

  async update(tenantId: TenantId, id: string, input: UpdateClientInput): Promise<ClientRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const existing = await client.query<ClientRow>(
        `SELECT ${SELECT_COLUMNS} FROM app.clients WHERE id = $1::uuid LIMIT 1`,
        [id]
      );
      if (!existing.rows[0]) return null;

      const current = existing.rows[0];
      const result = await client.query<ClientRow>(
        `UPDATE app.clients SET
          name = $2,
          email = $3,
          trade_name = $4,
          company = $5,
          phone = $6,
          cnpj = $7,
          cep = $8,
          address = $9,
          number = $10,
          complement = $11,
          neighborhood = $12,
          logo_url = $13,
          website = $14,
          linkedin_url = $15,
          city = $16,
          state = $17,
          country = $18,
          segment = $19,
          company_size = $20,
          status = $21
        WHERE id = $1::uuid
        RETURNING ${SELECT_COLUMNS}`,
        [
          id,
          input.name !== undefined ? input.name.trim() : current.name,
          input.email !== undefined ? input.email.trim().toLowerCase() : current.email,
          input.tradeName !== undefined ? (input.tradeName?.trim() ?? null) : current.trade_name,
          input.company !== undefined ? (input.company?.trim() ?? null) : current.company,
          input.phone !== undefined ? (input.phone?.trim() ?? null) : current.phone,
          input.cnpj !== undefined ? (input.cnpj?.trim() ?? null) : current.cnpj,
          input.cep !== undefined ? (input.cep?.trim() ?? null) : current.cep,
          input.address !== undefined ? (input.address?.trim() ?? null) : current.address,
          input.number !== undefined ? (input.number?.trim() ?? null) : current.number,
          input.complement !== undefined ? (input.complement?.trim() ?? null) : current.complement,
          input.neighborhood !== undefined ? (input.neighborhood?.trim() ?? null) : current.neighborhood,
          input.logoUrl !== undefined ? (input.logoUrl?.trim() ?? null) : current.logo_url,
          input.website !== undefined ? (input.website?.trim() ?? null) : current.website,
          input.linkedinUrl !== undefined ? (input.linkedinUrl?.trim() ?? null) : current.linkedin_url,
          input.city !== undefined ? (input.city?.trim() ?? null) : current.city,
          input.state !== undefined ? (input.state?.trim() ?? null) : current.state,
          input.country !== undefined ? (input.country?.trim() ?? 'Brasil') : current.country,
          input.segment !== undefined ? (input.segment?.trim() ?? null) : current.segment,
          input.companySize !== undefined ? (input.companySize?.trim() ?? null) : current.company_size,
          input.status !== undefined ? input.status : current.status,
        ]
      );
      const row = result.rows[0];
      return row ? mapRow(row) : null;
    });
  }

  async delete(tenantId: TenantId, id: string): Promise<boolean> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query(
        `DELETE FROM app.clients WHERE id = $1::uuid`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    });
  }
}
