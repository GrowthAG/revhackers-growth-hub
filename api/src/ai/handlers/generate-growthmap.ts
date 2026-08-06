/**
 * Handler: generate-growthmap
 *
 * Migracao de supabase/functions/generate-growthmap/index.ts.
 * Suporta os 15 frameworks:
 *   tam_sam_som, swot, pestel, porter_5_forces, vrio_benchmark,
 *   empathy_map, customer_journey, vpc, usp, aarrr, north_star,
 *   gtm, ice_score, lean_canvas, design_thinking
 *
 * Input: { framework, company_name, company_description, segment, rei_responses, competitors? }
 * Output: JSON do framework correspondente
 */

import { z } from 'zod';
import { callAi } from '../providers/router';
import { loadPrompt } from '../prompts/loader';
import { logAiUsage } from '../log/usage';
import type { QueryablePool } from '../../db/postgres';

export const GROWTHMAP_FRAMEWORKS = [
  'tam_sam_som',
  'swot',
  'pestel',
  'porter_5_forces',
  'vrio_benchmark',
  'empathy_map',
  'customer_journey',
  'vpc',
  'usp',
  'aarrr',
  'north_star',
  'gtm',
  'ice_score',
  'lean_canvas',
  'design_thinking',
] as const;

const InputSchema = z.object({
  framework: z.enum(GROWTHMAP_FRAMEWORKS),
  company_name: z.string().min(1).max(256),
  company_description: z.string().max(2000).optional(),
  segment: z.string().max(128).optional(),
  rei_responses: z.record(z.string(), z.unknown()).optional(),
  competitors: z.array(z.object({ nome: z.string(), url: z.string().optional() })).optional(),
});

