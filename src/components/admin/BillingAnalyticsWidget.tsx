import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface ClientAccountRow {
  id: string;
  client_email: string;
  client_name: string | null;
  client_company: string | null;
  consulting_value: number;
  software_value: number;
  consulting_mrr: number;
  software_mrr: number;
  consulting_status: 'pending' | 'active' | 'completed' | null;
  software_status: 'pending' | 'onboarding' | 'active' | 'churn' | null;
  consulting_start_date: string | null;
  software_renewal_date: string | null;
  created_at: string;
}

export function BillingAnalyticsWidget() {
  const { data: accounts = [], isLoading } = useQuery<ClientAccountRow[]>({
    queryKey: ['billing-analytics-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_accounts' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[BillingAnalytics] Client accounts not accessible:', error.message);
        return [];
      }
      return (data as unknown as ClientAccountRow[]) || [];
    },
  });

  // Calculate metrics
  let totalPaidVolume = 0;
  let totalPendingVolume = 0;
  let activeContractsCount = 0;
  let pendingContractsCount = 0;

  accounts.forEach((acc) => {
    const val = (acc.consulting_value || 0) + (acc.software_value || 0);
    const isConsultingActive = acc.consulting_status === 'active';
    const isSoftwareActive = acc.software_status === 'active';

    if (isConsultingActive || isSoftwareActive) {
      totalPaidVolume += val;
      activeContractsCount += 1;
    } else {
      totalPendingVolume += val;
      pendingContractsCount += 1;
    }
  });

  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (isLoading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-20 bg-zinc-800/50 rounded-xl"></div>
          <div className="h-20 bg-zinc-800/50 rounded-xl"></div>
          <div className="h-20 bg-zinc-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-[#00CC6A] uppercase tracking-wider block">
            SUBCONTAS GHL & REVHACKERS • CONCILIAÇÃO FINANCEIRA
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Mapeamento de Faturas & Cobranças
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-zinc-800 text-[#00CC6A] border border-zinc-700">
          GHL SYNC ATIVO
        </span>
      </div>

      {/* Grid de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#00CC6A] uppercase">Cobranças Pagas / Confirmadas</span>
            <CheckCircle2 size={16} className="text-[#00CC6A]" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{formatBRL(totalPaidVolume)}</p>
          <span className="text-[11px] text-zinc-400 block font-mono">
            {activeContractsCount} contratos com fatura liquidada
          </span>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">Cobranças Pendentes / Abertas</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{formatBRL(totalPendingVolume)}</p>
          <span className="text-[11px] text-zinc-400 block font-mono">
            {pendingContractsCount} cobranças aguardando conciliação
          </span>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Total de Contas Mapeadas</span>
            <ShieldCheck size={16} className="text-zinc-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{accounts.length}</p>
          <span className="text-[11px] text-zinc-400 block font-mono">
            Integradas via Webhooks GHL
          </span>
        </div>
      </div>

      {/* Tabela de Contas e Status das Faturas */}
      {accounts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
            Detalhamento por Subconta & Cliente
          </h4>
          <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-xl bg-zinc-950/60 overflow-hidden">
            {accounts.map((acc) => {
              const isPaid = acc.consulting_status === 'active' || acc.software_status === 'active';
              const totalVal = (acc.consulting_value || 0) + (acc.software_value || 0);

              return (
                <div key={acc.id} className="p-4 flex items-center justify-between text-xs hover:bg-zinc-900/40 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white block">
                      {acc.client_company || acc.client_name || acc.client_email}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {acc.client_email}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-sm font-bold text-white block font-mono">
                        {formatBRL(totalVal)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        MRR: {formatBRL((acc.consulting_mrr || 0) + (acc.software_mrr || 0))}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                      isPaid
                        ? "bg-[#00CC6A]/10 text-[#00CC6A] border-[#00CC6A]/30"
                        : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                    }`}>
                      {isPaid ? "PAGO / ATIVO" : "PENDENTE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
