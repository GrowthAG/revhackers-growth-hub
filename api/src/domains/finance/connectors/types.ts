/**
 * Shared types for finance connectors and parsers.
 *
 * Cada conector normaliza o extrato para ConnectorNormalizedTxn,
 * e o dispatcher grava em financial_bank_statements via PostgresFinanceRepository.
 * Mantemos a forma mais simples possível: regra de normalização é 1:1 -> 1 linha.
 */

import type { BankStatementType, StatementReconciliationStatus } from '../types';

export interface ConnectorNormalizedTxn {
  /** Data da transação (ISO date YYYY-MM-DD). */
  transaction_date: string;
  /** Valor em BRL. Positivo = credit, negativo = debit. */
  amount: number;
  type: BankStatementType;
  description: string;
  /** ID externo (TxID, Pix ID, Stripe charge ID, Pluggy transaction ID). */
  bank_transaction_id?: string | null;
  /** CNPJ/CPF do pagador/recebedor (somente dígitos). */
  payer_document?: string | null;
  /** Razão social ou nome do pagador/recebedor. */
  payer_name?: string | null;
  /** Identificador do conector de origem. */
  source: 'stripe' | 'infinitepay' | 'pagbank' | 'pluggy' | 'ofx' | 'csv' | 'webhook';
  /** Status inicial de reconciliação. Quase sempre PENDING. */
  reconciliation_status: StatementReconciliationStatus;
  /** Payload bruto do provedor — apenas para auditoria. */
  raw_payload?: Record<string, unknown>;
}

export interface ConnectorFetchParams {
  /** Data inicial (ISO date). Limite inferior inclusivo. */
  startDate: string;
  /** Data final (ISO date). Limite superior inclusivo. */
  endDate: string;
  /** Quando definido, limita a uma conta bancária/cart específico. */
  accountId?: string;
  /** Cursor de paginação. */
  cursor?: string;
  /** Limite por página. Default 100. */
  limit?: number;
}

export interface ConnectorFetchResult {
  txns: ConnectorNormalizedTxn[];
  /** Próximo cursor (null se acabou). */
  nextCursor: string | null;
  /** Quantidade total reportada pelo provedor (se houver). */
  totalCount?: number;
}

export interface FinanceConnector {
  readonly name: string;
  /** Lista transações no intervalo. */
  fetchTransactions(params: ConnectorFetchParams): Promise<ConnectorFetchResult>;
  /** Indica se o conector está configurado (credenciais presentes). */
  isConfigured(): boolean;
}

export interface WebhookVerificationResult {
  valid: boolean;
  /** Quando inválido, razão segura para log. NUNCA inclui payload. */
  reason?: string;
}

export class WebhookVerificationError extends Error {
  constructor(public readonly reason: string) {
    super(`Webhook verification failed: ${reason}`);
    this.name = 'WebhookVerificationError';
  }
}
