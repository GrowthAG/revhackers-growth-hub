import type { TenantId } from '../../contracts/tenant';
import type { ClientRecord, CreateClientInput, UpdateClientInput } from './contracts';

export interface ClientRepository {
  list(tenantId: TenantId): Promise<ClientRecord[]>;
  findById(tenantId: TenantId, id: string): Promise<ClientRecord | null>;
  create(tenantId: TenantId, input: CreateClientInput): Promise<ClientRecord>;
  update(tenantId: TenantId, id: string, input: UpdateClientInput): Promise<ClientRecord | null>;
  delete(tenantId: TenantId, id: string): Promise<boolean>;
}
