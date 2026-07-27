-- Migration: 0013_create_ghl_events
-- Logs all GHL webhook events (outbound + inbound) for debugging and analytics.
-- Tenant-scoped via app.clients(id) with RLS isolation.

BEGIN;

CREATE TABLE IF NOT EXISTS app.ghl_events (
    id                  TEXT PRIMARY KEY DEFAULT ('ghl_' || gen_random_uuid()::text),
    tenant_id           UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    organization_id     TEXT NOT NULL DEFAULT 'default',
    event_type          TEXT NOT NULL,
    event_data          JSONB NOT NULL DEFAULT '{}'::jsonb,
    webhook_url         TEXT,
    success             BOOLEAN NOT NULL DEFAULT true,
    response_body       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ghl_events_tenant_type
    ON app.ghl_events (tenant_id, event_type);
CREATE INDEX IF NOT EXISTS idx_ghl_events_tenant_created
    ON app.ghl_events (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ghl_events_success
    ON app.ghl_events (tenant_id, success) WHERE success = false;

DROP TRIGGER IF EXISTS trg_ghl_events_updated_at ON app.ghl_events;
CREATE TRIGGER trg_ghl_events_updated_at
BEFORE UPDATE ON app.ghl_events
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.ghl_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.ghl_events FORCE ROW LEVEL SECURITY;

CREATE POLICY ghl_events_tenant_isolation
    ON app.ghl_events
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = ghl_events.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = ghl_events.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.ghl_events IS
'Logs all GHL webhook events (outbound + inbound) for debugging. Tenant-scoped via RLS.';

COMMIT;
