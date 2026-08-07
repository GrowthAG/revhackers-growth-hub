import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PrioritizedAction } from '@/types/diagnostic';

interface ActionTimelineProps {
  actions: PrioritizedAction[];
}

const EFFORT_LABEL: Record<string, string> = {
  baixo: 'esforco baixo',
  medio: 'esforco medio',
  alto: 'esforco alto',
  muito_alto: 'esforco muito alto',
};

const TIMELINE_BADGE: Record<string, string> = {
  '7 dias': 'bg-[#00CC6A] text-white',
  '30 dias': 'bg-zinc-900 text-white',
  '90 dias': 'bg-zinc-200 text-zinc-900',
  ongoing: 'bg-zinc-100 text-zinc-600',
};

const formatBrl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const ActionTimeline: React.FC<ActionTimelineProps> = ({ actions }) => {
  const totalImpact = actions.reduce((acc, a) => acc + a.impactBrl, 0);

  return (
    <div className="border border-zinc-900 bg-white">
      <div className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-[#00CC6A]" strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            proximos passos priorizados
          </span>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          impacto total: {formatBrl(totalImpact)}
        </span>
      </div>

      <ol className="divide-y divide-zinc-100">
        {actions.map((action, idx) => (
          <li key={idx} className="px-6 py-5 hover:bg-zinc-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center pt-1">
                <div className="w-8 h-8 border border-zinc-900 bg-white flex items-center justify-center text-xs font-bold text-zinc-900 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5',
                      TIMELINE_BADGE[action.timeline] ?? 'bg-zinc-100 text-zinc-600',
                    )}
                  >
                    {action.timeline}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {EFFORT_LABEL[action.effort]}
                  </span>
                </div>

                <h4 className="text-base font-bold text-zinc-900 leading-tight mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                  {action.description}
                </p>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-zinc-500">
                    dimensao: <span className="font-bold text-zinc-900">{action.dimension}</span>
                  </span>
                  <span className="text-zinc-500">
                    impacto: <span className="font-bold text-[#00CC6A]">{formatBrl(action.impactBrl)}</span>
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};