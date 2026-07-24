import { ApiError } from '../contracts/errors';
import type { ClientService } from '../domains/clients/service';
import type { IdentityRepository } from '../identity/postgres-identity-repository';
import type { GoogleIdentityTokenVerifier } from '../identity/google-identity-verifier';
import { jsonResponse } from './app';

interface ClientsRoutesDependencies {
  verifier: GoogleIdentityTokenVerifier;
  identities: IdentityRepository;
  service: ClientService;
}

export function createClientsRoutes(deps: ClientsRoutesDependencies) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/clients')) return null;

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
      const pathParts = url.pathname.split('/').filter(Boolean); // ['v1', 'clients', ':id'?]
      const clientId = pathParts[2]; // undefined se /v1/clients

      if (request.method === 'GET' && !clientId) {
        const clients = await deps.service.listClients(tenantId);
        return jsonResponse({ data: clients }, 200);
      }

      if (request.method === 'GET' && clientId) {
        const client = await deps.service.getClient(tenantId, clientId);
        return jsonResponse({ data: client }, 200);
      }

      if (request.method === 'POST' && !clientId) {
        const body = await request.json();
        const client = await deps.service.createClient(tenantId, body);
        return jsonResponse({ data: client }, 201);
      }

      if (request.method === 'PUT' && clientId) {
        const body = await request.json();
        const client = await deps.service.updateClient(tenantId, clientId, body);
        return jsonResponse({ data: client }, 200);
      }

      if (request.method === 'DELETE' && clientId) {
        await deps.service.deleteClient(tenantId, clientId);
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
