-- Migration: 0010_create_rei_expansion_opportunities
-- Tracks upsell/cross-sell opportunities generated at the end of the 30-day REI cycle (Donna Weber O6 - Expand phase).

BEGIN;

CREATE TABLE IF NOT EXISTS app.rei_expansion_opportunities (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    rei_onboarding_id       UUID,
    project_id              UUID,
    opportunity_type        TEXT NOT NULL CHECK (opportunity_type IN ('upsell', 'cross_sell', 'renewal', 'expansion_service', 'referral')),
    product_name            TEXT NOT NULL,
    product_description     TEXT,
    estimated_value_brl     NUMERIC(15,2),
    ai_reasoning            TEXT,
    status                  TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'presented', 'negotiating', 'won', 'lost', 'deferred')),
    presented_at            TIMESTAMPTZ,
    closed_at               TIMESTAMPTZ,
    closed_value_brl        NUMERIC(15,2),
    created_by              TEXT NOT NULL,
    assigned_to             TEXT,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rei_expansion_tenant_status
    ON app.rei_expansion_opportunities (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_rei_expansion_tenant_onboarding
    ON app.rei_expansion_opportunities (tenant_id, rei_onboarding_id);
CREATE INDEX IF NOT EXISTS idx_rei_expansion_tenant_type
    ON app.rei_expansion_opportunities (tenant_id, opportunity_type);
CREATE INDEX IF NOT EXISTS idx_rei_expansion_tenant_value
    ON app.rei_expansion_opportunities (tenant_id, estimated_value_brl DESC) WHERE estimated_value_brl IS NOT NULL;

DROP TRIGGER IF EXISTS trg_rei_expansion_updated_at ON app.rei_expansion_opportunities;
CREATE TRIGGER trg_rei_expansion_updated_at
BEFORE UPDATE ON app.rei_expansion_opportunities
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.rei_expansion_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.rei_expansion_opportunities FORCE ROW LEVEL SECURITY;

CREATE POLICY rei_expansion_tenant_isolation
    ON app.rei_expansion_opportunities
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = rei_expansion_opportunities.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = rei_expansion_opportunities.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.rei_expansion_opportunities IS
'Tracks upsell/cross-sell opportunities generated at the end of the 30-day REI cycle (Donna Weber O6 - Expand phase). Each opportunity has a value estimate and conversion status.';

COMMIT;
