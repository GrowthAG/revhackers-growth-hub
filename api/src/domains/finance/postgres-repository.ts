import type { QueryablePool } from '../../db/postgres';
import type {
  BankStatementRecord,
  CreateBankStatementParams,
  LedgerEntryRecord,
  CreateLedgerEntryParams,
  ReconciliationRecord,
  MatchRule,
  DREPeriodStatement,
  DREPerEntityStatement,
  FinancialEntityRecord,
  EntityKind,
  LedgerCategory,
} from './types';

export class PostgresFinanceRepository {
  constructor(private readonly pool: QueryablePool) {}

  // ---------------------- Entities ----------------------

  async listEntities(kind?: EntityKind): Promise<FinancialEntityRecord[]> {
    const query = kind
      ? `SELECT * FROM financial_entities WHERE kind = $1 AND is_active = true ORDER BY name ASC`
      : `SELECT * FROM financial_entities WHERE is_active = true ORDER BY name ASC`;
    const params = kind ? [kind] : [];
    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this.mapEntityRow(row));
  }

  async findEntityBySlug(slug: string): Promise<FinancialEntityRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM financial_entities WHERE slug = $1 LIMIT 1`,
      [slug],
    );
    return result.rows[0] ? this.mapEntityRow(result.rows[0]) : null;
  }

  async createEntity(params: {
    slug: string;
    name: string;
    legal_name?: string | null;
    cnpj?: string | null;
    kind: EntityKind;
    parent_id?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<FinancialEntityRecord> {
    const result = await this.pool.query(
      `INSERT INTO financial_entities (slug, name, legal_name, cnpj, kind, parent_id, metadata, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        params.slug,
        params.name,
        params.legal_name ?? null,
        params.cnpj ? params.cnpj.replace(/\D/g, '') : null,
        params.kind,
        params.parent_id ?? null,
        JSON.stringify(params.metadata ?? {}),
      ],
    );
    return this.mapEntityRow(result.rows[0]);
  }

  // ---------------------- Statements ----------------------

  async createStatement(params: CreateBankStatementParams): Promise<BankStatementRecord> {
    const cleanDoc = params.payer_document ? params.payer_document.replace(/\D/g, '') : null;

    // Resolve entity_id: explícito > herdado da bank_account > null
    let entityId: string | null = params.entity_id ?? null;
    if (!entityId && params.bank_account_id) {
      const accountResult = await this.pool.query(
        `SELECT entity_id FROM financial_bank_accounts WHERE id = $1 LIMIT 1`,
        [params.bank_account_id],
      );
      entityId = accountResult.rows[0]?.entity_id ?? null;
    }

    const result = await this.pool.query(
      `INSERT INTO financial_bank_statements (
        bank_account_id, transaction_date, amount, type, description,
        bank_transaction_id, payer_document, payer_name, source, entity_id, raw_payload, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *`,
      [
        params.bank_account_id || null,
        params.transaction_date,
        params.amount,
        params.type,
        params.description,
        params.bank_transaction_id || null,
        cleanDoc,
        params.payer_name || null,
        params.source || 'ofx_csv',
        entityId,
        JSON.stringify(params.raw_payload || {}),
      ],
    );

    return this.mapStatementRow(result.rows[0]);
  }

  async createLedgerEntry(params: CreateLedgerEntryParams): Promise<LedgerEntryRecord> {
    const result = await this.pool.query(
      `INSERT INTO financial_ledger_entries (
        category, cost_center, opportunity_id, rei_project_id, client_id,
        description, amount, competence_date, due_date, is_paid, paid_at, entity_id, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *`,
      [
        params.category,
        params.cost_center || 'general',
        params.opportunity_id || null,
        params.rei_project_id || null,
        params.client_id || null,
        params.description,
        params.amount,
        params.competence_date,
        params.due_date || null,
        params.is_paid || false,
        params.paid_at || null,
        params.entity_id || null,
      ]
    );

    return this.mapLedgerRow(result.rows[0]);
  }

  async findUnreconciledStatements(entityId?: string | null): Promise<BankStatementRecord[]> {
    const params: unknown[] = [];
    let where = `reconciliation_status IN ('PENDING', 'DIVERGENT')`;
    if (entityId) {
      params.push(entityId);
      where += ` AND entity_id = $${params.length}`;
    }
    const result = await this.pool.query(
      `SELECT * FROM financial_bank_statements WHERE ${where} ORDER BY transaction_date DESC, created_at DESC`,
      params,
    );
    return result.rows.map((row) => this.mapStatementRow(row));
  }

  async findOpenLedgerEntries(entityId?: string | null): Promise<LedgerEntryRecord[]> {
    const params: unknown[] = [];
    let where = `is_paid = false`;
    if (entityId) {
      params.push(entityId);
      where += ` AND entity_id = $${params.length}`;
    }
    const result = await this.pool.query(
      `SELECT * FROM financial_ledger_entries WHERE ${where} ORDER BY competence_date DESC`,
      params,
    );
    return result.rows.map((row) => this.mapLedgerRow(row));
  }

  async reconcileMatch(
    statementId: string,
    ledgerEntryId: string | null,
    opportunityId: string | null,
    matchScore: number,
    matchRule: MatchRule,
    reconciledBy: string = 'system',
    notes?: string
  ): Promise<ReconciliationRecord> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Check idempotency: if statement is already reconciled, return existing record
      const existing = await client.query(
        `SELECT * FROM financial_reconciliations WHERE statement_id = $1 LIMIT 1`,
        [statementId]
      );
      if (existing.rows.length > 0) {
        await client.query('COMMIT');
        return this.mapReconciliationRow(existing.rows[0]);
      }

      const isManual = matchRule === 'MANUAL';
      const status = isManual ? 'MANUALLY_MATCHED' : 'AUTO_MATCHED';

      const recResult = await client.query(
        `INSERT INTO financial_reconciliations (
          statement_id, ledger_entry_id, opportunity_id, match_score, match_rule, status, notes, reconciled_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [statementId, ledgerEntryId, opportunityId, matchScore, matchRule, status, notes || null, reconciledBy]
      );

      // Update statement status
      await client.query(
        `UPDATE financial_bank_statements 
         SET reconciliation_status = 'RECONCILED', updated_at = NOW() 
         WHERE id = $1`,
        [statementId]
      );

      // If linked to ledger entry, mark ledger entry as paid
      if (ledgerEntryId) {
        await client.query(
          `UPDATE financial_ledger_entries 
           SET is_paid = true, paid_at = NOW(), updated_at = NOW() 
           WHERE id = $1`,
          [ledgerEntryId]
        );
      }

      await client.query('COMMIT');
      return this.mapReconciliationRow(recResult.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getDREStatement(
    startDate: string,
    endDate: string,
    entityId?: string | null,
  ): Promise<DREPeriodStatement> {
    const params: unknown[] = [startDate, endDate];
    let entityFilter = '';
    let entitySlug: string | null = null;
    if (entityId) {
      params.push(entityId);
      entityFilter = ` AND entity_id = $${params.length}`;
      const entityResult = await this.pool.query(
        `SELECT slug FROM financial_entities WHERE id = $1 LIMIT 1`,
        [entityId],
      );
      entitySlug = entityResult.rows[0]?.slug ?? null;
    }

    const result = await this.pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM financial_ledger_entries
       WHERE competence_date >= $1 AND competence_date <= $2${entityFilter}
       GROUP BY category`,
      params,
    );

    let mrrRevenue = 0;
    let servicesRevenue = 0;
    let taxes = 0;
    let operationalCosts = 0;
    let totalEntries = 0;

    for (const row of result.rows) {
      const cat = row.category as LedgerCategory;
      const val = parseFloat(row.total || '0');
      totalEntries += parseInt(row.count || '0', 10);

      if (cat === 'mrr_revenue') mrrRevenue += val;
      else if (cat === 'services_revenue') servicesRevenue += val;
      else if (cat === 'taxes') taxes += Math.abs(val);
      else if (cat === 'operational_costs') operationalCosts += Math.abs(val);
    }

    const grossRevenue = mrrRevenue + servicesRevenue;
    const netRevenue = grossRevenue - taxes;
    const netMargin = netRevenue - operationalCosts;
    const netMarginPercentage = grossRevenue > 0 ? (netMargin / grossRevenue) * 100 : 0;

    return {
      period_start: startDate,
      period_end: endDate,
      gross_revenue: Number(grossRevenue.toFixed(2)),
      mrr_revenue: Number(mrrRevenue.toFixed(2)),
      services_revenue: Number(servicesRevenue.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      net_revenue: Number(netRevenue.toFixed(2)),
      operational_costs: Number(operationalCosts.toFixed(2)),
      net_margin: Number(netMargin.toFixed(2)),
      net_margin_percentage: Number(netMarginPercentage.toFixed(2)),
      entries_count: totalEntries,
      entity_id: entityId ?? null,
      entity_slug: entitySlug,
    };
  }

  /**
   * DRE segmentada por entity_id para o mesmo período.
   * Útil para mostrar "RevHackers vs Funnels vs JuriAI" num único request.
   */
  async getDREByEntity(startDate: string, endDate: string): Promise<DREPerEntityStatement[]> {
    const result = await this.pool.query(
      `SELECT
         e.id AS entity_id,
         e.slug,
         e.name,
         le.category,
         SUM(le.amount) AS total,
         COUNT(*) AS entries_count
       FROM financial_entities e
       LEFT JOIN financial_ledger_entries le
         ON le.entity_id = e.id
         AND le.competence_date >= $1
         AND le.competence_date <= $2
       WHERE e.is_active = true
       GROUP BY e.id, e.slug, e.name, le.category`,
      [startDate, endDate],
    );

    const byEntity = new Map<string, DREPerEntityStatement>();
    for (const row of result.rows) {
      const entityId = row.entity_id as string;
      let acc = byEntity.get(entityId);
      if (!acc) {
        acc = {
          entity_id: entityId,
          entity_slug: row.slug,
          entity_name: row.name,
          gross_revenue: 0,
          mrr_revenue: 0,
          services_revenue: 0,
          taxes: 0,
          net_revenue: 0,
          operational_costs: 0,
          net_margin: 0,
          net_margin_percentage: 0,
          entries_count: 0,
        };
        byEntity.set(entityId, acc);
      }
      const val = parseFloat(row.total || '0');
      const count = parseInt(row.entries_count || '0', 10);
      acc.entries_count += count;
      switch (row.category as LedgerCategory) {
        case 'mrr_revenue':
          acc.mrr_revenue += val;
          break;
        case 'services_revenue':
          acc.services_revenue += val;
          break;
        case 'taxes':
          acc.taxes += Math.abs(val);
          break;
        case 'operational_costs':
          acc.operational_costs += Math.abs(val);
          break;
      }
    }

    for (const acc of byEntity.values()) {
      acc.gross_revenue = Number((acc.mrr_revenue + acc.services_revenue).toFixed(2));
      acc.mrr_revenue = Number(acc.mrr_revenue.toFixed(2));
      acc.services_revenue = Number(acc.services_revenue.toFixed(2));
      acc.taxes = Number(acc.taxes.toFixed(2));
      acc.net_revenue = Number((acc.gross_revenue - acc.taxes).toFixed(2));
      acc.operational_costs = Number(acc.operational_costs.toFixed(2));
      acc.net_margin = Number((acc.net_revenue - acc.operational_costs).toFixed(2));
      acc.net_margin_percentage = acc.gross_revenue > 0 ? Number(((acc.net_margin / acc.gross_revenue) * 100).toFixed(2)) : 0;
    }

    return Array.from(byEntity.values()).sort((a, b) => b.gross_revenue - a.gross_revenue);
  }

  private mapStatementRow(row: any): BankStatementRecord {
    return {
      id: row.id,
      bank_account_id: row.bank_account_id,
      transaction_date: typeof row.transaction_date === 'string' ? row.transaction_date.substring(0, 10) : row.transaction_date,
      amount: parseFloat(row.amount),
      type: row.type,
      description: row.description,
      bank_transaction_id: row.bank_transaction_id,
      payer_document: row.payer_document,
      payer_name: row.payer_name,
      source: row.source,
      reconciliation_status: row.reconciliation_status,
      entity_id: row.entity_id ?? null,
      raw_payload: typeof row.raw_payload === 'string' ? JSON.parse(row.raw_payload) : row.raw_payload,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapLedgerRow(row: any): LedgerEntryRecord {
    return {
      id: row.id,
      category: row.category,
      cost_center: row.cost_center,
      opportunity_id: row.opportunity_id,
      rei_project_id: row.rei_project_id,
      client_id: row.client_id,
      description: row.description,
      amount: parseFloat(row.amount),
      competence_date: typeof row.competence_date === 'string' ? row.competence_date.substring(0, 10) : row.competence_date,
      due_date: row.due_date ? (typeof row.due_date === 'string' ? row.due_date.substring(0, 10) : row.due_date) : null,
      paid_at: row.paid_at,
      is_paid: row.is_paid,
      entity_id: row.entity_id ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapEntityRow(row: any): FinancialEntityRecord {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      legal_name: row.legal_name ?? null,
      cnpj: row.cnpj ?? null,
      kind: row.kind,
      parent_id: row.parent_id ?? null,
      is_active: row.is_active,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata ?? {},
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapReconciliationRow(row: any): ReconciliationRecord {
    return {
      id: row.id,
      statement_id: row.statement_id,
      ledger_entry_id: row.ledger_entry_id,
      opportunity_id: row.opportunity_id,
      match_score: parseFloat(row.match_score),
      match_rule: row.match_rule,
      status: row.status,
      notes: row.notes,
      reconciled_by: row.reconciled_by,
      reconciled_at: row.reconciled_at,
      created_at: row.created_at,
    };
  }
}
