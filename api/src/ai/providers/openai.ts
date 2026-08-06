/**
 * Provider OpenAI (GPT-4o, GPT-4o-mini, GPT-5.x).
 *
 * Usa o SDK openai v6.x (já instalado em api/package.json).
 * Suporta JSON mode via response_format.
 */

import OpenAI from 'openai';
import type { AiRequest, AiResponse } from '../types';

let cachedClient: OpenAI | null = null;
let cachedKey: string | null = null;

function getClient(apiKey: string): OpenAI {
  if (cachedClient && cachedKey === apiKey) return cachedClient;
  cachedClient = new OpenAI({ apiKey });
  cachedKey = apiKey;
  return cachedClient;
}

/** Para testes: permite resetar o cache de client. */
export function resetOpenAiClientCache(): void {
  cachedClient = null;
  cachedKey = null;
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

export async function callOpenAi(
  request: AiRequest,
  apiKey: string,
): Promise<AiResponse> {
  const client = getClient(apiKey);
  const model = request.model ?? 'gpt-4o-mini';

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt },
    ],
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 4000,
    ...(request.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI response vazia (sem content).');
  }

  return {
    content,
    parsed: request.jsonMode ? safeParseJson(content) : undefined,
    provider: 'openai',
    model: response.model ?? model,
    inputTokens: response.usage?.prompt_tokens ?? null,
    outputTokens: response.usage?.completion_tokens ?? null,
  };
}
