import { z } from 'zod';
import { ApiError } from '../contracts/errors';
import type { ClientService } from '../domains/clients/service';
import type { IdentityRepository } from '../identity/postgres-identity-repository';
import type { TokenVerifier } from '../identity/verifier';
import { AuthMiddleware } from './auth-middleware';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const OptionalUrl = z.string().url().max(2000).optional().or(z.literal('').transform(() => undefined));
const OptionalString = (max = 256) => z.string().trim().max(max).optional();

const CreateClientSchema = z.object({
  name: z.string().trim().min(1, 'Nome do cliente é obrigatório').max(256),
  email: z.string().trim().email('E-mail inválido').max(254),
  company: OptionalString(256),
  phone: OptionalString(32),
  logoUrl: OptionalUrl,
  website: OptionalUrl,
  linkedinUrl: OptionalUrl,
  city: OptionalString(128),
  state: OptionalString(64),
  country: z.string().trim().max(64).optional(),
  segment: OptionalString(128),
  companySize: OptionalString(64),
});

const UpdateClientSchema = z.object({
  name: z.string().trim().min(1).max(256).optional(),
  email: z.string().trim().email('E-mail inválido').max(254).optional(),
  company: z.string().trim().max(256).nullable().optional(),
  phone: z.string().trim().max(32).nullable().optional(),
  logoUrl: z.string().url().max(2000).nullable().optional(),
  website: z.string().url().max(2000).nullable().optional(),
  linkedinUrl: z.string().url().max(2000).nullable().optional(),
  city: z.string().trim().max(128).nullable().optional(),
  state: z.string().trim().max(64).nullable().optional(),
  country: z.string().trim().max(64).optional(),
  segment: z.string().trim().max(128).nullable().optional(),
  companySize: z.string().trim().max(64).nullable().optional(),
});

function parseBody<T>(raw: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw ApiError.validation(`Payload inválido: ${JSON.stringify(result.error.flatten().fieldErrors)}`);
  }
  return result.data;
}

interface ClientsRoutesDependencies {
  verifier: TokenVerifier;
  identities: IdentityRepository;
  service: ClientService;
}

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function createClientsRoutes(deps: ClientsRoutesDependencies) {
  const auth = new AuthMiddleware(deps);

  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/clients')) return null;

    const authResult = await auth.authenticate(request);
    if (authResult instanceof Response) return authResult;
    const { tenantId } = authResult;

    try {
      const pathParts = url.pathname.split('/').filter(Boolean); // ['v1', 'clients', ':id'?]
      const clientId = pathParts[2]; // undefined se /v1/clients

      if (request.method === 'GET' && !clientId) {
        const clients = await deps.service.listClients(tenantId);
        return json(200, { data: clients });
      }

      if (request.method === 'GET' && clientId) {
        const client = await deps.service.getClient(tenantId, clientId);
        return json(200, { data: client });
      }

      if (request.method === 'POST' && !clientId) {
        const raw = await request.json().catch(() => null);
        const body = parseBody(raw, CreateClientSchema) as any;
        const client = await deps.service.createClient(tenantId, body);
        return json(201, { data: client });
      }

      if (request.method === 'PUT' && clientId) {
        const raw = await request.json().catch(() => null);
        const body = parseBody(raw, UpdateClientSchema) as any;
        const client = await deps.service.updateClient(tenantId, clientId, body);
        return json(200, { data: client });
      }

      if (request.method === 'DELETE' && clientId) {
        await deps.service.deleteClient(tenantId, clientId);
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
