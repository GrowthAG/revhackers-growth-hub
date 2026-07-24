import { StrategicPlanRepository } from './repository';
import { StrategicPlanRecord, CreateStrategicPlanInput, UpdateStrategicPlanInput } from './contracts';

export class StrategicPlanService {
    constructor(private readonly repository: StrategicPlanRepository) { }

    async getPlanById(id: string, tenantId: string): Promise<StrategicPlanRecord | null> {
        return this.repository.findById(id, tenantId);
    }

    async getPlanByProjectId(projectId: string, tenantId: string): Promise<StrategicPlanRecord | null> {
        return this.repository.findByProjectId(projectId, tenantId);
    }

    async createPlan(tenantId: string, input: CreateStrategicPlanInput): Promise<StrategicPlanRecord> {
        return this.repository.create(tenantId, input);
    }

    async updatePlan(id: string, tenantId: string, input: UpdateStrategicPlanInput): Promise<StrategicPlanRecord> {
        return this.repository.update(id, tenantId, input);
    }

    async deletePlan(id: string, tenantId: string): Promise<boolean> {
        return this.repository.delete(id, tenantId);
    }
}
