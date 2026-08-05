import { describe, it, expect } from 'vitest';
import {
  buildIndustryInsights,
  formatBRL,
  type IndustryInsight,
} from '../../api/src/domains/intelligence/insights-builder';
import type {
  CompetitorWithIntelligence,
  MarketSignalRecord,
  CompetitorIntelligenceRecord,
  CompetitorRecord,
} from '../../api/src/domains/intelligence/types';

const TENANT = 'tenant-1';
const COMP_BASE: CompetitorRecord = {
  id: 'cmp-1',
  tenant_id: TENANT,
  project_id: 'proj-1',
  name: 'Acme',
  cnpj: null,
  website: null,
  segment: 'CRM',
  cnae_primary: null,
  notes: null,
  is_priority: false,
  is_active: true,
  added_by: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

function enriched(over: Partial<CompetitorIntelligenceRecord>): CompetitorIntelligenceRecord {
  return {
    id: 'intel-1',
    tenant_id: TENANT,
    competitor_id: 'cmp-1',
    razao_social: 'Acme LTDA',
    nome_fantasia: 'Acme',
    cnpj: '12345678000199',
    capital_social_brl: 100_000,
    porte: 'ME',
    natureza_juridica: null,
    cnae_primary: null,
    cnae_secondary: [],
    uf: 'SP',
    municipio: 'São Paulo',
    data_abertura: null,
    situacao_receita: 'ATIVA',
    qsa: [],
    spi_score: 50,
    spi_category: 'EMERGING',
    ofs_risk_level: 'LOW',
    raw_payload: {},
    last_enriched_at: '2025-01-01T00:00:00Z',
    enrichment_status: 'enriched',
    enrichment_error: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...over,
  };
}

function competitor(
  id: string,
  intelligence: CompetitorIntelligenceRecord | null,
): CompetitorWithIntelligence {
  return {
    competitor: { ...COMP_BASE, id },
    intelligence,
    recent_signals: [],
    comparison: null,
  };
}

const signal = (
  id: string,
  sentiment: MarketSignalRecord['sentiment'],
  impact: MarketSignalRecord['impact_level'] = 'medium',
): MarketSignalRecord => ({
  id,
  tenant_id: TENANT,
  competitor_id: null,
  signal_type: 'news',
  title: `Signal ${id}`,
  summary: '',
  source_url: null,
  source_name: null,
  sentiment,
  impact_level: impact,
  detected_at: '2025-01-01T00:00:00Z',
  detected_by: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
});

describe('formatBRL', () => {
  it('formats thousands', () => {
    expect(formatBRL(5_000)).toBe('R$ 5,0 mil');
    expect(formatBRL(50_000)).toBe('R$ 50,0 mil');
  });
  it('formats millions with 2 decimals under 10 mi', () => {
    expect(formatBRL(1_500_000)).toBe('R$ 1,50 mi');
    expect(formatBRL(2_450_000)).toBe('R$ 2,45 mi');
  });
  it('formats millions with 1 decimal over 10 mi', () => {
    expect(formatBRL(15_000_000)).toBe('R$ 15,0 mi');
    expect(formatBRL(125_000_000)).toBe('R$ 125,0 mi');
  });
  it('formats billions', () => {
    expect(formatBRL(1_500_000_000)).toBe('R$ 1,50 bi');
    expect(formatBRL(2_400_000_000)).toBe('R$ 2,40 bi');
  });
  it('returns -- for null, undefined, zero, negative, NaN', () => {
    expect(formatBRL(null)).toBe('--');
    expect(formatBRL(undefined)).toBe('--');
    expect(formatBRL(0)).toBe('--');
    expect(formatBRL(-100)).toBe('--');
    expect(formatBRL(Number.NaN)).toBe('--');
  });
});

describe('buildIndustryInsights — empty inputs', () => {
  it('returns only the "concorrentes monitorados" card when no data', () => {
    const insights = buildIndustryInsights([], []);
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      label: 'Concorrentes monitorados',
      value: '0',
      trend: 'neutral',
    });
  });
});

describe('buildIndustryInsights — competitor count', () => {
  it('reports single competitor with neutral trend', () => {
    const insights = buildIndustryInsights([competitor('a', null)], []);
    const card = insights.find((i) => i.label === 'Concorrentes monitorados');
    expect(card?.value).toBe('1');
    expect(card?.description).toContain('1 concorrente ativo');
  });

  it('reports ≥3 competitors with up trend', () => {
    const comps = ['a', 'b', 'c', 'd'].map((id) => competitor(id, null));
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Concorrentes monitorados');
    expect(card?.value).toBe('4');
    expect(card?.trend).toBe('up');
    expect(card?.description).toContain('4 concorrentes ativos');
  });
});

