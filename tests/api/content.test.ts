import { describe, expect, it } from 'vitest';
import { ContentService } from '../../api/src/domains/content/service';
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
} from '../../api/src/domains/content/contracts';
import type { ContentRepository } from '../../api/src/domains/content/repository';

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';

class InMemoryContentRepository implements ContentRepository {
  private blogArticles: Map<string, BlogArticleRecord[]> = new Map();
  private materials: Map<string, MaterialRecord[]> = new Map();
  private caseStudies: Map<string, CaseStudyRecord[]> = new Map();

  // Blog
  async listBlogArticles(tenantId: string, opts?: { publishedOnly?: boolean }): Promise<BlogArticleRecord[]> {
    const list = this.blogArticles.get(tenantId) ?? [];
    if (opts?.publishedOnly) return list.filter((a) => a.published);
    return list;
  }
  async getBlogArticleBySlug(tenantId: string, slug: string): Promise<BlogArticleRecord | null> {
    const list = this.blogArticles.get(tenantId) ?? [];
    return list.find((a) => a.slug === slug) ?? null;
  }
  async createBlogArticle(tenantId: string, input: CreateBlogArticleInput): Promise<BlogArticleRecord> {
    const record: BlogArticleRecord = {
      id: crypto.randomUUID(),
      tenantId,
      title: input.title,
      slug: input.slug,
      category: input.category,
      excerpt: input.excerpt ?? null,
      content: input.content,
      image: input.image ?? null,
      authorId: input.authorId,
      published: input.published ?? false,
      featured: input.featured ?? false,
      readTime: input.readTime ?? null,
      date: input.date ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = this.blogArticles.get(tenantId) ?? [];
    list.push(record);
    this.blogArticles.set(tenantId, list);
    return record;
  }
  async updateBlogArticle(tenantId: string, id: string, input: UpdateBlogArticleInput): Promise<BlogArticleRecord | null> {
    const list = this.blogArticles.get(tenantId) ?? [];
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...input, updatedAt: new Date().toISOString() } as BlogArticleRecord;
    list[index] = updated;
    this.blogArticles.set(tenantId, list);
    return updated;
  }
  async deleteBlogArticle(tenantId: string, id: string): Promise<boolean> {
    const list = this.blogArticles.get(tenantId) ?? [];
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.blogArticles.set(tenantId, list);
    return true;
  }

  // Materials
  async listMaterials(tenantId: string, opts?: { publishedOnly?: boolean }): Promise<MaterialRecord[]> {
    const list = this.materials.get(tenantId) ?? [];
    if (opts?.publishedOnly) return list.filter((m) => m.published);
    return list;
  }
  async getMaterialBySlug(tenantId: string, slug: string): Promise<MaterialRecord | null> {
    const list = this.materials.get(tenantId) ?? [];
    return list.find((m) => m.slug === slug) ?? null;
  }
  async createMaterial(tenantId: string, input: CreateMaterialInput): Promise<MaterialRecord> {
    const record: MaterialRecord = {
      id: crypto.randomUUID(),
      tenantId,
      materialName: input.materialName,
      slug: input.slug,
      materialType: input.materialType,
      description: input.description ?? null,
      linkMaterial: input.linkMaterial ?? null,
      materialUrl: input.materialUrl,
      published: input.published ?? false,
      isActive: input.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = this.materials.get(tenantId) ?? [];
    list.push(record);
    this.materials.set(tenantId, list);
    return record;
  }
  async updateMaterial(tenantId: string, id: string, input: UpdateMaterialInput): Promise<MaterialRecord | null> {
    const list = this.materials.get(tenantId) ?? [];
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...input } as MaterialRecord;
    list[index] = updated;
    this.materials.set(tenantId, list);
    return updated;
  }
  async deleteMaterial(tenantId: string, id: string): Promise<boolean> {
    const list = this.materials.get(tenantId) ?? [];
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.materials.set(tenantId, list);
    return true;
  }

