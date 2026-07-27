-- Migration: 0008_create_competitors
-- Competitor Intelligence & Market Signals module.
-- Enforces multi-tenant isolation via `tenant_id` FK to `app.clients(id)` and RLS with FORCE.

BEGIN;

-- ============================================================================
-- 1. APP.COMPETITORS
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.competitors (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    project_id   UUID,
    name         TEXT NOT NULL,
    cnpj         TEXT,
    website      TEXT,
    segment      TEXT,
    cnae_primary TEXT,
    notes        TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    is_priority  BOOLEAN NOT NULL DEFAULT false,
    added_by     TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitors_tenant_project
    ON app.competitors (tenant_id, project_id);
CREATE INDEX IF NOT EXISTS idx_competitors_tenant_cnpj
    ON app.competitors (tenant_id, cnpj) WHERE cnpj IS NOT NULL;

DROP TRIGGER IF EXISTS trg_competitors_updated_at ON app.competitors;
CREATE TRIGGER trg_competitors_updated_at
BEFORE UPDATE ON app.competitors
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.competitors FORCE ROW LEVEL SECURITY;

CREATE POLICY competitors_tenant_isolation
    ON app.competitors
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = competitors.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = competitors.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.competitors IS
'Registered competitors per tenant/project for market intelligence tracking.';


-- ============================================================================
-- 2. APP.COMPETITOR_INTELLIGENCE
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.competitor_intelligence (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    competitor_id       UUID NOT NULL REFERENCES app.competitors(id) ON DELETE CASCADE,
    razao_social        TEXT,
    nome_fantasia       TEXT,
    cnpj                TEXT,
    capital_social_brl  NUMERIC(15,2),
    porte               TEXT,
    natureza_juridica   TEXT,
    cnae_primary        TEXT,
    cnae_secondary      JSONB DEFAULT '[]'::jsonb,
    uf                  TEXT,
    municipio           TEXT,
    data_abertura       DATE,
    situacao_receita    TEXT,
    qsa                 JSONB DEFAULT '[]'::jsonb,
    spi_score           INTEGER CHECK (spi_score IS NULL OR (spi_score BETWEEN 0 AND 100)),
    spi_category        TEXT,
    ofs_risk_level      TEXT CHECK (ofs_risk_level IS NULL OR ofs_risk_level IN ('low', 'medium', 'high', 'critical')),
    raw_payload         JSONB DEFAULT '{}'::jsonb,
    last_enriched_at    TIMESTAMPTZ,
    enrichment_status   TEXT NOT NULL DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'processing', 'completed', 'failed')),
    enrichment_error    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_intel_tenant_comp
    ON app.competitor_intelligence (tenant_id, competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_intel_tenant_status
    ON app.competitor_intelligence (tenant_id, enrichment_status);

DROP TRIGGER IF EXISTS trg_competitor_intelligence_updated_at ON app.competitor_intelligence;
CREATE TRIGGER trg_competitor_intelligence_updated_at
BEFORE UPDATE ON app.competitor_intelligence
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.competitor_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.competitor_intelligence FORCE ROW LEVEL SECURITY;

CREATE POLICY competitor_intelligence_tenant_isolation
    ON app.competitor_intelligence
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = competitor_intelligence.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = competitor_intelligence.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.competitor_intelligence IS
'Enriched corporate intelligence data fetched via FonteData API for tracked competitors.';


-- ============================================================================
-- 3. APP.COMPETITOR_COMPARISONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.competitor_comparisons (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    project_id        UUID,
    competitor_id     UUID NOT NULL REFERENCES app.competitors(id) ON DELETE CASCADE,
    pricing_score     INTEGER CHECK (pricing_score IS NULL OR (pricing_score BETWEEN 0 AND 10)),
    features_score    INTEGER CHECK (features_score IS NULL OR (features_score BETWEEN 0 AND 10)),
    positioning_score INTEGER CHECK (positioning_score IS NULL OR (positioning_score BETWEEN 0 AND 10)),
    pricing_notes     TEXT,
    features_notes    TEXT,
    positioning_notes TEXT,
    ai_summary        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_comp_tenant_comp
    ON app.competitor_comparisons (tenant_id, competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_comp_tenant_proj
    ON app.competitor_comparisons (tenant_id, project_id);

DROP TRIGGER IF EXISTS trg_competitor_comparisons_updated_at ON app.competitor_comparisons;
CREATE TRIGGER trg_competitor_comparisons_updated_at
BEFORE UPDATE ON app.competitor_comparisons
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.competitor_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.competitor_comparisons FORCE ROW LEVEL SECURITY;

CREATE POLICY competitor_comparisons_tenant_isolation
    ON app.competitor_comparisons
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = competitor_comparisons.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = competitor_comparisons.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.competitor_comparisons IS
'Comparative matrix scoring pricing, features, and positioning against competitors.';


-- ============================================================================
-- 4. APP.MARKET_SIGNALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.market_signals (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    competitor_id UUID REFERENCES app.competitors(id) ON DELETE SET NULL,
    signal_type   TEXT NOT NULL CHECK (signal_type IN ('pricing_change', 'new_feature', 'funding', 'executive_move', 'lawsuit', 'm_and_a', 'marketing_campaign', 'other')),
    title         TEXT NOT NULL,
    summary       TEXT NOT NULL,
    source_url    TEXT,
    source_name   TEXT,
    sentiment     TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    impact_level  TEXT NOT NULL DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
    detected_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    detected_by   TEXT DEFAULT 'system',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_signals_tenant_comp
    ON app.market_signals (tenant_id, competitor_id);
CREATE INDEX IF NOT EXISTS idx_market_signals_tenant_detected
    ON app.market_signals (tenant_id, detected_at DESC);

DROP TRIGGER IF EXISTS trg_market_signals_updated_at ON app.market_signals;
CREATE TRIGGER trg_market_signals_updated_at
BEFORE UPDATE ON app.market_signals
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.market_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.market_signals FORCE ROW LEVEL SECURITY;

CREATE POLICY market_signals_tenant_isolation
    ON app.market_signals
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = market_signals.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = market_signals.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.market_signals IS
'Market news and competitive movements detected for competitors or general industry segment.';

COMMIT;
