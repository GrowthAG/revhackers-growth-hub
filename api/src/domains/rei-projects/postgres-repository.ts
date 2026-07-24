import type { QueryResultRow } from 'pg';
import type { TenantId } from '../../contracts/tenant';
import { withTenantTransaction, type QueryablePool } from '../../db/postgres';
import type { CreateReiProjectInput, ReiProjectRecord, ReiProjectStatus, ReiProjectType, ReiProjectTier, ReiQuarter, UpdateReiProjectInput } from './contracts';
import type { ReiProjectRepository } from './repository';

interface ReiProjectRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  client_id: string | null;
  client_name: string;
  client_email: string;
  client_company: string | null;
  analyst_email: string;
  last_rei_date: Date | string;
  next_rei_date: Date | string;
  quarter: string;
  year: number;
  status: string;
  type: string;
  tier: string;
  duration_days: number;
  scheduling_completed: boolean;
  technical_evidences: unknown;
  clickup_space_id: string | null;
  clickup_folder_id: string | null;
  clickup_doc_id: string | null;
  clickup_sprint_folder_id: string | null;
  clickup_provisioned_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function iso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid timestamp returned by database.');
  return date.toISOString();
}

function isoOrNull(value: Date | string | null): string | null {
  if (!value) return null;
  return iso(value);
}

function mapRow(row: ReiProjectRow): ReiProjectRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientCompany: row.client_company,
    analystEmail: row.analyst_email,
    lastReiDate: iso(row.last_rei_date),
    nextReiDate: iso(row.next_rei_date),
    quarter: row.quarter as ReiQuarter,
    year: row.year,
    status: row.status as ReiProjectStatus,
    type: row.type as ReiProjectType,
    tier: row.tier as ReiProjectTier,
    durationDays: row.duration_days,
    schedulingCompleted: row.scheduling_completed,
    technicalEvidences: Array.isArray(row.technical_evidences) ? row.technical_evidences : [],
    clickupSpaceId: row.clickup_space_id,
    clickupFolderId: row.clickup_folder_id,
    clickupDocId: row.clickup_doc_id,
    clickupSprintFolderId: row.clickup_sprint_folder_id,
    clickupProvisionedAt: isoOrNull(row.clickup_provisioned_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

const SELECT_COLUMNS = `
  id, tenant_id, client_id, client_name, client_email, client_company,
  analyst_email, last_rei_date, next_rei_date, quarter, year, status,
  type, tier, duration_days, scheduling_completed, technical_evidences,
  clickup_space_id, clickup_folder_id, clickup_doc_id, clickup_sprint_folder_id,
  clickup_provisioned_at, created_at, updated_at
`;

export class PostgresReiProjectRepository implements ReiProjectRepository {
  constructor(private readonly pool: QueryablePool) {}

  async list(tenantId: TenantId): Promise<ReiProjectRecord[]> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<ReiProjectRow>(
        `SELECT ${SELECT_COLUMNS} FROM app.rei_projects WHERE deleted_at IS NULL ORDER BY created_at DESC`
      );
      return result.rows.map(mapRow);
    });
  }

  async findById(tenantId: TenantId, id: string): Promise<ReiProjectRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<ReiProjectRow>(
        `SELECT ${SELECT_COLUMNS} FROM app.rei_projects WHERE id = $1::uuid AND deleted_at IS NULL LIMIT 1`,
        [id]
      );
      const row = result.rows[0];
      return row ? mapRow(row) : null;
    });
  }

  async create(tenantId: TenantId, input: CreateReiProjectInput): Promise<ReiProjectRecord> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query<ReiProjectRow>(
        `INSERT INTO app.rei_projects (
          tenant_id, client_id, client_name, client_email, client_company,
          analyst_email, last_rei_date, next_rei_date, quarter, year,
          status, type, tier, duration_days, scheduling_completed, technical_evidences
        ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb)
        RETURNING ${SELECT_COLUMNS}`,
        [
          tenantId,
          input.clientId ?? null,
          input.clientName.trim(),
          input.clientEmail.trim().toLowerCase(),
          input.clientCompany?.trim() ?? null,
          input.analystEmail.trim().toLowerCase(),
          input.lastReiDate ? new Date(input.lastReiDate) : new Date(),
          new Date(input.nextReiDate),
          input.quarter,
          input.year,
          input.status ?? 'active',
          input.type ?? 'consulting',
          input.tier ?? 'paid',
          input.durationDays ?? 90,
          input.schedulingCompleted ?? false,
          JSON.stringify(input.technicalEvidences ?? []),
        ]
      );
      const row = result.rows[0];
      if (!row) throw new Error('REI project creation returned no row.');
      return mapRow(row);
    });
  }

  async update(tenantId: TenantId, id: string, input: UpdateReiProjectInput): Promise<ReiProjectRecord | null> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const existing = await client.query<ReiProjectRow>(
        `SELECT ${SELECT_COLUMNS} FROM app.rei_projects WHERE id = $1::uuid AND deleted_at IS NULL LIMIT 1`,
        [id]
      );
      if (!existing.rows[0]) return null;

      const current = existing.rows[0];
      const result = await client.query<ReiProjectRow>(
        `UPDATE app.rei_projects SET
          client_name = $2,
          client_email = $3,
          client_company = $4,
          analyst_email = $5,
          last_rei_date = $6,
          next_rei_date = $7,
          quarter = $8,
          year = $9,
          status = $10,
          type = $11,
          tier = $12,
          duration_days = $13,
          scheduling_completed = $14,
          technical_evidences = $15::jsonb
        WHERE id = $1::uuid
        RETURNING ${SELECT_COLUMNS}`,
        [
          id,
          input.clientName !== undefined ? input.clientName.trim() : current.client_name,
          input.clientEmail !== undefined ? input.clientEmail.trim().toLowerCase() : current.client_email,
          input.clientCompany !== undefined ? (input.clientCompany?.trim() ?? null) : current.client_company,
          input.analystEmail !== undefined ? input.analystEmail.trim().toLowerCase() : current.analyst_email,
          input.lastReiDate !== undefined ? new Date(input.lastReiDate) : current.last_rei_date,
          input.nextReiDate !== undefined ? new Date(input.nextReiDate) : current.next_rei_date,
          input.quarter !== undefined ? input.quarter : current.quarter,
          input.year !== undefined ? input.year : current.year,
          input.status !== undefined ? input.status : current.status,
          input.type !== undefined ? input.type : current.type,
          input.tier !== undefined ? input.tier : current.tier,
          input.durationDays !== undefined ? input.durationDays : current.duration_days,
          input.schedulingCompleted !== undefined ? input.schedulingCompleted : current.scheduling_completed,
          input.technicalEvidences !== undefined
            ? JSON.stringify(input.technicalEvidences)
            : JSON.stringify(current.technical_evidences),
        ]
      );
      const row = result.rows[0];
      return row ? mapRow(row) : null;
    });
  }

  async delete(tenantId: TenantId, id: string): Promise<boolean> {
    return withTenantTransaction(this.pool, tenantId, async (client) => {
      const result = await client.query(
        `UPDATE app.rei_projects SET deleted_at = now() WHERE id = $1::uuid AND deleted_at IS NULL`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    });
  }
}
