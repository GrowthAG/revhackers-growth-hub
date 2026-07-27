/**
 * Pluggy Open Finance connector.
 *
 * Pluggy agrega contas de C6, BTG, Nubank, Bradesco, Santander, Inter, etc.
 * Fluxo:
 *   1. OAuth client_credentials -> API_KEY (TTL ~2h, cache em memória).
 *   2. fetch /items -> connectorId -> /items/{id}/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Webhook signature: Pluggy usa header "X-Pluggy-Signature" com HMAC-SHA256
 * do body (hex). O secret é configurável por item no dashboard, então aceitamos
 * opcionalmente o evento se o secret estiver configurado.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

import { ApiError } from '../../../contracts/errors';
import { optionalSecret, requireSecret } from './credentials';
import type {
  ConnectorFetchParams,
  ConnectorFetchResult,
  ConnectorNormalizedTxn,
  FinanceConnector,
  WebhookVerificationResult,
} from './types';

const PLUGGY_API_BASE = 'https://api.pluggy.ai';

interface PluggyAuthResponse {
  apiKey: string;
  expiresAt?: string;
}

interface PluggyItem {
  id: string;
  connector: { id: number; name: string; institutionUrl?: string | null };
  status: string;
  executionStatus?: string;
  updatedAt?: string;
}

interface PluggyTransaction {
  id: string;
  itemId: string;
  description: string;
  descriptionRaw?: string | null;
  amount: number; // reais (Pluggy normaliza)
  currency: string;
  date: string; // YYYY-MM-DD
  type: 'DEBIT' | 'CREDIT';
  category?: string | null;
  status: 'POSTED' | 'PENDING';
  paymentData?: {
    payer?: { documentNumber?: string; name?: string } | null;
    receiver?: { documentNumber?: string; name?: string } | null;
  } | null;
  providerCode?: string | null;
}

interface PluggyListResponse<T> {
  results: T[];
  total?: number;
  page?: number;
  totalPages?: number;
}

interface CachedToken {
  apiKey: string;
  expiresAtMs: number;
}

let cachedToken: CachedToken | null = null;
let tokenFetchInFlight: Promise<CachedToken> | null = null;

export class PluggyConnector implements FinanceConnector {
  public readonly name = 'pluggy';

  constructor(
    private readonly clientId: string = optionalSecret('PLUGGY_CLIENT_ID'),
    private readonly clientSecret: string = optionalSecret('PLUGGY_CLIENT_SECRET'),
  ) {}

  isConfigured(): boolean {
    return this.clientId.length > 0 && this.clientSecret.length > 0;
  }

  async fetchTransactions(params: ConnectorFetchParams): Promise<ConnectorFetchResult> {
    if (!this.isConfigured()) {
      return { txns: [], nextCursor: null };
    }

    const apiKey = await this.getApiKey();
    const items = await this.listItems(apiKey);
    const targetItems = params.accountId
      ? items.filter((i) => i.id === params.accountId)
      : items;

    const allTxns: ConnectorNormalizedTxn[] = [];
    for (const item of targetItems) {
      const txns = await this.listTransactions(apiKey, item.id, params.startDate, params.endDate);
      for (const tx of txns) {
        const normalized = this.normalize(tx);
        if (normalized) allTxns.push(normalized);
      }
    }

    return {
      txns: allTxns,
      nextCursor: null,
      totalCount: allTxns.length,
    };
  }

  /**
   * Verifica assinatura de webhook do Pluggy.
   * Header: "X-Pluggy-Signature" com HMAC-SHA256(body, WEBHOOK_SECRET).
   * O secret é por item; aceitamos um único secret na env PLUGGY_WEBHOOK_SECRET.
   */
  static verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
    webhookSecret: string = optionalSecret('PLUGGY_WEBHOOK_SECRET'),
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

  private async getApiKey(): Promise<string> {
    if (cachedToken && cachedToken.expiresAtMs > Date.now() + 60_000) {
      return cachedToken.apiKey;
    }
    if (tokenFetchInFlight) {
      const result = await tokenFetchInFlight;
      return result.apiKey;
    }
    tokenFetchInFlight = (async () => {
      try {
        const body = new URLSearchParams({ clientId: this.clientId, clientSecret: this.clientSecret });
        const response = await fetch(`${PLUGGY_API_BASE}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
          body,
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Pluggy auth failed (${response.status}): ${text.slice(0, 200)}`);
        }
        const payload = (await response.json()) as PluggyAuthResponse;
        const expiresAtMs = payload.expiresAt
          ? new Date(payload.expiresAt).getTime()
          : Date.now() + 90 * 60 * 1000;
        cachedToken = { apiKey: payload.apiKey, expiresAtMs };
        return cachedToken;
      } finally {
        tokenFetchInFlight = null;
      }
    })();
    const result = await tokenFetchInFlight;
    return result.apiKey;
  }

  private async listItems(apiKey: string): Promise<PluggyItem[]> {
    const response = await fetch(`${PLUGGY_API_BASE}/items?page=1&pageSize=100`, {
      method: 'GET',
      headers: { Accept: 'application/json', 'X-API-KEY': apiKey },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pluggy items failed (${response.status}): ${text.slice(0, 200)}`);
    }
    const payload = (await response.json()) as PluggyListResponse<PluggyItem>;
    return payload.results ?? [];
  }

  private async listTransactions(
    apiKey: string,
    itemId: string,
    from: string,
    to: string,
  ): Promise<PluggyTransaction[]> {
    const all: PluggyTransaction[] = [];
    let page = 1;
    const pageSize = 200;
    while (true) {
      const url = new URL(`${PLUGGY_API_BASE}/transactions`);
      url.searchParams.set('itemId', itemId);
      url.searchParams.set('from', from);
      url.searchParams.set('to', to);
      url.searchParams.set('page', String(page));
      url.searchParams.set('pageSize', String(pageSize));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Pluggy transactions failed (${response.status}): ${text.slice(0, 200)}`);
      }
      const payload = (await response.json()) as PluggyListResponse<PluggyTransaction>;
      const results = payload.results ?? [];
      all.push(...results);
      if (results.length < pageSize || (payload.totalPages !== undefined && page >= payload.totalPages)) {
        break;
      }
      page += 1;
    }
    return all;
  }

  private normalize(tx: PluggyTransaction): ConnectorNormalizedTxn | null {
    if (tx.status !== 'POSTED') return null; // ignora pendentes
    const doc = tx.paymentData?.payer?.documentNumber ?? tx.paymentData?.receiver?.documentNumber ?? null;
    const name = tx.paymentData?.payer?.name ?? tx.paymentData?.receiver?.name ?? null;
    return {
      transaction_date: tx.date,
      amount: tx.amount,
      type: tx.type,
      description: tx.descriptionRaw || tx.description,
      bank_transaction_id: tx.id,
      payer_document: doc ? doc.replace(/\D/g, '') : null,
      payer_name: name,
      source: 'pluggy',
      reconciliation_status: 'PENDING',
      raw_payload: {
        pluggy_item_id: tx.itemId,
        provider_code: tx.providerCode ?? null,
        category: tx.category ?? null,
      },
    };
  }
}

/**
 * Test/dev helper: limpa o cache de token do Pluggy.
 */
export function __resetPluggyTokenCacheForTests(): void {
  cachedToken = null;
  tokenFetchInFlight = null;
}

export function requirePluggyCredentials(): { clientId: string; clientSecret: string } {
  const clientId = requireSecret('PLUGGY_CLIENT_ID');
  const clientSecret = requireSecret('PLUGGY_CLIENT_SECRET');
  return { clientId, clientSecret };
}

// Re-export ApiError for callers if they want to wrap.
export { ApiError };
