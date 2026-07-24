import type { TenantId } from '../../contracts/tenant';

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  logoUrl: string | null;
  website: string | null;
  linkedinUrl: string | null;
  city: string | null;
  state: string | null;
  country: string;
  segment: string | null;
  companySize: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  segment?: string | null;
  companySize?: string | null;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  company?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  segment?: string | null;
  companySize?: string | null;
}
