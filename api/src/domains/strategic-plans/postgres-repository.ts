import { QueryablePool, QueryableClient } from '../../db/postgres';
import { StrategicPlanRepository } from './repository';
import { StrategicPlanRecord, CreateStrategicPlanInput, UpdateStrategicPlanInput } from './contracts';

export class PostgresStrategicPlanRepository implements StrategicPlanRepository {
    constructor(private readonly pool: QueryablePool) { }

    private async setTenantContext(client: QueryableClient, tenantId: string): Promise<void> {
        await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    }

    private mapToRecord(row: any): StrategicPlanRecord {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            reiProjectId: row.rei_project_id,
            clientId: row.client_id,
            diagnosticData: row.diagnostic_data || {},
            personaData: row.persona_data || {},
            premisesData: row.premises_data || {},
            methodologyData: row.methodology_data || {},
            roadmapData: row.roadmap_data || {},
            goalsData: row.goals_data || {},
            financialProjections: row.financial_projections || {},
            budgetData: row.budget_data || {},
            nextStepsData: row.next_steps_data || {},
            status: row.status,
            accessToken: row.access_token,
            sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : null,
            viewedAt: row.viewed_at ? new Date(row.viewed_at).toISOString() : null,
            approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : null,
            rejectedAt: row.rejected_at ? new Date(row.rejected_at).toISOString() : null,
            createdAt: new Date(row.created_at).toISOString(),
            updatedAt: new Date(row.updated_at).toISOString(),
            createdBy: row.created_by,
        };
    }

    async findById(id: string, tenantId: string): Promise<StrategicPlanRecord | null> {
        const client = await this.pool.connect();
        try {
            await this.setTenantContext(client, tenantId);
            const result = await client.query(
                `SELECT * FROM app.strategic_plans WHERE id = $1 AND tenant_id = $2`,
                [id, tenantId]
            );
            if (result.rows.length === 0) return null;
            return this.mapToRecord(result.rows[0]);
        } finally {
            client.release();
        }
    }

    async findByProjectId(projectId: string, tenantId: string): Promise<StrategicPlanRecord | null> {
        const client = await this.pool.connect();
        try {
            await this.setTenantContext(client, tenantId);
            const result = await client.query(
                `SELECT * FROM app.strategic_plans WHERE rei_project_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT 1`,
                [projectId, tenantId]
            );
            if (result.rows.length === 0) return null;
            return this.mapToRecord(result.rows[0]);
        } finally {
            client.release();
        }
    }

    async create(tenantId: string, input: CreateStrategicPlanInput): Promise<StrategicPlanRecord> {
        const client = await this.pool.connect();
        try {
            await this.setTenantContext(client, tenantId);
            const query = `
                INSERT INTO app.strategic_plans (
                    tenant_id,
                    rei_project_id,
                    client_id,
                    diagnostic_data,
                    persona_data,
                    premises_data,
                    methodology_data,
                    roadmap_data,
                    goals_data,
                    financial_projections,
                    budget_data,
                    next_steps_data,
                    status,
                    access_token,
                    created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING *
            `;
            const values = [
                tenantId,
                input.reiProjectId || null,
                input.clientId || tenantId,
                JSON.stringify(input.diagnosticData || {}),
                JSON.stringify(input.personaData || {}),
                JSON.stringify(input.premisesData || {}),
                JSON.stringify(input.methodologyData || {}),
                JSON.stringify(input.roadmapData || {}),
                JSON.stringify(input.goalsData || {}),
                JSON.stringify(input.financialProjections || {}),
                JSON.stringify(input.budgetData || {}),
                JSON.stringify(input.nextStepsData || {}),
                input.status || 'draft',
                input.accessToken || null,
                input.createdBy || null,
            ];
            const result = await client.query(query, values);
            return this.mapToRecord(result.rows[0]);
        } finally {
            client.release();
        }
    }

    async update(id: string, tenantId: string, input: UpdateStrategicPlanInput): Promise<StrategicPlanRecord> {
        const client = await this.pool.connect();
        try {
            await this.setTenantContext(client, tenantId);
            const fields: string[] = [];
            const values: any[] = [id, tenantId];

            const addField = (fieldName: string, dbCol: string, isJson = false) => {
                if ((input as any)[fieldName] !== undefined) {
                    values.push(isJson ? JSON.stringify((input as any)[fieldName]) : (input as any)[fieldName]);
                    fields.push(`${dbCol} = $${values.length}`);
                }
            };

            addField('diagnosticData', 'diagnostic_data', true);
            addField('personaData', 'persona_data', true);
            addField('premisesData', 'premises_data', true);
            addField('methodologyData', 'methodology_data', true);
            addField('roadmapData', 'roadmap_data', true);
            addField('goalsData', 'goals_data', true);
            addField('financialProjections', 'financial_projections', true);
            addField('budgetData', 'budget_data', true);
            addField('nextStepsData', 'next_steps_data', true);
            addField('status', 'status');

            if (fields.length === 0) {
                const current = await this.findById(id, tenantId);
                if (!current) throw new Error(`Strategic plan ${id} not found`);
                return current;
            }

            const query = `
                UPDATE app.strategic_plans
                SET ${fields.join(', ')}
                WHERE id = $1 AND tenant_id = $2
                RETURNING *
            `;
            const result = await client.query(query, values);
            if (result.rows.length === 0) {
                throw new Error(`Strategic plan ${id} not found or permission denied`);
            }
            return this.mapToRecord(result.rows[0]);
        } finally {
            client.release();
        }
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            await this.setTenantContext(client, tenantId);
            const result = await client.query(
                `DELETE FROM app.strategic_plans WHERE id = $1 AND tenant_id = $2`,
                [id, tenantId]
            );
            return (result.rowCount ?? 0) > 0;
        } finally {
            client.release();
        }
    }
}
