import { z } from 'zod';
import { ApiError } from '../contracts/errors';
import type { ReiProjectService } from '../domains/rei-projects/service';
import type { IdentityRepository } from '../identity/postgres-identity-repository';
import type { TokenVerifier } from '../identity/verifier';
import { AuthMiddleware } from './auth-middleware';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const EmailSchema = z.string().trim().email().max(254);
const DateLike = z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Data inválida');

const CreateReiProjectSchema = z.object({
  clientId: z.string().trim().max(128).nullable().optional(),
  clientName: z.string().trim().min(1, 'Nome do cliente é obrigatório').max(256),
  clientEmail: EmailSchema,
  clientCompany: z.string().trim().max(256).nullable().optional(),
  analystEmail: EmailSchema,
  lastReiDate: DateLike.optional(),
  nextReiDate: DateLike,
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  year: z.number().int().min(2020).max(2099),
  status: z.enum(['active', 'pending', 'overdue']).optional(),
  type: z.enum(['consulting', 'crm_ops', 'site', 'linkedin', 'founder']).optional(),
  tier: z.enum(['free', 'paid']).optional(),
  durationDays: z.number().int().min(1).max(365).optional(),
  schedulingCompleted: z.boolean().optional(),
  technicalEvidences: z.array(z.unknown()).optional(),
});

const UpdateReiProjectSchema = z.object({
  clientName: z.string().trim().min(1).max(256).optional(),
  clientEmail: EmailSchema.optional(),
  clientCompany: z.string().trim().max(256).nullable().optional(),
  analystEmail: EmailSchema.optional(),
  lastReiDate: DateLike.optional(),
  nextReiDate: DateLike.optional(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
  year: z.number().int().min(2020).max(2099).optional(),
  status: z.enum(['active', 'pending', 'overdue']).optional(),
  type: z.enum(['consulting', 'crm_ops', 'site', 'linkedin', 'founder']).optional(),
  tier: z.enum(['free', 'paid']).optional(),
  durationDays: z.number().int().min(1).max(365).optional(),
  schedulingCompleted: z.boolean().optional(),
  technicalEvidences: z.array(z.unknown()).optional(),
});

function parseBody<T>(raw: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw ApiError.validation(`Payload inválido: ${JSON.stringify(result.error.flatten().fieldErrors)}`);
  }
  return result.data;
}

interface ReiProjectsRoutesDependencies {
  verifier: TokenVerifier;
  identities: IdentityRepository;
  service: ReiProjectService;
}

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function createReiProjectsRoutes(deps: ReiProjectsRoutesDependencies) {
  const auth = new AuthMiddleware(deps);

  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/rei-projects')) return null;

    const authResult = await auth.authenticate(request);
    if (authResult instanceof Response) return authResult;
    const { tenantId } = authResult;

    try {
      const pathParts = url.pathname.split('/').filter(Boolean); // ['v1', 'rei-projects', ':id'?]
      const projectId = pathParts[2]; // undefined se /v1/rei-projects

      if (request.method === 'GET' && !projectId) {
        const projects = await deps.service.listProjects(tenantId);
        return json(200, { data: projects });
      }

      if (request.method === 'GET' && projectId) {
        const project = await deps.service.getProject(tenantId, projectId);
        return json(200, { data: project });
      }

      if (request.method === 'POST' && !projectId) {
        const raw = await request.json().catch(() => null);
        const body = parseBody(raw, CreateReiProjectSchema) as any;
        const project = await deps.service.createProject(tenantId, body);
        return json(201, { data: project });
      }

      if (request.method === 'PUT' && projectId) {
        const raw = await request.json().catch(() => null);
        const body = parseBody(raw, UpdateReiProjectSchema) as any;
        const project = await deps.service.updateProject(tenantId, projectId, body);
        return json(200, { data: project });
      }

      if (request.method === 'DELETE' && projectId) {
        await deps.service.deleteProject(tenantId, projectId);
        return json(200, { data: { success: true } });
      }

      return json(404, { error: { code: 'not_found', message: 'Rota não encontrada.' } });
    } catch (error) {
      if (error instanceof ApiError) {
        const statusMap: Record<string, number> = {
          not_found: 404,
          validation_failed: 400,
          unauthorized: 403,
          unauthenticated: 401,
        };
        return json(statusMap[error.code] ?? 500, { error: { code: error.code, message: error.message } });
      }
      return json(500, { error: { code: 'internal', message: 'Erro interno ao processar requisição.' } });
    }
  };
}
