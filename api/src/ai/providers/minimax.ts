/**
 * Provider MiniMax (MiniMax API + Qwen fallback).
 *
 * MiniMax e o provider default em RevHackers - ja esta em producao via frontend.
 * Migrar do front para o back centraliza controle de chaves e rate-limiting.
 *
 * Endpoint: POST https://api.minimax.io/v1/chat/completions
 * Auth: Bearer token (env: MINIMAX_API_KEY)
 * Modelos suportados: minimax-m3 (default), qwen3.5-flash (rapido), qwen3.7-max (alto raciocinio)
 */

import type { AiRequest, AiResponse } from '../types';

const MINIMAX_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';

interface MinimaxResponse {
  choices: Array<{
    message: { content: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
}

function safeParseJson(content: string): unknown | undefined {
  if (!content) return undefined;
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}

export async function callMinimax(
  request: AiRequest,
  apiKey: string,
): Promise<AiResponse> {
  const body: Record<string, unknown> = {
    model: request.model ?? 'minimax-m3',
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt },
    ],
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 4000,
  };
  if (request.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(MINIMAX_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`MiniMax API error (${res.status}): ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as MinimaxResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('MiniMax response vazia (sem content).');
  }

  return {
    content,
    parsed: request.jsonMode ? safeParseJson(content) : undefined,
    provider: 'minimax',
    model: data.model ?? request.model ?? 'minimax-m3',
    inputTokens: data.usage?.prompt_tokens ?? null,
    outputTokens: data.usage?.completion_tokens ?? null,
  };
}
