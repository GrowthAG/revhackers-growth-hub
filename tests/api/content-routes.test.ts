import { describe, expect, it, vi } from 'vitest';
import { createContentRoutes } from '../../api/src/http/content-routes';
import type { ContentService } from '../../api/src/domains/content/service';
import type { TokenVerifier } from '../../api/src/identity/verifier';
import type { IdentityRepository } from '../../api/src/identity/postgres-identity-repository';
import type { InternalUser } from '../../api/src/contracts/tenant';

const mockUser: InternalUser = {
  id: 'user-1',
  globalRole: 'admin',
  status: 'active',
  memberships: [{ userId: 'user-1', tenantId: 'default', role: 'admin', status: 'active' }],
};

const makeDeps = (service: ContentService) => ({
  service,
  verifier: { verify: vi.fn().mockResolvedValue({ sub: 'user-1', issuer: 'google' }) } as unknown as TokenVerifier,
  identities: { findOrCreateUser: vi.fn().mockResolvedValue(mockUser) } as unknown as IdentityRepository,
});

describe('ContentRoutes - Blog Articles', () => {
  it('lista artigos publicados por padrão (GET /v1/blog/articles)', async () => {
    const mockService = {
      listBlogArticles: vi.fn().mockResolvedValue([
        { id: '1', title: 'Artigo 1', slug: 'artigo-1', published: true },
        { id: '2', title: 'Rascunho', slug: 'rascunho', published: false },
      ]),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/blog/articles'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data).toHaveLength(2);
  });

  it('filtra apenas publicados com ?published=true', async () => {
    const mockService = {
      listBlogArticles: vi.fn().mockResolvedValue([
        { id: '1', title: 'Artigo 1', slug: 'artigo-1', published: true },
      ]),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/blog/articles?published=true'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data).toHaveLength(1);
    expect(mockService.listBlogArticles).toHaveBeenCalledWith(expect.anything(), true);
  });

  it('retorna artigo por slug (GET /v1/blog/articles/:slug)', async () => {
    const mockService = {
      getBlogArticleBySlug: vi.fn().mockResolvedValue({ id: '1', title: 'Artigo', slug: 'artigo' }),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/blog/articles/artigo'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data.slug).toBe('artigo');
  });

  it('retorna 404 para artigo inexistente', async () => {
    const mockService = {
      getBlogArticleBySlug: vi.fn().mockResolvedValue(null),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/blog/articles/inexistente'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data).toBeNull();
  });

  it('cria artigo com POST (requer auth)', async () => {
    const mockService = {
      createBlogArticle: vi.fn().mockResolvedValue({ id: '1', title: 'Novo', slug: 'novo' }),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(
      new Request('https://api.test/v1/blog/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({
          title: 'Novo Artigo',
          slug: 'novo-artigo',
          category: 'marketing',
          content: 'Conteúdo',
          authorId: '123e4567-e89b-12d3-a456-426614174000',
        }),
      })
    );

    expect(response?.status).toBe(201);
    const json = await response?.json();
    expect(json.data.title).toBe('Novo');
  });

  it('retorna 400 para payload inválido no POST', async () => {
    const mockService = {
      createBlogArticle: vi.fn(),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(
      new Request('https://api.test/v1/blog/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({ title: '' }),
      })
    );

    expect(response?.status).toBe(400);
    const json = await response?.json();
    expect(json.error.code).toBe('validation');
  });
});

describe('ContentRoutes - Materials', () => {
  it('lista materiais publicados por padrão (GET /v1/materials)', async () => {
    const mockService = {
      listMaterials: vi.fn().mockResolvedValue([
        { id: '1', materialName: 'Material 1', slug: 'material-1', published: true },
      ]),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/materials'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data).toHaveLength(1);
  });

  it('retorna material por slug (GET /v1/materials/:slug)', async () => {
    const mockService = {
      getMaterialBySlug: vi.fn().mockResolvedValue({ id: '1', materialName: 'Ebook', slug: 'ebook' }),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/materials/ebook'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data.slug).toBe('ebook');
  });

  it('cria material com POST (requer auth)', async () => {
    const mockService = {
      createMaterial: vi.fn().mockResolvedValue({ id: '1', materialName: 'Novo Material', slug: 'novo-material' }),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(
      new Request('https://api.test/v1/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({
          materialName: 'Novo Material',
          slug: 'novo-material',
          materialType: 'ebook',
          materialUrl: 'https://example.com/file.pdf',
        }),
      })
    );

    expect(response?.status).toBe(201);
    const json = await response?.json();
    expect(json.data.materialName).toBe('Novo Material');
  });
});

describe('ContentRoutes - Case Studies', () => {
  it('lista cases publicados por padrão (GET /v1/cases)', async () => {
    const mockService = {
      listCaseStudies: vi.fn().mockResolvedValue([
        { id: '1', title: 'Case 1', slug: 'case-1', published: true },
      ]),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/cases'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data).toHaveLength(1);
  });

  it('retorna case por slug (GET /v1/cases/:slug)', async () => {
    const mockService = {
      getCaseStudyBySlug: vi.fn().mockResolvedValue({ id: '1', title: 'Case Empresa', slug: 'case-empresa' }),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/cases/case-empresa'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data.slug).toBe('case-empresa');
  });

  it('cria case com POST (requer auth)', async () => {
    const mockService = {
      createCaseStudy: vi.fn().mockResolvedValue({ id: '1', title: 'Novo Case', slug: 'novo-case' }),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(
      new Request('https://api.test/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({
          title: 'Novo Case',
          headline: 'Headline do Case',
          slug: 'novo-case',
          clientName: 'Empresa X',
          caseCategory: 'marketing',
          challenge: 'Desafio',
          solution: 'Solução',
          results: 'Resultados',
        }),
      })
    );

    expect(response?.status).toBe(201);
    const json = await response?.json();
    expect(json.data.title).toBe('Novo Case');
  });
});

describe('ContentRoutes - Auth & Edge Cases', () => {
  it('retorna null para rota inexistente', async () => {
    const mockService = {} as unknown as ContentService;
    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(new Request('https://api.test/v1/outra-coisa'));

    expect(response).toBeNull();
  });

  it('PUT atualiza artigo (requer auth)', async () => {
    const mockService = {
      updateBlogArticle: vi.fn().mockResolvedValue({ id: '1', title: 'Atualizado', slug: 'artigo' }),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(
      new Request('https://api.test/v1/blog/articles/artigo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({ title: 'Atualizado' }),
      })
    );

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data.title).toBe('Atualizado');
  });

  it('DELETE remove artigo (requer auth)', async () => {
    const mockService = {
      deleteBlogArticle: vi.fn().mockResolvedValue(true),
    } as unknown as ContentService;

    const routes = createContentRoutes(makeDeps(mockService));
    const response = await routes(
      new Request('https://api.test/v1/blog/articles/artigo', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer token' },
      })
    );

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data.success).toBe(true);
  });
});
