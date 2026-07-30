import { apiBase } from './_base';

export interface UserProfileGcp {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  role: 'super_admin' | 'admin' | 'user';
  status: 'active' | 'pending' | 'inactive';
  avatarUrl?: string;
  createdAt: string;
}

export interface InvitationGcp {
  id: string;
  email: string;
  role: string;
  status: string;
  invitedBy?: string;
  createdAt: string;
}

export const usersGcpAdapter = {
  async getAll(): Promise<UserProfileGcp[]> {
    const res = await fetch(`${apiBase()}/users`);
    if (!res.ok) throw new Error('Falha ao buscar usuários da API GCP');
    return res.json();
  },

  async getInvitations(): Promise<InvitationGcp[]> {
    const res = await fetch(`${apiBase()}/users/invitations`);
    if (!res.ok) throw new Error('Falha ao buscar convites da API GCP');
    return res.json();
  },

  async inviteMember(email: string, role: string): Promise<InvitationGcp> {
    const res = await fetch(`${apiBase()}/users/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao enviar convite via GCP Cloud Function');
    }
    return res.json();
  },

  async deleteUser(userId: string): Promise<void> {
    const res = await fetch(`${apiBase()}/users/${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao remover usuário via GCP Cloud Function');
  },
};
