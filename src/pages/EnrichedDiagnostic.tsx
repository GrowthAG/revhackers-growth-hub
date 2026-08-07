import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '@/components/shared/SEO';
import { EnrichedDiagnosticResultLayout } from '@/components/diagnostics/EnrichedDiagnosticResultLayout';
import { EnrichedFounderResultLayout } from '@/components/diagnostics/EnrichedFounderResultLayout';
import { analyzeDiagnosticAI } from '@/api/diagnosticAnalysis';
import { analyzeFounderProfileAI } from '@/api/founderAnalysis';
import type { EnrichedDiagnosticResult } from '@/types/diagnostic';
import type { EnrichedFounderResult } from '@/types/diagnostic';

const SEGMENT_LABELS = {
  growth: 'B2B SaaS early-stage',
  revenue: 'B2B SaaS early-stage',
  founder: 'founders B2B SaaS early-stage',
  site: 'sites B2B SaaS early-stage',
};

export const EnrichedDiagnosticPage: React.FC = () => {
  const [params] = useSearchParams();
  const type = (params.get('type') || 'growth') as 'growth' | 'revenue' | 'founder' | 'site';
  const score = parseInt(params.get('score') || '0', 10);
  const answers = JSON.parse(params.get('answers') || '[]') as number[];
  const cnpj = params.get('cnpj') || undefined;
  const linkedinUrl = params.get('linkedin') || undefined;

  const [result, setResult] = useState<EnrichedDiagnosticResult | EnrichedFounderResult | null>(null);

  useEffect(() => {
    let alive = true;
    if (type === 'founder') {
      analyzeFounderProfileAI(linkedinUrl || '', answers, score).then((r) => {
        if (alive) setResult(r);
      });
    } else {
      analyzeDiagnosticAI(type, answers, score, { cnpj }).then((r) => {
        if (alive) setResult(r);
      });
    }
    return () => {
      alive = false;
    };
  }, [type, score, answers.join(','), cnpj, linkedinUrl]);

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            carregando diagnostico
          </p>
        </div>
      </div>
    );
  }

  if (type === 'founder') {
    return (
      <>
        <SEO
          title="Diagnostico do Fundador"
          description="Analise de perfil de founder."
          canonical="https://revhackers.com.br/diagnostico/v2"
        />
        <EnrichedFounderResultLayout result={result as EnrichedFounderResult} segmentLabel={SEGMENT_LABELS.founder} />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Diagnostico enriquecido"
        description="Resultado completo."
        canonical="https://revhackers.com.br/diagnostico/v2"
      />
      <EnrichedDiagnosticResultLayout
        result={result as EnrichedDiagnosticResult}
        segmentLabel={SEGMENT_LABELS[type]}
      />
    </>
  );
};

export default EnrichedDiagnosticPage;
