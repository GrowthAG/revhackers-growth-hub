import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';

interface SiteScoreResultDashboardProps {
  viewMode: 'mobile' | 'desktop';
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  currentScore: number;
  psiResults: any;
  psiSeoScore: number | null;
}

export const SiteScoreResultDashboard = ({
  viewMode,
  setViewMode,
  currentScore,
  psiResults,
  psiSeoScore
}: SiteScoreResultDashboardProps) => {
  const currentData = viewMode === 'mobile' ? psiResults?.mobile : psiResults?.desktop;

  return (
    <>
      <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-4 bg-white border border-zinc-200 px-3 py-1">
          <span className="w-1.5 h-1.5 bg-revgreen shadow-[0_0_10px_#00CC6A]"></span>
          <span className="text-xs font-sans font-bold text-zinc-500 ">Status: Finalizado</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">
          Diagnóstico <span className="text-zinc-600">Site</span>
        </h1>
        <p className="text-zinc-500 font-medium max-w-xl mx-auto">
          Análise técnica completa dos vetores de crescimento e infraestrutura.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-700">
        <div className="lg:col-span-4">
          <ScoreGauge
            score={currentScore}
            label={`Performance ${viewMode === 'mobile' ? 'Mobile' : 'Desktop'}`}
            description="Google PageSpeed Insights"
          />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-px bg-zinc-50 border border-zinc-200 overflow-hidden">
          <div className="bg-white p-6 border-b border-zinc-200 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${viewMode === 'mobile' ? 'bg-revgreen' : 'bg-zinc-400'}`} />
              <span className="text-xs font-sans font-bold text-zinc-500 ">
                INFRAESTRUTURA // WEB VITALS
              </span>
            </div>

            <div className="flex bg-white p-1 border border-zinc-200">
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1 text-xs font-bold transition-all ${viewMode === 'mobile' ? 'bg-zinc-50 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-600'}`}
              >
                Mobile
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1 text-xs font-bold transition-all ${viewMode === 'desktop' ? 'bg-zinc-50 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-600'}`}
              >
                Desktop
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white">
            <MetricCard
              label="LCP (Carregamento)"
              value={psiResults?.error ? "ERRO API" : (currentData?.vitals?.lcp || "N/A")}
              description={psiResults?.error ? String(psiResults.error).substring(0, 30) : "Largest Contentful Paint"}
              status={psiResults?.error ? 'critical' : !currentData?.vitals?.lcp || currentData.vitals.lcp === 'N/A' ? 'warning' : parseFloat(currentData.vitals.lcp) > 2.5 ? 'critical' : 'success'}
              variant="dark"
            />
            <MetricCard
              label="Crux Assessment"
              value={psiResults?.crux?.assessment || "Indisponível"}
              description="Dados de Usuários Reais"
              status={psiResults?.crux?.assessment === 'PASS' ? 'success' : 'warning'}
            />
            <MetricCard
              label="SEO Técnico"
              value={psiSeoScore !== null ? `${psiSeoScore}/100` : "PENDENTE"}
              description="Search Engine Opt."
              status={psiSeoScore && psiSeoScore >= 90 ? 'success' : 'warning'}
              variant="dark"
            />
            <MetricCard
              label="Segurança (SSL)"
              value={psiResults?.compliance?.security ? "Protegido" : "Vulnerável"}
              description="Protocolo HTTPS"
              status={psiResults?.compliance?.security ? 'success' : 'critical'}
              variant="dark"
            />
            <MetricCard
              label="Conformidade (Privacy)"
              value={psiResults?.compliance?.lgpd ? "Detectada" : "Ausente"}
              description="Scripts de Consentimento"
              status={psiResults?.compliance?.lgpd ? 'success' : 'warning'}
              variant="dark"
            />
            <MetricCard
              label="UX / Core Vitals"
              value={currentScore >= 90 ? "Otimizado" : currentScore >= 50 ? "Regular" : "Crítico"}
              description="Experiência do Usuário"
              status={currentScore >= 90 ? 'success' : currentScore >= 50 ? 'warning' : 'critical'}
              variant="dark"
            />
          </div>

          <div className="bg-white p-6 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-xs font-sans text-zinc-500 block mb-4">Clareza Estratégica (SEO)</span>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-zinc-600 block">Title Tag</span>
                  <p className="text-sm font-bold text-zinc-900 line-clamp-1">{psiResults?.seoMetadata?.title}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-600 block">Meta Description</span>
                  <p className="text-xs text-zinc-500 line-clamp-2 italic">"{psiResults?.seoMetadata?.description}"</p>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs font-sans text-zinc-500 block mb-4">Tecnologias Identificadas</span>
              <div className="flex flex-wrap gap-2">
                {[...(psiResults?.techStack || []), ...(psiResults?.pixels || [])].map((tech, i) => (
                  <span key={i} className="text-xs font-bold bg-white text-zinc-600 border border-zinc-200 px-3 py-1">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
