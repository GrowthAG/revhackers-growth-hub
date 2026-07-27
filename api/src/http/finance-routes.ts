/**
 * Finance HTTP Routes — GCP Cloud Run API.
 *
 * Endpoints expostos:
 *
 *   GET    /v1/finance/entities                       -> lista entidades (holding/brand)
 *   GET    /v1/finance/entities/:slug                 -> detalhe por slug
 *   POST   /v1/finance/entities/:slug                 -> cria/atualiza (admin)
 *   GET    /v1/finance/dre                            -> DRE consolidada ou filtrada (?entity_id)
 *   GET    /v1/finance/dre/by-entity                  -> DRE segmentada por entity
 *   POST   /v1/finance/ledger                         -> cria lançamento manual
 *   POST   /v1/finance/statements/import              -> importa extrato (array | { statements: [...] })
 *   POST   /v1/finance/statements/import/ofx          -> importa OFX (raw text)
 *   POST   /v1/finance/statements/import/csv          -> importa CSV (raw text + options)
 *   GET    /v1/finance/statements/unreconciled        -> lista pendentes (?entity_id)
 *   POST   /v1/finance/reconcile                      -> conciliação manual
 *   POST   /v1/finance/connectors/:provider/sync      -> dispara fetch de um conector
 *   POST   /v1/finance/webhooks/:provider             -> receiver de webhook assinado
 */

import { ApiError } from '../contracts/errors';
import { InfinitePayConnector } from '../domains/finance/connectors/infinitepay-connector';
import { PagBankConnector } from '../domains/finance/connectors/pagbank-connector';
import { PluggyConnector } from '../domains/finance/connectors/pluggy-connector';
import { StripeConnector } from '../domains/finance/connectors/stripe-connector';
import type { ConnectorNormalizedTxn, FinanceConnector } from '../domains/finance/connectors/types';
import { CsvParser, type CsvParseOptions } from '../domains/finance/parsers/csv-parser';
import { OfxParser } from '../domains/finance/parsers/ofx-parser';
import { PostgresFinanceRepository } from '../domains/finance/postgres-repository';
import { ReconciliationEngine } from '../domains/finance/reconciliation-engine';
import type {
  CreateBankStatementParams,
  CreateLedgerEntryParams,
  EntityKind,
  FinancialEntityRecord,
} from '../domains/finance/types';

export interface FinanceRouteDeps {
  repository: PostgresFinanceRepository;
  /** Dependências opcionais — se ausentes, o connector roda com credenciais do env. */
  connectors?: {
    stripe?: StripeConnector;
    infinitepay?: InfinitePayConnector;
    pagbank?: PagBankConnector;
    pluggy?: PluggyConnector;
  };
}

interface WebhookProvider {
  name: string;
  verify(rawBody: string, signatureHeader: string | null): { valid: boolean; reason?: string };
  parse(rawBody: string): ConnectorNormalizedTxn | null;
}

function createWebhookHandlers(): Record<string, WebhookProvider> {
  return {
    stripe: {
      name: 'stripe',
      verify: (rawBody, header) => StripeConnector.verifyWebhookSignature(rawBody, header),
      parse: (rawBody) => {
        try {
          const event = JSON.parse(rawBody) as { type: string; data: { object: Record<string, unknown> } };
          return StripeConnector.normalizeWebhookEvent(event);
        } catch {
          return null;
        }
      },
    },
    infinitepay: {
      name: 'infinitepay',
      verify: (rawBody, header) => InfinitePayConnector.verifyWebhookSignature(rawBody, header),
      parse: (rawBody) => {
        try {
          const event = JSON.parse(rawBody);
          const invoice = (event as { data?: { object?: Record<string, unknown> } }).data?.object
            ?? (event as unknown as Record<string, unknown>);
          return InfinitePayConnector.normalizeInvoice(invoice as never);
        } catch {
          return null;
        }
      },
    },
    pagbank: {
      name: 'pagbank',
      verify: (rawBody, header) => PagBankConnector.verifyWebhookSignature(rawBody, header),
      parse: (rawBody) => {
        try {
          const event = JSON.parse(rawBody);
          const charge = (event as { data?: { object?: Record<string, unknown> } }).data?.object
            ?? (event as unknown as Record<string, unknown>);
          return PagBankConnector.normalizeCharge(charge as never);
        } catch {
          return null;
        }
      },
    },
    pluggy: {
      name: 'pluggy',
      verify: (rawBody, header) => PluggyConnector.verifyWebhookSignature(rawBody, header),
      parse: (rawBody) => {
        try {
          const event = JSON.parse(rawBody) as { type?: string; data?: { transaction?: Record<string, unknown> } };
          const tx = event.data?.transaction;
          if (!tx) return null;
          const amount = Number(tx.amount ?? 0);
          return {
            transaction_date: String(tx.date ?? new Date().toISOString().substring(0, 10)),
            amount: Math.abs(amount),
            type: amount >= 0 ? 'CREDIT' : 'DEBIT',
            description: String(tx.description ?? 'Pluggy transaction'),
            bank_transaction_id: String(tx.id ?? ''),
            payer_document: null,
            payer_name: null,
            source: 'pluggy',
            reconciliation_status: 'PENDING',
            raw_payload: { pluggy_event_type: event.type ?? null },
          };
        } catch {
          return null;
        }
      },
    },
  };
}

