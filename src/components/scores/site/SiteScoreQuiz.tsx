import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { QuestionProgressBar } from '@/components/diagnostics/QuestionProgressBar';
import { ArrowRight, Command } from 'lucide-react';

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

  useEffect(() => {
    if (selectedOption !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const optionMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3 };

      if (key in optionMap) {
        const optIndex = optionMap[key];
        if (question.options[optIndex]) {
          onAnswer(question.options[optIndex].score, optIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, selectedOption, question]);

  return (
    <DiagnosticLayout 
      title="Diagnóstico de Site & CRO" 
      subtitle="Avaliação completa de performance, clareza de proposta de valor e fricção de conversão B2B" 
      variant="light" 
      centered={true}
    >
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-xl p-6 sm:p-10 space-y-8 relative overflow-hidden backdrop-blur-xl">
          <div className="space-y-4">
            <QuestionProgressBar current={currentQ} total={QUESTIONS.length} variant="light" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-snug">
                {question.question}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {question.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOption === idx;

                  return (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => onAnswer(opt.score, idx)}
                      className={`group relative flex items-center justify-between p-4 sm:p-5 text-left transition-all duration-200 border rounded-xl shadow-xs cursor-pointer ${
                        isSelected
                          ? "bg-white text-zinc-900 border-zinc-950 ring-2 ring-[#00CC6A]"
                          : "bg-white border-zinc-200/80 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50/50"
                      } ${selectedOption !== null && !isSelected ? "opacity-50" : "opacity-100"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-sans font-bold rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-[#00CC6A] text-black border-[#00CC6A]"
                            : "bg-zinc-100 border-zinc-200 text-zinc-600 group-hover:border-zinc-300 group-hover:text-zinc-900"
                        }`}>
                          {letter}
                        </div>
                        <span className="text-xs md:text-sm font-medium leading-relaxed">
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

              {showLog && question.log && (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 text-xs font-medium leading-relaxed flex items-start gap-2.5">
                  <span className="shrink-0 font-bold">💡 Insight:</span>
                  <span>{question.log}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6 border-t border-zinc-100 text-[11px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Command className="w-3 h-3" /> Pressione <kbd className="px-1 py-0.5 bg-zinc-100 rounded text-zinc-600 font-semibold">A</kbd> <kbd className="px-1 py-0.5 bg-zinc-100 rounded text-zinc-600 font-semibold">B</kbd> <kbd className="px-1 py-0.5 bg-zinc-100 rounded text-zinc-600 font-semibold">C</kbd> ou <kbd className="px-1 py-0.5 bg-zinc-100 rounded text-zinc-600 font-semibold">D</kbd> para responder
            </span>
            <span>100% Privado</span>
          </div>
        </div>
      </div>
    </DiagnosticLayout>
  );
};
