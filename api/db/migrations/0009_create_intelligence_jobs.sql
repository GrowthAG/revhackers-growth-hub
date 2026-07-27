-- Migration: 0009_create_intelligence_jobs
-- Async background jobs and AI findings repository for intelligence engine.
-- Tenant isolation enforced via `tenant_id` FK to `app.clients(id)` and RLS with FORCE.

BEGIN;

-- ============================================================================
-- 1. APP.INTELLIGENCE_JOBS
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.intelligence_jobs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    job_type       TEXT NOT NULL CHECK (job_type IN ('competitor_enrichment', 'comparison_generation', 'signal_detection', 'framework_regeneration', 'market_scan')),
    status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    competitor_id  UUID REFERENCES app.competitors(id) ON DELETE SET NULL,
    project_id     UUID,
    input_payload  JSONB DEFAULT '{}'::jsonb,
    output_payload JSONB DEFAULT '{}'::jsonb,
    attempts       INTEGER NOT NULL DEFAULT 0,
    max_attempts   INTEGER NOT NULL DEFAULT 3,
    last_error     TEXT,
    scheduled_for  TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at     TIMESTAMPTZ,
    completed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_jobs_tenant_status
    ON app.intelligence_jobs (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_intelligence_jobs_tenant_comp
    ON app.intelligence_jobs (tenant_id, competitor_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_jobs_tenant_proj
    ON app.intelligence_jobs (tenant_id, project_id);

DROP TRIGGER IF EXISTS trg_intelligence_jobs_updated_at ON app.intelligence_jobs;
CREATE TRIGGER trg_intelligence_jobs_updated_at
BEFORE UPDATE ON app.intelligence_jobs
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.intelligence_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.intelligence_jobs FORCE ROW LEVEL SECURITY;

CREATE POLICY intelligence_jobs_tenant_isolation
    ON app.intelligence_jobs
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = intelligence_jobs.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = intelligence_jobs.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.intelligence_jobs IS
'Async job queue for intelligence tasks (enrichment, signal detection, comparison generation, framework regeneration).';


-- ============================================================================
-- 2. APP.INTELLIGENCE_FINDINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.intelligence_findings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id          UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    job_id             UUID REFERENCES app.intelligence_jobs(id) ON DELETE SET NULL,
    competitor_id      UUID REFERENCES app.competitors(id) ON DELETE SET NULL,
    finding_type       TEXT NOT NULL CHECK (finding_type IN ('pricing_alert', 'funding_event', 'hiring_spike', 'feature_launch', 'positioning_shift', 'market_trend', 'risk_signal', 'opportunity')),
    title              TEXT NOT NULL,
    description        TEXT,
    severity           TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence_score   NUMERIC(3,2) CHECK (confidence_score IS NULL OR (confidence_score BETWEEN 0 AND 1)),
    source_url         TEXT,
    source_name        TEXT,
    recommended_action TEXT,
    detected_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_findings_tenant_comp
    ON app.intelligence_findings (tenant_id, competitor_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_findings_tenant_job
    ON app.intelligence_findings (tenant_id, job_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_findings_tenant_type_sev
    ON app.intelligence_findings (tenant_id, finding_type, severity);

DROP TRIGGER IF EXISTS trg_intelligence_findings_updated_at ON app.intelligence_findings;
CREATE TRIGGER trg_intelligence_findings_updated_at
BEFORE UPDATE ON app.intelligence_findings
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.intelligence_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.intelligence_findings FORCE ROW LEVEL SECURITY;

CREATE POLICY intelligence_findings_tenant_isolation
    ON app.intelligence_findings
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = intelligence_findings.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = intelligence_findings.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.intelligence_findings IS
'Actionable AI market findings and insights generated by intelligence jobs.';

COMMIT;
