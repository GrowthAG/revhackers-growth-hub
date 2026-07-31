import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Clock, CheckCircle, AlertCircle, ArrowRight, User, Mail,
  Briefcase, Heart, TrendingUp, Calendar
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { lifecycleGcpAdapter, type LifecycleEvent } from '@/api/adapters/intelligence-gcp';
import { cn } from '@/lib/utils';

// Define the 8 lifecycle stages
const LIFECYCLE_STAGES = [
  { value: 'lead', label: 'Lead Captured', icon: User, color: 'gray' },
  { value: 'mql', label: 'Marketing Qualified', icon: Mail, color: 'blue' },
  { value: 'sql', label: 'Sales Qualified', icon: Briefcase, color: 'indigo' },
  { value: 'opportunity', label: 'Opportunity', icon: TrendingUp, color: 'purple' },
  { value: 'customer', label: 'Customer', icon: Heart, color: 'green' },
  { value: 'expansion', label: 'Expansion', icon: TrendingUp, color: 'emerald' },
  { value: 'renewal', label: 'Renewal', icon: Calendar, color: 'cyan' },
  { value: 'churned', label: 'Churned', icon: AlertCircle, color: 'red' },
] as const;

const STAGE_INDEX: Record<string, number> = LIFECYCLE_STAGES.reduce((acc, s, i) => ({ ...acc, [s.value]: i }), {});

export default function LifecycleTimeline() {
  const { contactId } = useParams<{ contactId: string }>();
  const tenantId = 'demo-tenant';

  const journeyQuery = useQuery({
    queryKey: ['lifecycle-journey', contactId],
    queryFn: () => lifecycleGcpAdapter.getContactJourney(contactId!, tenantId),
    enabled: !!contactId,
  });

  const events = journeyQuery.data || [];
  const currentStage = events[0]?.to_stage || 'lead';
  const currentStageIndex = STAGE_INDEX[currentStage] ?? 0;

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8 bg-white text-zinc-900 min-h-screen">
        {/* Header */}
        <div className="border-b border-zinc-200 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 flex items-center gap-3">
            <Clock className="w-7 h-7 text-[#00CC6A]" />
            Lifecycle Timeline
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Jornada completa do lead → customer → expansion → renewal
          </p>
        </div>

        {/* Stage Visualization */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Estágios do Lifecycle</h2>

          {/* Horizontal Timeline */}
          <div className="relative overflow-x-auto pb-4">
            <div className="flex items-center min-w-max">
              {LIFECYCLE_STAGES.map((s, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const Icon = s.icon;

                return (
                  <React.Fragment key={s.value}>
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                          isCurrent && 'border-[#00CC6A] bg-[#00CC6A]/10 text-[#00CC6A] ring-4 ring-[#00CC6A]/20',
                          isPassed && !isCurrent && 'border-[#00CC6A] bg-[#00CC6A] text-zinc-950',
                          !isPassed && 'border-zinc-200 bg-zinc-50 text-zinc-400'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold mt-2 max-w-[100px] text-center',
                          isCurrent ? 'text-[#00CC6A]' : isPassed ? 'text-zinc-900' : 'text-zinc-400'
                        )}
                      >
                        {s.label}
                      </span>
                    </div>

                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 w-12 mx-2 transition-all',
                          idx < currentStageIndex ? 'bg-[#00CC6A]' : 'bg-zinc-200'
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transition Events List */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Histórico de Transições</h2>

          {journeyQuery.isLoading ? (
            <div className="text-center py-8 text-zinc-400">Carregando jornada...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">Nenhuma transição registrada ainda.</div>
          ) : (
            <div className="space-y-4">
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function EventCard({ event }: { event: LifecycleEvent }) {
  const fromLabel = LIFECYCLE_STAGES.find((s) => s.value === event.from_stage)?.label || event.from_stage || 'Início';
  const toLabel = LIFECYCLE_STAGES.find((s) => s.value === event.to_stage)?.label || event.to_stage;
  const dateStr = new Date(event.transitioned_at).toLocaleString('pt-BR');

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00CC6A]/10 text-[#00CC6A] flex items-center justify-center font-bold text-xs">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <span>{fromLabel}</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
              <span className="text-[#00CC6A] font-bold">{toLabel}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-zinc-400 font-medium">{dateStr}</span>
          <div className="text-xs text-zinc-400">{event.triggered_by || 'Sistema'}</div>
        </div>
      </div>
      {event.metadata && Object.keys(event.metadata).length > 0 && (
        <div className="mt-2 text-xs text-zinc-500 font-mono">
          {JSON.stringify(event.metadata, null, 2)}
        </div>
      )}
    </div>
  );
}
