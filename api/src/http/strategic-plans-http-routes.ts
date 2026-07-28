import { z } from 'zod';
import { StrategicPlanService } from '../domains/strategic-plans/service';
import { IdentityRepository } from '../identity/postgres-identity-repository';
import { GoogleIdentityTokenVerifier } from '../identity/google-identity-verifier';
import { generateStrategicPlanAi } from '../domains/strategic-plans/ai-generator';
import { AuthMiddleware } from './auth-middleware';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const IdSchema = z.string().trim().min(1).max(128);
const OptionalString = (max = 256) => z.string().trim().max(max).optional();

const GeneratePlanSchema = z.object({
  reiResponses: z.record(z.string(), z.unknown()).optional(),
  rei_responses: z.record(z.string(), z.unknown()).optional(),
  segment: OptionalString(128),
  objective: z.string().trim().max(2048).optional(),
  isB2B: z.boolean().optional(),
  projectType: OptionalString(64),
  projectId: IdSchema.optional(),
  projectDuration: OptionalString(64),
  clientName: OptionalString(256),
  clientCompany: OptionalString(256),
  tradeName: OptionalString(256),
  clientId: IdSchema.optional(),
});

const CreatePlanSchema = z.object({
  reiProjectId: IdSchema.optional(),
  clientId: IdSchema.optional(),
  diagnosticData: z.record(z.string(), z.unknown()).optional(),
  personaData: z.record(z.string(), z.unknown()).optional(),
  premisesData: z.record(z.string(), z.unknown()).optional(),
  methodologyData: z.record(z.string(), z.unknown()).optional(),
  roadmapData: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
  goalsData: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
  financialProjections: z.record(z.string(), z.unknown()).optional(),
  budgetData: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
  nextStepsData: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'approved', 'rejected']).optional(),
});

const UpdatePlanSchema = CreatePlanSchema.partial();

function parseBody<T>(raw: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { error: { code: 'validation_failed', message: 'Payload inválido.', details: result.error.flatten().fieldErrors } } as any;
  }
  return { data: result.data } as any;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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
        const raw = await request.json().catch(() => null);
        const parsed = parseBody(raw, GeneratePlanSchema);
        if ('error' in parsed) return json(400, { error: parsed.error });
        const body = parsed as any;
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
      const raw = await request.json().catch(() => null);
      const parsed = parseBody(raw, CreatePlanSchema);
      if ('error' in parsed) return json(400, { error: parsed.error });
      const body = parsed as any;
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
      const raw = await request.json().catch(() => null);
      const parsed = parseBody(raw, UpdatePlanSchema);
      if ('error' in parsed) return json(400, { error: parsed.error });
      const body = parsed as any;
      const updated = await service.updatePlan(id, tenantId, body);
      return new Response(JSON.stringify(updated), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return null;
  };
}
