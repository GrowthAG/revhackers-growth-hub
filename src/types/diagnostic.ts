/**
 * Tipos enriquecidos para o redesign dos diagnosticos.
 * Mesmo estilo do codebase: sem emojis, comentários pt-br, terminologia existente.
 */

export type ScoreLevel = 'critico' | 'alerta' | 'adequado' | 'excelente';

export interface DimensionScore {
  name: string;
  score: number;
  insight: string;
  recommendedAction: string;
  impactBrl: number;
}

export type EffortLevel = 'baixo' | 'medio' | 'alto' | 'muito_alto';

export interface PrioritizedAction {
  title: string;
  description: string;
  timeline: '7 dias' | '30 dias' | '90 dias' | 'ongoing';
  impactBrl: number;
  effort: EffortLevel;
  dimension: string;
}

export interface MarketBenchmark {
  segmentAverage: number;
  topQuartile: number;
  top10Percent: number;
  yourPosition: 'P10' | 'P25' | 'P50' | 'P75' | 'P90';
  benchmarkSource: string;
}

export interface CnpjInsight {
  cnpj: string;
  companyName: string;
  segment: string;
  estimatedRevenue: string;
  headcount: string;
  state: string;
  ageYears: number;
}

export interface EnrichedDiagnosticResult {
  archetype: string;
  score: number;
  scoreLevel: ScoreLevel;
  headline: string;
  executiveSummary: string;
  dimensions: DimensionScore[];
  topActions: PrioritizedAction[];
  estimatedRevenueLeakBrlPerYear: number;
  marketBenchmark: MarketBenchmark;
  cnpjInsights?: CnpjInsight;
  strengths: string[];
  gaps: string[];
  immediateAction: string;
}

export interface EnrichedFounderResult {
  archetype: 'Executor' | 'Visionario' | 'Tecnico' | 'Relacionamento' | 'Analitico';
  archetypeConfidence: number;
  score: number;
  scoreLevel: ScoreLevel;
  headline: string;
  analysis: string;
  dimensions: DimensionScore[];
  topActions: PrioritizedAction[];
  strengths: string[];
  blindSpots: string[];
  brandingGaps: string[];
  actionableInsight: string;
  linkedinData?: {
    fullName?: string;
    headline?: string;
    followerCount?: number;
    authorityScore?: number;
  };
  marketBenchmark: MarketBenchmark;
  cnpjInsights?: CnpjInsight;
}

export const SCORE_LEVEL_THRESHOLDS: Record<ScoreLevel, [number, number]> = {
  critico: [0, 39],
  alerta: [40, 64],
  adequado: [65, 84],
  excelente: [85, 100],
};

export function getScoreLevel(score: number): ScoreLevel {
  for (const [level, [min, max]] of Object.entries(SCORE_LEVEL_THRESHOLDS) as Array<[ScoreLevel, [number, number]]>) {
    if (score >= min && score <= max) return level;
  }
  return 'critico';
}

export const SCORE_LEVEL_LABEL: Record<ScoreLevel, string> = {
  critico: 'critico',
  alerta: 'em alerta',
  adequado: 'adequado',
  excelente: 'excelente',
};
