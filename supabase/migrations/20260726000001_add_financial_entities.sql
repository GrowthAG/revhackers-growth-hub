-- Migration: Add Financial Entities (Holdings / Brands) for proper DRE segmentation.
--
-- Hierarquia:
--   RevTech Systems LTDA  (holding - única com conta bancária)
--     ├── RevHackers  (consultoria + implementação)
--     ├── Funnels     (SaaS)
--     └── JuriAI      (billing via Stripe -> conta RevTech)
--
-- Regra de ouro:
--   financial_bank_accounts.entity_id  -> SEMPRE RevTech (holding)
--   financial_ledger_entries.entity_id -> qual brand gerou o lançamento
--   financial_bank_statements.entity_id -> resolvido pelo bank_account (denormalizado p/ queries)
--
-- Resultado: o extrato bancário é entity-agnostic (porque sai de RevTech),
-- mas a DRE fica segmentada por brand. Reconciliation engine não precisa mudar.

BEGIN;

-- 1. Tabela de entidades
CREATE TABLE IF NOT EXISTS public.financial_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,                -- 'revtech', 'revhackers', 'funnels', 'juriai'
    name TEXT NOT NULL,
    legal_name TEXT,                          -- 'RevHackers Tecnologia LTDA'
    cnpj TEXT,                                -- CNPJ próprio (somente dígitos)
    kind TEXT NOT NULL CHECK (kind IN ('holding', 'brand', 'personal')),
    parent_id UUID REFERENCES public.financial_entities(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_entities_parent ON public.financial_entities(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financial_entities_kind ON public.financial_entities(kind);

-- 2. Seed das entidades (idempotente via ON CONFLICT)
INSERT INTO public.financial_entities (slug, name, legal_name, cnpj, kind)
VALUES
    ('revtech', 'RevTech Systems', 'Revtech Systems LTDA', NULL, 'holding'),
    ('revhackers', 'RevHackers', 'RevHackers Tecnologia LTDA', NULL, 'brand'),
    ('funnels', 'Funnels', 'Funnels Tecnologia LTDA', NULL, 'brand'),
    ('juriai', 'JuriAI', 'JuriAI Tecnologia LTDA', NULL, 'brand')
ON CONFLICT (slug) DO NOTHING;

-- 3. Backfill parent_id (brand -> holding)
UPDATE public.financial_entities child
SET parent_id = parent.id
FROM public.financial_entities parent
WHERE parent.slug = 'revtech'
  AND child.slug IN ('revhackers', 'funnels', 'juriai')
  AND child.parent_id IS NULL;

-- 4. Adicionar entity_id às tabelas existentes (nullable para retro-compat)
ALTER TABLE public.financial_bank_accounts
    ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES public.financial_entities(id) ON DELETE SET NULL;

ALTER TABLE public.financial_ledger_entries
    ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES public.financial_entities(id) ON DELETE SET NULL;

ALTER TABLE public.financial_bank_statements
    ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES public.financial_entities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bank_accounts_entity ON public.financial_bank_accounts(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ledger_entries_entity ON public.financial_ledger_entries(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_statements_entity ON public.financial_bank_statements(entity_id) WHERE entity_id IS NOT NULL;

-- 5. Backfill: toda bank_account existente pertence à RevTech (holding)
UPDATE public.financial_bank_accounts ba
SET entity_id = (SELECT id FROM public.financial_entities WHERE slug = 'revtech')
WHERE entity_id IS NULL;

-- 6. Backfill: statements herdam entity_id da bank_account
UPDATE public.financial_bank_statements bs
SET entity_id = ba.entity_id
FROM public.financial_bank_accounts ba
WHERE bs.bank_account_id = ba.id
  AND bs.entity_id IS NULL
  AND ba.entity_id IS NOT NULL;

-- 7. View materializada: saldos por entidade (atualizada por trigger opcional)
CREATE OR REPLACE VIEW public.financial_entity_balances AS
SELECT
    e.id AS entity_id,
    e.slug,
    e.name,
    e.kind,
    COALESCE(SUM(ba.balance), 0) AS total_balance,
    COUNT(DISTINCT ba.id) AS account_count
FROM public.financial_entities e
LEFT JOIN public.financial_bank_accounts ba ON ba.entity_id = e.id AND ba.is_active = true
WHERE e.is_active = true
GROUP BY e.id, e.slug, e.name, e.kind;

-- 8. View: DRE segmentada por entity_id (lê ledger filtrado)
CREATE OR REPLACE VIEW public.financial_dre_by_entity AS
SELECT
    e.id AS entity_id,
    e.slug,
    e.name AS entity_name,
    DATE_TRUNC('month', le.competence_date) AS competence_month,
    le.category,
    SUM(le.amount) AS total_amount,
    COUNT(*) AS entries_count
FROM public.financial_entities e
LEFT JOIN public.financial_ledger_entries le ON le.entity_id = e.id
WHERE e.is_active = true
GROUP BY e.id, e.slug, e.name, DATE_TRUNC('month', le.competence_date), le.category;

COMMIT;