  // Cases
  async listCaseStudies(tenantId: string, opts?: { publishedOnly?: boolean }): Promise<CaseStudyRecord[]> {
    const list = this.caseStudies.get(tenantId) ?? [];
    if (opts?.publishedOnly) return list.filter((c) => c.published);
    return list;
  }
  async getCaseStudyBySlug(tenantId: string, slug: string): Promise<CaseStudyRecord | null> {
    const list = this.caseStudies.get(tenantId) ?? [];
    return list.find((c) => c.slug === slug) ?? null;
  }
  async createCaseStudy(tenantId: string, input: CreateCaseStudyInput): Promise<CaseStudyRecord> {
    const record: CaseStudyRecord = {
      id: crypto.randomUUID(),
      tenantId,
      title: input.title,
      slug: input.slug,
      clientName: input.clientName,
      caseCategory: input.caseCategory,
      headline: input.headline,
      summary: input.summary ?? null,
      clientLogo: input.clientLogo ?? null,
      challenge: input.challenge ?? null,
      solution: input.solution ?? null,
      results: input.results ?? null,
      coverImage: input.coverImage ?? null,
      metrics: input.metrics ?? null,
      testimonial: input.testimonial ?? null,
      published: input.published ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = this.caseStudies.get(tenantId) ?? [];
    list.push(record);
    this.caseStudies.set(tenantId, list);
    return record;
  }
  async updateCaseStudy(tenantId: string, id: string, input: UpdateCaseStudyInput): Promise<CaseStudyRecord | null> {
    const list = this.caseStudies.get(tenantId) ?? [];
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...input } as CaseStudyRecord;
    list[index] = updated;
    this.caseStudies.set(tenantId, list);
    return updated;
  }
  async deleteCaseStudy(tenantId: string, id: string): Promise<boolean> {
    const list = this.caseStudies.get(tenantId) ?? [];
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.caseStudies.set(tenantId, list);
    return true;
  }
}

describe('ContentService - Blog Articles', () => {
  it('garante isolamento estrito de artigos por tenant', async () => {
    const repo = new InMemoryContentRepository();
    const service = new ContentService(repo);

    await service.createBlogArticle(TENANT_A, {
      title: 'Artigo A',
      slug: 'artigo-a',
      category: 'marketing',
      content: 'Conteúdo A',
      authorId: 'user-1',
    });
    await service.createBlogArticle(TENANT_B, {
      title: 'Artigo B',
      slug: 'artigo-b',
      category: 'vendas',
      content: 'Conteúdo B',
      authorId: 'user-2',
    });

    const articlesA = await service.listBlogArticles(TENANT_A);
    const articlesB = await service.listBlogArticles(TENANT_B);

    expect(articlesA).toHaveLength(1);
    expect(articlesA[0]?.title).toBe('Artigo A');
    expect(articlesB).toHaveLength(1);
    expect(articlesB[0]?.title).toBe('Artigo B');
  });

  it('filtra artigos publicados com publishedOnly', async () => {
    const repo = new InMemoryContentRepository();
    const service = new ContentService(repo);

    await service.createBlogArticle(TENANT_A, {
      title: 'Público',
      slug: 'publico',
      category: 'marketing',
      content: 'Conteúdo',
      authorId: 'user-1',
      published: true,
    });
    await service.createBlogArticle(TENANT_A, {
      title: 'Rascunho',
      slug: 'rascunho',
      category: 'marketing',
      content: 'Conteúdo',
      authorId: 'user-1',
      published: false,
    });

    const all = await service.listBlogArticles(TENANT_A);
    const published = await service.listBlogArticles(TENANT_A, true);

    expect(all).toHaveLength(2);
    expect(published).toHaveLength(1);
    expect(published[0]?.title).toBe('Público');
  });

  it('valida campos obrigatórios na criação de artigo', async () => {
    const repo = new InMemoryContentRepository();
    const service = new ContentService(repo);

    await expect(
      service.createBlogArticle(TENANT_A, {
        title: '',
        slug: 'test',
        category: 'cat',
        content: 'content',
        authorId: 'user-1',
      })
    ).rejects.toThrow();
  });
});