const SYSTEM_PROMPTS: Record<(typeof GROWTHMAP_FRAMEWORKS)[number], string> = {
  tam_sam_som: `Voce e analista de mercado senior especializado no mercado brasileiro. Gere TAM/SAM/SOM contextualizado. Responda com JSON:
{"tam":{"value":"R$ X bi","label":"R$ X bi","description":"..."},"sam":{"value":"R$ X mi","label":"R$ X mi","description":"..."},"som":{"value":"R$ X mi","label":"R$ X mi","description":"..."}}`,
  swot: `Voce e consultor estrategico senior. Gere analise SWOT completa. Responda com JSON:
{"forcas":[{"text":"..."}],"fraquezas":[{"text":"..."}],"oportunidades":[{"text":"..."}],"ameacas":[{"text":"..."}]}`,
  pestel: `Gere analise PESTEL completa. Responda com JSON:
{"politico":{"bullets":["..."]},"economico":{"bullets":["..."]},"social":{"bullets":["..."]},"tecnologico":{"bullets":["..."]},"ambiental":{"bullets":["..."]},"legal":{"bullets":["..."]}}`,
  porter_5_forces: `Gere 5 Forcas de Porter calibradas ao setor. Responda com JSON:
{"rivalidade":{"level":"alto|medio|baixo","description":"..."},"novos_entrantes":{"level":"...","description":"..."},"substitutos":{"level":"...","description":"..."},"fornecedores":{"level":"...","description":"..."},"compradores":{"level":"...","description":"..."}}`,
  vrio_benchmark: `Gere benchmarking VRIO vs concorrentes. Responda com JSON:
{"competitors":["Concorrente A","Concorrente B"],"resources":[{"name":"...","level":"vantagem_competitiva|paridade|desvantagem","competitors":{"Concorrente A":"paridade"}}]}`,
  empathy_map: `Gere Empathy Map com ICP brasileiro. Responda com JSON:
{"pensa_sente":["..."],"ve":["..."],"fala_faz":["..."],"ouve":["..."],"dores":["..."],"ganhos":["..."]}`,
  customer_journey: `Mapeie jornada em 8 etapas. Responda com JSON:
{"stages":[{"number":1,"name":"Consciencia","description":"...","emotion":"...","emotion_type":"neutral|positive|negative"}]}`,
  vpc: `Gere Value Proposition Canvas. Responda com JSON:
{"customer_profile":{"jobs":["..."],"pains":["..."],"gains":["..."]},"value_map":{"products":["..."],"pain_relievers":["..."],"gain_creators":["..."]}}`,
  usp: `Defina Proposta Unica de Valor. Responda com JSON:
{"statement":"...","pillars":[{"title":"Pilar 1","description":"...","bullets":["..."]}]}`,
  aarrr: `Voce e especialista em Growth. Gere metricas AARRR. Responda com JSON:
{"aquisicao":{"metric":"...","meta":"...","current_value":"...","status":"critico|alerta|meta","tactics":["..."]},"ativacao":{...},"retencao":{...},"receita":{...},"referencia":{...},"reativacao":{...}}`,
  north_star: `Defina North Star Metric. Responda com JSON:
{"metric_name":"...","description":"...","current_value":"...","target_value":"...","why_this_metric":["..."],"leading_indicators":[{"label":"...","description":"..."}]}`,
  gtm: `Gere estrategia Go-To-Market. Responda com JSON:
{"positioning":"Para [publico] que [problema], [empresa] e [categoria] que [diferencial]. Diferente de [concorrente], [evidencia].","key_differentials":["..."],"launch_phases":[{"name":"Fase 1 - Validacao","duration":"Meses 1-2","actions":["..."],"color":"orange"}]}`,
  ice_score: `Priorize 8 iniciativas com ICE Score. Responda com JSON:
{"initiatives":[{"name":"...","impact":9,"confidence":8,"ease":7,"score":5.04,"priority":"high|medium|low"}]}`,
  lean_canvas: `Gere Lean Canvas. Responda com JSON:
{"problema":["..."],"solucao":["..."],"metricas_chave":["..."],"proposta_valor":"...","vantagem_injusta":"...","canais":["..."],"segmento_clientes":{"early_adopters":"...","mass_market":"..."},"estrutura_custos":["..."],"fontes_receita":["..."]}`,
  design_thinking: `Gere Design Thinking Canvas. Responda com JSON:
{"phases":[{"number":1,"name":"Empatia","description":"...","activities":["..."],"outputs":["..."]}]}`,
};

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  const parts: string[] = [];
  parts.push(`Empresa: ${input.company_name}`);
  if (input.company_description) parts.push(`Descricao: ${input.company_description}`);
  if (input.segment) parts.push(`Segmento: ${input.segment}`);
  if (input.rei_responses) {
    parts.push(`Contexto REI: ${JSON.stringify(input.rei_responses).slice(0, 3000)}`);
  }
  if (input.competitors && input.competitors.length > 0) {
    parts.push(`Concorrentes: ${input.competitors.map((c) => c.nome).join(', ')}`);
  }
  parts.push('Gere o JSON do framework solicitado.');
  return parts.join('\n\n');
}

export interface GrowthMapDeps {
  pool: QueryablePool;
  userId: string;
  tenantId: string;
}

export async function handleGenerateGrowthmap(
  deps: GrowthMapDeps,
  body: unknown,
): Promise<Record<string, unknown>> {
  const input = InputSchema.parse(body);
  const fallbackPrompt = SYSTEM_PROMPTS[input.framework];

  const resolved = await loadPrompt(
    deps.pool,
    'generate-growthmap',
    input.framework,
    fallbackPrompt,
  );

  const userPrompt = buildUserPrompt(input);

  const t0 = Date.now();
  try {
    const ai = await callAi(
      {
        systemPrompt: resolved.body,
        userPrompt,
        jsonMode: true,
        maxTokens: 3500,
      },
      { provider: resolved.provider, model: resolved.model },
    );

    await logAiUsage(deps.pool, {
      edgeFunction: 'generate-growthmap',
      provider: ai.provider,
      model: ai.model,
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: true,
      inputTokens: ai.inputTokens ?? null,
      outputTokens: ai.outputTokens ?? null,
      latencyMs: Date.now() - t0,
      metadata: { framework: input.framework, company: input.company_name },
    });

    return {
      framework: input.framework,
      data: ai.parsed ?? { raw: ai.content },
      fromDatabase: resolved.fromDatabase,
    };
  } catch (err) {
    await logAiUsage(deps.pool, {
      edgeFunction: 'generate-growthmap',
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
