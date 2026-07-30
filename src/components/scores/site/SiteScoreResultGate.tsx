import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';

interface SiteScoreResultGateProps {
  finalScore: number;
  psiResults: any;
  hasSubmittedLead: boolean;
  onSubmit: (data: DiagnosticFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const SiteScoreResultGate = ({
  finalScore,
  psiResults,
  hasSubmittedLead,
  onSubmit,
  isSubmitting
}: SiteScoreResultGateProps) => {
  if (hasSubmittedLead) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white border border-zinc-200 p-8 w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 shadow-sm relative my-auto max-h-[90vh]">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 md:border-r border-zinc-200 md:pr-12">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 border border-zinc-200">
            <div className={`w-1.5 h-1.5 rounded-full ${psiResults?.mobile?.vitals?.score >= 70 ? 'bg-revgreen' : 'bg-red-500'} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
            <span className="text-xs font-sans font-bold text-zinc-500 ">Análise Finalizada</span>
          </div>

          <div className="relative">
            <div className="text-3xl font-bold text-zinc-900 leading-none shadow-black drop-shadow-2xl">{finalScore}</div>
          </div>

          <h3 className="text-sm font-medium text-zinc-500 leading-relaxed max-w-xs">
            {finalScore >= 90 ? (
              <>Seu site está <span className="text-revgreen font-bold">muito bem otimizado</span>. Confira os detalhes técnicos completos.</>
            ) : finalScore >= 70 ? (
              <>Seu site está em bom estado, mas ainda há <span className="text-yellow-400 font-bold">pequenas otimizações</span> cruciais.</>
            ) : (
              <>Detectamos oportunidades de <span className="text-revgreen font-bold">otimização técnica</span> crítica na sua infraestrutura.</>
            )}
          </h3>
        </div>

        <div className="flex-1 w-full max-w-md flex flex-col justify-center">
          <DiagnosticForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            title="Receber Relatório"
            subtitle="Obtenha o plano de ação técnico."
            variant="dark"
            diagnosticType="Site"
            showLinkedin={false}
          />
        </div>
      </div>
    </div>
  );
};
