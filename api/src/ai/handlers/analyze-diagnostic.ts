/**
 * Handler: analyze-diagnostic
 *
 * Migração 1:1 de supabase/functions/analyze-diagnostic/index.ts.
 * Suporta tipos 'growth', 'revenue' e 'founder'.
 *
 * Input: { type, answers, totalScore, linkedinUrl? }
 * Output: { archetype, dimensions?, analysis, scores? }
 */

import { z } from 'zod';
import { ApiError } from '../../contracts/errors';
import { callAi } from '../providers/router';
import { loadPrompt } from '../prompts/loader';
import { logAiUsage } from '../log/usage';
import type { QueryablePool } from '../../db/postgres';

const InputSchema = z.object({
  type: z.enum(['growth', 'revenue', 'founder']),
  answers: z.array(z.number()),
  totalScore: z.number().optional(),
  linkedinUrl: z.string().url().optional(),
});

const DIMENSION_LABELS: Record<'growth' | 'revenue', string[]> = {
  growth: ['Captacao', 'Ativacao', 'Retencao', 'Receita', 'Referencia'],
  revenue: ['Diagnostico', 'Estrategia', 'Execucao', 'Metricas', 'Time'],
};

function buildContextMap(type: 'growth' | 'revenue', answers: number[]): string[] {
  const labels = DIMENSION_LABELS[type];
  return labels.map((label, idx) => {
    const value = answers[idx] ?? 0;
    return `${label}: ${value}/20`;
  });
}

function getGrowthRevenuePrompt(
  type: 'growth' | 'revenue',
  contextMap: string[],
  totalScore: number,
): string {
  return `Voce e o Head de Diagnostico Estrategico da RevHackers, consultoria B2B brasileira de Revenue/Growth.

Tipo de diagnostico: ${type.toUpperCase()}

Pontuacao por dimensao (escala 0-20):
${contextMap.join('\n')}

Total Score: ${totalScore}

Gere um JSON estruturado com:
- archetype: string curta que define o perfil (ex: "Operacao Manual Sem Escala", "Estrategia Solida Sem Execucao")
- score_level: "critico" | "alerta" | "adequado" | "excelente"
- dimensions: array de {name, score, insight, recommended_action}
- executive_summary: paragrafo 3-4 frases com diagnostico sintetico
- top_3_priorities: array de 3 strings com proximas acoes ordenadas por impacto

Responda APENAS com JSON valido.`;
}

const FOUNDER_ARCHETYPES = ['Executor', 'Visionario', 'Tecnico', 'Relacionamento', 'Analitico'] as const;

function getFounderPrompt(linkedinUrl: string, answers: number[], quizScore: number): string {
  return `Voce e o Head de People Analytics da RevHackers.

Analise o perfil do fundador a partir do LinkedIn URL: ${linkedinUrl}

Respostas do quiz: ${JSON.stringify(answers)}
Pontuacao: ${quizScore}

Archetype possiveis: ${FOUNDER_ARCHETYPES.join(', ')}

Gere JSON com:
- archetype: uma das ${FOUNDER_ARCHETYPES.join('|')}
- confidence: numero 0-1 representando certeza da classificacao
- strengths: array de 3-5 forcas do perfil
- blind_spots: array de 3-5 pontos cegos
- recommended_team_composition: array de perfis que complementam este founder
- development_areas: array de 2-3 areas de desenvolvimento priorizadas

Responda APENAS com JSON valido.`;
}

const SYSTEM_PROMPT_FALLBACK = 'Voce e um analista estrategico senior da RevHackers. Sempre responda em portugues brasileiro com JSON valido, sem markdown.';

export interface AnalyzeDeps {
  pool: QueryablePool;
  userId: string;
  tenantId: string;
}

export async function handleAnalyzeDiagnostic(
  deps: AnalyzeDeps,
  body: unknown,
): Promise<Record<string, unknown>> {
  const input = InputSchema.parse(body);

  let userPrompt: string;
  let promptKey: string;
  if (input.type === 'founder') {
    if (!input.linkedinUrl) {
      throw ApiError.validation('linkedinUrl obrigatorio para diagnostico founder.');
    }
    userPrompt = getFounderPrompt(input.linkedinUrl, input.answers, input.totalScore ?? 0);
    promptKey = 'founder';
  } else {
    const contextMap = buildContextMap(input.type, input.answers);
    userPrompt = getGrowthRevenuePrompt(input.type, contextMap, input.totalScore ?? 0);
    promptKey = input.type;
  }

  const resolved = await loadPrompt(
    deps.pool,
    'analyze-diagnostic',
    promptKey,
    SYSTEM_PROMPT_FALLBACK,
  );

  const t0 = Date.now();
  try {
    const ai = await callAi(
      {
        systemPrompt: resolved.body,
        userPrompt,
        jsonMode: true,
        maxTokens: 2000,
      },
      { provider: resolved.provider ?? null, model: resolved.model ?? null },
    );

    await logAiUsage(deps.pool, {
      edgeFunction: 'analyze-diagnostic',
      provider: ai.provider,
      model: ai.model,
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: true,
      inputTokens: ai.inputTokens ?? null,
      outputTokens: ai.outputTokens ?? null,
      latencyMs: Date.now() - t0,
      metadata: { type: input.type, totalScore: input.totalScore },
    });

    return {
      type: input.type,
      result: ai.parsed ?? { raw: ai.content },
      fromDatabase: resolved.fromDatabase,
    };
  } catch (err) {
    await logAiUsage(deps.pool, {
      edgeFunction: 'analyze-diagnostic',
      provider: 'minimax',
      model: 'unknown',
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: false,
      errorMessage: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - t0,
    });
    throw err;
  }
}
