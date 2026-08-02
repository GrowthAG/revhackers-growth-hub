/**
 * cnpjEnrichmentEngine.ts
 *
 * Motor de Enriquecimento de Dados por CNPJ & Cura de Inteligência para Onboarding da RevHackers.
 * Busca dados da Receita Federal (BrasilAPI / ReceitaWS) e pré-preenche o formulário do REI,
 * eliminando digitação manual de informações públicas da empresa.
 */

export interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnaePrincipal: {
    codigo: number | string;
    descricao: string;
  };
  setorInferido: string;
  capitalSocial: number;
  porte: string;
  dataAbertura: string;
  tempoMercadoAnos: number;
  socios: Array<{
    nome: string;
    qualificacao: string;
  }>;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  telefone: string;
  email: string;
  status: 'ATIVA' | 'INATIVA' | 'BAIXADA' | string;
}

/**
 * Limpa a string do CNPJ mantendo apenas os dígitos numéricos.
 */
export function sanitizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Consulta dados públicos do CNPJ via BrasilAPI com fallback gracioso.
 */
export async function fetchCNPJData(cnpjInput: string): Promise<CNPJData | null> {
  const cnpjClean = sanitizeCNPJ(cnpjInput);
  if (cnpjClean.length !== 14) {
    throw new Error('CNPJ deve conter exatamente 14 dígitos numéricos.');
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`);
    if (!response.ok) {
      console.warn(`[CNPJ Engine] BrasilAPI returned status ${response.status}`);
      return null;
    }

    const data = await response.json();

    const anoAbertura = data.data_inicio_atividade
      ? parseInt(data.data_inicio_atividade.split('-')[0], 10)
      : new Date().getFullYear();
    const tempoMercadoAnos = Math.max(0, new Date().getFullYear() - anoAbertura);

    // Mapeia o CNAE para o setor comercial da RevHackers
    let setorInferido = 'Tecnologia / B2B';
    const cnaeDesc = (data.cnae_fiscal_descricao || '').toLowerCase();
    if (cnaeDesc.includes('software') || cnaeDesc.includes('tecnologia') || cnaeDesc.includes('dados')) {
      setorInferido = 'Software as a Service (SaaS)';
    } else if (cnaeDesc.includes('comercio') || cnaeDesc.includes('varejo')) {
      setorInferido = 'E-commerce / Varejo';
    } else if (cnaeDesc.includes('consultoria') || cnaeDesc.includes('serviço')) {
      setorInferido = 'Serviços B2B';
    } else if (cnaeDesc.includes('industria') || cnaeDesc.includes('fabricação')) {
      setorInferido = 'Indústria';
    }

    return {
      cnpj: cnpjClean,
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || data.razao_social || '',
      cnaePrincipal: {
        codigo: data.cnae_fiscal || '',
        descricao: data.cnae_fiscal_descricao || '',
      },
      setorInferido,
      capitalSocial: data.capital_social || 0,
      porte: data.porte || 'NÃO INFORMADO',
      dataAbertura: data.data_inicio_atividade || '',
      tempoMercadoAnos,
      socios: (data.qsa || []).map((s: any) => ({
        nome: s.nome_socio || '',
        qualificacao: s.qualificacao_socio || '',
      })),
      endereco: {
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        municipio: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep || '',
      },
      telefone: data.ddd_telefone_1 || '',
      email: data.email || '',
      status: data.descricao_situacao_cadastral || 'ATIVA',
    };
  } catch (error: any) {
    console.error('❌ [CNPJ Engine] Error fetching CNPJ data:', error?.message);
    return null;
  }
}
