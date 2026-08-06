/**
 * crux-benchmark — Benchmark CrUX (Chrome UX Report) entre site do cliente
 * e concorrentes. Faz queries reais na CrUX API do Google e usa Qwen
 * (provider MiniMax) pra interpretacao qualitativa dos resultados.
 *
 * Input:  { clientUrl: string, competitorUrls: string[], formFactor?: 'PHONE'|'DESKTOP'|'TABLET' }
 * Output: { clientSite: CrUXMetrics, competitors: CrUXMetrics[], ranking: {...}, aiInterpretation: {...} }
 *
 * Ref: supabase/functions/crux-benchmark/index.ts (Wave 1.3)
 */

import { z } from 'zod';
import { ApiError } from '../../contracts/errors';
import { callAi } from '../providers/router';
import { loadPrompt } from '../prompts/loader';
import { logAiUsage } from '../log/usage';
import type { QueryablePool } from '../../db/postgres';

interface CrUXMetrics {
  url: string;
  lcp: { p75: number; category: 'FAST' | 'AVERAGE' | 'SLOW' };
  cls: { p75: number; category: 'FAST' | 'AVERAGE' | 'SLOW' };
  inp: { p75: number; category: 'FAST' | 'AVERAGE' | 'SLOW' };
  ttfb: { p75: number; category: 'FAST' | 'AVERAGE' | 'SLOW' };
  formFactor: string;
  collectionPeriod?: string | undefined;
  error?: string | undefined;
}

const InputSchema = z.object({
  clientUrl: z.string().url(),
  competitorUrls: z.array(z.string().url()).min(1).max(5),
  formFactor: z.enum(['PHONE', 'DESKTOP', 'TABLET']).default('PHONE'),
});

const FALLBACK_SYSTEM_PROMPT = `Voce e analista de performance web senior. Recebeu dados de CrUX (Chrome UX Report) de um site e seus concorrentes. Gere uma interpretacao qualitativa em JSON:

{
  "summary": "1-2 frases objetivas",
  "client_standout": ["aspecto onde cliente se destaca", ...],
  "client_concerns": ["aspecto preocupante", ...],
  "competitor_advantages": [{ "competitor": "url", "advantages": ["..."] }],
  "recommendations": ["acao prioritaria 1", "acao prioritaria 2", "acao prioritaria 3"]
}

Responda ESTRITAMENTE em JSON valido.`;

function categorize(value: number, thresholds: { good: number; poor: number }): 'FAST' | 'AVERAGE' | 'SLOW' {
  if (value <= thresholds.good) return 'FAST';
  if (value <= thresholds.poor) return 'AVERAGE';
  return 'SLOW';
}

const LCP_THRESHOLDS = { good: 2500, poor: 4000 };
const CLS_THRESHOLDS = { good: 0.1, poor: 0.25 };
const INP_THRESHOLDS = { good: 200, poor: 500 };
const TTFB_THRESHOLDS = { good: 800, poor: 1800 };

interface CrUXRecord {
  metrics?: {
    largest_contentful_paint?: { percentiles?: { p75?: number } };
    cumulative_layout_shift?: { percentiles?: { p75?: number } };
    interaction_to_next_paint?: { percentiles?: { p75?: number } };
    experimental_time_to_first_byte?: { percentiles?: { p75?: number } };
  };
  collectionPeriod?: { firstDate?: { year?: number; month?: number; day?: number }; lastDate?: { year?: number; month?: number; day?: number } };
}

