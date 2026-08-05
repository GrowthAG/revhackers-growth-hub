/**
 * Tests for api/src/http/rei-projects-routes.ts
 *
 * Strategy: instantiate the route handler with mocked dependencies
 * (TokenVerifier, IdentityRepository, ReiProjectService) and exercise
 * the HTTP layer via `new Request(...)`.
 *
 * Coverage:
 *  - 401 (no token / invalid token)
 *  - 200 / 201 / 404 CRUD paths
 *  - 400 validation (Zod failures + service-level validation)
 *  - 404 (route not matched for unknown methods/paths)
 *  - Multi-tenant isolation: list scoped to caller's tenantId
 */

import { describe, it, expect } from 'vitest';
import { ApiError } from '../../api/src/contracts/errors';
import { createReiProjectsRoutes } from '../../api/src/http/rei-projects-routes';
import type { ReiProjectService } from '../../api/src/domains/rei-projects/service';
import type { CreateReiProjectInput, ReiProjectRecord, UpdateReiProjectInput } from '../../api/src/domains/rei-projects/contracts';
import type { IdentityRepository } from '../../api/src/identity/postgres-identity-repository';
import type { TokenVerifier } from '../../api/src/identity/verifier';
import type { InternalUser, TenantId } from '../../api/src/contracts/tenant';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const TENANT_A = '11111111-1111-4111-8111-111111111111';
const TENANT_B = '22222222-2222-4222-8222-222222222222';

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
const PROJECT_FIXTURE: ReiProjectRecord = {
  id: 'proj-1',
  tenantId: TENANT_A,
  clientId: null,
  clientName: 'Acme Corp',
  clientEmail: 'ops@acme.com',
  clientCompany: 'Acme',
  analystEmail: 'analyst@revhackers.com',
  lastReiDate: '2024-01-15',
  nextReiDate: '2024-04-15',
  quarter: 'Q1',
  year: 2024,
  status: 'active',
  type: 'consulting',
  tier: 'paid',
  durationDays: 90,
  schedulingCompleted: true,
  technicalEvidences: [],
  clickupSpaceId: null,
  clickupFolderId: null,
  clickupDocId: null,
  clickupSprintFolderId: null,
  clickupProvisionedAt: null,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

// -----------------------------------------------------------------------------
// Mock factories
// -----------------------------------------------------------------------------

function createMockVerifier(user: InternalUser | null = ACTIVE_USER): TokenVerifier {
  return {
    verify: async () => {
      if (!user) throw new Error('invalid token');
      return { 
        issuer: 'https://accounts.google.com', 
        subject: 'sub-123',
        expiresAt: Math.floor(Date.now() / 1000) + 3600
      };
    },
  };
}

function createMockIdentities(user: InternalUser | null = ACTIVE_USER): IdentityRepository {
  return {
    findOrCreateUser: async () => {
      if (!user) throw new Error('user not found');
      return user;
    },
  } as unknown as IdentityRepository;
}

function createMockService(overrides: Partial<ReiProjectService> = {}): ReiProjectService {
  const projectExists = (tenantId: TenantId, id: string) => id === 'proj-1' && tenantId === TENANT_A;
  return {
    listProjects: async (tenantId) => [tenantId === TENANT_A ? PROJECT_FIXTURE : { ...PROJECT_FIXTURE, tenantId }],
    getProject: async (tenantId, id) => {
      if (!projectExists(tenantId, id)) throw ApiError.notFound('Projeto REI não encontrado.');
      return PROJECT_FIXTURE;
    },
    createProject: async (tenantId, input) => ({
      ...PROJECT_FIXTURE,
      ...input,
      tenantId,
      id: 'proj-new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    updateProject: async (tenantId, id, input) => {
      if (!projectExists(tenantId, id)) throw ApiError.notFound('Projeto REI não encontrado.');
      return { ...PROJECT_FIXTURE, ...input };
    },
    deleteProject: async (tenantId, id) => {
      if (!projectExists(tenantId, id)) throw ApiError.notFound('Projeto REI não encontrado.');
    },
    ...overrides,
  } as ReiProjectService;
}

function buildRoutes(opts: {
  service?: Partial<ReiProjectService>;
  user?: InternalUser | null;
  verifier?: TokenVerifier;
} = {}) {
  const verifier = opts.verifier ?? createMockVerifier(opts.user !== undefined ? opts.user : ACTIVE_USER);
  const identities = createMockIdentities(opts.user !== undefined ? opts.user : ACTIVE_USER);
  const service = createMockService(opts.service);
  return createReiProjectsRoutes({ verifier, identities, service });
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('createReiProjectsRoutes - authentication', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const route = buildRoutes();
    const response = await route(unauthorized('GET', '/v1/rei-projects'));
    expect(response?.status).toBe(401);
    const body = await response?.json();
    expect(body.error.code).toBe('unauthenticated');
  });

  it('returns 401 when Authorization header is malformed', async () => {
    const route = buildRoutes();
    const request = new Request('https://api.test/v1/rei-projects', {
      method: 'GET',
      headers: { authorization: 'Basic dXNlcjpwYXNz' },
    });
    const response = await route(request);
    expect(response?.status).toBe(401);
  });

  it('returns 401 when token verification throws', async () => {
    const verifier = { verify: async () => { throw new Error('expired'); } } as TokenVerifier;
    const route = buildRoutes({ verifier });
    const response = await route(authed('GET', '/v1/rei-projects'));
    expect(response?.status).toBe(401);
  });

  it('returns 403 when user is inactive', async () => {
    const route = buildRoutes({ user: INACTIVE_USER });
    const response = await route(authed('GET', '/v1/rei-projects'));
    expect(response?.status).toBe(403);
    const body = await response?.json();
    expect(body.error.code).toBe('forbidden');
  });
});

