-- Migration: 0006_rei_onboarding
-- REI (Revenue Expansion Intelligence) Onboarding — Hybrid framework:
--   Donna Weber Orchestrated Onboarding (O1-O6) + Hormozi 5 Milestones (M0-M5).
-- This migration MUST NOT be applied to Supabase. It is targeted at Cloud SQL.
-- Tenant isolation enforced via `tenant_id` FK to `app.clients(id)`.

BEGIN;

-- =====================================================
-- REI ONBOARDING
-- =====================================================
-- One record per project undergoing the 30-day onboarding journey.
-- Tenant scoping: every row is owned by a tenant (client organization).
-- Cross-tenant reads must be explicitly authorized via app.tenant_memberships.

CREATE TABLE IF NOT EXISTS app.rei_onboarding (
    id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                     UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    rei_project_id                TEXT NOT NULL,                                            -- FK lógica para app.rei_projects.id (sem FK para não bloquear)
    client_name                   TEXT NOT NULL,
    client_email                  TEXT NOT NULL,
    client_company                TEXT NOT NULL,
    product_name                  TEXT NOT NULL,
    product_slug                  TEXT NOT NULL,
    company_slug                  TEXT NOT NULL,
    duration_days                 INTEGER NOT NULL DEFAULT 30 CHECK (duration_days BETWEEN 1 AND 365),
    type                          TEXT NOT NULL DEFAULT 'guided' CHECK (type IN ('self-serve', 'guided', 'done-with-you', 'done-for-you')),
    avg_ticket_range              TEXT NOT NULL DEFAULT '5k-30k',
    cs_lead_name                  TEXT NOT NULL,
    cs_lead_email                 TEXT NOT NULL,
    backup_name                   TEXT,
    backup_email                  TEXT,
    -- Hybrid phase tracking
    current_phase                 TEXT NOT NULL DEFAULT 'O1_EMBARK' CHECK (current_phase IN ('O1_EMBARK', 'O2_HANDOFF', 'O3_KICKOFF', 'O4_ADOPT', 'O5_REVIEW', 'O6_EXPAND')),
    current_milestone             TEXT NOT NULL DEFAULT 'M0_WELCOME' CHECK (current_milestone IN ('M0_WELCOME', 'M1_KICKOFF', 'M2_QUICK_WIN', 'M3_NPS_D14', 'M4_MID_REVIEW', 'M5_WRAP_NPS', 'COMPLETED')),
    -- Key milestones timestamps
    welcome_sent_at               TIMESTAMPTZ,
    kickoff_at                    TIMESTAMPTZ,
    quick_win_delivered_at        TIMESTAMPTZ,
    nps_d14_score                 INTEGER CHECK (nps_d14_score BETWEEN 0 AND 10),
    mid_review_at                 TIMESTAMPTZ,
    wrap_up_at                    TIMESTAMPTZ,
    completed_at                  TIMESTAMPTZ,
    -- Quick win evidence (M2)
    quick_win_description         TEXT,
    quick_win_url                 TEXT,
    quick_win_loom_url            TEXT,
    -- Health metrics
    health_score                  INTEGER NOT NULL DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
    engagement_rate               NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (engagement_rate BETWEEN 0 AND 100),
    churn_risk                    TEXT NOT NULL DEFAULT 'low' CHECK (churn_risk IN ('low', 'medium', 'high')),
    founder_intervention_required BOOLEAN NOT NULL DEFAULT false,
    notes                         TEXT,
    -- Audit columns
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Cross-tenant uniqueness: one onboarding per project per tenant
    CONSTRAINT rei_onboarding_tenant_project_unique UNIQUE (tenant_id, rei_project_id)
);

-- Tenant-scoped indexes (UNIQUE above covers (tenant_id, rei_project_id) lookup).
-- Indexes without tenant are deliberately avoided to discourage non-tenant queries.
CREATE INDEX IF NOT EXISTS idx_rei_onboarding_tenant_phase
    ON app.rei_onboarding (tenant_id, current_phase);
