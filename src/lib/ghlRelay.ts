/**
 * ghlRelay.ts
 *
 * Frontend utility for sending events to GoHighLevel via direct API v1.
 * Creates/updates contacts directly in GHL without webhook intermediaries.
 *
 * Usage:
 *   import { sendToGHL } from '@/lib/ghlRelay';
 *   await sendToGHL('contact_form', { name, email, message });
 *   await sendToGHL('rei_completed', { companyName, email, score, ... });
 *   await sendToGHL('newsletter', { name, email });
 */

const GHL_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IlM3SEVGQXo5N1VLdUM4TkxITW1JIiwidmVyc2lvbiI6MSwiaWF0IjoxNzg0MTQ3MzM0MTc0LCJzdWIiOiI0SXZVS1lUbEJWWUozeVE2RUpRaiJ9.3jvk5egLglodcOG15f-M2ugr0HlhvvQJWz6_5cAgtLw';
const GHL_API_URL = 'https://rest.gohighlevel.com/v1/contacts/';

export type GHLEventType =
    | 'rei_completed'
    | 'contact_form'
    | 'newsletter'
    | 'roi_calculator'
    | 'score_captured'
    | 'lead_capture'
    | 'download'
    | 'email_material';

/**
 * Parse a full name into firstName and lastName.
 */
function parseName(fullName: string): { firstName: string; lastName: string } {
    const parts = (fullName || '').trim().split(/\s+/);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
    };
}

/**
 * Build a GHL contact payload from event type + raw form data.
 * Maps each form's fields to the correct GHL contact fields and custom fields.
 */
function buildContactPayload(
    eventType: GHLEventType,
    payload: Record<string, unknown>,
): Record<string, unknown> {
    const { firstName, lastName } = parseName(
        (payload.fullName as string) || (payload.name as string) || (payload.firstName as string) || ''
    );

    const base: Record<string, unknown> = {
        firstName: firstName || (payload.firstName as string) || '',
        lastName: lastName || (payload.lastName as string) || '',
        email: payload.email || payload.corporateEmail || '',
        phone: payload.phone || payload.whatsapp || '',
        companyName: payload.company || payload.companyName || '',
        website: payload.website || '',
        source: `RevHackers - ${eventType}`,
        tags: ['revhackers', eventType],
    };

    const customField: Record<string, string> = {};

    switch (eventType) {
        case 'contact_form':
            if (payload.industry) base.tags = [...(base.tags as string[]), String(payload.industry).toLowerCase()];
            if (payload.role) customField.servios = `Cargo: ${payload.role} | Indústria: ${payload.industry || 'N/A'}`;
            if (payload.message) customField.demo_dor_principal = String(payload.message);
            if (payload.formType) customField.demo_proximo_passo = `Formulário: ${payload.formType}`;
            break;

        case 'newsletter':
            base.tags = [...(base.tags as string[]), 'newsletter'];
            customField.demo_proximo_passo = 'Inscrito na newsletter RevHackers';
            break;

        case 'rei_completed':
            if (payload.score || payload.total_score) {
                customField.demo_resumo = `Score REI: ${payload.score || payload.total_score}`;
            }
            if (payload.maturity_level) {
                customField.demo_proximo_passo = `Maturidade: ${payload.maturity_level}`;
            }
            if (payload.modality) {
                base.tags = [...(base.tags as string[]), `rei-${String(payload.modality).toLowerCase()}`];
            }
            if (payload.segment) {
                customField.servios = `Segmento: ${payload.segment}`;
            }
            // Map REI-specific fields
            if (payload.companySize) customField.ciclo_de_vendas = String(payload.companySize);
            if (payload.role) customField.servios = `Cargo: ${payload.role} | Segmento: ${payload.segment || 'N/A'}`;
            break;

        case 'score_captured':
            if (payload.score) customField.demo_resumo = `Score: ${payload.score} (${payload.type || 'geral'})`;
            if (payload.type) base.tags = [...(base.tags as string[]), `score-${payload.type}`];
            break;

        case 'lead_capture':
        case 'download':
        case 'email_material':
            if (payload.materialTitle || payload.material) {
                customField.material_link = String(payload.materialTitle || payload.material);
            }
            base.tags = [...(base.tags as string[]), 'material-download'];
            break;

        case 'roi_calculator':
            if (payload.roi) customField.demo_resumo = `ROI Calculado: ${payload.roi}`;
            break;
    }

    if (Object.keys(customField).length > 0) {
        base.customField = customField;
    }

    return base;
}

/**
 * Send an event to GHL via direct API v1 (contact upsert).
 * Never throws - GHL is a non-critical enrichment channel.
 * Returns true if the contact was created/updated successfully.
 *
 * @param _organizationId - Kept for backward compatibility, not used in direct API mode.
 */
export async function sendToGHL(
    eventType: GHLEventType,
    payload: Record<string, unknown>,
    _organizationId?: string,
): Promise<boolean> {
    try {
        const contactPayload = buildContactPayload(eventType, payload);

        const response = await fetch(GHL_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactPayload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`[ghlRelay] GHL API error (${response.status}):`, errorData);
            return false;
        }

        return true;
    } catch (err: any) {
        // Never propagate GHL failures to the UI - this is CRM enrichment, not core flow
        console.warn('[ghlRelay] Failed to reach GHL API (non-critical):', err?.message ?? err);
        return false;
    }
}