describe('createReiProjectsRoutes - routing', () => {
  it('returns null for paths outside /v1/rei-projects', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/clients'));
    expect(response).toBeNull();
  });
});

describe('createReiProjectsRoutes - GET /v1/rei-projects', () => {
  it('lists projects scoped to tenant', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/rei-projects'));
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('proj-1');
    expect(body.data[0].tenantId).toBe(TENANT_A);
  });
});

describe('createReiProjectsRoutes - GET /v1/rei-projects/:id', () => {
  it('returns the project when found', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/rei-projects/proj-1'));
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body.data.id).toBe('proj-1');
  });

  it('returns 404 when project not found', async () => {
    const route = buildRoutes();
    const response = await route(authed('GET', '/v1/rei-projects/missing'));
    expect(response?.status).toBe(404);
    const body = await response?.json();
    expect(body.error.code).toBe('not_found');
  });
});

describe('createReiProjectsRoutes - POST /v1/rei-projects', () => {
  it('creates a project and returns 201', async () => {
    const route = buildRoutes();
    const input: CreateReiProjectInput = {
      clientName: 'New Client',
      clientEmail: 'new@client.com',
      analystEmail: 'analyst@revhackers.com',
      nextReiDate: '2024-07-15',
      quarter: 'Q3',
      year: 2024,
    };
    const response = await route(authed('POST', '/v1/rei-projects', input));
    expect(response?.status).toBe(201);
    const body = await response?.json();
    expect(body.data.id).toBe('proj-new');
    expect(body.data.clientName).toBe('New Client');
  });

  it('returns 400 when required fields are missing', async () => {
    const route = buildRoutes();
    const response = await route(authed('POST', '/v1/rei-projects', {
      clientName: 'Only Name',
    }));
    expect(response?.status).toBe(400);
    const body = await response?.json();
    expect(body.error.code).toBe('validation');
  });

  it('returns 400 when email is invalid', async () => {
    const route = buildRoutes();
    const response = await route(authed('POST', '/v1/rei-projects', {
      clientName: 'X',
      clientEmail: 'not-an-email',
      analystEmail: 'analyst@revhackers.com',
      nextReiDate: '2024-07-15',
      quarter: 'Q3',
      year: 2024,
    }));
    expect(response?.status).toBe(400);
  });

  it('returns 400 when year is out of range', async () => {
    const route = buildRoutes();
    const response = await route(authed('POST', '/v1/rei-projects', {
      clientName: 'X',
      clientEmail: 'x@x.com',
      analystEmail: 'analyst@revhackers.com',
      nextReiDate: '2024-07-15',
      quarter: 'Q3',
      year: 1999,
    }));
    expect(response?.status).toBe(400);
  });

  it('returns 400 when service throws ApiError.validation', async () => {
    const route = buildRoutes({
      service: {
        createProject: async () => {
          throw ApiError.validation('E-mail válido do cliente é obrigatório.');
        },
      },
    });
    const response = await route(authed('POST', '/v1/rei-projects', {
      clientName: 'X',
      clientEmail: 'x@x.com',
      analystEmail: 'analyst@revhackers.com',
      nextReiDate: '2024-07-15',
      quarter: 'Q3',
      year: 2024,
    }));
    expect(response?.status).toBe(400);
    const body = await response?.json();
    expect(body.error.code).toBe('validation');
  });
 });


