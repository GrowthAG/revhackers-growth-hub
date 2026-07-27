/**
 * Stripe Connector — fetches balance transactions and verifies webhook signatures.
 *
 * Sem dependência do SDK oficial: usamos fetch + node:crypto. Isso mantém
 * o footprint da imagem do Cloud Run menor e reduz surface area de supply-chain.
 *
 * Eventos relevantes:
 *   - charge.succeeded / payment_intent.succeeded  -> CREDIT
 *   - charge.refunded / refund.created             -> DEBIT
 *   - payout.paid                                  -> payout (informativo)
 *
 * Webhook signature (Stripe-Signature header):
 *   t=<unix_ts>,v1=<hmac_sha256(secret, "<ts>.<payload>")>[,v0=...]
 *   Tolerância de 5 minutos para replay attacks.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

import { optionalSecret, requireSecret } from './credentials';
import type {
  ConnectorFetchParams,
  ConnectorFetchResult,
  ConnectorNormalizedTxn,
  FinanceConnector,
  WebhookVerificationResult,
} from './types';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const SIGNATURE_TOLERANCE_SECONDS = 300; // 5 min — alinhado com Stripe

interface StripeBalanceTransaction {
  id: string;
  object: 'balance_transaction';
  amount: number; // cents
  currency: string;
  type: string;
  description: string | null;
  created: number; // unix seconds
  available_on: number;
  fee: number;
  net: number;
  source?: string | null;
}

interface StripeListResponse<T> {
  object: 'list';
  data: T[];
  has_more: boolean;
  url: string;
  next_cursor?: string | null;
}

export class StripeConnector implements FinanceConnector {
  public readonly name = 'stripe';

  constructor(private readonly apiKey: string = optionalSecret('STRIPE_API_KEY')) {}

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async fetchTransactions(params: ConnectorFetchParams): Promise<ConnectorFetchResult> {
    if (!this.isConfigured()) {
      return { txns: [], nextCursor: null };
    }

    const startUnix = Math.floor(new Date(`${params.startDate}T00:00:00Z`).getTime() / 1000);
    const endUnix = Math.floor(new Date(`${params.endDate}T23:59:59Z`).getTime() / 1000);

    const query: Record<string, string> = {
      limit: String(params.limit ?? 100),
      'created[gte]': String(startUnix),
      'created[lte]': String(endUnix),
      expand: 'data.source',
    };
    if (params.cursor) query.starting_after = params.cursor;

    const url = `${STRIPE_API_BASE}/balance_transactions?${new URLSearchParams(query).toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        'User-Agent': 'RevHackers-API/1.0',
      },
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(`Stripe API responded ${response.status}: ${bodyText.slice(0, 200)}`);
    }

    const payload = (await response.json()) as StripeListResponse<StripeBalanceTransaction>;
    const txns: ConnectorNormalizedTxn[] = payload.data.map((tx) => this.normalize(tx));

    return {
      txns,
      nextCursor: payload.has_more ? payload.data[payload.data.length - 1]?.id ?? null : null,
    };
  }

  /**
   * Verifica uma assinatura de webhook do Stripe.
   * Header esperado: "t=<ts>,v1=<hex>,v0=<hex>..."
   * Recusa replay (timestamp fora da tolerância) e qualquer signature v1 inválida.
   */
  static verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
    secret: string = optionalSecret('STRIPE_WEBHOOK_SECRET'),
  ): WebhookVerificationResult {
    if (!signatureHeader) {
      return { valid: false, reason: 'missing_signature_header' };
    }
    if (!secret) {
      return { valid: false, reason: 'webhook_secret_not_configured' };
    }
    const parsed = StripeConnector.parseSignatureHeader(signatureHeader);
    if (!parsed) {
      return { valid: false, reason: 'malformed_signature_header' };
    }
    const tsSeconds = Number(parsed.timestamp);
    if (!Number.isFinite(tsSeconds)) {
      return { valid: false, reason: 'invalid_timestamp' };
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - tsSeconds) > SIGNATURE_TOLERANCE_SECONDS) {
      return { valid: false, reason: 'timestamp_outside_tolerance' };
    }

    const signedPayload = `${parsed.timestamp}.${rawBody}`;
    const expected = createHmac('sha256', secret).update(signedPayload, 'utf8').digest();

    const matched = parsed.v1Signatures.some((hex) => {
      try {
        const provided = Buffer.from(hex, 'hex');
        if (provided.length !== expected.length) return false;
        return timingSafeEqual(provided, expected);
      } catch {
        return false;
      }
    });

    if (!matched) {
      return { valid: false, reason: 'signature_mismatch' };
    }
    return { valid: true };
  }

  private static parseSignatureHeader(header: string): { timestamp: string; v1Signatures: string[] } | null {
    const parts = header.split(',').map((s) => s.trim()).filter(Boolean);
    let timestamp: string | null = null;
    const v1Signatures: string[] = [];
    for (const part of parts) {
      const eq = part.indexOf('=');
      if (eq <= 0) continue;
      const key = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (key === 't') timestamp = value;
      else if (key === 'v1') v1Signatures.push(value);
    }
    if (!timestamp || v1Signatures.length === 0) return null;
    return { timestamp, v1Signatures };
  }

  private normalize(tx: StripeBalanceTransaction): ConnectorNormalizedTxn {
    const isCredit = tx.amount > 0;
    return {
      transaction_date: new Date(tx.created * 1000).toISOString().substring(0, 10),
      amount: tx.amount / 100, // Stripe -> reais
      type: isCredit ? 'CREDIT' : 'DEBIT',
      description: tx.description ?? `Stripe ${tx.type}`,
      bank_transaction_id: tx.id,
      payer_document: null,
      payer_name: null,
      source: 'stripe',
      reconciliation_status: 'PENDING',
      raw_payload: {
        stripe_type: tx.type,
        fee_cents: tx.fee,
        net_cents: tx.net,
        currency: tx.currency,
        source_id: tx.source ?? null,
      },
    };
  }

  /**
   * Normaliza um evento do webhook (signed payload) em ConnectorNormalizedTxn.
   * Não verifica assinatura aqui — caller deve rodar verifyWebhookSignature antes.
   */
  static normalizeWebhookEvent(event: { type: string; data: { object: Record<string, unknown> } }): ConnectorNormalizedTxn | null {
    const obj = event.data.object as Record<string, unknown>;
    const eventType = event.type;

    // Apenas eventos que representam movimento monetário.
    if (eventType === 'charge.succeeded' || eventType === 'payment_intent.succeeded') {
      const amount = Number(obj.amount ?? 0) / 100;
      const id = String(obj.id ?? '');
      const created = Number(obj.created ?? Math.floor(Date.now() / 1000));
      const billing = (obj.billing_details ?? obj.customer ?? {}) as Record<string, unknown>;
      return {
        transaction_date: new Date(created * 1000).toISOString().substring(0, 10),
        amount,
        type: 'CREDIT',
        description: String(obj.description ?? `Stripe ${eventType}`),
        bank_transaction_id: id,
        payer_document: null,
        payer_name: typeof billing.name === 'string' ? billing.name : null,
        source: 'stripe',
        reconciliation_status: 'PENDING',
        raw_payload: { event_type: eventType, stripe_id: id },
      };
    }

    if (eventType === 'charge.refunded' || eventType === 'refund.created') {
      const amount = Number(obj.amount ?? obj.amount_refunded ?? 0) / 100;
      const id = String(obj.id ?? '');
      const created = Number(obj.created ?? Math.floor(Date.now() / 1000));
      return {
        transaction_date: new Date(created * 1000).toISOString().substring(0, 10),
        amount: Math.abs(amount),
        type: 'DEBIT',
        description: `Stripe refund ${id}`,
        bank_transaction_id: id,
        source: 'stripe',
        reconciliation_status: 'PENDING',
        raw_payload: { event_type: eventType, stripe_id: id },
      };
    }

    return null;
  }
}

/**
 * Helper de boundary: garante que o secret de webhook existe.
 * Lança 500 se sumir em runtime (não 401, pois é config, não auth).
 */
export function requireStripeWebhookSecret(): string {
  return requireSecret('STRIPE_WEBHOOK_SECRET');
}
