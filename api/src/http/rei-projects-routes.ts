import { ApiError } from '../contracts/errors';
import type { ReiProjectService } from '../domains/rei-projects/service';
import type { IdentityRepository } from '../identity/postgres-identity-repository';
import type { GoogleIdentityTokenVerifier } from '../identity/google-identity-verifier';
import { jsonResponse } from './app';

interface ReiProjectsRoutesDependencies {
  verifier: GoogleIdentityTokenVerifier;
  identities: IdentityRepository;
  service: ReiProjectService;
}

export function createReiProjectsRoutes(deps: ReiProjectsRoutesDependencies) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/rei-projects')) return null;

    // Autenticação Bearer via Identity Platform / Firebase Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: { code: 'unauthenticated', message: 'Token de autenticação ausente.' } }, 401);
    }
    const token = authHeader.substring(7);

    let identity;
    try {
      const verified = await deps.verifier.verify(token);
      identity = await deps.identities.findOrCreateUser(verified.issuer, verified.subject);
    } catch {
      return jsonResponse({ error: { code: 'unauthenticated', message: 'Token inválido ou expirado.' } }, 401);
    }

    const tenantId = identity.tenantId;

    try {
      const pathParts = url.pathname.split('/').filter(Boolean); // ['v1', 'rei-projects', ':id'?]
      const projectId = pathParts[2]; // undefined se /v1/rei-projects

      if (request.method === 'GET' && !projectId) {
        const projects = await deps.service.listProjects(tenantId);
        return jsonResponse({ data: projects }, 200);
      }

      if (request.method === 'GET' && projectId) {
        const project = await deps.service.getProject(tenantId, projectId);
        return jsonResponse({ data: project }, 200);
      }

      if (request.method === 'POST' && !projectId) {
        const body = await request.json();
        const project = await deps.service.createProject(tenantId, body);
        return jsonResponse({ data: project }, 201);
      }

      if (request.method === 'PUT' && projectId) {
        const body = await request.json();
        const project = await deps.service.updateProject(tenantId, projectId, body);
        return jsonResponse({ data: project }, 200);
      }

      if (request.method === 'DELETE' && projectId) {
        await deps.service.deleteProject(tenantId, projectId);
        return jsonResponse({ data: { success: true } }, 200);
      }

      return jsonResponse({ error: { code: 'not_found', message: 'Rota não encontrada.' } }, 404);
    } catch (error) {
      if (error instanceof ApiError) {
        const statusMap: Record<string, number> = {
          not_found: 404,
          validation_failed: 400,
          unauthorized: 403,
          unauthenticated: 401,
        };
        return jsonResponse({ error: { code: error.code, message: error.message } }, statusMap[error.code] ?? 500);
      }
      return jsonResponse({ error: { code: 'internal', message: 'Erro interno ao processar requisição.' } }, 500);
    }
  };
}
