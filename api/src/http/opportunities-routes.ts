import { ApiError } from '../contracts/errors';
import type { PostgresOpportunityRepository } from '../domains/opportunities/postgres-repository';
import type { FonteDataService } from '../domains/opportunities/fontedata-service';

interface OpportunitiesRoutesDependencies {
  repository: PostgresOpportunityRepository;
  fonteDataService: FonteDataService;
}

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function createOpportunitiesRoutes(deps: OpportunitiesRoutesDependencies) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/opportunities')) return null;

    try {
      // GET /v1/opportunities/lookup (Consulta instantânea de CNPJ para o auto-preenchimento do frontend)
      if (request.method === 'GET' && url.pathname === '/v1/opportunities/lookup') {
        const cnpj = url.searchParams.get('cnpj');
        if (!cnpj) {
          return json(400, {
            error: { code: 'validation_failed', message: 'O parâmetro cnpj é obrigatório.' },
          });
        }

        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (!deps.fonteDataService.isValidCNPJ(cleanCnpj)) {
          return json(400, {
            error: { code: 'validation_failed', message: 'O CNPJ fornecido é inválido.' },
          });
        }

        // 1. Buscar se já existe uma oportunidade em pré-vendas com este CNPJ
        const existingOpportunity = await deps.repository.findByCnpj(cleanCnpj);

        // 2. Buscar enriquecimento FonteData
        const data = await deps.fonteDataService.fetchCompanyData(cleanCnpj);

        if (!data && !existingOpportunity) {
          return json(404, {
            error: { code: 'not_found', message: 'Dados da empresa não encontrados na FonteData nem na base de pré-vendas.' },
          });
        }

        const companyName = existingOpportunity?.client_company || data?.company_name || '';
        const email = existingOpportunity?.client_email || data?.email || '';
        const leadName = existingOpportunity?.client_name || data?.holding_hunter.partners[0]?.name || '';
        const website = data?.website || (email.includes('@') ? `www.${email.split('@')[1]}` : '');

        return json(200, {
          data: {
            cnpj: cleanCnpj,
            company_name: companyName,
            email,
            lead_name: leadName,
            website,
            opportunity_found: Boolean(existingOpportunity),
            spi: data?.spi || null,
            partners: data?.holding_hunter.partners || [],
          },
        });
      }

      // POST /v1/opportunities (Submissão pública de diagnósticos/leads)
      if (request.method === 'POST') {
        const body = await request.json();

        if (!body.name && !body.email && !body.company) {
          return json(400, {
            error: { code: 'validation_failed', message: 'Ao menos um dado de contato (nome, email ou empresa) deve ser fornecido.' },
          });
        }

        const clientEmail = body.email ? String(body.email).toLowerCase().trim() : null;
        const diagnosticoId = body.diagnosticoId || `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const cnpj = body.cnpj ? String(body.cnpj).replace(/\D/g, '') : null;

        // 1. Verificar se já existe uma oportunidade não perdida para o e-mail
        const existing = clientEmail ? await deps.repository.findByEmail(clientEmail) : null;
        let opportunityId: string;

        if (existing) {
          opportunityId = existing.id;
          // Atualiza oportunidade existente com novo diagnóstico
          await deps.repository.updateEnrichment(opportunityId, {
            ...existing.opportunity_data?.enrichment,
            enriched_at: new Date().toISOString(),
          } as any);
        } else {
          // Criar nova oportunidade
          const created = await deps.repository.create({
            client_name: body.name || body.company || 'Novo Lead B2B',
            client_email: clientEmail,
            client_company: body.company || null,
            cnpj,
            type: body.officialProjectType || 'consulting',
            lead_source: body.leadSource || 'diagnostico_publico',
            pipeline_stage: 'diagnostic_done',
            diagnostico_id: diagnosticoId,
            opportunity_data: {
              responses: body.responses || {},
              score: body.score,
              maturity: body.maturity,
            },
          });
          opportunityId = created.id;
        }

        // 2. Enriquecimento assíncrono em background via FonteData (Zero Latency UX)
        if (cnpj && deps.fonteDataService.isValidCNPJ(cnpj)) {
          setImmediate(async () => {
            try {
              const enrichment = await deps.fonteDataService.fetchCompanyData(cnpj);
              if (enrichment) {
                await deps.repository.updateEnrichment(opportunityId, enrichment);
                console.log(`[OpportunitiesRoute] Enriquecimento FonteData concluído com sucesso para o CNPJ ${cnpj}`);
              }
            } catch (err) {
              console.error(`[OpportunitiesRoute] Erro no enriquecimento em background para o CNPJ ${cnpj}:`, err);
            }
          });
        }

        // 3. Resposta imediata para a UI do formulário
        return json(201, {
          data: {
            id: opportunityId,
            diagnosticoId,
            status: 'created',
          },
        });
      }

      return json(405, { error: { code: 'method_not_allowed', message: 'Método HTTP não suportado.' } });
    } catch (error) {
      if (error instanceof ApiError) {
        return json(400, { error: { code: error.code, message: error.message } });
      }
      console.error('[OpportunitiesRoute] Erro interno:', error);
      return json(500, { error: { code: 'internal', message: 'Erro interno ao processar oportunidade.' } });
    }
  };
}
