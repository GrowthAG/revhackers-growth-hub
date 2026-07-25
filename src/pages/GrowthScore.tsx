import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { DiagnosticActionSection } from '@/components/diagnostics/DiagnosticActionSection';
import { BenchmarkBar } from '@/components/diagnostics/BenchmarkBar';
import { DiagnosticBookingModal } from '@/components/diagnostics/DiagnosticBookingModal';
import { QuestionProgressBar } from '@/components/diagnostics/QuestionProgressBar';
import { ShareButtons } from '@/components/diagnostics/ShareButtons';
import { getDiagnosticInsights } from '@/utils/diagnosticMapping';
import SEO from '@/components/shared/SEO';
import { analyzeDiagnosticAI, DiagnosticAnalysisResult } from '@/api/diagnosticAnalysis';

const QUESTIONS = [
    {
        id: 1,
        question: "Se você tivesse uma varinha mágica hoje, qual problema resolveria primeiro no seu negócio?",
        options: [
            { label: "Operação (Tudo roda, mas eu não durmo - gargalo sou eu)", score: 0 },
            { label: "Reter (Fechamos bem, mas churn tá alto)", score: 5 },
            { label: "Converter (Entra lead bom, mas o time não fecha)", score: 10 },
            { label: "Tracionar aquisição (Não entra lead suficiente)", score: 20 }
        ],
        log: "O maior limitador de crescimento raramente é onde os leads entram, é onde eles se perdem."
    },
    {
        id: 2,
        question: "Qual é a sua real clareza financeira sobre o Custo de Aquisição (CAC) 'Teto' versus o CAC Ideal?",
        options: [
            { label: "Sei de cor por canais/cohort. Monitoramos o limite (Break-even) semanalmente", score: 20 },
            { label: "Sei o custo médio. Mas não delimitei o 'teto' onde começo a tomar prejuízo bruto", score: 10 },
            { label: "Olho majoritariamente para o Custo Por Lead (CPL) na camada de aquisição Ads", score: 5 },
            { label: "Ignoro Unit Economics isolado. Só meço de forma primária gastos vs receita total", score: 0 }
        ],
        log: "A ausência ou desconhecimento do CAC Teto (Break-even) é o que cega a alavancagem de orçamentos e mata caixas."
    },
    {
        id: 3,
        question: "Como está distribuída a sua matriz de risco em Vendas e Marketing?",
        options: [
            { label: "100% distribuída (Inbound, Outbound, Indicação, Ads)", score: 20 },
            { label: "Temos dois canais principais funcionando bem", score: 10 },
            { label: "Dependemos quase 100% de tráfego pago (Meta/Google)", score: 5 },
            { label: "Vivemos de indicação e network", score: 0 }
        ],
        log: "Depender de indicação não é estratégia de venda, é rezar pelo melhor."
    },
    {
        id: 4,
        question: "Se dobrarmos a sua entrada de leads amanhã, sua operação quebra?",
        options: [
            { label: "Não, os processos já estão montados e automatizados", score: 20 },
            { label: "Quebra a entrega/produto", score: 10 },
            { label: "Quebra o time comercial (muito processo manual)", score: 5 },
            { label: "Eu surto, porque eu mesmo faço as duas coisas", score: 0 }
        ],
        log: "Você não controla o que você não processualiza. Sem processo, você tem limite físico de caixa."
    },
    {
        id: 5,
        question: "Em relação ao seu Perfil Ideal de Cliente (ICP), quão refinada é a segmentação do seu go-to-market hoje?",
        options: [
            { label: "Tese cirúrgica. Nossa engenharia processual qualifica firmemente nicho, dor e tamanho", score: 20 },
            { label: "Saber qual o ICP sabemos, mas nossa cópia e mídia atraem frequentes curiosos genéricos", score: 10 },
            { label: "Nosso ICP é um tiro muito vasto (Ex: 'Atendemos MPEs e médias do Brasil todo')", score: 5 },
            { label: "Nenhuma barreira de entrada. Qualquer um que se interessar pelo produto, deixamos entrar", score: 0 }
        ],
        log: "Comunicação para todos ecoa para ninguém. Alvo amplo é ausência fatal de posicionamento em B2B."
    }
];

type Step = 'start' | 'questions' | 'lead-capture' | 'results';

