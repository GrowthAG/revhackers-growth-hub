/**
 * Router de providers de IA.
 *
 * Seleciona o provider apropriado baseado em:
 *   1. ENV explicito (AI_PROVIDER=minimax|openai|gemini|anthropic)
 *   2. Default sensato: MiniMax (provider MiniMax no .env, mais barato, ja e default)
 *
 * Providers concretos ficam em arquivos irmaos (openai.ts, minimax.ts, etc).
 */

import { ApiError } from '../../contracts/errors';
import type { AiProvider, AiRequest, AiResponse } from '../types';
import { callOpenAi } from './openai';
import { callMinimax } from './minimax';

/** Chaves opcionais: o valor pode ser string ou ausente (nao `undefined` explicito). */
export interface ProviderEnv {
  provider?: string;
  model?: string;
  openaiApiKey?: string;
  minimaxApiKey?: string;
  geminiApiKey?: string;
  anthropicApiKey?: string;
}

let cachedEnv: ProviderEnv | null = null;

function readOptional(name: string): string | undefined {
  const v = process.env[name];
  if (v === undefined || v === '') return undefined;
  return v.trim();
}

function loadEnv(): ProviderEnv {
  if (cachedEnv !== null) return cachedEnv;
  const env: ProviderEnv = {};
  const provider = readOptional('AI_PROVIDER');
  if (provider !== undefined) env.provider = provider;
  const model = readOptional('AI_DEFAULT_MODEL');
  if (model !== undefined) env.model = model;
  const openaiApiKey = readOptional('OPENAI_API_KEY');
  if (openaiApiKey !== undefined) env.openaiApiKey = openaiApiKey;
  const minimaxApiKey = readOptional('MINIMAX_API_KEY');
  if (minimaxApiKey !== undefined) env.minimaxApiKey = minimaxApiKey;
  const geminiApiKey = readOptional('GEMINI_API_KEY');
  if (geminiApiKey !== undefined) env.geminiApiKey = geminiApiKey;
  const anthropicApiKey = readOptional('ANTHROPIC_API_KEY');
  if (anthropicApiKey !== undefined) env.anthropicApiKey = anthropicApiKey;
  cachedEnv = env;
  return env;
}

/** Para testes: permite resetar o cache de env. */
export function resetProviderEnvCache(): void {
  cachedEnv = null;
}

function selectProvider(requested?: string | null): AiProvider {
  const env = loadEnv();
  const raw = (requested ?? env.provider ?? 'minimax').toLowerCase();
  switch (raw) {
    case 'openai':
    case 'gpt':
    case 'gpt-4o':
    case 'gpt-4o-mini':
    case 'gpt-5':
    case 'gpt-5.2':
      return 'openai';
    case 'minimax':
    case 'minimax-m3':
    case 'qwen':
    case 'qwen3':
      return 'minimax';
    case 'gemini':
    case 'google':
      return 'gemini';
    case 'anthropic':
    case 'claude':
      return 'anthropic';
    default:
      throw ApiError.validation(`Provider IA desconhecido: ${raw}`);
  }
}

function defaultModelFor(provider: AiProvider): string {
  const env = loadEnv();
  if (env.model) return env.model;
  switch (provider) {
    case 'minimax':
      return 'minimax-m3';
    case 'openai':
      return 'gpt-4o-mini';
    case 'gemini':
      return 'gemini-3.6-flash';
    case 'anthropic':
      return 'claude-sonnet-5';
  }
}

/**
 * Despacha uma requisicao de IA para o provider apropriado.
 * Lanca ApiError('validation') se a chave do provider nao estiver configurada.
 */
export async function callAi(
  request: AiRequest,
  options?: { provider?: string | null; model?: string | null },
): Promise<AiResponse> {
  const provider = selectProvider(options?.provider ?? null);
  const model = options?.model ?? request.model ?? defaultModelFor(provider);
  const env = loadEnv();

  switch (provider) {
    case 'openai': {
      const apiKey = env.openaiApiKey;
      if (!apiKey) {
        throw ApiError.validation('OPENAI_API_KEY nao configurada no servidor.');
      }
      return callOpenAi({ ...request, model }, apiKey);
    }
    case 'minimax': {
      const apiKey = env.minimaxApiKey;
      if (!apiKey) {
        throw ApiError.validation('MINIMAX_API_KEY nao configurada no servidor.');
      }
      return callMinimax({ ...request, model }, apiKey);
    }
    case 'gemini': {
      // TODO: implementar provider Gemini no proximo passo
      throw ApiError.validation('Provider Gemini ainda nao implementado em Wave 1.');
    }
    case 'anthropic': {
      // TODO: implementar provider Anthropic no proximo passo
      throw ApiError.validation('Provider Anthropic ainda nao implementado em Wave 1.');
    }
  }
}
