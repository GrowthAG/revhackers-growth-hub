# PLANO MASTER DE EXECUÇÃO — RevHackers 2026

> **Data:** 2026-07-26
> **Metodologia:** Hormozi (5 Milestones × 30 dias) + Donna Weber (6 Fases Orchestrated Onboarding)
> **Orquestrador:** Aside (eu) gera plano e valida | Gemini (terminal) executa código

---

## PARTE 1: O QUE JÁ FIZEMOS NESTA CONVERSA (Estado Atual Completo)

### ✅ Bloco 1: Fundação Estratégica (livros e bibliotecas)
- [x] Catálogo de livros estratégicos salvo em `docs/BIBLIOTECA_REVHACKERS_ESTRATEGICA.md`
- [x] Cérebro REI estruturado em `docs/cerebro-rei/` com 7 documentos:
  - `00-INDICE-CEREBRO-REI.md` (índice central)
  - `01-framework-rei-orchestrated-onboarding.md` (Donna Weber, 6 fases O1-O6)
  - `02-framework-abm-vajre.md` (Sangram Vajre)
  - `03-framework-spin-selling.md` (Neil Rackham)
  - `04-framework-meddicc.md` (Andy Whyte)
  - `05-framework-hormozi-grand-slam-offer.md` (Alex Hormozi)
  - `06-integracao-hormozi-plugin-rei.md` (Blueprint REI 2.0 híbrido)

### ✅ Bloco 2: Inteligência de Dados — FonteData
- [x] API endpoint `GET /v1/opportunities/lookup` consumindo FonteData com CNPJ
- [x] Domínio `opportunities` migrado para API GCP com auto-fill em `DiagnosticForm.tsx`
- [x] Serviço `FonteDataService` corrigido (X-API-Key header, base URL correta)
- [x] Validação de CNPJ (Gatekeeper) e mapeamento de payload (SPI, Holding Hunter, OFS)
- [x] Sandbox/Mock fallback para testes com gasto zero
- [x] 5 testes Vitest cobrindo CNPJ lookup e auto-preenchimento

### ✅ Bloco 3: Motor Financeiro
- [x] Migration `20260726000000_create_financial_reconciliation.sql` (4 tabelas)
- [x] Migration `20260726000001_add_financial_entities.sql` (multi-tenant)
- [x] Domínio `finance` no backend (types, repository, engine de matching, connectors)
- [x] Conectores: Stripe, Pluggy, InfinitePay, PagBank, OFX parser, CSV parser
- [x] Routes `POST /v1/finance/{statements/import, reconcile, dre}` + `GET /v1/finance/statements/unreconciled`
- [x] Página React `FinanceCockpit.tsx` com badges de status, DRE multi-entidade, gráficos
- [x] 52 testes Vitest cobrindo engine de matching, conectores e endpoints
- [x] **Resultado:** 136/136 testes passando em 13 suítes

### ✅ Bloco 4: Motor REI (Onboarding Orquestrado Hormozi + Donna Weber)
- [x] Domínio `rei` no backend (`types.ts`, `templates.ts`, `postgres-repository.ts`)
- [x] Templates Hormozi oficiais reproduzidos: Welcome (D0), Kickoff (D1-3), Wrap-up (D30)
- [x] Routes `POST /v1/rei/{onboarding, welcome, kickoff, quick-win, nps, wrap-up}` + `GET /v1/rei/onboarding/active`
- [x] 13 testes Vitest cobrindo todos os endpoints REI
- [x] Registrado no main.ts do API GCP (precedência sobre finance)
- [x] **Resultado:** 149/149 testes passando em 14 suítes

### ✅ Bloco 5: Auditoria de Segurança
- [x] Removida chave ativa da FonteData hardcoded em `fontedata-service.ts`
- [x] Relatório `docs/RELATORIO_AUDITORIA_SEGURANCA_QUALIDADE.md` completo

---

## PARTE 2: O QUE FALTA FAZER (Tasks Pendentes em 5 Fases)

### 🟦 FASE 1 (D-7 → D-3): Quick Win Icônico (Migration 1 REI + Dashboard REI)

