import { ApiError } from '../../contracts/errors';
import type { TenantId } from '../../contracts/tenant';
import type { ClientRecord, CreateClientInput, UpdateClientInput } from './contracts';
import type { ClientRepository } from './repository';

export class ClientService {
  constructor(private readonly repository: ClientRepository) {}

  async listClients(tenantId: TenantId): Promise<ClientRecord[]> {
    return this.repository.list(tenantId);
  }

  async getClient(tenantId: TenantId, id: string): Promise<ClientRecord> {
    const client = await this.repository.findById(tenantId, id);
    if (!client) throw ApiError.notFound('Cliente não encontrado.');
    return client;
  }

  async createClient(tenantId: TenantId, input: CreateClientInput): Promise<ClientRecord> {
    if (!input.name?.trim()) throw ApiError.validation('Nome do cliente é obrigatório.');
    if (!input.email?.trim() || !input.email.includes('@')) {
      throw ApiError.validation('E-mail válido do cliente é obrigatório.');
    }
    return this.repository.create(tenantId, input);
  }

  async updateClient(tenantId: TenantId, id: string, input: UpdateClientInput): Promise<ClientRecord> {
    if (input.name !== undefined && !input.name.trim()) {
      throw ApiError.validation('Nome do cliente não pode ser vazio.');
    }
    if (input.email !== undefined && (!input.email.trim() || !input.email.includes('@'))) {
      throw ApiError.validation('E-mail do cliente deve ser válido.');
    }
    const updated = await this.repository.update(tenantId, id, input);
    if (!updated) throw ApiError.notFound('Cliente não encontrado.');
    return updated;
  }

  async deleteClient(tenantId: TenantId, id: string): Promise<void> {
    const deleted = await this.repository.delete(tenantId, id);
    if (!deleted) throw ApiError.notFound('Cliente não encontrado.');
  }
}
