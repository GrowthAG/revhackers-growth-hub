import { authenticatedRequest } from './_base';
import { supabase } from '@/integrations/supabase/client';

export const scraperGcpAdapter = {
  async scrapeProfile(url: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest('/v1/scrape-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        const { data } = await res.json();
        return { data, error: null };
      }
    }
    const { data, error } = await supabase.functions.invoke('scrape-profile', {
      body: { url }
    });
    return { data, error };
  }
};
