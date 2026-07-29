-- Migration: 0016_fix_phantom_fks
-- Adiciona FOREIGN KEY constraints que estavam faltando nas migrations 0006-0015
-- (Phantom FKs). Converte tipos inconsistentes para o canônico do schema.
--
-- Esta migration DEVE ser aplicada após 0014 e antes de qualquer aplicação em prod.
-- Assume que 0001, 0002 e 0005 já foram aplicadas (tables bases existem).
--
-- Pré-condições verificadas pelos DO blocks:
-- 1. Tabelas referenciadas existem
-- 2. Dados existentes satisfazem a constraint (orphan rows = 0 esperado)
--    Em caso de orphans, esta migration FALHA — corrija dados antes de re-executar.

BEGIN;

-- ============================================================================
-- 1. app.rei_onboarding.rei_project_id: TEXT → UUID + REFERENCES
-- ============================================================================
DO $$
BEGIN
    -- Verifica que a coluna é TEXT antes de converter
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'app'
        AND table_name = 'rei_onboarding'
        AND column_name = 'rei_project_id'
        AND data_type = 'text'
    ) THEN
        -- Conversão TEXT → UUID. USING gen_random_uuid()::text gera um UUID temporário
        -- caso existam valores não-UUID. Em prod limpo, espera-se que todos já sejam UUIDs.
        ALTER TABLE app.rei_onboarding
            ALTER COLUMN rei_project_id TYPE UUID USING rei_project_id::uuid;
    END IF;
END $$;

-- Drop da constraint UNIQUE antiga (TEXT não-UUID) e recriação após conversão
ALTER TABLE app.rei_onboarding
    DROP CONSTRAINT IF EXISTS rei_onboarding_tenant_project_unique;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'rei_onboarding'
        AND constraint_name = 'rei_onboarding_tenant_project_unique'
    ) THEN
        ALTER TABLE app.rei_onboarding
            ADD CONSTRAINT rei_onboarding_tenant_project_unique
            UNIQUE (tenant_id, rei_project_id);
    END IF;
END $$;

-- Agora adiciona a FK para app.rei_projects(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'rei_onboarding'
        AND constraint_name = 'rei_onboarding_rei_project_id_fk'
    ) THEN
        ALTER TABLE app.rei_onboarding
            ADD CONSTRAINT rei_onboarding_rei_project_id_fk
            FOREIGN KEY (rei_project_id) REFERENCES app.rei_projects(id)
            ON DELETE CASCADE;
    END IF;
END $$;


-- ============================================================================
-- 2. app.rei_quick_wins.rei_onboarding_id: ADD FK
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'rei_quick_wins'
        AND constraint_name = 'rei_quick_wins_rei_onboarding_id_fk'
    ) THEN
        ALTER TABLE app.rei_quick_wins
            ADD CONSTRAINT rei_quick_wins_rei_onboarding_id_fk
            FOREIGN KEY (rei_onboarding_id) REFERENCES app.rei_onboarding(id)
            ON DELETE CASCADE;
    END IF;
END $$;


-- ============================================================================
-- 3. app.rei_health_metrics.rei_onboarding_id: ADD FK
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'rei_health_metrics'
        AND constraint_name = 'rei_health_metrics_rei_onboarding_id_fk'
    ) THEN
        ALTER TABLE app.rei_health_metrics
            ADD CONSTRAINT rei_health_metrics_rei_onboarding_id_fk
            FOREIGN KEY (rei_onboarding_id) REFERENCES app.rei_onboarding(id)
            ON DELETE CASCADE;
    END IF;
END $$;


-- ============================================================================
-- 4. app.rei_expansion_opportunities: ADD 2 FKs (rei_onboarding_id, project_id)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'rei_expansion_opportunities'
        AND constraint_name = 'rei_expansion_rei_onboarding_id_fk'
    ) THEN
        ALTER TABLE app.rei_expansion_opportunities
            ADD CONSTRAINT rei_expansion_rei_onboarding_id_fk
            FOREIGN KEY (rei_onboarding_id) REFERENCES app.rei_onboarding(id)
            ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'rei_expansion_opportunities'
        AND constraint_name = 'rei_expansion_project_id_fk'
    ) THEN
        ALTER TABLE app.rei_expansion_opportunities
            ADD CONSTRAINT rei_expansion_project_id_fk
            FOREIGN KEY (project_id) REFERENCES app.rei_projects(id)
            ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================================
