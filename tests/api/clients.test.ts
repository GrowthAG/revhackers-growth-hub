import { describe, expect, it } from 'vitest';
import { ClientService } from '../../api/src/domains/clients/service';
import type { ClientRecord, CreateClientInput } from '../../api/src/domains/clients/contracts';
import type { ClientRepository } from '../../api/src/domains/clients/repository';

class InMemoryClientRepository implements ClientRepository {
  private clients: Map<string, ClientRecord[]> = new Map();

  async list(tenantId: string): Promise<ClientRecord[]> {
    return this.clients.get(tenantId) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<ClientRecord | null> {
    const list = this.clients.get(tenantId) ?? [];
    return list.find((c) => c.id === id) ?? null;
  }

  async create(tenantId: string, input: CreateClientInput): Promise<ClientRecord> {
    const list = this.clients.get(tenantId) ?? [];
    const record: ClientRecord = {
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      phone: input.phone ?? null,
      logoUrl: input.logoUrl ?? null,
      website: input.website ?? null,
      linkedinUrl: input.linkedinUrl ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      country: input.country ?? 'Brasil',
      segment: input.segment ?? null,
      companySize: input.companySize ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(record);
    this.clients.set(tenantId, list);
    return record;
  }

  async update(tenantId: string, id: string, input: Partial<CreateClientInput>): Promise<ClientRecord | null> {
    const list = this.clients.get(tenantId) ?? [];
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const current = list[index];
    if (!current) return null;
    const updated: ClientRecord = {
      ...current,
      ...input,
      id: current.id,
      name: input.name ?? current.name,
      email: input.email ?? current.email,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.clients.set(tenantId, list);
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const list = this.clients.get(tenantId) ?? [];
    const initialLen = list.length;
    const filtered = list.filter((c) => c.id !== id);
    this.clients.set(tenantId, filtered);
    return filtered.length < initialLen;
  }
}

describe('ClientService & Tenant Isolation', () => {
  it('garante isolamento estrito de clientes por tenant', async () => {
    const repo = new InMemoryClientRepository();
    const service = new ClientService(repo);

    const tenantA = '11111111-1111-4111-8111-111111111111';
    const tenantB = '22222222-2222-4222-8222-222222222222';

    await service.createClient(tenantA, { name: 'Empresa A', email: 'contato@empresaa.com' });
    await service.createClient(tenantB, { name: 'Empresa B', email: 'contato@empresab.com' });

    const clientsA = await service.listClients(tenantA);
    const clientsB = await service.listClients(tenantB);

    expect(clientsA).toHaveLength(1);
    expect(clientsA[0]!.name).toBe('Empresa A');

    expect(clientsB).toHaveLength(1);
    expect(clientsB[0]!.name).toBe('Empresa B');
  });

  it('valida campos obrigatórios na criação de cliente', async () => {
    const repo = new InMemoryClientRepository();
    const service = new ClientService(repo);
    const tenant = '11111111-1111-4111-8111-111111111111';

    await expect(service.createClient(tenant, { name: '', email: 'valido@test.com' })).rejects.toThrow(
      'Nome do cliente é obrigatório.'
    );
    await expect(service.createClient(tenant, { name: 'Test', email: 'invalido' })).rejects.toThrow(
      'E-mail válido do cliente é obrigatório.'
    );
  });
});
