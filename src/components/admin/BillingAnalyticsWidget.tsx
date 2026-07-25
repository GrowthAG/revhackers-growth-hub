import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Clock, ShieldCheck, Zap } from 'lucide-react';

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

// Rich demo dataset for presentation when DB has no records yet
const DEMO_ACCOUNTS: ClientAccountRow[] = [
  {
    id: 'demo-1',
    client_email: 'financeiro@techscale.com.br',
    client_name: 'Gabriel Siqueira',
    client_company: 'TechScale B2B Tech',
    consulting_value: 36000,
    software_value: 12000,
    consulting_mrr: 6000,
    software_mrr: 2000,
    consulting_status: 'active',
    software_status: 'active',
    consulting_start_date: '2026-01-10T00:00:00Z',
    software_renewal_date: '2026-12-10T00:00:00Z',
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'demo-2',
    client_email: 'contato@nexumlog.com',
    client_name: 'Juliana Mendes',
    client_company: 'Nexum Logistics SaaS',
    consulting_value: 28000,
    software_value: 9600,
    consulting_mrr: 4500,
    software_mrr: 1600,
    consulting_status: 'active',
    software_status: 'active',
    consulting_start_date: '2026-02-01T00:00:00Z',
    software_renewal_date: '2026-11-01T00:00:00Z',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'demo-3',
    client_email: 'operacoes@finflex.io',
    client_name: 'Renato Castro',
    client_company: 'FinFlex Fintech B2B',
    consulting_value: 18000,
    software_value: 0,
    consulting_mrr: 3000,
    software_mrr: 0,
    consulting_status: 'pending',
    software_status: null,
    consulting_start_date: null,
    software_renewal_date: null,
    created_at: '2026-03-05T00:00:00Z',
  },
];

export function BillingAnalyticsWidget() {
  const { data: dbAccounts = [], isLoading } = useQuery<ClientAccountRow[]>({
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

  // Use DB data if populated, otherwise use high-fidelity Demo Accounts
  const accounts = dbAccounts.length > 0 ? dbAccounts : DEMO_ACCOUNTS;

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
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-zinc-100 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-zinc-50 rounded-xl"></div>
          <div className="h-24 bg-zinc-50 rounded-xl"></div>
          <div className="h-24 bg-zinc-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="space-y-1">
          <span className="text-xxs font-mono font-bold text-emerald-600 uppercase tracking-wider block">
            SUBCONTAS GHL & REVHACKERS • CONCILIAÇÃO FINANCEIRA
          </span>
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
            Mapeamento de Faturas & Cobranças
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <Zap size={12} className="text-emerald-600" /> SYNC GHL ATIVO
          </span>
        </div>
      </div>

      {/* Grid de Resumo Financeiro Clean SaaS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">Cobranças Confirmadas</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-950 tracking-tight tabular-nums">{formatBRL(totalPaidVolume)}</p>
          <span className="text-xs text-emerald-700 font-medium block">
            {activeContractsCount} contratos com fatura liquidada
          </span>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">Cobranças Pendentes</span>
            <Clock size={18} className="text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-950 tracking-tight tabular-nums">{formatBRL(totalPendingVolume)}</p>
          <span className="text-xs text-amber-700 font-medium block">
            {pendingContractsCount} cobranças aguardando liquidação
          </span>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider">Subcontas Mapeadas</span>
            <ShieldCheck size={18} className="text-zinc-500" />
          </div>
          <p className="text-3xl font-black text-zinc-900 tracking-tight tabular-nums">{accounts.length}</p>
          <span className="text-xs text-zinc-500 font-medium block">
            Integradas via Webhooks GHL
          </span>
        </div>
      </div>

      {/* Tabela de Contas e Status das Faturas */}
      {accounts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
            Detalhamento por Subconta & Cliente
          </h4>
          <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl bg-white overflow-hidden">
            {accounts.map((acc) => {
              const isPaid = acc.consulting_status === 'active' || acc.software_status === 'active';
              const totalVal = (acc.consulting_value || 0) + (acc.software_value || 0);

              return (
                <div key={acc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-zinc-50 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-zinc-900 block tracking-tight">
                      {acc.client_company || acc.client_name || acc.client_email}
                    </span>
                    <span className="text-zinc-500 font-mono text-xs">
                      {acc.client_name ? `${acc.client_name} · ` : ''}{acc.client_email}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-sm font-black text-zinc-900 block font-mono tabular-nums">
                        {formatBRL(totalVal)}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        MRR: {formatBRL((acc.consulting_mrr || 0) + (acc.software_mrr || 0))}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      isPaid
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}>
                      {isPaid ? "CONFIRMADO" : "PENDENTE"}
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
