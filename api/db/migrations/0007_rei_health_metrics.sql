-- Migration: 0007_rei_health_metrics
-- Historical health metrics tracking for REI onboarding clients.
-- Each row is a periodic snapshot of health_score, churn_risk, engagement_rate, NPS.
-- Tenant isolation enforced via `tenant_id` FK to `app.clients(id)` and RLS.

BEGIN;

CREATE TABLE IF NOT EXISTS app.rei_health_metrics (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    rei_onboarding_id UUID NOT NULL,
    health_score      INTEGER NOT NULL CHECK (health_score BETWEEN 0 AND 100),
    churn_risk        TEXT NOT NULL CHECK (churn_risk IN ('low', 'medium', 'high')),
    engagement_rate   NUMERIC(5,2) NOT NULL CHECK (engagement_rate BETWEEN 0 AND 100),
    nps_score         INTEGER CHECK (nps_score IS NULL OR nps_score BETWEEN 0 AND 10),
    current_milestone TEXT NOT NULL CHECK (current_milestone IN ('M0_WELCOME', 'M1_KICKOFF', 'M2_QUICK_WIN', 'M3_NPS_D14', 'M4_MID_REVIEW', 'M5_WRAP_NPS', 'COMPLETED')),
    days_into_journey INTEGER NOT NULL CHECK (days_into_journey BETWEEN 0 AND 365),
    trigger_source    TEXT NOT NULL DEFAULT 'scheduled' CHECK (trigger_source IN ('scheduled', 'nps_response', 'manual', 'intervention')),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rei_health_metrics_tenant_onboarding
    ON app.rei_health_metrics (tenant_id, rei_onboarding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rei_health_metrics_tenant_created
    ON app.rei_health_metrics (tenant_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_rei_health_metrics_updated_at ON app.rei_health_metrics;
CREATE TRIGGER trg_rei_health_metrics_updated_at
BEFORE UPDATE ON app.rei_health_metrics
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.rei_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.rei_health_metrics FORCE ROW LEVEL SECURITY;

CREATE POLICY rei_health_metrics_tenant_isolation
    ON app.rei_health_metrics
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = rei_health_metrics.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = rei_health_metrics.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.rei_health_metrics IS
'Historical snapshots of health_score, churn_risk, engagement_rate and NPS for REI onboarding clients. Tenant-scoped via RLS for cross-tenant isolation.';

COMMIT;
