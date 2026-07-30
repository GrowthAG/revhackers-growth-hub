import { DiagnosticActionSection } from '@/components/diagnostics/DiagnosticActionSection';
import { DiagnosticBookingModal } from '@/components/diagnostics/DiagnosticBookingModal';

interface SiteScoreResultInsightsProps {
  score: number;
  currentScore: number;
  psiResults: any;
  insights: { action: string; description: string };
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (isOpen: boolean) => void;
}

export const SiteScoreResultInsights = ({
  score,
  currentScore,
  psiResults,
  insights,
  isBookingModalOpen,
  setIsBookingModalOpen
}: SiteScoreResultInsightsProps) => {
  return (
    <>
      <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] bg-white text-zinc-900 px-4 md:px-0 py-20 mt-32 border-t border-zinc-200 animate-fade-in duration-1000 delay-500">
        <div className="max-w-6xl mx-auto space-y-32">
          <section>
            <div className="space-y-6 mb-20">
              <p className="text-[#00CC6A] text-xs font-semibold ">
                AUDITORIA_ESTRATÉGICA
              </p>
              <h2 className="text-3xl md:text-2xl md:text-3xl font-bold text-black leading-none italic">
                Sua infraestrutura <span className="text-zinc-500">trabalha para você?</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-6 border-l border-zinc-200 pl-8">
                <h4 className="text-sm font-bold text-black flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-white" />
                  Perspectiva Técnica
                </h4>
                <p className="text-black text-base leading-relaxed font-semibold">
                  {psiResults?.error
                    ? "Devido às camadas de segurança do seu servidor (Kasada/Akamai), nossa análise automática foi parcialmente limitada. " +
                      (score >= 90
                        ? "Com base no seu score de " + score + "%, sua infraestrutura está operando em alta performance. Continue monitorando para manter a excelência."
                        : score >= 50
                        ? "Com base no seu score de " + score + "%, sua infraestrutura apresenta oportunidades de otimização que podem melhorar seu CAC."
                        : "Com base no seu score de " + score + "%, detectamos que sua infraestrutura é o principal gargalo da sua operação hoje.")
                    : insights.description}
                </p>
              </div>

              <div className="space-y-6 border-l border-zinc-200 pl-8">
                <h4 className="text-sm font-bold text-black flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-white" />
                  Plano de Ação
                </h4>
                <p className="text-black text-base leading-relaxed font-semibold">
                  Sua prioridade técnica imediata é: <strong className="text-black bg-zinc-200 px-1">{insights.action}</strong>.
                  {score >= 90
                    ? " Mantenha o monitoramento ativo para preservar esta vantagem competitiva."
                    : " Ignorar estes ajustes resulta em perda direta de tráfego qualificado por fricção técnica."}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="space-y-6 mb-20 text-right">
              <p className="text-[#00CC6A] text-xs font-semibold ">
                MARKET_INTELLIGENCE
              </p>
              <h2 className="text-3xl md:text-2xl md:text-3xl font-bold text-black leading-none italic">
                Oportunidades <span className="text-zinc-500">Táticas Encontradas.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-zinc-50 border border-zinc-100 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-sans text-zinc-500 block mb-4">Escalabilidade</span>
                  <h4 className="text-xl font-bold text-black mb-4 ">Performance Proativa</h4>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                    Com um score de {currentScore}%, sua infraestrutura {currentScore > 80 ? "está pronta para suportar escalas agressivas de mídia paga." : "apresenta gargalos que aumentarão drasticamente o seu CAC se tentar escalar agora."}
                  </p>
                </div>
                <div className="text-xs font-bold text-black flex items-center gap-2 ">
                  Status: {currentScore > 80 ? "Verde (Go Scale)" : "Amarelo (Fix First)"}
                </div>
              </div>

              <div className="p-8 bg-zinc-50 border border-zinc-100 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-sans text-zinc-500 block mb-4">Autoridade</span>
                  <h4 className="text-xl font-bold text-black mb-4 ">Clareza Semântica</h4>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                    O uso de {(psiResults?.techStack || []).length} tecnologias e {psiResults?.seoMetadata?.title ? "metadados presentes" : "metadados ausentes"} indica uma operação {(psiResults?.techStack || []).length > 5 ? "robusta" : "em estágio inicial"} de marketing digital.
                  </p>
                </div>
                <div className="text-xs font-bold text-black flex items-center gap-2 ">
                  Nível: {(psiResults?.techStack || []).length > 5 ? "Avançado" : "Semente"}
                </div>
              </div>

              <div className="p-8 bg-zinc-50 border border-zinc-100 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-sans text-zinc-500 block mb-4">Conversão</span>
                  <h4 className="text-xl font-bold text-black mb-4 ">Mobile First Index</h4>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                    Sua pontuação mobile de {psiResults?.mobile?.vitals?.score || 0}% é o principal fator de retenção. {(psiResults?.mobile?.vitals?.score || 0) > 90 ? "Parabéns pela otimização extrema." : "Cada 1% de melhoria aqui reflete em aproximadamente 2% de redução no bounce rate."}
                  </p>
                </div>
                <div className="text-xs font-bold text-black flex items-center gap-2 ">
                  Prioridade: {(psiResults?.mobile?.vitals?.score || 0) < 50 ? "Crítica" : "Otimização"}
                </div>
              </div>
            </div>
          </section>

          <DiagnosticActionSection
            title="Destrave sua Performance."
            subtitle="Agende um diagnóstico gratuito com um especialista técnico para desenhar seu plano de ação."
            onCtaClick={() => setIsBookingModalOpen(true)}
          />

          <DiagnosticBookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            diagnosticType="site"
          />

          <div className="mt-8 mb-16 flex flex-col items-center justify-center text-center px-4">
            <span className="text-xs font-sans text-zinc-500 mb-4">MUITO CEDO PARA UMA DEEP-DIVE CALL?</span>
            <button onClick={() => window.open('https://revhackers.com.br/')} className="text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 px-6 py-3 hover:bg-zinc-50 transition-colors ">Baixe o Checklist de Conversão (Grátis)</button>
          </div>
        </div>
      </div>
    </>
  );
};
