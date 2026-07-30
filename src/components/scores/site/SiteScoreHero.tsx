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
      <div className="max-w-4xl mx-auto flex flex-col items-center w-full min-h-[60vh] justify-center animate-fade-in">
        <div className="bg-white border border-zinc-200 p-12 mb-8 relative overflow-hidden group w-full text-center hover:border-zinc-300 transition-colors shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-105 duration-1000">
            <Zap className="w-64 h-64 text-black rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
            {/* URL Input Action Area */}
            <div className="mb-16 w-full">
              <div className="flex flex-col md:flex-row gap-0 w-full border border-zinc-200 bg-white group-hover:border-zinc-300 transition-colors overflow-hidden shadow-sm mb-4">
                <span className="hidden md:flex items-center px-6 font-sans text-xs text-zinc-500 bg-zinc-50 border-r border-zinc-200 select-none gap-2">
                  <Globe className="w-4 h-4" />
                  https://
                </span>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="seu-site.com"
                  className="flex-1 bg-transparent border-none text-black h-16 px-6 focus:ring-0 outline-none font-bold text-lg placeholder:text-zinc-600"
                />
                <button
                  onClick={onStart}
                  disabled={!targetUrl}
                  className="bg-white text-zinc-900 px-8 h-16 font-bold text-xs hover:bg-zinc-50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 min-w-[140px]"
                >
                  INICIAR <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-zinc-500 font-sans">
                *Iniciaremos a análise técnica de infraestrutura
              </p>

              {/* Competitor URLs */}
              <div className="mt-8 w-full border-t border-zinc-100 pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-500 ">Benchmark Competitivo (Opcional)</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">Compare sua performance contra até 2 concorrentes usando dados reais do Chrome.</p>
                <div className="space-y-3">
                  {competitorUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-sans text-zinc-500 w-24">Concorrente {idx + 1}</span>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...competitorUrls];
                          newUrls[idx] = e.target.value;
                          setCompetitorUrls(newUrls);
                        }}
                        placeholder="concorrente.com"
                        className="flex-1 bg-zinc-50 border border-zinc-100 text-black h-10 px-4 text-sm focus:ring-0 outline-none focus:border-zinc-300"
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
