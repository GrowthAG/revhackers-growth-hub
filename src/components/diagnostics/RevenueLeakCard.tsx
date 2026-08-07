import React from 'react';
import { TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueLeakCardProps {
  totalAnnualBrl: number;
  monthlyAverageBrl: number;
  topDrivers: Array<{ name: string; valueBrl: number; pct: number }>;
  revenueBaselineBrl?: number;
}

/**
 * Card hero de vazamento financeiro. Visual hard-edged.
 * Cifrao seguido de valor grande, alinhado a esquerda.
 */
export const RevenueLeakCard: React.FC<RevenueLeakCardProps> = ({
  totalAnnualBrl,
  monthlyAverageBrl,
  topDrivers,
  revenueBaselineBrl,
}) => {
  const formattedTotal = totalAnnualBrl.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
  const formattedMonthly = monthlyAverageBrl.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
  const leakPct = revenueBaselineBrl
    ? Math.min(100, Math.round((totalAnnualBrl / revenueBaselineBrl) * 100))
    : null;

  return (
    <div className="border border-zinc-900 bg-white">
      <div className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-[#00CC6A]" strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            vazamento financeiro projetado
          </span>
        </div>
        {leakPct !== null && (
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            {leakPct}% da receita
          </span>
        )}
      </div>

      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
            perda anual estimada
          </div>
          <div className="text-3xl md:text-4xl font-bold text-zinc-900 leading-none tabular-nums">
            {formattedTotal}
          </div>
          <div className="text-xs text-zinc-500 mt-2 font-medium">
            equivale a <span className="font-bold text-zinc-900">{formattedMonthly}</span> por mes
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
            onde o dinheiro esta vazando
          </div>
          <div className="space-y-2">
            {topDrivers.slice(0, 3).map((driver, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-900 truncate">
                      {driver.name}
                    </span>
                    <span className="text-xs font-bold text-zinc-900 tabular-nums ml-2">
                      {driver.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-100">
                    <div
                      className="h-full bg-[#00CC6A]"
                      style={{ width: `${Math.min(100, driver.pct)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};