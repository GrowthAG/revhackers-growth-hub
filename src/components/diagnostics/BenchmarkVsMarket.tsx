import React from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketBenchmark } from '@/types/diagnostic';

interface BenchmarkVsMarketProps {
  yourScore: number;
  benchmark: MarketBenchmark;
  segment: string;
}

/**
 * Benchmark horizontal contra o mercado.
 * Barras horizontais, hard-edged, sem gradiente.
 */
export const BenchmarkVsMarket: React.FC<BenchmarkVsMarketProps> = ({
  yourScore,
  benchmark,
  segment,
}) => {
  const items = [
    { label: 'voce', score: yourScore, color: '#00CC6A', highlight: true },
    { label: 'media do mercado', score: benchmark.segmentAverage, color: '#52525B', highlight: false },
    { label: 'top 25%', score: benchmark.topQuartile, color: '#18181B', highlight: false },
    { label: 'top 10%', score: benchmark.top10Percent, color: '#18181B', highlight: false },
  ];

  const gap = benchmark.segmentAverage - yourScore;
  const gapLabel = gap > 0 ? `${gap} pts abaixo` : `${Math.abs(gap)} pts acima`;

  return (
    <div className="border border-zinc-900 bg-white">
      <div className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#00CC6A]" strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            benchmark vs mercado
          </span>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {segment}
        </span>
      </div>

      <div className="px-6 py-6 space-y-5">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-baseline justify-between mb-2">
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wider',
                  item.highlight ? 'text-[#00CC6A]' : 'text-zinc-500',
                )}
              >
                {item.label}
              </span>
              <span className="text-lg font-bold text-zinc-900 tabular-nums">
                {item.score}
                <span className="text-xs text-zinc-500 font-medium">/100</span>
              </span>
            </div>
            <div className="relative h-3 bg-zinc-100">
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${Math.min(100, item.score)}%`,
                  backgroundColor: item.color,
                }}
              />
              {item.highlight && (
                <div className="absolute inset-y-0 left-0 border-r-2 border-zinc-900" />
              )}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-zinc-100">
          <div className="text-xs text-zinc-600 leading-relaxed">
            voce esta <span className="font-bold text-zinc-900">{gapLabel}</span> da media de empresas
            B2B SaaS early-stage no Brasil. Fonte: {benchmark.benchmarkSource}.
          </div>
        </div>
      </div>
    </div>
  );
};