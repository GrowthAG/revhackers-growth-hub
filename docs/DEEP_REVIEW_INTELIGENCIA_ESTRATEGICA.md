# Deep Review: Inteligência Estratégica e Diagnóstico de Concorrentes (RevHackers)

> **Data:** 2026-07-26
> **Benchmark:** The Growth Hub (`thegrowthhub.com.br/dashboard?section=inteligencia-estrategica`)
> **Autorização:** O concorrente nos autorizou a criar algo superior.

---

## 1. Inventário Completo do Concorrente (The Growth Hub)

A The Growth Hub entrega o produto **GrowthMap**, que é um "estudo estratégico 100% personalizado com 37 frameworks científicos". Analisando os 3 screenshots, identifiquei o catálogo exato:

### Pilar 1: Inteligência Estratégica (9 frameworks)
1. Industry Insights
2. TAM/SAM/SOM
3. Análise SWOT
4. Análise PESTEL
5. Cinco Forças de Porter
6. Benchmarking VRIO
7. Análise VRIO Interna
8. Blue Ocean Strategy
9. Ansoff Matrix

### Pilar 2: Concepção de Valor (10 frameworks)
1. Business Model Canvas
2. CATWOE Analysis
3. Personas Detalhadas
4. Jobs To Be Done
5. Mapa de Empatia
6. Customer Journey Map
7. Value Proposition Canvas
8. USP (Proposta Única de Valor)
9. Design Thinking Canvas
10. Game Changing Idea

### Pilar 3: MVP e Validação Ágil (6 frameworks)
1. Caminho para MVP
2. Lean Canvas
3. Minimum Viable Product
4. Análise Heurística UX
5. Innovation Accounting
6. ICE Score Framework

### Pilar 4: Escalabilidade (16 frameworks)
1. Funil Pirata (AARRR)
2. Go-to-Market Strategy
3. Marketing e Branding
4. Growth Loops
5. Programa de Parceiros
6. Game Changing Scaling
7. Horizon 1-2-3 (McKinsey)
8. Performance Metrics
9. Estratégia Financeira
10. North Star Metric
11. SquadMatch
12. ExecutionLoop

**TOTAL: 37 frameworks** (exatamente o número que eles anunciam).

### Visual do Dashboard (Print 3)
A seção "Inteligência Estratégica" mostra:
- Header com título do projeto e botões de "Compartilhar" e "Salvar"
- Card "Pilar 1 - Inteligência Estratégica" com descrição
- Bloco "INDUSTRY INSIGHTS" com 4 cards de métricas:
  - **R$ 2,8 bi** - TAM CRM/Martech Brasil 2025
  - **68%** - PMEs sem CRM estruturado
  - **3x** - Custo HubSpot vs. alternativa local
  - **-18% a.a.** - Crescimento do mercado
  - **R$ 1.200/ano** - Ticket médio PME em CRM
- Bloco "Vetores de Crescimento" e "Desafios do Setor"
- Botão "Regenerar" no canto superior direito
- Botão de compartilhamento no rodapé: "Compartilhe este GrowthMap com seus sócios"

### Menu Lateral (Print 1 e 2)
A navegação mostra o usuário logado no rodapé (Giulliano Alves - Empresa) e a lista completa de frameworks agrupada por pilar, todos com ícones customizados.

---

## 2. O Que Já Temos Implementado na RevHackers (Estado Atual)

### A. Backend (API GCP)
| Componente | Status | Localização |
| :--- | :--- | :--- |
| Domínio `growthmap` migrado | ✅ | `api/src/domains/growthmap/` |
| Tabela `growthmap_results` com JSONB | ✅ | `supabase/migrations/20260722000000_create_growthmap_results.sql` |
| RLS Policies ativas | ✅ | Mesmo arquivo |
| Adapter GCP pronto | ✅ | `src/api/adapters/growthmap-gcp.ts` |
| Catálogo de frameworks no código | ✅ (15 frameworks) | `src/api/growthmap.ts` (FRAMEWORK_CATALOG) |
| Página React `GrowthMap.tsx` com 4 pilares | ✅ | `src/pages/GrowthMap.tsx` |

### B. Frameworks Já Cobertos no Nosso GrowthMap (15)
**Pilar 1 — Inteligência Estratégica (5):**
- TAM/SAM/SOM ✅
- SWOT ✅
- PESTEL ✅
- 5 Forças de Porter ✅
- Benchmarking VRIO ✅

**Pilar 2 — Concepção de Valor (4):**
- Empathy Map ✅
- Customer Journey Map ✅
- Value Proposition Canvas ✅
- USP ✅

**Pilar 3 — MVP & Validação (2):**
- Lean Canvas ✅
- Design Thinking Canvas ✅

**Pilar 4 — Escalabilidade (4):**
- AARRR (Funil Pirata) ✅
- Go-to-Market Strategy ✅
- ICE Score ✅
- North Star Metric ✅

---

## 3. Gap Analysis: O Que Falta Para Superar a The Growth Hub

### Frameworks Faltantes (22 deles, contra 37 que eles têm)

**Pilar 1 (faltam 4):**
- ❌ Industry Insights (com dados de mercado específicos)
- ❌ Análise VRIO Interna
- ❌ Blue Ocean Strategy
- ❌ Ansoff Matrix

**Pilar 2 (faltam 6):**
- ❌ Business Model Canvas (Business Model Canvas)
- ❌ CATWOE Analysis
- ❌ Personas Detalhadas
- ❌ Jobs To Be Done
- ❌ Game Changing Idea

