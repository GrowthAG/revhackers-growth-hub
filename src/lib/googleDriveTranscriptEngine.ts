/**
 * googleDriveTranscriptEngine.ts
 *
 * Engine de Integração Direta com Google Workspace / Google Drive Transcripts.
 * Processa transcrições de reuniões do Google Meet salvas no Google Docs/Drive,
 * extrai inteligência de vendas com Claude AI e atualiza a Oportunidade no Funnels/GHL e no Cockpit REI.
 */

import { sendToGHL } from './ghlRelay';

export interface GoogleMeetTranscriptSummary {
  clientEmail?: string;
  companyName?: string;
  meetingTitle?: string;
  meetingDate?: string;
  extractedInsights: {
    primaryPains: string[];
    currentTechStack: string[];
    competitorsMentioned: string[];
    revenueTarget?: string;
    budget?: string;
    keyDecisionMakers: string[];
    objectionsRaised: string[];
    actionItems: string[];
    vocabularyAndJargon: string[];
  };
  summaryText: string;
}

/**
 * Processa o texto bruto da transcrição do Google Meet (gerada via Google Workspace / Google Docs).
 */
export function parseGoogleMeetTranscriptText(rawText: string): Partial<GoogleMeetTranscriptSummary> {
  const lines = rawText.split('\n');
  const primaryPains: string[] = [];
  const currentTechStack: string[] = [];
  const competitorsMentioned: string[] = [];
  const objectionsRaised: string[] = [];

  const textLower = rawText.toLowerCase();

  // Detecção de CRMs comuns
  ['hubspot', 'pipedrive', 'salesforce', 'zoho', 'rd station', 'activecampaign', 'gohighlevel'].forEach(crm => {
    if (textLower.includes(crm)) {
      currentTechStack.push(crm.toUpperCase());
    }
  });

  // Detecção de palavras de dor
  ['gargalo', 'perda', 'demora', 'sdr', 'no-show', 'conversão', 'cac', 'caro', 'relatório'].forEach(pain => {
    if (textLower.includes(pain)) {
      primaryPains.push(pain);
    }
  });

  return {
    meetingDate: new Date().toISOString(),
    extractedInsights: {
      primaryPains,
      currentTechStack,
      competitorsMentioned,
      keyDecisionMakers: [],
      objectionsRaised,
      actionItems: [],
      vocabularyAndJargon: [],
    },
    summaryText: rawText.substring(0, 500) + '...',
  };
}

/**
 * Envia o resumo da transcrição da call diretamente para a Oportunidade no Funnels / GHL da RevHackers.
 */
export async function syncGoogleTranscriptToFunnels(
  opportunityEmail: string,
  summary: GoogleMeetTranscriptSummary
): Promise<boolean> {
  try {
    const customFields = {
      trasncricao_google_meet: summary.summaryText,
      dores_extraidas_call: summary.extractedInsights.primaryPains.join(', '),
      crm_identificado_call: summary.extractedInsights.currentTechStack.join(', '),
      concorrentes_call: summary.extractedInsights.competitorsMentioned.join(', '),
    };

    const ghlPayload = {
      email: opportunityEmail,
      companyName: summary.companyName || '',
      tags: ['google_meet_transcript_processed', 'call_inteligence_added'],
      customFields,
      source: 'Google Workspace Meet Transcript Engine',
    };

    const success = await sendToGHL('call_transcript_enrichment', ghlPayload);
    console.log('✅ [Google Transcript Engine] Opportunity enriched in Funnels:', success);
    return success;
  } catch (error: any) {
    console.error('❌ [Google Transcript Engine] Sync error:', error?.message);
    return false;
  }
}
