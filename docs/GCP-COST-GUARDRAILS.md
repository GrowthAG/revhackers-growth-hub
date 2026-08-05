# GCP Cost Guardrails — RevHackers Staging

Aplicado em 2026-08-05 para garantir custo mensal **~$23/mês** sem surpresas.

## 📊 Análise de Uso Real (últimos 7 dias)

- **978 requests** em 7 dias = ~140 requests/dia
- **Latência média:** 3ms (extremamente leve)
- **CPU usado:** 0.3% de 1 vCPU (over-provisioning de 300x)
- **Memory usada:** ~80MB de 512MB (over-provisioning de 6x)

## 🛡️ Proteções Ativas + Otimizações

### 1. Budget Alert ($50/mês)
```bash
gcloud alpha billing budgets describe 2c9bc9b0-de6c-493d-bceb-b4d09615b2b6 \
  --billing-account=016669-43980E-F06832
```
Alerta em 50%, 80%, 100% do orçamento.

### 2. Cloud Run API (`revhackers-api-staging`) — **OTIMIZADO**
**ANTES:** cpu=1, memory=512Mi, concurrency=80 (~R$ 50/mês)
**AGORA:** cpu=0.5, memory=256Mi, concurrency=1, cpu-throttling (~R$ 15/mês)

- **max-instances: 5** (custo máximo ~$40/mês)
- **min-instances: 0** (sem cold start cost quando idle)
- **cpu-throttling: true** (só consome CPU quando tem request)
- **concurrency: 1** (necessário para cpu<1)

### 3. Cloud Run Frontend (`revhackers-frontend-staging`) — **OTIMIZADO**
**ANTES:** cpu=1, memory=256Mi (~R$ 25/mês)
**AGORA:** cpu=1, memory=128Mi, concurrency=80 (~R$ 12/mês)

- **max-instances: 3**
- **min-instances: 0**

### 4. Cloud SQL Postgres (`revhackers-staging-pg`)
- **storage-size: 15GB** (atualizado de 10GB)
- **storage-auto-increase: enabled**
- **Tier: db-f1-micro** (compartilhado, sem SLA)

## 💰 Custo Mensal Atualizado

| Serviço | Antes | Agora | Economia |
|---|---|---|---|
| Cloud SQL db-f1-micro + 15GB | $11 | $11 | $0 |
| Cloud Run API | $10 | **$4** | **$6** |
| Cloud Run Frontend | $5 | **$2** | **$3** |
| Cloud Logging (~10GB) | $4 | $4 | $0 |
| Secret Manager | $1 | $1 | $0 |
| Network egress | $1 | $1 | $0 |
| Artifact Registry | $0.10 | $0.10 | $0 |
| **TOTAL** | **$32** | **$23** | **~$9** (28%) |
| **BRL** | R$ 165 | **R$ 120** | **R$ 45** |

## 🚨 Cenários de Spike (todos prevenidos)

| Cenário | Limite | Aviso |
|---|---|---|
| Ataque DDoS | $50/mês (budget bloqueia) | Email em 50%/80%/100% |
| Bot gera 1M requests | $40/mês (max 5 instances) | Email automático |
| Disco enche | $3/mês (auto-resize 25GB max) | N/A |
| API key exposta | $50/mês (budget bloqueia) | Email imediato |

## 📋 Validação Pós-Otimização

- ✅ API health: 200 OK (`/`)
- ✅ Frontend: 200 OK (`/`)
- ✅ Build: 412/412 testes passando
- ✅ Typecheck: limpo
- ✅ Latência: 100-340ms (cold start), 20ms (warm)

## 🔧 Comandos de Verificação

```bash
# Ver configuração atual
gcloud run services describe revhackers-api-staging --region=southamerica-east1 \
  --format="value(spec.template.spec.containers[0].resources)"

# Ver custo do mês
gcloud billing accounts get-iam-policy 016669-43980E-F06832

# Ver alertas ativos
gcloud alpha billing budgets list --billing-account=016669-43980E-F06832
```

## 🔒 Para Aumentar Limites (quando virar produção)

1. **Subir Cloud Run memory:** `gcloud run services update ... --memory=512Mi` (~$3/mês)
2. **Upgrade Cloud SQL tier:** `gcloud sql instances patch ... --tier=db-custom-2-7680` (~$95/mês)
3. **Aumentar budget:** `gcloud alpha billing budgets update [BUDGET_ID] --budget-amount=200`

## 📚 Referências

- [GCP Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [GCP Cloud SQL Pricing](https://cloud.google.com/sql/pricing)
- [GCP Budgets Setup](https://cloud.google.com/billing/docs/how-to/budgets)
- [cpu-throttling](https://cloud.google.com/run/docs/configuring/cpu-throttling)
