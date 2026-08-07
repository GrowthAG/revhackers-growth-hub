import React from 'react';
import { cn } from '@/lib/utils';
import { ScoreGauge } from './ScoreGauge';
import { DiagnosticRadarChart } from './DiagnosticRadarChart';
import { RevenueLeakCard } from './RevenueLeakCard';
import { ActionTimeline } from './ActionTimeline';
import { BenchmarkVsMarket } from './BenchmarkVsMarket';
import { CnpjEnrichmentCard } from './CnpjEnrichmentCard';
import type { EnrichedDiagnosticResult } from '@/types/diagnostic';

interface EnrichedDiagnosticResultLayoutProps {
  result: EnrichedDiagnosticResult;
  segmentLabel?: string;
  revenueBaselineBrl?: number;
  onSchedule?: () => void;
  onShare?: () => void;
}

const SCORE_LEVEL_COLOR: Record<string, string> = {
  critico: 'text-red-600',
  alerta: 'text-amber-600',
  adequado: 'text-zinc-900',
  excelente: 'text-[#00CC6A]',
};

const SCORE_LEVEL_BG: Record<string, string> = {
  critico: 'bg-red-50',
  alerta: 'bg-amber-50',
  adequado: 'bg-zinc-100',
  excelente: 'bg-[#00CC6A]/10',
};

export const EnrichedDiagnosticResultLayout: React.FC<EnrichedDiagnosticResultLayoutProps> = ({
  result,
  segmentLabel = 'B2B SaaS early-stage',
  revenueBaselineBrl,
  onSchedule,
  onShare,
}) => {
  const topDrivers = result.dimensions
    .slice()
    .sort((a, b) => b.impactBrl - a.impactBrl)
    .slice(0, 3)
    .map((d) => {
      const total = result.dimensions.reduce((acc, x) => acc + x.impactBrl, 0) || 1;
      const pct = Math.round((d.impactBrl / total) * 100);
      return { name: d.name, valueBrl: d.impactBrl, pct };
    });

  const monthlyAvg = Math.round(result.estimatedRevenueLeakBrlPerYear / 12);

  return (
    <div className="w-full bg-white">
      <header className="border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-[#00CC6A] inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              diagnostico finalizado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-center">
            <div className="flex flex-col items-center justify-center border border-zinc-900 p-6 bg-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                score de maturidade
              </div>
              <div className="text-7xl md:text-8xl font-black text-zinc-900 leading-none tabular-nums">
                {result.score}
              </div>
              <div className="text-sm text-zinc-500 font-medium">/100</div>
              <div
                className={cn(
                  'mt-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
                  SCORE_LEVEL_BG[result.scoreLevel],
                  SCORE_LEVEL_COLOR[result.scoreLevel],
                )}
              >
                {result.scoreLevel}
              </div>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 leading-tight mb-3">
                {result.headline}
              </h1>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {result.executiveSummary}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {result.dimensions.length > 0 && (
            <DiagnosticRadarChart dimensions={result.dimensions} />
          )}
          <RevenueLeakCard
            totalAnnualBrl={result.estimatedRevenueLeakBrlPerYear}
            monthlyAverageBrl={monthlyAvg}
            topDrivers={topDrivers}
            revenueBaselineBrl={revenueBaselineBrl}
          />
        </div>

        {result.cnpjInsights && <CnpjEnrichmentCard insight={result.cnpjInsights} />}

        <ActionTimeline actions={result.topActions} />

        <BenchmarkVsMarket
          yourScore={result.score}
          benchmark={result.marketBenchmark}
          segment={segmentLabel}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-zinc-900 bg-white">
            <div className="border-b border-zinc-900 px-6 py-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                fortalezas
              </span>
            </div>
            <ul className="divide-y divide-zinc-100">
              {result.strengths.map((s, i) => (
                <li key={i} className="px-6 py-4 text-sm text-zinc-900">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-zinc-900 bg-white">
            <div className="border-b border-zinc-900 px-6 py-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                gaps criticos
              </span>
            </div>
            <ul className="divide-y divide-zinc-100">
              {result.gaps.slice(0, 3).map((g, i) => (
                <li key={i} className="px-6 py-4 text-sm text-zinc-900">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border border-zinc-900 bg-[#00CC6A] p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                acao imediata
              </div>
              <p className="text-lg font-bold text-zinc-900 leading-tight">
                {result.immediateAction}
              </p>
            </div>
            <div className="flex gap-3">
              {onSchedule && (
                <button
                  type="button"
                  onClick={onSchedule}
                  className="px-5 py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
                >
                  agendar consultoria
                </button>
              )}
              {onShare && (
                <button
                  type="button"
                  onClick={onShare}
                  className="px-5 py-3 bg-white border border-zinc-900 text-zinc-900 text-xs font-bold uppercase tracking-wider hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
                >
                  compartilhar
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
