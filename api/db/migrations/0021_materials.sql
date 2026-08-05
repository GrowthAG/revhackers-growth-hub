-- Migration: 0021_materials
-- Cria a tabela app.materials para o domínio de materiais (whitepapers, templates, e-books).
-- Idempotente. Sem colunas legadas.
BEGIN;

CREATE TABLE IF NOT EXISTS app.materials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    material_name   VARCHAR(512) NOT NULL,
    slug            VARCHAR(256) NOT NULL,
    material_type   VARCHAR(64) NOT NULL,
    description     TEXT,
    link_material   TEXT,
    material_url    TEXT,
    published       BOOLEAN NOT NULL DEFAULT true,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_materials_tenant_slug_unique
    ON app.materials (tenant_id, slug);

CREATE INDEX IF NOT EXISTS app_materials_published_idx
    ON app.materials (published, is_active);

COMMENT ON TABLE app.materials IS 'Materiais para download. Tenant-scoped via app.clients.';

COMMIT;
