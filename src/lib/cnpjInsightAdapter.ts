import { fetchCNPJData, type CNPJData } from '@/lib/cnpjEnrichmentEngine';
import type { CnpjInsight } from '@/types/diagnostic';

export async function fetchCnpjInsight(cnpjInput: string): Promise<CnpjInsight | null> {
  const data = await fetchCNPJData(cnpjInput);
  if (!data) return null;
  return mapCnpjDataToInsight(data, cnpjInput);
}

export function mapCnpjDataToInsight(data: CNPJData, cnpjInput: string): CnpjInsight {
  const cleanCnpj = cnpjInput.replace(/\D/g, '');
  return {
    cnpj: cleanCnpj,
    companyName: data.nomeFantasia || data.razaoSocial || 'empresa',
    segment: data.setorInferido || data.cnaePrincipal?.descricao || 'segmento industrial',
    estimatedRevenue: rangeRevenueFromPorte(data.porte),
    headcount: rangeHeadcountFromPorte(data.porte),
    state: data.endereco?.uf || 'SP',
    ageYears: data.tempoMercadoAnos || 0,
  };
}

function rangeRevenueFromPorte(porte: string): string {
  const map: Record<string, string> = {
    MEI: 'ate 81k/ano',
    MICRO: '81k a 360k/ano',
    PEQUENA: '360k a 4.8M/ano',
    MEDIA: '4.8M a 90M/ano',
    GRANDE: '90M+/ano',
  };
  return map[porte] ?? 'nao informado';
}

function rangeHeadcountFromPorte(porte: string): string {
  const map: Record<string, string> = {
    MEI: '1',
    MICRO: '1-9',
    PEQUENA: '10-49',
    MEDIA: '50-249',
    GRANDE: '250+',
  };
  return map[porte] ?? 'nao informado';
}
