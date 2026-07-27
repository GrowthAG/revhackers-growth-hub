// REI Domain Types — Hybrid framework: Orchestrated Onboarding (Donna Weber) + Hormozi Milestones

export type OrchestratedOnboardingPhase =
  | 'O1_EMBARK'        // Pre-close: alignment of expectations
  | 'O2_HANDOFF'       // D0: AE → CSM handoff
  | 'O3_KICKOFF'       // D1-D7: formal welcome
  | 'O4_ADOPT'         // D7-D45: real product adoption
  | 'O5_REVIEW'        // D45-D90: health check
  | 'O6_EXPAND';       // D90+: upsell/expansion

export type HormoziMilestone =
  | 'M0_WELCOME'       // D0, hour 0
  | 'M1_KICKOFF'       // D1-D3: 45-60min call
  | 'M2_QUICK_WIN'     // D7: visible, attributable win
  | 'M3_NPS_D14'       // D14: NPS check-in
  | 'M4_MID_REVIEW'    // D21: 30-min review call
  | 'M5_WRAP_NPS'      // D30: formal NPS + transition
  | 'COMPLETED';       // D30+

export type REIProjectType = 'self-serve' | 'guided' | 'done-with-you' | 'done-for-you';

export interface REIOnboardingRecord {
  id: string;
  tenant_id: string;
  rei_project_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  product_name: string;
  product_slug: string;
  company_slug: string;
  duration_days: number;
  type: REIProjectType;
  avg_ticket_range: string;
  cs_lead_name: string;
  cs_lead_email: string;
  backup_name: string | null;
  backup_email: string | null;

  // Hybrid phase tracking
  current_phase: OrchestratedOnboardingPhase;
  current_milestone: HormoziMilestone;

  // Key timestamps
  welcome_sent_at: string | null;
  kickoff_at: string | null;
  quick_win_delivered_at: string | null;
  nps_d14_score: number | null;
  mid_review_at: string | null;
  wrap_up_at: string | null;
  completed_at: string | null;

  // Quick Win evidence
  quick_win_description: string | null;
  quick_win_url: string | null;
  quick_win_loom_url: string | null;

  // Aggregated health metrics
  health_score: number; // 0-100
  engagement_rate: number; // % touches answered
  churn_risk: 'low' | 'medium' | 'high';

  // Owner override and notes
  founder_intervention_required: boolean;
  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateREIOnboardingParams {
  rei_project_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  product_name: string;
  product_slug?: string;
  company_slug?: string;
  duration_days?: number;
  type?: REIProjectType;
  avg_ticket_range?: string;
  cs_lead_name: string;
  cs_lead_email: string;
  backup_name?: string | null;
  backup_email?: string | null;
  is_high_ticket?: boolean; // >= R$ 30k → adds founder involvement
}

export interface WelcomeEmailPayload {
  to: string;
  subject: string;
  body: string;
  kickoff_link: string;
}

export interface QuickWinPayload {
  description: string;
  url: string;
  loom_url?: string | undefined;
}