> **Objetivo Hormozi M2:** Configurar o REI Dashboard personalizado do cliente até D7 com URL privada e Health Score visível.

| Task ID | Descrição | Componente | Tipo | Esforço | Dependência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T1.1 | Criar migration `20260728000000_create_rei_onboarding.sql` com tabela `rei_onboarding` (espelhando `types.ts`) | Backend | Migration | 30min | Nenhuma |
| T1.2 | Rodar `npx vitest run tests/api/` e confirmar 149/149 passando (regressão zero) | Validação | QA | 5min | T1.1 |
| T1.3 | Criar migration `20260728000001_create_rei_quick_wins.sql` com tabela `rei_quick_wins` (descrição, url, loom, entregue_em) | Backend | Migration | 20min | T1.1 |
| T1.4 | Criar página React `src/pages/admin/REICockpit.tsx` com Kanban O1-O6 e Health Score | Frontend | Página | 2h | T1.1 |
| T1.5 | Adicionar rota `/admin/rei` no AdminLayout da RevHackers | Frontend | Roteamento | 10min | T1.4 |
| T1.6 | Configurar env var `VITE_REI_DASHBOARD_URL` no `.env` | Frontend | Config | 5min | T1.4 |
| T1.7 | Criar testes Vitest para `REICockpit.tsx` (renderização Kanban) | Validação | QA | 1h | T1.4 |
| T1.8 | Validação final: `tsc --noEmit` + `vitest run` + smoke test do dashboard | Validação | QA | 30min | T1.1, T1.3-T1.7 |

**Total Fase 1:** ~5h | **Entregável Hormozi:** M2 Quick Win (REI Dashboard)

---

### 🟦 FASE 2 (D-3 → D+7): Inteligência Estratégica (Migration 2 + Framework Expansion)

> **Objetivo Hormozi M1:** Aumentar cobertura de frameworks de 15 para 37 (paridade com The Growth Hub).

| Task ID | Descrição | Componente | Tipo | Esforço | Dependência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T2.1 | Criar migration `20260728000002_create_competitors.sql` (4 tabelas: competitors, intelligence, comparisons, signals) | Backend | Migration | 1h | Nenhuma |
| T2.2 | Criar migration `20260728000003_extend_growthmap_for_intelligence.sql` (share_token, pdf_url, industry_metrics, regenerate_count) | Backend | Migration | 30min | Nenhuma |
| T2.3 | Criar backend domain `intelligence` em `api/src/domains/intelligence/` (types, postgres-repository, fontedata-connector) | Backend | Domínio | 2h | T2.1 |
| T2.4 | Criar route `POST /v1/intelligence/competitors` que consome FonteData (CNPJ enrichment) | Backend | Rota | 1h | T2.3 |
| T2.5 | Criar route `GET /v1/intelligence/competitors/:project_id` (lista concorrentes do projeto) | Backend | Rota | 30min | T2.3 |
| T2.6 | Atualizar `FRAMEWORK_CATALOG` em `src/api/growthmap.ts` (de 15 para 37 frameworks) | Backend | Código | 1h | Nenhuma |
| T2.7 | Criar testes para `intelligence` domain (matching, enrichment, ranking) | Validação | QA | 1.5h | T2.3-T2.5 |
| T2.8 | Validação: `tsc --noEmit` + `vitest run` (esperado: 165+ testes passando) | Validação | QA | 30min | T2.1-T2.7 |

**Total Fase 2:** ~8h | **Entregável Hormozi:** M1 Industry Insights (CRM Brasil R$ 2,8 bi TAM)

---

### 🟦 FASE 3 (D+7 → D+14): Aceleração de Mídia (Dossiê do Cliente + AD-HOC)

> **Objetivo Hormozi M3:** NPS de valor agregado no D14 + primeira captura de inteligência de mercado automatizada.

