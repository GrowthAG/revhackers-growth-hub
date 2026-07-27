-- Migration: Create Financial Reconciliation & Accounting Engine tables
-- Description: Core tables for bank accounts, statement ingestion, ledger entries (DRE) and reconciliation matching.

-- 1. BANK ACCOUNTS & PAYMENT WALLETS
CREATE TABLE IF NOT EXISTS public.financial_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider TEXT NOT NULL, -- e.g. 'itau', 'bradesco', 'asaas', 'stripe', 'pluggy', 'manual'
    account_number TEXT,
    bank_code TEXT,
    agency TEXT,
    currency TEXT NOT NULL DEFAULT 'BRL',
    balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. IMPORTED BANK STATEMENTS
CREATE TABLE IF NOT EXISTS public.financial_bank_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID REFERENCES public.financial_bank_accounts(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL, -- positive for credit/inflow, negative for debit/outflow
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    description TEXT NOT NULL,
    bank_transaction_id TEXT, -- TxID / Pix ID / External ID
    payer_document TEXT, -- CNPJ or CPF of payer/payee
    payer_name TEXT, -- Corporate name or individual name
    source TEXT NOT NULL DEFAULT 'ofx_csv', -- 'ofx', 'csv', 'pluggy', 'asaas', 'stripe', 'webhook'
    reconciliation_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (reconciliation_status IN ('PENDING', 'RECONCILED', 'DIVERGENT', 'IGNORED')),
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bank_statements_status ON public.financial_bank_statements(reconciliation_status);
CREATE INDEX IF NOT EXISTS idx_bank_statements_bank_tx ON public.financial_bank_statements(bank_transaction_id) WHERE bank_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_statements_payer_doc ON public.financial_bank_statements(payer_document) WHERE payer_document IS NOT NULL;

-- 3. FINANCIAL LEDGER ENTRIES (CHARTS OF ACCOUNTS / DRE)
CREATE TABLE IF NOT EXISTS public.financial_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'mrr_revenue', 'services_revenue', 'taxes', 'operational_costs', 'net_margin', 'other'
    cost_center TEXT DEFAULT 'general',
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    rei_project_id UUID REFERENCES public.rei_projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL, -- positive for revenue, negative for cost/expense
    competence_date DATE NOT NULL,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_category ON public.financial_ledger_entries(category);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_competence ON public.financial_ledger_entries(competence_date);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_opportunity ON public.financial_ledger_entries(opportunity_id) WHERE opportunity_id IS NOT NULL;

-- 4. RECONCILIATION MATCHINGS
CREATE TABLE IF NOT EXISTS public.financial_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID NOT NULL REFERENCES public.financial_bank_statements(id) ON DELETE CASCADE,
    ledger_entry_id UUID REFERENCES public.financial_ledger_entries(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    match_score NUMERIC(5,2) NOT NULL, -- 0.00 to 100.00 score
    match_rule TEXT NOT NULL, -- 'RULE_1_EXACT_TXID', 'RULE_2_CNPJ_AMOUNT_DATE', 'RULE_3_FUZZY_NAME_AMOUNT', 'MANUAL'
    status TEXT NOT NULL DEFAULT 'AUTO_MATCHED' CHECK (status IN ('AUTO_MATCHED', 'MANUALLY_MATCHED', 'UNMATCHED', 'REJECTED')),
    notes TEXT,
    reconciled_by TEXT DEFAULT 'system',
    reconciled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliations_statement ON public.financial_reconciliations(statement_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_ledger ON public.financial_reconciliations(ledger_entry_id) WHERE ledger_entry_id IS NOT NULL;
