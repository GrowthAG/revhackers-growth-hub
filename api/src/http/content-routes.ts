import { z } from 'zod';
import { ApiError } from '../contracts/errors';
import { DEFAULT_STAGING_TENANT_ID, AuthMiddleware } from './auth-middleware';
import type { ContentService } from '../domains/content/service';
import type { IdentityRepository } from '../identity/postgres-identity-repository';
import type { TokenVerifier } from '../identity/verifier';

const OptionalUrl = z.string().url().max(2000).optional().or(z.literal('').transform(() => undefined));
const OptionalString = (max = 1024) => z.string().trim().max(max).optional();

// ---- Blog ----
const CreateBlogArticleSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(512),
  slug: z.string().trim().min(1, 'Slug é obrigatório').max(256),
  category: z.string().trim().min(1).max(128),
  excerpt: OptionalString(2048),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  image: OptionalUrl,
  authorId: z.string().uuid('authorId deve ser UUID válido'),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  readTime: OptionalString(32),
  date: z.string().datetime().optional(),
});

const UpdateBlogArticleSchema = z.object({
  title: z.string().trim().min(1).max(512).optional(),
  slug: z.string().trim().min(1).max(256).optional(),
  category: z.string().trim().min(1).max(128).optional(),
  excerpt: z.string().trim().max(2048).nullable().optional(),
  content: z.string().min(1).optional(),
  image: z.string().url().max(2000).nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  readTime: z.string().trim().max(32).nullable().optional(),
  date: z.string().datetime().optional(),
});

