import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { fadeInSlideUp } from './SiteScoreAnimations';

export const QUESTIONS = [
  {
    id: 1,
    question: "Velocidade de Carregamento (Percepção do Usuário)",
    log: "Mais de 50% dos usuários B2B abandonam sites que demoram mais de 3 segundos para carregar o conteúdo principal.",
    options: [
      { label: "Quase instantâneo. Sem tempo de tela preta/branca.", score: 34 },
      { label: "Demora alguns segundos para renderizar completamente.", score: 15 },
      { label: "Muito lento. Às vezes o usuário precisa atualizar a página.", score: 5 },
      { label: "Carregamento instável ou frequentemente quebrado.", score: 0 }
    ]
  },
  {
    id: 2,
    question: "Otimização para Dispositivos Móveis (Mobile First)",
    log: "A maioria das pesquisas de descoberta B2B agora ocorre via celular. Um site engessado afugenta tomadores de decisão.",
    options: [
      { label: "Experiência perfeita. Design fluido, botões acessíveis e navegação fácil no celular.", score: 33 },
      { label: "Responsivo, mas o texto fica pequeno e alguns elementos quebram.", score: 15 },
      { label: "Difícil de usar. O usuário precisa dar zoom para ler.", score: 5 },
      { label: "Versão Desktop encolhida na tela do celular.", score: 0 }
    ]
  },
  {
    id: 3,
    question: "Rastreamento e Governança de Dados (Analytics & Pixels)",
    log: "Falta de rastreamento cega sua operação de marketing, impedindo a mensuração de ROI.",
    options: [
      { label: "GTM implementado, tags disparando corretamente sem duplicidade e compliance LGPD/GDPR.", score: 33 },
      { label: "Tags instaladas, mas com incerteza sobre a precisão dos dados recebidos.", score: 15 },
      { label: "Apenas Google Analytics cru. Pixel do Meta sem configuração avançada.", score: 5 },
      { label: "Não fazemos rastreio inteligente do tráfego.", score: 0 }
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
    <DiagnosticLayout title="Diagnóstico Site" subtitle="Em análise" variant="light" centered={true} hideHeader={false} headerVariant="default">
      <div className="max-w-3xl mx-auto flex flex-col items-center w-full min-h-[60vh] justify-center px-4 md:px-0">
        <div className="w-full flex items-center justify-between mb-8 border-b border-zinc-100 pb-2">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-xs font-sans font-medium text-zinc-500 ">Protocolo de Diagnóstico</span>
          </div>
          <span className="text-xs font-sans font-medium text-zinc-500">0{currentQ + 1} / 0{QUESTIONS.length}</span>
        </div>

        <div className="w-full animate-fade-in flex flex-col items-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              {...fadeInSlideUp}
              className="w-full flex flex-col items-center space-y-6"
            >
              <h2 className="text-3xl md:text-2xl md:text-3xl font-bold text-black leading-tight text-center max-w-2xl">
                {question.question}
              </h2>

              <div className="grid grid-cols-1 gap-3 w-full max-w-xl">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => onAnswer(opt.score, idx)}
                    className={`group relative flex items-center gap-5 p-5 text-left transition-all duration-300 border ${
                      selectedOption === idx
                        ? "bg-white text-zinc-900 border-zinc-200 scale-[1.01]"
                        : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50"
                    } ${selectedOption !== null && selectedOption !== idx ? "opacity-40" : "opacity-100"}`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center text-xs font-sans font-bold border rounded transition-colors ${
                      selectedOption === idx
                        ? "bg-white text-zinc-900 border-white"
                        : "bg-zinc-100 border-zinc-200 text-zinc-500 group-hover:border-zinc-400 group-hover:text-zinc-900"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm font-medium">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {showLog && (
                  <motion.div
                    {...fadeInSlideUp}
                    className="absolute -bottom-32 left-0 right-0 mx-auto w-full max-w-xl text-center"
                  >
                    <p className="text-xs font-medium text-zinc-500 bg-zinc-50 px-4 py-2 inline-block border border-zinc-100">
                      <span className="text-black font-bold mr-2">Info:</span>{question.log}
                    </p>
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
