/**
 * funnelsAutomationEngine.ts
 *
 * Engine de Automação Omnichannel de Funis de Vendas & Campanhas E-mail + WhatsApp via API do Funnels / GoHighLevel v2.
 * Gerencia a entrada de leads, movimentação de oportunidades no CRM e sequências de nutrição cruzadas.
 */

import { sendToGHL, GHLEventType } from './ghlRelay';

export interface FunnelsLeadPayload {
  email: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
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
  WHATSAPP_INSTANT_TOUCH: 'wf_revhackers_whatsapp_instant_v1',
};

export const FUNNELS_PIPELINE_STAGES = {
  LEAD_CAPTURADO: 'stage_lead_capturado',
  DIAGNOSTICO_REALIZADO: 'stage_diagnostico_realizado',
  INTERESSE_IA_CLAUDE: 'stage_interesse_ia_claude',
  REUNIAO_SOLICITADA: 'stage_reuniao_solicitada',
  REUNIAO_AGENDADA: 'stage_reuniao_agendada',
  PROPOSTA_ENVIADA: 'stage_proposta_enviada',
  CONTA_GANHA: 'stage_conta_ganha',
  OPORTUNIDADE_PERDIDA: 'stage_oportunidade_perdida',
};

/**
 * Formata números de telefone/WhatsApp para o formato E.164 padronizado (+55...).
 */
export function formatE164Phone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 11) return `+55${digits}`;
  return `+${digits}`;
}

/**
 * Envia o lead para o Funnels / GHL e ativa a automação de e-mail + WhatsApp correspondente.
 */
export async function triggerFunnelsCampaign(
  eventType: GHLEventType | string,
  lead: FunnelsLeadPayload
): Promise<{ success: boolean; workflowId?: string; pipelineStage?: string; error?: string }> {
  try {
    const defaultTags = ['revhackers_funnels_automation', 'omnichannel', eventType];
    const tags = Array.from(new Set([...defaultTags, ...(lead.tags || [])]));

    const formattedPhone = formatE164Phone(lead.phone || lead.whatsapp);

    let pipelineStage = FUNNELS_PIPELINE_STAGES.LEAD_CAPTURADO;
    let workflowId = FUNNELS_WORKFLOW_MAP.DIAGNOSTIC_NURTURE;

    if (eventType === 'claude_partner_network') {
      workflowId = FUNNELS_WORKFLOW_MAP.CLAUDE_PARTNER_AI;
      pipelineStage = FUNNELS_PIPELINE_STAGES.INTERESSE_IA_CLAUDE;
    } else if (eventType === 'founder_video_widget') {
      workflowId = FUNNELS_WORKFLOW_MAP.FOUNDER_CHAT_FOLLOWUP;
      pipelineStage = FUNNELS_PIPELINE_STAGES.LEAD_CAPTURADO;
    } else if (eventType === 'rei_completed') {
      workflowId = FUNNELS_WORKFLOW_MAP.REI_EXECUTIVE_SUMMARY;
      pipelineStage = FUNNELS_PIPELINE_STAGES.DIAGNOSTICO_REALIZADO;
    } else if (eventType === 'download' || eventType === 'email_material') {
      workflowId = FUNNELS_WORKFLOW_MAP.MATERIAL_DELIVERY;
      pipelineStage = FUNNELS_PIPELINE_STAGES.LEAD_CAPTURADO;
    } else if (eventType === 'score_captured' || eventType === 'lead_capture' || eventType === 'score') {
      pipelineStage = FUNNELS_PIPELINE_STAGES.DIAGNOSTICO_REALIZADO;
    }

    const ghlPayload: Record<string, unknown> = {
      email: lead.email,
      name: lead.name || lead.email.split('@')[0],
      phone: formattedPhone,
      companyName: lead.companyName || '',
      source: lead.source || `Funnels Engine - ${eventType}`,
      tags,
      crm_atual: lead.crmAtual || '',
      principal_dor: lead.principalDor || '',
      diagnostic_score: lead.score !== undefined ? String(lead.score) : '',
      diagnostic_type: lead.diagnosticType || '',
      pipeline_stage: pipelineStage,
      workflow_id: workflowId,
      trigger_whatsapp: formattedPhone ? 'true' : 'false',
      ...lead.customFields,
    };

    const result = await sendToGHL(eventType, ghlPayload);
    return { success: true, workflowId, pipelineStage, ...result };
  } catch (error: any) {
    console.warn('⚠️ [Funnels Engine] Failed to trigger automation campaign:', error?.message);
    return { success: false, error: error?.message || 'Failed to trigger Funnels campaign' };
  }
}
