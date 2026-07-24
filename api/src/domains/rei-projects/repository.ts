import type { TenantId } from '../../contracts/tenant';
import type { CreateReiProjectInput, ReiProjectRecord, UpdateReiProjectInput } from './contracts';

export interface ReiProjectRepository {
  list(tenantId: TenantId): Promise<ReiProjectRecord[]>;
  findById(tenantId: TenantId, id: string): Promise<ReiProjectRecord | null>;
  create(tenantId: TenantId, input: CreateReiProjectInput): Promise<ReiProjectRecord>;
  update(tenantId: TenantId, id: string, input: UpdateReiProjectInput): Promise<ReiProjectRecord | null>;
  delete(tenantId: TenantId, id: string): Promise<boolean>;
}
