/**
 * Tipos compartilhados do modulo de IA.
 *
 * Provider-agnostic - providers concretos em ./providers/* convertem
 * AiRequest para o formato especifico (OpenAI, MiniMax, Gemini, Claude).
 */

export type AiProvider = 'openai' | 'minimax' | 'anthropic' | 'gemini';

export interface AiRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Quando true, forca JSON estruturado (response_format={type:'json_object'}). */
  jsonMode?: boolean;
}

export interface AiResponse {
  content: string;
  /** Quando jsonMode=true, e objeto parseado. */
  parsed?: unknown;
  provider: AiProvider;
  model: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
}

export interface AiUsageLogEntry {
  edgeFunction: string;
  provider: AiProvider | string;
  model: string;
  userId?: string;
  tenantId?: string;
  success: boolean;
  errorMessage?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  latencyMs?: number | null;
  metadata?: Record<string, unknown>;
}

export interface ProviderConfig {
  provider: AiProvider;
  defaultModel: string;
  apiKey: string;
  baseUrl?: string;
}
