export type SPICategory = 'MICRO' | 'EMERGING' | 'SCALEUP' | 'ENTERPRISE';
export type OFSRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EnrichmentStatus = 'pending' | 'processing' | 'enriched' | 'failed';

export type MarketSignalType = 
  | 'news' 
  | 'funding' 
  | 'launch' 
  | 'pricing_change' 
  | 'hiring' 
  | 'partnership' 
  | 'acquisition' 
  | 'other';

export type MarketSentiment = 'positive' | 'neutral' | 'negative';
export type MarketImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface QSAEntry {
  nome: string;
  cargo: string;
  cpf_cnpj?: string;
  percentual_capital?: number;
  data_entrada?: string;
}

export interface CompetitorRecord {
  id: string;
  tenant_id: string;
  project_id?: string | null;
  name: string;
  cnpj?: string | null;
  website?: string | null;
  segment?: string | null;
  cnae_primary?: string | null;
  notes?: string | null;
  is_active: boolean;
  is_priority: boolean;
  added_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCompetitorParams {
  tenant_id: string;
  project_id?: string | null;
  name: string;
  cnpj?: string | null;
  website?: string | null;
  segment?: string | null;
  cnae_primary?: string | null;
  notes?: string | null;
  is_priority?: boolean;
  added_by?: string | null;
}

export interface UpdateCompetitorParams {
  name?: string;
  cnpj?: string | null;
  website?: string | null;
  segment?: string | null;
  cnae_primary?: string | null;
  notes?: string | null;
  is_active?: boolean;
  is_priority?: boolean;
}

export interface CompetitorIntelligenceRecord {
  id: string;
  tenant_id: string;
  competitor_id: string;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  capital_social_brl?: number | null;
  porte?: string | null;
  natureza_juridica?: string | null;
  cnae_primary?: string | null;
  cnae_secondary: string[];
  uf?: string | null;
  municipio?: string | null;
  data_abertura?: string | null;
  situacao_receita?: string | null;
  qsa: QSAEntry[];
  spi_score?: number | null;
  spi_category?: SPICategory | string | null;
  ofs_risk_level?: OFSRiskLevel | string | null;
  raw_payload: Record<string, unknown>;
  last_enriched_at?: string | null;
  enrichment_status: EnrichmentStatus;
  enrichment_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertIntelligenceParams {
  tenant_id: string;
  competitor_id: string;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  capital_social_brl?: number | null;
  porte?: string | null;
  natureza_juridica?: string | null;
  cnae_primary?: string | null;
  cnae_secondary?: string[];
  uf?: string | null;
  municipio?: string | null;
  data_abertura?: string | null;
  situacao_receita?: string | null;
  qsa?: QSAEntry[];
  spi_score?: number | null;
  spi_category?: SPICategory | string | null;
  ofs_risk_level?: OFSRiskLevel | string | null;
  raw_payload?: Record<string, unknown>;
  last_enriched_at?: string | null;
  enrichment_status?: EnrichmentStatus;
  enrichment_error?: string | null;
}

export interface CompetitorComparisonRecord {
  id: string;
  tenant_id: string;
  project_id?: string | null;
  competitor_id: string;
  pricing_score?: number | null;
  features_score?: number | null;
  positioning_score?: number | null;
  pricing_notes?: string | null;
  features_notes?: string | null;
  positioning_notes?: string | null;
  ai_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCompetitorComparisonParams {
  tenant_id: string;
  project_id?: string | null;
  competitor_id: string;
  pricing_score?: number | null;
  features_score?: number | null;
  positioning_score?: number | null;
  pricing_notes?: string | null;
  features_notes?: string | null;
  positioning_notes?: string | null;
  ai_summary?: string | null;
}

export interface MarketSignalRecord {
  id: string;
  tenant_id: string;
  competitor_id?: string | null;
  signal_type: MarketSignalType;
  title: string;
  summary: string;
  source_url?: string | null;
  source_name?: string | null;
  sentiment: MarketSentiment;
  impact_level: MarketImpactLevel;
  detected_at: string;
  detected_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMarketSignalParams {
  tenant_id: string;
  competitor_id?: string | null;
  signal_type: MarketSignalType;
  title: string;
  summary: string;
  source_url?: string | null;
  source_name?: string | null;
  sentiment?: MarketSentiment;
  impact_level?: MarketImpactLevel;
  detected_at?: string;
  detected_by?: string | null;
}

export interface CompetitorWithIntelligence {
  competitor: CompetitorRecord;
  intelligence?: CompetitorIntelligenceRecord | null;
  recent_signals: MarketSignalRecord[];
  comparison?: CompetitorComparisonRecord | null;
}

// INTELLIGENCE JOBS (Async queue)
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'competitor_enrichment' | 'comparison_generation' | 'signal_detection' | 'framework_regeneration' | 'market_scan';

export interface IntelligenceJobRecord {
  id: string; tenant_id: string; job_type: JobType; status: JobStatus;
  competitor_id: string | null; project_id: string | null;
  input_payload: Record<string, any>; output_payload: Record<string, any>;
  attempts: number; max_attempts: number; last_error: string | null;
  scheduled_for: string; started_at: string | null; completed_at: string | null;
  created_at: string; updated_at: string;
}

// INTELLIGENCE FINDINGS (AI insights)
export type FindingType = 'pricing_alert' | 'funding_event' | 'hiring_spike' | 'feature_launch' | 'positioning_shift' | 'market_trend' | 'risk_signal' | 'opportunity';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface IntelligenceFindingRecord {
  id: string; tenant_id: string; job_id: string | null; competitor_id: string | null;
  finding_type: FindingType; title: string; description: string | null;
  severity: Severity; confidence_score: number | null;
  source_url: string | null; source_name: string | null; recommended_action: string | null;
  detected_at: string; created_at: string; updated_at: string;
}

export interface CreateIntelligenceJobParams {
  tenant_id: string; job_type: JobType;
  competitor_id?: string | null; project_id?: string | null;
  input_payload?: Record<string, any>; scheduled_for?: string | null;
  max_attempts?: number;
}

export interface CreateIntelligenceFindingParams {
  tenant_id: string; job_id?: string | null; competitor_id?: string | null;
  finding_type: FindingType; title: string; description?: string | null;
  severity?: Severity; confidence_score?: number | null;
  source_url?: string | null; source_name?: string | null; recommended_action?: string | null;
}
