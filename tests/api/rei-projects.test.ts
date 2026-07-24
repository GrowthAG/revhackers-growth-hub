import { describe, expect, it } from 'vitest';
import { ReiProjectService } from '../../api/src/domains/rei-projects/service';
import type { CreateReiProjectInput, ReiProjectRecord } from '../../api/src/domains/rei-projects/contracts';
import type { ReiProjectRepository } from '../../api/src/domains/rei-projects/repository';

class InMemoryReiProjectRepository implements ReiProjectRepository {
  private projects: Map<string, ReiProjectRecord[]> = new Map();

  async list(tenantId: string): Promise<ReiProjectRecord[]> {
    return this.projects.get(tenantId) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<ReiProjectRecord | null> {
    const list = this.projects.get(tenantId) ?? [];
    return list.find((p) => p.id === id) ?? null;
  }

  async create(tenantId: string, input: CreateReiProjectInput): Promise<ReiProjectRecord> {
    const list = this.projects.get(tenantId) ?? [];
    const record: ReiProjectRecord = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId,
      clientId: input.clientId ?? null,
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientCompany: input.clientCompany ?? null,
      analystEmail: input.analystEmail,
      lastReiDate: input.lastReiDate ?? new Date().toISOString(),
      nextReiDate: input.nextReiDate,
      quarter: input.quarter,
      year: input.year,
      status: input.status ?? 'active',
      type: input.type ?? 'consulting',
      tier: input.tier ?? 'paid',
      durationDays: input.durationDays ?? 90,
      schedulingCompleted: input.schedulingCompleted ?? false,
      technicalEvidences: input.technicalEvidences ?? [],
      clickupSpaceId: null,
      clickupFolderId: null,
      clickupDocId: null,
      clickupSprintFolderId: null,
      clickupProvisionedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(record);
    this.projects.set(tenantId, list);
    return record;
  }

  async update(tenantId: string, id: string, input: Partial<CreateReiProjectInput>): Promise<ReiProjectRecord | null> {
    const list = this.projects.get(tenantId) ?? [];
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const current = list[index];
    if (!current) return null;
    const updated: ReiProjectRecord = {
      ...current,
      ...input,
      id: current.id,
      tenantId: current.tenantId,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.projects.set(tenantId, list);
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const list = this.projects.get(tenantId) ?? [];
    const initialLen = list.length;
    const filtered = list.filter((p) => p.id !== id);
    this.projects.set(tenantId, filtered);
    return filtered.length < initialLen;
  }
}

describe('ReiProjectService & Tenant Isolation', () => {
  it('garante isolamento estrito de projetos por tenant', async () => {
    const repo = new InMemoryReiProjectRepository();
    const service = new ReiProjectService(repo);

    const tenantA = '11111111-1111-4111-8111-111111111111';
    const tenantB = '22222222-2222-4222-8222-222222222222';

    await service.createProject(tenantA, {
      clientName: 'Cliente A',
      clientEmail: 'clienteA@test.com',
      analystEmail: 'analista@revhackers.com',
      nextReiDate: new Date().toISOString(),
      quarter: 'Q3',
      year: 2026,
    });

    await service.createProject(tenantB, {
      clientName: 'Cliente B',
      clientEmail: 'clienteB@test.com',
      analystEmail: 'analista@revhackers.com',
      nextReiDate: new Date().toISOString(),
      quarter: 'Q3',
      year: 2026,
    });

    const projectsA = await service.listProjects(tenantA);
    const projectsB = await service.listProjects(tenantB);

    expect(projectsA).toHaveLength(1);
    expect(projectsA[0]!.clientName).toBe('Cliente A');

    expect(projectsB).toHaveLength(1);
    expect(projectsB[0]!.clientName).toBe('Cliente B');
  });

  it('valida campos obrigatórios ao criar projeto REI', async () => {
    const repo = new InMemoryReiProjectRepository();
    const service = new ReiProjectService(repo);
    const tenant = '11111111-1111-4111-8111-111111111111';

    await expect(
      service.createProject(tenant, {
        clientName: '',
        clientEmail: 'c@test.com',
        analystEmail: 'a@test.com',
        nextReiDate: new Date().toISOString(),
        quarter: 'Q3',
        year: 2026,
      })
    ).rejects.toThrow('Nome do cliente é obrigatório.');

    await expect(
      service.createProject(tenant, {
        clientName: 'Cliente',
        clientEmail: 'c@test.com',
        analystEmail: 'invalido',
        nextReiDate: new Date().toISOString(),
        quarter: 'Q3',
        year: 2026,
      })
    ).rejects.toThrow('E-mail válido do analista é obrigatório.');
  });
});
