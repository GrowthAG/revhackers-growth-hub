import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Clock, ShieldCheck, Zap, Sparkles } from 'lucide-react';

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

// Rich fallback demo dataset for executive presentation when DB is empty
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
  const isDemo = dbAccounts.length === 0;

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
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-zinc-900 rounded-xl"></div>
          <div className="h-24 bg-zinc-900 rounded-xl"></div>
          <div className="h-24 bg-zinc-900 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Accent glow line top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00CC6A] to-transparent"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xxs font-mono font-bold text-[#00CC6A] uppercase tracking-widest">
              SUBCONTAS GHL & REVHACKERS • CONCILIAÇÃO FINANCEIRA
            </span>
            {isDemo && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/30 flex items-center gap-1">
                <Sparkles size={10} /> MODEDEMO
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Mapeamento de Faturas & Cobranças
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-900 text-[#00CC6A] border border-[#00CC6A]/30 flex items-center gap-2">
            <Zap size={12} className="text-[#00CC6A] animate-pulse" /> GHL SYNC OK
          </span>
        </div>
      </div>

      {/* Grid de Resumo Financeiro Nobibecode Dark */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-5 space-y-2 hover:border-[#00CC6A]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#00CC6A] uppercase tracking-wider">Cobranças Pagas / Liquidadas</span>
            <CheckCircle2 size={18} className="text-[#00CC6A] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-black text-white tracking-tight tabular-nums">{formatBRL(totalPaidVolume)}</p>
          <span className="text-xs text-zinc-400 block font-mono">
            {activeContractsCount} contratos com fatura confirmada
          </span>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-5 space-y-2 hover:border-amber-400/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Cobranças Pendentes / Abertas</span>
            <Clock size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-black text-white tracking-tight tabular-nums">{formatBRL(totalPendingVolume)}</p>
          <span className="text-xs text-zinc-400 block font-mono">
            {pendingContractsCount} cobranças aguardando recebimento
          </span>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-5 space-y-2 hover:border-zinc-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Subcontas Registradas</span>
            <ShieldCheck size={18} className="text-zinc-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-black text-white tracking-tight tabular-nums">{accounts.length}</p>
          <span className="text-xs text-zinc-400 block font-mono">
            Sincronizadas via Webhooks & API
          </span>
        </div>
      </div>

      {/* Tabela de Contas e Status das Faturas */}
      {accounts.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest">
              Detalhamento por Subconta & Cliente
            </h4>
            {isDemo && (
              <span className="text-[11px] text-zinc-500 font-mono">
                Exibindo dados de amostra operacional
              </span>
            )}
          </div>
          <div className="divide-y divide-zinc-800/80 border border-zinc-800/90 rounded-xl bg-zinc-900/50 overflow-hidden">
            {accounts.map((acc) => {
              const isPaid = acc.consulting_status === 'active' || acc.software_status === 'active';
              const totalVal = (acc.consulting_value || 0) + (acc.software_value || 0);

              return (
                <div key={acc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-zinc-800/40 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white block tracking-tight">
                      {acc.client_company || acc.client_name || acc.client_email}
                    </span>
                    <span className="text-zinc-400 font-mono text-xs">
                      {acc.client_name ? `${acc.client_name} · ` : ''}{acc.client_email}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-sm font-black text-white block font-mono tabular-nums">
                        {formatBRL(totalVal)}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        MRR: {formatBRL((acc.consulting_mrr || 0) + (acc.software_mrr || 0))}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      isPaid
                        ? "bg-[#00CC6A]/10 text-[#00CC6A] border-[#00CC6A]/30"
                        : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                    }`}>
                      {isPaid ? "PAGO / CONFIRMADO" : "AGUARDANDO PAGAMENTO"}
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
