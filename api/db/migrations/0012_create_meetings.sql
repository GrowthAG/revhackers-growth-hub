-- Migration: 0012_create_meetings
-- Stores meeting transcriptions + analysis (replaces supabase/functions/process-meeting-audio).
-- Tenant-scoped via app.clients(id) with RLS isolation.

BEGIN;

CREATE TABLE IF NOT EXISTS app.meetings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    project_id              UUID,
    created_by              TEXT NOT NULL,                                          -- email do user que fez upload
    -- Transcription
    transcript_text         TEXT NOT NULL,
    transcript_segments      JSONB DEFAULT '[]'::jsonb,
    language                TEXT DEFAULT 'pt',
    -- Analysis (OpenAI Structured Outputs)
    analysis_summary        TEXT,
    analysis_topics         JSONB DEFAULT '[]'::jsonb,
    analysis_action_items   JSONB DEFAULT '[]'::jsonb,
    analysis_sentiment      TEXT,
    analysis_meeting_type   TEXT,
    analysis_next_steps     JSONB DEFAULT '[]'::jsonb,
    analysis_key_quotes      JSONB DEFAULT '[]'::jsonb,
    -- Audio metadata
    audio_duration_seconds  INTEGER,
    audio_mime_type         TEXT,
    audio_source            TEXT,
    -- Lifecycle
    status                  TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
    error_message           TEXT,
    -- Audit
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_tenant_project
    ON app.meetings (tenant_id, project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_tenant_type
    ON app.meetings (tenant_id, analysis_meeting_type);
CREATE INDEX IF NOT EXISTS idx_meetings_tenant_created
    ON app.meetings (tenant_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_meetings_updated_at ON app.meetings;
CREATE TRIGGER trg_meetings_updated_at
BEFORE UPDATE ON app.meetings
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.meetings FORCE ROW LEVEL SECURITY;

CREATE POLICY meetings_tenant_isolation
    ON app.meetings
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = meetings.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = meetings.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE app.meetings IS
'Stores meeting transcriptions + AI analysis. Replaces Supabase Edge Function process-meeting-audio. Tenant-scoped via RLS.';

COMMIT;
