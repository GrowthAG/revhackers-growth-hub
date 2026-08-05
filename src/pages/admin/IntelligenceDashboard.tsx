import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Building2, Globe, TrendingUp, AlertTriangle, RefreshCw, Loader2, Plus, ExternalLink, ArrowUpRight, ArrowDownRight, Target, Users, Sparkles, Share2, Download } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { intelligenceGcpAdapter, type IntelligenceJobView, type IntelligenceFindingView, type IndustryInsight } from '@/api/adapters/intelligence-gcp';
import { useTenantId, DEFAULT_STAGING_TENANT_ID } from '@/hooks/useTenantId';
import { cn } from '@/lib/utils';

// Industry Insights cards are now derived from real competitor data via
// `intelligenceGcpAdapter.listInsights()` (rules-based engine, zero LLM cost).
// If the project has no competitors, the dashboard shows an honest empty
// state with a CTA — no fabricated TAM numbers.
export default function IntelligenceDashboard() {
  const { projectId } = useParams<{ projectId?: string }>();
  const tenantId = useTenantId() ?? DEFAULT_STAGING_TENANT_ID;
  const activeProjectId = projectId || 'demo-project';
  const [showAddModal, setShowAddModal] = useState(false);

  const competitorsQuery = useQuery({
    queryKey: ['competitors', activeProjectId],
    queryFn: () => intelligenceGcpAdapter.listCompetitorsByProject(tenantId, activeProjectId),
    refetchOnWindowFocus: false,
  });

  const signalsQuery = useQuery({
    queryKey: ['signals', activeProjectId],
    queryFn: () => intelligenceGcpAdapter.listSignalsByProject(tenantId, activeProjectId),
    refetchOnWindowFocus: false,
  });

  const jobsQuery = useQuery({
    queryKey: ['jobs', activeProjectId],
    queryFn: () => intelligenceGcpAdapter.listJobs(tenantId),
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  });

  const findingsQuery = useQuery({
    queryKey: ['findings', activeProjectId],
    queryFn: () => intelligenceGcpAdapter.listFindings(tenantId),
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
  });

  const insightsQuery = useQuery({
    queryKey: ['insights', activeProjectId],
    queryFn: () => intelligenceGcpAdapter.listInsights(tenantId, activeProjectId),
    refetchOnWindowFocus: false,
  });

  const enqueueMutation = useMutation({
    mutationFn: (competitorId: string) =>
      intelligenceGcpAdapter.enqueueJob(tenantId, 'competitor_enrichment', competitorId, {}),
    onSuccess: () => {
      jobsQuery.refetch();
      competitorsQuery.refetch();
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => intelligenceGcpAdapter.enqueueShare(tenantId, projectId || 'demo-project', 'system'),
    onSuccess: (data: any) => {
      const shareUrl = `${window.location.origin}/public/growthmap/${data.share_token}`;
      navigator.clipboard?.writeText(shareUrl);
      alert(`Link de compartilhamento copiado!\n\n${shareUrl}\n\nExpira em: ${data.expires_at || 'sem expiração'}`);
    },
    onError: () => alert('Erro ao gerar link de compartilhamento.'),
  });

  const pdfExportMutation = useMutation({
    mutationFn: async () => {
      const dashboardElement = document.getElementById('intelligence-dashboard-content');
      if (!dashboardElement) throw new Error('Dashboard não encontrado no DOM.');
      const canvas = await html2canvas(dashboardElement, {
        backgroundColor: '#020617',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`inteligencia-${new Date().toISOString().split('T')[0]}.pdf`);
    },
    onSuccess: () => alert('PDF exportado com sucesso!'),
    onError: () => alert('Erro ao exportar PDF. Tente novamente.'),
  });

  const competitors = competitorsQuery.data || [];
  const signals = signalsQuery.data || [];
  const jobs = jobsQuery.data || [];
  const findings = findingsQuery.data || [];
  const insights = insightsQuery.data || [];

  return (
    <AdminLayout>
      <div id="intelligence-dashboard-content" className="p-8 max-w-7xl mx-auto space-y-8 bg-white text-zinc-900 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-[#00CC6A]" />
              Inteligência Estratégica
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Diagnóstico de mercado, concorrência e posicionamento — análise profunda para o seu projeto.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => pdfExportMutation.mutate()} disabled={pdfExportMutation.isPending} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded-lg transition text-sm disabled:opacity-50">
              {pdfExportMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Exportando...</> : <><Download className="w-4 h-4" /> Exportar PDF</>}
            </button>
            <button onClick={() => shareMutation.mutate()} disabled={shareMutation.isPending} className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 font-medium px-4 py-2 rounded-lg transition text-sm disabled:opacity-50">
              {shareMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando link...</> : <><Share2 className="w-4 h-4" /> Compartilhar</>}
            </button>
            <button onClick={() => { competitorsQuery.refetch(); signalsQuery.refetch(); jobsQuery.refetch(); findingsQuery.refetch(); insightsQuery.refetch(); }} disabled={competitorsQuery.isFetching} className="flex items-center gap-2 bg-[#00CC6A] hover:bg-[#00b35e] text-zinc-950 font-semibold px-4 py-2 rounded-lg transition text-sm disabled:opacity-50">

              <RefreshCw className={cn("w-4 h-4", competitorsQuery.isFetching && "animate-spin")} /> Atualizar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insightsQuery.isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Calculando insights a partir dos concorrentes...
            </div>
          ) : insights.length === 0 ? (
            <div className="col-span-full bg-white border border-zinc-200 rounded-xl p-8 shadow-xs text-center">
              <Sparkles className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-900 mb-2">Sem dados para gerar insights ainda</h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">
                Adicione concorrentes com CNPJ para gerar Industry Insights derivados de dados reais (capital social, porte, UF, SPI, sinais de mercado).
              </p>
            </div>
          ) : (
            insights.map((insight: IndustryInsight, i: number) => (
              <div key={`${insight.label}-${i}`} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
                <div className="flex justify-between items-start text-zinc-500 text-sm font-medium">
                  <span>{insight.label}</span>
                  {insight.trend === 'up' && <ArrowUpRight className="w-5 h-5 text-[#00CC6A]" />}
                  {insight.trend === 'down' && <ArrowDownRight className="w-5 h-5 text-rose-500" />}
                  {insight.trend === 'neutral' && <Target className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="text-2xl font-bold text-zinc-900 mt-2">{insight.value}</div>
                <div className="text-xs text-zinc-500 mt-2 leading-relaxed">{insight.description}</div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Vetores de Crescimento
            </h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong className="text-emerald-400">Digitalização acelerada de PMEs:</strong> +2,5 mi de novos CNPJs abertos em 2024; maioria busca ferramentas de gestão de vendas e marketing integradas.</p>
              <p><strong className="text-emerald-400">Gap de preço das plataformas globais:</strong> 70% das PMEs acham HubSpot caro demais e buscam alternativas nacionais.</p>
              <p><strong className="text-emerald-400">Crescimento de inbound + RevOps:</strong> 3x mais demanda por consultorias que combinam marketing, vendas e CS.</p>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Desafios do Setor
            </h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong className="text-rose-400">Churn early-stage elevado:</strong> Plataformas all-in-one têm curva de aprendizado; sem onboarding estruturado, churn nos primeiros 90 dias é crítico.</p>
              <p><strong className="text-rose-400">Credibilidade vs. marcas consolidadas:</strong> Como agência nacional, precisamos provar ROI com cases reais para vencer a barreira de entrada.</p>
              <p><strong className="text-rose-400">Dependência de ferramentas externas:</strong> Mudanças de pricing em Meta, Google, HubSpot impactam margens diretamente.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Concorrentes Monitorados
            </h2>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs">
              <Plus className="w-3.5 h-3.5" />
              Adicionar Concorrente
            </button>
          </div>
          {competitorsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Carregando concorrentes...
            </div>
          ) : competitors.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhum concorrente monitorado. Adicione um para começar.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors.map((c) => (
                <div key={c.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <div className="font-bold text-white">{c.name}</div>
                  {c.cnpj && <div className="text-xs text-slate-500 font-mono mt-1">CNPJ: {c.cnpj}</div>}
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-2">
                      <ExternalLink className="w-3 h-3" /> Visitar site
                    </a>
                  )}
                  <button
                    onClick={() => enqueueMutation.mutate(c.id)}
                    disabled={enqueueMutation.isPending}
                    className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {enqueueMutation.isPending ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Enfileirando...</>
                    ) : (
                      <><Sparkles className="w-3 h-3" /> Enqueue Enrichment</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI Insights Recentes ({findings.length})
          </h2>
          {findingsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Carregando insights...
            </div>
          ) : findings.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhum insight gerado ainda. Adicione concorrentes e clique em "Enqueue Enrichment" para gerar.
            </div>
          ) : (
            <div className="space-y-3">
              {findings.slice(0, 10).map((finding) => (
                <div key={finding.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
                  <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shrink-0",
                    finding.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    finding.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    finding.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  )}>
                    {finding.severity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{finding.title}</div>
                    {finding.description && <div className="text-xs text-slate-400 mt-1">{finding.description}</div>}
                    {finding.recommended_action && (
                      <div className="text-xs text-emerald-400 mt-2">→ {finding.recommended_action}</div>
                    )}
                    <div className="text-[10px] text-slate-600 mt-1">
                      {new Date(finding.detected_at).toLocaleString('pt-BR')} • {finding.finding_type}
                      {finding.confidence_score && ` • Confiança: ${(finding.confidence_score * 100).toFixed(0)}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            AI Jobs Queue ({jobs.filter(j => j.status === 'pending' || j.status === 'processing').length} ativos / {jobs.length} total)
          </h2>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhum job na fila.</div>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                  <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0",
                    job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    job.status === 'failed' ? 'bg-rose-500/20 text-rose-400' :
                    job.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-800 text-slate-400'
                  )}>
                    {job.status}
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="text-white font-medium">{job.job_type}</span>
                    {job.last_error && <span className="text-rose-400 text-xs ml-2">({job.last_error})</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 shrink-0">
                    {job.attempts}/{job.max_attempts} attempts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
