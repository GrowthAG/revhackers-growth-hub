-- Migration: 0017_fix_rls_consistency
-- Padroniza todas as políticas RLS no padrão `tenant_id = current_setting('app.tenant_id')`
-- (mais performático que EXISTS em tenant_memberships — evita N+1 no engine RLS).
-- Adiciona FORCE ROW LEVEL SECURITY em tabelas de autorização (internal_users, tenant_memberships).
-- Adiciona índices compostos críticos para queries de produção.
--
-- Esta migration DEVE ser aplicada após 0006-0015 (todas as tabelas alvo existem).
-- Pré-condição: a API chama `SET LOCAL app.tenant_id = ...` no início de cada transação.

BEGIN;

-- ============================================================================
-- 1. Tabelas que precisam do padrão uniforme de RLS (0006-0015)
-- ============================================================================
-- Lista de tabelas que devem usar `tenant_id = current_setting('app.tenant_id', true)::uuid`:
--   app.rei_onboarding, app.rei_quick_wins, app.rei_health_metrics,
--   app.competitors, app.competitor_intelligence, app.competitor_comparisons,
--   app.market_signals, app.intelligence_jobs, app.intelligence_findings,
--   app.rei_expansion_opportunities, app.meetings, app.ghl_events,
--   app.lifecycle_history, app.lifecycle_hooks, app.lifecycle_hook_logs

-- Helper: recria a policy padrão
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'rei_onboarding',
        'rei_quick_wins',
        'rei_health_metrics',
        'competitors',
        'competitor_intelligence',
        'competitor_comparisons',
        'market_signals',
        'intelligence_jobs',
        'intelligence_findings',
        'rei_expansion_opportunities',
        'meetings',
        'ghl_events',
        'lifecycle_history',
        'lifecycle_hooks',
        'lifecycle_hook_logs'
    ];
    policy_name TEXT;
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        policy_name := tbl || '_tenant_isolation';

        -- Drop da policy antiga (EXISTS-based) se existir
        EXECUTE format('DROP POLICY IF EXISTS %I ON app.%I', policy_name, tbl);

        -- Cria a policy nova (tenant_id direto, mais performática)
        EXECUTE format(
            'CREATE POLICY %I ON app.%I FOR ALL TO PUBLIC '
            'USING (tenant_id = NULLIF(current_setting(''app.tenant_id'', true), '''')::uuid) '
            'WITH CHECK (tenant_id = NULLIF(current_setting(''app.tenant_id'', true), '''')::uuid)',
            policy_name, tbl
        );
    END LOOP;
END $$;


-- ============================================================================
-- 2. FORCE ROW LEVEL SECURITY em tabelas de autorização
-- ============================================================================
-- internal_users e tenant_memberships são o source-of-truth de identidade e
-- memberships. Sem FORCE RLS, o role owner (PostgreSQL) poderia bypassar.

ALTER TABLE app.internal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.internal_users FORCE ROW LEVEL SECURITY;

ALTER TABLE app.tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.tenant_memberships FORCE ROW LEVEL SECURITY;

-- Policies de auth: usuários só veem seus próprios dados (user_id match)
DROP POLICY IF EXISTS internal_users_self_access ON app.internal_users;
CREATE POLICY internal_users_self_access ON app.internal_users
    FOR ALL TO PUBLIC
    USING (id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    WITH CHECK (id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

-- tenant_memberships: usuário vê memberships dos tenants que ele pertence
DROP POLICY IF EXISTS tenant_memberships_self_access ON app.tenant_memberships;
CREATE POLICY tenant_memberships_self_access ON app.tenant_memberships
    FOR ALL TO PUBLIC
    USING (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        AND status = 'active'
    )
    WITH CHECK (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        AND status = 'active'
    );


-- ============================================================================
-- 3. Índices compostos críticos para queries de produção
-- ============================================================================

-- rei_projects: queries típicas filtram por tenant + status (ex: "projetos ativos do tenant")
CREATE INDEX IF NOT EXISTS idx_rei_projects_tenant_status
    ON app.rei_projects (tenant_id, status)
    WHERE deleted_at IS NULL;

-- rei_projects: filtro por tenant + type (consulting/crm_ops/site/etc)
CREATE INDEX IF NOT EXISTS idx_rei_projects_tenant_type
    ON app.rei_projects (tenant_id, type)
    WHERE deleted_at IS NULL;

-- rei_materials: queries por tenant + project_id (já existe idx_rei_materials_project mas falta composto)
CREATE INDEX IF NOT EXISTS idx_rei_materials_tenant_project
    ON app.rei_materials (tenant_id, project_id);

-- tenant_memberships: lookup por user_id (FALTAVA, índice composto (tenant_id, user_id) não cobre)
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user
    ON app.tenant_memberships (user_id)
    WHERE status = 'active';

-- lifecycle_history: query típica é "histórico de um contato ordenado por tempo"
-- O índice idx_lifecycle_history_tenant_contact já existe (0008), mas
-- adicionamos (tenant_id, contact_id, transitioned_at DESC) para suportar
-- paginação eficiente.
CREATE INDEX IF NOT EXISTS idx_lifecycle_history_tenant_contact_time
    ON app.lifecycle_history (tenant_id, contact_id, transitioned_at DESC);

-- lifecycle_hook_logs: query por hook_id (debugging de execuções específicas)
CREATE INDEX IF NOT EXISTS idx_lifecycle_hook_logs_tenant_hook
    ON app.lifecycle_hook_logs (tenant_id, hook_id, executed_at DESC);


-- ============================================================================
-- 4. Comentários
-- ============================================================================
COMMENT ON POLICY rei_onboarding_tenant_isolation ON app.rei_onboarding IS
'RLS padronizado: tenant_id resolvido por session var. Sem subquery N+1 em tenant_memberships.';
COMMENT ON POLICY tenant_memberships_self_access ON app.tenant_memberships IS
'Usuário só vê memberships onde ele é o próprio user_id. Source-of-truth de autorização.';
COMMENT ON INDEX idx_rei_projects_tenant_status IS
'Suporta queries do tipo "projetos ativos do tenant" sem Seq Scan.';
COMMENT ON INDEX idx_tenant_memberships_user IS
'Suporta lookup reverso memberships-por-usuário sem Seq Scan (RLS N+1 avoidance).';

COMMIT;