const GrowthScore = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('questions');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showLog, setShowLog] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DiagnosticAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const insights = getDiagnosticInsights('growth', score);
    const currentQData = QUESTIONS[currentQ];

    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);

    const handleAnswer = (optionScore: number, optionIndex: number) => {
        setSelectedOption(optionIndex);
        setShowLog(true);

        const newScore = score + optionScore;
        setScore(newScore);
        const updatedAnswers = [...answers, optionScore];
        setAnswers(updatedAnswers);

        setTimeout(() => {
            setShowLog(false);
            setSelectedOption(null);
            if (currentQ < QUESTIONS.length - 1) {
                setCurrentQ(prev => prev + 1);
            } else {
                setStep('results');
            }
        }, 1500);
    };

    const handleFormSubmit = async (data: DiagnosticFormData) => {
        setIsSubmitting(true);
        try {
            const result = getResultMap(score);

            await submitPublicDiagnostic(
                { ...data, phone: '' },
                { answers, diagnostic_type: 'growth', source: 'growth-score', analysis: analysisResult },
                score,
                {
                    level: result.title,
                    description: result.msg,
                    action: "Diagnóstico de Growth",
                    color: "revgreen"
                },
                'score_captured'
            );

            setHasSubmittedLead(true);
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "DIAGNÓSTICO PROCESSADO",
                description: "Seu relatório oficial foi gerado."
            });
            
            setIsAnalyzing(true);
            setStep('results');
            analyzeDiagnosticAI('growth', answers, score)
                .then(result => setAnalysisResult(result))
                .catch(() => {}) 
                .finally(() => setIsAnalyzing(false));

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Erro de Processamento",
                description: "Tente novamente."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getResultMap = (s: number) => {
        if (s >= 80) return { title: "Blindagem Parcial", msg: "Operação sólida, mas subutilizando Automação." };
        if (s >= 50) return { title: "Vazamento Sistêmico", msg: "Processos manuais destruindo margem líquida." };
        return { title: "Hemorragia de Caixa", msg: "Estrutura comercial travada, alta perda de leads." };
    };

    const teaserScore = score;

    return (
        <>
        <SEO
            title="Score 360° - Diagnóstico de Growth B2B Gratuito"
            description="Faça o diagnóstico gratuito de Growth e descubra onde sua operação B2B está vazando receita. Análise com IA em 5 perguntas estratégicas."
            canonical="https://revhackers.com.br/score"
            breadcrumbs={[
                { name: "Home", url: "https://revhackers.com.br/" },
                { name: "Diagnósticos", url: "https://revhackers.com.br/diagnostico" },
                { name: "Score 360°", url: "https://revhackers.com.br/score" }
            ]}
        />
        <DiagnosticLayout
            title={step === 'results' ? "" : "Diagnóstico 360° de Growth"}
            subtitle={step === 'results' ? "" : "Identifique gargalos no seu funil de Marketing e Vendas em 1 minuto"}
            variant={step === 'results' ? 'dark' : 'light'}
            hideHeader={step === 'results'}
            centered={step === 'results'}
            headerVariant="default"
        >
            {step === 'results' && <div className="fixed inset-0 bg-black -z-50 pointer-events-none" />}
            
            {step === 'questions' && (
                <div className="w-full bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-6 md:p-10 space-y-8 animate-fade-in">
                    <QuestionProgressBar current={currentQ} total={QUESTIONS.length} variant="light" />

                    <div className="space-y-6 pt-2">
                        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
                            {currentQData.question}
                        </h2>

                        <div className="grid grid-cols-1 gap-3.5">
                            {currentQData.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    disabled={selectedOption !== null}
                                    onClick={() => handleAnswer(opt.score, idx)}
                                    className={`group relative flex items-center justify-between p-4 md:p-5 text-left transition-all duration-200 border rounded-xl shadow-xs ${selectedOption === idx
                                        ? "bg-zinc-950 text-white border-zinc-950 ring-2 ring-[#00CC6A]"
                                        : "bg-white border-zinc-200/80 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50/80 hover:shadow-sm"
                                        } ${selectedOption !== null && selectedOption !== idx ? "opacity-40" : "opacity-100"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-9 h-9 flex-shrink-0 flex items-center justify-center text-xs font-mono font-bold rounded-xl border transition-all duration-200 ${selectedOption === idx
                                            ? "bg-[#00CC6A] text-black border-[#00CC6A]"
                                            : "bg-zinc-100 border-zinc-200 text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950"
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-xs md:text-sm font-semibold leading-relaxed">
                                            {opt.label}
                                        </span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-opacity ${selectedOption === idx ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                        <ArrowRight size={16} className={selectedOption === idx ? "text-[#00CC6A]" : "text-zinc-400"} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {showLog && currentQData.log && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 text-xs font-medium text-zinc-600"
                            >
                                <span className="text-zinc-900 font-bold mr-2">Análise Técnica:</span>{currentQData.log}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {step === 'results' && (
                <>
                    {!hasSubmittedLead && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-500">
                            <div className="bg-black border border-zinc-900 p-8 w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 shadow-sm relative overflow-hidden my-auto max-h-[90vh]">
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 md:border-r border-zinc-900 md:pr-12">
                                    <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-1 border border-zinc-900">
                                        <div className={`w-1.5 h-1.5 ${teaserScore >= 50 ? 'bg-revgreen' : 'bg-zinc-400'} animate-pulse`}></div>
                                        <span className="text-2xs font-mono font-bold text-zinc-500 tracking-wider uppercase">Análise Finalizada</span>
                                    </div>

                                    <div className="relative">
                                        <div className="text-8xl md:text-9xl font-black text-white tracking-tighter leading-none shadow-black drop-shadow-2xl">{teaserScore}</div>
                                    </div>

                                    <h3 className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xs">
                                        O nível técnico da sua operação comercial projeta um vazamento de <span className="text-zinc-900 font-bold font-mono text-base whitespace-nowrap bg-zinc-100 px-2 py-1 border border-zinc-200">{( (100 - teaserScore) * 3450 ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano</span>.
                                    </h3>
                                </div>

                                <div className="flex-1 w-full max-w-md flex flex-col justify-center">
                                    <DiagnosticForm
                                        onSubmit={handleFormSubmit}
                                        isSubmitting={isSubmitting}
                                        title="Estancar Bleeding Cost"
                                        subtitle="Libere o acesso ao seu mapeamento financeiro."
                                        variant="dark"
                                        diagnosticType="Growth"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`space-y-0 transition-all duration-700 ${!hasSubmittedLead ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>
                        <div className="mb-12 text-center max-w-4xl mx-auto pt-8">
                            <div className="inline-flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1">
                                <span className="w-1.5 h-1.5 bg-revgreen shadow-[0_0_10px_#00CC6A]"></span>
                                <span className="text-xxs font-mono font-bold text-zinc-400 uppercase tracking-widest">Status: Finalizado</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                                Diagnóstico <span className="text-zinc-600">360</span>
                            </h1>
                            <p className="text-zinc-500 font-medium max-w-xl mx-auto">
                                Análise estrutural do gargalo de retenção, vendas e tracionamento.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                            <div className="lg:col-span-4">
                                <ScoreGauge
                                    score={score}
                                    label="Maturidade de Growth"
                                    description="Índice sintético baseado nas respostas declaradas."
                                />
                            </div>

                            <div className="lg:col-span-8 flex flex-col">
                                <div className="border border-zinc-900 p-8 bg-zinc-950 h-full flex flex-col justify-center">
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                                            <div className="w-6 h-6 border-2 border-revgreen border-t-transparent rounded-full animate-spin" />
                                            <div className="text-center space-y-1">
                                                <span className="block text-xs font-mono text-zinc-300 uppercase tracking-widest">IA Processando Análise</span>
                                            </div>
                                        </div>
                                    ) : analysisResult ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-xxs font-black uppercase tracking-[0.25em] text-red-500 bg-red-500/10 px-3 py-1.5 border border-red-500/20">
                                                    VAZAMENTO CRÍTICO DETECTADO
                                                </span>
                                            </div>
                                            <p className="text-white text-lg font-medium leading-relaxed mb-0">
                                                Sem Inteligência Artificial para qualificar e um CRM que obriga o follow-up, sua operação perde R$ {( (100 - score) * 3450 ).toLocaleString('pt-BR')} anualmente, no mínimo. {analysisResult.headline}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex flex-col justify-center py-8">
                                            <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest text-center">
                                                Análise será gerada após identificação
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] bg-white px-4 md:px-0 py-20 mt-16 border-t border-zinc-200">
                            <div className="max-w-6xl mx-auto space-y-16">
                                <BenchmarkBar userScore={score} type="growth" variant="light" />

                                <DiagnosticActionSection
                                    title="Estanque o Vazamento de Caixa."
                                    subtitle="Apenas 3 slots mensais abertos. Avaliaremos tecnicamente se sua operação é elegível para plugar a Inteligência Artificial no CRM e sanar essa perda."
                                    onCtaClick={() => setIsBookingModalOpen(true)}
                                />

                                <DiagnosticBookingModal
                                    isOpen={isBookingModalOpen}
                                    onClose={() => setIsBookingModalOpen(false)}
                                    diagnosticType="growth"
                                />

                                <div className="flex justify-center pt-8">
                                    <ShareButtons score={score} type="Growth" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DiagnosticLayout>
        </>
    );
};

export default GrowthScore;
