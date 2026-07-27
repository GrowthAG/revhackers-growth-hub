import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Activity, 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  Loader2, 
  Building2, 
  User,
  Clock,
  Send,
  Star
} from 'lucide-react';
import { reiGcpAdapter, type REIOnboardingView, type ExpansionOpportunityView } from '@/api/adapters/rei-gcp';

const KANBAN_PHASES: { key: REIOnboardingView['current_phase']; title: string; subtitle: string }[] = [
  { key: 'O1_EMBARK', title: 'O1. Embark', subtitle: 'Boas-Vindas & Acesso' },
  { key: 'O2_HANDOFF', title: 'O2. Handoff', subtitle: 'Vendas → CS' },
  { key: 'O3_KICKOFF', title: 'O3. Kickoff', subtitle: 'Reunião de Alinhamento' },
  { key: 'O4_ADOPT', title: 'O4. Adopt', subtitle: 'Adoção & Quick Win' },
  { key: 'O5_REVIEW', title: 'O5. Review', subtitle: 'Revisão & NPS' },
  { key: 'O6_EXPAND', title: 'O6. Expand', subtitle: 'Renovação & Expansão' },
];

const MILESTONE_COLORS: Record<REIOnboardingView['current_milestone'], string> = {
  M0_WELCOME: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  M1_KICKOFF: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  M2_QUICK_WIN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  M3_NPS_D14: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  M4_MID_REVIEW: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  M5_WRAP_NPS: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  COMPLETED: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
};

