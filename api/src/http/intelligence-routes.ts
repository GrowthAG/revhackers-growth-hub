import { z } from 'zod';
import { ApiError } from '../contracts/errors';
import type { PostgresIntelligenceJobsRepository } from '../domains/intelligence/postgres-repository-jobs';
import type { PostgresIntelligenceRepository } from '../domains/intelligence/postgres-repository';
import type { FonteDataIntelligenceConnector } from '../domains/intelligence/fonte-data-connector';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const IdSchema = z.string().trim().min(1, 'ID é obrigatório').max(128);
const String512 = z.string().trim().max(512);

const CreateCompetitorSchema = z.object({
  tenant_id: IdSchema,
  project_id: IdSchema.optional(),
  name: z.string().trim().min(1, 'Nome do concorrente é obrigatório').max(256),
  cnpj: z.string().trim().max(20).optional(),
  website: String512.optional(),
  segment: String512.optional(),
  cnae_primary: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(2048).optional(),
  is_priority: z.boolean().optional(),
  added_by: z.string().trim().max(256).optional(),
});

const CreateSignalSchema = z.object({
  tenant_id: IdSchema,
  competitor_id: IdSchema.optional(),
  signal_type: z.enum(['news', 'funding', 'launch', 'pricing_change', 'hiring', 'partnership', 'acquisition', 'other']),
  title: z.string().trim().min(1, 'Título do sinal é obrigatório').max(512),
  summary: z.string().trim().max(2048).optional(),
  source_url: String512.optional(),
  source_name: z.string().trim().max(256).optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  impact_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  detected_at: z.string().datetime().optional(),
  detected_by: z.string().trim().max(256).optional(),
});

const CreateJobSchema = z.object({
  tenant_id: IdSchema,
  job_type: z.enum(['competitor_enrichment', 'comparison_generation', 'signal_detection', 'framework_regeneration', 'market_scan']),
  competitor_id: IdSchema.optional(),
  project_id: IdSchema.optional(),
  input_payload: z.record(z.string(), z.unknown()).optional(),
  scheduled_for: z.string().datetime().optional(),
  max_attempts: z.number().int().min(1).max(10).optional(),
});

const CreateShareSchema = z.object({
  tenant_id: IdSchema,
  project_id: IdSchema,
  created_by: z.string().trim().min(1).max(256),
  expires_at: z.string().datetime().optional(),
});

// Tokens de compartilhamento (in-memory store, suficiente para o escopo atual)
const shareTokens = new Map<string, {
  share_token: string;
  tenant_id: string;
  project_id: string;
  created_by: string;
  created_at: string;
  expires_at: string | null;
  revoked: boolean;
}>();

interface IntelligenceRoutesDependencies {
  repository: PostgresIntelligenceRepository;
  jobsRepository: PostgresIntelligenceJobsRepository;
  fonteDataConnector: FonteDataIntelligenceConnector;
}

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function parseBody<T>(raw: unknown, schema: z.ZodType<T>): { data: T } | { error: { code: string; message: string; details?: Record<string, string[]> } } {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const flat = {} as Record<string, string[]>;
    for (const k of Object.keys(fieldErrors)) {
      const v = (fieldErrors as Record<string, unknown>)[k];
      if (Array.isArray(v)) flat[k] = v as string[];
    }
    return {
      error: {
        code: 'validation_failed',
        message: 'Payload inválido.',
        details: flat,
      },
    };
  }
  return { data: result.data };
}

