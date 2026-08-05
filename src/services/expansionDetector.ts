/**
 * Expansion Opportunity Detector
 * 
 * Detecta automaticamente oportunidades de upsell/expansion baseado em:
 * 1. Uso intenso de frameworks (regenerations > 5x)
 * 2. Compartilhamentos públicos frequentes (shares > 10)
 * 3. Enriquecimento de concorrentes (enriched > 5)
 * 4. Tempo pós-onboarding sem renewal (D30+)
 * 
 * Executado via cron job ou webhook após ações relevantes
 */

import { supabase } from '@/integrations/supabase/client';

export type OpportunityType = 'upsell_framework' | 'add_user' | 'premium_tier' | 'renewal';

interface OpportunityMetrics {
  framework_regenerations?: number;
  public_shares?: number;
  enriched_competitors?: number;
  days_since_onboarding?: number;
  threshold: number;
}

interface DetectedOpportunity {
  tenant_id: string;
  rei_project_id: string;
  opportunity_type: OpportunityType;
  reason: string;
  metrics: OpportunityMetrics;
}

/**
 * Detecta oportunidades de upsell para um projeto REI específico
 */
export async function detectExpansionOpportunities(
  projectId: string,
  tenantId: string
): Promise<DetectedOpportunity[]> {
  const opportunities: DetectedOpportunity[] = [];

  try {
    // Buscar dados do projeto
    const { data: project, error: projectError } = await supabase
      .from('rei_projects')
      .select('*')
      .eq('id', projectId)
      .eq('tenant_id', tenantId)
      .single();

    if (projectError || !project) {
      console.error('Erro ao buscar projeto:', projectError);
      return [];
    }

    // 1. Verificar regenerações de frameworks
    const frameworkRegens = await countFrameworkRegenerations(projectId);
    if (frameworkRegens > 5) {
      const existing = await checkExistingOpportunity(
        projectId, 
        tenantId, 
        'upsell_framework'
      );
      
      if (!existing) {
        opportunities.push({
          tenant_id: tenantId,
          rei_project_id: projectId,
          opportunity_type: 'upsell_framework',
          reason: `Cliente regenerou frameworks ${frameworkRegens}x (threshold: 5x)`,
          metrics: {
            framework_regenerations: frameworkRegens,
            threshold: 5,
          },
        });
      }
    }

    // 2. Verificar compartilhamentos públicos
    const publicShares = await countPublicShares(projectId, tenantId);
    if (publicShares > 10) {
      const existing = await checkExistingOpportunity(
        projectId, 
        tenantId, 
        'add_user'
      );
      
      if (!existing) {
        opportunities.push({
          tenant_id: tenantId,
          rei_project_id: projectId,
          opportunity_type: 'add_user',
          reason: `Cliente gerou ${publicShares} shares públicos (threshold: 10)`,
          metrics: {
            public_shares: publicShares,
            threshold: 10,
          },
        });
      }
    }

    // 3. Verificar concorrentes enriquecidos
    const enrichedCompetitors = await countEnrichedCompetitors(projectId, tenantId);
    if (enrichedCompetitors > 5) {
      const existing = await checkExistingOpportunity(
        projectId, 
        tenantId, 
        'premium_tier'
      );
      
      if (!existing) {
        opportunities.push({
          tenant_id: tenantId,
          rei_project_id: projectId,
          opportunity_type: 'premium_tier',
          reason: `Cliente enriqueceu ${enrichedCompetitors} concorrentes (threshold: 5)`,
          metrics: {
            enriched_competitors: enrichedCompetitors,
            threshold: 5,
          },
        });
      }
    }

    // 4. Verificar renewal (D30 pós-onboarding)
    if (project.status === 'active' && project.onboarding_completed_at) {
      const daysSinceOnboarding = daysSince(project.onboarding_completed_at);
      if (daysSinceOnboarding >= 30) {
        const existing = await checkExistingOpportunity(
          projectId, 
          tenantId, 
          'renewal'
        );
        
        if (!existing) {
          opportunities.push({
            tenant_id: tenantId,
            rei_project_id: projectId,
            opportunity_type: 'renewal',
            reason: `D${daysSinceOnboarding} pós-onboarding sem renovação`,
            metrics: {
              days_since_onboarding: daysSinceOnboarding,
              threshold: 30,
            },
          });
        }
      }
    }

    // Inserir oportunidades detectadas
    if (opportunities.length > 0) {
      await insertOpportunities(opportunities);
    }

    return opportunities;
  } catch (error) {
    console.error('Erro ao detectar oportunidades:', error);
    return [];
  }
}

