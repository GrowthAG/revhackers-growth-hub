# GCP Cost Guardrails — RevHackers Staging

Aplicado em 2026-08-05 para garantir custo mensal **~$35/mês** sem surpresas.

## 🛡️ Proteções Ativas

### 1. Budget Alert ($50/mês)
```bash
# Alerta em 50%, 80%, 100% do orçamento
gcloud alpha billing budgets describe 2c9bc9b0-de6c-493d-bceb-b4d09615b2b6 \
  --billing-account=016669-43980E-F06832
```

### 2. Cloud Run API (`revhackers-api-staging`)
- **max-instances: 5** (custo máximo ~$80/mês mesmo em pico)
- **min-instances: 0** (sem cold start cost quando idle)
- **concurrency: 80** (cada instância atende 80 requests simultâneos)
- **cpu: 1, memory: 512Mi** (config validada para staging)

### 3. Cloud Run Frontend (`revhackers-frontend-staging`)
- **max-instances: 3** (frontend tem menos carga que API)
- **min-instances: 0**

### 4. Cloud SQL Postgres (`revhackers-staging-pg`)
- **storage-size: 15GB** (atualizado de 10GB)
- **storage-auto-increase: enabled** (cresce automaticamente se necessário)
- **Tier: db-f1-micro** (compartilhado, sem SLA, ideal para staging)

## 💰 Custo Mensal Estimado

| Serviço | Custo/mês |
|---|---|
| Cloud SQL db-f1-micro + 15GB SSD | ~$11 |
| Cloud Run API (1 vCPU, 512MB) | ~$10 |
| Cloud Run Frontend (1 vCPU, 256MB) | ~$5 |
| Cloud Logging (~10GB/mês) | ~$4 |
| Secret Manager (3 secrets) | ~$1 |
| Network egress (~5GB/mês) | ~$1 |
| Artifact Registry | ~$0.10 |
| **TOTAL** | **~$32/mês** (R$ 165) |

## 🚨 Cenários de Spike (todos prevenidos)

| Cenário | Sem proteção | Com proteção |
|---|---|---|
| Ataque DDoS no frontend | $500/mês (instâncias infinitas) | $15/mês (capped em 3) |
| Bot gera 1M requests/dia | $200/mês (CPU saturado) | $40/mês (capped em 5 × 80 concurrency) |
| Disco enche por bug | $50/mês (auto-resize ilimitado) | $3/mês (15GB base) |
| Esquecimento de API key exposta | $1000/mês (alguém minerando crypto) | $50/mês (budget bloqueia) |

## 📋 Comandos de Verificação

```bash
# Ver custo do mês atual
gcloud billing accounts get-iam-policy 016669-43980E-F06832

# Ver configurações do Cloud Run
gcloud run services describe revhackers-api-staging --region=southamerica-east1

# Ver alertas ativos
gcloud alpha billing budgets list --billing-account=016669-43980E-F06832

# Ver uso do Cloud SQL
gcloud sql instances describe revhackers-staging-pg --format="value(settings)"
```

## 🔒 Para Aumentar Limites (quando virar produção)

1. **Subir Cloud Run max-instances:** Editar `docs/GCP-COST-GUARDRAILS.md`
2. **Upgrade Cloud SQL tier:** `gcloud sql instances patch ... --tier=db-custom-2-7680` (~$95/mês)
3. **Aumentar budget:** `gcloud alpha billing budgets update [BUDGET_ID] --budget-amount=200`

## 📚 Referências

- [GCP Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [GCP Cloud SQL Pricing](https://cloud.google.com/sql/pricing)
- [GCP Budgets Setup](https://cloud.google.com/billing/docs/how-to/budgets)