describe('buildIndustryInsights — enrichment rate', () => {
  it('reports 100% enriched with up trend', () => {
    const comps = [
      competitor('a', enriched({})),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Empresas enriquecidas');
    expect(card?.value).toBe('100%');
    expect(card?.trend).toBe('up');
    expect(card?.description).toContain('2/2');
  });

  it('reports 0% enriched with down trend and explicit message', () => {
    const insights = buildIndustryInsights(
      [competitor('a', null), competitor('b', null)],
      [],
    );
    const card = insights.find((i) => i.label === 'Empresas enriquecidas');
    expect(card?.value).toBe('0%');
    expect(card?.trend).toBe('down');
    expect(card?.description).toContain('Nenhuma empresa enriquecida');
  });

  it('reports partial enrichment with neutral trend', () => {
    const comps = [
      competitor('a', enriched({})),
      competitor('b', null),
      competitor('c', null),
      competitor('d', null),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Empresas enriquecidas');
    expect(card?.value).toBe('25%');
    expect(card?.trend).toBe('down');
    expect(card?.description).toContain('1/4');
  });
});

describe('buildIndustryInsights — capital social', () => {
  it('sums capital across enriched competitors', () => {
    const comps = [
      competitor('a', enriched({ capital_social_brl: 1_500_000 })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', capital_social_brl: 800_000 })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Capital social somado');
    expect(card?.value).toBe('R$ 2,30 mi');
    expect(card?.description).toContain('Soma de 2 concorrentes');
    expect(card?.trend).toBe('up'); // >= 1mi
  });

  it('omits the card when no enriched competitor has capital declared', () => {
    const comps = [competitor('a', enriched({ capital_social_brl: 0 }))];
    const insights = buildIndustryInsights(comps, []);
    expect(insights.find((i) => i.label === 'Capital social somado')).toBeUndefined();
  });

  it('annotates when only some enriched competitors have capital', () => {
    const comps = [
      competitor('a', enriched({ capital_social_brl: 500_000 })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', capital_social_brl: 0 })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Capital social somado');
    expect(card?.description).toContain('1 de 2 informaram capital');
  });
});

describe('buildIndustryInsights — porte predominante', () => {
  it('reports the mode of porte', () => {
    const comps = [
      competitor('a', enriched({ porte: 'ME' })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', porte: 'ME' })),
      competitor('c', enriched({ id: 'intel-3', competitor_id: 'c', porte: 'GRANDE' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Porte predominante');
    expect(card?.value).toBe('ME (67%)');
    expect(card?.description).toContain('2 de 3');
    expect(card?.trend).toBe('neutral');
  });

  it('omits the card when no porte data', () => {
    const comps = [competitor('a', enriched({ porte: null as unknown as string }))];
    const insights = buildIndustryInsights(comps, []);
    expect(insights.find((i) => i.label === 'Porte predominante')).toBeUndefined();
  });
});

describe('buildIndustryInsights — geographic concentration', () => {
  it('reports the dominant UF and flags high concentration', () => {
    const comps = [
      competitor('a', enriched({ uf: 'SP' })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', uf: 'SP' })),
      competitor('c', enriched({ id: 'intel-3', competitor_id: 'c', uf: 'SP' })),
      competitor('d', enriched({ id: 'intel-4', competitor_id: 'd', uf: 'RJ' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Concentração geográfica');
    expect(card?.value).toBe('SP');
    expect(card?.description).toContain('3 de 4');
    expect(card?.trend).toBe('down'); // high concentration
  });

  it('reports neutral when distribution is spread', () => {
    const comps = [
      competitor('a', enriched({ uf: 'SP' })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', uf: 'RJ' })),
      competitor('c', enriched({ id: 'intel-3', competitor_id: 'c', uf: 'MG' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Concentração geográfica');
    expect(card?.trend).toBe('neutral');
  });

  it('filters out invalid UF values', () => {
    const comps = [
      competitor('a', enriched({ uf: 'INVALID-LONG-STRING' })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', uf: 'SP' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Concentração geográfica');
    expect(card?.value).toBe('SP');
  });
});

describe('buildIndustryInsights — SPI average', () => {
  it('reports average and dominant category', () => {
    const comps = [
      competitor('a', enriched({ spi_score: 80, spi_category: 'SCALEUP' })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', spi_score: 70, spi_category: 'SCALEUP' })),
      competitor('c', enriched({ id: 'intel-3', competitor_id: 'c', spi_score: 60, spi_category: 'EMERGING' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'SPI médio');
    expect(card?.value).toBe('70/100');
    expect(card?.description).toContain('SCALEUP');
    expect(card?.trend).toBe('up'); // >= 70
  });

  it('reports down trend when SPI < 40', () => {
    const comps = [
      competitor('a', enriched({ spi_score: 30, spi_category: 'MICRO' })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', spi_score: 35, spi_category: 'MICRO' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'SPI médio');
    expect(card?.value).toBe('33/100');
    expect(card?.trend).toBe('down');
  });

  it('omits the card when no SPI data', () => {
    const comps = [competitor('a', enriched({ spi_score: null as unknown as number }))];
    const insights = buildIndustryInsights(comps, []);
    expect(insights.find((i) => i.label === 'SPI médio')).toBeUndefined();
  });
});

describe('buildIndustryInsights — OFS risk', () => {
  it('reports down trend when most competitors are high-risk', () => {
    const comps = [
      competitor('a', enriched({ ofs_risk_level: 'HIGH' })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', ofs_risk_level: 'CRITICAL' })),
      competitor('c', enriched({ id: 'intel-3', competitor_id: 'c', ofs_risk_level: 'LOW' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Perfil de risco (OFS)');
    expect(card?.trend).toBe('down');
    expect(card?.description).toContain('2 de 3 com risco alto/crítico');
  });

  it('reports up trend when most are low risk', () => {
    const comps = [
      competitor('a', enriched({ ofs_risk_level: 'LOW' })),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b', ofs_risk_level: 'LOW' })),
      competitor('c', enriched({ id: 'intel-3', competitor_id: 'c', ofs_risk_level: 'MEDIUM' })),
    ];
    const insights = buildIndustryInsights(comps, []);
    const card = insights.find((i) => i.label === 'Perfil de risco (OFS)');
    expect(card?.trend).toBe('up');
  });
});

describe('buildIndustryInsights — market signals', () => {
  it('reports count and sentiment breakdown', () => {
    const comps = [competitor('a', enriched({}))];
    const signals = [
      signal('s1', 'positive'),
      signal('s2', 'positive'),
      signal('s3', 'negative'),
      signal('s4', 'neutral'),
    ];
    const insights = buildIndustryInsights(comps, signals);
    const card = insights.find((i) => i.label === 'Sinais de mercado detectados');
    expect(card?.value).toBe('4');
    expect(card?.description).toContain('2 positivos');
    expect(card?.trend).toBe('up');
  });

  it('reports down trend when negative signals dominate', () => {
    const signals = [
      signal('s1', 'negative'),
      signal('s2', 'negative'),
      signal('s3', 'positive'),
    ];
    const insights = buildIndustryInsights([], signals);
    const card = insights.find((i) => i.label === 'Sinais de mercado detectados');
    expect(card?.trend).toBe('down');
  });

  it('omits the card when there are no signals', () => {
    const insights = buildIndustryInsights([competitor('a', null)], []);
    expect(insights.find((i) => i.label === 'Sinais de mercado detectados')).toBeUndefined();
  });
});

describe('buildIndustryInsights — composition', () => {
  it('returns insights in deterministic order', () => {
    const comps = [
      competitor('a', enriched({})),
      competitor('b', enriched({ id: 'intel-2', competitor_id: 'b' })),
    ];
    const signals = [signal('s1', 'positive')];
    const insights = buildIndustryInsights(comps, signals);
    const labels = insights.map((i) => i.label);
    // Order: monitorados, enriquecidas, capital, porte, geo, SPI, OFS, sinais
    expect(labels).toEqual([
      'Concorrentes monitorados',
      'Empresas enriquecidas',
      'Capital social somado',
      'Porte predominante',
      'Concentração geográfica',
      'SPI médio',
      'Perfil de risco (OFS)',
      'Sinais de mercado detectados',
    ]);
  });

  it('all insights conform to the IndustryInsight shape', () => {
    const comps = [competitor('a', enriched({}))];
    const insights: IndustryInsight[] = buildIndustryInsights(comps, []);
    for (const i of insights) {
      expect(typeof i.label).toBe('string');
      expect(i.label.length).toBeGreaterThan(0);
      expect(typeof i.value).toBe('string');
      expect(typeof i.description).toBe('string');
      expect(['up', 'down', 'neutral']).toContain(i.trend);
    }
  });
});