# Arquitetura de Dados Frugal: Enriquecimento de Alta Performance com Baixo Custo (RevHackers)

Este documento estabelece o desenho estratégico para realizar enriquecimentos de dados nos diagnósticos e relatórios de inteligência (Growth Hub) da RevHackers da forma mais econômica possível, otimizando os custos de API (Unit Economics) e garantindo um ROI astronômico na captação de leads B2B.

---

## 1. Os Três Pilares da Frugalidade de Dados

Para evitar o consumo desnecessário de créditos de API (como os R$ 20,00 iniciais que você já possui e futuras recargas), a nossa engenharia de dados segue três princípios fundamentais:

```
               +--------------------------------------------+
               | 1. CADASTRO DE LEAD (CNPJ ou E-mail)       |
               +---------------------+----------------------+
                                     |
                                     v
               +---------------------+----------------------+
               | 2. CAMADA DE CACHE LOCAL (Postgres)        |
               +---------------------+----------------------+
                                     |
                  +------------------+------------------+
                  | Existe Cache?                       | Não Existe
                  v (Sim, < 60 dias)                    v
       +----------+-----------+               +---------+-----------+
       |   Retorna Custo Zero  |               |  Filtro de Domínio  |
       | (Consumo Local Postgres)              +---------+-----------+
       +----------------------+                          |
                                        +----------------+----------------+
                                        | Corporativo?                    | Público (Gmail)
                                        v (Sim)                           v
                             +----------+-----------+           +---------+-----------+
                             |   Camada de API Básica|           |   Bloqueia Chamada  |
                             |   (R$ 0.16 - Receita)|           | (Entrega Mock/Promo)|
                             +----------+-----------+           +---------------------+
                                        |
                                        v (SDR Qualifica Lead de Alto Ticket?)
                             +----------+-----------+
                             |   Camada Premium     |
                             | (Processos / Score)  |
                             +----------------------+
```

### Pilar A: Cache Local de Longa Duração (Custo Zero para Recorrência)
*   **Conceito:** Dados corporativos oficiais (como Capital Social, Sócios e CNAEs) mudam de forma extremamente lenta (normalmente de ano em ano ou em alterações contratuais esporádicas).
*   **Regra de Engenharia:** Criamos uma tabela local no Cloud SQL chamada `cached_company_enrichments`. Toda vez que um CNPJ for consultado no dadmin ou no diagnóstico, o sistema verifica se possui os dados salvos localmente e se eles possuem menos de 60 dias de idade.
*   **Resultado:** Se o lead preencher o diagnóstico mais de uma vez ou se consultarmos empresas repetidas, a requisição consome **R$ 0.00** de custos de API, buscando diretamente do Postgres local.

### Pilar B: Enriquecimento Progressivo (Cascading Queries)
*   **Conceito:** Nunca dispare consultas caras (como processos judiciais ou scores de crédito complexos) de forma indiscriminada para todos os visitantes do site.
*   **Regra de Engenharia:** Dividimos a requisição em camadas dependendo da maturidade do lead no funil:
    *   *Fase de Cadastro (Atração):* Usar apenas a consulta básica `Consulta CNPJ Receita` (R$ 0.16) para auto-preencher os campos e calcular o SPI (ScalePower Index) inicial.
    *   *Fase de Qualificação Comercial (Vendas):* Apenas se o lead passar pelo filtro de qualificação (SPI Alto, e-mail corporativo válido) e for qualificado pelo SDR como uma oportunidade real de alto ticket, o dadmin aciona o enriquecimento premium (como a API `Processos Agrupada` @ R$ 1.65 para a Auditoria SRA).
*   **Resultado:** Você reduz o custo por lead capturado comum de R$ 3.00 para apenas **R$ 0.16**, reservando as consultas de R$ 1.65 apenas para os leads com real potencial de fechamento contratual.

### Pilar C: Filtro de Domínio Público (Anti-Spam / Anti-Spammer)
*   **Conceito:** Curiosos e concorrentes frequentemente usam e-mails gratuitos (Gmail, Outlook, Yahoo) para testar ferramentas online.
*   **Regra de Engenharia:** Se o lead preencher o formulário usando um domínio de e-mail público genérico, a chamada à API mestre da FonteData é **bloqueada de forma automática**. O sistema exibe o resultado do diagnóstico na tela usando o nosso modelo simulado inteligente (Sandbox) e solicita: *"Insira seu e-mail corporativo para desbloquear a auditoria societária real e o ScalePower Index oficial da sua empresa"*.
*   **Resultado:** Evita que bots ou curiosos consumam seu saldo pré-pago de dados, reservando os créditos apenas para empresas reais.

---

## 2. Substituições Inteligentes de Baixo Custo (Gemas do Catálogo)

Analisando as 121 APIs da FonteData, podemos trocar endpoints caros por substitutos que entregam 90% do valor de negócios por uma fração do preço:

| Objetivo Comercial | Endpoint Caro (Evitar) | Endpoint Barato (Usar) | Economia Unitária |
| :--- | :--- | :--- | :--- |
| Medir poder financeiro | `Boa Vista Risco PJ` (R$ 14.64) | **Cadastro PJ Plus (R$ 0.54)** | **96.3% de economia** (usamos o Capital Social real e histórico de Simples Nacional como proxy de caixa). |
| Analisar riscos de fraude | `Boa Vista Completo PF` (R$ 19.40) | **Validação Cadastral Brasil (R$ 0.43)** | **92.1% de economia** (valida CPF contra base oficial com score de match de identidade). |
| Verificar litígios e processos | `Processos Completa` (R$ 4.69) | **Processos Agrupada (R$ 1.65)** | **64.8% de economia** (traz a consolidação de processos ativos estaduais e federais em uma única chamada leve). |
| Certidão de débitos | `Protestos Brasil` (R$ 6.50) | **PGFN Devedores (R$ 0.43)** | **93.3% de economia** (inscrição na dívida ativa é o maior indicador de insolvência). |

---

## 3. Travas de Segurança Operacional (Rate Limits)

Para garantir que ataques coordenados ou bots não consumam seus créditos e saldos de forma maliciosa:
1.  **Rate Limit por IP:** Limitar requisições de lookup a no máximo 3 consultas por IP a cada 24 horas no frontend.
2.  **Travas de Limite Mensal no dadmin:** Adicionar uma configuração de orçamento mensal no painel dadmin (exemplo: bloquear automaticamente novas consultas de enriquecimento quando o consumo da API passar de R$ 150,00 no mês, exigindo liberação manual do Giulliano/CFO).
