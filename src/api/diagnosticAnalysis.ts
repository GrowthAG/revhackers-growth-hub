import { supabase } from '@/integrations/supabase/client';
import { aiGcpAdapter } from '@/api/adapters/ai-gcp';

export interface DiagnosticAnalysisResult {
    archetype: string;
    headline: string;
    strengths: string[];
    gaps: string[];
    immediateAction: string;
}

type DiagnosticType = 'growth' | 'revenue';

const DIMENSION_LABELS: Record<DiagnosticType, string[]> = {
    growth: ['Captacao', 'Ativacao', 'Retencao', 'Receita', 'Referencia'],
    revenue: ['Diagnostico', 'Estrategia', 'Execucao', 'Metricas', 'Time'],
};

interface GcpAnalysisPayload {
    archetype?: string;
    headline?: string;
    executive_summary?: string;
    strengths?: string[];
    gaps?: string[];
    top_3_priorities?: string[];
    immediateAction?: string;
}

function asPayload(value: unknown): GcpAnalysisPayload {
    if (value && typeof value === 'object') {
        const wrapper = value as { result?: unknown };
        const inner = wrapper.result && typeof wrapper.result === 'object' ? wrapper.result : value;
        if (inner && typeof inner === 'object') {
            return inner as GcpAnalysisPayload;
        }
    }
    return {};
}

export async function analyzeDiagnosticAI(
    type: DiagnosticType,
    answers: number[],
    totalScore: number
): Promise<DiagnosticAnalysisResult> {
    const fallbackMock = () => getMockAnalysis(type, answers, totalScore);

    try {
        const { data, error } = await aiGcpAdapter.analyzeDiagnostic<unknown>(
            { type, answers, totalScore },
            { timeoutMs: 30_000 },
        );

        if (error || !data) {
            console.warn('[diagnosticAnalysis] GCP indisponivel, fallback Supabase:', error?.message);
            const fallback = await fallbackToSupabase(type, answers, totalScore);
            return fallback ?? fallbackMock();
        }

        const obj = asPayload(data);
        const strengths: string[] = Array.isArray(obj.strengths)
            ? obj.strengths.slice(0, 3)
            : (Array.isArray(obj.top_3_priorities) ? obj.top_3_priorities.slice(0, 3) : []);

        return {
            archetype: obj.archetype ?? 'Perfil sem classificacao',
            headline: obj.headline ?? obj.executive_summary ?? 'Diagnostico em processamento.',
            strengths,
            gaps: obj.gaps ?? [],
            immediateAction: obj.immediateAction ?? strengths[0] ?? 'Revisar dimensoes com menor score.',
        };
    } catch (error) {
        console.error('Erro diagnostic analysis:', error);
        return fallbackMock();
    }
}

async function fallbackToSupabase(
    type: DiagnosticType,
    answers: number[],
    totalScore: number,
): Promise<DiagnosticAnalysisResult | null> {
    try {
        const { data, error } = await supabase.functions.invoke('analyze-diagnostic', {
            body: { type, answers, totalScore },
        });
        if (error || !data || typeof data !== 'object') return null;
        const d = data as Partial<DiagnosticAnalysisResult>;
        if (!d.archetype || !d.headline) return null;
        return {
            archetype: d.archetype,
            headline: d.headline,
            strengths: Array.isArray(d.strengths) ? d.strengths.slice(0, 3) : [],
            gaps: Array.isArray(d.gaps) ? d.gaps.slice(0, 3) : [],
            immediateAction: d.immediateAction ?? '',
        };
    } catch {
        return null;
    }
}

function getMockAnalysis(type: DiagnosticType, answers: number[], totalScore: number): DiagnosticAnalysisResult {
    const labels = DIMENSION_LABELS[type] || DIMENSION_LABELS.growth;
    const strong = answers
        .map((s, i) => ({ label: labels[i], score: s }))
        .filter(d => d.score >= 15)
        .map(d => `${d.label} esta em nivel operacional solido.`);
    const weak = answers
        .map((s, i) => ({ label: labels[i], score: s }))
        .filter(d => d.score <= 5)
        .map(d => `${d.label} esta comprometendo sua operacao - acao imediata necessaria.`);

    if (strong.length === 0 && weak.length === 0) {
        return {
            archetype: 'Operacao Estavel',
            headline: 'Voce tem uma base solida, mas ha espaco para otimizacao.',
            strengths: ['Operacao estavel em todas as dimensoes.'],
            gaps: ['Nenhuma dimensao em estado critico.'],
            immediateAction: 'Foque em otimizacao gradual de cada dimensao.',
        };
    }

    if (type === 'growth') {
        if (totalScore >= 80) return {
            archetype: 'Growth Maduro',
            headline: 'Voce tem um motor de growth funcionando - hora de escala agressiva.',
            strengths: strong.length > 0 ? strong : ['Operacao bem estruturada.'],
            gaps: weak.length > 0 ? weak : ['Otimizar CAC para escala.'],
            immediateAction: 'Escavar canais que ja funcionam e dobrar budget neles.',
        };
        if (totalScore >= 50) return {
            archetype: 'Growth em Construcao',
            headline: 'Voce tem sinais de tracao, mas ha gaps criticos para escalar.',
            strengths: strong.length > 0 ? strong : ['Algumas dimensoes fortes.'],
            gaps: weak.length > 0 ? weak : ['Identificar gargalos.'],
            immediateAction: 'Resolver os 1-2 maiores gaps antes de aumentar investimento.',
        };
        return {
            archetype: 'Growth Inicial',
            headline: 'Voce esta no comeco - precisa de fundacao antes de escalar.',
            strengths: strong.length > 0 ? strong : ['Disposicao para construir.'],
            gaps: weak.length > 0 ? weak : ['Multiplas dimensoes precisam de atencao.'],
            immediateAction: 'Comece por um canal de aquisicao, meca e itere.',
        };
    }

    if (totalScore >= 80) return {
        archetype: 'Operacao de Receita Madura',
        headline: 'Sua operacao de receita esta otimizada - foco em novos mercados.',
        strengths: strong.length > 0 ? strong : ['Operacao eficiente.'],
        gaps: weak.length > 0 ? weak : ['Explorar novos segmentos.'],
        immediateAction: 'Escalar para novos ICPs.',
    };
    if (totalScore >= 50) return {
        archetype: 'Receita em Crescimento',
        headline: 'Voce tem uma maquina de receita funcionando - mas com vazamentos.',
        strengths: strong.length > 0 ? strong : ['Base construida.'],
        gaps: weak.length > 0 ? weak : ['Vazamentos na operacao.'],
        immediateAction: 'Vedar os vazamentos antes de acelerar.',
    };
    return {
        archetype: 'Receita em Construcao',
        headline: 'Sua operacao de receita precisa de fundacao estruturada.',
        strengths: strong.length > 0 ? strong : ['Voce identificou o problema.'],
        gaps: weak.length > 0 ? weak : ['Falta de processo.'],
        immediateAction: 'Implementar metricas e processos basicos primeiro.',
    };
}