describe('createReiProjectsRoutes - PUT /v1/rei-projects/:id', () => {
  it('updates the project and returns 200', async () => {
    const route = buildRoutes();
    const update: UpdateReiProjectInput = { status: 'pending' };
    const response = await route(authed('PUT', '/v1/rei-projects/proj-1', update));
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body.data.status).toBe('pending');
  });

  it('returns 404 when updating missing project', async () => {
    const route = buildRoutes();
    const response = await route(authed('PUT', '/v1/rei-projects/missing', { status: 'pending' }));
    expect(response?.status).toBe(404);
  });

  it('returns 400 on Zod validation failure (invalid email)', async () => {
    const route = buildRoutes();
    const response = await route(authed('PUT', '/v1/rei-projects/proj-1', { clientEmail: 'not-email' }));
    expect(response?.status).toBe(400);
  });
});

describe('createReiProjectsRoutes - DELETE /v1/rei-projects/:id', () => {
  it('deletes project and returns 200 with success:true', async () => {
    const route = buildRoutes();
    const response = await route(authed('DELETE', '/v1/rei-projects/proj-1'));
    expect(response?.status).toBe(200);
    const body = await response?.json();
    expect(body.data.success).toBe(true);
  });

  it('returns 404 when deleting missing project', async () => {
    const route = buildRoutes();
    const response = await route(authed('DELETE', '/v1/rei-projects/missing'));
    expect(response?.status).toBe(404);
  });
});

describe('createReiProjectsRoutes - method/path combinations', () => {
  it('returns 404 for PATCH (unsupported method)', async () => {
    const route = buildRoutes();
    const response = await route(authed('PATCH', '/v1/rei-projects/proj-1', {}));
    expect(response?.status).toBe(404);
  });

  it('returns 404 for POST /v1/rei-projects/:id (unsupported at this path)', async () => {
    const route = buildRoutes();
    const response = await route(authed('POST', '/v1/rei-projects/proj-1', {}));
    expect(response?.status).toBe(404);
  });

  it('returns 404 for DELETE /v1/rei-projects (no id)', async () => {
    const route = buildRoutes();
    const response = await route(authed('DELETE', '/v1/rei-projects'));
    expect(response?.status).toBe(404);
  });
});

describe('createReiProjectsRoutes - multi-tenant isolation', () => {
  it('does not return projects belonging to other tenants', async () => {
    // Build a user from TENANT_B so the caller's tenantId differs from fixture.
    const tenantBUser: InternalUser = {
      id: 'user-b',
      globalRole: 'admin',
      status: 'active',
      memberships: [{ userId: 'user-b', tenantId: TENANT_B, role: 'owner', status: 'active' }],
    };
    const route = buildRoutes({ user: tenantBUser });
    const response = await route(authed('GET', '/v1/rei-projects/proj-1'));
    // Mock service returns null for non-A tenant on this id.
    expect(response?.status).toBe(404);
  });
});