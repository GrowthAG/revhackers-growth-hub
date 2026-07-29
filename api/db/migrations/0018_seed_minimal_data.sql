-- Migration: 0018_seed_minimal_data
-- Popula dados mínimos para smoke tests em Staging.
--
-- ⚠️ NÃO APLICAR EM PRODUÇÃO ⚠️
-- Esta migration é exclusiva para Cloud SQL Staging. Use
-- `cloudbuild-staging.yaml` (target staging) ou execute manualmente após
-- confirmar o ambiente: `gcloud sql connect revhackers-staging < 0018_seed_minimal_data.sql`.
--
-- Idempotente: usa `ON CONFLICT DO NOTHING` em todos os seeds para permitir
-- re-execução segura em qualquer ambiente que já tenha dados parciais.
--
-- O que é criado:
--   1. 1 internal_user (admin) vinculado ao Google Identity de staging
--   2. 1 tenant (client) com UUID fixo `11111111-1111-4111-8111-111111111111`
--      (mesmo UUID usado em DEFAULT_STAGING_TENANT_ID no código)
--   3. 1 tenant_membership ligando admin ao tenant
--   4. 1 rei_project de exemplo para smoke do cockpit REI
--   5. 1 client record para smoke do fluxo de clientes

BEGIN;

-- ============================================================================
-- 1. Internal User (Admin)
-- ============================================================================
INSERT INTO app.internal_users (id, global_role, status)
VALUES (
    '22222222-2222-4222-8222-222222222222',
    'super_admin',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. User Identity (link do Google Identity Token → internal_user)
-- ============================================================================
-- O issuer/subject aqui é fictício para staging. Em produção real,
-- o first-login do OAuth Google cria este registro via auth-middleware.
INSERT INTO app.user_identities (issuer, subject, user_id)
VALUES (
    'https://accounts.google.com',
    'staging-admin@revhackers.com.br',
    '22222222-2222-4222-8222-222222222222'
)
ON CONFLICT (issuer, subject) DO NOTHING;

-- ============================================================================
-- 3. Tenant (Client Org)
-- ============================================================================
-- UUID fixo = DEFAULT_STAGING_TENANT_ID usado em auth-middleware.ts.
INSERT INTO app.clients (id, name, email, company, country, segment)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'RevHackers Staging Tenant',
    'admin@revhackers.com.br',
    'RevHackers Tecnologia LTDA',
    'Brasil',
    'SaaS B2B'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. Tenant Membership (Admin → Tenant)
-- ============================================================================
INSERT INTO app.tenant_memberships (user_id, tenant_id, role, status)
VALUES (
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'owner',
    'active'
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- ============================================================================
-- 5. REI Project (Smoke Target para /admin/REICockpit)
-- ============================================================================
INSERT INTO app.rei_projects (
    id,
    tenant_id,
    client_id,
    client_name,
    client_email,
    client_company,
    analyst_email,
    last_rei_date,
    next_rei_date,
    quarter,
    year,
    status,
    type,
    tier,
    duration_days,
    scheduling_completed
)
VALUES (
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Tech Corp Soluções (Staging)',
    'cto@tech-corp-staging.com.br',
    'Tech Corp Soluções LTDA',
    'cs-lead@revhackers.com.br',
    now() - INTERVAL '15 days',
    now() + INTERVAL '15 days',
    'Q3',
    2026,
    'active',
    'consulting',
    'paid',
    30,
    true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. REI Onboarding (Smoke Target para /admin/REICockpit onboarding list)
-- ============================================================================
-- Necessário porque app.rei_quick_wins.rei_onboarding_id tem FK CASCADE para cá.
INSERT INTO app.rei_onboarding (
    id,
    tenant_id,
    rei_project_id,
    client_name,
    client_email,
    client_company,
    product_name,
    product_slug,
    company_slug,
    cs_lead_name,
    cs_lead_email,
    current_phase,
    current_milestone,
    duration_days,
    type,
    avg_ticket_range,
    health_score,
    engagement_rate,
    churn_risk
)
VALUES (
    '44444444-4444-4444-8444-444444444444',
    '11111111-1111-4111-8111-111111111111',
    '33333333-3333-4333-8333-333333333333',
    'Tech Corp Soluções (Staging)',
    'cto@tech-corp-staging.com.br',
    'Tech Corp Soluções LTDA',
    'RevHackers REI (Staging)',
    'revhackers-rei-staging',
    'tech-corp-staging',
    'CS Lead Staging',
    'cs-lead@revhackers.com.br',
    'O3_KICKOFF',
    'M2_QUICK_WIN',
    30,
    'guided',
    '5k-30k',
    92,
    78.5,
    'low'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. Lifecycle Hook (smoke /v1/lifecycle/process)
-- ============================================================================
INSERT INTO app.lifecycle_hooks (
    id,
    tenant_id,
    from_stage,
    to_stage,
    action_type,
    action_config,
    is_active,
    priority
)
VALUES (
    '55555555-5555-4555-8555-555555555555',
    '11111111-1111-4111-8111-111111111111',
    'mql',
    'sql',
    'notify_team',
    '{"channel": "#sales-staging", "template": "lead_qualified"}'::jsonb,
    true,
    100
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Comentários
-- ============================================================================
COMMENT ON TABLE app.internal_users IS
'Internal user base. Em staging, populado por 0018 com admin fixo para smoke tests.';
COMMENT ON TABLE app.user_identities IS
'Map Google Identity → internal_user. Criado no first-login real; staging usa subject fixo.';

COMMIT;