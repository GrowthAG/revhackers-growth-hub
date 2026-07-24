import { requireGoogleIdToken } from '@/integrations/firebase/client';

export interface ReiProject {
  id: string;
  tenantId: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string;
  clientCompany: string | null;
  analystEmail: string;
  lastReiDate: string;
  nextReiDate: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  status: 'active' | 'pending' | 'overdue';
  type: 'consulting' | 'crm_ops' | 'site' | 'linkedin' | 'founder';
  tier: 'free' | 'paid';
  durationDays: number;
  schedulingCompleted: boolean;
  technicalEvidences: unknown[];
  clickupSpaceId: string | null;
  clickupFolderId: string | null;
  clickupDocId: string | null;
  clickupSprintFolderId: string | null;
  clickupProvisionedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReiProjectInsert = Omit<ReiProject, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'clickupSpaceId' | 'clickupFolderId' | 'clickupDocId' | 'clickupSprintFolderId' | 'clickupProvisionedAt'>;
export type ReiProjectUpdate = Partial<ReiProjectInsert>;

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
  if (!response.ok) throw new Error(`API GCP REI Projects request failed (${response.status}).`);
  return response;
}

export const reiProjectsGcpAdapter = {
  async getAll(): Promise<ReiProject[]> {
    const res = await request('/v1/rei-projects');
    const body = await res.json();
    return body.data || [];
  },

  async getById(id: string): Promise<ReiProject | null> {
    const res = await request(`/v1/rei-projects/${encodeURIComponent(id)}`);
    const body = await res.json();
    return body.data || null;
  },

  async create(project: ReiProjectInsert): Promise<ReiProject | null> {
    const res = await request('/v1/rei-projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(project),
    });
    const body = await res.json();
    return body.data || null;
  },

  async update(id: string, updates: ReiProjectUpdate): Promise<ReiProject | null> {
    const res = await request(`/v1/rei-projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const body = await res.json();
    return body.data || null;
  },

  async delete(id: string): Promise<void> {
    await request(`/v1/rei-projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
