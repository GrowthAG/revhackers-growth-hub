import { invokeAi } from '@/hooks/useAiInvoke';

export interface FounderAnalysisResult {
    archetype: string;
    score: number;
    headline: string;
    analysis: string;
    strengths: string[];
    blindSpots: string[];
    brandingGaps?: string[];
    actionableInsight?: string;
    linkedinData?: {
        fullName?: string;
        headline?: string;
        followerCount?: number;
        authorityScore?: number;
    };
}

// Fallback mock - used when both GCP and Supabase fail
function getMockAnalysis(score: number): FounderAnalysisResult {
    if (score > 80) return {
        archetype: "Visionario",
        score,
        headline: "O Lider de Mercado",
        analysis: "Sua presenca impoe respeito, mas cuidado para nao se distanciar da realidade operacional.",
        strengths: ["Autoridade Clara", "Visao de Futuro"],
        blindSpots: ["Distancia do Cliente", "Excesso de Abstracao"],
        brandingGaps: ["Falta de conteudo tecnico", "Audiencia nao qualificada"],
        actionableInsight: "Publique um caso de estudo real com metricas concretas esta semana.",
    };
    if (score > 50) return {
        archetype: "Relacionamento",
        score,
        headline: "O Conector Estrategico",
        analysis: "Voce gera movimento e networking, mas falta profundidade tecnica para sustentar LTV longo.",
        strengths: ["Energia Alta", "Rede de Contatos"],
        blindSpots: ["Churn Alto", "Conteudo Raso"],
        brandingGaps: ["Perfil sem tese clara", "Posts sem CTA de conversao"],
        actionableInsight: "Defina sua tese proprietaria em 1 frase e a adicione ao headline do LinkedIn.",
    };
    return {
        archetype: "Tecnico",
        score,
        headline: "O Especialista Oculto",
        analysis: "Voce e brilhante tecnicamente, mas o mercado nao sabe que voce existe. Isso custa milhoes.",
        strengths: ["Produto Solido", "Conhecimento Profundo"],
        blindSpots: ["Invisibilidade", "Vendas Passivas"],
        brandingGaps: ["Zero presenca digital", "Nenhum conteudo publicado"],
        actionableInsight: "Crie um post no LinkedIn contando 1 resultado real de um cliente. Faca isso hoje.",
    };
}

export async function analyzeFounderProfileAI(
    linkedinUrl: string,
    answers: number[],
    quizScore: number
): Promise<FounderAnalysisResult> {
    try {
        // Wave 1.4: Use invokeAi (tries GCP first, falls back to Supabase)
        const result = await invokeAi<Record<string, unknown>>('analyze-diagnostic', {
            type: 'founder',
            answers,
            totalScore: quizScore,
            linkedinUrl
        });

        if (result.error) {
            console.warn('[founderAnalysis] invokeAi failed:', result.error.message);
            return getMockAnalysis(quizScore);
        }

        // Unwrap GCP response: { result: { archetype, analysis, ... } }
        const raw = result.data as { result?: unknown } | undefined;
        const data = (raw?.result as Record<string, unknown>) || raw || {};

        return {
            archetype: (data.archetype as string) || 'Executor',
            score: quizScore,
            headline: ((data.linkedinData as Record<string, unknown>)?.headline as string) || '',
            analysis: (data.analysis as string) || '',
            strengths: ((data.strengths as string[]) || []).slice(0, 2),
            blindSpots: ((data.blindSpots as string[]) || []).slice(0, 2),
            brandingGaps: ((data.brandingGaps as string[]) || []).slice(0, 2),
            actionableInsight: (data.actionableInsight as string) || '',
            linkedinData: (data.linkedinData as FounderAnalysisResult['linkedinData']) || undefined,
        };
    } catch (error) {
        console.error("Erro founder analysis:", error);
        return getMockAnalysis(quizScore);
    }
}
