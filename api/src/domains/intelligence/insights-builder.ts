import type {
  CompetitorWithIntelligence,
  MarketSignalRecord,
  MarketSentiment,
} from './types';

/**
 * Insight card shape used by the admin dashboard.
 *
 * IMPORTANT: This is the ONLY shape the dashboard renders. Each insight
 * must be derived from real data — never fabricate TAM, market share, or
 * percentages. If the underlying data is absent or inconclusive, we
 * return an empty array (the dashboard shows an honest empty state).
 */
export interface IndustryInsight {
  label: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
}

const PORTE_LABELS: Record<string, string> = {
  ME: 'Microempresa',
  EPP: 'Empresa de Pequeno Porte',
  MEDIO: 'Médio',
  GRANDE: 'Grande',
};

const SPI_CATEGORY_LABELS: Record<string, string> = {
  MICRO: 'MICRO',
  EMERGING: 'EMERGING',
  SCALEUP: 'SCALEUP',
  ENTERPRISE: 'ENTERPRISE',
};

const OFS_LABELS: Record<string, string> = {
  LOW: 'baixo risco',
  MEDIUM: 'médio risco',
  HIGH: 'alto risco',
  CRITICAL: 'risco crítico',
};

const SENTIMENT_LABELS: Record<MarketSentiment, string> = {
  positive: 'positivos',
  neutral: 'neutros',
  negative: 'negativos',
};

/**
 * Format a BRL amount with mi/bi abbreviations, or "--" when absent.
 * Examples: 1500000 -> "R$ 1,50 mi", 2400000000 -> "R$ 2,40 bi".
 */
export function formatBRL(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return '--';
  if (value >= 1_000_000_000) {
    const bi = value / 1_000_000_000;
    return `R$ ${bi.toFixed(bi >= 10 ? 1 : 2).replace('.', ',')} bi`;
  }
  if (value >= 1_000_000) {
    const mi = value / 1_000_000;
    return `R$ ${mi.toFixed(mi >= 10 ? 1 : 2).replace('.', ',')} mi`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')} mil`;
  }
  return `R$ ${value.toFixed(0)}`;
}

function modeOf<T extends string | number>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  let best: T | null = null;
  let bestCount = -1;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Build industry insights strictly from already-enriched data for the
 * given project. Returns an empty array when no competitor intelligence
 * or signals exist — the dashboard renders an honest "no data" state
 * instead of fabricating numbers.
 *
 * Each insight is a real fact derivable from the inputs:
 *   - counts of competitors / enriched / risk levels
 *   - sums / means of capital_social_brl, spi_score
 *   - mode of porte, uf, spi_category
 *   - signal counts and sentiment distribution
 *
 * No external data sources (no TAM, no market share, no projections).
 */
