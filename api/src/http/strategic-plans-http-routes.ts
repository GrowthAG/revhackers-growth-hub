import { StrategicPlanService } from '../domains/strategic-plans/service';
import { IdentityRepository } from '../identity/postgres-identity-repository';
import { GoogleIdentityTokenVerifier } from '../identity/google-identity-verifier';

export interface StrategicPlansRoutesDependencies {
  verifier: GoogleIdentityTokenVerifier;
  identities: IdentityRepository;
  service: StrategicPlanService;
}

export function createStrategicPlansRoutes({ verifier, identities, service }: StrategicPlansRoutesDependencies) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/v1/strategic-plans')) {
      return null;
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.substring(7);
    let identity;
    try {
      identity = await verifier.verify(token);
    } catch {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const internalUser = await identities.findOrCreateUser(identity);
    const tenantId = internalUser.memberships[0]?.tenantId ?? '11111111-1111-4111-8111-111111111111';

    // GET /v1/strategic-plans/project/:projectId
    const projectMatch = url.pathname.match(/^\/v1\/strategic-plans\/project\/([^/]+)$/);
    if (request.method === 'GET' && projectMatch) {
      const projectId = projectMatch[1];
      if (!projectId) return null;
      const plan = await service.getPlanByProjectId(projectId, tenantId);
      if (!plan) {
        return new Response(JSON.stringify({ error: 'not_found', message: 'Strategic plan not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(plan), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /v1/strategic-plans/:id
    const idMatch = url.pathname.match(/^\/v1\/strategic-plans\/([^/]+)$/);
    if (request.method === 'GET' && idMatch) {
      const id = idMatch[1];
      if (!id) return null;
      const plan = await service.getPlanById(id, tenantId);
      if (!plan) {
        return new Response(JSON.stringify({ error: 'not_found', message: 'Strategic plan not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(plan), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /v1/strategic-plans
    if (request.method === 'POST' && url.pathname === '/v1/strategic-plans') {
      const body = await request.json();
      const plan = await service.createPlan(tenantId, body);
      return new Response(JSON.stringify(plan), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PATCH /v1/strategic-plans/:id
    if (request.method === 'PATCH' && idMatch) {
      const id = idMatch[1];
      if (!id) return null;
      const body = await request.json();
      const updated = await service.updatePlan(id, tenantId, body);
      return new Response(JSON.stringify(updated), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return null;
  };
}
