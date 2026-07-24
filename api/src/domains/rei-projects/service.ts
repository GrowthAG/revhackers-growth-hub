import { ApiError } from '../../contracts/errors';
import type { TenantId } from '../../contracts/tenant';
import type { CreateReiProjectInput, ReiProjectRecord, UpdateReiProjectInput } from './contracts';
import type { ReiProjectRepository } from './repository';

export class ReiProjectService {
  constructor(private readonly repository: ReiProjectRepository) {}

  async listProjects(tenantId: TenantId): Promise<ReiProjectRecord[]> {
    return this.repository.list(tenantId);
  }

  async getProject(tenantId: TenantId, id: string): Promise<ReiProjectRecord> {
    const project = await this.repository.findById(tenantId, id);
    if (!project) throw ApiError.notFound('Projeto REI não encontrado.');
    return project;
  }

  async createProject(tenantId: TenantId, input: CreateReiProjectInput): Promise<ReiProjectRecord> {
    if (!input.clientName?.trim()) throw ApiError.validation('Nome do cliente é obrigatório.');
    if (!input.clientEmail?.trim() || !input.clientEmail.includes('@')) {
      throw ApiError.validation('E-mail válido do cliente é obrigatório.');
    }
    if (!input.analystEmail?.trim() || !input.analystEmail.includes('@')) {
      throw ApiError.validation('E-mail válido do analista é obrigatório.');
    }
    if (!input.nextReiDate) throw ApiError.validation('Data da próxima REI é obrigatória.');

    return this.repository.create(tenantId, input);
  }

  async updateProject(tenantId: TenantId, id: string, input: UpdateReiProjectInput): Promise<ReiProjectRecord> {
    if (input.clientName !== undefined && !input.clientName.trim()) {
      throw ApiError.validation('Nome do cliente não pode ser vazio.');
    }
    if (input.clientEmail !== undefined && (!input.clientEmail.trim() || !input.clientEmail.includes('@'))) {
      throw ApiError.validation('E-mail do cliente deve ser válido.');
    }
    const updated = await this.repository.update(tenantId, id, input);
    if (!updated) throw ApiError.notFound('Projeto REI não encontrado.');
    return updated;
  }

  async deleteProject(tenantId: TenantId, id: string): Promise<void> {
    const deleted = await this.repository.delete(tenantId, id);
    if (!deleted) throw ApiError.notFound('Projeto REI não encontrado.');
  }
}
