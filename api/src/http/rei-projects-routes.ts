import { ApiError } from '../contracts/errors';
import type { ReiProjectService } from '../domains/rei-projects/service';
import type { IdentityRepository } from '../identity/postgres-identity-repository';
import type { TokenVerifier } from '../identity/verifier';
import { AuthMiddleware } from './auth-middleware';

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
        const body = await request.json();
        const project = await deps.service.createProject(tenantId, body);
        return json(201, { data: project });
      }

      if (request.method === 'PUT' && projectId) {
        const body = await request.json();
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
