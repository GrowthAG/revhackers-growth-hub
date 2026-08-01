/**
 * funnelsAutomationEngine.ts
 *
 * Engine de Automação de Funis de Vendas & Campanhas de E-mail via API do Funnels / GoHighLevel v2.
 * Conecta os 8 eventos de entrada da RevHackers diretamente aos fluxos automatizados no Funnels.
 */

import { sendToGHL, GHLEventType } from './ghlRelay';

export interface FunnelsLeadPayload {
  email: string;
  name?: string;
  phone?: string;
  companyName?: string;
  crmAtual?: string;
  principalDor?: string;
  score?: number;
  diagnosticType?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export const FUNNELS_WORKFLOW_MAP = {
  DIAGNOSTIC_NURTURE: 'wf_revhackers_score_nurture_v1',
  CLAUDE_PARTNER_AI: 'wf_revhackers_claude_ai_partner_v1',
  FOUNDER_CHAT_FOLLOWUP: 'wf_revhackers_founder_chat_v1',
  REI_EXECUTIVE_SUMMARY: 'wf_revhackers_rei_summary_v1',
  PIPELINE_REVIVAL: 'wf_revhackers_pipeline_revival_v1',
  MATERIAL_DELIVERY: 'wf_revhackers_material_delivery_v1',
};

/**
 * Envia o lead para o Funnels / GHL e ativa a automação de e-mail correspondente.
 */
export async function triggerFunnelsCampaign(
  eventType: GHLEventType | string,
  lead: FunnelsLeadPayload
): Promise<{ success: boolean; workflowId?: string; error?: string }> {
  try {
    const defaultTags = ['revhackers_funnels_automation', eventType];
    const tags = Array.from(new Set([...defaultTags, ...(lead.tags || [])]));

    const ghlPayload: Record<string, unknown> = {
      email: lead.email,
      name: lead.name || lead.email.split('@')[0],
      phone: lead.phone || '',
      companyName: lead.companyName || '',
      source: lead.source || `Funnels Engine - ${eventType}`,
      tags,
      crm_atual: lead.crmAtual || '',
      principal_dor: lead.principalDor || '',
      diagnostic_score: lead.score !== undefined ? String(lead.score) : '',
      diagnostic_type: lead.diagnosticType || '',
      ...lead.customFields,
    };

    let workflowId = FUNNELS_WORKFLOW_MAP.DIAGNOSTIC_NURTURE;
    if (eventType === 'claude_partner_network') {
      workflowId = FUNNELS_WORKFLOW_MAP.CLAUDE_PARTNER_AI;
    } else if (eventType === 'founder_video_widget') {
      workflowId = FUNNELS_WORKFLOW_MAP.FOUNDER_CHAT_FOLLOWUP;
    } else if (eventType === 'rei_completed') {
      workflowId = FUNNELS_WORKFLOW_MAP.REI_EXECUTIVE_SUMMARY;
    } else if (eventType === 'download' || eventType === 'email_material') {
      workflowId = FUNNELS_WORKFLOW_MAP.MATERIAL_DELIVERY;
    }

    ghlPayload.workflow_id = workflowId;

    const result = await sendToGHL(eventType, ghlPayload);
    return { success: true, workflowId, ...result };
  } catch (error: any) {
    console.warn('⚠️ [Funnels Engine] Failed to trigger automation campaign:', error?.message);
    return { success: false, error: error?.message || 'Failed to trigger Funnels campaign' };
  }
}
