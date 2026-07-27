import { sendToGHL, GHLEventType } from "@/lib/ghlRelay";

export interface DiagnosticLead {
    name: string;
    email: string;
    company: string;
    cnpj?: string;
    phone?: string;
    role?: string;
    linkedin?: string;
}

const API_BASE_URL = (import.meta.env.VITE_GCP_API_URL as string)?.replace(/\/$/, '') || 'https://api.revhackers.com';

/**
 * submitPublicDiagnostic
 *
 * Fluxo migrado para a API Cloud Run (GCP):
 *   1. Envia a submissão de diagnóstico e lead para a API GCP (`POST /v1/opportunities`)
 *   2. A API GCP salva a oportunidade e dispara em background o enriquecimento FonteData se houver CNPJ
 *   3. Dispara o relay de automação do GoHighLevel (GHL)
 *   4. Retorna a URL de resultado gerada (`/diagnostico/resultado/{diagnosticoId}`)
 */
export const submitPublicDiagnostic = async (
    lead: DiagnosticLead,
    answers: Record<string, any>,
    score: number,
    maturity: { level: string; description: string; action: string; color: string; title?: string },
    ghlEventType?: GHLEventType
) => {
    const diagnosticType = answers.diagnostic_type || 'growth';

    // Build full response payload
    const fullResponses = {
        ...answers,
        lead_details: {
            phone: lead.phone,
            role: lead.role,
            linkedin: lead.linkedin,
            cnpj: lead.cnpj,
        },
        result_details: maturity,
        diagnostic_type: diagnosticType,
    };

    // Mapeamento dos tipos REI oficiais
    type OfficialREIType = 'consulting' | 'crm_ops' | 'founder' | 'site';
    const diagToProjectMap: Record<string, OfficialREIType> = {
        growth: 'consulting',
        revenue: 'crm_ops',
        founder: 'founder',
        site: 'site',
    };
    const officialProjectType = diagToProjectMap[diagnosticType] || 'consulting';

    const DIAG_TYPE_TO_SOURCE: Record<string, string> = {
        growth: 'diagnostico_growth',
        revenue: 'diagnostico_revenue',
        founder: 'diagnostico_founder',
        site: 'diagnostico_site',
    };
    const leadSource = DIAG_TYPE_TO_SOURCE[diagnosticType] || 'diagnostico_growth';
    const generatedDiagnosticoId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let diagnosticoId = generatedDiagnosticoId;

    try {
        const response = await fetch(`${API_BASE_URL}/v1/opportunities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: lead.name || lead.company || 'Novo Lead B2B',
                email: lead.email?.toLowerCase() || null,
                company: lead.company || null,
                cnpj: lead.cnpj || null,
                diagnosticoId: generatedDiagnosticoId,
                officialProjectType,
                leadSource,
                score,
                maturity,
                responses: fullResponses,
            }),
        });

        if (response.ok) {
            const resData = await response.json();
            if (resData.data?.diagnosticoId) {
                diagnosticoId = resData.data.diagnosticoId;
            }
        } else {
            console.warn('[publicDiagnostic] Resposta com status não-200 da API GCP:', response.status);
        }
    } catch (err) {
        console.error('[publicDiagnostic] Erro ao enviar submissão para a API GCP:', err);
    }

    // 2. GHL relay para automação de marketing
    const resultUrl = `${window.location.origin}/diagnostico/resultado/${diagnosticoId}`;

    if (ghlEventType) {
        await sendToGHL(ghlEventType, {
            ...lead,
            score,
            maturity: maturity.level,
            maturity_title: maturity.title,
            diagnostic_type: diagnosticType,
            result_url: resultUrl,
            timestamp: new Date().toISOString(),
        });
    }

    // Retorna o ID do resultado para redirecionar o usuário
    return { response: { id: diagnosticoId }, resultUrl };
};
