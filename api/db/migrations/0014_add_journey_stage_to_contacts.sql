-- Migration: 0014_add_journey_stage_to_contacts
-- Adds journey_stage tracking for the full lead lifecycle (MQL → SQL → Opp → Cliente → Expansion → Renewal).
-- Replaces Supabase stage tracking that was scattered across multiple tables.
-- This migration MUST NOT be applied to Supabase. It is targeted at Cloud SQL.

BEGIN;

-- ============================================================================
-- 1. Add journey_stage column to app.contacts
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'app'
                   AND table_name = 'contacts'
                   AND column_name = 'journey_stage') THEN
        ALTER TABLE app.contacts
            ADD COLUMN journey_stage TEXT NOT NULL DEFAULT 'lead'
                CHECK (journey_stage IN (
                    'lead',          -- MQL: captured via form/webhook
                    'mql',           -- Marketing Qualified Lead
                    'sql',           -- Sales Qualified Lead
                    'opportunity',   -- Active deal in pipeline
                    'customer',      -- Closed-won, REI onboarding active
                    'expansion',     -- Upsell/cross-sell opportunity
                    'renewal',       -- Contract renewal in progress
                    'churned'        -- Lost or cancelled
                ));
    END IF;
END $$;

-- ============================================================================
-- 2. Add journey tracking columns
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'app'
                   AND table_name = 'contacts'
                   AND column_name = 'stage_entered_at') THEN
        ALTER TABLE app.contacts
            ADD COLUMN stage_entered_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'app'
                   AND table_name = 'contacts'
                   AND column_name = 'lead_score') THEN
        ALTER TABLE app.contacts
            ADD COLUMN lead_score INTEGER CHECK (lead_score IS NULL OR (lead_score >= 0 AND lead_score <= 100));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'app'
                   AND table_name = 'contacts'
                   AND column_name = 'last_meeting_id') THEN
        ALTER TABLE app.contacts
            ADD COLUMN last_meeting_id UUID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'app'
                   AND table_name = 'contacts'
                   AND column_name = 'last_call_transcript_id') THEN
        ALTER TABLE app.contacts
            ADD COLUMN last_call_transcript_id UUID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'app'
                   AND table_name = 'contacts'
                   AND column_name = 'ghl_contact_id') THEN
        ALTER TABLE app.contacts
            ADD COLUMN ghl_contact_id TEXT;
    END IF;
END $$;

-- ============================================================================
-- 3. Create indexes for efficient queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_journey_stage
    ON app.contacts (tenant_id, journey_stage) WHERE journey_stage IN ('lead', 'mql', 'sql', 'opportunity', 'customer', 'expansion', 'renewal');

CREATE INDEX IF NOT EXISTS idx_contacts_tenant_lead_score
    ON app.contacts (tenant_id, lead_score DESC NULLS LAST) WHERE lead_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_tenant_stage_entered
    ON app.contacts (tenant_id, stage_entered_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_tenant_ghl_id
    ON app.contacts (tenant_id, ghl_contact_id) WHERE ghl_contact_id IS NOT NULL;

-- ============================================================================
-- 4. Create lifecycle_history table (audit trail of stage transitions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.lifecycle_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    contact_id          UUID NOT NULL REFERENCES app.contacts(id) ON DELETE CASCADE,
    from_stage          TEXT,
    to_stage            TEXT NOT NULL,
    triggered_by        TEXT,                                                      -- 'webhook', 'manual', 'automation', 'lifecycle_hook'
    metadata            JSONB DEFAULT '{}'::jsonb,
    transitioned_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_history_tenant_contact
    ON app.lifecycle_history (tenant_id, contact_id, transitioned_at DESC);

CREATE INDEX IF NOT EXISTS idx_lifecycle_history_tenant_stage
    ON app.lifecycle_history (tenant_id, to_stage);

DROP TRIGGER IF EXISTS trg_lifecycle_history_updated_at ON app.lifecycle_history;
CREATE TRIGGER trg_lifecycle_history_updated_at
BEFORE UPDATE ON app.lifecycle_history
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.lifecycle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.lifecycle_history FORCE ROW LEVEL SECURITY;

CREATE POLICY lifecycle_history_tenant_isolation
    ON app.lifecycle_history
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = lifecycle_history.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = lifecycle_history.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

-- ============================================================================
-- 5. Comments
-- ============================================================================
COMMENT ON COLUMN app.contacts.journey_stage IS
'Current stage in the lead/customer lifecycle: lead → mql → sql → opportunity → customer → expansion → renewal → churned. Replaces scattered Supabase stage tracking.';
COMMENT ON COLUMN app.contacts.stage_entered_at IS
'Timestamp when the contact entered the current journey_stage. Used for stage duration analytics.';
COMMENT ON COLUMN app.contacts.lead_score IS
'Auto-generated score 0-100 based on engagement signals (page views, email opens, meeting attendance, etc.).';
COMMENT ON COLUMN app.contacts.last_meeting_id IS
'Reference to the most recent meeting (app.meetings.id) for quick lookup.';
COMMENT ON COLUMN app.contacts.last_call_transcript_id IS
'Reference to the most recent meeting transcription for quick context retrieval.';
COMMENT ON COLUMN app.contacts.ghl_contact_id IS
'GoHighLevel contact ID (for sync with GHL subconta).';

COMMENT ON TABLE app.lifecycle_history IS
'Audit trail of all journey_stage transitions for each contact. Used for analytics and debugging.';

COMMIT;
