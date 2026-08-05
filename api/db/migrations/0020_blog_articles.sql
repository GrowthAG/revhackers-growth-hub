-- Migration: 0020_blog_articles
-- Cria a tabela app.blog_articles para o domínio de conteúdo público do blog.
-- Idempotente. Sem colunas legadas — o GCP API é a única fonte de verdade.
BEGIN;

CREATE TABLE IF NOT EXISTS app.blog_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    title           VARCHAR(512) NOT NULL,
    slug            VARCHAR(256) NOT NULL,
    category        VARCHAR(128) NOT NULL,
    excerpt         TEXT,
    content         TEXT NOT NULL,
    image           TEXT,
    author_id       UUID NOT NULL REFERENCES app.internal_users(id) ON DELETE RESTRICT,
    published       BOOLEAN NOT NULL DEFAULT false,
    featured        BOOLEAN NOT NULL DEFAULT false,
    read_time       VARCHAR(32),
    date            TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_blog_articles_tenant_slug_unique
    ON app.blog_articles (tenant_id, slug);

CREATE INDEX IF NOT EXISTS app_blog_articles_published_idx
    ON app.blog_articles (published, date DESC);

COMMENT ON TABLE app.blog_articles IS 'Artigos do blog institucional. Tenant-scoped via app.clients.';

COMMIT;
