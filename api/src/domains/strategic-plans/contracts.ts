export interface StrategicPlanRecord {
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
    accessToken?: string | null;
    sentAt?: string | null;
    viewedAt?: string | null;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
}

export type CreateStrategicPlanInput = Omit<
    StrategicPlanRecord,
    'id' | 'createdAt' | 'updatedAt' | 'sentAt' | 'viewedAt' | 'approvedAt' | 'rejectedAt'
>;

export type UpdateStrategicPlanInput = Partial<
    Omit<StrategicPlanRecord, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
>;
