import { describe, expect, test, vi } from 'vitest';
import { FonteDataService } from '../../api/src/domains/opportunities/fontedata-service';
import { PostgresOpportunityRepository } from '../../api/src/domains/opportunities/postgres-repository';
import { createOpportunitiesRoutes } from '../../api/src/http/opportunities-routes';
import type { QueryablePool } from '../../api/src/db/postgres';

// Mock do banco de dados QueryablePool
const mockPool = {
  query: vi.fn().mockResolvedValue({ rows: [] })
} as unknown as QueryablePool;

describe('FonteDataService (CNPJ & Enriquecimento)', () => {
  const service = new FonteDataService('fd_test_token');

  test('Validador de CNPJ - Identifica CNPJs validos e invalidos', () => {
    // CNPJ do Banco do Brasil (Valido)
    expect(service.isValidCNPJ('00.000.000/0001-91')).toBe(true);
    expect(service.isValidCNPJ('00000000000191')).toBe(true);

    // CNPJ Invalido (digito verificador errado)
    expect(service.isValidCNPJ('00.000.000/0001-90')).toBe(false);
    expect(service.isValidCNPJ('12.345.678/0001-99')).toBe(false);
    expect(service.isValidCNPJ('00000000000000')).toBe(false); // sequencia repetida
  });

  test('fetchCompanyData em modo Sandbox/Mock - Retorna dados estruturados de growth', async () => {
    const data = await service.fetchCompanyData('00000000000191', true);
    expect(data).not.toBeNull();
    expect(data?.cnpj).toBe('00000000000191');
    expect(data?.company_name).toBe('Acme Scale Systems Ltda');
    expect(data?.spi.score).toBe(75);
    expect(data?.spi.scale_category).toBe('SCALEUP');
    expect(data?.holding_hunter.partners).toHaveLength(1);
    expect(data?.holding_hunter.partners[0]?.name).toBe('Decisor Principal (Sócio Growth)');
  });
});

describe('/v1/opportunities (HTTP Routes)', () => {
  const service = new FonteDataService('fd_test_token');
  const repository = new PostgresOpportunityRepository(mockPool);
  const route = createOpportunitiesRoutes({ repository, fonteDataService: service });

  test('GET /v1/opportunities/lookup - Retorna dados de auto-preenchimento para CNPJ valido', async () => {
    vi.spyOn(mockPool, 'query').mockResolvedValueOnce({ rows: [] } as any);

    const response = await route(
      new Request('https://api.test/v1/opportunities/lookup?cnpj=00000000000191', { method: 'GET' })
    );
    expect(response?.status).toBe(200);
    const body = await response?.json() as any;
    expect(body.data.cnpj).toBe('00000000000191');
    expect(body.data.company_name).toBe('Acme Scale Systems Ltda');
    expect(body.data.spi.scale_category).toBe('SCALEUP');
  });

  test('GET /v1/opportunities/lookup - Retorna erro 400 para CNPJ invalido', async () => {
    const response = await route(
      new Request('https://api.test/v1/opportunities/lookup?cnpj=12345', { method: 'GET' })
    );
    expect(response?.status).toBe(400);
    const body = await response?.json() as any;
    expect(body.error.code).toBe('validation_failed');
  });

  test('POST /v1/opportunities - Salva oportunidade de lead com sucesso', async () => {
    // Mock do insert no banco de dados
    vi.spyOn(mockPool, 'query').mockResolvedValueOnce({
      rows: [{
        id: 'opp_12345',
        client_name: 'Giulliano Alves',
        client_email: 'giulliano@usefunnels.io',
        client_company: 'Funnels',
        cnpj: null,
        type: 'consulting',
        lead_source: 'diagnostico_growth',
        pipeline_stage: 'diagnostic_done',
        diagnostico_id: 'diag_123',
        opportunity_data: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]
    } as any);

    const response = await route(
      new Request('https://api.test/v1/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Giulliano Alves',
          email: 'giulliano@usefunnels.io',
          company: 'Funnels',
          diagnosticoId: 'diag_123',
          officialProjectType: 'growth',
          leadSource: 'diagnostico_growth',
          responses: { question1: 20 }
        })
      })
    );

    expect(response?.status).toBe(201);
    const body = await response?.json() as any;
    expect(body.data.id).toBe('opp_12345');
    expect(body.data.diagnosticoId).toBe('diag_123');
  });
});
