/**
 * PagBank Connector (antigo PagSeguro).
 *
 * API: https://api.pagbank.com/v1
 * Auth: Bearer PAGBANK_API_TOKEN
 * Endpoint principal: GET /charges?created_at_from=&created_at_to=
 *
 * Webhook: PagBank envia POST com payload JSON. Header "Authorization"
 * traz um HMAC-SHA256(token, body) usando o mesmo token. Validação
 * opcional — só aplicada se PAGBANK_WEBHOOK_SECRET estiver configurado.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

import { optionalSecret } from './credentials';
import type {
  ConnectorFetchParams,
  ConnectorFetchResult,
  ConnectorNormalizedTxn,
  FinanceConnector,
  WebhookVerificationResult,
} from './types';

const PAGBANK_API_BASE = 'https://api.pagbank.com/v1';

interface PagBankCharge {
  id: string;
  reference_id?: string | null;
  status: string; // PAID, WAITING, etc.
  amount: { value: number; currency?: string };
  paid_amount?: number | null;
  customer?: {
    name?: string | null;
    tax_id?: string | null; // CPF/CNPJ
    email?: string | null;
  } | null;
  created_at: string;
  paid_at?: string | null;
  description?: string | null;
}

interface PagBankChargesList {
  data: PagBankCharge[];
  has_more?: boolean;
  next_cursor?: string | null;
}

export class PagBankConnector implements FinanceConnector {
  public readonly name = 'pagbank';

  constructor(private readonly apiToken: string = optionalSecret('PAGBANK_API_TOKEN')) {}

  isConfigured(): boolean {
    return this.apiToken.length > 0;
  }

  async fetchTransactions(params: ConnectorFetchParams): Promise<ConnectorFetchResult> {
    if (!this.isConfigured()) {
      return { txns: [], nextCursor: null };
    }

    const query: Record<string, string> = {
      created_at_from: `${params.startDate}T00:00:00Z`,
      created_at_to: `${params.endDate}T23:59:59Z`,
      limit: String(params.limit ?? 100),
    };
    if (params.cursor) query.cursor = params.cursor;

    const url = `${PAGBANK_API_BASE}/charges?${new URLSearchParams(query).toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        Accept: 'application/json',
        'User-Agent': 'RevHackers-API/1.0',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PagBank API responded ${response.status}: ${text.slice(0, 200)}`);
    }

    const payload = (await response.json()) as PagBankChargesList;
    const txns: ConnectorNormalizedTxn[] = (payload.data ?? [])
      .filter((c) => c.status === 'PAID' && (c.paid_amount ?? c.amount?.value))
      .map((c) => this.normalize(c));

    return {
      txns,
      nextCursor: payload.next_cursor ?? null,
      totalCount: payload.data?.length ?? 0,
    };
  }

  static verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
    webhookSecret: string = optionalSecret('PAGBANK_WEBHOOK_SECRET'),
  ): WebhookVerificationResult {
    if (!signatureHeader) return { valid: false, reason: 'missing_signature_header' };
    if (!webhookSecret) return { valid: false, reason: 'webhook_secret_not_configured' };
    const expected = createHmac('sha256', webhookSecret).update(rawBody, 'utf8').digest();
    try {
      const provided = Buffer.from(signatureHeader, 'hex');
      if (provided.length !== expected.length) return { valid: false, reason: 'signature_mismatch' };
      return timingSafeEqual(provided, expected)
        ? { valid: true }
        : { valid: false, reason: 'signature_mismatch' };
    } catch {
      return { valid: false, reason: 'signature_malformed' };
    }
  }

  static normalizeCharge(charge: PagBankCharge): ConnectorNormalizedTxn | null {
    if (charge.status !== 'PAID') return null;
    const amount = charge.paid_amount ?? charge.amount?.value ?? 0;
    return {
      transaction_date: (charge.paid_at ?? charge.created_at).substring(0, 10),
      amount: amount / 100, // PagBank -> reais
      type: 'CREDIT',
      description: charge.description ?? `PagBank charge ${charge.id}`,
      bank_transaction_id: charge.id,
      payer_document: charge.customer?.tax_id ? charge.customer.tax_id.replace(/\D/g, '') : null,
      payer_name: charge.customer?.name ?? null,
      source: 'pagbank',
      reconciliation_status: 'PENDING',
      raw_payload: {
        charge_id: charge.id,
        reference_id: charge.reference_id ?? null,
        status: charge.status,
      },
    };
  }

  private normalize(charge: PagBankCharge): ConnectorNormalizedTxn {
    return PagBankConnector.normalizeCharge(charge) ?? {
      transaction_date: charge.created_at.substring(0, 10),
      amount: 0,
      type: 'CREDIT',
      description: `PagBank charge ${charge.id}`,
      bank_transaction_id: charge.id,
      source: 'pagbank',
      reconciliation_status: 'PENDING',
      raw_payload: { charge_id: charge.id, status: charge.status },
    };
  }
}
