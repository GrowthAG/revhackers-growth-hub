import React from 'react';
import { Building2, MapPin, Users, TrendingUp, Calendar } from 'lucide-react';
import type { CnpjInsight } from '@/types/diagnostic';

interface CnpjEnrichmentCardProps {
  insight: CnpjInsight;
}

/**
 * Card de enriquecimento por CNPJ.
 * Quando o lead informa CNPJ, mostramos dados publicos da Receita Federal.
 */
export const CnpjEnrichmentCard: React.FC<CnpjEnrichmentCardProps> = ({ insight }) => {
  const formattedCnpj = insight.cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5',
  );

  return (
    <div className="border border-zinc-900 bg-white">
      <div className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#00CC6A]" strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            contexto da empresa
          </span>
        </div>
        <span className="text-xs text-zinc-500 font-mono">{formattedCnpj}</span>
      </div>

      <div className="px-6 py-6">
        <h3 className="text-2xl font-bold text-zinc-900 leading-tight mb-1">
          {insight.companyName}
        </h3>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-6">
          {insight.segment}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-zinc-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-3 h-3 text-zinc-500" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                receita estimada
              </span>
            </div>
            <div className="text-sm font-bold text-zinc-900">{insight.estimatedRevenue}</div>
          </div>

          <div className="border border-zinc-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users className="w-3 h-3 text-zinc-500" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                funcionarios
              </span>
            </div>
            <div className="text-sm font-bold text-zinc-900">{insight.headcount}</div>
          </div>

          <div className="border border-zinc-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3 h-3 text-zinc-500" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                uf
              </span>
            </div>
            <div className="text-sm font-bold text-zinc-900">{insight.state}</div>
          </div>

          <div className="border border-zinc-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3 h-3 text-zinc-500" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                anos de mercado
              </span>
            </div>
            <div className="text-sm font-bold text-zinc-900">{insight.ageYears} anos</div>
          </div>
        </div>
      </div>
    </div>
  );
};