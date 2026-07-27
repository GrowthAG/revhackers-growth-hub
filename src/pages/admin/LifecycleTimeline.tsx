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
      <div className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-950 text-slate-100 min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-emerald-400" />
            Lifecycle Timeline
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Jornada completa do lead → customer → expansion → renewal
          </p>
        </div>

        {/* Stage Visualization */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Estágios do Lifecycle</h2>

          {/* Horizontal Timeline */}
          <div className="relative overflow-x-auto pb-4">
            <div className="flex items-center min-w-max">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isCurrent = idx === currentStageIndex;
                const isPast = idx < currentStageIndex;

                const colorClasses = {
                  gray: 'bg-slate-700 text-slate-300',
                  blue: 'bg-blue-600 text-white',
                  indigo: 'bg-indigo-600 text-white',
                  purple: 'bg-purple-600 text-white',
                  green: 'bg-green-600 text-white',
                  emerald: 'bg-emerald-600 text-white',
                  cyan: 'bg-cyan-600 text-white',
                  red: 'bg-red-600 text-white',
                }[stage.color];

                return (
                  <React.Fragment key={stage.value}>
                    <div className="flex flex-col items-center min-w-[120px]">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-4',
                          isCurrent
                            ? `${colorClasses} border-yellow-400 ring-4 ring-yellow-400/30 animate-pulse`
                            : isPast
                            ? `${colorClasses} border-slate-600 opacity-80`
                            : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50',
                        )}
                      >
                        {isPast ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                      </div>
                      <span
                        className={cn(
                          'text-xs mt-2 text-center font-medium',
                          isCurrent ? 'text-yellow-400 font-bold' : isPast ? 'text-slate-300' : 'text-slate-500',
                        )}
                      >
                        {stage.label}
                      </span>
                    </div>
                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <ArrowRight
                        className={cn(
                          'w-6 h-6 mx-2 shrink-0',
                          isPast ? 'text-emerald-400' : 'text-slate-700',
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Histórico de Transições</h2>

          {journeyQuery.isLoading ? (
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhuma transição registrada ainda.</div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <TransitionCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function TransitionCard({ event }: { event: LifecycleEvent }) {
  const fromStage = LIFECYCLE_STAGES.find((s) => s.value === event.from_stage);
  const toStage = LIFECYCLE_STAGES.find((s) => s.value === event.to_stage);

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-500 font-mono">
          {new Date(event.transitioned_at).toLocaleString('pt-BR')}
        </div>
        <div className="flex-1 flex items-center gap-2 text-sm">
          {fromStage && <span className="text-slate-400">{fromStage.label}</span>}
          {fromStage && <ArrowRight className="w-4 h-4 text-emerald-400" />}
          {toStage && <span className="font-bold text-emerald-400">{toStage.label}</span>}
        </div>
        <div className="text-xs text-slate-500">
          via <span className="text-slate-300">{event.triggered_by}</span>
        </div>
      </div>
      {event.metadata && Object.keys(event.metadata).length > 0 && (
        <div className="mt-2 text-xs text-slate-500 font-mono">
          {JSON.stringify(event.metadata, null, 2)}
        </div>
      )}
    </div>
  );
}