// ---- Materials ----
const CreateMaterialSchema = z.object({
  materialName: z.string().trim().min(1, 'Nome do material é obrigatório').max(512),
  slug: z.string().trim().min(1).max(256),
  materialType: z.string().trim().min(1).max(64),
  description: OptionalString(2048),
  linkMaterial: OptionalUrl,
  materialUrl: z.string().min(1, 'URL do material é obrigatória'),
  published: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const UpdateMaterialSchema = z.object({
  materialName: z.string().trim().min(1).max(512).optional(),
  slug: z.string().trim().min(1).max(256).optional(),
  materialType: z.string().trim().min(1).max(64).optional(),
  description: z.string().trim().max(2048).nullable().optional(),
  linkMaterial: z.string().url().max(2000).nullable().optional(),
  materialUrl: z.string().min(1).optional(),
  published: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ---- Cases ----
const CreateCaseStudySchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(512),
  slug: z.string().trim().min(1).max(256),
  clientName: z.string().trim().min(1, 'Nome do cliente é obrigatório').max(256),
  caseCategory: z.string().trim().min(1).max(128),
  headline: z.string().trim().min(1, 'Headline é obrigatório').max(512),
  summary: OptionalString(2048),
  clientLogo: OptionalUrl,
  challenge: OptionalString(8192),
  solution: OptionalString(8192),
  results: OptionalString(8192),
  coverImage: OptionalUrl,
  metrics: z.unknown().optional(),
  testimonial: z.unknown().optional(),
  published: z.boolean().optional(),
});

const UpdateCaseStudySchema = z.object({
  title: z.string().trim().min(1).max(512).optional(),
  slug: z.string().trim().min(1).max(256).optional(),
  clientName: z.string().trim().min(1).max(256).optional(),
  caseCategory: z.string().trim().min(1).max(128).optional(),
  headline: z.string().trim().min(1).max(512).optional(),
  summary: z.string().trim().max(2048).nullable().optional(),
  clientLogo: z.string().url().max(2000).nullable().optional(),
  challenge: z.string().trim().max(8192).nullable().optional(),
  solution: z.string().trim().max(8192).nullable().optional(),
  results: z.string().trim().max(8192).nullable().optional(),
  coverImage: z.string().url().max(2000).nullable().optional(),
  metrics: z.unknown().optional(),
  testimonial: z.unknown().optional(),
  published: z.boolean().optional(),
});

function parseBody<T>(raw: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw ApiError.validation(`Payload inválido: ${JSON.stringify(result.error.flatten().fieldErrors)}`);
  }
  return result.data;
}

interface ContentRoutesDependencies {
  service: ContentService;
  verifier: TokenVerifier;
  identities: IdentityRepository;
}

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

const PUBLIC_BLOG = '/v1/blog/articles';
const PUBLIC_MATERIALS = '/v1/materials';
const PUBLIC_CASES = '/v1/cases';

export function createContentRoutes(deps: ContentRoutesDependencies) {
  const auth = new AuthMiddleware(deps);

  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    const path = url.pathname;

    const isBlog = path === PUBLIC_BLOG || path.startsWith(`${PUBLIC_BLOG}/`);
    const isMaterials = path === PUBLIC_MATERIALS || path.startsWith(`${PUBLIC_MATERIALS}/`);
    const isCases = path === PUBLIC_CASES || path.startsWith(`${PUBLIC_CASES}/`);
    if (!isBlog && !isMaterials && !isCases) return null;

    // GET é público (anônimo lê conteúdo). Mutações exigem auth.
    if (request.method !== 'GET') {
      const authResult = await auth.authenticate(request);
      if (authResult instanceof Response) return authResult;
    }

    try {
      // GET público sempre usa o tenant padrão de RevHackers.
      const tenantId = DEFAULT_STAGING_TENANT_ID;

      if (isBlog) {
        const articleId = path.slice(PUBLIC_BLOG.length + 1) || undefined;
        if (request.method === 'GET' && !articleId) {
          const publishedOnly = url.searchParams.get('published') !== 'false';
          const list = await deps.service.listBlogArticles(tenantId, publishedOnly);
          return json(200, { data: list });
        }
        if (request.method === 'GET' && articleId) {
          const article = await deps.service.getBlogArticleBySlug(tenantId, articleId);
          return json(200, { data: article });
        }
        if (request.method === 'POST' && !articleId) {
          const raw = await request.json().catch(() => null);
          const body = parseBody(raw, CreateBlogArticleSchema);
          const created = await deps.service.createBlogArticle(tenantId, body);
          return json(201, { data: created });
        }
        if (request.method === 'PUT' && articleId) {
          const raw = await request.json().catch(() => null);
          const body = parseBody(raw, UpdateBlogArticleSchema);
          const updated = await deps.service.updateBlogArticle(tenantId, articleId, body);
          return json(200, { data: updated });
        }
        if (request.method === 'DELETE' && articleId) {
          await deps.service.deleteBlogArticle(tenantId, articleId);
          return json(200, { data: { success: true } });
        }
      }

      if (isMaterials) {
        const materialId = path.slice(PUBLIC_MATERIALS.length + 1) || undefined;
        if (request.method === 'GET' && !materialId) {
          const publishedOnly = url.searchParams.get('published') !== 'false';
          const list = await deps.service.listMaterials(tenantId, publishedOnly);
          return json(200, { data: list });
        }
        if (request.method === 'GET' && materialId) {
          const material = await deps.service.getMaterialBySlug(tenantId, materialId);
          return json(200, { data: material });
        }
        if (request.method === 'POST' && !materialId) {
          const raw = await request.json().catch(() => null);
          const body = parseBody(raw, CreateMaterialSchema);
          const created = await deps.service.createMaterial(tenantId, body);
          return json(201, { data: created });
        }
        if (request.method === 'PUT' && materialId) {
          const raw = await request.json().catch(() => null);
          const body = parseBody(raw, UpdateMaterialSchema);
          const updated = await deps.service.updateMaterial(tenantId, materialId, body);
          return json(200, { data: updated });
        }
        if (request.method === 'DELETE' && materialId) {
          await deps.service.deleteMaterial(tenantId, materialId);
          return json(200, { data: { success: true } });
        }
      }

      if (isCases) {
        const caseId = path.slice(PUBLIC_CASES.length + 1) || undefined;
        if (request.method === 'GET' && !caseId) {
          const publishedOnly = url.searchParams.get('published') !== 'false';
          const list = await deps.service.listCaseStudies(tenantId, publishedOnly);
          return json(200, { data: list });
        }
        if (request.method === 'GET' && caseId) {
          const caseStudy = await deps.service.getCaseStudyBySlug(tenantId, caseId);
          return json(200, { data: caseStudy });
        }
        if (request.method === 'POST' && !caseId) {
          const raw = await request.json().catch(() => null);
          const body = parseBody(raw, CreateCaseStudySchema);
          const created = await deps.service.createCaseStudy(tenantId, body);
          return json(201, { data: created });
        }
        if (request.method === 'PUT' && caseId) {
          const raw = await request.json().catch(() => null);
          const body = parseBody(raw, UpdateCaseStudySchema);
          const updated = await deps.service.updateCaseStudy(tenantId, caseId, body);
          return json(200, { data: updated });
        }
        if (request.method === 'DELETE' && caseId) {
          await deps.service.deleteCaseStudy(tenantId, caseId);
          return json(200, { data: { success: true } });
        }
      }

      return json(404, { error: { code: 'not_found', message: 'Rota não encontrada.' } });
    } catch (error) {
      if (error instanceof ApiError) {
        const statusMap: Record<string, number> = {
          not_found: 404,
          validation: 400,
          forbidden: 403,
          unauthenticated: 401,
        };
        return json(statusMap[error.code] ?? 500, { error: { code: error.code, message: error.message } });
      }
      return json(500, { error: { code: 'internal', message: 'Erro interno ao processar requisição.' } });
    }
  };
}
