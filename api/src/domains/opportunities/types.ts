export interface ScalePowerIndex {
  score: number; // 0 to 100
  capital_social: number;
  branch_count: number;
  scale_category: 'MICRO' | 'EMERGING' | 'SCALEUP' | 'ENTERPRISE';
}

export interface PartnerHolding {
  name: string;
  role: string;
  other_companies_count: number;
  other_companies: Array<{ cnpj: string; company_name: string }>;
}

export interface SerialFounderRadar {
  partners: PartnerHolding[];
}

export interface OperationalFrictionScan {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  active_lawsuits_count: number;
  has_labor_claims: boolean;
}

export interface FonteDataEnrichmentPayload {
  cnpj: string;
  company_name: string;
  email?: string;
  website?: string;
  spi: ScalePowerIndex;
  holding_hunter: SerialFounderRadar;
  ofs: OperationalFrictionScan;
  enriched_at: string;
  raw_provider?: string;
}

export interface OpportunityRecord {
  id: string;
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  cnpj: string | null;
  type: string;
  lead_source: string;
  pipeline_stage: string;
  diagnostico_id: string | null;
  opportunity_data: {
    responses?: Record<string, any>;
    enrichment?: FonteDataEnrichmentPayload;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOpportunityParams {
  client_name: string;
  client_email?: string | null;
  client_company?: string | null;
  cnpj?: string | null;
  type?: string;
  lead_source?: string;
  pipeline_stage?: string;
  diagnostico_id?: string | null;
  opportunity_data?: Record<string, any> | null;
}
