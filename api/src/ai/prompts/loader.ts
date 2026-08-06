/**
 * Loader de prompts versionados da tabela app.ai_prompts.
 *
 * Os prompts ficam versionados no banco (não no código) para permitir
 * ajuste sem deploy. Quando um prompt não está no banco, o loader retorna
 * o fallback do código (que continua sendo o source of truth inicial).
 *
 * Ref: docs/architecture/gcp-migration/ai-supabase-to-gcp-migration.md
 */

import type { QueryablePool } from '../../db/postgres';

interface PromptRow {
  body: string;
  model: string | null;
  provider: string | null;
}

export interface ResolvedPrompt {
  body: string;
  model: string | null;
  provider: string | null;
  /** Quando true, o prompt veio do banco. Quando false, é o fallback do código. */
  fromDatabase: boolean;
}

export async function loadPrompt(
  pool: QueryablePool,
  edgeFunction: string,
  promptKey: string,
  fallbackBody: string,
  fallbackModel?: string,
  fallbackProvider?: string,
): Promise<ResolvedPrompt> {
  try {
    const result = await pool.query<PromptRow>(
      `SELECT body, model, provider
         FROM app.ai_prompts
        WHERE edge_function = $1
          AND prompt_key = $2
          AND active = true
        ORDER BY version DESC
        LIMIT 1`,
      [edgeFunction, promptKey],
    );
    const row = result.rows[0];
    if (row) {
      return {
        body: row.body,
        model: row.model,
        provider: row.provider,
        fromDatabase: true,
      };
    }
  } catch (err) {
    // Tabela não existe ou DB offline — usa fallback sem derrubar handler.
    console.warn(
      JSON.stringify({
        severity: 'WARNING',
        event: 'ai_prompt_load_fallback',
        edge_function: edgeFunction,
        prompt_key: promptKey,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
  return {
    body: fallbackBody,
    model: fallbackModel ?? null,
    provider: fallbackProvider ?? null,
    fromDatabase: false,
  };
}
