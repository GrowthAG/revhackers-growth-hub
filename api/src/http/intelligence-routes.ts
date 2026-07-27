import { ApiError } from '../contracts/errors';
import type { PostgresIntelligenceJobsRepository } from '../domains/intelligence/postgres-repository-jobs';
import type { PostgresIntelligenceRepository } from '../domains/intelligence/postgres-repository';
import type { FonteDataIntelligenceConnector } from '../domains/intelligence/fonte-data-connector';
import type { 
  CreateCompetitorParams,
  CreateMarketSignalParams,
} from '../domains/intelligence/types';

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
        const body = (await request.json()) as CreateCompetitorParams & { cnpj?: string };
        if (!body.tenant_id || !body.project_id || !body.name || !body.added_by) {
          return json(400, { error: { code: 'validation', message: 'Campos obrigatórios: tenant_id, project_id, name, added_by.' } });
        }
        const competitor = await deps.repository.createCompetitor({
          tenant_id: body.tenant_id,
          project_id: body.project_id,
          name: body.name,
          cnpj: body.cnpj ?? null,
          website: body.website ?? null,
          segment: body.segment ?? null,
          cnae_primary: body.cnae_primary ?? null,
          notes: body.notes ?? null,
          is_priority: body.is_priority ?? false,
          added_by: body.added_by,
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
        const body = (await request.json()) as CreateMarketSignalParams;
        if (!body.tenant_id || !body.signal_type || !body.title) {
          return json(400, { error: { code: 'validation', message: 'Campos obrigatórios: tenant_id, signal_type, title.' } });
        }
        const signal = await deps.repository.createSignal({
          tenant_id: body.tenant_id,
          competitor_id: body.competitor_id ?? null,
          signal_type: body.signal_type,
          title: body.title,
          summary: body.summary ?? '',
          source_url: body.source_url ?? null,
          source_name: body.source_name ?? null,
          sentiment: body.sentiment ?? 'neutral',
          impact_level: body.impact_level ?? 'medium',
          detected_by: body.detected_by ?? 'manual',
        });
        return json(201, { data: signal });
      }

      // POST /v1/intelligence/jobs
      if (request.method === 'POST' && url.pathname === '/v1/intelligence/jobs') {
        const body = (await request.json()) as {
          tenant_id: string;
          job_type: 'competitor_enrichment' | 'comparison_generation' | 'signal_detection' | 'framework_regeneration' | 'market_scan';
          competitor_id?: string;
          project_id?: string;
          input_payload?: Record<string, any>;
          scheduled_for?: string;
          max_attempts?: number;
        };
        if (!body.tenant_id || !body.job_type) {
          return json(400, { error: { code: 'validation', message: 'Campos obrigatórios: tenant_id, job_type.' } });
        }
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
        const body = (await request.json()) as {
          tenant_id: string;
          project_id: string;
          created_by: string;
          expires_at?: string | null;
        };
        if (!body.tenant_id || !body.project_id || !body.created_by) {
          return json(400, { error: { code: 'validation', message: 'Campos obrigatórios: tenant_id, project_id, created_by.' } });
        }
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
