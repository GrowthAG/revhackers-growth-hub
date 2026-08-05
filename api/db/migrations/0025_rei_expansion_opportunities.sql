-- Migration: 0025_rei_expansion_opportunities
-- Rastreia oportunidades de upsell/expansion detectadas automaticamente
-- Baseado em: uso intenso de frameworks, compartilhamentos, PDFs, tempo pós-onboarding
--
-- Objetivo: Time de CS vê oportunidades automaticamente no cockpit
-- Gatilhos:
--   1. Cliente regenerou frameworks >5x → upsell_framework
--   2. Cliente gerou >10 shares públicos → add_user (mais seats)
--   3. Cliente enriqueceu >5 concorrentes → premium_tier
--   4. D30 pós-onboarding sem renewal → renewal_opportunity

CREATE TABLE IF NOT EXISTS rei_expansion_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rei_project_id UUID NOT NULL REFERENCES rei_projects(id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN (
    'upsell_framework',
    'add_user',
    'premium_tier',
    'renewal'
  )),
  
  -- Dados que justificam a oportunidade
  reason TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  -- Ex: {framework_regenerations: 8, threshold: 5}
  -- Ex: {public_shares: 15, threshold: 10}
  
  -- Status do pipeline de vendas
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new',           -- Detectada automaticamente
    'reviewed',      -- CS viu e validou
    'proposed',      -- Proposta enviada ao cliente
    'won',           -- Cliente aceitou upsell
    'lost',          -- Cliente recusou
    'dismissed'      -- Falso positivo, ignorar
  )),
  
  -- Quem está gerenciando esta oportunidade
  assigned_to UUID REFERENCES users(id),
  
  -- Quando foi proposta (se status = proposed)
  proposed_at TIMESTAMPTZ,
  proposal_amount NUMERIC(12,2), -- Valor do upsell proposto
  proposal_notes TEXT,
  
  -- Quando foi resolvida (won/lost/dismissed)
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Metadata
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_expansion_tenant_status 
  ON rei_expansion_opportunities(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_expansion_project 
  ON rei_expansion_opportunities(rei_project_id);

CREATE INDEX IF NOT EXISTS idx_expansion_assigned 
  ON rei_expansion_opportunities(assigned_to) 
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expansion_new 
  ON rei_expansion_opportunities(tenant_id) 
  WHERE status = 'new';

-- Trigger para updated_at
CREATE TRIGGER update_rei_expansion_opportunities_updated_at
  BEFORE UPDATE ON rei_expansion_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: CS só vê oportunidades do próprio tenant
ALTER TABLE rei_expansion_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CS can view own tenant opportunities"
  ON rei_expansion_opportunities FOR SELECT
  USING (tenant_id = current_tenant_id());

CREATE POLICY "System can insert opportunities"
  ON rei_expansion_opportunities FOR INSERT
  WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "CS can update own tenant opportunities"
  ON rei_expansion_opportunities FOR UPDATE
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Comentários
COMMENT ON TABLE rei_expansion_opportunities IS 
  'Oportunidades de upsell/expansion detectadas automaticamente para clientes REI';

COMMENT ON COLUMN rei_expansion_opportunities.opportunity_type IS
  'Tipo: upsell_framework (mais frameworks), add_user (mais seats), premium_tier (upgrade), renewal (renovação)';

COMMENT ON COLUMN rei_expansion_opportunities.metrics IS
  'Dados quantitativos que justificam a oportunidade (ex: {framework_regenerations: 8, threshold: 5})';

COMMENT ON COLUMN rei_expansion_opportunities.status IS
  'Pipeline: new → reviewed → proposed → won/lost/dismissed';