describe('ContentService - Materials', () => {
  it('garante isolamento estrito de materiais por tenant', async () => {
    const repo = new InMemoryContentRepository();
    const service = new ContentService(repo);

    await service.createMaterial(TENANT_A, {
      materialName: 'Material A',
      slug: 'material-a',
      materialType: 'ebook',
      materialUrl: 'https://example.com/a.pdf',
    });
    await service.createMaterial(TENANT_B, {
      materialName: 'Material B',
      slug: 'material-b',
      materialType: 'template',
      materialUrl: 'https://example.com/b.xlsx',
    });

    const matsA = await service.listMaterials(TENANT_A);
    const matsB = await service.listMaterials(TENANT_B);

    expect(matsA).toHaveLength(1);
    expect(matsA[0]?.materialName).toBe('Material A');
    expect(matsB).toHaveLength(1);
    expect(matsB[0]?.materialName).toBe('Material B');
  });

  it('filtra materiais publicados com publishedOnly', async () => {
    const repo = new InMemoryContentRepository();
    const service = new ContentService(repo);

    await service.createMaterial(TENANT_A, {
      materialName: 'Público',
      slug: 'material-publico',
      materialType: 'ebook',
      materialUrl: 'https://example.com/pub.pdf',
      published: true,
    });
    await service.createMaterial(TENANT_A, {
      materialName: 'Rascunho',
      slug: 'material-rascunho',
      materialType: 'ebook',
      materialUrl: 'https://example.com/draft.pdf',
      published: false,
    });

    const all = await service.listMaterials(TENANT_A);
    const published = await service.listMaterials(TENANT_A, true);

    expect(all).toHaveLength(2);
    expect(published).toHaveLength(1);
    expect(published[0]?.materialName).toBe('Público');
  });
});

describe('ContentService - Case Studies', () => {
  it('garante isolamento estrito de cases por tenant', async () => {
    const repo = new InMemoryContentRepository();
    const service = new ContentService(repo);

    await service.createCaseStudy(TENANT_A, {
      title: 'Case A',
      headline: 'Case A Headline',
      slug: 'case-a',
      clientName: 'Empresa A',
      caseCategory: 'marketing',
      challenge: 'Desafio A',
      solution: 'Solução A',
      results: 'Resultado A',
    });
    await service.createCaseStudy(TENANT_B, {
      title: 'Case B',
      headline: 'Case B Headline',
      slug: 'case-b',
      clientName: 'Empresa B',
      caseCategory: 'vendas',
      challenge: 'Desafio B',
      solution: 'Solução B',
      results: 'Resultado B',
    });

    const casesA = await service.listCaseStudies(TENANT_A);
    const casesB = await service.listCaseStudies(TENANT_B);

    expect(casesA).toHaveLength(1);
    expect(casesA[0]?.clientName).toBe('Empresa A');
    expect(casesB).toHaveLength(1);
    expect(casesB[0]?.clientName).toBe('Empresa B');
  });

  it('filtra cases publicados com publishedOnly', async () => {
    const repo = new InMemoryContentRepository();
    const service = new ContentService(repo);

    await service.createCaseStudy(TENANT_A, {
      title: 'Case Público',
      headline: 'Headline Público',
      slug: 'case-publico',
      clientName: 'Empresa Pub',
      caseCategory: 'marketing',
      challenge: 'D',
      solution: 'S',
      results: 'R',
      published: true,
    });
    await service.createCaseStudy(TENANT_A, {
      title: 'Case Rascunho',
      headline: 'Headline Rascunho',
      slug: 'case-rascunho',
      clientName: 'Empresa Draft',
      caseCategory: 'marketing',
      challenge: 'D',
      solution: 'S',
      results: 'R',
      published: false,
    });

    const all = await service.listCaseStudies(TENANT_A);
    const published = await service.listCaseStudies(TENANT_A, true);

    expect(all).toHaveLength(2);
    expect(published).toHaveLength(1);
    expect(published[0]?.clientName).toBe('Empresa Pub');
  });

  it('valida campos obrigatórios na criação de case', async () => {
    const repo = new InMemoryContentRepository();
    const service = new ContentService(repo);

    await expect(
      service.createCaseStudy(TENANT_A, {
        title: '',
        headline: 'Headline',
        slug: 'test',
        clientName: 'Client',
        caseCategory: 'cat',
        challenge: 'D',
        solution: 'S',
        results: 'R',
      })
    ).rejects.toThrow();
  });
});
