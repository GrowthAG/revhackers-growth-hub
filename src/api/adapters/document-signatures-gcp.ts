import { authenticatedRequest } from './_base';
import { supabase } from '@/integrations/supabase/client';

export const documentSignaturesGcpAdapter = {
  async getSignature(projectId: string, referenceId: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/document-signatures?project_id=${projectId}&reference_id=${referenceId}`);
      if (res.ok) {
        const { data } = await res.json();
        return data;
      }
    }
    const { data, error } = await supabase.from('document_signatures')
      .select('id')
      .eq('project_id', projectId)
      .eq('reference_id', referenceId)
      .limit(1);
    if (error) throw error;
    return data;
  }
};
