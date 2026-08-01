import { motion } from 'framer-motion';
import { Zap, Search, Terminal, Globe, ArrowRight, Trophy } from 'lucide-react';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { progressWidthAnimation } from './SiteScoreAnimations';

interface SiteScoreHeroProps {
  step: 'url-input' | 'analyzing';
  targetUrl: string;
  setTargetUrl: (url: string) => void;
  competitorUrls: string[];
  setCompetitorUrls: (urls: string[]) => void;
  onStart: () => void;
  progress: number;
  loadingStatus: string;
}

export const SiteScoreHero = ({
  step,
  targetUrl,
  setTargetUrl,
  competitorUrls,
  setCompetitorUrls,
  onStart,
  progress,
  loadingStatus
}: SiteScoreHeroProps) => {
  if (step === 'analyzing') {
    return (
      <DiagnosticLayout title="Analisando" subtitle="Processando..." variant="light" centered={true} hideHeader={false} headerVariant="default">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full space-y-12">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-zinc-100 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold font-sans min-w-[3ch] text-center">{progress}%</span>
            </div>
            <div className="space-y-4">
              <span className="text-xs font-sans text-zinc-500 font-medium block">{loadingStatus}</span>
              <div className="w-full max-w-xs mx-auto bg-zinc-100 h-[2px] relative overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 bg-white h-full"
                  {...progressWidthAnimation}
                />
              </div>
            </div>
          </div>
        </div>
      </DiagnosticLayout>
    );
  }

  return (
    <DiagnosticLayout
      title="Diagnóstico Site"
      subtitle="Veja como esta a performance do seu site e entenda os pontos de melhoria"
      variant="light"
      centered={true}
      hideHeader={false}
      headerVariant="default"
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center w-full justify-center animate-fade-in">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 md:p-10 relative overflow-hidden group w-full text-center hover:border-zinc-300 transition-colors shadow-xs">
          <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-6">
            {/* URL Input Action Area */}
            <div className="w-full space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="flex items-center flex-1 bg-white border border-zinc-200 rounded-lg overflow-hidden focus-within:border-zinc-950">
                  <span className="hidden sm:flex items-center px-3 text-xs font-medium text-zinc-400 bg-zinc-50 border-r border-zinc-200 select-none whitespace-nowrap h-11 gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    https://
                  </span>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="seu-site.com"
                    className="flex-1 bg-transparent border-none text-zinc-900 h-11 px-4 focus:ring-0 outline-none text-sm font-semibold placeholder:text-zinc-400"
                  />
                </div>
                <button
                  onClick={onStart}
                  disabled={!targetUrl}
                  className="bg-zinc-950 text-white hover:bg-zinc-800 h-11 px-6 rounded-lg font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  Iniciar Análise <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-400 font-normal">
                *Iniciaremos a análise técnica de infraestrutura e performance.
              </p>

              {/* Competitor URLs */}
              <div className="mt-8 w-full border-t border-zinc-100 pt-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-800">Benchmark Competitivo (Opcional)</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">Compare sua performance contra até 2 concorrentes usando dados do Chrome.</p>
                <div className="space-y-2">
                  {competitorUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-500 w-24">Concorrente {idx + 1}</span>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...competitorUrls];
                          newUrls[idx] = e.target.value;
                          setCompetitorUrls(newUrls);
                        }}
                        placeholder="concorrente.com"
                        className="flex-1 bg-white border border-zinc-200 rounded-lg text-zinc-900 h-10 px-3 text-xs focus:ring-0 outline-none focus:border-zinc-950 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-zinc-100 pt-12">
              <div className="flex flex-col items-center justify-center gap-4 group/item">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 group-hover/item:border-black group-hover/item:bg-white group-hover/item:text-zinc-900 transition-all duration-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-sans font-bold text-zinc-500 ">01 // Speed</span>
                  <span className="text-sm font-bold text-zinc-900">Performance</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 group/item">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 group-hover/item:border-black group-hover/item:bg-white group-hover/item:text-zinc-900 transition-all duration-500">
                  <Search className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-sans font-bold text-zinc-500 ">02 // SEO</span>
                  <span className="text-sm font-bold text-zinc-900">Visibilidade</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 group/item">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 group-hover/item:border-black group-hover/item:bg-white group-hover/item:text-zinc-900 transition-all duration-500">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-sans font-bold text-zinc-500 ">03 // Tech</span>
                  <span className="text-sm font-bold text-zinc-900">Conformidade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DiagnosticLayout>
  );
};
