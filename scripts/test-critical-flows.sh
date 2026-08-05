#!/usr/bin/env bash
# ============================================================================
# test-critical-flows.sh
# Testa os 3 fluxos críticos que estão com erro
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_step() { echo -e "${GREEN}[TEST]${NC} $*"; }
log_err()  { echo -e "${RED}[FAIL]${NC} $*"; }
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }

API_URL="https://revhackers-api-staging-3na73syj5a-rj.a.run.app"

echo "=========================================="
echo "Teste dos 3 Fluxos Críticos"
echo "=========================================="
echo ""

# ============================================================================
# TESTE 1: Cadastrar Cliente
# ============================================================================
log_step "1. Testando cadastro de cliente..."
log_info "POST /v1/clients"

TMPFILE=$(mktemp)
HTTP_CODE=$(curl -s -o "$TMPFILE" -w "%{http_code}" -X POST "$API_URL/v1/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "name": "Cliente Teste Erro",
    "email": "cliente.erro@teste.com",
    "status": "onboarding"
  }' 2>&1)
BODY=$(cat "$TMPFILE")
rm -f "$TMPFILE"

echo ""
echo "Status Code: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "401" ]; then
    log_info "✓ Autenticação requerida (esperado sem token válido)"
elif [ "$HTTP_CODE" = "400" ]; then
    log_err "✗ Erro de validação (400)"
elif [ "$HTTP_CODE" = "500" ]; then
    log_err "✗ Erro interno do servidor (500)"
else
    log_info "Status: $HTTP_CODE"
fi

# ============================================================================
# TESTE 2: Cadastrar Projeto REI
# ============================================================================
log_step "2. Testando cadastro de projeto REI..."
log_info "POST /v1/rei-projects"

TMPFILE=$(mktemp)
HTTP_CODE=$(curl -s -o "$TMPFILE" -w "%{http_code}" -X POST "$API_URL/v1/rei-projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "clientName": "Projeto Teste Erro",
    "clientEmail": "projeto.erro@teste.com",
    "analystEmail": "admin@revhackers.com",
    "quarter": "Q1",
    "year": 2024,
    "nextReiDate": "2024-06-01"
  }' 2>&1)
BODY=$(cat "$TMPFILE")
rm -f "$TMPFILE"

echo ""
echo "Status Code: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "401" ]; then
    log_info "✓ Autenticação requerida (esperado sem token válido)"
elif [ "$HTTP_CODE" = "400" ]; then
    log_err "✗ Erro de validação (400)"
elif [ "$HTTP_CODE" = "500" ]; then
    log_err "✗ Erro interno do servidor (500)"
else
    log_info "Status: $HTTP_CODE"
fi

# ============================================================================
# TESTE 3: Listar Projetos REI (simula acesso ao wizard)
# ============================================================================
log_step "3. Testando acesso a projetos REI..."
log_info "GET /v1/rei-projects"

TMPFILE=$(mktemp)
HTTP_CODE=$(curl -s -o "$TMPFILE" -w "%{http_code}" -X GET "$API_URL/v1/rei-projects" \
  -H "Authorization: Bearer test-token" 2>&1)
BODY=$(cat "$TMPFILE")
rm -f "$TMPFILE"

echo ""
echo "Status Code: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "401" ]; then
    log_info "✓ Autenticação requerida (esperado sem token válido)"
elif [ "$HTTP_CODE" = "400" ]; then
    log_err "✗ Erro de validação (400)"
elif [ "$HTTP_CODE" = "500" ]; then
    log_err "✗ Erro interno do servidor (500)"
else
    log_info "Status: $HTTP_CODE"
fi

# ============================================================================
# Resumo
# ============================================================================
echo ""
echo "=========================================="
log_step "Teste Concluído"
echo "=========================================="
echo ""
log_info "Análise:"
echo "- Se todos retornaram 401: APIs estão protegidas (correto)"
echo "- Se algum retornou 400: Problema de validação/schema"
echo "- Se algum retornou 500: Bug no backend"
echo ""
log_info "Próximo passo:"
echo "1. Obter token Firebase válido"
echo "2. Executar testes com token real"
echo "3. Verificar logs do Cloud Run"
echo ""
