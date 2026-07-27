import { StrategicPlanService } from '../domains/strategic-plans/service';
import { IdentityRepository } from '../identity/postgres-identity-repository';
import { GoogleIdentityTokenVerifier } from '../identity/google-identity-verifier';
import { generateStrategicPlanAi } from '../domains/strategic-plans/ai-generator';
import { AuthMiddleware } from './auth-middleware';

export interface StrategicPlansRoutesDependencies {
  verifier: GoogleIdentityTokenVerifier;
  identities: IdentityRepository;
  service: StrategicPlanService;
}

export function createStrategicPlansRoutes({ verifier, identities, service }: StrategicPlansRoutesDependencies) {
  const auth = new AuthMiddleware({ verifier, identities });

  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/v1/strategic-plans')) {
      return null;
    }

    const authResult = await auth.authenticate(request);
    if (authResult instanceof Response) return authResult;
    const { tenantId } = authResult;

    // POST /v1/strategic-plans/generate — Geração Nativa GCP via IA
    if (request.method === 'POST' && url.pathname === '/v1/strategic-plans/generate') {
      try {
        const body = await request.json();
        const generatedData = await generateStrategicPlanAi({
          reiResponses: body.reiResponses || body.rei_responses || {},
          segment: body.segment,
          objective: body.objective,
          isB2B: body.isB2B,
          projectType: body.projectType,
          projectId: body.projectId,
          projectDuration: body.projectDuration,
          clientName: body.clientName,
          clientCompany: body.clientCompany,
          tradeName: body.tradeName,
        });

        // Persiste o plano gerado na base PostgreSQL no GCP
        const planRecord = await service.createPlan(tenantId, {
          tenantId,
          reiProjectId: body.projectId,
          clientId: body.clientId,
          diagnosticData: generatedData,
          personaData: generatedData.context_mirror || {},
          premisesData: generatedData.thesis_statement || {},
          methodologyData: generatedData.executive_summary || {},
          roadmapData: generatedData.roadmap_phases || [],
          goalsData: generatedData.okrs || [],
          financialProjections: generatedData.current_vs_future || {},
          budgetData: generatedData.quick_wins || [],
          nextStepsData: generatedData.decisions || [],
          status: 'draft',
        });

        return new Response(JSON.stringify({ plan: planRecord, generatedData }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('[GCP AI Strategic Plan Route] Erro:', err);
        return new Response(JSON.stringify({ error: 'generation_failed', message: err.message || 'Erro ao gerar plano' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

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
      const plan = await service.createPlan(tenantId, { ...body, tenantId });
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
