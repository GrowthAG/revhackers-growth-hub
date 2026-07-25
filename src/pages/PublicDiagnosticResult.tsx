import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, AlertTriangle, TrendingUp, Rocket, CheckCircle2, ShieldCheck, BarChart2, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function PublicDiagnosticResult() {
    const { id } = useParams();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResult = async () => {
            if (!id) return;

            try {
                const { data: diagRows, error: diagError } = await supabase
                    .rpc('get_diagnostico_public_result', { p_id: id });
                const diagData = Array.isArray(diagRows) ? diagRows[0] : diagRows;

                if (!diagError && diagData) {
                    const respostas = (diagData as any).respostas || {};
                    const details = respostas.result_details || {};

                    setResult({
                        id: (diagData as any).id,
                        created_at: (diagData as any).created_at,
                        empresa: respostas.lead_company || respostas.lead_name || 'Sua Empresa B2B',
                        tipo_diagnostico: respostas.diagnostic_type || (diagData as any).tipo || 'Diagnóstico de Growth 360°',
                        score: (diagData as any).score,
                        nivel_maturidade: respostas.maturity_level || details.title || details.level || 'Maturidade Intermediária',
                        detalhes_resultado: details,
                        respostas,
                    });
                    return;
                }

                // Fallback: legacy flow
                const { data, error } = await supabase
                    .from('rei_responses')
                    .select('*, project:rei_projects(*)')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                const project = (data as any).project as any;
                const responses = (data as any).responses as any;
                const details = responses?.result_details || {};

                setResult({
                    id: (data as any).id,
                    created_at: (data as any).created_at,
                    empresa: project?.client_name || 'Sua Empresa B2B',
                    tipo_diagnostico: responses?.diagnostic_type || (data as any).source || 'Diagnóstico de Growth 360°',
                    score: (data as any).total_score || 65,
                    nivel_maturidade: (data as any).maturity_level || 'Vazamento Sistêmico',
                    detalhes_resultado: details,
                    respostas: responses,
                });
            } catch (error) {
                console.error('Erro ao carregar resultado:', error);
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [id]);

    if (loading) {
        return (
            <PageLayout>
                <Section className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-[#00CC6A] border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-zinc-400 text-xs font-mono animate-pulse uppercase tracking-widest">
                            Processando Inteligência de Dashboard...
                        </div>
                    </div>
                </Section>
            </PageLayout>
        );
    }

    if (!result) {
        return (
            <PageLayout>
                <Section className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-4">Relatório não localizado</h2>
                        <Link to="/diagnostico" className="text-[#00CC6A] hover:underline text-xs font-bold uppercase tracking-wide">
                            Voltar para a Central de Diagnósticos
                        </Link>
                    </div>
                </Section>
            </PageLayout>
        );
    }

    const score = result.score || 60;
    const leakageEstimate = (100 - score) * 3450;

    // Data for Radar Chart (5 Dimensões de Growth B2B)
    const radarData = [
        { subject: 'Aquisição', A: Math.min(100, score + 10), fullMark: 100 },
        { subject: 'Conversão', A: Math.max(20, score - 15), fullMark: 100 },
        { subject: 'Retenção', A: Math.min(90, score + 5), fullMark: 100 },
        { subject: 'Processos', A: Math.max(10, score - 20), fullMark: 100 },
        { subject: 'ICP', A: Math.min(100, score + 15), fullMark: 100 },
    ];

    // Data for Projection Bar Chart
    const projectionData = [
        { name: 'Atual (Perdas)', valor: leakageEstimate / 1000 },
        { name: 'Com IA & RevOps', valor: (leakageEstimate * 0.15) / 1000 },
    ];

    return (
        <PageLayout>
            <div className="bg-zinc-950 text-white min-h-screen pt-24 pb-20 border-b border-zinc-800">
                <div className="max-w-6xl mx-auto px-6 space-y-10">

                    {/* Top Action Header */}
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                        <Link to="/diagnostico" className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft size={14} className="mr-1.5" /> Central de Diagnósticos
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#00CC6A] text-black">
                                RELATÓRIO PREDITIVO
                            </span>
                        </div>
                    </div>

                    {/* Dashboard Header */}
                    <div className="space-y-3">
                        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                            DIAGNÓSTICO OFICIAL • {result.empresa}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                            Maturidade de Growth & Unit Economics
                        </h1>
                        <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
                            Mapeamento de gargalos no funil de vendas, vazamentos financeiros e plano de correção operacional com Inteligência Artificial.
                        </p>
                    </div>

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Card 1: Score Gauge & Radar (Left 5 Cols) */}
                        <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                            <div className="space-y-4 text-center">
                                <span className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider">Índice Sintético de Crescimento</span>
                                <div className="relative flex items-center justify-center">
                                    <div className="text-7xl md:text-8xl font-extrabold tracking-tighter text-white">
                                        {score}
                                    </div>
                                    <span className="text-sm font-mono text-zinc-500 font-bold ml-1">/100</span>
                                </div>
                                <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-zinc-800 text-[#00CC6A] border border-zinc-700">
                                    {result.nivel_maturidade}
                                </span>
                            </div>

                            {/* Radar Chart */}
                            <div className="h-56 w-full pt-4">
                                <h4 className="text-center text-xs font-mono font-bold text-zinc-400 mb-2 uppercase">Equilíbrio por Dimensão</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#3f3f46" />
                                        <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                                        <Radar name="Pontuação" dataKey="A" stroke="#00CC6A" fill="#00CC6A" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Card 2: Financial Projection & Leakage (Right 7 Cols) */}
                        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-400" />
                                    <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                                        VAZAMENTO ANUAL ESTIMADO
                                    </span>
                                </div>

                                <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                    {leakageEstimate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} <span className="text-xs text-zinc-500 font-normal font-mono">/ano em margem perdida</span>
                                </div>

                                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed border-l-2 border-[#00CC6A] pl-4">
                                    {result.detalhes_resultado?.description || "Incapacidade de qualificar leads em tempo real e falta de automação no CRM geram desperdício contínuo de orçamento publicitário e tempo da equipe."}
                                </p>
                            </div>

                            {/* Bar Chart Projeção de Recuperação */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">Impacto da Correção em Milhares (R$ k)</h4>
                                <div className="h-36 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={projectionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                                            <YAxis type="category" dataKey="name" stroke="#71717a" tick={{ fill: '#ffffff', fontSize: 11 }} width={120} />
                                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} />
                                            <Bar dataKey="valor" fill="#00CC6A" radius={[0, 6, 6, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Action CTA */}
                            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-white block">Deseja estancar essa perda?</span>
                                    <span className="text-[11px] text-zinc-400 block font-normal">Agende uma auditoria técnica de 30 minutos com nossos especialistas.</span>
                                </div>

                                <Button
                                    onClick={() => window.open(`https://api.whatsapp.com/send?phone=5511999999999&text=Olá, vi o relatório de diagnósticos da ${result.empresa} com score ${score}. Gostaria de agendar o plano de correção.`, '_blank')}
                                    className="w-full sm:w-auto h-10 px-5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-lg gap-2 shrink-0 border border-white"
                                >
                                    <span>Agendar Diagnóstico</span>
                                    <Rocket size={14} className="text-zinc-950" />
                                </Button>
                            </div>

                        </div>
                    </div>

                    {/* Lower Grid: Checklist & Action Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-[#00CC6A]" />
                                <h4 className="text-xs font-bold text-white uppercase font-mono">1. Diagnóstico de Canais</h4>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Diversificar a matriz de risco para não depender 100% de indicação ou tráfego pago instável.
                            </p>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <BarChart2 size={16} className="text-[#00CC6A]" />
                                <h4 className="text-xs font-bold text-white uppercase font-mono">2. Automação no CRM</h4>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Implementar SLA de primeiro contato em até 5 minutos via WhatsApp com qualificação por IA.
                            </p>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-[#00CC6A]" />
                                <h4 className="text-xs font-bold text-white uppercase font-mono">3. CAC Teto & Break-even</h4>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Delimitar o custo limite de aquisição por cohort para garantir margem líquida positiva.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </PageLayout>
    );
}
