import { requireGoogleIdToken } from '@/integrations/firebase/client';

export function apiBase(): string {
  const value = import.meta.env.VITE_GCP_API_URL?.trim();
  if (!value) throw new Error('VITE_GCP_API_URL não configurada.');
  return value.replace(/\/$/, '');
}

export async function authenticatedRequest(path: string, init?: RequestInit): Promise<Response> {
  const token = await requireGoogleIdToken();
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API GCP request failed (${response.status}) ${init?.method || 'GET'} ${path}`);
  }
  return response;
}