export function createFinanceRoutes(deps: FinanceRouteDeps) {
  const engine = new ReconciliationEngine();
  const webhookHandlers = createWebhookHandlers();
  const connectors = deps.connectors ?? {
    stripe: new StripeConnector(),
    infinitepay: new InfinitePayConnector(),
    pagbank: new PagBankConnector(),
    pluggy: new PluggyConnector(),
  };

  const json = (status: number, body: unknown): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  return async (req: Request): Promise<Response | null> => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // -------- ENTITIES --------

    if (path === '/v1/finance/entities' && method === 'GET') {
      const kind = url.searchParams.get('kind') as EntityKind | null;
      const entities = await deps.repository.listEntities(kind ?? undefined);
      return json(200, { success: true, entities });
    }

    const entitySlugMatch = path.match(/^\/v1\/finance\/entities\/([a-z0-9_-]+)$/);
    if (entitySlugMatch && method === 'GET') {
      const slug = entitySlugMatch[1]!;
      const entity = await deps.repository.findEntityBySlug(slug);
      if (!entity) throw ApiError.notFound('Entidade não encontrada.');
      return json(200, { success: true, entity });
    }
    if (entitySlugMatch && method === 'POST') {
      const slug = entitySlugMatch[1]!;
      const body = await req.json();
      const entity = await deps.repository.createEntity({
        slug,
        name: String(body.name ?? ''),
        legal_name: body.legal_name || null,
        cnpj: body.cnpj || null,
        kind: (body.kind as EntityKind) ?? 'brand',
        parent_id: body.parent_id || null,
        metadata: body.metadata ?? {},
      });
      return json(201, { success: true, entity });
    }

    // -------- DRE --------

    if (path === '/v1/finance/dre' && method === 'GET') {
      const startDate = url.searchParams.get('start_date') ?? '2026-01-01';
      const endDate = url.searchParams.get('end_date') ?? new Date().toISOString().substring(0, 10);
      const entityId = url.searchParams.get('entity_id');
      const dre = await deps.repository.getDREStatement(startDate, endDate, entityId || undefined);
      return json(200, { success: true, dre });
    }

    if (path === '/v1/finance/dre/by-entity' && method === 'GET') {
      const startDate = url.searchParams.get('start_date') ?? '2026-01-01';
      const endDate = url.searchParams.get('end_date') ?? new Date().toISOString().substring(0, 10);
      const entities = await deps.repository.getDREByEntity(startDate, endDate);
      return json(200, { success: true, period: { start: startDate, end: endDate }, entities });
    }

    // -------- LEDGER --------

    if (path === '/v1/finance/ledger' && method === 'POST') {
      const body = (await req.json()) as CreateLedgerEntryParams;
      const entry = await deps.repository.createLedgerEntry(body);
      return json(201, { success: true, entry });
    }

    // -------- STATEMENTS --------

    if (path === '/v1/finance/statements/import' && method === 'POST') {
      const body = await req.json();
      const statementsToImport: CreateBankStatementParams[] = Array.isArray(body)
        ? body
        : body.statements
        ? body.statements
        : [body];

      const imported: unknown[] = [];
      for (const stmt of statementsToImport) {
        const created = await deps.repository.createStatement(stmt);
        imported.push(created);
      }

      // Auto-reconciliação em background. setImmediate sobrevive o request,
      // mas tarefas de longa duração devem migrar para Cloud Tasks.
      setImmediate(() => { void runAutoReconciliation(deps.repository, engine); });

      return json(201, { success: true, imported_count: imported.length, records: imported });
    }

    if (path === '/v1/finance/statements/import/ofx' && method === 'POST') {
      const body = (await req.json()) as { raw: string; bank_account_id?: string; entity_id?: string };
      if (!body.raw) throw ApiError.validation('raw OFX é obrigatório.');
      const parser = new OfxParser();
      const result = parser.parse(body.raw);
      const ingest = await ingestNormalized(
        deps.repository,
        result.txns,
        { bank_account_id: body.bank_account_id || null, entity_id: body.entity_id || null },
      );
      setImmediate(() => { void runAutoReconciliation(deps.repository, engine); });
      return json(201, {
        success: true,
        imported_count: ingest.records.length,
        records: ingest.records,
        ofx: {
          bank_org: result.bank_org,
          account_id: result.account_id,
          currency: result.currency,
        },
      });
    }

    if (path === '/v1/finance/statements/import/csv' && method === 'POST') {
      const body = (await req.json()) as { raw: string; options?: CsvParseOptions; bank_account_id?: string; entity_id?: string };
      if (!body.raw) throw ApiError.validation('raw CSV é obrigatório.');
      const parser = new CsvParser();
      const result = parser.parse(body.raw, body.options);
      const ingest = await ingestNormalized(
        deps.repository,
        result.txns,
        { bank_account_id: body.bank_account_id || null, entity_id: body.entity_id || null },
      );
      setImmediate(() => { void runAutoReconciliation(deps.repository, engine); });
      return json(201, {
        success: true,
        imported_count: ingest.records.length,
        records: ingest.records,
        parse_summary: {
          total_rows: result.totalRows,
          skipped_rows: result.skippedRows,
          headers: result.resolvedHeaders,
          mapping: result.effectiveMapping,
        },
      });
    }

    if (path === '/v1/finance/statements/unreconciled' && method === 'GET') {
      const entityId = url.searchParams.get('entity_id');
      const records = await deps.repository.findUnreconciledStatements(entityId || undefined);
      return json(200, { success: true, count: records.length, statements: records });
    }

    if (path === '/v1/finance/reconcile' && method === 'POST') {
      const body = await req.json();
      const { statement_id, ledger_entry_id, opportunity_id, notes } = body;
      if (!statement_id) throw ApiError.validation('statement_id é obrigatório para reconciliação.');
      const reconciled = await deps.repository.reconcileMatch(
        statement_id,
        ledger_entry_id ?? null,
        opportunity_id ?? null,
        100,
        'MANUAL',
        'admin_user',
        notes ?? 'Manual reconciliation via Admin Cockpit',
      );
      return json(200, { success: true, reconciliation: reconciled });
    }

    // -------- CONNECTORS (sync) --------

    const connectorSyncMatch = path.match(/^\/v1\/finance\/connectors\/(stripe|infinitepay|pagbank|pluggy)\/sync$/);
    if (connectorSyncMatch && method === 'POST') {
      const provider = connectorSyncMatch[1]!;
      const connector = getConnector(connectors, provider);
      if (!connector?.isConfigured()) {
        throw ApiError.validation(`Connector ${provider} não está configurado.`);
      }
      const body = (await req.json().catch(() => ({}))) as { start_date?: string; end_date?: string; entity_id?: string };
      const endDate = body.end_date ?? new Date().toISOString().substring(0, 10);
      const startDate = body.start_date ?? new Date(Date.now() - 30 * 86_400_000).toISOString().substring(0, 10);

      const result = await connector.fetchTransactions({ startDate, endDate });
      const ingest = await ingestNormalized(
        deps.repository,
        result.txns,
        { entity_id: body.entity_id || null },
      );
      setImmediate(() => { void runAutoReconciliation(deps.repository, engine); });
      return json(201, {
        success: true,
        provider,
        period: { start: startDate, end: endDate },
        fetched: result.txns.length,
        imported_count: ingest.records.length,
        records: ingest.records,
      });
    }

    // -------- WEBHOOKS --------

    const webhookMatch = path.match(/^\/v1\/finance\/webhooks\/(stripe|infinitepay|pagbank|pluggy)$/);
    if (webhookMatch && method === 'POST') {
      const provider = webhookMatch[1] as 'stripe' | 'infinitepay' | 'pagbank' | 'pluggy';
      const handler = webhookHandlers[provider];
      if (!handler) return json(404, { success: false, error: 'unknown_provider' });
      const rawBody = await req.text();
      const signatureHeader = req.headers.get('stripe-signature')
        ?? req.headers.get('x-signature')
        ?? req.headers.get('x-pluggy-signature')
        ?? null;

      const verification = handler.verify(rawBody, signatureHeader);
      if (!verification.valid) {
        return json(401, { success: false, error: 'invalid_signature' });
      }

      const txn = handler.parse(rawBody);
      if (!txn) return json(200, { success: true, ignored: true });

      const created = await deps.repository.createStatement({
        transaction_date: txn.transaction_date,
        amount: txn.amount,
        type: txn.type,
        description: txn.description,
        bank_transaction_id: txn.bank_transaction_id || null,
        payer_document: txn.payer_document || null,
        payer_name: txn.payer_name || null,
        source: txn.source,
        raw_payload: txn.raw_payload || {},
      });

      setImmediate(() => { void runAutoReconciliation(deps.repository, engine); });
      return json(201, { success: true, statement: created });
    }

    return null;
  };
}

