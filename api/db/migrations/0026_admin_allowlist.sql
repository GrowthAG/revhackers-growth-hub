-- Migration: Admin Allowlist
-- Bloqueia login Google para emails não autorizados
-- Suporta match exato (email@domain.com) e por domínio (@domain.com)

CREATE TABLE IF NOT EXISTS admin_allowlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_pattern TEXT NOT NULL UNIQUE,
  added_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_pattern CHECK (
    email_pattern LIKE '@%' OR email_pattern LIKE '%@%.%'
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_allowlist_domain 
  ON admin_allowlist (email_pattern) 
  WHERE email_pattern LIKE '@%';

-- Comentários
COMMENT ON TABLE admin_allowlist IS 
  'Allowlist de emails/domínios autorizados a fazer login. Bloqueio automático para não autorizados.';
COMMENT ON COLUMN admin_allowlist.email_pattern IS 
  'Email exato (user@domain.com) ou domínio (@domain.com)';

-- Seed inicial: Giulliano + domínio usefunnels.io + revhackers
INSERT INTO admin_allowlist (email_pattern) VALUES
  ('giulliano@usefunnels.io'),
  ('@usefunnels.io'),
  ('giulliano@revhackers.com.br')
ON CONFLICT (email_pattern) DO NOTHING;
