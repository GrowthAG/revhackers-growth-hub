/**
 * Testes unitarios para os handlers AI (Wave 1 - migracao Supabase -> GCP).
 *
 * Cobre:
 *   - ai-routes (auth gate, dispatch, error handling, response shape)
 *   - analyze-diagnostic handler (zod, prompt selection, AI integration)
 *   - generate-growthmap handler (15 frameworks, zod)
 *   - swot-analysis handler (NEW - MiniMax growth hub)
 *   - growthmap-suggest handler (NEW - MiniMax growth hub)
 *   - prompts/loader (fallback when DB empty, error handling)
 *   - log/usage (best-effort write to pool)
 *
 * Padrao: mock QueryablePool com vi.fn(), mock callAi via spyOn,
 * sem dependencia de DATABASE_URL.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAiRoutes } from '../../api/src/http/ai-routes';
import { handleAnalyzeDiagnostic } from '../../api/src/ai/handlers/analyze-diagnostic';
import { handleGenerateGrowthmap, GROWTHMAP_FRAMEWORKS } from '../../api/src/ai/handlers/generate-growthmap';
import { handleSwotAnalysis } from '../../api/src/ai/handlers/swot-analysis';
import { handleGrowthMapSuggest } from '../../api/src/ai/handlers/growthmap-suggest';
import { loadPrompt } from '../../api/src/ai/prompts/loader';
import { logAiUsage } from '../../api/src/ai/log/usage';
import type { QueryablePool } from '../../api/src/db/postgres';
import type { AuthMiddleware } from '../../api/src/http/auth-middleware';

// ============================================================================
// HELPERS
// ============================================================================

const ACTIVE_USER = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  globalRole: 'admin' as const,
  status: 'active' as const,
  memberships: [],
};

function createMockAuth(authenticateImpl?: AuthMiddleware['authenticate']): AuthMiddleware {
  return {
    authenticate: authenticateImpl ?? (async () => ({ user: ACTIVE_USER, tenantId: 'tenant-1' })),
  } as unknown as AuthMiddleware;
}

function createMockPool(queryImpl?: QueryablePool['query']): QueryablePool {
  return {
    query: queryImpl ?? (vi.fn().mockResolvedValue({ rows: [] })),
  } as unknown as QueryablePool;
}

function authed(method: string, path: string, body?: unknown): Request {
  return new Request(`https://api.test${path}`, {
    method,
    headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : null,
  });
}

function noAuth(method: string, path: string, body?: unknown): Request {
  return new Request(`https://api.test${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : null,
  });
}

// ============================================================================
// AI ROUTES — auth + dispatch
// ============================================================================

describe('ai-routes — HTTP layer', () => {
  let mockPool: QueryablePool;
  let route: (request: Request) => Promise<Response | null>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPool = createMockPool();
    const auth = createMockAuth();
    route = createAiRoutes({ auth, pool: mockPool });
  });

  it('GET /v1/ai/ retorna 200 com lista de handlers registrados', async () => {
    const response = await route(authed('GET', '/v1/ai/'));
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBe('wave-1');
    expect(Array.isArray(body.handlers)).toBe(true);
    expect(body.handlers).toContain('analyze-diagnostic');
    expect(body.handlers).toContain('generate-growthmap');
    expect(body.handlers).toContain('swot-analysis');
    expect(body.handlers).toContain('growthmap-suggest');
  });

  it('POST sem Authorization retorna 401 (unauthenticated)', async () => {
    const auth = createMockAuth(async () =>
      new Response(JSON.stringify({ error: { code: 'unauthenticated', message: 'Token ausente.' } }), { status: 401 })
    );
    route = createAiRoutes({ auth, pool: mockPool });
    const response = await route(noAuth('POST', '/v1/ai/analyze-diagnostic', { type: 'growth', answers: [] }));
    expect(response?.status).toBe(401);
  });

  it('handler desconhecido retorna 404 com lista de handlers disponiveis', async () => {
    const response = await route(authed('POST', '/v1/ai/handler-que-nao-existe', { foo: 'bar' }));
    expect(response?.status).toBe(404);
    const body = await response?.json();
    expect(body.error.code).toBe('not_found');
    expect(Array.isArray(body.available)).toBe(true);
  });

  it('metodo nao-POST retorna 405', async () => {
    const response = await route(authed('PUT', '/v1/ai/analyze-diagnostic'));
    expect(response?.status).toBe(405);
  });

  it('path que nao comeca com /v1/ai/ retorna null (chain fallback)', async () => {
    const response = await route(authed('POST', '/v1/clients', {}));
    expect(response).toBeNull();
  });

  it('body JSON invalido retorna 400', async () => {
    const req = new Request('https://api.test/v1/ai/analyze-diagnostic', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
      body: '{ malformed json',
    });
    const response = await route(req);
    expect(response?.status).toBe(400);
    const body = await response?.json();
    expect(body.error.code).toBe('validation');
  });
});

// ============================================================================
// ANALYZE-DIAGNOSTIC HANDLER
// ============================================================================

describe('analyze-diagnostic handler', () => {
  let mockPool: QueryablePool;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPool = createMockPool();
  });

  it('rejeita payload sem type', async () => {
    await expect(
      handleAnalyzeDiagnostic({ pool: mockPool, userId: 'u1', tenantId: 't1' }, { answers: [1, 2, 3] }),
    ).rejects.toThrow();
  });

  it('rejeita type invalido', async () => {
    await expect(
      handleAnalyzeDiagnostic({ pool: mockPool, userId: 'u1', tenantId: 't1' }, { type: 'invalid', answers: [] }),
    ).rejects.toThrow();
  });

  it('rejeita founder sem linkedinUrl', async () => {
    await expect(
      handleAnalyzeDiagnostic(
        { pool: mockPool, userId: 'u1', tenantId: 't1' },
        { type: 'founder', answers: [1, 2, 3, 4, 5] },
      ),
    ).rejects.toThrow(/linkedinUrl/);
  });

  it('rejeita linkedinUrl invalido', async () => {
    await expect(
      handleAnalyzeDiagnostic(
        { pool: mockPool, userId: 'u1', tenantId: 't1' },
        { type: 'founder', answers: [1, 2, 3, 4, 5], linkedinUrl: 'not-a-url' },
      ),
    ).rejects.toThrow();
  });

  it('processa growth type com mock callAi', async () => {
    const callAiSpy = vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockResolvedValue({
      content: '{"archetype":"Test","score_level":"adequado"}',
      parsed: { archetype: 'Test', score_level: 'adequado' },
      provider: 'minimax',
      model: 'minimax-m3',
      inputTokens: 100,
      outputTokens: 50,
    });

    const result = await handleAnalyzeDiagnostic(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      { type: 'growth', answers: [10, 12, 8, 15, 9], totalScore: 54 },
    );

    expect(result.type).toBe('growth');
    expect(result.fromDatabase).toBe(false);
    expect(callAiSpy).toHaveBeenCalledTimes(1);
  });

  it('processa revenue type', async () => {
    vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockResolvedValue({
      content: '{}',
      parsed: { archetype: 'R' },
      provider: 'minimax',
      model: 'minimax-m3',
    });

    const result = await handleAnalyzeDiagnostic(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      { type: 'revenue', answers: [5, 5, 5, 5, 5], totalScore: 25 },
    );
    expect(result.type).toBe('revenue');
  });

  it('processa founder type com linkedinUrl', async () => {
    vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockResolvedValue({
      content: '{"archetype":"Executor"}',
      parsed: { archetype: 'Executor' },
      provider: 'minimax',
      model: 'minimax-m3',
    });

    const result = await handleAnalyzeDiagnostic(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      {
        type: 'founder',
        answers: [10, 15, 20, 5, 10],
        totalScore: 60,
        linkedinUrl: 'https://linkedin.com/in/test',
      },
    );
    expect(result.type).toBe('founder');
  });

  it('log de uso e gravado em caso de sucesso', async () => {
    vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockResolvedValue({
      content: '{}',
      parsed: {},
      provider: 'minimax',
      model: 'minimax-m3',
      inputTokens: 10,
      outputTokens: 20,
    });
    const querySpy = vi.spyOn(mockPool, 'query');

    await handleAnalyzeDiagnostic(
      { pool: mockPool, userId: 'u-1', tenantId: 't-1' },
      { type: 'growth', answers: [1], totalScore: 1 },
    );

    expect(querySpy.mock.calls.length).toBeGreaterThanOrEqual(1);
    const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1];
    expect(lastCall?.[0]).toContain('INSERT INTO app.ai_usage_log');
  });

  it('log de uso e gravado mesmo quando callAi falha', async () => {
    vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockRejectedValue(new Error('MiniMax down'));
    const querySpy = vi.spyOn(mockPool, 'query');

    await expect(
      handleAnalyzeDiagnostic(
        { pool: mockPool, userId: 'u-1', tenantId: 't-1' },
        { type: 'growth', answers: [1], totalScore: 1 },
      ),
    ).rejects.toThrow(/MiniMax down/);

    const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1];
    expect(lastCall?.[0]).toContain('INSERT INTO app.ai_usage_log');
  });
});

// ============================================================================
// GENERATE-GROWTHMAP HANDLER
// ============================================================================

describe('generate-growthmap handler', () => {
  let mockPool: QueryablePool;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPool = createMockPool();
  });

  it('GROWTHMAP_FRAMEWORKS tem 15 frameworks', () => {
    expect(GROWTHMAP_FRAMEWORKS.length).toBe(15);
    expect(GROWTHMAP_FRAMEWORKS).toContain('swot');
    expect(GROWTHMAP_FRAMEWORKS).toContain('tam_sam_som');
    expect(GROWTHMAP_FRAMEWORKS).toContain('design_thinking');
  });

  it('rejeita framework desconhecido', async () => {
    await expect(
      handleGenerateGrowthmap(
        { pool: mockPool, userId: 'u1', tenantId: 't1' },
        { framework: 'invalid-framework', company_name: 'Test' },
      ),
    ).rejects.toThrow();
  });

  it('rejeita company_name vazio', async () => {
    await expect(
      handleGenerateGrowthmap(
        { pool: mockPool, userId: 'u1', tenantId: 't1' },
        { framework: 'swot', company_name: '' },
      ),
    ).rejects.toThrow();
  });

  it('processa framework swot com mock callAi', async () => {
    const callAiSpy = vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockResolvedValue({
      content: '{"forcas":[],"fraquezas":[],"oportunidades":[],"ameacas":[]}',
      parsed: { forcas: [], fraquezas: [], oportunidades: [], ameacas: [] },
      provider: 'minimax',
      model: 'minimax-m3',
    });

    const result = await handleGenerateGrowthmap(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      { framework: 'swot', company_name: 'Acme', segment: 'SaaS' },
    );
    expect(result.framework).toBe('swot');
    expect(callAiSpy).toHaveBeenCalledTimes(1);
  });

  it('inclui contexto REI no user prompt quando fornecido', async () => {
    let capturedUserPrompt = '';
    vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockImplementation(async (req) => {
      capturedUserPrompt = req.userPrompt;
      return {
        content: '{}',
        parsed: {},
        provider: 'minimax',
        model: 'minimax-m3',
      };
    });

    await handleGenerateGrowthmap(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      {
        framework: 'gtm',
        company_name: 'Acme',
        company_description: 'B2B SaaS for RevOps',
        rei_responses: { segmento: 'tech' },
        competitors: [{ nome: 'Competitor A' }],
      },
    );
    expect(capturedUserPrompt).toContain('Acme');
    expect(capturedUserPrompt).toContain('B2B SaaS for RevOps');
    expect(capturedUserPrompt).toContain('Competitor A');
  });
});

// ============================================================================
// SWOT ANALYSIS (NEW FEATURE)
// ============================================================================

describe('swot-analysis handler (NEW - MiniMax growth hub)', () => {
  let mockPool: QueryablePool;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPool = createMockPool();
  });

  it('rejeita company_name vazio', async () => {
    await expect(
      handleSwotAnalysis({ pool: mockPool, userId: 'u1', tenantId: 't1' }, { company_name: '' }),
    ).rejects.toThrow();
  });

  it('rejeita company_url invalida', async () => {
    await expect(
      handleSwotAnalysis(
        { pool: mockPool, userId: 'u1', tenantId: 't1' },
        { company_name: 'Acme', company_url: 'not-a-url' },
      ),
    ).rejects.toThrow();
  });

  it('gera SWOT com mock callAi', async () => {
    const callAiSpy = vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockResolvedValue({
      content: '{"forcas":[{"text":"equipe forte"}],"fraquezas":[],"oportunidades":[],"ameacas":[],"strategic_implications":["foco em X"],"confidence_score":0.85}',
      parsed: {
        forcas: [{ text: 'equipe forte' }],
        fraquezas: [],
        oportunidades: [],
        ameacas: [],
        strategic_implications: ['foco em X'],
        confidence_score: 0.85,
      },
      provider: 'minimax',
      model: 'minimax-m3',
    });

    const result = await handleSwotAnalysis(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      { company_name: 'Acme Corp', industry: 'SaaS' },
    );
    expect(result.company).toBe('Acme Corp');
    const analysis = result.analysis as { confidence_score: number };
    expect(analysis.confidence_score).toBe(0.85);
    expect(callAiSpy).toHaveBeenCalledTimes(1);
  });

  it('inclui client_context no prompt quando fornecido', async () => {
    let capturedUserPrompt = '';
    vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockImplementation(async (req) => {
      capturedUserPrompt = req.userPrompt;
      return { content: '{}', parsed: {}, provider: 'minimax', model: 'minimax-m3' };
    });

    await handleSwotAnalysis(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      {
        company_name: 'Target',
        client_context: 'Somos uma consultoria B2B no Brasil',
      },
    );
    expect(capturedUserPrompt).toContain('Target');
    expect(capturedUserPrompt).toContain('consultoria B2B no Brasil');
  });
});

// ============================================================================
// GROWTHMAP-SUGGEST (NEW FEATURE)
// ============================================================================

describe('growthmap-suggest handler (NEW - MiniMax growth hub)', () => {
  let mockPool: QueryablePool;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPool = createMockPool();
  });

  it('rejeita archetype vazio', async () => {
    await expect(
      handleGrowthMapSuggest(
        { pool: mockPool, userId: 'u1', tenantId: 't1' },
        { archetype: '', totalScore: 50 },
      ),
    ).rejects.toThrow();
  });

  it('rejeita totalScore fora do range', async () => {
    await expect(
      handleGrowthMapSuggest(
        { pool: mockPool, userId: 'u1', tenantId: 't1' },
        { archetype: 'Test', totalScore: 150 },
      ),
    ).rejects.toThrow();
  });

  it('sugere 3 frameworks validos', async () => {
    const callAiSpy = vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockResolvedValue({
      content: '{"top_3":["swot","gtm","ice_score"],"reasoning":{"swot":"primeiro","gtm":"segundo","ice_score":"terceiro"}}',
      parsed: {
        top_3: ['swot', 'gtm', 'ice_score'],
        reasoning: { swot: 'primeiro', gtm: 'segundo', ice_score: 'terceiro' },
      },
      provider: 'minimax',
      model: 'minimax-m3',
    });

    const result = await handleGrowthMapSuggest(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      { archetype: 'Growth em Construcao', totalScore: 45 },
    );
    const suggestion = result.suggestion as { top_3: string[] };
    expect(suggestion.top_3).toEqual(['swot', 'gtm', 'ice_score']);
    expect(result.availableFrameworks).toContain('swot');
    expect(callAiSpy).toHaveBeenCalledTimes(1);
  });

  it('filtra alucinacoes da IA (frameworks invalidos sao removidos)', async () => {
    vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockResolvedValue({
      content: '{}',
      parsed: {
        top_3: ['swot', 'framework-que-nao-existe', 'gtm'],
        reasoning: {},
      },
      provider: 'minimax',
      model: 'minimax-m3',
    });

    const result = await handleGrowthMapSuggest(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      { archetype: 'Test', totalScore: 50 },
    );
    const suggestion = result.suggestion as { top_3: string[] };
    expect(suggestion.top_3).toEqual(['swot', 'gtm']);
    expect(suggestion.top_3).not.toContain('framework-que-nao-existe');
  });

  it('inclui dimensionScores e segment no prompt', async () => {
    let capturedUserPrompt = '';
    vi.spyOn(await import('../../api/src/ai/providers/router'), 'callAi').mockImplementation(async (req) => {
      capturedUserPrompt = req.userPrompt;
      return { content: '{}', parsed: { top_3: [] }, provider: 'minimax', model: 'minimax-m3' };
    });

    await handleGrowthMapSuggest(
      { pool: mockPool, userId: 'u1', tenantId: 't1' },
      {
        archetype: 'Test',
        totalScore: 60,
        dimensionScores: { Captacao: 5, Retencao: 15 },
        segment: 'SaaS B2B',
        objective: 'Aumentar receita 3x',
      },
    );
    expect(capturedUserPrompt).toContain('Test');
    expect(capturedUserPrompt).toContain('60/100');
    expect(capturedUserPrompt).toContain('SaaS B2B');
    expect(capturedUserPrompt).toContain('Aumentar receita 3x');
  });
});

// ============================================================================
// PROMPTS LOADER
// ============================================================================

describe('loadPrompt', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna fallback quando query retorna 0 rows', async () => {
    const pool = createMockPool(vi.fn().mockResolvedValue({ rows: [] }));
    const result = await loadPrompt(pool, 'analyze-diagnostic', 'growth', 'FALLBACK STRING');
    expect(result.fromDatabase).toBe(false);
    expect(result.body).toBe('FALLBACK STRING');
    expect(result.model).toBeNull();
    expect(result.provider).toBeNull();
  });

  it('retorna do banco quando query retorna row', async () => {
    const pool = createMockPool(vi.fn().mockResolvedValue({
      rows: [{ body: 'FROM DB', model: 'gpt-4o', provider: 'openai' }],
    }));
    const result = await loadPrompt(pool, 'analyze-diagnostic', 'growth', 'FALLBACK STRING');
    expect(result.fromDatabase).toBe(true);
    expect(result.body).toBe('FROM DB');
    expect(result.model).toBe('gpt-4o');
    expect(result.provider).toBe('openai');
  });

  it('cai no fallback quando query lanca erro (tabela nao existe)', async () => {
    const pool = createMockPool(vi.fn().mockRejectedValue(new Error('relation does not exist')));
    const result = await loadPrompt(pool, 'analyze-diagnostic', 'growth', 'FALLBACK STRING');
    expect(result.fromDatabase).toBe(false);
    expect(result.body).toBe('FALLBACK STRING');
  });

  it('passa edgeFunction e promptKey como parametros', async () => {
    const querySpy = vi.fn().mockResolvedValue({ rows: [] });
    const pool = createMockPool(querySpy);
    await loadPrompt(pool, 'generate-growthmap', 'swot', 'FALLBACK');
    const sql = querySpy.mock.calls[0]?.[0] as string;
    expect(sql).toContain('edge_function = $1');
    expect(sql).toContain('prompt_key = $2');
    const params = querySpy.mock.calls[0]?.[1] as unknown[];
    expect(params).toEqual(['generate-growthmap', 'swot']);
  });
});

// ============================================================================
// LOG USAGE
// ============================================================================

describe('logAiUsage', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('insere log com todos os campos', async () => {
    const querySpy = vi.fn().mockResolvedValue({ rows: [] });
    const pool = createMockPool(querySpy);
    await logAiUsage(pool, {
      edgeFunction: 'analyze-diagnostic',
      provider: 'minimax',
      model: 'minimax-m3',
      userId: 'u-1',
      tenantId: 't-1',
      success: true,
      inputTokens: 100,
      outputTokens: 50,
      latencyMs: 1234,
      metadata: { foo: 'bar' },
    });
    expect(querySpy).toHaveBeenCalledTimes(1);
    const [sql, params] = querySpy.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('INSERT INTO app.ai_usage_log');
    expect(params[0]).toBe('analyze-diagnostic');
    expect(params[1]).toBe('minimax');
    expect(params[2]).toBe('minimax-m3');
    expect(params[3]).toBe('u-1');
    expect(params[4]).toBe('t-1');
    expect(params[5]).toBe(true);
    expect(params[6]).toBeNull();
    expect(params[7]).toBe(100);
    expect(params[8]).toBe(50);
    expect(params[9]).toBe(1234);
    expect(params[10]).toBe('{"foo":"bar"}');
  });

  it('nao propaga erro quando query falha (best-effort)', async () => {
    const pool = createMockPool(vi.fn().mockRejectedValue(new Error('connection lost')));
    await expect(
      logAiUsage(pool, {
        edgeFunction: 'analyze-diagnostic',
        provider: 'minimax',
        model: 'm',
        success: false,
        errorMessage: 'boom',
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
