import { authenticatedRequest } from './_base';
import type { Client, ClientInsert, ClientUpdate } from '../clients';

async function request(path: string, init?: RequestInit): Promise<Response> {
  return authenticatedRequest(path, init);
}

export const clientsGcpAdapter = {
  async getAll(): Promise<Client[]> {
    const res = await request('/v1/clients');
    const body = await res.json();
    return body.data || [];
  },

  async getById(id: string): Promise<Client | null> {
    const res = await request(`/v1/clients/${encodeURIComponent(id)}`);
    const body = await res.json();
    return body.data || null;
  },

  async create(client: ClientInsert): Promise<Client | null> {
    const res = await request('/v1/clients', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(client),
    });
    const body = await res.json();
    return body.data || null;
  },

  async update(id: string, updates: ClientUpdate): Promise<Client | null> {
    const res = await request(`/v1/clients/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const body = await res.json();
    return body.data || null;
  },

  async delete(id: string): Promise<void> {
    await request(`/v1/clients/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