const CHURN_RISK_COLORS: Record<REIOnboardingView['churn_risk'], string> = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export const REICockpit: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: onboardings = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['rei-onboardings-active'],
    queryFn: () => reiGcpAdapter.listActive(),
  });

  const welcomeMutation = useMutation({
    mutationFn: (id: string) => reiGcpAdapter.markWelcomeSent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rei-onboardings-active'] });
    },
  });

  const tenantId = 'demo-tenant';
  const [showExpansionModal, setShowExpansionModal] = useState(false);
  const [activeOnboardingId, setActiveOnboardingId] = useState<string | null>(null);
  const [expansionForm, setExpansionForm] = useState({
    opportunity_type: 'upsell' as 'upsell' | 'cross_sell' | 'renewal' | 'expansion_service' | 'referral',
    product_name: '',
    product_description: '',
    estimated_value_brl: '',
    ai_reasoning: '',
  });

  const expansionQuery = useQuery({
    queryKey: ['expansion', 'all'],
    queryFn: () => reiGcpAdapter.listExpansionOpportunities(tenantId),
    refetchOnWindowFocus: false,
  });

  const createExpansionMutation = useMutation({
    mutationFn: (data: {
      opportunity_type: 'upsell' | 'cross_sell' | 'renewal' | 'expansion_service' | 'referral';
      product_name: string;
      product_description?: string;
      estimated_value_brl?: number;
      ai_reasoning?: string;
    }) => reiGcpAdapter.createExpansionOpportunity({
      tenant_id: tenantId,
      rei_onboarding_id: activeOnboardingId || undefined,
      opportunity_type: data.opportunity_type,
      product_name: data.product_name,
      product_description: data.product_description,
      estimated_value_brl: data.estimated_value_brl,
      ai_reasoning: data.ai_reasoning,
      created_by: 'demo@revhackers.com',
    }),
    onSuccess: () => expansionQuery.refetch(),
  });

  const expansionOpportunities = expansionQuery.data || [];

  // Calculate top stats metrics
  const totalActive = onboardings.length;
  
  const npsScores = onboardings.map(o => o.nps_d14_score).filter((s): s is number => s !== null);
  const avgNps = npsScores.length > 0 ? (npsScores.reduce((a, b) => a + b, 0) / npsScores.length).toFixed(1) : 'N/A';

  const avgHealth = totalActive > 0 
    ? Math.round(onboardings.reduce((acc, o) => acc + o.health_score, 0) / totalActive) 
    : 0;

  const highChurnCount = onboardings.filter(o => o.churn_risk === 'high').length;
  const highChurnPct = totalActive > 0 ? Math.round((highChurnCount / totalActive) * 100) : 0;

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-400" />
              Cockpit REI — Onboarding Orquestrado
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Gestão de Saúde, Churn e Marcos de Sucesso dos Clientes em Onboarding.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-900/30 text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Atualizar Painel
          </button>
        </div>

        {/* Top 4 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-sm font-medium">
              <span>Total Ativos</span>
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mt-2">{totalActive}</div>
            <div className="text-xs text-slate-400 mt-2">Em onboarding orquestrado</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-sm font-medium">
              <span>NPS D14 Médio</span>
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400 mt-2">{avgNps}</div>
            <div className="text-xs text-slate-400 mt-2">Satisfação inicial (0-10)</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-sm font-medium">
              <span>Health Score Médio</span>
              <Heart className="w-5 h-5 text-purple-400" />
            </div>
            <div className={`text-3xl font-bold mt-2 ${getHealthColor(avgHealth)}`}>
              {avgHealth} <span className="text-sm text-slate-500 font-normal">/ 100</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">Saúde da carteira</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-sm font-medium">
              <span>Risco Alto de Churn</span>
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-400 mt-2">{highChurnPct}%</div>
            <div className="text-xs text-rose-400/90 mt-2 font-medium">
              {highChurnCount} cliente(s) requerem intervenção
            </div>
          </div>
        </div>

        {/* Loading / Error State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 bg-slate-900/40 border border-slate-800 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="ml-3 text-slate-300">Carregando Cockpit REI...</span>
          </div>
        )}

        {isError && (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Erro ao carregar dados do GCP</h3>
              <p className="text-sm text-rose-300/80 mt-0.5">
                Não foi possível consultar os onboarding ativos na API. Tente atualizar.
              </p>
            </div>
          </div>
        )}

        {/* 6-Column Kanban Board */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {KANBAN_PHASES.map((phase) => {
              const phaseItems = onboardings.filter((o) => o.current_phase === phase.key);

              return (
                <div 
                  key={phase.key} 
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col space-y-3 min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{phase.title}</h3>
                      <p className="text-[10px] text-slate-400">{phase.subtitle}</p>
                    </div>
                    <span className="bg-slate-800 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-700">
                      {phaseItems.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {phaseItems.length === 0 ? (
                      <div className="text-center py-8 text-slate-600 text-xs italic border border-dashed border-slate-800/60 rounded-lg">
                        Sem clientes nesta fase
                      </div>
                    ) : (
                      phaseItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-3 space-y-2.5 transition shadow-sm"
                        >
                          {/* Client Header */}
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              {item.client_name}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <Building2 className="w-3 h-3 text-slate-500 flex-shrink-0" />
                              {item.client_company}
                            </p>
                          </div>

                          {/* Milestone Badge */}
                          <div>
                            <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-bold ${MILESTONE_COLORS[item.current_milestone]}`}>
                              {item.current_milestone}
                            </span>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                            <div>
                              <span className="text-slate-500 block text-[10px]">Health Score</span>
                              <span className={`font-bold ${getHealthColor(item.health_score)}`}>
                                {item.health_score}/100
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">Risco Churn</span>
                              <span className={`inline-block border px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${CHURN_RISK_COLORS[item.churn_risk]}`}>
                                {item.churn_risk}
                              </span>
                            </div>
                          </div>

                          {/* Journey & NPS Info */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {item.days_into_journey} dias
                            </span>
                            <span>
                              NPS: <strong className="text-slate-200">{item.nps_d14_score ?? '-'}</strong>
                            </span>
                          </div>

                          {/* 1-Click Action Button */}
                          <div className="pt-2 border-t border-slate-800/80">
                            <button
                              onClick={() => welcomeMutation.mutate(item.id)}
                              disabled={welcomeMutation.isPending || !!item.welcome_sent_at}
                              className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-medium text-[11px] py-1 px-2 rounded transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {item.welcome_sent_at ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  Welcome Enviado
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3" />
                                  1-Clique Welcome
                                </>
                              )}
                            </button>

                            {(item.current_milestone === 'COMPLETED' || item.current_phase === 'O6_EXPAND') && (
                              <button
                                onClick={() => {
                                  setActiveOnboardingId(item.id);
                                  setShowExpansionModal(true);
                                }}
                                className="w-full mt-2 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/30 px-2 py-1 rounded transition-colors"
                              >
                                <TrendingUp className="w-3 h-3" />
                                Iniciar Expansion
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Expansion Pipeline Section */}
        {expansionOpportunities.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mt-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Expansion Pipeline ({expansionOpportunities.length} oportunidade{expansionOpportunities.length !== 1 ? 's' : ''})
            </h2>
            <div className="space-y-3">
              {expansionOpportunities.map((opp) => (
                <div key={opp.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white">{opp.product_name}</div>
                      <div className="text-xs text-slate-400 mt-1 capitalize">{opp.opportunity_type.replace('_', ' ')}</div>
                      {opp.product_description && <div className="text-xs text-slate-300 mt-1">{opp.product_description}</div>}
                      {opp.estimated_value_brl && (
                        <div className="text-xs text-emerald-400 mt-2">R$ {opp.estimated_value_brl.toLocaleString('pt-BR')}</div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {opp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expansion Modal */}
        {showExpansionModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-white mb-4">Nova Expansion Opportunity</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createExpansionMutation.mutate({
                    opportunity_type: expansionForm.opportunity_type,
                    product_name: expansionForm.product_name,
                    product_description: expansionForm.product_description || undefined,
                    estimated_value_brl: expansionForm.estimated_value_brl ? parseFloat(expansionForm.estimated_value_brl) : undefined,
                    ai_reasoning: expansionForm.ai_reasoning || undefined,
                  });
                  setShowExpansionModal(false);
                  setExpansionForm({ opportunity_type: 'upsell', product_name: '', product_description: '', estimated_value_brl: '', ai_reasoning: '' });
                }}
                className="space-y-3"
              >
                <select
                  value={expansionForm.opportunity_type}
                  onChange={(e) => setExpansionForm({ ...expansionForm, opportunity_type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
                >
                  <option value="upsell">Upsell</option>
                  <option value="cross_sell">Cross-sell</option>
                  <option value="renewal">Renewal</option>
                  <option value="expansion_service">Expansion Service</option>
                  <option value="referral">Referral</option>
                </select>
                <input
                  required
                  type="text"
                  placeholder="Nome do produto/serviço"
                  value={expansionForm.product_name}
                  onChange={(e) => setExpansionForm({ ...expansionForm, product_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
                />
                <textarea
                  placeholder="Descrição"
                  value={expansionForm.product_description}
                  onChange={(e) => setExpansionForm({ ...expansionForm, product_description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
                  rows={2}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor estimado (BRL)"
                  value={expansionForm.estimated_value_brl}
                  onChange={(e) => setExpansionForm({ ...expansionForm, estimated_value_brl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
                />
                <textarea
                  placeholder="Raciocínio da IA (opcional)"
                  value={expansionForm.ai_reasoning}
                  onChange={(e) => setExpansionForm({ ...expansionForm, ai_reasoning: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
                  rows={2}
                />
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={createExpansionMutation.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded disabled:opacity-50">
                    {createExpansionMutation.isPending ? 'Criando...' : 'Criar Opportunity'}
                  </button>
                  <button type="button" onClick={() => setShowExpansionModal(false)} className="px-4 py-2 bg-slate-700 text-white rounded">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default REICockpit;
