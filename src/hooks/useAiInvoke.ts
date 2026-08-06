/**
 * useAiInvoke - Hook para chamar handlers AI.
 *
 * Estrategia de migracao gradual (Wave 1):
 *   1. Tenta GCP se VITE_GCP_ENABLED e o handler existe no adapter.
 *   2. Fallback para Supabase Edge Function se GCP falhar.
 *   3. Garante que nenhum fluxo existente quebra durante a migracao.
 *
 * Ref: docs/architecture/gcp-migration/ai-supabase-to-gcp-migration.md
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { aiGcpAdapter, type InvokeOptions, type InvokeResult } from '@/api/adapters/ai-gcp';

interface UseAiInvokeOptions {
  /** Timeout em ms (default 30s). */
  timeoutMs?: number;
  /** Forca uso de Supabase (skip GCP). Default false. */
  forceSupabase?: boolean;
}

const GCP_ENABLED = import.meta.env.VITE_GCP_ENABLED === 'true';

/** Mapeia handler GCP -> nome da edge function Supabase. */
const SUPABASE_HANDLER_MAP: Record<string, string> = {
  'analyze-diagnostic': 'analyze-diagnostic',
  'generate-growthmap': 'generate-growthmap',
  'generate-strategic-plan': 'generate-strategic-plan',
  'agent-chat': 'agent-chat',
  'auto-enrich-project': 'auto-enrich-project',
  'market-intelligence': 'market-intelligence',
  'inspect-website': 'inspect-website',
  'scrape-profile': 'scrape-profile',
  'generate-playbook': 'generate-playbook',
  'generate-success-plan': 'generate-success-plan',
  'crux-benchmark': 'crux-benchmark',
  'generate-image': 'generate-image',
  'trigger-post-rei-enrichment': 'trigger-post-rei-enrichment',
  'agent-documents': 'agent-documents',
  'google-meetings': 'google-meetings',
  // Handlers novos (sem equivalente Supabase)
  'swot-analysis': null as unknown as string,
  'growthmap-suggest': null as unknown as string,
};

async function invokeSupabase<T>(
  handlerName: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<InvokeResult<T>> {
  const supabaseHandler = SUPABASE_HANDLER_MAP[handlerName];
  if (!supabaseHandler) {
    return { data: null, error: new Error(`Handler ${handlerName} sem equivalente Supabase.`) };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { data, error } = await supabase.functions.invoke(supabaseHandler, {
      body,
    });
    if (error) return { data: null, error: new Error(error.message || 'Supabase invoke failed') };
    return { data: (data as T) ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  } finally {
    clearTimeout(timer);
  }
}

export function useAiInvoke() {
  const invoke = useCallback(
    async <T = unknown>(
      handlerName: string,
      body: Record<string, unknown>,
      options: UseAiInvokeOptions = {},
    ): Promise<InvokeResult<T>> => {
      const timeoutMs = options.timeoutMs ?? 30_000;

      // 1) Tenta GCP se habilitado e nao forcado Supabase
      if (GCP_ENABLED && !options.forceSupabase) {
        const gcpResult = await aiGcpAdapter.invoke<T>(handlerName, body, { timeoutMs });
        if (!gcpResult.error) return gcpResult;
        console.warn(`[useAiInvoke] GCP ${handlerName} falhou, fallback Supabase:`, gcpResult.error.message);
      }

      // 2) Fallback Supabase
      return invokeSupabase<T>(handlerName, body, timeoutMs);
    },
    [],
  );

  return { invoke };
}

/** Helper one-shot para uso fora de componentes React. */
export async function invokeAi<T = unknown>(
  handlerName: string,
  body: Record<string, unknown>,
  options: UseAiInvokeOptions = {},
): Promise<InvokeResult<T>> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  if (GCP_ENABLED && !options.forceSupabase) {
    const gcpResult = await aiGcpAdapter.invoke<T>(handlerName, body, { timeoutMs });
    if (!gcpResult.error) return gcpResult;
  }
  return invokeSupabase<T>(handlerName, body, timeoutMs);
}