// ---------------------- Helpers ----------------------

function getConnector(
  connectors: NonNullable<FinanceRouteDeps['connectors']>,
  provider: string,
): FinanceConnector | undefined {
  switch (provider) {
    case 'stripe': return connectors.stripe;
    case 'infinitepay': return connectors.infinitepay;
    case 'pagbank': return connectors.pagbank;
    case 'pluggy': return connectors.pluggy;
    default: return undefined;
  }
}

async function ingestNormalized(
  repository: PostgresFinanceRepository,
  txns: ConnectorNormalizedTxn[],
  context: { bank_account_id?: string | null; entity_id?: string | null },
): Promise<{ records: unknown[] }> {
  const records: unknown[] = [];
  for (const txn of txns) {
    const created = await repository.createStatement({
      bank_account_id: context.bank_account_id || null,
      transaction_date: txn.transaction_date,
      amount: txn.amount,
      type: txn.type,
      description: txn.description,
      bank_transaction_id: txn.bank_transaction_id || null,
      payer_document: txn.payer_document || null,
      payer_name: txn.payer_name || null,
      source: txn.source,
      entity_id: context.entity_id || null,
      raw_payload: txn.raw_payload || {},
    });
    records.push(created);
  }
  return { records };
}

async function runAutoReconciliation(
  repository: PostgresFinanceRepository,
  engine: ReconciliationEngine,
): Promise<void> {
  try {
    const unreconciled = (await repository.findUnreconciledStatements()) ?? [];
    const openEntries = (await repository.findOpenLedgerEntries()) ?? [];
    if (!Array.isArray(unreconciled) || !Array.isArray(openEntries)) return;
    for (const statement of unreconciled) {
      const match = engine.evaluateMatch(statement, openEntries);
      if (match && match.match_score >= 80) {
        await repository.reconcileMatch(
          match.statement.id,
          match.ledger_entry?.id ?? null,
          match.opportunity_id ?? null,
          match.match_score,
          match.match_rule,
          'auto_reconciliation_engine',
          match.reason,
        );
      }
    }
  } catch (err) {
    console.error('[FinanceRoutes] Background auto-reconciliation error:', err);
  }
}

// Re-export para permitir testes diretos.
export { createWebhookHandlers };
export type { FinancialEntityRecord };
