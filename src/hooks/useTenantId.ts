import { useQuery } from '@tanstack/react-query';
import { apiBase } from '@/api/adapters/_base';
import { requireGoogleIdToken } from '@/integrations/firebase/client';

/**
 * Fallback tenant UUID matches `DEFAULT_STAGING_TENANT_ID` on the API
 * side (api/src/http/auth-middleware.ts). It is the seed tenant created
 * by migration 0018_seed_minimal_data.sql.
 *
 * The backend resolves this fallback automatically when the user has no
 * memberships; we mirror that contract on the frontend so the dashboard
 * shows data that actually exists in the database instead of empty rows.
 */
export const DEFAULT_STAGING_TENANT_ID = '11111111-1111-4111-8111-111111111111';

export interface Membership {
  tenantId: string;
  role: 'owner' | 'admin' | 'operator' | 'viewer';
  status: 'active' | 'suspended' | 'invited';
}

export interface CurrentUser {
  id: string;
  globalRole: 'super_admin' | 'admin' | 'user' | null;
  status: 'active' | 'suspended' | 'invited';
  memberships: Membership[];
}

async function fetchCurrentUser(): Promise<CurrentUser> {
  const token = await requireGoogleIdToken();
  const res = await fetch(`${apiBase()}/v1/me`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to load current user (${res.status}).`);
  }
  const body = (await res.json()) as { data: CurrentUser };
  return body.data;
}

/**
 * Resolves the active tenant for the signed-in user.
 *
 * Picks the first ACTIVE membership (mirroring the backend's
 * `auth-middleware.ts` fallback) and falls back to the staging tenant
 * when the user has no memberships — the dashboard would otherwise
 * silently read empty data.
 *
 * Returns `undefined` while loading; the consumer should render a
 * skeleton until the value resolves.
 */
export function useTenantId(): string | undefined {
  const query = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  if (query.isLoading || query.error || !query.data) return undefined;
  const active = query.data.memberships.find((m) => m.status === 'active');
  return active?.tenantId ?? DEFAULT_STAGING_TENANT_ID;
}