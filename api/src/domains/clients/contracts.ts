export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  tradeName: string | null;
  company: string | null;
  phone: string | null;
  cnpj: string | null;
  cep: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  country: string;
  segment: string | null;
  companySize: string | null;
  logoUrl: string | null;
  website: string | null;
  linkedinUrl: string | null;
  status: 'onboarding' | 'active' | 'churned';
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  name: string;
  email: string;
  tradeName?: string | null;
  company?: string | null;
  phone?: string | null;
  cnpj?: string | null;
  cep?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  segment?: string | null;
  companySize?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  status?: 'onboarding' | 'active' | 'churned';
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  tradeName?: string | null;
  company?: string | null;
  phone?: string | null;
  cnpj?: string | null;
  cep?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  segment?: string | null;
  companySize?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  status?: 'onboarding' | 'active' | 'churned';
}
