-- Migration: 0024_create_growthmap_shares
-- Links de compartilhamento público persistentes (GrowthMap).
-- Substitui o store em memória do intelligence-routes: tokens shr_* eram
-- perdidos a cada restart/scale/redeploy do Cloud Run.
--
-- Padrão de capacidade (contracts/identity.ts: LinkCapability): token opaco,
-- escopo mínimo (leitura de um projeto), expiração e revogação. A leitura
-- pública é autorizada apenas pela posse do token — policies de SELECT/UPDATE
-- por match exato de token, sem contexto de tenant.

BEGIN;

CREATE TABLE IF NOT EXISTS app.growthmap_shares (
    share_token  TEXT PRIMARY KEY,
    tenant_id    UUID NOT NULL REFERENCES app.clients(id) ON DELETE CASCADE,
    -- project_id é TEXT (não UUID): o contrato da rota aceita ids de até 128
    -- caracteres e o admin ainda usa placeholder 'demo-project' em staging.
    project_id   TEXT NOT NULL,
    created_by   TEXT NOT NULL,
    expires_at   TIMESTAMPTZ,
    revoked      BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growthmap_shares_tenant_project
    ON app.growthmap_shares (tenant_id, project_id);

DROP TRIGGER IF EXISTS trg_growthmap_shares_updated_at ON app.growthmap_shares;
CREATE TRIGGER trg_growthmap_shares_updated_at
BEFORE UPDATE ON app.growthmap_shares
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.growthmap_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.growthmap_shares FORCE ROW LEVEL SECURITY;

-- Operações administrativas (criação/revogação com contexto de tenant).
DROP POLICY IF EXISTS growthmap_shares_tenant_isolation ON app.growthmap_shares;
CREATE POLICY growthmap_shares_tenant_isolation ON app.growthmap_shares
FOR ALL TO PUBLIC
USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- Leitura pública por capacidade (GET sem auth): somente quem possui o token
-- consegue ler exatamente a linha correspondente.
DROP POLICY IF EXISTS growthmap_shares_public_token_read ON app.growthmap_shares;
CREATE POLICY growthmap_shares_public_token_read ON app.growthmap_shares
FOR SELECT TO PUBLIC
USING (share_token = NULLIF(current_setting('app.share_token', true), ''));

-- Revogação por capacidade (DELETE sem auth): portador do token só pode
-- invalidar o próprio link (sem elevação de privilégio).
DROP POLICY IF EXISTS growthmap_shares_public_token_revoke ON app.growthmap_shares;
CREATE POLICY growthmap_shares_public_token_revoke ON app.growthmap_shares
FOR UPDATE TO PUBLIC
USING (share_token = NULLIF(current_setting('app.share_token', true), ''))
WITH CHECK (share_token = NULLIF(current_setting('app.share_token', true), ''));

COMMENT ON TABLE app.growthmap_shares IS
'Persistent GrowthMap public share links (capability tokens). Replaces in-memory store.';

COMMIT;