/**
 * Conta regenerações de frameworks (via framework_audit_log)
 */
async function countFrameworkRegenerations(projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from('framework_audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('action', 'regenerate');

  if (error) {
    console.error('Erro ao contar regenerações:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Conta compartilhamentos públicos gerados
 */
async function countPublicShares(projectId: string, tenantId: string): Promise<number> {
  const { data, error } = await supabase
    .from('growthmap_shares')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Erro ao contar shares:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Conta concorrentes enriquecidos com dados do FonteData
 */
async function countEnrichedCompetitors(projectId: string, tenantId: string): Promise<number> {
  const { data, error } = await supabase
    .from('competitors')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('tenant_id', tenantId)
    .eq('enrichment_status', 'enriched');

  if (error) {
    console.error('Erro ao contar concorrentes enriquecidos:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Verifica se já existe oportunidade do mesmo tipo para o projeto
 */
async function checkExistingOpportunity(
  projectId: string,
  tenantId: string,
  opportunityType: OpportunityType
): Promise<boolean> {
  const { data, error } = await supabase
    .from('rei_expansion_opportunities')
    .select('id')
    .eq('rei_project_id', projectId)
    .eq('tenant_id', tenantId)
    .eq('opportunity_type', opportunityType)
    .in('status', ['new', 'reviewed', 'proposed'])
    .limit(1);

  if (error) {
    console.error('Erro ao verificar oportunidade existente:', error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Insere oportunidades detectadas no banco
 */
async function insertOpportunities(opportunities: DetectedOpportunity[]): Promise<void> {
  const { error } = await supabase
    .from('rei_expansion_opportunities')
    .insert(opportunities);

  if (error) {
    console.error('Erro ao inserir oportunidades:', error);
  }
}

/**
 * Calcula dias desde uma data
 */
function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Lista oportunidades ativas de um tenant
 */
export async function listExpansionOpportunities(
  tenantId: string,
  status: string[] = ['new', 'reviewed', 'proposed']
): Promise<any[]> {
  const { data, error } = await supabase
    .from('rei_expansion_opportunities')
    .select(`
      *,
      rei_projects:rei_project_id(name, client_name, status),
      assigned_user:assigned_to(full_name)
    `)
    .eq('tenant_id', tenantId)
    .in('status', status)
    .order('detected_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar oportunidades:', error);
    return [];
  }

  return data || [];
}

/**
 * Atualiza status de uma oportunidade
 */
export async function updateOpportunityStatus(
  opportunityId: string,
  status: string,
  notes?: string,
  proposalAmount?: number
): Promise<void> {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'proposed') {
    updates.proposed_at = new Date().toISOString();
    updates.proposal_amount = proposalAmount;
    updates.proposal_notes = notes;
  }

  if (['won', 'lost', 'dismissed'].includes(status)) {
    updates.resolved_at = new Date().toISOString();
    updates.resolution_notes = notes;
  }

  if (notes && !['won', 'lost', 'dismissed'].includes(status)) {
    updates.resolution_notes = notes;
  }

  const { error } = await supabase
    .from('rei_expansion_opportunities')
    .update(updates)
    .eq('id', opportunityId);

  if (error) {
    console.error('Erro ao atualizar status:', error);
  }
}
