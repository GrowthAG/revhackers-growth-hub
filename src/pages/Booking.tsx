
import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { CheckCircle, Clock, FileText, Zap } from 'lucide-react';
import SEO from '@/components/shared/SEO';

const BOOKING_BASE_URL = "https://pages.revhackers.com.br/widget/booking/frZ10gIRdS8iNvtlGq3q";

const nextSteps = [
  {
    icon: Clock,
    title: 'Confirmação em < 2h',
    desc: 'Você recebe um email de confirmação com as instruções de preparação.',
  },
  {
    icon: FileText,
    title: 'Diagnóstico Prévio',
    desc: 'Nossa equipe analisa sua operação antes da reunião para chegar com perguntas cirúrgicas.',
  },
  {
    icon: Zap,
    title: 'Plano de Ação no mesmo dia',
    desc: 'Na reunião, você sai com o mapa dos principais vazamentos da sua operação e os próximos passos.',
  },
];

const BookingPage = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Load GHL form embed script
    const scriptId = "revhackers-booking-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://pages.revhackers.com.br/js/form_embed.js";
      script.type = "text/javascript";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <PageLayout>
      <SEO
        title="Agendar Auditoria de Receita"
        description="Agende uma auditoria técnica com a RevHackers para mapear vazamentos na sua operação B2B."
        canonical="https://revhackers.com.br/booking"
      />
      {/* Hero Section (BLACK HERO STANDARD) */}
      <section className="relative py-20 md:py-28 bg-black border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-5">
          <h1 className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight text-center max-w-3xl mx-auto">
            Auditoria de Vazamento de Receita <span className="text-[#00CC6A]">& Engenharia B2B</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto text-center">
            Sessão técnica de 30 minutos para mapear onde sua operação perde receita e desenhar o roadmap de escala com IA e RevOps.
          </p>
        </div>
      </section>

      {/* Main Section — Fundo 100% Branco Puro e Minimalista */}
      <section className="py-16 sm:py-20 bg-white text-zinc-900 border-b border-zinc-200/80">
        <div className="w-full max-w-5xl mx-auto px-6">

          {/* Layout 2 colunas: info ultra-clean + calendário */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">

            {/* Coluna esquerda: contexto minimalista sem poluição */}
            <div className="lg:col-span-2 flex flex-col justify-center space-y-8">

              {/* Pré-Requisitos em Lista Limpa */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-950 block">
                  Pré-Requisitos:
                </span>
                <ul className="space-y-3 text-xs sm:text-sm">
                  <li className="flex items-center gap-2.5 text-zinc-900 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 shrink-0" />
                    Operação B2B (High Ticket) tracionando
                  </li>
                  <li className="flex items-center gap-2.5 text-zinc-900 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 shrink-0" />
                    Presença do Fundador / C-Level na sessão
                  </li>
                </ul>
              </div>

              {/* Métrica Única de Impacto */}
              <div className="border-t border-zinc-200/80 pt-6 space-y-1">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Resultado Auditado Misto</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">+R$ 480.000</p>
                <p className="text-xs text-zinc-500">em receita recuperada nas últimas auditorias.</p>
              </div>

            </div>

            {/* Coluna direita: calendário */}
            <div className="lg:col-span-3 bg-white overflow-hidden min-h-[680px] border border-zinc-200/80 rounded-xl shadow-xs">
              <iframe
                src={BOOKING_BASE_URL}
                style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '680px', background: '#ffffff' }}
                scrolling="no"
                id="frZ10gIRdS8iNvtlGq3q_1775165036136"
                title="Auditoria de Receita"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          </div>

        </div>
      </section>
    </PageLayout>
  );
};

export default BookingPage;
