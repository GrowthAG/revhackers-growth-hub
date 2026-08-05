#!/usr/bin/env bash
# ============================================================================
# diagnostic-errors.sh
# Diagnóstico automático dos 3 erros críticos
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_step() { echo -e "${GREEN}[STEP]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_err()  { echo -e "${RED}[FAIL]${NC} $*"; }
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }

API_URL="https://revhackers-api-staging-3na73syj5a-rj.a.run.app"

echo "=========================================="
echo "Diagnóstico de Erros Críticos"
echo "=========================================="
echo ""

# ============================================================================
# 1. Verificar API Cloud Run
# ============================================================================
log_step "1. Verificando API Cloud Run..."
HEALTH=$(curl -s -w "%{http_code}" -o /dev/null "$API_URL/health" 2>&1)
if [ "$HEALTH" = "200" ] || [ "$HEALTH" = "404" ]; then
    log_info "✓ API está respondendo (HTTP $HEALTH)"
else
    log_err "✗ API não está respondendo (HTTP $HEALTH)"
    exit 1
fi

# ============================================================================
# 2. Testar endpoint sem autenticação
# ============================================================================
log_step "2. Testando endpoints sem autenticação..."
RESPONSE=$(curl -s -X POST "$API_URL/v1/clients" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com"}' 2>&1)

if echo "$RESPONSE" | grep -q "unauthenticated"; then
    log_info "✓ Endpoint requer autenticação (esperado)"
else
    log_warn "⚠ Resposta inesperada: $RESPONSE"
fi

# ============================================================================
# 3. Verificar logs recentes do Cloud Run
# ============================================================================
log_step "3. Buscando erros recentes nos logs..."
ERRORS=$(gcloud logging read \
    "resource.type=cloud_run_revision AND resource.labels.service_name=revhackers-api-staging AND severity>=ERROR" \
    --limit=10 \
    --format=json 2>&1 | head -100)

if echo "$ERRORS" | grep -q "textPayload"; then
    log_warn "⚠ Encontrados erros nos logs:"
    echo "$ERRORS" | grep "textPayload" | head -5
else
    log_info "✓ Nenhum erro crítico nos últimos logs"
fi

# ============================================================================
# 4. Verificar se frontend está rodando localmente
# ============================================================================
log_step "4. Verificando frontend local..."
if curl -s -o /dev/null http://localhost:8080 2>&1; then
    log_info "✓ Frontend está rodando em http://localhost:8080"
else
    log_warn "⚠ Frontend não está rodando localmente"
    log_info "→ Execute: npm run dev"
fi

# ============================================================================
# 5. Verificar variáveis de ambiente
# ============================================================================
log_step "5. Verificando configuração..."
if [ -f ".env" ]; then
    log_info "✓ Arquivo .env existe"
    if grep -q "VITE_GCP_API_URL" .env; then
        log_info "✓ VITE_GCP_API_URL configurada"
    else
        log_warn "⚠ VITE_GCP_API_URL não encontrada em .env"
    fi
    if grep -q "VITE_FIREBASE_API_KEY" .env; then
        log_info "✓ VITE_FIREBASE_API_KEY configurada"
    else
        log_warn "⚠ VITE_FIREBASE_API_KEY não encontrada em .env"
    fi
else
    log_err "✗ Arquivo .env não encontrado"
fi

# ============================================================================
# 6. Resumo
# ============================================================================
echo ""
echo "=========================================="
log_step "Diagnóstico Concluído"
echo "=========================================="
echo ""
log_info "Próximos passos:"
echo "1. Abra o navegador em http://localhost:8080"
echo "2. Faça login com sua conta admin"
echo "3. Abra o Console (F12)"
echo "4. Tente cadastrar um cliente"
echo "5. Copie a mensagem de erro EXATA"
echo "6. Envie para análise"
echo ""
log_info "Para logs em tempo real:"
echo "  gcloud logging tail --project=revhackers-staging"
echo ""
