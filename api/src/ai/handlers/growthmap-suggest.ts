/**
 * Handler: growthmap-suggest (NOVA FEATURE - MiniMax growth hub intelligence)
 *
 * Auto-sugestao dos 3 frameworks prioritarios do Growth Map baseado no
 * perfil/archetype do lead e total score do diagnostico.
 *
 * Input: { archetype, totalScore, dimensionScores, segment, objective }
 * Output: { top_3: [framework_id, framework_id, framework_id], reasoning, run_order }
 *
 * Ref: scripts/plan de features IA (MiniMax)
 */

import { z } from 'zod';
import { callAi } from '../providers/router';
import { logAiUsage } from '../log/usage';
import type { QueryablePool } from '../../db/postgres';
import { GROWTHMAP_FRAMEWORKS } from './generate-growthmap';

const InputSchema = z.object({
  archetype: z.string().min(1).max(256),
  totalScore: z.number().min(0).max(100),
  dimensionScores: z.record(z.string(), z.number()).optional(),
  segment: z.string().max(128).optional(),
  objective: z.string().max(256).optional(),
});

const SYSTEM_PROMPT = `Voce e estrategista de GTM/Growth da RevHackers.

Recebe o perfil de um lead (archetype + scores + contexto) e deve recomendar
os 3 frameworks do Growth Map mais impactantes para destravar crescimento
nesse momento.

Frameworks disponiveis:
- tam_sam_som: dimensionar mercado
- swot: diagnostico de posicao
- pestel: macroambiente
- porter_5_forces: rivalidade setorial
- vrio_benchmark: comparar com concorrentes
- empathy_map: entender ICP
- customer_journey: jornada de compra
- vpc: value proposition
- usp: proposta unica de valor
- aarrr: metricas growth
- north_star: foco de produto
- gtm: estrategia lancamento
- ice_score: priorizacao iniciativas
- lean_canvas: modelo negocio
- design_thinking:inovacao

Regras:
1. Sempre 3 frameworks (nunca mais, nunca menos)
2. Ordem de execucao importa: o primeiro destrava o proximo
3. Justifique CADA escolha em 1 frase
4. Use o archetype + scores para personalizar

Responda APENAS com JSON:
{
  "top_3": ["framework_id_1", "framework_id_2", "framework_id_3"],
  "reasoning": {
    "framework_id_1": "porque este primeiro...",
    "framework_id_2": "porque este segundo...",
    "framework_id_3": "porque este terceiro..."
  },
  "run_order": "sequencial - execute nesta ordem para melhor aproveitamento"
}`;

export interface SuggestDeps {
  pool: QueryablePool;
  userId: string;
  tenantId: string;
}

export async function handleGrowthMapSuggest(
  deps: SuggestDeps,
  body: unknown,
): Promise<Record<string, unknown>> {
  const input = InputSchema.parse(body);

  const userPromptParts: string[] = [];
  userPromptParts.push(`Archetype do lead: ${input.archetype}`);
  userPromptParts.push(`Total score: ${input.totalScore}/100`);
  if (input.dimensionScores) {
    userPromptParts.push(`Scores por dimensao: ${JSON.stringify(input.dimensionScores)}`);
  }
  if (input.segment) userPromptParts.push(`Segmento: ${input.segment}`);
  if (input.objective) userPromptParts.push(`Objetivo declarado: ${input.objective}`);
  userPromptParts.push('\nSugira os 3 frameworks prioritarios.');

  const t0 = Date.now();
  try {
    const ai = await callAi({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userPromptParts.join('\n\n'),
      jsonMode: true,
      maxTokens: 1200,
    });

    await logAiUsage(deps.pool, {
      edgeFunction: 'growthmap-suggest',
      provider: ai.provider,
      model: ai.model,
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: true,
      inputTokens: ai.inputTokens ?? null,
      outputTokens: ai.outputTokens ?? null,
      latencyMs: Date.now() - t0,
      metadata: { archetype: input.archetype, totalScore: input.totalScore },
    });

    // Validar que top_3 sao frameworks validos (filtra alucinacoes da IA)
    const parsed = ai.parsed as
      | { top_3?: string[]; reasoning?: Record<string, string>; run_order?: string }
      | undefined;
    if (parsed?.top_3) {
      const valid = parsed.top_3.filter((f) =>
        (GROWTHMAP_FRAMEWORKS as readonly string[]).includes(f),
      );
      parsed.top_3 = valid;
    }

    return {
      suggestion: parsed ?? { raw: ai.content },
      availableFrameworks: GROWTHMAP_FRAMEWORKS,
    };
  } catch (err) {
    await logAiUsage(deps.pool, {
      edgeFunction: 'growthmap-suggest',
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
