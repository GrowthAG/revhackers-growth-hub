import { authenticatedRequest } from './_base';

const INTELLIGENCE_BASE = '/v1/intelligence';

async function intelligenceRequest(path: string, init?: RequestInit): Promise<Response> {
  return authenticatedRequest(`${INTELLIGENCE_BASE}${path}`, init);
}

export type SPICategory = 'MICRO' | 'EMERGING' | 'SCALEUP' | 'ENTERPRISE';
export type OFSRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type EnrichmentStatus = 'pending' | 'processing' | 'enriched' | 'failed';
export type MarketSignalType = 'news' | 'funding' | 'launch' | 'pricing_change' | 'hiring' | 'partnership' | 'acquisition' | 'other';

export interface CompetitorView { id: string; tenant_id: string; project_id: string; name: string; cnpj: string | null; website: string | null; segment: string | null; cnae_primary: string | null; notes: string | null; is_active: boolean; is_priority: boolean; added_by: string; created_at: string; updated_at: string; }
export interface CompetitorIntelligenceView { id: string; tenant_id: string; competitor_id: string; razao_social: string | null; nome_fantasia: string | null; cnpj: string | null; capital_social_brl: number | null; porte: string | null; uf: string | null; municipio: string | null; spi_score: number | null; spi_category: SPICategory | null; ofs_risk_level: OFSRiskLevel | null; enrichment_status: EnrichmentStatus; last_enriched_at: string | null; }
export interface MarketSignalView { id: string; tenant_id: string; competitor_id: string | null; signal_type: MarketSignalType; title: string; summary: string | null; source_url: string | null; source_name: string | null; sentiment: 'positive' | 'neutral' | 'negative' | 'unknown' | null; impact_level: 'low' | 'medium' | 'high' | null; detected_at: string; detected_by: string; }
export interface CompetitorWithIntelligence { competitor: CompetitorView; intelligence: CompetitorIntelligenceView | null; recent_signals: MarketSignalView[]; }

export interface IntelligenceJobView {
  id: string;
  tenant_id: string;
  job_type: 'competitor_enrichment' | 'comparison_generation' | 'signal_detection' | 'framework_regeneration' | 'market_scan';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  competitor_id: string | null;
  project_id: string | null;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface IntelligenceFindingView {
  id: string;
  tenant_id: string;
  job_id: string | null;
  competitor_id: string | null;
  finding_type: string;
  title: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number | null;
  recommended_action: string | null;
  detected_at: string;
}

export const intelligenceGcpAdapter = {
  async listCompetitorsByProject(tenantId: string, projectId: string): Promise<CompetitorView[]> {
    const res = await intelligenceRequest(`/competitors/${projectId}?tenant_id=${tenantId}`);
    const data = (await res.json()) as { data: CompetitorView[] };
    return data.data || [];
  },
  async getCompetitorFull(tenantId: string, competitorId: string): Promise<CompetitorWithIntelligence | null> {
    const res = await intelligenceRequest(`/competitors/${competitorId}/full?tenant_id=${tenantId}`);
    const data = (await res.json()) as { data: CompetitorWithIntelligence | null };
    return data.data;
  },
  async createCompetitor(tenantId: string, projectId: string, name: string, cnpj?: string, addedBy: string): Promise<CompetitorView> {
    const res = await intelligenceRequest('/competitors', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, project_id: projectId, name, cnpj, added_by: addedBy }),
    });
    const data = (await res.json()) as { data: CompetitorView };
    return data.data;
  },
  async listSignalsByProject(tenantId: string, projectId: string): Promise<MarketSignalView[]> {
    const res = await intelligenceRequest(`/signals/${projectId}?tenant_id=${tenantId}`);
    const data = (await res.json()) as { data: MarketSignalView[] };
    return data.data || [];
  },
  async listJobs(tenantId: string): Promise<IntelligenceJobView[]> {
    const res = await intelligenceRequest(`/jobs?tenant_id=${tenantId}`);
    const data = (await res.json()) as { data: IntelligenceJobView[] };
    return data.data || [];
  },
  async listFindings(tenantId: string): Promise<IntelligenceFindingView[]> {
    const res = await intelligenceRequest(`/findings?tenant_id=${tenantId}`);
    const data = (await res.json()) as { data: IntelligenceFindingView[] };
    return data.data || [];
  },
  async enqueueJob(tenantId: string, jobType: string, competitorId?: string, inputPayload?: Record<string, any>): Promise<IntelligenceJobView> {
    const res = await intelligenceRequest('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, job_type: jobType, competitor_id: competitorId, input_payload: inputPayload }),
    });
    const data = (await res.json()) as { data: IntelligenceJobView };
    return data.data;
  },
  async enqueueShare(tenantId: string, projectId: string, createdBy: string): Promise<{ share_token: string; share_url: string; expires_at: string | null }> {
    const res = await intelligenceRequest('/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, project_id: projectId, created_by: createdBy }),
    });
    const data = (await res.json()) as { data: { share_token: string; expires_at: string | null } };
    return { ...data.data, share_url: `${window.location.origin}/public/growthmap/${data.data.share_token}` };
  },
};

export interface LifecycleEvent {
  id: string;
  from_stage: string | null;
  to_stage: string;
  triggered_by: string;
  metadata: Record<string, any>;
  transitioned_at: string;
}

export const lifecycleGcpAdapter = {
  async getContactJourney(contactId: string, tenantId: string): Promise<LifecycleEvent[]> {
    const res = await authenticatedRequest(`/v1/lifecycle/contacts/${encodeURIComponent(contactId)}/journey?tenant_id=${encodeURIComponent(tenantId)}`);
    const data = (await res.json()) as { data: LifecycleEvent[] };
    return data.data || [];
  },
};
