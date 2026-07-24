import { requireGoogleIdToken } from '@/integrations/firebase/client';

const API_BASE_URL = import.meta.env.VITE_GCP_API_URL || 'https://revhackers-api-staging-254666331430.southamerica-east1.run.app';

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

async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await requireGoogleIdToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

export const strategicPlansGcpAdapter = {
    async getById(id: string): Promise<StrategicPlanGcpRecord | null> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/v1/strategic-plans/${id}`, {
            method: 'GET',
            headers,
        });

        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error(`Erro ao buscar Plano Estratégico GCP (${response.status})`);
        }

        return response.json();
    },

    async getByProjectId(projectId: string): Promise<StrategicPlanGcpRecord | null> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/v1/strategic-plans/project/${projectId}`, {
            method: 'GET',
            headers,
        });

        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error(`Erro ao buscar Plano Estratégico GCP do Projeto (${response.status})`);
        }

        return response.json();
    },

    async create(input: Partial<StrategicPlanGcpRecord>): Promise<StrategicPlanGcpRecord> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/v1/strategic-plans`, {
            method: 'POST',
            headers,
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            throw new Error(`Erro ao criar Plano Estratégico GCP (${response.status})`);
        }

        return response.json();
    },

    async update(id: string, input: Partial<StrategicPlanGcpRecord>): Promise<StrategicPlanGcpRecord> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/v1/strategic-plans/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            throw new Error(`Erro ao atualizar Plano Estratégico GCP (${response.status})`);
        }

        return response.json();
    },

    async generate(input: any): Promise<{ plan: StrategicPlanGcpRecord; generatedData: Record<string, any> }> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/v1/strategic-plans/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            throw new Error(`Erro ao gerar Plano Estratégico via IA na API GCP (${response.status})`);
        }

        return response.json();
    },
};