async function queryCrUX(url: string, apiKey: string, formFactor: string): Promise<CrUXMetrics> {
  try {
    const res = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formFactor }),
    });
    if (!res.ok) {
      return { url, lcp: { p75: 0, category: 'AVERAGE' }, cls: { p75: 0, category: 'AVERAGE' }, inp: { p75: 0, category: 'AVERAGE' }, ttfb: { p75: 0, category: 'AVERAGE' }, formFactor, error: `CrUX API ${res.status}` };
    }
    const data = (await res.json()) as { record?: CrUXRecord };
    const m = data.record?.metrics ?? {};
    const lcpP75 = m.largest_contentful_paint?.percentiles?.p75 ?? 0;
    const clsP75 = m.cumulative_layout_shift?.percentiles?.p75 ?? 0;
    const inpP75 = m.interaction_to_next_paint?.percentiles?.p75 ?? 0;
    const ttfbP75 = m.experimental_time_to_first_byte?.percentiles?.p75 ?? 0;
    const period = data.record?.collectionPeriod;
    return {
      url,
      lcp: { p75: lcpP75, category: categorize(lcpP75, LCP_THRESHOLDS) },
      cls: { p75: clsP75, category: categorize(clsP75, CLS_THRESHOLDS) },
      inp: { p75: inpP75, category: categorize(inpP75, INP_THRESHOLDS) },
      ttfb: { p75: ttfbP75, category: categorize(ttfbP75, TTFB_THRESHOLDS) },
      formFactor,
      collectionPeriod: period ? `${period.firstDate?.year}-${String(period.firstDate?.month ?? 1).padStart(2, '0')} -> ${period.lastDate?.year}-${String(period.lastDate?.month ?? 1).padStart(2, '0')}` : undefined,
    };
  } catch (err) {
    return { url, lcp: { p75: 0, category: 'AVERAGE' }, cls: { p75: 0, category: 'AVERAGE' }, inp: { p75: 0, category: 'AVERAGE' }, ttfb: { p75: 0, category: 'AVERAGE' }, formFactor, error: err instanceof Error ? err.message : 'unknown' };
  }
}

function rankSite(site: CrUXMetrics): number {
  // Pontuacao: soma de scores por metrica (FAST=3, AVERAGE=2, SLOW=1)
  return [site.lcp.category, site.cls.category, site.inp.category, site.ttfb.category]
    .reduce((acc, c) => acc + (c === 'FAST' ? 3 : c === 'AVERAGE' ? 2 : 1), 0);
}

export async function handleCruxBenchmark(
  deps: { pool: QueryablePool; userId: string; tenantId: string },
  rawBody: unknown,
): Promise<Record<string, unknown>> {
  const body = InputSchema.parse(rawBody);

  const apiKey = process.env.GOOGLE_CRX_API_KEY;
  if (!apiKey) {
    throw ApiError.validation('GOOGLE_CRX_API_KEY nao configurada no servidor.');
  }

  const start = Date.now();

  try {
    const [clientSite, ...competitors] = await Promise.all([
      queryCrUX(body.clientUrl, apiKey, body.formFactor),
      ...body.competitorUrls.map((u) => queryCrUX(u, apiKey, body.formFactor)),
    ]);

    const allSites = [clientSite, ...competitors];
    const ranking = allSites
      .map((s) => ({ url: s.url, score: rankSite(s) }))
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({ ...r, position: i + 1 }));

    // AI interpretation via Qwen 3.7-max (alta racao).
    const prompt = await loadPrompt(deps.pool, 'crux-benchmark', 'interpretation', FALLBACK_SYSTEM_PROMPT);
    const aiResult = await callAi(
      {
        systemPrompt: prompt.body,
        userPrompt: JSON.stringify({ clientSite, competitors, ranking }),
        jsonMode: true,
        model: prompt.model ?? 'qwen3.7-max',
      },
      { provider: prompt.provider ?? 'minimax' },
    );

    await logAiUsage(deps.pool, {
      edgeFunction: 'crux-benchmark',
      provider: aiResult.provider,
      model: aiResult.model,
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: true,
      inputTokens: aiResult.inputTokens ?? null,
      outputTokens: aiResult.outputTokens ?? null,
      latencyMs: Date.now() - start,
    });

    return {
      clientSite,
      competitors,
      ranking,
      aiInterpretation: aiResult.parsed ?? aiResult.content,
      collectionPeriod: clientSite.collectionPeriod,
      formFactor: body.formFactor,
    };
  } catch (err) {
    await logAiUsage(deps.pool, {
      edgeFunction: 'crux-benchmark',
      provider: 'minimax',
      model: 'unknown',
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: false,
      errorMessage: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - start,
    });
    throw err;
  }
}
