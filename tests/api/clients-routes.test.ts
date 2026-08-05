import { describe, expect, it, vi } from 'vitest';
import { createClientsRoutes } from '../../api/src/http/clients-routes';
import type { ClientService } from '../../api/src/domains/clients/service';
import type { TokenVerifier } from '../../api/src/identity/verifier';
import type { IdentityRepository } from '../../api/src/identity/postgres-identity-repository';
import type { InternalUser } from '../../api/src/contracts/tenant';

const mockUser: InternalUser = {
  id: 'user-1',
  globalRole: 'admin',
  status: 'active',
  memberships: [{ userId: 'user-1', tenantId: 'tenant-1', role: 'admin', status: 'active' }],
};

const makeDeps = (service: Partial<ClientService>) => ({
  service: service as ClientService,
  verifier: { verify: vi.fn().mockResolvedValue({ sub: 'user-1', issuer: 'google' }) } as unknown as TokenVerifier,
  identities: { findOrCreateUser: vi.fn().mockResolvedValue(mockUser) } as unknown as IdentityRepository,
});

const authed = (url: string, init: RequestInit = {}): Request =>
  new Request(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token', ...(init.headers ?? {}) },
  });

describe('ClientsRoutes - CRUD', () => {
  it('lista clientes autenticado (GET /v1/clients)', async () => {
    const service = { listClients: vi.fn().mockResolvedValue([{ id: '1', name: 'Cliente A' }]) };
    const routes = createClientsRoutes(makeDeps(service));

    const response = await routes(authed('https://api.test/v1/clients'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data).toHaveLength(1);
    expect(service.listClients).toHaveBeenCalledWith('tenant-1');
  });

  it('retorna cliente por id (GET /v1/clients/:id)', async () => {
    const service = { getClient: vi.fn().mockResolvedValue({ id: 'c1', name: 'Cliente A' }) };
    const routes = createClientsRoutes(makeDeps(service));

    const response = await routes(authed('https://api.test/v1/clients/c1'));

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data.id).toBe('c1');
  });

  it('retorna 404 quando cliente não existe', async () => {
    const { ApiError } = await import('../../api/src/contracts/errors');
    const service = { getClient: vi.fn().mockRejectedValue(ApiError.notFound('Cliente não encontrado.')) };
    const routes = createClientsRoutes(makeDeps(service));

    const response = await routes(authed('https://api.test/v1/clients/inexistente'));

    expect(response?.status).toBe(404);
    const json = await response?.json();
    expect(json.error.code).toBe('not_found');
  });

  it('cria cliente (POST /v1/clients)', async () => {
    const service = { createClient: vi.fn().mockResolvedValue({ id: 'c2', name: 'Novo Cliente' }) };
    const routes = createClientsRoutes(makeDeps(service));

    const response = await routes(
      authed('https://api.test/v1/clients', {
        method: 'POST',
        body: JSON.stringify({ name: 'Novo Cliente', email: 'novo@empresa.com' }),
      })
    );

    expect(response?.status).toBe(201);
    const json = await response?.json();
    expect(json.data.name).toBe('Novo Cliente');
    expect(service.createClient).toHaveBeenCalledWith('tenant-1', expect.objectContaining({ name: 'Novo Cliente' }));
  });

  it('retorna 400 para payload inválido no POST', async () => {
    const service = { createClient: vi.fn() };
    const routes = createClientsRoutes(makeDeps(service));

    const response = await routes(
      authed('https://api.test/v1/clients', {
        method: 'POST',
        body: JSON.stringify({ name: 'Sem Email' }), // email é obrigatório
      })
    );

    expect(response?.status).toBe(400);
    const json = await response?.json();
    expect(json.error.code).toBe('validation');
    expect(service.createClient).not.toHaveBeenCalled();
  });

  it('retorna 400 para CNPJ inválido no POST', async () => {
    const service = { createClient: vi.fn() };
    const routes = createClientsRoutes(makeDeps(service));

    const response = await routes(
      authed('https://api.test/v1/clients', {
        method: 'POST',
        body: JSON.stringify({ name: 'Cliente', email: 'a@b.com', cnpj: '123' }),
      })
    );

    expect(response?.status).toBe(400);
    const json = await response?.json();
    expect(json.error.code).toBe('validation');
  });

  it('atualiza cliente (PUT /v1/clients/:id)', async () => {
    const service = { updateClient: vi.fn().mockResolvedValue({ id: 'c1', name: 'Atualizado' }) };
    const routes = createClientsRoutes(makeDeps(service));

    const response = await routes(
      authed('https://api.test/v1/clients/c1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Atualizado' }),
      })
    );

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data.name).toBe('Atualizado');
  });

  it('remove cliente (DELETE /v1/clients/:id)', async () => {
    const service = { deleteClient: vi.fn().mockResolvedValue(undefined) };
    const routes = createClientsRoutes(makeDeps(service));

    const response = await routes(
      authed('https://api.test/v1/clients/c1', { method: 'DELETE' })
    );

    expect(response?.status).toBe(200);
    const json = await response?.json();
    expect(json.data.success).toBe(true);
  });
});

describe('ClientsRoutes - Auth & Edge Cases', () => {
  it('retorna 401 sem token de autenticação', async () => {
    const routes = createClientsRoutes(makeDeps({ listClients: vi.fn() }));
    const response = await routes(new Request('https://api.test/v1/clients'));

    expect(response?.status).toBe(401);
    const json = await response?.json();
    expect(json.error.code).toBe('unauthenticated');
  });

  it('retorna 401 com token inválido', async () => {
    const deps = makeDeps({ listClients: vi.fn() });
    (deps.verifier.verify as any).mockRejectedValue(new Error('token inválido'));
    const routes = createClientsRoutes(deps);

    const response = await routes(authed('https://api.test/v1/clients'));

    expect(response?.status).toBe(401);
  });

  it('retorna 403 para usuário inativo', async () => {
    const deps = makeDeps({ listClients: vi.fn() });
    (deps.identities.findOrCreateUser as any).mockResolvedValue({ ...mockUser, status: 'inactive' });
    const routes = createClientsRoutes(deps);

    const response = await routes(authed('https://api.test/v1/clients'));

    expect(response?.status).toBe(403);
  });

  it('retorna null para rota fora do prefixo /v1/clients', async () => {
    const routes = createClientsRoutes(makeDeps({}));
    const response = await routes(authed('https://api.test/v1/outra-coisa'));

    expect(response).toBeNull();
  });

  it('método não mapeado retorna 404', async () => {
    const routes = createClientsRoutes(makeDeps({}));
    const response = await routes(authed('https://api.test/v1/clients', { method: 'PATCH' }));

    expect(response?.status).toBe(404);
  });
});