export function buildIndustryInsights(
  competitors: CompetitorWithIntelligence[],
  signals: MarketSignalRecord[],
): IndustryInsight[] {
  const out: IndustryInsight[] = [];
  const total = competitors.length;
  const enriched = competitors.filter(
    (c) => c.intelligence?.enrichment_status === 'enriched',
  );

  // 1. Concorrentes monitorados — base count card.
  out.push({
    label: 'Concorrentes monitorados',
    value: String(total),
    description:
      total === 0
        ? 'Nenhum concorrente cadastrado ainda.'
        : total === 1
        ? '1 concorrente ativo neste projeto.'
        : `${total} concorrentes ativos monitorados continuamente.`,
    trend: total === 0 ? 'neutral' : total >= 3 ? 'up' : 'neutral',
  });

  // 2. Empresas enriquecidas — coverage of CNPJ/Receita enrichment.
  if (total > 0) {
    const enrichedPct = pct(enriched.length, total);
    out.push({
      label: 'Empresas enriquecidas',
      value: `${enrichedPct}%`,
      description:
        enrichedPct === 100
          ? `${enriched.length}/${total} com dados de CNPJ/Receita Federal.`
          : enrichedPct === 0
          ? 'Nenhuma empresa enriquecida via FonteData ainda.'
          : `${enriched.length}/${total} enriqueceram via CNPJ; restante pendente.`,
      trend: enrichedPct >= 80 ? 'up' : enrichedPct >= 40 ? 'neutral' : 'down',
    });
  }

  // 3. Capital social somado — aggregate tracked capital.
  if (enriched.length > 0) {
    const totalCapital = enriched.reduce(
      (sum, c) => sum + (c.intelligence?.capital_social_brl ?? 0),
      0,
    );
    const withCapital = enriched.filter(
      (c) => (c.intelligence?.capital_social_brl ?? 0) > 0,
    ).length;
    if (totalCapital > 0) {
      out.push({
        label: 'Capital social somado',
        value: formatBRL(totalCapital),
        description:
          withCapital === enriched.length
            ? `Soma de ${enriched.length} concorrentes com capital declarado.`
            : `${withCapital} de ${enriched.length} informaram capital; restante nulo.`,
        trend: totalCapital >= 1_000_000 ? 'up' : 'neutral',
      });
    }
  }

  // 4. Porte predominante — distribution of company size.
  if (enriched.length > 0) {
    const portes = enriched
      .map((c) => c.intelligence?.porte)
      .filter((p): p is string => !!p);
    if (portes.length > 0) {
      const topPorte = modeOf(portes);
      if (topPorte) {
        const count = portes.filter((p) => p === topPorte).length;
        out.push({
          label: 'Porte predominante',
          value: `${topPorte} (${pct(count, portes.length)}%)`,
          description: `${count} de ${portes.length} concorrentes classificados como ${PORTE_LABELS[topPorte] ?? topPorte}.`,
          trend: 'neutral',
        });
      }
    }
  }

  // 5. Distribuição geográfica — top UF.
  if (enriched.length > 0) {
    const ufs = enriched
      .map((c) => c.intelligence?.uf)
      .filter((u): u is string => !!u && u.length === 2);
    if (ufs.length > 0) {
      const topUf = modeOf(ufs);
      if (topUf) {
        const count = ufs.filter((u) => u === topUf).length;
        out.push({
          label: 'Concentração geográfica',
          value: topUf,
          description:
            count === 1
              ? `1 de ${ufs.length} concorrente atua em ${topUf}.`
              : `${count} de ${ufs.length} concorrentes com sede em ${topUf}.`,
          trend: count >= Math.ceil(ufs.length * 0.6) ? 'down' : 'neutral',
        });
      }
    }
  }

  // 6. SPI médio — strength index.
  if (enriched.length > 0) {
    const scores = enriched
      .map((c) => c.intelligence?.spi_score)
      .filter((s): s is number => typeof s === 'number' && Number.isFinite(s));
    if (scores.length > 0) {
      const avg = Math.round(
        scores.reduce((sum, s) => sum + s, 0) / scores.length,
      );
      const categoryCounts = new Map<string, number>();
      for (const c of enriched) {
        const cat = c.intelligence?.spi_category;
        if (cat) {
          categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
        }
      }
      const topCatEntry = [...categoryCounts.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0];
      const topCat = topCatEntry ? SPI_CATEGORY_LABELS[topCatEntry[0]] ?? topCatEntry[0] : null;
      out.push({
        label: 'SPI médio',
        value: `${avg}/100`,
        description: topCat
          ? `Maturidade predominante: ${topCat} (${topCatEntry![1]} de ${enriched.length}).`
          : `Média de ${scores.length} concorrentes com score calculado.`,
        trend: avg >= 70 ? 'up' : avg >= 40 ? 'neutral' : 'down',
      });
    }
  }

  // 7. Risco OFS — competitor risk posture.
  if (enriched.length > 0) {
    const risks = enriched
      .map((c) => c.intelligence?.ofs_risk_level)
      .filter((r): r is string => !!r);
    if (risks.length > 0) {
      const highCount = risks.filter((r) => r === 'HIGH' || r === 'CRITICAL').length;
      const lowCount = risks.filter((r) => r === 'LOW').length;
      const dominant = modeOf(risks);
      if (dominant) {
        out.push({
          label: 'Perfil de risco (OFS)',
          value: OFS_LABELS[dominant] ?? dominant,
          description:
            highCount > 0
              ? `${highCount} de ${risks.length} com risco alto/crítico; ${lowCount} baixo risco.`
              : `${lowCount} de ${risks.length} concorrentes classificados como baixo risco.`,
          trend: highCount > risks.length / 2 ? 'down' : lowCount > risks.length / 2 ? 'up' : 'neutral',
        });
      }
    }
  }

  // 8. Sinais de mercado — activity from market signals (project + tenant).
  if (signals.length > 0) {
    const sentiments = signals
      .map((s) => s.sentiment)
      .filter((s): s is MarketSentiment => !!s);
    const positive = sentiments.filter((s) => s === 'positive').length;
    const negative = sentiments.filter((s) => s === 'negative').length;
    const dominantSentiment: MarketSentiment =
      positive >= negative ? 'positive' : 'negative';
    out.push({
      label: 'Sinais de mercado detectados',
      value: String(signals.length),
      description: `${positive} ${SENTIMENT_LABELS.positive}, ${negative} ${SENTIMENT_LABELS.negative}, ${sentiments.length - positive - negative} ${SENTIMENT_LABELS.neutral}.`,
      trend:
        dominantSentiment === 'positive'
          ? 'up'
          : dominantSentiment === 'negative'
          ? 'down'
          : 'neutral',
    });
  }

  return out;
}