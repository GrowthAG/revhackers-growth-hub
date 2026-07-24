import { StrategicPlanRecord, CreateStrategicPlanInput, UpdateStrategicPlanInput } from './contracts';

export interface StrategicPlanRepository {
    findById(id: string, tenantId: string): Promise<StrategicPlanRecord | null>;
    findByProjectId(projectId: string, tenantId: string): Promise<StrategicPlanRecord | null>;
    create(tenantId: string, input: CreateStrategicPlanInput): Promise<StrategicPlanRecord>;
    update(id: string, tenantId: string, input: UpdateStrategicPlanInput): Promise<StrategicPlanRecord>;
    delete(id: string, tenantId: string): Promise<boolean>;
}
