import { authenticatedRequest } from './_base';

const REI_BASE = '/v1/rei';

async function reiRequest(path: string, init?: RequestInit): Promise<Response> {
  return authenticatedRequest(`${REI_BASE}${path}`, init);
}

export interface REIOnboardingView {
  id: string;
  rei_project_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  product_name: string;
  product_slug: string;
  current_phase: 'O1_EMBARK' | 'O2_HANDOFF' | 'O3_KICKOFF' | 'O4_ADOPT' | 'O5_REVIEW' | 'O6_EXPAND';
  current_milestone: 'M0_WELCOME' | 'M1_KICKOFF' | 'M2_QUICK_WIN' | 'M3_NPS_D14' | 'M4_MID_REVIEW' | 'M5_WRAP_NPS' | 'COMPLETED';
  health_score: number;
  churn_risk: 'low' | 'medium' | 'high';
  engagement_rate: number;
  nps_d14_score: number | null;
  days_into_journey: number;
  welcome_sent_at: string | null;
  kickoff_at: string | null;
  quick_win_delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpansionOpportunityView {
  id: string;
  tenant_id: string;
  rei_onboarding_id: string | null;
  project_id: string | null;
  opportunity_type: 'upsell' | 'cross_sell' | 'renewal' | 'expansion_service' | 'referral';
  product_name: string;
  product_description: string | null;
  estimated_value_brl: number | null;
  ai_reasoning: string | null;
  status: 'identified' | 'presented' | 'negotiating' | 'won' | 'lost' | 'deferred';
  presented_at: string | null;
  closed_at: string | null;
  closed_value_brl: number | null;
  created_by: string;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const reiGcpAdapter = {
  async listActive(): Promise<REIOnboardingView[]> {
    const res = await reiRequest('/onboarding/active');
    const data = (await res.json()) as { data: REIOnboardingView[] };
    return data.data || [];
  },
  async markWelcomeSent(onboardingId: string): Promise<void> {
    await reiRequest('/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_id: onboardingId, kickoff_link: 'https://cal.com/placeholder' }),
    });
  },
  async recordNPS(onboardingId: string, score: number): Promise<void> {
    await reiRequest('/nps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_id: onboardingId, score }),
    });
  },
  async listExpansionOpportunities(tenantId: string, options?: { onboarding_id?: string; status?: string }): Promise<ExpansionOpportunityView[]> {
    const params = new URLSearchParams();
    params.set('tenant_id', tenantId);
    if (options?.onboarding_id) params.set('onboarding_id', options.onboarding_id);
    if (options?.status) params.set('status', options.status);
    const res = await reiRequest(`/expansion?${params.toString()}`);
    const data = (await res.json()) as { data: ExpansionOpportunityView[] };
    return data.data || [];
  },
  async createExpansionOpportunity(params: {
    tenant_id: string;
    rei_onboarding_id?: string;
    project_id?: string;
    opportunity_type: 'upsell' | 'cross_sell' | 'renewal' | 'expansion_service' | 'referral';
    product_name: string;
    product_description?: string;
    estimated_value_brl?: number;
    ai_reasoning?: string;
    created_by: string;
  }): Promise<{ data: { id?: string; created_at: string } }> {
    const res = await reiRequest('/expansion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },
};
