import type { QueryablePool } from '../../db/postgres';
import type {
  CompetitorRecord,
  CreateCompetitorParams,
  UpdateCompetitorParams,
  CompetitorIntelligenceRecord,
  UpsertIntelligenceParams,
  CompetitorComparisonRecord,
  CreateCompetitorComparisonParams,
  MarketSignalRecord,
  CreateMarketSignalParams,
  CompetitorWithIntelligence,
} from './types';

export class PostgresIntelligenceRepository {
  constructor(private readonly pool: QueryablePool) {}

  // ─── 1. COMPETITORS ─────────────────────────────────────────────────────────

  async createCompetitor(params: CreateCompetitorParams): Promise<CompetitorRecord> {
    const cleanCnpj = params.cnpj ? params.cnpj.replace(/\D/g, '') : null;
    const result = await this.pool.query(
      `INSERT INTO app.competitors (
        tenant_id, project_id, name, cnpj, website, segment, cnae_primary, notes, is_priority, added_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        params.tenant_id,
        params.project_id || null,
        params.name,
        cleanCnpj,
        params.website || null,
        params.segment || null,
        params.cnae_primary || null,
        params.notes || null,
        params.is_priority ?? false,
        params.added_by || 'system',
      ]
    );

    return this.mapCompetitor(result.rows[0]);
  }

  async findCompetitorById(tenantId: string, id: string): Promise<CompetitorRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM app.competitors WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
      [tenantId, id]
    );
    const row = result.rows[0];
    return row ? this.mapCompetitor(row) : null;
  }

  async listCompetitorsByProject(tenantId: string, projectId?: string): Promise<CompetitorRecord[]> {
    let query = `SELECT * FROM app.competitors WHERE tenant_id = $1 AND is_active = true`;
    const params: unknown[] = [tenantId];

    if (projectId) {
      query += ` AND (project_id = $2 OR project_id IS NULL)`;
      params.push(projectId);
    }

    query += ` ORDER BY is_priority DESC, name ASC`;
    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapCompetitor(row));
  }

  async updateCompetitor(tenantId: string, id: string, params: UpdateCompetitorParams): Promise<CompetitorRecord | null> {
    const cleanCnpj = params.cnpj !== undefined ? (params.cnpj ? params.cnpj.replace(/\D/g, '') : null) : undefined;
    
    const fields: string[] = [];
    const values: unknown[] = [tenantId, id];
    let idx = 3;

    if (params.name !== undefined) { fields.push(`name = $${idx++}`); values.push(params.name); }
    if (cleanCnpj !== undefined) { fields.push(`cnpj = $${idx++}`); values.push(cleanCnpj); }
    if (params.website !== undefined) { fields.push(`website = $${idx++}`); values.push(params.website); }
    if (params.segment !== undefined) { fields.push(`segment = $${idx++}`); values.push(params.segment); }
    if (params.cnae_primary !== undefined) { fields.push(`cnae_primary = $${idx++}`); values.push(params.cnae_primary); }
    if (params.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(params.notes); }
    if (params.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(params.is_active); }
    if (params.is_priority !== undefined) { fields.push(`is_priority = $${idx++}`); values.push(params.is_priority); }

    if (fields.length === 0) return this.findCompetitorById(tenantId, id);

    fields.push(`updated_at = NOW()`);

    const result = await this.pool.query(
      `UPDATE app.competitors SET ${fields.join(', ')} WHERE tenant_id = $1 AND id = $2 RETURNING *`,
      values
    );

    const row = result.rows[0];
    return row ? this.mapCompetitor(row) : null;
  }

  async deleteCompetitor(tenantId: string, id: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM app.competitors WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // ─── 2. COMPETITOR INTELLIGENCE ─────────────────────────────────────────────

  async upsertIntelligence(params: UpsertIntelligenceParams): Promise<CompetitorIntelligenceRecord> {
    const cleanCnpj = params.cnpj ? params.cnpj.replace(/\D/g, '') : null;
    const result = await this.pool.query(
      `INSERT INTO app.competitor_intelligence (
        tenant_id, competitor_id, razao_social, nome_fantasia, cnpj, capital_social_brl,
        porte, natureza_juridica, cnae_primary, cnae_secondary, uf, municipio, data_abertura,
        situacao_receita, qsa, spi_score, spi_category, ofs_risk_level, raw_payload,
        last_enriched_at, enrichment_status, enrichment_error, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), $20, $21, NOW())
      ON CONFLICT (competitor_id) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        nome_fantasia = EXCLUDED.nome_fantasia,
        cnpj = EXCLUDED.cnpj,
        capital_social_brl = EXCLUDED.capital_social_brl,
        porte = EXCLUDED.porte,
        natureza_juridica = EXCLUDED.natureza_juridica,
        cnae_primary = EXCLUDED.cnae_primary,
        cnae_secondary = EXCLUDED.cnae_secondary,
        uf = EXCLUDED.uf,
        municipio = EXCLUDED.municipio,
        data_abertura = EXCLUDED.data_abertura,
        situacao_receita = EXCLUDED.situacao_receita,
        qsa = EXCLUDED.qsa,
        spi_score = EXCLUDED.spi_score,
        spi_category = EXCLUDED.spi_category,
        ofs_risk_level = EXCLUDED.ofs_risk_level,
        raw_payload = EXCLUDED.raw_payload,
        last_enriched_at = NOW(),
        enrichment_status = EXCLUDED.enrichment_status,
        enrichment_error = EXCLUDED.enrichment_error,
        updated_at = NOW()
      RETURNING *`,
      [
        params.tenant_id,
        params.competitor_id,
        params.razao_social || null,
        params.nome_fantasia || null,
        cleanCnpj,
        params.capital_social_brl || null,
        params.porte || null,
        params.natureza_juridica || null,
        params.cnae_primary || null,
        JSON.stringify(params.cnae_secondary || []),
        params.uf || null,
        params.municipio || null,
        params.data_abertura || null,
        params.situacao_receita || null,
        JSON.stringify(params.qsa || []),
        params.spi_score || null,
        params.spi_category || null,
        params.ofs_risk_level || null,
        JSON.stringify(params.raw_payload || {}),
        params.enrichment_status || 'enriched',
        params.enrichment_error || null,
      ]
    );

    return this.mapIntelligence(result.rows[0]);
  }

  async findIntelligenceByCompetitorId(tenantId: string, competitorId: string): Promise<CompetitorIntelligenceRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM app.competitor_intelligence WHERE tenant_id = $1 AND competitor_id = $2 LIMIT 1`,
      [tenantId, competitorId]
    );
    const row = result.rows[0];
    return row ? this.mapIntelligence(row) : null;
  }

  async markEnrichmentFailed(tenantId: string, competitorId: string, error: string): Promise<void> {
    await this.pool.query(
      `UPDATE app.competitor_intelligence 
       SET enrichment_status = 'failed', enrichment_error = $3, updated_at = NOW() 
       WHERE tenant_id = $1 AND competitor_id = $2`,
      [tenantId, competitorId, error]
    );
  }

  // ─── 3. COMPARISONS ──────────────────────────────────────────────────────────

  async upsertComparison(params: CreateCompetitorComparisonParams): Promise<CompetitorComparisonRecord> {
    const result = await this.pool.query(
      `INSERT INTO app.competitor_comparisons (
        tenant_id, project_id, competitor_id, pricing_score, features_score, positioning_score,
        pricing_notes, features_notes, positioning_notes, ai_summary, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        params.tenant_id,
        params.project_id || null,
        params.competitor_id,
        params.pricing_score ?? null,
        params.features_score ?? null,
        params.positioning_score ?? null,
        params.pricing_notes || null,
        params.features_notes || null,
        params.positioning_notes || null,
        params.ai_summary || null,
      ]
    );

    return this.mapComparison(result.rows[0]);
  }

  async listComparisonsByProject(tenantId: string, projectId?: string): Promise<CompetitorComparisonRecord[]> {
    let query = `SELECT * FROM app.competitor_comparisons WHERE tenant_id = $1`;
    const params: unknown[] = [tenantId];

    if (projectId) {
      query += ` AND (project_id = $2 OR project_id IS NULL)`;
      params.push(projectId);
    }

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapComparison(row));
  }

  // ─── 4. MARKET SIGNALS ───────────────────────────────────────────────────────

  async createSignal(params: CreateMarketSignalParams): Promise<MarketSignalRecord> {
    const result = await this.pool.query(
      `INSERT INTO app.market_signals (
        tenant_id, competitor_id, signal_type, title, summary, source_url, source_name, sentiment, impact_level, detected_at, detected_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        params.tenant_id,
        params.competitor_id || null,
        params.signal_type,
        params.title,
        params.summary,
        params.source_url || null,
        params.source_name || null,
        params.sentiment || 'neutral',
        params.impact_level || 'medium',
        params.detected_at || new Date().toISOString(),
        params.detected_by || 'system',
      ]
    );

    return this.mapSignal(result.rows[0]);
  }

  async listSignalsByCompetitorId(tenantId: string, competitorId: string, limit: number = 10): Promise<MarketSignalRecord[]> {
    const result = await this.pool.query(
      `SELECT * FROM app.market_signals WHERE tenant_id = $1 AND competitor_id = $2 ORDER BY detected_at DESC LIMIT $3`,
      [tenantId, competitorId, limit]
    );
    return result.rows.map((row) => this.mapSignal(row));
  }

  async listSignalsByTenant(tenantId: string, limit: number = 20): Promise<MarketSignalRecord[]> {
    const result = await this.pool.query(
      `SELECT * FROM app.market_signals WHERE tenant_id = $1 ORDER BY detected_at DESC LIMIT $2`,
      [tenantId, limit]
    );
    return result.rows.map((row) => this.mapSignal(row));
  }

  // ─── 5. COMBINED DASHBOARD AGGREGATION ─────────────────────────────────────

  async getCompetitorWithIntelligence(tenantId: string, competitorId: string): Promise<CompetitorWithIntelligence | null> {
    const competitor = await this.findCompetitorById(tenantId, competitorId);
    if (!competitor) return null;

    const intelligence = await this.findIntelligenceByCompetitorId(tenantId, competitorId);
    const recent_signals = await this.listSignalsByCompetitorId(tenantId, competitorId, 5);
    const comparisons = await this.listComparisonsByProject(tenantId);
    const comparison = comparisons.find((c) => c.competitor_id === competitorId) || null;

    return {
      competitor,
      intelligence,
      recent_signals,
      comparison,
    };
  }

  async listCompetitorsFullByProject(tenantId: string, projectId?: string): Promise<CompetitorWithIntelligence[]> {
    const competitors = await this.listCompetitorsByProject(tenantId, projectId);
    const fullList: CompetitorWithIntelligence[] = [];

    for (const comp of competitors) {
      const full = await this.getCompetitorWithIntelligence(tenantId, comp.id);
      if (full) fullList.push(full);
    }

    return fullList;
  }

  // ─── PRIVATE MAPPERS ────────────────────────────────────────────────────────

  private mapCompetitor(row: any): CompetitorRecord {
    return {
      id: row.id,
      tenant_id: row.tenant_id,
      project_id: row.project_id,
      name: row.name,
      cnpj: row.cnpj,
      website: row.website,
      segment: row.segment,
      cnae_primary: row.cnae_primary,
      notes: row.notes,
      is_active: row.is_active,
      is_priority: row.is_priority,
      added_by: row.added_by,
      created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
      updated_at: typeof row.updated_at === 'string' ? row.updated_at : row.updated_at.toISOString(),
    };
  }

  private mapIntelligence(row: any): CompetitorIntelligenceRecord {
    const cnaeSec = typeof row.cnae_secondary === 'string' ? JSON.parse(row.cnae_secondary) : row.cnae_secondary;
    const qsa = typeof row.qsa === 'string' ? JSON.parse(row.qsa) : row.qsa;
    const raw = typeof row.raw_payload === 'string' ? JSON.parse(row.raw_payload) : row.raw_payload;

    return {
      id: row.id,
      tenant_id: row.tenant_id,
      competitor_id: row.competitor_id,
      razao_social: row.razao_social,
      nome_fantasia: row.nome_fantasia,
      cnpj: row.cnpj,
      capital_social_brl: row.capital_social_brl ? parseFloat(row.capital_social_brl) : null,
      porte: row.porte,
      natureza_juridica: row.natureza_juridica,
      cnae_primary: row.cnae_primary,
      cnae_secondary: Array.isArray(cnaeSec) ? cnaeSec : [],
      uf: row.uf,
      municipio: row.municipio,
      data_abertura: row.data_abertura ? (typeof row.data_abertura === 'string' ? row.data_abertura.substring(0, 10) : row.data_abertura) : null,
      situacao_receita: row.situacao_receita,
      qsa: Array.isArray(qsa) ? qsa : [],
      spi_score: row.spi_score !== null && row.spi_score !== undefined ? parseInt(row.spi_score, 10) : null,
      spi_category: row.spi_category,
      ofs_risk_level: row.ofs_risk_level,
      raw_payload: raw || {},
      last_enriched_at: row.last_enriched_at ? (typeof row.last_enriched_at === 'string' ? row.last_enriched_at : row.last_enriched_at.toISOString()) : null,
      enrichment_status: row.enrichment_status,
      enrichment_error: row.enrichment_error,
      created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
      updated_at: typeof row.updated_at === 'string' ? row.updated_at : row.updated_at.toISOString(),
    };
  }

  private mapComparison(row: any): CompetitorComparisonRecord {
    return {
      id: row.id,
      tenant_id: row.tenant_id,
      project_id: row.project_id,
      competitor_id: row.competitor_id,
      pricing_score: row.pricing_score !== null && row.pricing_score !== undefined ? parseInt(row.pricing_score, 10) : null,
      features_score: row.features_score !== null && row.features_score !== undefined ? parseInt(row.features_score, 10) : null,
      positioning_score: row.positioning_score !== null && row.positioning_score !== undefined ? parseInt(row.positioning_score, 10) : null,
      pricing_notes: row.pricing_notes,
      features_notes: row.features_notes,
      positioning_notes: row.positioning_notes,
      ai_summary: row.ai_summary,
      created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
      updated_at: typeof row.updated_at === 'string' ? row.updated_at : row.updated_at.toISOString(),
    };
  }

  private mapSignal(row: any): MarketSignalRecord {
    return {
      id: row.id,
      tenant_id: row.tenant_id,
      competitor_id: row.competitor_id,
      signal_type: row.signal_type,
      title: row.title,
      summary: row.summary,
      source_url: row.source_url,
      source_name: row.source_name,
      sentiment: row.sentiment,
      impact_level: row.impact_level,
      detected_at: typeof row.detected_at === 'string' ? row.detected_at : row.detected_at.toISOString(),
      created_at: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
      updated_at: typeof row.updated_at === 'string' ? row.updated_at : row.updated_at.toISOString(),
    };
  }
}
