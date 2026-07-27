/**
 * InfinitePay Connector.
 *
 * API: https://api.infinitepay.io
 * Auth: Bearer INFINITEPAY_API_KEY
 * Endpoint principal: GET /invoices?limit=&cursor=&created_after=&created_before=
 *
 * Webhook: InfinitePay envia POST com payload JSON. Header "X-Signature"
 * opcional com HMAC-SHA256(body, INFINITEPAY_WEBHOOK_SECRET). Validação só
 * é aplicada se o secret estiver configurado.
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

const INFINITEPAY_API_BASE = 'https://api.infinitepay.io';

interface InfinitePayInvoice {
  id: string;
  amount: number; // cents
  paid_amount?: number | null;
  status: string;
  description?: string | null;
  customer?: {
    name?: string | null;
    document?: { number?: string | null; type?: string | null } | null;
  } | null;
  created_at: string; // ISO
  paid_at?: string | null;
  capture_method?: string | null;
}

interface InfinitePayListResponse {
  data: InfinitePayInvoice[];
  next_cursor?: string | null;
  has_more?: boolean;
}

export class InfinitePayConnector implements FinanceConnector {
  public readonly name = 'infinitepay';

  constructor(private readonly apiKey: string = optionalSecret('INFINITEPAY_API_KEY')) {}

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async fetchTransactions(params: ConnectorFetchParams): Promise<ConnectorFetchResult> {
    if (!this.isConfigured()) {
      return { txns: [], nextCursor: null };
    }

    const query: Record<string, string> = {
      limit: String(params.limit ?? 100),
      created_after: `${params.startDate}T00:00:00Z`,
      created_before: `${params.endDate}T23:59:59Z`,
    };
    if (params.cursor) query.cursor = params.cursor;

    const url = `${INFINITEPAY_API_BASE}/invoices?${new URLSearchParams(query).toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        'User-Agent': 'RevHackers-API/1.0',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`InfinitePay API responded ${response.status}: ${text.slice(0, 200)}`);
    }

    const payload = (await response.json()) as InfinitePayListResponse;
    const txns: ConnectorNormalizedTxn[] = (payload.data ?? [])
      .filter((inv) => inv.status === 'paid' && inv.paid_amount)
      .map((inv) => this.normalize(inv));

    return {
      txns,
      nextCursor: payload.next_cursor ?? null,
      totalCount: payload.data?.length ?? 0,
    };
  }

  static verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
    webhookSecret: string = optionalSecret('INFINITEPAY_WEBHOOK_SECRET'),
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

  static normalizeInvoice(inv: InfinitePayInvoice): ConnectorNormalizedTxn | null {
    if (inv.status !== 'paid' || !inv.paid_amount) return null;
    return {
      transaction_date: (inv.paid_at ?? inv.created_at).substring(0, 10),
      amount: inv.paid_amount / 100,
      type: 'CREDIT',
      description: inv.description ?? `InfinitePay invoice ${inv.id}`,
      bank_transaction_id: inv.id,
      payer_document: inv.customer?.document?.number ? inv.customer.document.number.replace(/\D/g, '') : null,
      payer_name: inv.customer?.name ?? null,
      source: 'infinitepay',
      reconciliation_status: 'PENDING',
      raw_payload: {
        invoice_id: inv.id,
        status: inv.status,
        amount_cents: inv.amount,
      },
    };
  }

  private normalize(inv: InfinitePayInvoice): ConnectorNormalizedTxn {
    return InfinitePayConnector.normalizeInvoice(inv) ?? {
      transaction_date: inv.created_at.substring(0, 10),
      amount: 0,
      type: 'CREDIT',
      description: `InfinitePay invoice ${inv.id}`,
      bank_transaction_id: inv.id,
      source: 'infinitepay',
      reconciliation_status: 'PENDING',
      raw_payload: { invoice_id: inv.id, status: inv.status },
    };
  }
}
