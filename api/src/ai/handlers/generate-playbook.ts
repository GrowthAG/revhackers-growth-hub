/**
 * generate-playbook — Geracao de playbook de execucao (Markdown) a partir
 * de dados do projeto (REI responses, strategic plan, transcript).
 *
 * Input:  { projectId: string, framework: string }
 * Output: { markdown: string }
 *
 * Provider padrao: OpenAI (gpt-5.4 reasoning). Pode ser sobrescrito por
 * AI_PROVIDER env ou prompt row em app.ai_prompts.
 *
 * Ref: supabase/functions/generate-playbook/index.ts (Wave 1.3)
 */

import { z } from 'zod';
import { ApiError } from '../../contracts/errors';
import { callAi } from '../providers/router';
import { loadPrompt } from '../prompts/loader';
import { logAiUsage } from '../log/usage';
import type { QueryablePool } from '../../db/postgres';

const InputSchema = z.object({
  projectId: z.string().uuid(),
  framework: z.string().min(1).max(128),
});

const FALLBACK_USER_PROMPT_TEMPLATE = `Voce e Senior Revenue Architect da RevHackers. Escreva o primeiro draft (Heavy Lifting 80%) de um Playbook de Execucao detalhado.

Foco Estrategico: "{framework}"

# Contexto do Cliente
## Transcricoes de Reunioes:
{transcriptText}

## Respostas Brutas do Diagnostico:
{rawDiagnostic}

## Plano Estrategico Oficial:
- Objetivos/Metas: {goals}
- Roadmap: {roadmap}
- Persona/ICP: {persona}

# Regras de Estrutura
- Formato: Markdown limpo (h1, h2, h3).
- Use metodologias provadas (BANT-C, SPICED, SLA, Handoff, Funil Bowtie).
- Direto, tatico, C-Level.
- Inclua: Processo Tecnico, SLA de Receita, Matriz de Qualificacao, Rotina de Gestao.
- Use areas parametrizaveis quando necessario: [Nome da Ferramenta].
- NUNCA use em-dash (U+2014). Use hifen, dois pontos ou ponto.

GERAR PLAYBOOK EM MARKDOWN:`;

interface ReiResponsesRow {
  responses: Record<string, unknown> | null;
}
interface StrategicPlanRow {
  diagnostic_data: unknown;
  roadmap_data: unknown;
  goals_data: unknown;
  persona_data: unknown;
}
interface MeetingRecordingRow {
  transcript: string | null;
  ai_summary: string | null;
}

async function fetchReiResponses(pool: QueryablePool, projectId: string): Promise<Record<string, unknown>> {
  try {
    const result = await pool.query<ReiResponsesRow>(
      `SELECT responses
       FROM app.rei_responses
       WHERE project_id = $1
       ORDER BY completed_at DESC
       LIMIT 1`,
      [projectId],
    );
    return result.rows[0]?.responses ?? {};
  } catch {
    return {};
  }
}

async function fetchStrategicPlan(pool: QueryablePool, projectId: string): Promise<StrategicPlanRow | null> {
  try {
    const result = await pool.query<StrategicPlanRow>(
      `SELECT diagnostic_data, roadmap_data, goals_data, persona_data
       FROM app.strategic_plans
       WHERE rei_project_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [projectId],
    );
    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchTranscript(pool: QueryablePool, projectId: string): Promise<string> {
  try {
    const result = await pool.query<MeetingRecordingRow>(
      `SELECT transcript, ai_summary
       FROM app.meeting_recordings
       WHERE rei_project_id = $1
         AND transcript_status = 'completed'
       ORDER BY happened_at DESC
       LIMIT 1`,
      [projectId],
    );
    const rec = result.rows[0];
    if (rec?.transcript) return rec.transcript;
    if (rec?.ai_summary) return rec.ai_summary;
    return '';
  } catch {
    return '';
  }
}

export async function handleGeneratePlaybook(
  deps: { pool: QueryablePool; userId: string; tenantId: string },
  rawBody: unknown,
): Promise<Record<string, unknown>> {
  const body = InputSchema.parse(rawBody);
  const start = Date.now();

  const [rawDiagnostic, strategy, transcriptText] = await Promise.all([
    fetchReiResponses(deps.pool, body.projectId),
    fetchStrategicPlan(deps.pool, body.projectId),
    fetchTranscript(deps.pool, body.projectId),
  ]);

  const prompt = await loadPrompt(deps.pool, 'generate-playbook', body.framework, FALLBACK_USER_PROMPT_TEMPLATE);
  const userPrompt = prompt.body
    .replace('{framework}', body.framework)
    .replace('{transcriptText}', transcriptText.substring(0, 10000) || 'Nenhuma transcricao encontrada.')
    .replace('{rawDiagnostic}', JSON.stringify(rawDiagnostic))
    .replace('{goals}', JSON.stringify(strategy?.goals_data ?? {}))
    .replace('{roadmap}', JSON.stringify(strategy?.roadmap_data ?? {}))
    .replace('{persona}', JSON.stringify(strategy?.persona_data ?? {}));

  let aiResult;
  try {
    aiResult = await callAi(
      {
        systemPrompt: 'Voce e arquiteto de receita letal. Devolva APENAS o playbook em Markdown, sem preambulo.',
        userPrompt,
        model: prompt.model ?? 'gpt-5.4',
      },
      { provider: prompt.provider ?? 'openai' },
    );
  } catch (err) {
    await logAiUsage(deps.pool, {
      edgeFunction: 'generate-playbook',
      provider: 'openai',
      model: 'unknown',
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: false,
      errorMessage: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - start,
    });
    throw new ApiError(
      'internal',
      `Falha ao gerar playbook: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  await logAiUsage(deps.pool, {
    edgeFunction: 'generate-playbook',
    provider: aiResult.provider,
    model: aiResult.model,
    userId: deps.userId,
    tenantId: deps.tenantId,
    success: true,
    inputTokens: aiResult.inputTokens ?? null,
    outputTokens: aiResult.outputTokens ?? null,
    latencyMs: Date.now() - start,
    metadata: { projectId: body.projectId, framework: body.framework },
  });

  return { markdown: aiResult.content };
}
