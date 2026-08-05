import type { TenantId } from '../../contracts/tenant';
import type {
  BlogArticleRecord,
  CreateBlogArticleInput,
  CreateCaseStudyInput,
  CreateMaterialInput,
  CaseStudyRecord,
  MaterialRecord,
  UpdateBlogArticleInput,
  UpdateCaseStudyInput,
  UpdateMaterialInput,
} from './contracts';

export interface ContentRepository {
  // Blog
  listBlogArticles(tenantId: TenantId, opts?: { publishedOnly?: boolean }): Promise<BlogArticleRecord[]>;
  getBlogArticleBySlug(tenantId: TenantId, slug: string): Promise<BlogArticleRecord | null>;
  createBlogArticle(tenantId: TenantId, input: CreateBlogArticleInput): Promise<BlogArticleRecord>;
  updateBlogArticle(tenantId: TenantId, id: string, input: UpdateBlogArticleInput): Promise<BlogArticleRecord | null>;
  deleteBlogArticle(tenantId: TenantId, id: string): Promise<boolean>;

  // Materials
  listMaterials(tenantId: TenantId, opts?: { publishedOnly?: boolean }): Promise<MaterialRecord[]>;
  getMaterialBySlug(tenantId: TenantId, slug: string): Promise<MaterialRecord | null>;
  createMaterial(tenantId: TenantId, input: CreateMaterialInput): Promise<MaterialRecord>;
  updateMaterial(tenantId: TenantId, id: string, input: UpdateMaterialInput): Promise<MaterialRecord | null>;
  deleteMaterial(tenantId: TenantId, id: string): Promise<boolean>;

  // Cases
  listCaseStudies(tenantId: TenantId, opts?: { publishedOnly?: boolean }): Promise<CaseStudyRecord[]>;
  getCaseStudyBySlug(tenantId: TenantId, slug: string): Promise<CaseStudyRecord | null>;
  createCaseStudy(tenantId: TenantId, input: CreateCaseStudyInput): Promise<CaseStudyRecord>;
  updateCaseStudy(tenantId: TenantId, id: string, input: UpdateCaseStudyInput): Promise<CaseStudyRecord | null>;
  deleteCaseStudy(tenantId: TenantId, id: string): Promise<boolean>;
}