| Task ID | Descrição | Componente | Tipo | Esforço | Dependência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T3.1 | Criar migration `20260728000004_create_intelligence_jobs.sql` (queue assíncrona FonteData) | Backend | Migration | 30min | T2.1 |
| T3.2 | Criar backend service `IntelligenceJobProcessor` (background worker com `setImmediate`) | Backend | Serviço | 1.5h | T3.1 |
| T3.3 | Criar página `src/pages/admin/IntelligenceDashboard.tsx` com cards coloridos (The Growth Hub style) | Frontend | Página | 2h | T2.4, T2.5 |
| T3.4 | Implementar botão "Regenerar" no FrameworkCard.tsx | Frontend | Componente | 30min | T3.3 |
| T3.5 | Criar testes para o job processor e dashboard | Validação | QA | 1.5h | T3.1-T3.4 |
| T3.6 | Validação: `tsc --noEmit` + `vitest run` + smoke test do dashboard | Validação | QA | 30min | T3.1-T3.5 |

**Total Fase 3:** ~6.5h | **Entregável Hormozi:** M3 NPS D14 (primeira medição de satisfação)

---

### 🟦 FASE 4 (D+14 → D+21): Quick Win de Escala (Documentos Premium + Compartilhamento)

> **Objetivo Hormozi M4:** Quick Win visível e atribuível ao D21. Cliente mostra o dashboard para a equipe/chefe.

| Task ID | Descrição | Componente | Tipo | Esforço | Dependência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T4.1 | Criar route `GET /v1/intelligence/share/:share_token` (compartilhamento público sem login) | Backend | Rota | 1h | T2.2 |
| T4.2 | Criar página pública `src/pages/PublicGrowthMap.tsx` (visualiza growthmap sem auth) | Frontend | Página | 2h | T4.1 |
| T4.3 | Implementar exportação PDF do growthmap (usando `html2canvas` + `jspdf` que já estão instalados) | Frontend | Feature | 2h | T1.4, T3.3 |
| T4.4 | Criar teste E2E para o fluxo de compartilhamento | Validação | QA | 1.5h | T4.1-T4.3 |
| T4.5 | Validação: `tsc --noEmit` + `vitest run` | Validação | QA | 30min | T4.1-T4.4 |

**Total Fase 4:** ~7h | **Entregável Hormozi:** M4 Quick Win visível e compartilhável

---

### 🟦 FASE 5 (D+21 → D+30): Wrap-up + NPS Formal + Expansion

> **Objetivo Hormozi M5:** Wrap-up formal + NPS final + transição para O6 (Expansion) de Donna Weber.

| Task ID | Descrição | Componente | Tipo | Esforço | Dependência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T5.1 | Criar route `POST /v1/rei/wrap-up` (já existe, mas falta integração com expansion tracking) | Backend | Refactor | 1h | Nenhuma |
| T5.2 | Criar migration `20260728000005_create_rei_expansion_opportunities.sql` (track de upsell pós-onboarding) | Backend | Migration | 30min | T1.1 |
| T5.3 | Criar tabela `public_growthmap_analytics` (tracking de visualizações do link compartilhado) | Backend | Migration | 30min | T2.2 |
| T5.4 | Implementar NPS D30 automático via webhook + email | Backend | Automação | 1.5h | T1.1 |
| T5.5 | Criar testes E2E do ciclo completo (5 milestones Hormozi + 6 fases Donna Weber) | Validação | QA | 2h | T1-T4 completos |
| T5.6 | Validação final: `tsc --noEmit` + `vitest run` (esperado: 200+ testes passando) | Validação | QA | 30min | T5.1-T5.5 |

**Total Fase 5:** ~6h | **Entregável Hormozi:** M5 Wrap-up + Expansion Pipeline

---

## PARTE 3: ESTRATÉGIA DE ORQUESTRAÇÃO (Quem Faz O Quê)

### 🎭 Aside (Eu) — Orquestrador
- **Geração do plano:** escrevi este documento.
- **Geração de prompts:** vou gerar 1 prompt detalhado por fase, com contexto completo, critério de aceite e comando de validação.
- **Validação contínua:** rodo `tsc --noEmit` e `vitest run` após cada batch do Gemini.
- **Auditoria de segurança:** reviso o código gerado em busca de segredos expostos e más práticas.

