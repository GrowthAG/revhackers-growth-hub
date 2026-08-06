/**
 * Handler: swot-analysis (NOVA FEATURE - MiniMax growth hub intelligence)
 *
 * Analise SWOT automatica para um competitor recem-adicionado na
 * intelligence_competitors. Usa dados do site + contexto do cliente.
 *
 * Input: { company_name, company_url?, industry?, description? }
 * Output: { forcas, fraquezas, oportunidades, ameacas, strategic_implications }
 *
 * Ref: scripts/plan de features IA (MiniMax + Qwen)
 */

import { z } from 'zod';
import { callAi } from '../providers/router';
import { logAiUsage } from '../log/usage';
import type { QueryablePool } from '../../db/postgres';

const InputSchema = z.object({
  company_name: z.string().min(1).max(256),
  company_url: z.string().url().optional(),
  industry: z.string().max(128).optional(),
  description: z.string().max(2000).optional(),
  client_context: z.string().max(2000).optional(),
});

const SYSTEM_PROMPT = `Voce e analista estrategico senior de inteligencia competitiva.

Gere uma analise SWOT estruturada e personalizada para a empresa informada.
Use seu conhecimento de mercado brasileiro quando aplicavel. Seja especifico
e actionable, evitando generalidades tipo "boa equipe" ou "mercado aquecido".

Responda com JSON no formato:
{
  "forcas": [{"text": "...", "evidence_strength": "alta|media|baixa"}],
  "fraquezas": [{"text": "...", "impact": "alto|medio|baixo"}],
  "oportunidades": [{"text": "...", "timeframe": "curto|medio|longo"}],
  "ameacas": [{"text": "...", "probability": "alta|media|baixa"}],
  "strategic_implications": ["implicacao 1", "implicacao 2", "implicacao 3"],
  "confidence_score": 0.85
}

Responda APENAS com JSON valido. Sem markdown.`;

export interface SwotDeps {
  pool: QueryablePool;
  userId: string;
  tenantId: string;
}

export async function handleSwotAnalysis(
  deps: SwotDeps,
  body: unknown,
): Promise<Record<string, unknown>> {
  const input = InputSchema.parse(body);

  const userPromptParts: string[] = [];
  userPromptParts.push(`Empresa alvo da analise: ${input.company_name}`);
  if (input.industry) userPromptParts.push(`Industria/segmento: ${input.industry}`);
  if (input.company_url) userPromptParts.push(`Website: ${input.company_url}`);
  if (input.description) userPromptParts.push(`Descricao: ${input.description}`);
  if (input.client_context) {
    userPromptParts.push(`\nContexto do cliente (RevHackers prospect):\n${input.client_context}`);
  }
  userPromptParts.push('\nGere a analise SWOT.');

  const t0 = Date.now();
  try {
    const ai = await callAi({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userPromptParts.join('\n\n'),
      jsonMode: true,
      maxTokens: 2500,
    });

    await logAiUsage(deps.pool, {
      edgeFunction: 'swot-analysis',
      provider: ai.provider,
      model: ai.model,
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: true,
      inputTokens: ai.inputTokens ?? null,
      outputTokens: ai.outputTokens ?? null,
      latencyMs: Date.now() - t0,
      metadata: { company: input.company_name, industry: input.industry },
    });

    return {
      company: input.company_name,
      analysis: ai.parsed ?? { raw: ai.content },
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    await logAiUsage(deps.pool, {
      edgeFunction: 'swot-analysis',
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
