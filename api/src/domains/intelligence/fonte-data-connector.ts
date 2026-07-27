import { FonteDataService } from '../opportunities/fontedata-service';
import type { CompetitorIntelligenceRecord } from './types';

export class FonteDataIntelligenceConnector {
  private readonly fonteDataService: FonteDataService;

  constructor(fonteDataService?: FonteDataService) {
    this.fonteDataService = fonteDataService || new FonteDataService();
  }

  /**
   * Valida o CNPJ informado e prepara o objeto de enriquecimento para a tabela app.competitor_intelligence.
   * Por ora, valida o CNPJ reutilizando o FonteDataService e retorna null caso seja inválido.
   * A integração completa será expandida na T2.3 com a rota HTTP de enriquecimento.
   */
  async enrichCompetitorByCNPJ(rawCnpj: string): Promise<Partial<CompetitorIntelligenceRecord> | null> {
    const cleanCnpj = rawCnpj.replace(/\D/g, '');

    if (!this.fonteDataService.isValidCNPJ(cleanCnpj)) {
      console.warn(`[FonteDataIntelligenceConnector] CNPJ inválido fornecido: ${rawCnpj}`);
      return null;
    }

    // Retorna null por ora (conforme especificação da T2.2); a expansão completa de payload ocorre na T2.3
    return null;
  }
}