function safeJsonParse(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

export function createIntelligenceRoutes(deps: IntelligenceRoutesDependencies) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/intelligence')) return null;

    try {
      // GET /v1/intelligence/competitors/:project_id
      const listMatch = url.pathname.match(/^\/v1\/intelligence\/competitors\/([0-9a-f-]{36})$/);
      if (request.method === 'GET' && listMatch) {
        const projectId = listMatch[1];
        const tenantId = url.searchParams.get('tenant_id');
        if (!tenantId) return json(400, { error: { code: 'validation', message: 'tenant_id é obrigatório.' } });
        const competitors = await deps.repository.listCompetitorsByProject(tenantId, projectId);
        return json(200, { data: competitors, count: competitors.length });
      }

      // GET /v1/intelligence/competitors/:id/full
      const fullMatch = url.pathname.match(/^\/v1\/intelligence\/competitors\/([0-9a-f-]{36})\/full$/);
      if (request.method === 'GET' && fullMatch) {
        const competitorId = fullMatch[1]!;
        const tenantId = url.searchParams.get('tenant_id');
        if (!tenantId) return json(400, { error: { code: 'validation', message: 'tenant_id é obrigatório.' } });
        const result = await deps.repository.getCompetitorWithIntelligence(tenantId, competitorId);
        if (!result) return json(404, { error: { code: 'not_found', message: 'Concorrente não encontrado.' } });
        return json(200, { data: result });
      }

      // GET /v1/intelligence/signals/:project_id
      const signalsMatch = url.pathname.match(/^\/v1\/intelligence\/signals\/([0-9a-f-]{36})$/);
      if (request.method === 'GET' && signalsMatch) {
        const tenantId = url.searchParams.get('tenant_id');
        if (!tenantId) return json(400, { error: { code: 'validation', message: 'tenant_id é obrigatório.' } });
        const signals = await deps.repository.listSignalsByTenant(tenantId, 50);
        return json(200, { data: signals, count: signals.length });
      }

      // POST /v1/intelligence/competitors — Create + async FonteData enrichment
      if (request.method === 'POST' && url.pathname === '/v1/intelligence/competitors') {
        const raw = await safeJsonParse(request);
        const parsed = parseBody(raw, CreateCompetitorSchema);
        if ('error' in parsed) return json(400, { error: parsed.error });
        const body = parsed.data;
        const competitor = await deps.repository.createCompetitor({
          tenant_id: body.tenant_id,
          project_id: body.project_id ?? null,
          name: body.name,
          cnpj: body.cnpj ?? null,
          website: body.website ?? null,
          segment: body.segment ?? null,
          cnae_primary: body.cnae_primary ?? null,
          notes: body.notes ?? null,
          is_priority: body.is_priority ?? false,
          added_by: body.added_by ?? null,
        });
        if (body.cnpj) {
          setImmediate(async () => {
            try {
              const enriched = await deps.fonteDataConnector.enrichCompetitorByCNPJ(body.cnpj!);
              if (enriched) {
                await deps.repository.upsertIntelligence({
                  tenant_id: body.tenant_id,
                  competitor_id: competitor.id,
                  ...enriched,
                });
              } else {
                await deps.repository.markEnrichmentFailed(body.tenant_id, competitor.id, 'FonteData enrichment retornou null');
              }
            } catch (err) {
              await deps.repository.markEnrichmentFailed(body.tenant_id, competitor.id, err instanceof Error ? err.message : 'Unknown error');
            }
          });
        }
        return json(201, { data: competitor, enrichment_status: body.cnpj ? 'processing' : 'pending' });
      }

      // POST /v1/intelligence/signals — Manual signal entry
      if (request.method === 'POST' && url.pathname === '/v1/intelligence/signals') {
        const raw = await safeJsonParse(request);
        const parsed = parseBody(raw, CreateSignalSchema);
        if ('error' in parsed) return json(400, { error: parsed.error });
        const body = parsed.data;
        const signal = await deps.repository.createSignal({
          tenant_id: body.tenant_id,
          competitor_id: body.competitor_id ?? null,
          signal_type: body.signal_type,
          title: body.title,
          summary: body.summary ?? '',
          source_url: body.source_url ?? null,
          source_name: body.source_name ?? null,
          sentiment: (body.sentiment ?? 'neutral') as 'positive' | 'neutral' | 'negative',
          impact_level: (body.impact_level ?? 'medium') as 'low' | 'medium' | 'high' | 'critical',
          detected_by: body.detected_by ?? 'manual',
        });
        return json(201, { data: signal });
      }

      // POST /v1/intelligence/jobs
      if (request.method === 'POST' && url.pathname === '/v1/intelligence/jobs') {
        const raw = await safeJsonParse(request);
        const parsed = parseBody(raw, CreateJobSchema);
        if ('error' in parsed) return json(400, { error: parsed.error });
        const body = parsed.data;
        const job = await deps.jobsRepository.createJob({
          tenant_id: body.tenant_id,
          job_type: body.job_type,
          competitor_id: body.competitor_id ?? null,
          project_id: body.project_id ?? null,
          input_payload: body.input_payload ?? {},
          scheduled_for: body.scheduled_for ?? null,
          max_attempts: body.max_attempts ?? 3,
        });
        return json(201, { data: job });
      }

      // GET /v1/intelligence/jobs
      if (request.method === 'GET' && url.pathname === '/v1/intelligence/jobs') {
        const tenantId = url.searchParams.get('tenant_id');
        if (!tenantId) {
          return json(400, { error: { code: 'validation', message: 'tenant_id é obrigatório.' } });
        }
        const jobs = await deps.jobsRepository.listJobsByTenant(tenantId, 50);
        return json(200, { data: jobs, count: jobs.length });
      }

      // GET /v1/intelligence/findings
      if (request.method === 'GET' && url.pathname === '/v1/intelligence/findings') {
        const tenantId = url.searchParams.get('tenant_id');
        if (!tenantId) {
          return json(400, { error: { code: 'validation', message: 'tenant_id é obrigatório.' } });
        }
        const findings = await deps.jobsRepository.listFindingsByTenant(tenantId, 50);
        return json(200, { data: findings, count: findings.length });
      }

      // POST /v1/intelligence/share — Gerar token de compartilhamento
      if (request.method === 'POST' && url.pathname === '/v1/intelligence/share') {
        const raw = await safeJsonParse(request);
        const parsed = parseBody(raw, CreateShareSchema);
        if ('error' in parsed) return json(400, { error: parsed.error });
        const body = parsed.data;
        const shareToken = `shr_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        shareTokens.set(shareToken, {
          share_token: shareToken,
          tenant_id: body.tenant_id,
          project_id: body.project_id,
          created_by: body.created_by,
          created_at: new Date().toISOString(),
          expires_at: body.expires_at ?? null,
          revoked: false,
        });
        return json(201, {
          data: {
            share_token: shareToken,
            share_url: `${url.origin}/public/growthmap/${shareToken}`,
            expires_at: body.expires_at ?? null,
          },
        });
      }

      // GET /v1/intelligence/share/:share_token — Visualizar dados compartilhados (PÚBLICO, sem auth)
      const shareTokenMatch = url.pathname.match(/^\/v1\/intelligence\/share\/([a-zA-Z0-9_-]+)$/);
      if (request.method === 'GET' && shareTokenMatch) {
        const shareToken = shareTokenMatch[1]!;
        const tokenData = shareTokens.get(shareToken);
        if (!tokenData || tokenData.revoked) {
          return json(404, { error: { code: 'not_found', message: 'Link de compartilhamento inválido ou revogado.' } });
        }
        if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
          return json(410, { error: { code: 'gone', message: 'Link de compartilhamento expirado.' } });
        }
        const competitors = await deps.repository.listCompetitorsByProject(tokenData.tenant_id, tokenData.project_id);
        return json(200, {
          data: {
            share_token: shareToken,
            tenant_id: tokenData.tenant_id,
            project_id: tokenData.project_id,
            created_at: tokenData.created_at,
            expires_at: tokenData.expires_at,
            competitors: competitors.map((c) => ({
              id: c.id, name: c.name, website: c.website, segment: c.segment, is_active: c.is_active,
            })),
          },
        });
      }

      // DELETE /v1/intelligence/share/:share_token — Revogar token
      if (request.method === 'DELETE' && shareTokenMatch) {
        const shareToken = shareTokenMatch[1]!;
        const tokenData = shareTokens.get(shareToken);
        if (!tokenData) {
          return json(404, { error: { code: 'not_found', message: 'Link de compartilhamento não encontrado.' } });
        }
        shareTokens.set(shareToken, { ...tokenData, revoked: true });
        return json(200, { data: { share_token: shareToken, revoked: true } });
      }

      // GET /v1/intelligence/findings/:id/full — Drill-down de finding
      const findingFullMatch = url.pathname.match(/^\/v1\/intelligence\/findings\/([0-9a-f-]{36})\/full$/);
      if (request.method === 'GET' && findingFullMatch) {
        const findingId = findingFullMatch[1]!;
        const tenantId = url.searchParams.get('tenant_id');
        if (!tenantId) {
          return json(400, { error: { code: 'validation', message: 'tenant_id é obrigatório.' } });
        }

        const allFindings = await deps.jobsRepository.listFindingsByTenant(tenantId, 500);
        const finding = allFindings.find((f) => f.id === findingId);
        if (!finding) {
          return json(404, { error: { code: 'not_found', message: 'Finding não encontrado.' } });
        }

        let job: any = null;
        if (finding.job_id) {
          job = await deps.jobsRepository.findJobById(tenantId, finding.job_id);
        }

        let competitor: any = null;
        if (finding.competitor_id) {
          competitor = await deps.repository.findCompetitorById(tenantId, finding.competitor_id);
        }

        return json(200, {
          data: {
            finding,
            job,
            competitor: competitor ? {
              id: competitor.id,
              name: competitor.name,
              website: competitor.website,
              segment: competitor.segment,
              cnpj: competitor.cnpj,
            } : null,
          },
        });
      }

      return json(405, { error: { code: 'method_not_allowed', message: 'Método HTTP não suportado.' } });
    } catch (error) {
      if (error instanceof ApiError) {
        return json(400, { error: { code: error.code, message: error.message } });
      }
      console.error('[IntelligenceRoute] Erro interno:', error);
      return json(500, { error: { code: 'internal', message: 'Erro interno no motor de inteligência.' } });
    }
  };
}
