import type { QueryablePool } from '../../db/postgres';
import type {
  IntelligenceJobRecord, IntelligenceFindingRecord,
  CreateIntelligenceJobParams, CreateIntelligenceFindingParams,
} from './types';

function mapJob(row: any): IntelligenceJobRecord {
  return {
    id: row.id, tenant_id: row.tenant_id, job_type: row.job_type, status: row.status,
    competitor_id: row.competitor_id, project_id: row.project_id,
    input_payload: typeof row.input_payload === 'string' ? JSON.parse(row.input_payload) : (row.input_payload || {}),
    output_payload: typeof row.output_payload === 'string' ? JSON.parse(row.output_payload) : (row.output_payload || {}),
    attempts: parseInt(row.attempts, 10) || 0, max_attempts: parseInt(row.max_attempts, 10) || 3, last_error: row.last_error,
    scheduled_for: typeof row.scheduled_for === 'string' ? row.scheduled_for : row.scheduled_for.toISOString(),
    started_at: row.started_at ? (typeof row.started_at === 'string' ? row.started_at : row.started_at.toISOString()) : null,
    completed_at: row.completed_at ? (typeof row.completed_at === 'string' ? row.completed_at : row.completed_at.toISOString()) : null,
    created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : row.updated_at.toISOString(),
  };
}

function mapFinding(row: any): IntelligenceFindingRecord {
  return {
    id: row.id, tenant_id: row.tenant_id, job_id: row.job_id, competitor_id: row.competitor_id,
    finding_type: row.finding_type, title: row.title, description: row.description,
    severity: row.severity, confidence_score: row.confidence_score ? parseFloat(row.confidence_score) : null,
    source_url: row.source_url, source_name: row.source_name, recommended_action: row.recommended_action,
    detected_at: typeof row.detected_at === 'string' ? row.detected_at : row.detected_at.toISOString(),
    created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : row.updated_at.toISOString(),
  };
}

export class PostgresIntelligenceJobsRepository {
  constructor(private readonly pool: QueryablePool) {}

  async createJob(params: CreateIntelligenceJobParams): Promise<IntelligenceJobRecord> {
    const result = await this.pool.query(
      `INSERT INTO app.intelligence_jobs (tenant_id, job_type, competitor_id, project_id, input_payload, scheduled_for, max_attempts, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, COALESCE($6, NOW()), COALESCE($7, 3), NOW())
       RETURNING *`,
      [params.tenant_id, params.job_type, params.competitor_id ?? null, params.project_id ?? null,
       JSON.stringify(params.input_payload || {}), params.scheduled_for ?? null, params.max_attempts ?? 3]
    );
    return mapJob(result.rows[0]);
  }

  async findPendingJobs(limit: number = 10): Promise<IntelligenceJobRecord[]> {
    const result = await this.pool.query(
      `SELECT * FROM app.intelligence_jobs WHERE status = 'pending' AND scheduled_for <= NOW() ORDER BY scheduled_for ASC LIMIT $1`,
      [limit]
    );
    return result.rows.map(mapJob);
  }

  async findJobById(tenantId: string, id: string): Promise<IntelligenceJobRecord | null> {
    const result = await this.pool.query(`SELECT * FROM app.intelligence_jobs WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    const row = result.rows[0];
    return row ? mapJob(row) : null;
  }

  async markJobProcessing(id: string): Promise<void> {
    await this.pool.query(`UPDATE app.intelligence_jobs SET status = 'processing', started_at = NOW(), updated_at = NOW() WHERE id = $1`, [id]);
  }

  async markJobCompleted(id: string, outputPayload: Record<string, any>): Promise<void> {
    await this.pool.query(`UPDATE app.intelligence_jobs SET status = 'completed', output_payload = $2::jsonb, completed_at = NOW(), updated_at = NOW() WHERE id = $1`, [id, JSON.stringify(outputPayload)]);
  }

  async markJobFailed(id: string, error: string): Promise<void> {
    await this.pool.query(`UPDATE app.intelligence_jobs SET status = 'failed', last_error = $2, completed_at = NOW(), updated_at = NOW() WHERE id = $1`, [id, error]);
  }

  async incrementJobAttempts(id: string): Promise<number> {
    const result = await this.pool.query(`UPDATE app.intelligence_jobs SET attempts = attempts + 1, updated_at = NOW() WHERE id = $1 RETURNING attempts`, [id]);
    return result.rows[0]?.attempts || 0;
  }

  async listJobsByTenant(tenantId: string, limit: number = 50): Promise<IntelligenceJobRecord[]> {
    const result = await this.pool.query(`SELECT * FROM app.intelligence_jobs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2`, [tenantId, limit]);
    return result.rows.map(mapJob);
  }

  async listFindingsByTenant(tenantId: string, limit: number = 50): Promise<IntelligenceFindingRecord[]> {
    const result = await this.pool.query(`SELECT * FROM app.intelligence_findings WHERE tenant_id = $1 ORDER BY detected_at DESC LIMIT $2`, [tenantId, limit]);
    return result.rows.map(mapFinding);
  }

  async createFinding(params: CreateIntelligenceFindingParams): Promise<IntelligenceFindingRecord> {
    const result = await this.pool.query(
      `INSERT INTO app.intelligence_findings (tenant_id, job_id, competitor_id, finding_type, title, description, severity, confidence_score, source_url, source_name, recommended_action, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING *`,
      [params.tenant_id, params.job_id ?? null, params.competitor_id ?? null, params.finding_type, params.title,
       params.description ?? null, params.severity ?? 'medium', params.confidence_score ?? null,
       params.source_url ?? null, params.source_name ?? null, params.recommended_action ?? null]
    );
    return mapFinding(result.rows[0]);
  }
}
