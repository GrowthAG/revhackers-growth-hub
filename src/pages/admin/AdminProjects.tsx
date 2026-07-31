import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Search, ArrowLeft, Zap, CheckCircle2, Clock, FolderKanban, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDisplayName } from '@/lib/projectUtils';
import { reiProjectsGcpAdapter } from '@/api/adapters/rei-projects-gcp';

const TYPE_LABELS: Record<string, string> = {
  consulting: '360°',
  founder: 'Founder',
  dev: 'Sites',
  crm_ops: 'RevOps',
  funnels_impl: 'Funis',
};

const PRE_SALE  = ['lead_inbound','lead_qualified','diagnostic_done','proposal_draft','proposal_sent','proposal_viewed','negotiation'];
const EXECUTION = ['won','onboarding','active','completed'];
const CLOSED    = ['churned'];

type FilterKey = 'todos' | 'execucao' | 'encerrado';

const AdminProjects: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('todos');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects-list'],
    queryFn: async () => {
      // Tenta carregar via GCP Adapter se ativo
      if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
        try {
          const gcpProjects = await reiProjectsGcpAdapter.getAll();
          return gcpProjects.map(p => ({
            id: p.id,
            client_name: p.clientName,
            client_company: p.clientCompany || p.clientName,
            trade_name: p.clientName,
            type: p.type,
            status: p.status,
            pipeline_stage: p.status,
            created_at: p.lastReiDate || new Date().toISOString(),
            updated_at: p.nextReiDate || new Date().toISOString(),
            display_name: p.clientName,
            tasks: { total: 0, done: 0, overdue: 0 }
          }));
        } catch (e) {
          console.warn('Fallback para Supabase no AdminProjects...', e);
        }
      }

      const { data: raw, error } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_company, trade_name, type, status, pipeline_stage, created_at, updated_at')
        .not('status', 'eq', 'archived')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!raw?.length) return [];

      const ids = raw.map(p => p.id);
      const { data: tasks } = await supabase
        .from('orqflow_tasks')
        .select('id, project_id, status, due_date')
        .in('project_id', ids)
        .not('status', 'eq', 'archived');

      const nowIso = new Date().toISOString();

      return raw
        .filter((p: any) => !PRE_SALE.includes(p.pipeline_stage || '') && p.pipeline_stage !== 'lost')
        .map(p => {
          const ptasks = (tasks || []).filter(t => t.project_id === p.id);
          return {
            ...p,
            display_name: getDisplayName({ trade_name: p.trade_name, client_company: p.client_company, client_name: p.client_name }),
            tasks: {
              total: ptasks.length,
              done: ptasks.filter(t => t.status === 'done').length,
              overdue: ptasks.filter(t => t.due_date && t.due_date < nowIso && t.status !== 'done').length,
            },
          };
        });
    },
  });

  const filtered = useMemo(() => {
    let result = projects;
    if (filter === 'execucao') result = result.filter(p => EXECUTION.includes(p.pipeline_stage || '') || p.status === 'active');
    if (filter === 'encerrado') result = result.filter(p => CLOSED.includes(p.pipeline_stage || '') || p.status === 'completed');
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.display_name.toLowerCase().includes(q) ||
        (p.client_name || '').toLowerCase().includes(q) ||
        (p.client_company || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, filter, search]);

  const counts = useMemo(() => ({
    todos: projects.length,
    execucao: projects.filter(p => EXECUTION.includes(p.pipeline_stage || '') || p.status === 'active').length,
    encerrado: projects.filter(p => CLOSED.includes(p.pipeline_stage || '') || p.status === 'completed').length,
  }), [projects]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header SaaS Moderno Benchmark */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-1">
              <button
                onClick={() => navigate('/admin')}
                className="hover:text-zinc-900 transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={13} /> Dashboard
              </button>
              <span>/</span>
              <span className="text-zinc-900 font-bold">Projetos</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Projetos & Operações
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                {projects.length} registros
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Gestão operacional das sprints ativas, entregáveis de clientes e acompanhamento sob contrato.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/rei/wizard')}
              className="bg-[#00CC6A] text-zinc-950 hover:bg-[#00b35e] rounded-lg h-9 px-4 text-xs font-semibold tracking-wide shadow-xs gap-2 flex items-center transition-all"
            >
              <Zap size={15} className="fill-zinc-950" /> 📋 Iniciar Call REI (40 Perguntas)
            </Button>
            <Button
              onClick={() => navigate('/admin/rei/novo')}
              className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-xs font-semibold tracking-wide shadow-xs gap-2 flex items-center transition-all border border-zinc-200"
            >
              <Plus size={15} className="text-[#00CC6A]" /> Criar Projeto
            </Button>
          </div>
        </div>

        {/* Metric Cards — High Precision SaaS UI */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium text-zinc-500">Total de Projetos</span>
              <FolderKanban size={15} className="text-zinc-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{counts.todos}</span>
              <span className="text-xs text-zinc-400 font-medium">operações</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium text-zinc-500">Em Execução</span>
              <div className="w-2 h-2 rounded-full bg-[#00CC6A]"></div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#00CC6A] tabular-nums">{counts.execucao}</span>
              <span className="text-xs text-zinc-500 font-medium">sprints ativas</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium text-zinc-500">Encerrados</span>
              <CheckCircle2 size={15} className="text-zinc-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{counts.encerrado}</span>
              <span className="text-xs text-zinc-400 font-medium">concluídos</span>
            </div>
          </div>
        </div>

        {/* Control Bar: Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shadow-xs p-2 rounded-xl border border-zinc-200/80">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Filtrar por cliente ou empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-12 h-9 bg-white border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 transition-all shadow-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === 'todos' ? 'bg-zinc-950 text-white border border-zinc-950' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Todos ({counts.todos})
            </button>
            <button
              onClick={() => setFilter('execucao')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === 'execucao' ? 'bg-[#00CC6A] text-black border border-[#00CC6A]' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Em Execução ({counts.execucao})
            </button>
            <button
              onClick={() => setFilter('encerrado')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === 'encerrado' ? 'bg-zinc-900 text-white border border-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Encerrados ({counts.encerrado})
            </button>
          </div>
        </div>

        {/* Content Table / Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-white border border-zinc-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-[#00CC6A] rounded-full animate-spin"></div>
              <span className="text-xs text-zinc-500 font-medium">Carregando projetos...</span>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Projeto & Cliente</th>
                    <th className="py-3.5 px-4">Tipo</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                  {filtered.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/admin/projects/${project.id}`)}
                      className="hover:bg-white shadow-sm/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-200 text-white font-semibold text-xs">
                            {project.display_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 group-hover:text-black">
                              {project.display_name}
                            </div>
                            <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
                              {project.client_company || project.client_name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {TYPE_LABELS[project.type] || project.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {project.status === 'active' || project.pipeline_stage === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#00CC6A] text-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-black"></span> EM EXECUÇÃO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                            ONBOARDING / CONCLUSÃO
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 rounded-md hover:bg-zinc-100 text-zinc-700 text-[11px] font-mono font-bold gap-1 border border-zinc-200 bg-white"
                        >
                          VER DETALHES <ExternalLink size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-zinc-200 rounded-xl p-8">
            <FolderKanban className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Nenhum projeto encontrado</p>
            <p className="text-xs text-zinc-400 mt-1">Ajuste os filtros ou crie uma nova operação no cockpit.</p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
