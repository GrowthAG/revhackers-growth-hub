import { requireGoogleIdToken } from '@/integrations/firebase/client';
import type { Client, ClientInsert, ClientUpdate } from '../clients';

function apiBase(): string {
  const value = import.meta.env.VITE_GCP_API_URL?.trim();
  if (!value) throw new Error('VITE_GCP_API_URL não configurada.');
  return value.replace(/\/$/, '');
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const token = await requireGoogleIdToken();
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...init?.headers },
  });
  if (!response.ok) throw new Error(`API GCP Clients request failed (${response.status}).`);
  return response;
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
