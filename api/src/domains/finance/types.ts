export type BankStatementType = 'CREDIT' | 'DEBIT';
export type StatementReconciliationStatus = 'PENDING' | 'RECONCILED' | 'DIVERGENT' | 'IGNORED';
export type EntityKind = 'holding' | 'brand' | 'personal';

export interface FinancialEntityRecord {
  id: string;
  slug: string;
  name: string;
  legal_name?: string | null;
  cnpj?: string | null;
  kind: EntityKind;
  parent_id?: string | null;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BankAccountRecord {
  id: string;
  name: string;
  provider: string;
  account_number?: string | null;
  bank_code?: string | null;
  agency?: string | null;
  currency: string;
  balance: number;
  is_active: boolean;
  entity_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankStatementRecord {
  id: string;
  bank_account_id?: string | null;
  transaction_date: string;
  amount: number;
  type: BankStatementType;
  description: string;
  bank_transaction_id?: string | null;
  payer_document?: string | null;
  payer_name?: string | null;
  source: string;
  reconciliation_status: StatementReconciliationStatus;
  entity_id?: string | null;
  raw_payload?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateBankStatementParams {
  bank_account_id?: string | null;
  transaction_date: string;
  amount: number;
  type: BankStatementType;
  description: string;
  bank_transaction_id?: string | null;
  payer_document?: string | null;
  payer_name?: string | null;
  source?: string;
  entity_id?: string | null;
  raw_payload?: Record<string, unknown>;
}

export type LedgerCategory = 
  | 'mrr_revenue' 
  | 'services_revenue' 
  | 'taxes' 
  | 'operational_costs' 
  | 'net_margin' 
  | 'other';

export interface LedgerEntryRecord {
  id: string;
  category: LedgerCategory;
  cost_center: string;
  opportunity_id?: string | null;
  rei_project_id?: string | null;
  client_id?: string | null;
  description: string;
  amount: number;
  competence_date: string;
  due_date?: string | null;
  paid_at?: string | null;
  is_paid: boolean;
  entity_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLedgerEntryParams {
  category: LedgerCategory;
  cost_center?: string;
  opportunity_id?: string | null;
  rei_project_id?: string | null;
  client_id?: string | null;
  description: string;
  amount: number;
  competence_date: string;
  due_date?: string | null;
  is_paid?: boolean;
  paid_at?: string | null;
  entity_id?: string | null;
}

export type MatchRule = 
  | 'RULE_1_EXACT_TXID'
  | 'RULE_2_CNPJ_AMOUNT_DATE'
  | 'RULE_3_FUZZY_NAME_AMOUNT'
  | 'MANUAL';

export interface ReconciliationRecord {
  id: string;
  statement_id: string;
  ledger_entry_id?: string | null;
  opportunity_id?: string | null;
  match_score: number;
  match_rule: MatchRule;
  status: 'AUTO_MATCHED' | 'MANUALLY_MATCHED' | 'UNMATCHED' | 'REJECTED';
  notes?: string | null;
  reconciled_by: string;
  reconciled_at: string;
  created_at: string;
}

export interface MatchCandidate {
  statement: BankStatementRecord;
  ledger_entry?: LedgerEntryRecord | null;
  opportunity_id?: string | null;
  match_score: number;
  match_rule: MatchRule;
  reason: string;
}

export interface DREPeriodStatement {
  period_start: string;
  period_end: string;
  gross_revenue: number;
  mrr_revenue: number;
  services_revenue: number;
  taxes: number;
  net_revenue: number;
  operational_costs: number;
  net_margin: number;
  net_margin_percentage: number;
  entries_count: number;
  /** Quando filtrado por entity, indica qual entidade. null = consolidado. */
  entity_id?: string | null;
  entity_slug?: string | null;
}

export interface DREPerEntityStatement {
  entity_id: string;
  entity_slug: string;
  entity_name: string;
  gross_revenue: number;
  mrr_revenue: number;
  services_revenue: number;
  taxes: number;
  net_revenue: number;
  operational_costs: number;
  net_margin: number;
  net_margin_percentage: number;
  entries_count: number;
}