### 🤖 Gemini (Terminal) — Executor
- **Execução de migrations:** cria arquivos `.sql` com DDL seguro.
- **Implementação de tipos e repository:** escreve TypeScript com tipos estritos.
- **Criação de rotas HTTP:** implementa os endpoints seguindo o padrão Fetch-based.
- **Criação de páginas React:** implementa a UI com Tailwind e Lucide icons.
- **Execução de testes:** roda `tsc --noEmit` e `vitest run` durante o desenvolvimento.

### 👤 Giulliano (Você) — Orquestrador Humano
- **Copy/paste de prompts:** cola cada prompt do Gemini no terminal.
- **Decisões de negócio:** aprova ou ajusta tarefas baseando-se no seu contexto.
- **Gate final:** aprova PRs antes de merge para produção.

---

## PARTE 4: CRONOGRAMA DE EXECUÇÃO (1 semana)

| Dia | Fase | Tasks | Horas |
| :--- | :--- | :--- | :--- |
| **D-7** (Sáb) | Fase 1 (REI) | T1.1, T1.2, T1.3, T1.4 | ~4h |
| **D-5** (Seg) | Fase 1 (continuação) | T1.5, T1.6, T1.7, T1.8 | ~2h |
| **D-4** (Ter) | Fase 2 (Inteligência) | T2.1, T2.2, T2.3, T2.4, T2.5, T2.6, T2.7, T2.8 | ~8h |
| **D-2** (Qui) | Fase 3 (Aceleração) | T3.1, T3.2, T3.3, T3.4, T3.5, T3.6 | ~6.5h |
| **D+1** (Sáb) | Fase 4 (Escala) | T4.1, T4.2, T4.3, T4.4, T4.5 | ~7h |
| **D+3** (Seg) | Fase 5 (Wrap-up) | T5.1, T5.2, T5.3, T5.4, T5.5, T5.6 | ~6h |

**Total:** ~33.5 horas | **Resultado:** 200+ testes passando + 5 migrations + 5 Hormozi milestones completos + REI Dashboard + Intelligence Dashboard + Compartilhamento público.

---

## PARTE 5: CRITÉRIOS DE SUCESSO POR FASE

### Fase 1: REI Quick Win
- [ ] Migration `rei_onboarding` aplicada com sucesso no Postgres local.
- [ ] Página `REICockpit.tsx` renderiza Kanban com 6 fases O1-O6.
- [ ] `vitest run` retorna **149+ testes passando**.

### Fase 2: Inteligência Estratégica
- [ ] 4 migrations de competitors + intelligence + market signals aplicadas.
- [ ] Domínio `intelligence` no backend com 6 métodos testados.
- [ ] 2 rotas HTTP (`POST /v1/intelligence/competitors` e `GET /v1/intelligence/competitors/:id`).
- [ ] `FRAMEWORK_CATALOG` expandido de 15 para 37 frameworks.
- [ ] `vitest run` retorna **165+ testes passando**.

### Fase 3: Aceleração de Mídia
- [ ] Migration `intelligence_jobs` aplicada.
- [ ] Job processor com `setImmediate` rodando em background.
- [ ] `IntelligenceDashboard.tsx` renderiza cards coloridos (The Growth Hub style).
- [ ] Botão "Regenerar" funcional no FrameworkCard.
- [ ] `vitest run` retorna **175+ testes passando**.

### Fase 4: Quick Win de Escala
- [ ] Route `GET /v1/intelligence/share/:share_token` funcionando.
- [ ] Página `PublicGrowthMap.tsx` renderiza sem auth.
- [ ] Exportação PDF funcional.
- [ ] `vitest run` retorna **190+ testes passando**.

### Fase 5: Wrap-up + Expansion
- [ ] Migration `rei_expansion_opportunities` aplicada.
- [ ] Migration `public_growthmap_analytics` aplicada.
- [ ] Webhook NPS D30 enviando emails automaticamente.
- [ ] `vitest run` retorna **200+ testes passando**.

---

## PARTE 6: PRÓXIMOS PASSOS IMEDIATOS

Vou agora gerar o **Prompt Master para a Fase 1** (o primeiro batch de tasks T1.1 a T1.8). Você vai colar no terminal do Gemini e ele vai executar tudo em uma sessão focada.

> **Aguardando sua confirmação para gerar o Prompt Master da Fase 1...**