CREATE INDEX IF NOT EXISTS idx_rei_onboarding_tenant_milestone
    ON app.rei_onboarding (tenant_id, current_milestone);
CREATE INDEX IF NOT EXISTS idx_rei_onboarding_tenant_email
    ON app.rei_onboarding (tenant_id, client_email);
CREATE INDEX IF NOT EXISTS idx_rei_onboarding_tenant_kickoff
    ON app.rei_onboarding (tenant_id, kickoff_at DESC NULLS LAST);

-- Triggers
DROP TRIGGER IF EXISTS trg_rei_onboarding_updated_at ON app.rei_onboarding;
CREATE TRIGGER trg_rei_onboarding_updated_at
BEFORE UPDATE ON app.rei_onboarding
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Tenant isolation enforced via RLS (tenant must exist in app.tenant_memberships)
ALTER TABLE app.rei_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.rei_onboarding FORCE ROW LEVEL SECURITY;

CREATE POLICY rei_onboarding_tenant_isolation
    ON app.rei_onboarding
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = rei_onboarding.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = rei_onboarding.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

-- =====================================================
-- REI QUICK WINS
-- =====================================================
-- Historical log of Quick Wins delivered to clients during onboarding.
-- Each Quick Win is a visible, attributable deliverable (Hormozi M2 framework).

CREATE TABLE IF NOT EXISTS app.rei_quick_wins (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    rei_onboarding_id    UUID NOT NULL,                                          -- FK lógica para app.rei_onboarding.id
    title                TEXT NOT NULL,
    description          TEXT NOT NULL,
    category             TEXT NOT NULL DEFAULT 'dashboard' CHECK (category IN ('dashboard', 'audit', 'analysis', 'configuration', 'deliverable', 'training', 'other')),
    deliverable_url      TEXT,
    loom_url             TEXT,
    visible_to_client    BOOLEAN NOT NULL DEFAULT true,
    attributable_to_us   BOOLEAN NOT NULL DEFAULT true,
    estimated_value_brl  NUMERIC(15,2),
    client_acknowledged  BOOLEAN NOT NULL DEFAULT false,
    acknowledged_at      TIMESTAMPTZ,
    delivered_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_by         TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rei_quick_wins_tenant_onboarding
    ON app.rei_quick_wins (tenant_id, rei_onboarding_id);
CREATE INDEX IF NOT EXISTS idx_rei_quick_wins_tenant_category
    ON app.rei_quick_wins (tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_rei_quick_wins_tenant_delivered
    ON app.rei_quick_wins (tenant_id, delivered_at DESC);
-- Partial index for quick win feed (visible only)
CREATE INDEX IF NOT EXISTS idx_rei_quick_wins_tenant_visible
    ON app.rei_quick_wins (tenant_id, delivered_at DESC)
    WHERE visible_to_client = true;

DROP TRIGGER IF EXISTS trg_rei_quick_wins_updated_at ON app.rei_quick_wins;
CREATE TRIGGER trg_rei_quick_wins_updated_at
BEFORE UPDATE ON app.rei_quick_wins
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.rei_quick_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.rei_quick_wins FORCE ROW LEVEL SECURITY;

CREATE POLICY rei_quick_wins_tenant_isolation
    ON app.rei_quick_wins
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = rei_quick_wins.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.tenant_memberships tm
            WHERE tm.tenant_id = rei_quick_wins.tenant_id
            AND tm.user_id = current_setting('app.current_user_id', true)::uuid
            AND tm.status = 'active'
        )
    );

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE app.rei_onboarding IS
'Stores REI onboarding records (hybrid Donna Weber O1-O6 + Hormozi M0-M5). One record per project per tenant undergoing the 30-day onboarding journey.';

COMMENT ON TABLE app.rei_quick_wins IS
'Historical log of Quick Wins delivered to REI clients during the 30-day onboarding journey. Each Quick Win is a visible, attributable deliverable shown to the client (Hormozi M2 framework).';

COMMIT;