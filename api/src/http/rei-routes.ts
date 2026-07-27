import { ApiError } from '../contracts/errors';
import type { PostgresREIRepository } from '../domains/rei/postgres-repository';
import {
  buildWelcomeEmail,
  buildKickoffDoc,
  buildWrapUpEmail,
} from '../domains/rei/templates';
import type { CreateREIOnboardingParams, QuickWinPayload } from '../domains/rei/types';

interface REIRoutesDependencies {
  repository: PostgresREIRepository;
}

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function createREIRoutes(deps: REIRoutesDependencies) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/rei')) return null;

    try {
      // POST /v1/rei/onboarding — Inicia o onboarding de um novo cliente REI
      if (request.method === 'POST' && url.pathname === '/v1/rei/onboarding') {
        const body = (await request.json()) as CreateREIOnboardingParams;
        if (!body.rei_project_id || !body.client_email || !body.cs_lead_email) {
          throw ApiError.validation(
            'Campos obrigatórios: rei_project_id, client_email, cs_lead_email.'
          );
        }
        const record = await deps.repository.createOnboarding(body);
        return json(201, { data: record });
      }

      // POST /v1/rei/welcome — Dispara o Milestone 0 (Welcome email Hormozi)
      if (request.method === 'POST' && url.pathname === '/v1/rei/welcome') {
        const { onboarding_id, kickoff_link } = (await request.json()) as {
          onboarding_id: string;
          kickoff_link: string;
        };
        const record = await deps.repository.findById(onboarding_id);
        if (!record) throw ApiError.validation('Onboarding não encontrado.');

        const email = buildWelcomeEmail({
          clientName: record.client_name,
          productName: record.product_name,
          csLeadName: record.cs_lead_name,
          kickoffLink: kickoff_link,
          milestone1Window: 'within 3 days',
          quickWinPreview: 'personalized REI dashboard with real metrics',
          midPointDay: 21,
          wrapUpDay: 30,
        });

        await deps.repository.markWelcomeSent(onboarding_id);
        return json(200, {
          data: {
            onboarding_id,
            email_sent: true,
            welcome_email: email,
          },
        });
      }

      // POST /v1/rei/kickoff — Registra o Milestone 1 (Kickoff call)
      if (request.method === 'POST' && url.pathname === '/v1/rei/kickoff') {
        const { onboarding_id, goal_sentence } = (await request.json()) as {
          onboarding_id: string;
          goal_sentence: string;
        };
        const record = await deps.repository.findById(onboarding_id);
        if (!record) throw ApiError.validation('Onboarding não encontrado.');

        const doc = buildKickoffDoc({
          clientName: record.client_name,
          productName: record.product_name,
          goalSentence: goal_sentence,
          durationDays: record.duration_days,
          csLeadName: record.cs_lead_name,
        });

        await deps.repository.markKickoff(onboarding_id, goal_sentence);
        return json(200, {
          data: {
            onboarding_id,
            kickoff_completed: true,
            kickoff_doc: doc,
          },
        });
      }

      // POST /v1/rei/quick-win — Registra o Milestone 2 (Quick Win D7)
      if (request.method === 'POST' && url.pathname === '/v1/rei/quick-win') {
        const body = (await request.json()) as { onboarding_id: string } & QuickWinPayload;
        if (!body.onboarding_id || !body.description || !body.url) {
          throw ApiError.validation('Campos obrigatórios: onboarding_id, description, url.');
        }
        await deps.repository.deliverQuickWin(body.onboarding_id, {
          description: body.description,
          url: body.url,
          loom_url: body.loom_url ?? undefined,
        });
        return json(200, {
          data: { onboarding_id: body.onboarding_id, quick_win_delivered: true },
        });
      }

      // POST /v1/rei/nps — Registra o NPS do Milestone 3 (D14)
      if (request.method === 'POST' && url.pathname === '/v1/rei/nps') {
        const { onboarding_id, score } = (await request.json()) as {
          onboarding_id: string;
          score: number;
        };
        if (typeof score !== 'number' || score < 0 || score > 10) {
          throw ApiError.validation('Score NPS deve ser um número entre 0 e 10.');
        }
        await deps.repository.recordNPS(onboarding_id, score);
        const churn_risk = score < 7 ? 'high' : score < 8 ? 'medium' : 'low';
        return json(200, {
          data: { onboarding_id, nps_score: score, churn_risk },
        });
      }

      // GET /v1/rei/onboarding/active — Lista onboardings ativos (para dashboard)
      if (request.method === 'GET' && url.pathname === '/v1/rei/onboarding/active') {
        const records = await deps.repository.listActive();
        const enriched = records.map((r) => {
          const startDate = r.kickoff_at ?? r.welcome_sent_at ?? r.created_at;
          const parsedTime = startDate ? new Date(startDate).getTime() : NaN;
          const daysIntoJourney = !isNaN(parsedTime)
            ? Math.floor((Date.now() - parsedTime) / 86400000)
            : 0;
          return { ...r, days_into_journey: Math.max(0, daysIntoJourney) };
        });
        return json(200, { data: enriched, count: enriched.length });
      }

      // POST /v1/rei/wrap-up — Milestone 5 (D30 Wrap-up + NPS formal)
      if (request.method === 'POST' && url.pathname === '/v1/rei/wrap-up') {
        const body = (await request.json()) as {
          onboarding_id: string;
          milestone1Result: string;
          quickWinResult: string;
          metricResult: string;
          nextPhaseAligned: string;
          npsLink: string;
          expansion_suggestions?: Array<{
            product_name: string;
            product_description?: string;
            estimated_value_brl?: number;
            ai_reasoning?: string;
            opportunity_type?: 'upsell' | 'cross_sell' | 'renewal' | 'expansion_service' | 'referral';
          }>;
        };
        if (!body.onboarding_id) {
          return json(400, { error: { code: 'validation', message: 'onboarding_id é obrigatório.' } });
        }

        const record = await deps.repository.findById(body.onboarding_id);
        if (!record) {
          return json(404, { error: { code: 'not_found', message: 'Onboarding não encontrado.' } });
        }

        const email = buildWrapUpEmail({
          clientName: record.client_name,
          productName: record.product_name,
          milestone1Result: body.milestone1Result,
          quickWinResult: body.quickWinResult,
          metricResult: body.metricResult,
          nextPhaseAligned: body.nextPhaseAligned,
          csLeadName: record.cs_lead_name,
          npsLink: body.npsLink,
        });

        const expansionSuggestions = body.expansion_suggestions || [];
        const expansionCount = { created: 0, errors: 0 };
        for (const suggestion of expansionSuggestions) {
          try {
            await deps.repository.createExpansionOpportunity({
              tenant_id: record.tenant_id,
              rei_onboarding_id: record.id,
              project_id: record.rei_project_id,
              opportunity_type: suggestion.opportunity_type || 'upsell',
              product_name: suggestion.product_name,
              product_description: suggestion.product_description || null,
              estimated_value_brl: suggestion.estimated_value_brl || null,
              ai_reasoning: suggestion.ai_reasoning || null,
              created_by: record.cs_lead_email,
            });
            expansionCount.created++;
          } catch (err) {
            console.error('[REIRoutes] Erro ao criar expansion opportunity:', err);
            expansionCount.errors++;
          }
        }

        return json(200, {
          data: {
            wrap_up_email: email,
            expansion_opportunities_created: expansionCount.created,
            expansion_opportunities_failed: expansionCount.errors,
          },
        });
      }

      // POST /v1/rei/expansion
      if (request.method === 'POST' && url.pathname === '/v1/rei/expansion') {
        const body = (await request.json()) as {
          tenant_id: string;
          rei_onboarding_id?: string;
          project_id?: string;
          opportunity_type: 'upsell' | 'cross_sell' | 'renewal' | 'expansion_service' | 'referral';
          product_name: string;
          product_description?: string;
          estimated_value_brl?: number;
          ai_reasoning?: string;
          created_by: string;
        };
        if (!body.tenant_id || !body.opportunity_type || !body.product_name || !body.created_by) {
          return json(400, { error: { code: 'validation', message: 'Campos obrigatórios: tenant_id, opportunity_type, product_name, created_by.' } });
        }
        await deps.repository.createExpansionOpportunity({
          tenant_id: body.tenant_id,
          rei_onboarding_id: body.rei_onboarding_id || null,
          project_id: body.project_id || null,
          opportunity_type: body.opportunity_type,
          product_name: body.product_name,
          product_description: body.product_description || null,
          estimated_value_brl: body.estimated_value_brl || null,
          ai_reasoning: body.ai_reasoning || null,
          created_by: body.created_by,
        });
        return json(201, {
          data: {
            tenant_id: body.tenant_id,
            opportunity_type: body.opportunity_type,
            product_name: body.product_name,
            status: 'identified',
            created_at: new Date().toISOString(),
          },
        });
      }

      // GET /v1/rei/expansion
      if (request.method === 'GET' && url.pathname === '/v1/rei/expansion') {
        const tenantId = url.searchParams.get('tenant_id');
        const onboardingId = url.searchParams.get('onboarding_id') || undefined;
        const status = url.searchParams.get('status') || undefined;

        if (!tenantId) {
          return json(400, { error: { code: 'validation', message: 'tenant_id é obrigatório.' } });
        }

        const options: { onboarding_id?: string; status?: string } = {};
        if (onboardingId) options.onboarding_id = onboardingId;
        if (status) options.status = status;

        const opportunities = await deps.repository.listExpansionOpportunities(tenantId, options);
        return json(200, { data: opportunities, count: opportunities.length });
      }

      return json(405, { error: { code: 'method_not_allowed', message: 'Método HTTP não suportado.' } });
    } catch (error) {
      if (error instanceof ApiError) {
        return json(400, { error: { code: error.code, message: error.message } });
      }
      console.error('[REIRoute] Erro interno:', error);
      return json(500, { error: { code: 'internal', message: 'Erro interno no motor REI.' } });
    }
  };
}