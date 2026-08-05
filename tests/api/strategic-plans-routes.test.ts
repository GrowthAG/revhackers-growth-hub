/**
 * Tests for api/src/http/strategic-plans-http-routes.ts
 *
 * Coverage:
 * - POST /v1/strategic-plans/generate (AI generation + persist)
 * - GET /v1/strategic-plans/project/:projectId
 * - GET /v1/strategic-plans/:id
 * - POST /v1/strategic-plans (manual creation)
 * - PATCH /v1/strategic-plans/:id
 * - Authentication (401, 403)
 * - Validation (400)
 * - Not found (404)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStrategicPlansRoutes } from '../../api/src/http/strategic-plans-http-routes';
import { StrategicPlanService } from '../../api/src/domains/strategic-plans/service';
import { TokenVerifier } from '../../api/src/identity/verifier';
import { IdentityRepository } from '../../api/src/identity/postgres-identity-repository';
import type { InternalUser } from '../../api/src/contracts/tenant';
import type { StrategicPlanRecord } from '../../api/src/domains/strategic-plans/contracts';

// Mock AI generator
vi.mock('../../api/src/domains/strategic-plans/ai-generator', () => ({
  generateStrategicPlanAi: vi.fn(),
}));

import { generateStrategicPlanAi } from '../../api/src/domains/strategic-plans/ai-generator';

const mockedGenerateAi = vi.mocked(generateStrategicPlanAi);

// Test fixtures
const TENANT_A = '11111111-1111-4111-8111-111111111111';

const ACTIVE_USER: InternalUser = {
  id: 'user-active',
  globalRole: 'admin',
  status: 'active',
  memberships: [{ userId: 'user-active', tenantId: TENANT_A, role: 'owner', status: 'active' }],
};

const INACTIVE_USER: InternalUser = {
  id: 'user-inactive',
  globalRole: 'admin',
  status: 'disabled',
  memberships: [{ userId: 'user-inactive', tenantId: TENANT_A, role: 'owner', status: 'active' }],
};

const PLAN_FIXTURE: StrategicPlanRecord = {
  id: 'plan-1',
  tenantId: TENANT_A,
  reiProjectId: 'proj-1',
  clientId: 'client-1',
  diagnosticData: { segment: 'SaaS B2B' },
  personaData: { name: 'CTO' },
  premisesData: { hypothesis: 'Growth' },
  methodologyData: { framework: 'OKR' },
  roadmapData: { phase1: 'Discovery' },
  goalsData: { okrs: [{ o: 'Grow', krs: ['MRR'] }] },
  financialProjections: { current: 100, future: 200 },
  budgetData: { total: 50000 },
  nextStepsData: { steps: ['Hire', 'Build'] },
  status: 'draft',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

// Mock factories
function createMockVerifier(user: InternalUser | null = ACTIVE_USER): TokenVerifier {
  return {
    verify: async () => {
      if (!user) throw new Error('invalid token');
      return {
        issuer: 'https://accounts.google.com',
        subject: 'sub-123',
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      };
    },
  } as TokenVerifier;
}

function createMockIdentities(user: InternalUser | null = ACTIVE_USER): IdentityRepository {
  return {
    findOrCreateUser: async () => {
      if (!user) throw new Error('user not found');
      return user;
    },
  } as unknown as IdentityRepository;
}

function createMockService(overrides: Partial<StrategicPlanService> = {}): StrategicPlanService {
  return {
    getPlanById: async (id, tenantId) => {
      if (id === 'plan-1' && tenantId === TENANT_A) return PLAN_FIXTURE;
      return null;
    },
    getPlanByProjectId: async (projectId, tenantId) => {
      if (projectId === 'proj-1' && tenantId === TENANT_A) return PLAN_FIXTURE;
      return null;
    },
    createPlan: async (tenantId, input) => ({
      ...PLAN_FIXTURE,
      ...input,
      id: 'plan-new',
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    updatePlan: async (id, tenantId, input) => {
      if (id !== 'plan-1' || tenantId !== TENANT_A) throw new Error('Plan not found');
      return { ...PLAN_FIXTURE, ...input };
    },
    deletePlan: async (id, tenantId) => id === 'plan-1' && tenantId === TENANT_A,
    ...overrides,
  } as StrategicPlanService;
}

function buildRoutes(opts: {
  service?: Partial<StrategicPlanService>;
  user?: InternalUser | null;
  verifier?: TokenVerifier;
} = {}) {
  const verifier = opts.verifier ?? createMockVerifier(opts.user !== undefined ? opts.user : ACTIVE_USER);
  const identities = createMockIdentities(opts.user !== undefined ? opts.user : ACTIVE_USER);
  const service = createMockService(opts.service);
  return createStrategicPlansRoutes({ verifier, identities, service });
}

// Request helpers
function authed(method: string, path: string, body?: unknown): Request {
  const init: RequestInit = { method, headers: { authorization: 'Bearer test-token' } };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)['content-type'] = 'application/json';
  }
  return new Request(`https://api.test${path}`, init);
}

function unauthorized(method: string, path: string): Request {
  return new Request(`https://api.test${path}`, { method });
}

// Tests
describe('createStrategicPlansRoutes - authentication', () => {
  it('returns 401 when no Authorization header', async () => {
    const route = buildRoutes();
    const response = await route(unauthorized('GET', '/v1/strategic-plans/plan-1'));
    expect(response?.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    const verifier = { verify: async () => { throw new Error('expired'); } } as TokenVerifier;
    const route = buildRoutes({ verifier });
    const response = await route(authed('GET', '/v1/strategic-plans/plan-1'));
    expect(response?.status).toBe(401);
  });

  it('returns 403 when user is inactive', async () => {
    const route = buildRoutes({ user: INACTIVE_USER });
    const response = await route(authed('GET', '/v1/strategic-plans/plan-1'));
    expect(response?.status).toBe(403);
  });
});

describe('createStrategicPlansRoutes - routing', () => {
  it('returns null for paths outside /v1/strategic-plans', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/clients'));
    expect(response).toBeNull();
  });
});

describe('createStrategicPlansRoutes - GET /v1/strategic-plans/:id', () => {
  it('returns plan when found', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/strategic-plans/plan-1'));
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body.id).toBe('plan-1');
    expect(body.tenantId).toBe(TENANT_A);
  });

  it('returns 404 when plan not found', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/strategic-plans/missing'));
    expect(response?.status).toBe(404);
    const body = await response?.json();
    expect(body.error).toBe('not_found');
  });
});

describe('createStrategicPlansRoutes - GET /v1/strategic-plans/project/:projectId', () => {
  it('returns plan when project found', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/strategic-plans/project/proj-1'));
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body.reiProjectId).toBe('proj-1');
  });

  it('returns 404 when project not found', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/strategic-plans/project/missing'));
    expect(response?.status).toBe(404);
  });
});

describe('createStrategicPlansRoutes - POST /v1/strategic-plans', () => {
  it('creates plan manually and returns 201', async () => {
    const route = buildRoutes();
    const input = {
      diagnosticData: { segment: 'E-commerce' },
      personaData: { name: 'Founder' },
      premisesData: {},
      methodologyData: {},
      roadmapData: {},
      goalsData: {},
      financialProjections: {},
      budgetData: {},
      nextStepsData: {},
      status: 'draft',
    };
    const response = await route(authed('POST', '/v1/strategic-plans', input));
    expect(response?.status).toBe(201);
    const body = await response?.json();
    expect(body.id).toBe('plan-new');
    expect(body.diagnosticData.segment).toBe('E-commerce');
  });

  it('returns 400 when payload is invalid', async () => {
    const route = buildRoutes();
    const response = await route(authed('POST', '/v1/strategic-plans', {
      status: 'invalid-status',
    }));
    expect(response?.status).toBe(400);
  });
});

describe('createStrategicPlansRoutes - POST /v1/strategic-plans/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates plan with AI and returns 201', async () => {
    mockedGenerateAi.mockResolvedValue({
      context_mirror: { persona: 'CTO' },
      thesis_statement: { hypothesis: 'Growth' },
      executive_summary: { framework: 'OKR' },
      roadmap_phases: [{ phase: 1, name: 'Discovery' }],
      okrs: [{ o: 'Grow', krs: ['MRR'] }],
      current_vs_future: { current: 100, future: 200 },
      quick_wins: ['Hire'],
      decisions: ['Build'],
    } as any);

    const route = buildRoutes();
    const input = {
      segment: 'SaaS B2B',
      objective: 'Scale to $1M ARR',
      isB2B: true,
      projectType: 'consulting',
    };
    const response = await route(authed('POST', '/v1/strategic-plans/generate', input));
    expect(response?.status).toBe(201);
    const body = await response?.json();
    expect(body.plan.id).toBe('plan-new');
    expect(body.generatedData).toBeDefined();
    expect(mockedGenerateAi).toHaveBeenCalledWith({
      reiResponses: {},
      segment: 'SaaS B2B',
      objective: 'Scale to $1M ARR',
      isB2B: true,
      projectType: 'consulting',
      projectId: undefined,
      projectDuration: undefined,
      clientName: undefined,
      clientCompany: undefined,
      tradeName: undefined,
    });
  });

  it('accepts rei_responses (snake_case) as alternative field name', async () => {
    mockedGenerateAi.mockResolvedValue({} as any);

    const route = buildRoutes();
    const input = {
      rei_responses: { q1: 'answer' },
      segment: 'Agency',
    };
    const response = await route(authed('POST', '/v1/strategic-plans/generate', input));
    expect(response?.status).toBe(201);
    expect(mockedGenerateAi).toHaveBeenCalledWith(expect.objectContaining({
      reiResponses: { q1: 'answer' },
    }));
  });

  it('returns 500 when AI generation fails', async () => {
    mockedGenerateAi.mockRejectedValue(new Error('OpenAI quota exceeded'));

    const route = buildRoutes();
    const response = await route(authed('POST', '/v1/strategic-plans/generate', {
      segment: 'SaaS',
    }));
    expect(response?.status).toBe(500);
    const body = await response?.json();
    expect(body.error).toBe('generation_failed');
    expect(body.message).toContain('OpenAI quota exceeded');
  });
});

describe('createStrategicPlansRoutes - PATCH /v1/strategic-plans/:id', () => {
  it('updates plan and returns 200', async () => {
    const route = buildRoutes();
    const update = { status: 'sent', sentAt: '2024-01-20T10:00:00.000Z' };
    const response = await route(authed('PATCH', '/v1/strategic-plans/plan-1', update));
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body.status).toBe('sent');
    expect(body.sentAt).toBe('2024-01-20T10:00:00.000Z');
  });

  it('returns 404 when updating missing plan', async () => {
    const route = buildRoutes();
    const response = await route(authed('PATCH', '/v1/strategic-plans/missing', { status: 'sent' }));
    expect(response?.status).toBe(404);
    const body = await response?.json();
    expect(body.error).toBe('not_found');
  });

  it('returns 400 on invalid status value', async () => {
    const route = buildRoutes();
    const response = await route(authed('PATCH', '/v1/strategic-plans/plan-1', {
      status: 'bogus',
    }));
    expect(response?.status).toBe(400);
  });
});

describe('createStrategicPlansRoutes - multi-tenant isolation', () => {
  it('does not return plans from other tenants', async () => {
    const TENANT_B = '22222222-2222-4222-8222-222222222222';
    const tenantBUser: InternalUser = {
      id: 'user-b',
      globalRole: 'admin',
      status: 'active',
      memberships: [{ userId: 'user-b', tenantId: TENANT_B, role: 'owner', status: 'active' }],
    };
    const route = buildRoutes({ user: tenantBUser });
    const response = await route(authed('GET', '/v1/strategic-plans/plan-1'));
    expect(response?.status).toBe(404);
  });
});