import { apiBase, authenticatedRequest } from './_base';
import { supabase } from '@/integrations/supabase/client';

/**
 * Invoca uma função/endpoint da API GCP Cloud Functions com fallback transparente para Supabase Edge Functions.
 */
export async function invokeGcpFunction(functionName: string, body: any): Promise<{ data: any; error: any }> {
  // Se GCP estiver ativo
  if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
    try {
      const res = await fetch(`${apiBase()}/v1/functions/${functionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return { data, error: null };
      }
    } catch (err) {
      console.warn(`Fallback na função GCP ${functionName}, tentando Supabase...`, err);
    }
  }

  // Fallback Supabase Edge Functions
  return supabase.functions.invoke(functionName, { body });
}
