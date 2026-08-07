import type { QueryablePool } from '../../db/postgres';
import type { OpportunityRecord, CreateOpportunityParams, FonteDataEnrichmentPayload } from './types';

export class PostgresOpportunityRepository {
  constructor(private readonly pool: QueryablePool) {}

  async create(params: CreateOpportunityParams): Promise<OpportunityRecord> {
    const type = params.type || 'consulting';
    const leadSource = params.lead_source || 'diagnostico_publico';
    const pipelineStage = params.pipeline_stage || 'diagnostic_done';
    const cnpj = params.cnpj ? params.cnpj.replace(/\D/g, '') : null;

    const result = await this.pool.query(
      `INSERT INTO app.opportunities (
         client_name, client_email, client_company, cnpj, type, lead_source,
         pipeline_stage, diagnostico_id, opportunity_data, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [
        params.client_name,
        params.client_email,
        params.client_company,
        cnpj,
        type,
        leadSource,
        pipelineStage,
        params.diagnostico_id,
        JSON.stringify(params.opportunity_data ?? {}),
      ]
    );

    const row = result.rows[0];
    if (!row) throw new Error('Opportunity creation returned no row.');

    return this.toRecord(row);
  }

  async findByEmail(email: string): Promise<OpportunityRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM app.opportunities WHERE LOWER(client_email) = LOWER($1) AND pipeline_stage != 'lost' LIMIT 1`,
      [email.toLowerCase()]
    );
    const row = result.rows[0];
    if (!row) return null;
    return this.toRecord(row);
  }

  async findByCnpj(cnpj: string): Promise<OpportunityRecord | null> {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    const result = await this.pool.query(
      `SELECT * FROM app.opportunities WHERE cnpj = $1 AND pipeline_stage != 'lost' ORDER BY updated_at DESC LIMIT 1`,
      [cleanCnpj]
    );
    const row = result.rows[0];
    if (!row) return null;
    return this.toRecord(row);
  }

  async updateEnrichment(id: string, enrichmentData: FonteDataEnrichmentPayload): Promise<void> {
    await this.pool.query(
      `UPDATE app.opportunities
       SET opportunity_data = jsonb_set(
         COALESCE(opportunity_data, '{}'::jsonb),
         '{enrichment}',
         $2::jsonb
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [id, JSON.stringify(enrichmentData)]
    );
  }

  private toRecord(row: Record<string, unknown>): OpportunityRecord {
    return {
      id: row.id as string,
      client_name: (row.client_name as string) ?? '',
      client_email: (row.client_email as string) ?? '',
      client_company: (row.client_company as string) ?? '',
      cnpj: (row.cnpj as string) ?? '',
      type: (row.type as string) ?? 'consulting',
      lead_source: (row.lead_source as string) ?? '',
      pipeline_stage: (row.pipeline_stage as string) ?? 'lead_inbound',
      diagnostico_id: (row.diagnostico_id as string) ?? null,
      opportunity_data: (row.opportunity_data as Record<string, unknown>) ?? {},
      created_at: (row.created_at as string) ?? new Date().toISOString(),
      updated_at: (row.updated_at as string) ?? new Date().toISOString(),
    };
  }
}