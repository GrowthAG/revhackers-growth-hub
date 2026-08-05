import { authenticatedRequest } from './_base';
import type { Client, ClientInsert, ClientUpdate } from '../clients';

async function request(path: string, init?: RequestInit): Promise<Response> {
  return authenticatedRequest(path, init);
}

// Converte o payload do frontend (snake_case + máscaras) para o shape que o
// Zod da GCP API espera (camelCase + dígitos-only). Após a migration 0019 e
// a extensão dos schemas Zod, todos os campos do ClientInsert/ClientUpdate
// são aceitos: name, email, tradeName, company, phone, cnpj, cep, address,
// number, complement, neighborhood, logoUrl, website, linkedinUrl, city,
// state, country, segment, companySize, status. CNPJ/CEP/phone chegam com
// máscara do input ("12.345.678/0001-99", "00000-000", "(11) 99999-9999")
// e precisam virar só dígitos para o Zod aceitar.
function toGcpClientPayload(input: ClientInsert | ClientUpdate): Record<string, unknown> {
  const swap: Record<string, string> = {
    trade_name: 'tradeName',
    logo_url: 'logoUrl',
    linkedin_url: 'linkedinUrl',
    company_size: 'companySize',
  };
  const digitsOnly: Record<string, true> = { cnpj: true, cep: true, phone: true };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    const target = swap[k] ?? k;
    if (digitsOnly[target] && typeof v === 'string') {
      out[target] = v.replace(/\D/g, '');
    } else {
      out[target] = v;
    }
  }
  return out;
}

// Mapper reverso: a GCP API retorna campos em camelCase (tradeName, logoUrl,
// linkedinUrl, companySize) e o frontend Client/ClientFormContent consome em
// snake_case. Sem essa normalização, o edit-mode do admin abre com campos
// Nome Fantasia / Logo / Tamanho da Empresa em branco.
function fromGcpClient(record: Record<string, unknown> | null | undefined): Client | null {
  if (!record) return null;
  const swap: Record<string, string> = {
    tradeName: 'trade_name',
    logoUrl: 'logo_url',
    linkedinUrl: 'linkedin_url',
    companySize: 'company_size',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    out[swap[k] ?? k] = v;
  }
  return out as Client;
}

export const clientsGcpAdapter = {
  async getAll(): Promise<Client[]> {
    const res = await request('/v1/clients');
    const body = await res.json();
    return (body.data || []).map((r: Record<string, unknown>) => fromGcpClient(r) as Client);
  },

  async getById(id: string): Promise<Client | null> {
    const res = await request(`/v1/clients/${encodeURIComponent(id)}`);
    const body = await res.json();
    return fromGcpClient(body.data);
  },

  async create(client: ClientInsert): Promise<Client | null> {
    const res = await request('/v1/clients', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(toGcpClientPayload(client)),
    });
    const body = await res.json();
    return fromGcpClient(body.data);
  },

  async update(id: string, updates: ClientUpdate): Promise<Client | null> {
    const res = await request(`/v1/clients/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(toGcpClientPayload(updates)),
    });
    const body = await res.json();
    return fromGcpClient(body.data);
  },

  async delete(id: string): Promise<void> {
    await request(`/v1/clients/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
