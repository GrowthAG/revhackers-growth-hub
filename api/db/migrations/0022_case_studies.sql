-- Migration: 0022_case_studies
-- Cria a tabela app.case_studies para o domínio de cases de sucesso.
-- Idempotente. Sem colunas legadas.
BEGIN;

CREATE TABLE IF NOT EXISTS app.case_studies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    title           VARCHAR(512) NOT NULL,
    slug            VARCHAR(256) NOT NULL,
    client_name     VARCHAR(256) NOT NULL,
    case_category   VARCHAR(128) NOT NULL,
    headline        VARCHAR(512) NOT NULL,
    summary         TEXT,
    client_logo     TEXT,
    challenge       TEXT,
    solution        TEXT,
    results         TEXT,
    cover_image     TEXT,
    metrics         JSONB,
    testimonial     JSONB,
    published       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_case_studies_tenant_slug_unique
    ON app.case_studies (tenant_id, slug);

CREATE INDEX IF NOT EXISTS app_case_studies_published_idx
    ON app.case_studies (published, created_at DESC);

COMMENT ON TABLE app.case_studies IS 'Cases de sucesso publicados. Tenant-scoped via app.clients.';

COMMIT;