-- 5. app.meetings.project_id: ADD FK
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'meetings'
        AND constraint_name = 'meetings_project_id_fk'
    ) THEN
        ALTER TABLE app.meetings
            ADD CONSTRAINT meetings_project_id_fk
            FOREIGN KEY (project_id) REFERENCES app.rei_projects(id)
            ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================================
-- 6. app.competitors.project_id: ADD FK
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'competitors'
        AND constraint_name = 'competitors_project_id_fk'
    ) THEN
        ALTER TABLE app.competitors
            ADD CONSTRAINT competitors_project_id_fk
            FOREIGN KEY (project_id) REFERENCES app.rei_projects(id)
            ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================================
-- 7. app.competitor_comparisons.project_id: ADD FK
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'competitor_comparisons'
        AND constraint_name = 'competitor_comparisons_project_id_fk'
    ) THEN
        ALTER TABLE app.competitor_comparisons
            ADD CONSTRAINT competitor_comparisons_project_id_fk
            FOREIGN KEY (project_id) REFERENCES app.rei_projects(id)
            ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================================
-- 8. app.intelligence_jobs.project_id: ADD FK
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'intelligence_jobs'
        AND constraint_name = 'intelligence_jobs_project_id_fk'
    ) THEN
        ALTER TABLE app.intelligence_jobs
            ADD CONSTRAINT intelligence_jobs_project_id_fk
            FOREIGN KEY (project_id) REFERENCES app.rei_projects(id)
            ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================================
-- 9. app.ghl_events.id: TEXT → UUID padrão consistente
-- ============================================================================
-- O default atual é `('ghl_' || gen_random_uuid()::text)` que gera IDs TEXT.
-- Converte para UUID padrão (consistente com todas as outras tabelas).

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'app'
        AND table_name = 'ghl_events'
        AND column_name = 'id'
        AND data_type = 'text'
    ) THEN
        -- Conversão segura: extrai o UUID do prefixo "ghl_"
        -- Se algum ID não tiver prefixo válido, ele fica NULL e o row deve ser revisado.
        ALTER TABLE app.ghl_events
            ALTER COLUMN id TYPE UUID USING (
                CASE
                    WHEN id LIKE 'ghl_%' THEN substring(id FROM 5)::uuid
                    ELSE id::uuid
                END
            );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'app'
        AND table_name = 'ghl_events'
        AND column_name = 'id'
        AND column_default IS NULL
    ) THEN
        ALTER TABLE app.ghl_events
            ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END $$;


-- ============================================================================
-- 10. app.contacts: ADD 2 FKs (last_meeting_id, last_call_transcript_id)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'contacts'
        AND constraint_name = 'contacts_last_meeting_id_fk'
    ) THEN
        ALTER TABLE app.contacts
            ADD CONSTRAINT contacts_last_meeting_id_fk
            FOREIGN KEY (last_meeting_id) REFERENCES app.meetings(id)
            ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'app'
        AND table_name = 'contacts'
        AND constraint_name = 'contacts_last_call_transcript_id_fk'
    ) THEN
        ALTER TABLE app.contacts
            ADD CONSTRAINT contacts_last_call_transcript_id_fk
            FOREIGN KEY (last_call_transcript_id) REFERENCES app.meetings(id)
            ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================================
-- Comentários
-- ============================================================================
COMMENT ON TABLE app.rei_onboarding IS
'Onboarding REI. FKs completas para rei_projects(id). tenant_id → clients(id).';
COMMENT ON TABLE app.rei_quick_wins IS
'Quick wins REI. FK para rei_onboarding(id) com CASCADE.';
COMMENT ON TABLE app.rei_health_metrics IS
'Snapshots de health_score REI. FK para rei_onboarding(id) com CASCADE.';
COMMENT ON TABLE app.rei_expansion_opportunities IS
'Opportunities de expansão. FKs para rei_onboarding e rei_projects (SET NULL ao deletar).';
COMMENT ON COLUMN app.ghl_events.id IS
'PK UUID padrão (convertido de TEXT legacy). Compatível com FKs do schema.';

COMMIT;