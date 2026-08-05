import { ApiError } from '../../contracts/errors';
import type { TenantId } from '../../contracts/tenant';
import type {
  BlogArticleRecord,
  CaseStudyRecord,
  CreateBlogArticleInput,
  CreateCaseStudyInput,
  CreateMaterialInput,
  MaterialRecord,
  UpdateBlogArticleInput,
  UpdateCaseStudyInput,
  UpdateMaterialInput,
} from './contracts';
import type { ContentRepository } from './repository';

export class ContentService {
  constructor(private readonly repository: ContentRepository) {}

  // ---- Blog ----
  async listBlogArticles(tenantId: TenantId, publishedOnly = false): Promise<BlogArticleRecord[]> {
    return this.repository.listBlogArticles(tenantId, { publishedOnly });
  }

  async getBlogArticleBySlug(tenantId: TenantId, slug: string): Promise<BlogArticleRecord> {
    const article = await this.repository.getBlogArticleBySlug(tenantId, slug);
    if (!article) throw ApiError.notFound('Artigo não encontrado.');
    return article;
  }

  async createBlogArticle(tenantId: TenantId, input: CreateBlogArticleInput): Promise<BlogArticleRecord> {
    if (!input.title?.trim()) throw ApiError.validation('Título do artigo é obrigatório.');
    if (!input.slug?.trim()) throw ApiError.validation('Slug do artigo é obrigatório.');
    if (!input.content?.trim()) throw ApiError.validation('Conteúdo do artigo é obrigatório.');
    return this.repository.createBlogArticle(tenantId, input);
  }

  async updateBlogArticle(tenantId: TenantId, id: string, input: UpdateBlogArticleInput): Promise<BlogArticleRecord> {
    const updated = await this.repository.updateBlogArticle(tenantId, id, input);
    if (!updated) throw ApiError.notFound('Artigo não encontrado.');
    return updated;
  }

  async deleteBlogArticle(tenantId: TenantId, id: string): Promise<void> {
    const deleted = await this.repository.deleteBlogArticle(tenantId, id);
    if (!deleted) throw ApiError.notFound('Artigo não encontrado.');
  }

  // ---- Materials ----
  async listMaterials(tenantId: TenantId, publishedOnly = false): Promise<MaterialRecord[]> {
    return this.repository.listMaterials(tenantId, { publishedOnly });
  }

  async getMaterialBySlug(tenantId: TenantId, slug: string): Promise<MaterialRecord> {
    const material = await this.repository.getMaterialBySlug(tenantId, slug);
    if (!material) throw ApiError.notFound('Material não encontrado.');
    return material;
  }

  async createMaterial(tenantId: TenantId, input: CreateMaterialInput): Promise<MaterialRecord> {
    if (!input.materialName?.trim()) throw ApiError.validation('Nome do material é obrigatório.');
    if (!input.slug?.trim()) throw ApiError.validation('Slug do material é obrigatório.');
    if (!input.materialUrl?.trim()) throw ApiError.validation('URL do material é obrigatório.');
    return this.repository.createMaterial(tenantId, input);
  }

  async updateMaterial(tenantId: TenantId, id: string, input: UpdateMaterialInput): Promise<MaterialRecord> {
    const updated = await this.repository.updateMaterial(tenantId, id, input);
    if (!updated) throw ApiError.notFound('Material não encontrado.');
    return updated;
  }

  async deleteMaterial(tenantId: TenantId, id: string): Promise<void> {
    const deleted = await this.repository.deleteMaterial(tenantId, id);
    if (!deleted) throw ApiError.notFound('Material não encontrado.');
  }

  // ---- Cases ----
  async listCaseStudies(tenantId: TenantId, publishedOnly = false): Promise<CaseStudyRecord[]> {
    return this.repository.listCaseStudies(tenantId, { publishedOnly });
  }

  async getCaseStudyBySlug(tenantId: TenantId, slug: string): Promise<CaseStudyRecord> {
    const caseStudy = await this.repository.getCaseStudyBySlug(tenantId, slug);
    if (!caseStudy) throw ApiError.notFound('Case não encontrado.');
    return caseStudy;
  }

  async createCaseStudy(tenantId: TenantId, input: CreateCaseStudyInput): Promise<CaseStudyRecord> {
    if (!input.title?.trim()) throw ApiError.validation('Título do case é obrigatório.');
    if (!input.slug?.trim()) throw ApiError.validation('Slug do case é obrigatório.');
    if (!input.clientName?.trim()) throw ApiError.validation('Nome do cliente é obrigatório.');
    if (!input.headline?.trim()) throw ApiError.validation('Headline do case é obrigatório.');
    return this.repository.createCaseStudy(tenantId, input);
  }

  async updateCaseStudy(tenantId: TenantId, id: string, input: UpdateCaseStudyInput): Promise<CaseStudyRecord> {
    const updated = await this.repository.updateCaseStudy(tenantId, id, input);
    if (!updated) throw ApiError.notFound('Case não encontrado.');
    return updated;
  }

  async deleteCaseStudy(tenantId: TenantId, id: string): Promise<void> {
    const deleted = await this.repository.deleteCaseStudy(tenantId, id);
    if (!deleted) throw ApiError.notFound('Case não encontrado.');
  }
}
