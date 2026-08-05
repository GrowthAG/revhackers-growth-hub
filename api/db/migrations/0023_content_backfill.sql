-- Migration: 0023_content_backfill
-- Prepara slots para backfill das tabelas de conteúdo (blog, materials, cases)
-- a partir do Supabase. Esta migration NÃO importa os dados — apenas:
--   1. Cria índice de mapeamento organization_id (Supabase) → tenant_id (GCP).
--   2. Habilita extensão uuid-ossp se necessário (gen_random_uuid já vem do pgcrypto).
--   3. Cria uma view de staging que será populada por script externo.
--
-- IMPORTANTE: a migration das linhas em si é feita por
-- scripts/supabase-content-export.ts (lê do Supabase PostgREST) +
-- scripts/supabase-content-import.ts (insere no Cloud SQL via pg).
-- Não há como fazer backfill 100% Supabase→GCP via SQL puro porque os bancos
-- não compartilham conexão.

BEGIN;

-- Garante pgcrypto para gen_random_uuid (já habilita em migrations 0001+).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- View de staging: cada linha representa um mapeamento de org_id (Supabase)
-- para client_id (GCP). Populada manualmente ou pelo script de backfill.
-- Apenas um tenant de RevHackers está configurado (migrations 0018+).
CREATE TABLE IF NOT EXISTS app._content_org_to_tenant (
    source_organization_id  UUID PRIMARY KEY,
    target_tenant_id        UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    backfilled_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS app_content_org_to_tenant_target_idx
    ON app._content_org_to_tenant (target_tenant_id);

COMMENT ON TABLE app._content_org_to_tenant IS
'Mapeamento de organization_id (Supabase legadas) para tenant_id (GCP app.clients).
Populado pelo script de backfill. A coluna backfilled_at é setada quando o
tenant inteiro termina de ser importado. A tabela é temporária e deve ser
dropada após a migração (DROP TABLE após Gate A do checklist de decommission).';

-- Trigger que marca a view como pronta quando a última linha de conteúdo
-- de um tenant for inserida. Mantém o controle transacional.
CREATE OR REPLACE FUNCTION app._mark_org_backfilled() RETURNS TRIGGER AS $$
DECLARE
    v_total  BIGINT;
    v_done   BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM app.blog_articles
    WHERE tenant_id = NEW.tenant_id
       OR id::text IN (
           SELECT source_organization_id::text
             FROM app._content_org_to_tenant
            WHERE target_tenant_id = NEW.tenant_id
       );
    SELECT COUNT(*) INTO v_done
    FROM app.blog_articles
    WHERE tenant_id = NEW.tenant_id;

    IF v_total = v_done AND v_total > 0 THEN
        UPDATE app._content_org_to_tenant
           SET backfilled_at = now()
         WHERE target_tenant_id = NEW.tenant_id
           AND backfilled_at IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_articles_backfilled ON app.blog_articles;
CREATE TRIGGER blog_articles_backfilled
    AFTER INSERT ON app.blog_articles
    FOR EACH ROW
    EXECUTE FUNCTION app._mark_org_backfilled();

COMMIT;
