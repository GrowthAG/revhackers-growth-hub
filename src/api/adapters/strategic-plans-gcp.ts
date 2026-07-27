import { authenticatedRequest } from './_base';

export interface StrategicPlanGcpRecord {
    id: string;
    tenantId: string;
    reiProjectId?: string | null;
    clientId?: string | null;
    diagnosticData: Record<string, any>;
    personaData: Record<string, any>;
    premisesData: Record<string, any>;
    methodologyData: Record<string, any>;
    roadmapData: Record<string, any>;
    goalsData: Record<string, any>;
    financialProjections: Record<string, any>;
    budgetData: Record<string, any>;
    nextStepsData: Record<string, any>;
    status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

async function handleNotFound<T>(promise: Promise<Response>): Promise<T | null> {
    const response = await promise;
    if (response.status === 404) return null;
    if (!response.ok) {
        throw new Error(`Erro na requisição do Plano Estratégico GCP (${response.status})`);
    }
    return response.json();
}

export const strategicPlansGcpAdapter = {
    async getById(id: string): Promise<StrategicPlanGcpRecord | null> {
        return handleNotFound<StrategicPlanGcpRecord>(
            authenticatedRequest(`/v1/strategic-plans/${encodeURIComponent(id)}`),
        );
    },

    async getByProjectId(projectId: string): Promise<StrategicPlanGcpRecord | null> {
        return handleNotFound<StrategicPlanGcpRecord>(
            authenticatedRequest(`/v1/strategic-plans/project/${encodeURIComponent(projectId)}`),
        );
    },

    async create(input: Partial<StrategicPlanGcpRecord>): Promise<StrategicPlanGcpRecord> {
        const response = await authenticatedRequest('/v1/strategic-plans', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(input),
        });
        return response.json();
    },

    async update(id: string, input: Partial<StrategicPlanGcpRecord>): Promise<StrategicPlanGcpRecord> {
        const response = await authenticatedRequest(`/v1/strategic-plans/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(input),
        });
        return response.json();
    },

    async generate(input: any): Promise<{ plan: StrategicPlanGcpRecord; generatedData: Record<string, any> }> {
        const response = await authenticatedRequest('/v1/strategic-plans/generate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(input),
        });
        return response.json();
    },
};
