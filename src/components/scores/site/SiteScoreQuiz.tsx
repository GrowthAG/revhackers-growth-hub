import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { QuestionProgressBar } from '@/components/diagnostics/QuestionProgressBar';
import { ArrowRight } from 'lucide-react';

export const QUESTIONS = [
  {
    id: 1,
    question: "Qual é a velocidade percebida e tempo de carregamento da sua página comercial principal?",
    log: "Mais de 53% dos tomadores de decisão B2B abandonam páginas que demoram mais de 3 segundos para carregar.",
    options: [
      { label: "Carregamento instantâneo (< 1.5s), Core Web Vitals no verde no Google PageSpeed", score: 20 },
      { label: "Carrega bem no Desktop, mas tem lentidão perceptível no dispositivo móvel", score: 10 },
      { label: "Demora entre 3 a 5 segundos com travamentos de elementos visuais", score: 5 },
      { label: "Muito lento (> 5s). Imagens pesadas e scripts travando a renderização", score: 0 }
    ]
  },
  {
    id: 2,
    question: "Como está a experiência do seu site em dispositivos móveis (Mobile First)?",
    log: "Mais de 65% das pesquisas de descoberta B2B ocorrem via celular. Um site engessado no mobile destrói a conversão.",
    options: [
      { label: "100% responsivo, navegabilidade fluida e CTAs acessíveis com o polegar", score: 20 },
      { label: "Responsivo, mas textos ficam pequenos ou menus sanfonados falham", score: 10 },
      { label: "Difícil de navegar no celular. O usuário precisa dar zoom para ler propostas", score: 5 },
      { label: "Layout encolhido de desktop na tela do celular", score: 0 }
    ]
  },
  {
    id: 3,
    question: "Qual é a clareza da proposta de valor acima da dobra (Hero Section)?",
    log: "O visitante leva 3 segundos para decidir se permanece ou fecha a aba do seu site.",
    options: [
      { label: "Headline ultra-clara com dor específica do cliente B2B + CTA primário de alta conversão", score: 20 },
      { label: "Título genérico (ex: 'Transformamos seu negócio') que não explica o que fazemos exatamente", score: 10 },
      { label: "Texto técnico demais ou focado apenas no produto, e não no problema do cliente", score: 5 },
      { label: "Sem proposta clara de valor. Apresenta apenas institucional vago", score: 0 }
    ]
  },
  {
    id: 4,
    question: "Como está estruturada a sua infraestrutura de rastreamento e analytics (Pixels & GTM)?",
    log: "Falta de rastreamento de conversão cega os algoritmos de mídia paga e invalida o ROI de tráfego.",
    options: [
      { label: "Google Tag Manager configurado, API de Conversão (Meta/LinkedIn) e eventos de Lead ativos", score: 20 },
      { label: "Pixels básicos instalados, mas sem mensurar cliques em botões ou formulários enviados", score: 10 },
      { label: "Apenas Google Analytics padrão sem configuração de metas de conversão", score: 5 },
      { label: "Não temos pixels de rastreamento nem governança de dados", score: 0 }
    ]
  },
  {
    id: 5,
    question: "Qual é a fricção do seu formulário de captura e mecanismo de conversão?",
    log: "Formulários longos e sem microcopy persuasiva reduzem drasticamente o volume de MQLs.",
    options: [
      { label: "Formulário curto com validação em tempo real, CNPJ enriquecido e confirmação instantânea", score: 20 },
      { label: "Formulário funcional, mas pede muitos campos desnecessários no primeiro contato", score: 10 },
      { label: "Apenas link direto para WhatsApp sem captura prévia de dados no formulário", score: 5 },
      { label: "Formulário quebra ou envia dados para email genérico (contato@empresa.com)", score: 0 }
    ]
  },
  {
    id: 6,
    question: "O seu site possui prova social B2B e depoimentos de empresas relevantes?",
    log: "Sem prova social de clientes reais, a taxa de conversão em vendas B2B cai até 70%.",
    options: [
      { label: "Logos de grandes empresas, cases com métricas auditadas e depoimentos de executivos", score: 20 },
      { label: "Alguns logos de clientes, mas sem cases detalhados ou depoimentos com foto/cargo", score: 10 },
      { label: "Depoimentos genéricos sem nome da empresa ou identificação do autor", score: 5 },
      { label: "Sem nenhuma prova social ou logos de clientes", score: 0 }
    ]
  }
];

interface SiteScoreQuizProps {
  currentQ: number;
  selectedOption: number | null;
  showLog: boolean;
  onAnswer: (score: number, idx: number) => void;
}

export const SiteScoreQuiz = ({ currentQ, selectedOption, showLog, onAnswer }: SiteScoreQuizProps) => {
  const question = QUESTIONS[currentQ];

  return (
    <DiagnosticLayout 
      title="Diagnóstico de Site & Landing Page" 
      subtitle="Auditoria de CRO e Performance" 
      variant="light" 
      centered={true}
    >
      <div className="max-w-3xl mx-auto w-full py-6 md:py-10 px-4 md:px-0">
        <QuestionProgressBar currentStep={currentQ + 1} totalSteps={QUESTIONS.length} />

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 md:p-12 shadow-xs mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-950 tracking-tight leading-snug">
                {question.question}
              </h2>

              <div className="grid grid-cols-1 gap-3.5 w-full">
                {question.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOption === idx;

                  return (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => onAnswer(opt.score, idx)}
                      className={`group relative flex items-center justify-between p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#00CC6A] bg-[#00CC6A]/10 shadow-sm ring-1 ring-[#00CC6A]"
                          : "border-zinc-200/90 bg-zinc-50/50 hover:bg-zinc-100/70 hover:border-zinc-300 text-zinc-900"
                      } ${selectedOption !== null && !isSelected ? "opacity-50" : "opacity-100"}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#00CC6A] text-zinc-950"
                            : "bg-zinc-200/80 text-zinc-700 group-hover:bg-zinc-300"
                        }`}>
                          {letter}
                        </span>
                        <span className="text-sm md:text-base font-semibold text-zinc-900 leading-snug">
                          {opt.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-900 transition-colors ml-4 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{letter}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showLog && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-2"
                  >
                    <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 text-xs font-medium leading-relaxed flex items-start gap-2.5">
                      <span className="shrink-0 font-bold">💡 Insights:</span>
                      <span>{question.log}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DiagnosticLayout>
  );
};
