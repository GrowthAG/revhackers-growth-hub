import type { BankStatementRecord, LedgerEntryRecord, MatchCandidate } from './types';

export interface OpportunityMatchContext {
  id: string;
  client_name: string;
  client_company?: string | null;
  cnpj?: string | null;
  opportunity_data?: {
    tx_id?: string;
    invoice_id?: string;
    value?: number;
  };
}

export class ReconciliationEngine {
  /**
   * Avalia um extrato bancário contra a lista de contas a receber (ledger) e/ou oportunidades.
   * Aplica 3 regras em cascata:
   * Rule 1 (Exact TxID / PixKey / Invoice ID): 100% Score (validando janela temporal de até 30 dias)
   * Rule 2 (CNPJ/CPF + Amount): 95% Score (tolerante a D-2 até D+2)
   * Rule 3 (Fuzzy Name + Amount): 80% Score (Token-based Overlap / Jaccard similarity com normalização de acentos)
   */
  evaluateMatch(
    statement: BankStatementRecord,
    openLedgerEntries: LedgerEntryRecord[],
    opportunities: OpportunityMatchContext[] = []
  ): MatchCandidate | null {
    // RULE 1: Exact TxID / PixKey / Invoice ID (com validação temporal de 30 dias)
    if (statement.bank_transaction_id) {
      // Check open ledger entries first
      for (const entry of openLedgerEntries) {
        if (
          entry.description.includes(statement.bank_transaction_id) ||
          (entry.opportunity_id && statement.bank_transaction_id.length > 5 && entry.description.includes(statement.bank_transaction_id))
        ) {
          if (this.isWithinDateWindow(statement.transaction_date, entry.competence_date, 30)) {
            return {
              statement,
              ledger_entry: entry,
              opportunity_id: entry.opportunity_id || null,
              match_score: 100,
              match_rule: 'RULE_1_EXACT_TXID',
              reason: `Exact match on Bank TxID / Pix ID: ${statement.bank_transaction_id}`,
            };
          }
        }
      }

      // Check opportunities directly
      for (const opp of opportunities) {
        if (
          opp.opportunity_data?.tx_id === statement.bank_transaction_id ||
          opp.opportunity_data?.invoice_id === statement.bank_transaction_id
        ) {
          return {
            statement,
            ledger_entry: null,
            opportunity_id: opp.id,
            match_score: 100,
            match_rule: 'RULE_1_EXACT_TXID',
            reason: `Exact match on Opportunity TxID/InvoiceID: ${statement.bank_transaction_id}`,
          };
        }
      }
    }

    // RULE 2: CNPJ/CPF + Exact Amount within date window (D-2 to D+2)
    if (statement.payer_document) {
      const cleanDoc = statement.payer_document.replace(/\D/g, '');
      if (cleanDoc.length >= 11) {
        for (const entry of openLedgerEntries) {
          if (Math.abs(entry.amount - statement.amount) < 0.01) {
            if (this.isWithinDateWindow(statement.transaction_date, entry.competence_date, 2)) {
              // Verify document match if available in entry or linked opportunity
              const linkedOpp = opportunities.find((o) => o.id === entry.opportunity_id);
              const oppCnpj = linkedOpp?.cnpj ? linkedOpp.cnpj.replace(/\D/g, '') : null;
              if (oppCnpj === cleanDoc || entry.description.includes(cleanDoc)) {
                return {
                  statement,
                  ledger_entry: entry,
                  opportunity_id: entry.opportunity_id || null,
                  match_score: 95,
                  match_rule: 'RULE_2_CNPJ_AMOUNT_DATE',
                  reason: `CNPJ/CPF ${cleanDoc} + Exact Amount (${statement.amount}) within D+-2 date window`,
                };
              }
            }
          }
        }

        // Direct opportunity check for Rule 2
        for (const opp of opportunities) {
          if (opp.cnpj && opp.cnpj.replace(/\D/g, '') === cleanDoc) {
            const oppVal = opp.opportunity_data?.value || 0;
            if (oppVal > 0 && Math.abs(oppVal - statement.amount) < 0.01) {
              return {
                statement,
                ledger_entry: null,
                opportunity_id: opp.id,
                match_score: 95,
                match_rule: 'RULE_2_CNPJ_AMOUNT_DATE',
                reason: `CNPJ/CPF match with Opportunity ${opp.client_name} + Exact Amount`,
              };
            }
          }
        }
      }
    }

    // RULE 3: Fuzzy Name Similarity + Exact Amount
    if (statement.payer_name || statement.description) {
      const statementName = (statement.payer_name || statement.description).toLowerCase();
      
      for (const entry of openLedgerEntries) {
        if (Math.abs(entry.amount - statement.amount) < 0.01) {
          const entryDesc = entry.description.toLowerCase();
          const similarity = this.calculateNameSimilarity(statementName, entryDesc);
          if (similarity >= 0.5) {
            return {
              statement,
              ledger_entry: entry,
              opportunity_id: entry.opportunity_id || null,
              match_score: 80,
              match_rule: 'RULE_3_FUZZY_NAME_AMOUNT',
              reason: `Fuzzy Name match (${Math.round(similarity * 100)}% similarity) + Exact Amount (${statement.amount})`,
            };
          }
        }
      }

      for (const opp of opportunities) {
        const oppName = (opp.client_company || opp.client_name).toLowerCase();
        const oppVal = opp.opportunity_data?.value || 0;

        if (oppVal > 0 && Math.abs(oppVal - statement.amount) < 0.01) {
          const similarity = this.calculateNameSimilarity(statementName, oppName);
          if (similarity >= 0.5) {
            return {
              statement,
              ledger_entry: null,
              opportunity_id: opp.id,
              match_score: 80,
              match_rule: 'RULE_3_FUZZY_NAME_AMOUNT',
              reason: `Fuzzy Name match with Opportunity ${opp.client_name} (${Math.round(similarity * 100)}% similarity)`,
            };
          }
        }
      }
    }

    return null;
  }

  private isWithinDateWindow(dateStr1: string, dateStr2: string, maxDays: number): boolean {
    const d1 = new Date(dateStr1).getTime();
    const d2 = new Date(dateStr2).getTime();
    const diffDays = Math.abs(d1 - d2) / (1000 * 3600 * 24);
    return diffDays <= maxDays;
  }

  private calculateNameSimilarity(str1: string, str2: string): number {
    const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const s1 = normalize(str1);
    const s2 = normalize(str2);

    const tokens1 = s1.split(/\s+/).filter((t) => t.length >= 3);
    const tokens2 = s2.split(/\s+/).filter((t) => t.length >= 3);
    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    let matches = 0;
    for (const t1 of tokens1) {
      if (tokens2.some((t2) => t2.includes(t1) || t1.includes(t2))) {
        matches++;
      }
    }

    return (matches * 2) / (tokens1.length + tokens2.length);
  }
}
