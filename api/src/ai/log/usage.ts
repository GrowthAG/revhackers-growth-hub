/**
 * Gravador de log de uso de IA (substitui _shared/ai-usage-log.ts do Supabase).
 *
 * Grava em app.ai_usage_log no Postgres. Best-effort: falha ao logar
 * NUNCA deve derrubar a resposta real do handler.
 *
 * Ref: docs/architecture/gcp-migration/09-migration-backlog.md (Wave 1)
 */

import type { QueryablePool } from '../../db/postgres';
import type { AiUsageLogEntry } from '../types';

export async function logAiUsage(
  pool: QueryablePool,
  entry: AiUsageLogEntry,
): Promise<void> {
  console.log(JSON.stringify({
    severity: 'INFO',
    event: 'ai_usage_log_attempt',
    edge_function: entry.edgeFunction,
    provider: entry.provider,
    model: entry.model,
    success: entry.success,
  }));
  try {
    await pool.query(
      `INSERT INTO app.ai_usage_log
        (edge_function, provider, model, user_id, tenant_id, success,
         error_message, input_tokens, output_tokens, latency_ms, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        entry.edgeFunction,
        entry.provider,
        entry.model,
        entry.userId ?? null,
        entry.tenantId ?? null,
        entry.success,
        entry.errorMessage ?? null,
        entry.inputTokens ?? null,
        entry.outputTokens ?? null,
        entry.latencyMs ?? null,
        JSON.stringify(entry.metadata ?? {}),
      ],
    );
    console.log(JSON.stringify({
      severity: 'INFO',
      event: 'ai_usage_log_success',
      edge_function: entry.edgeFunction,
    }));
  } catch (err) {
    // Best-effort: log no console estruturado mas não propaga.
    console.error(
      JSON.stringify({
        severity: 'ERROR',
        event: 'ai_usage_log_failed',
        edge_function: entry.edgeFunction,
        provider: entry.provider,
        model: entry.model,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }),
    );
  }
}