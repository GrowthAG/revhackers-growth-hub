-- Migration: 0019_extend_client_fields
-- Adiciona colunas ao schema app.clients para suportar o frontend ClientFormContent
-- (cnpj, trade_name, cep, address, number, complement, neighborhood, status).
-- Idempotente: cada ALTER usa IF NOT EXISTS para permitir re-execução segura.
--
-- Contexto: Patch 6a da limpeza operacional, para que o frontend possa parar
-- de cair em fallback Supabase após o adapter GCP ser estendido. Sem essas
-- colunas o GCP API rejeita o payload via Zod e o client é silenciosamente
-- enviado para o fallback Supabase (perde o caminho GCP).

BEGIN;

-- ============================================================================
-- app.clients: campos estendidos
-- ============================================================================

ALTER TABLE app.clients
    ADD COLUMN IF NOT EXISTS cnpj        VARCHAR(32),
    ADD COLUMN IF NOT EXISTS trade_name  VARCHAR(256),
    ADD COLUMN IF NOT EXISTS cep         VARCHAR(16),
    ADD COLUMN IF NOT EXISTS address     VARCHAR(512),
    ADD COLUMN IF NOT EXISTS number      VARCHAR(32),
    ADD COLUMN IF NOT EXISTS complement  VARCHAR(128),
    ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(256),
    ADD COLUMN IF NOT EXISTS status      VARCHAR(32) NOT NULL DEFAULT 'onboarding';

-- Backfill safeguard: clientes legados (do backfill/seed anterior) que não
-- tinham `status` usam o default 'onboarding' acima. Essa checagem é um
-- no-op para linhas novas.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conname = 'app_clients_status_check'
    ) THEN
        ALTER TABLE app.clients
            ADD CONSTRAINT app_clients_status_check
            CHECK (status IN ('onboarding', 'active', 'churned'));
    END IF;
END $$;

-- CNPJ tem regra pragmática: 11 dígitos (PF) ou 14 dígitos (PJ). Guardamos
-- normalizado sem máscara para simplificar queries.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conname = 'app_clients_cnpj_format_check'
    ) THEN
        ALTER TABLE app.clients
            ADD CONSTRAINT app_clients_cnpj_format_check
            CHECK (cnpj IS NULL OR cnpj ~ '^[0-9]{11,14}$');
    END IF;
END $$;

COMMENT ON COLUMN app.clients.cnpj         IS 'CNPJ (14 dígitos) ou CPF (11 dígitos), normalizado sem máscara.';
COMMENT ON COLUMN app.clients.trade_name   IS 'Nome fantasia do cliente, distinto do razão social (name).';
COMMENT ON COLUMN app.clients.cep          IS 'CEP normalizado, sem máscara.';
COMMENT ON COLUMN app.clients.address      IS 'Logradouro do cliente.';
COMMENT ON COLUMN app.clients.number       IS 'Número do endereço.';
COMMENT ON COLUMN app.clients.complement   IS 'Complemento do endereço.';
COMMENT ON COLUMN app.clients.neighborhood IS 'Bairro do cliente.';
COMMENT ON COLUMN app.clients.status       IS 'Ciclo de vida: onboarding | active | churned.';

COMMIT;
