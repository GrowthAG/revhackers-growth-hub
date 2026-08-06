-- Migration 0026: AI prompts versionados + log de uso
--
-- Cria schema app.ai_prompts (versionado) e app.ai_usage_log (auditoria).
-- Ref: docs/architecture/gcp-migration/ai-supabase-to-gcp-migration.md
-- Wave 1 — Supabase edge functions → GCP Cloud Run AI handlers.

CREATE SCHEMA IF NOT EXISTS app;

-- Prompts versionados por edge function + chave
CREATE TABLE IF NOT EXISTS app.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edge_function TEXT NOT NULL,
  prompt_key TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  body TEXT NOT NULL,
  model TEXT,
  provider TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (edge_function, prompt_key, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_lookup
  ON app.ai_prompts (edge_function, prompt_key, active, version DESC);

-- Log de uso (auditoria e métricas)
CREATE TABLE IF NOT EXISTS app.ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edge_function TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  user_id UUID,
  tenant_id UUID,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  input_tokens INT,
  output_tokens INT,
  latency_ms INT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_created
  ON app.ai_usage_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user
  ON app.ai_usage_log (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant
  ON app.ai_usage_log (tenant_id, created_at DESC)
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_usage_function
  ON app.ai_usage_log (edge_function, created_at DESC);

-- Trigger de updated_at em ai_prompts
CREATE OR REPLACE FUNCTION app.touch_ai_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_prompts_touch ON app.ai_prompts;
CREATE TRIGGER trg_ai_prompts_touch
  BEFORE UPDATE ON app.ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION app.touch_ai_prompts_updated_at();

-- Seed: prompts iniciais só com marker (handlers trazem fallback no código).
-- Permite migrar prompts do código para o banco sem deploy quando necessário.
INSERT INTO app.ai_prompts (edge_function, prompt_key, version, body, model, provider, active)
VALUES
  ('analyze-diagnostic', 'growth', 1, '__FALLBACK_TO_CODE__', NULL, 'minimax', true),
  ('analyze-diagnostic', 'revenue', 1, '__FALLBACK_TO_CODE__', NULL, 'minimax', true),
  ('analyze-diagnostic', 'founder', 1, '__FALLBACK_TO_CODE__', NULL, 'minimax', true),
  ('generate-growthmap', 'swot', 1, '__FALLBACK_TO_CODE__', NULL, 'minimax', true),
  ('generate-growthmap', 'tam_sam_som', 1, '__FALLBACK_TO_CODE__', NULL, 'minimax', true)
ON CONFLICT (edge_function, prompt_key, version) DO NOTHING;
