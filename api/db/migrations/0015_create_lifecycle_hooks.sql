-- Migration: 0015_create_lifecycle_hooks
-- Creates tables for configurable lifecycle hooks (email, GHL, REI onboarding, etc).
-- Tenant-scoped via app.clients(id) with RLS isolation.
-- This migration MUST NOT be applied to Supabase. It is targeted at Cloud SQL.

BEGIN;

-- ============================================================================
-- app.lifecycle_hooks (configurable per-tenant hooks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.lifecycle_hooks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    from_stage      TEXT,
    to_stage        TEXT,
    action_type     TEXT NOT NULL CHECK (action_type IN ('send_email', 'create_ghl_opportunity', 'trigger_rei_onboarding', 'add_ghl_tag', 'notify_team', 'send_exit_survey', 'webhook')),
    action_config   JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    priority        INTEGER NOT NULL DEFAULT 100,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_hooks_tenant_active
    ON app.lifecycle_hooks (tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lifecycle_hooks_tenant_transition
    ON app.lifecycle_hooks (tenant_id, from_stage, to_stage);

DROP TRIGGER IF EXISTS trg_lifecycle_hooks_updated_at ON app.lifecycle_hooks;
CREATE TRIGGER trg_lifecycle_hooks_updated_at
BEFORE UPDATE ON app.lifecycle_hooks
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.lifecycle_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.lifecycle_hooks FORCE ROW LEVEL SECURITY;

CREATE POLICY lifecycle_hooks_tenant_isolation
    ON app.lifecycle_hooks
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = lifecycle_hooks.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = lifecycle_hooks.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

-- ============================================================================
-- app.lifecycle_hook_logs (audit trail of hook executions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.lifecycle_hook_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    contact_id      UUID NOT NULL REFERENCES app.contacts(id) ON DELETE CASCADE,
    hook_id         TEXT NOT NULL,
    action_type     TEXT NOT NULL,
    from_stage      TEXT,
    to_stage        TEXT,
    success         BOOLEAN NOT NULL,
    result_data     JSONB,
    error_message   TEXT,
    executed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_hook_logs_tenant_contact
    ON app.lifecycle_hook_logs (tenant_id, contact_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_lifecycle_hook_logs_tenant_success
    ON app.lifecycle_hook_logs (tenant_id, success) WHERE success = false;

DROP TRIGGER IF EXISTS trg_lifecycle_hook_logs_updated_at ON app.lifecycle_hook_logs;
CREATE TRIGGER trg_lifecycle_hook_logs_updated_at
BEFORE UPDATE ON app.lifecycle_hook_logs
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.lifecycle_hook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.lifecycle_hook_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY lifecycle_hook_logs_tenant_isolation
    ON app.lifecycle_hook_logs
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = lifecycle_hook_logs.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = lifecycle_hook_logs.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE app.lifecycle_hooks IS
'Configurable per-tenant hooks that fire on journey_stage transitions. Replaces Supabase automation flows.';
COMMENT ON TABLE app.lifecycle_hook_logs IS
'Audit trail of all lifecycle hook executions. Used for debugging and analytics.';

COMMIT;
