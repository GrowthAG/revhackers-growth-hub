/**
 * generate-image — Geracao de imagem via OpenAI DALL-E 3.
 *
 * Input:  { prompt: string }
 * Output: { success: true, imageUrl: string, promptUsed: string }
 *
 * IMPORTANTE: DALL-E 3 NAO e LLM — exige provider 'openai'. Nao tenta
 * migrar pra MiniMax ou Qwen porque so OpenAI oferece image gen no
 * ecossistema MiniMax hoje.
 *
 * Ref: supabase/functions/generate-image/index.ts (Wave 1.3)
 */

import { z } from 'zod';
import { ApiError } from '../../contracts/errors';
import { logAiUsage } from '../log/usage';
import type { QueryablePool } from '../../db/postgres';

const InputSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

const STYLE_PREFIX =
  "A futuristic, ultra-minimalist 3D render in the style of 'Glassmorphism' and 'Dark UI'. The scene should feature deep black and charcoal backgrounds, with subtle glowing neon green (#03FC3B) accents. Objects should be abstract, geometric, or tech-focused, made of frosted glass or polished metal. High contrast, cinematic lighting, 8k resolution, sterile and premium aesthetic. No text or words in the image. ";

interface OpenAIImageResponse {
  data?: Array<{ url?: string }>;
  error?: { message?: string };
}

export async function handleGenerateImage(
  deps: { pool: QueryablePool; userId: string; tenantId: string },
  rawBody: unknown,
): Promise<Record<string, unknown>> {
  const body = InputSchema.parse(rawBody);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw ApiError.validation('OPENAI_API_KEY nao configurada no servidor.');
  }

  const finalPrompt = `${STYLE_PREFIX} Subject: ${body.prompt}`;
  const start = Date.now();

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: finalPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
        style: 'vivid',
      }),
    });

    const data = (await res.json()) as OpenAIImageResponse;
    if (data.error || !data.data?.[0]?.url) {
      throw new Error(data.error?.message ?? 'OpenAI image generation failed.');
    }

    const imageUrl = data.data[0].url;

    await logAiUsage(deps.pool, {
      edgeFunction: 'generate-image',
      provider: 'openai',
      model: 'dall-e-3',
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: true,
      latencyMs: Date.now() - start,
      metadata: { promptLength: body.prompt.length },
    });

    return {
      success: true,
      imageUrl,
      promptUsed: finalPrompt,
    };
  } catch (err) {
    await logAiUsage(deps.pool, {
      edgeFunction: 'generate-image',
      provider: 'openai',
      model: 'dall-e-3',
      userId: deps.userId,
      tenantId: deps.tenantId,
      success: false,
      errorMessage: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - start,
    });
    throw err;
  }
}