**Pilar 3 (faltam 4):**
- ❌ Caminho para MVP
- ❌ Minimum Viable Product
- ❌ Análise Heurística UX
- ❌ Innovation Accounting

**Pilar 4 (faltam 12):**
- ❌ Marketing e Branding
- ❌ Growth Loops
- ❌ Programa de Parceiros
- ❌ Game Changing Scaling
- ❌ Horizon 1-2-3 (McKinsey)
- ❌ Performance Metrics
- ❌ Estratégia Financeira
- ❌ SquadMatch
- ❌ ExecutionLoop
- ❌ Marketing e Branding
- ❌ Growth Loops
- ❌ Programa de Parceiros
- ❌ Game Changing Scaling
- ❌ Horizon 1-2-3 (McKinsey)
- ❌ Performance Metrics
- ❌ Estratégia Financeira
- ❌ SquadMatch
- ❌ ExecutionLoop

### Features UI/UX Faltantes

| Feature | The Growth Hub | RevHackers (Atual) | RevHackers (Necessário) |
| :--- | :--- | :--- | :--- |
| Dashboard visual de Inteligência Estratégica com cards de métricas | ✅ | ❌ | Necessário |
| Botão "Regenerar" por framework | ✅ | ❌ | Necessário |
| Cards coloridos com TAM/métricas de mercado (R$ X bi, %, etc.) | ✅ | ❌ | Necessário |
| Compartilhamento público (link com token) | ✅ | ❌ | Necessário |
| Relatório em PDF | ✅ | ❌ | Necessário |
| Chat integrado (Theo AI) | ✅ | ❌ | Fase 2 |
| Diagnóstico de Concorrentes (FOCO DO CONCORRENTE) | ❌ | ❌ | Diferencial único nosso |

### Diferencial Competitivo Disponível

A The Growth Hub **NÃO tem diagnóstico de concorrentes dedicado**. A integração com a FonteData nos dá a oportunidade de criar um **módulo único** de "Competitive Intelligence" que usa:
- CNPJ enrichment via FonteData
- Mapping de sócios e holdings (Holding Hunter)
- Análise SWOT dinâmica comparativa
- Tracking de movimentações de mercado

---

## 4. Plano de Migrations (Roadmap para Superar a The Growth Hub)

### Migration 1: `20260728000000_create_competitors.sql`
- Tabela `competitors` (dados cadastrais: nome, CNPJ, setor, website).
- Tabela `competitor_intelligence` (dados enriquecidos via FonteData).
- Tabela `competitor_comparisons` (matriz comparativa por projeto).
- Tabela `market_signals` (news, mudanças de pricing, lançamentos).
- Tabela `industry_metrics` (dados de mercado TAM, crescimento %, benchmarks).

### Migration 2: `20260728000001_extend_growthmap_results.sql`
- Adicionar colunas em `growthmap_results`:
  - `share_token` (token UUID para compartilhamento público)
  - `pdf_url` (URL do relatório PDF gerado)
  - `industry_metrics` (JSONB com os dados do print "INDUSTRY INSIGHTS")
  - `regenerate_count` (contador de regenerações)
  - `share_count` (contador de compartilhamentos)
- Criar tabela `growthmap_shares` (tracking de quem acessou o link compartilhado).

### Migration 3: `20260728000002_create_competitor_jobs.sql`
- Tabela `competitor_jobs` (queue assíncrona para enriquecimento FonteData).
- Tabela `competitor_findings` (insights de IA sobre o concorrente).

### Migration 4: `20260728000003_create_market_intelligence.sql`
- Tabela `market_intelligence_reports` (relatórios exportáveis por setor).
- Storage bucket para PDFs de relatórios.

---

## 5. Próximos Passos Operacionais

1. **Aprovar o plano de migrations** (acima).
2. **Implementar a Migration 1** (competitors + FonteData enrichment).
3. **Construir o endpoint `POST /v1/intelligence/competitors`** que consome FonteData.
4. **Atualizar o FRAMEWORK_CATALOG** no `src/api/growthmap.ts` para incluir os 22 frameworks faltantes.
5. **Criar a página `IntelligenceDashboard.tsx`** com os cards coloridos do print 3.
6. **Testar com o cliente real que autorizou** (lead que conversamos).

---

## 6. Comparativo Direto Final (RevHackers vs. The Growth Hub)

| Feature | The Growth Hub | RevHackers (Atual) | RevHackers (Após Migrations) |
| :--- | :--- | :--- | :--- |
| Total de Frameworks | 37 | 15 (41%) | 37+ (100%) |
| Dashboard Visual de Inteligência | ✅ | ❌ | ✅ |
| Diagnóstico de Concorrentes (CNPJ) | ❌ | ❌ | ✅ **(Diferencial único)** |
| Industry Insights (dados de mercado) | ✅ | ❌ | ✅ |
| Blue Ocean Strategy | ✅ | ❌ | ✅ |
| Ansoff Matrix | ✅ | ❌ | ✅ |
| CATWOE / Jobs To Be Done | ✅ | ❌ | ✅ |
| Compartilhamento Público | ✅ | ❌ | ✅ |
| Relatório PDF | ✅ | ❌ | ✅ |
| Integração com CNPJ Enrichment (FonteData) | ❌ | ❌ | ✅ **(Vantagem técnica)** |
| Tracking de Movimentações de Mercado | ❌ | ❌ | ✅ |

**Conclusão:** Após as 4 migrations + 2 endpoints + 1 página, não só alcançamos paridade como **superamos** em 2 dimensões críticas: diagnóstico de concorrentes (que eles não têm) e integração com enrichment de CNPJ em tempo real.