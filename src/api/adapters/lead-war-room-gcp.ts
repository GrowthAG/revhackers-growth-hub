import { authenticatedRequest } from './_base';
import { supabase } from '@/integrations/supabase/client';

export const leadWarRoomGcpAdapter = {
  async getProjectFullData(projectId: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/rei-projects/${projectId}/full`);
      if (res.ok) {
        const { data } = await res.json();
        return data;
      }
    }
    const { data, error } = await supabase
      .from('rei_projects')
      .select('client_name, client_company, client_email, client_site, trade_name, type, enrichment_data, market_data, site_analysis')
      .eq('id', projectId)
      .single();
    if (error) throw error;
    return data;
  },

  async getMeetings(projectId: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/rei-projects/${projectId}/meetings`);
      if (res.ok) {
        const { data } = await res.json();
        return data;
      }
    }
    const { data, error } = await supabase
      .from('meeting_recordings')
      .select('id, title, happened_at, ai_insights')
      .eq('rei_project_id', projectId)
      .order('happened_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async enrichProject(projectId: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/rei-projects/${projectId}/enrich`, { method: 'POST' });
      if (res.ok) return;
    }
    const { error } = await supabase.functions.invoke('auto-enrich-project', {
      body: { project_id: projectId },
    });
    if (error) throw error;
  },

  async updateProjectEnrichment(projectId: string, enrichmentData: any) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/rei-projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrichment_data: enrichmentData }),
      });
      if (res.ok) return;
    }
    const { error } = await supabase.from('rei_projects').update({ enrichment_data: enrichmentData } as any).eq('id', projectId);
    if (error) throw error;
  },

  async updateProjectTradeName(projectId: string, tradeName: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/rei-projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade_name: tradeName }),
      });
      if (res.ok) return;
    }
    const { error } = await supabase.from('rei_projects').update({ trade_name: tradeName } as any).eq('id', projectId);
    if (error) throw error;
  },

  async updateProjectMarketData(projectId: string, marketData: any) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/rei-projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market_data: marketData }),
      });
      if (res.ok) return;
    }
    const { error } = await supabase.from('rei_projects').update({ market_data: marketData } as any).eq('id', projectId);
    if (error) throw error;
  },

  async updateOpportunityStakeholders(projectId: string, oppData: any, stakeholders: any[]) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/opportunities/${projectId}/stakeholders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stakeholders }),
      });
      if (res.ok) return;
    }
    const { error } = await supabase.from('opportunities').update({ opportunity_data: { ...oppData, stakeholders } }).eq('id', projectId);
    if (error) throw error;
  },

  async qualifyLead(projectId: string, nameToSearch: string, fullData: any) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/rei-projects/${projectId}/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameToSearch, fullData }),
      });
      if (res.ok) return;
    }
    let officialClientId = null;
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .ilike('name', `%${nameToSearch}%`)
      .limit(1);

    if (existingClients && existingClients.length > 0) {
      officialClientId = existingClients[0].id;
    } else {
      const newClientRes = await supabase.from('clients').insert([{
        name: nameToSearch,
        company: fullData.client_company || nameToSearch,
        trade_name: fullData.trade_name,
        email: fullData.client_email,
        status: 'active'
      }]).select('id').single();
      
      if (newClientRes.data?.id) {
        officialClientId = newClientRes.data.id;
      }
    }

    const { error: updateErr } = await supabase
      .from('rei_projects')
      .update({ 
        status: 'approved',
        client_id: officialClientId
      } as any)
      .eq('id', projectId);

    if (updateErr) throw updateErr;
  }
};
