import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
  FolderKanban, CheckCircle2, Plus,
  Clock, Zap, Users, TrendingUp, FileText, ArrowUpRight,
  Calendar, Target, Activity, Building2, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import { OrphanedRecordingsAlert } from '@/components/admin/OrphanedRecordingsAlert';
import { DashboardSkeleton } from '@/components/ui/skeleton';

import { getAllClients, type Client } from '@/api/clients';
import { reiProjectsGcpAdapter, type ReiProject } from '@/api/adapters/rei-projects-gcp';

interface VelocityPoint {
  day: string;
  concluidas: number;
}

const TYPE_LABELS: Record<string, string> = {
  consulting: '360°',
  founder: 'Founder',
  dev: 'Sites',
  crm_ops: 'RevOps',
  funnels_impl: 'Funis',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<ReiProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const clientsData = await getAllClients();
      setClients(clientsData);

      if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
        try {
          const projectsData = await reiProjectsGcpAdapter.getAll();
          setProjects(projectsData);
        } catch (e) {
          console.warn('Projetos via GCP não carregados:', e);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeClientsCount = clients.filter(c => c.status === 'active' || !c.status).length;
  const onboardingClientsCount = clients.filter(c => c.status === 'onboarding').length;
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;

  const mockVelocity: VelocityPoint[] = [
    { day: 'Seg', concluidas: 4 },
    { day: 'Ter', concluidas: 7 },
    { day: 'Qua', concluidas: 5 },
    { day: 'Qui', concluidas: 9 },
    { day: 'Sex', concluidas: 6 },
    { day: 'Sáb', concluidas: 2 },
    { day: 'Dom', concluidas: 1 },
  ];

  const totalVelocity = mockVelocity.reduce((acc, curr) => acc + curr.concluidas, 0);

  if (loading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header - SaaS Moderno Benchmark */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
              <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {greeting()}, Operação RevHackers
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Visão consolidada das contas ativas, entregas operacionais e projetos sob contrato.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/admin/clients/novo')}
              className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-xs font-medium tracking-wide shadow-xs gap-2 flex items-center transition-all border border-zinc-200"
            >
              <Plus size={15} className="text-[#00CC6A]" /> Novo Cliente
            </Button>
          </div>
        </div>

        {/* Metric Cards — High Precision SaaS UI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Contas Ativas</span>
              <Building2 size={16} className="text-zinc-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{activeClientsCount}</span>
              <span className="text-xs text-[#00CC6A] font-medium">em contrato</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Em Onboarding</span>
              <Clock size={16} className="text-zinc-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{onboardingClientsCount}</span>
              <span className="text-xs text-zinc-500 font-medium">setup inicial</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Projetos REI</span>
              <Zap size={16} className="text-[#00CC6A]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{projects.length}</span>
              <span className="text-xs text-zinc-400 font-normal">vinculados</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Entregas / Semana</span>
              <Activity size={16} className="text-zinc-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{totalVelocity}</span>
              <span className="text-xs text-zinc-400 font-normal">marcos concluídos</span>
            </div>
          </div>
        </div>

        {/* Gravadores Órfãos Alert */}
        <OrphanedRecordingsAlert />

        {/* Conteúdo em 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda: Carteira de Clientes e Projetos (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Clientes sob Operação */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00CC6A]"></span>
                  <h3 className="text-sm font-semibold text-zinc-900">Carteira de Operações B2B</h3>
                </div>
                <button
                  onClick={() => navigate('/admin/clients')}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  Ver todos os clientes <ArrowUpRight size={13} />
                </button>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 font-medium">Nenhum cliente cadastrado no momento.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {clients.slice(0, 5).map((client) => (
                    <div
                      key={client.id}
                      onClick={() => navigate('/admin/clients')}
                      className="py-3.5 flex items-center justify-between hover:bg-white shadow-sm/60 px-2 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold text-xs">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 group-hover:text-black">
                            {client.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-medium">
                            {client.company || client.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {client.status === 'active' || !client.status ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#00CC6A] text-black">
                            ● ATIVO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-zinc-900 text-white">
                            ONBOARDING
                          </span>
                        )}
                        <ArrowUpRight size={14} className="text-zinc-400 group-hover:text-zinc-900" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Velocidade Semanal de Entregas */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="text-sm font-semibold text-zinc-900">Velocidade de Operação (Marcos/Semana)</h3>
                <span className="text-xs font-mono font-bold text-zinc-500">{totalVelocity} entregas</span>
              </div>
              <div className="h-32 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockVelocity} barSize={24}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} hide />
                    <Tooltip cursor={{ fill: '#f4f4f5' }} />
                    <Bar dataKey="concluidas" fill="#18181b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Coluna Direita: Acesso Rápido & Projetos REI (1/3) */}
          <div className="space-y-6">
            
            {/* Projetos REI Ativos */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="text-sm font-semibold text-zinc-900">Projetos REI Ativos</h3>
                <button
                  onClick={() => navigate('/admin/rei')}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  Ver todos <ArrowUpRight size={13} />
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-6">
                  <Zap className="h-6 w-6 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 font-medium">Nenhum projeto REI cadastrado via GCP.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {projects.slice(0, 4).map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => navigate(`/admin/rei?search=${encodeURIComponent(proj.clientEmail)}`)}
                      className="p-3 border border-zinc-200/60 rounded-lg hover:border-zinc-300 transition-all cursor-pointer bg-white shadow-sm/50 hover:bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-900">{proj.clientName}</span>
                        <span className="text-[10px] font-mono font-bold bg-zinc-900 text-white px-1.5 py-0.5 rounded">
                          {TYPE_LABELS[proj.type] || proj.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
                        <span>Próxima REI: {new Date(proj.nextReiDate).toLocaleDateString('pt-BR')}</span>
                        <span className="text-[#00CC6A] font-medium">Ativo</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acesso Rápido a Hubs */}
            <div className="bg-zinc-950 rounded-xl p-5 text-white space-y-3 shadow-xs">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Hubs de Operação</h4>
              <div className="space-y-2 text-xs font-medium">
                <button
                  onClick={() => navigate('/admin/clients')}
                  className="w-full text-left px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span>Gestão de Clientes B2B</span>
                  <ArrowUpRight size={13} className="text-[#00CC6A]" />
                </button>
                <button
                  onClick={() => navigate('/admin/rei')}
                  className="w-full text-left px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span>Projetos & Sprints REI</span>
                  <ArrowUpRight size={13} className="text-[#00CC6A]" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
