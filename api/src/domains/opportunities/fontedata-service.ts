import type { FonteDataEnrichmentPayload } from './types';

export class FonteDataService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.FONTEDATA_API_KEY || '';
    this.baseUrl = baseUrl || process.env.FONTEDATA_API_URL || 'https://app.fontedata.com/api/v1';
  }

  /**
   * Validates CNPJ format and check digits (Gatekeeper)
   */
  public isValidCNPJ(cnpj: string): boolean {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false; // Invalid sequence e.g. 00000000000000

    let size = cleaned.length - 2;
    let numbers = cleaned.substring(0, size);
    const digits = cleaned.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== Number(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cleaned.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === Number(digits.charAt(1));
  }

  /**
   * Fetches company enrichment data from FonteData API (or fallback mock for dev)
   */
  async fetchCompanyData(rawCnpj: string, useMock: boolean = false): Promise<FonteDataEnrichmentPayload | null> {
    const cnpj = rawCnpj.replace(/\D/g, '');
    if (!this.isValidCNPJ(cnpj)) {
      console.warn(`[FonteDataService] CNPJ inválido fornecido: ${rawCnpj}`);
      return null;
    }

    if (useMock || process.env.NODE_ENV === 'test') {
      return this.buildMockPayload(cnpj);
    }

    try {
      const response = await fetch(`${this.baseUrl}/consulta/cadastro-pj-plus?cnpj=${cnpj}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json',
          'User-Agent': 'RevHackers-API/1.0',
        },
      });

      if (!response.ok) {
        console.warn(`[FonteDataService] API respondeu com status ${response.status} para CNPJ ${cnpj}`);
        // Fallback em desenvolvimento para não interromper fluxo
        return this.buildMockPayload(cnpj);
      }

      const data = await response.json();
      return this.mapToEnrichmentPayload(cnpj, data);
    } catch (err) {
      console.error('[FonteDataService] Erro ao conectar à API FonteData:', err);
      // Fallback seguro em caso de falha de rede
      return this.buildMockPayload(cnpj);
    }
  }

  private mapToEnrichmentPayload(cnpj: string, raw: any): FonteDataEnrichmentPayload {
    const capital = Number(raw.capital_social || raw.capitalSocial || 0);
    const branches = Number(raw.filiais_count || raw.branchesCount || raw.filiais?.length || 0);
    const companyName = raw.razao_social || raw.nome_fantasia || raw.nome || '';
    const email = raw.email || raw.correio_eletronico || raw.email_corporativo || '';
    const website = raw.website || raw.site || (email.includes('@') ? `www.${email.split('@')[1]}` : '');

    // ScalePower Index (SPI)
    const rawScore = Math.min(100, Math.round((capital / 50000) + (branches * 10)));
    const spiCategory = rawScore >= 80 ? 'ENTERPRISE' : rawScore >= 50 ? 'SCALEUP' : rawScore >= 20 ? 'EMERGING' : 'MICRO';

    // Serial Founder Radar (Holding Hunter)
    const partners = Array.isArray(raw.qsa || raw.socios)
      ? (raw.qsa || raw.socios).map((p: any) => ({
          name: p.nome || p.name || 'Sócio',
          role: p.qualificacao || p.role || 'Sócio-Administrador',
          other_companies_count: Number(p.outras_empresas_count || p.otherCompaniesCount || p.outrasEmpresas?.length || 0),
          other_companies: Array.isArray(p.outras_empresas || p.outrasEmpresas)
            ? (p.outras_empresas || p.outrasEmpresas).map((c: any) => ({
                cnpj: String(c.cnpj || '').replace(/\D/g, ''),
                company_name: c.nome || c.razao_social || c.companyName || '',
              }))
            : [],
        }))
      : [];

    // Operational Friction Scan (OFS)
    const lawsuitsCount = Number(raw.processos_count || raw.lawsuitsCount || 0);
    const hasLabor = Boolean(raw.tem_trabalhistas || raw.hasLaborClaims || false);
    const riskLevel = lawsuitsCount > 10 ? 'HIGH' : lawsuitsCount > 2 ? 'MEDIUM' : 'LOW';

    return {
      cnpj,
      company_name: companyName,
      email,
      website,
      spi: {
        score: rawScore,
        capital_social: capital,
        branch_count: branches,
        scale_category: spiCategory,
      },
      holding_hunter: {
        partners,
      },
      ofs: {
        risk_level: riskLevel,
        active_lawsuits_count: lawsuitsCount,
        has_labor_claims: hasLabor,
      },
      enriched_at: new Date().toISOString(),
      raw_provider: 'FonteData Live API',
    };
  }

  private buildMockPayload(cnpj: string): FonteDataEnrichmentPayload {
    return {
      cnpj,
      company_name: 'Acme Scale Systems Ltda',
      email: 'contato@acmescale.com.br',
      website: 'www.acmescale.com.br',
      spi: {
        score: 75,
        capital_social: 250000,
        branch_count: 3,
        scale_category: 'SCALEUP',
      },
      holding_hunter: {
        partners: [
          {
            name: 'Decisor Principal (Sócio Growth)',
            role: 'Sócio-Administrador',
            other_companies_count: 2,
            other_companies: [
              { cnpj: '12345678000199', company_name: 'Holding Aceleração Ltda' },
              { cnpj: '98765432000188', company_name: 'Tech Ventures S.A.' },
            ],
          },
        ],
      },
      ofs: {
        risk_level: 'LOW',
        active_lawsuits_count: 1,
        has_labor_claims: false,
      },
      enriched_at: new Date().toISOString(),
      raw_provider: 'FonteData Mock Sandbox',
    };
  }
}
