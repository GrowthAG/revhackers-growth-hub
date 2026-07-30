import { authenticatedRequest } from './_base';
import { supabase } from '@/integrations/supabase/client';

export const aiGcpAdapter = {
  async getAgents() {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/agents`);
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    }
    const { data, error } = await supabase.from('agents').select('id, name, system_prompt, role, model, description').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getSessions(userId: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/chat-sessions?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    }
    const { data, error } = await supabase.from('chat_sessions').select('id, agent_id, title, created_at, updated_at').eq('user_id', userId).order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async deleteSession(sessionId: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/chat-sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) return;
    }
    const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
    if (error) throw error;
  },

  async renameSession(sessionId: string, title: string) {
    const isGcp = import.meta.env.VITE_GCP_ENABLED === 'true';
    if (isGcp) {
      const res = await authenticatedRequest(`/v1/chat-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) return;
    }
    const { error } = await supabase.from('chat_sessions').update({ title }).eq('id', sessionId);
    if (error) throw error;
  }
};
