#!/usr/bin/env bash
# ============================================================================
# deploy-staging-migrations-direct.sh
#
# Aplica migrations usando psql diretamente via IP público
# (sem necessidade de Cloud SQL Proxy)
# ============================================================================

set -euo pipefail

# Configuração
DB_HOST="${DB_HOST:-34.39.242.211}"
DB_NAME="${DB_NAME:-revhackers}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_step() { echo -e "${GREEN}[STEP]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_err()  { echo -e "${RED}[FAIL]${NC} $*"; }

# ============================================================================
# 0. Verificar psql
# ============================================================================
if ! command -v psql &> /dev/null; then
    log_err "psql não encontrado. Instale PostgreSQL client."
    exit 1
fi
log_step "psql encontrado: $(psql --version)"

# ============================================================================
# 1. Solicitar senha se não fornecida
# ============================================================================
if [[ -z "$DB_PASSWORD" ]]; then
    echo -n "Digite a senha do PostgreSQL para user '$DB_USER': "
    read -s DB_PASSWORD
    echo
fi

export PGPASSWORD="$DB_PASSWORD"

# ============================================================================
# 2. Testar conexão
# ============================================================================
log_step "Testando conexão com $DB_HOST..."
if ! psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &> /dev/null; then
    log_err "Falha ao conectar. Verifique host, usuário e senha."
    exit 1
fi
log_step "Conexão OK"

# ============================================================================
# 3. Listar migrations
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/../api/db/migrations"

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
    log_err "Diretório de migrations não encontrado: $MIGRATIONS_DIR"
    exit 1
fi

# Ordenar migrations por nome (0001, 0002, etc)
MIGRATIONS=($(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort))

if [[ ${#MIGRATIONS[@]} -eq 0 ]]; then
    log_warn "Nenhuma migration encontrada em $MIGRATIONS_DIR"
    exit 0
fi

log_step "Encontradas ${#MIGRATIONS[@]} migrations"

# ============================================================================
# 4. Verificar schema_migrations table
# ============================================================================
log_step "Verificando tabela schema_migrations..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -q <<'EOF'
CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);
EOF

# ============================================================================
# 5. Aplicar migrations pendentes
# ============================================================================
APPLIED=0
SKIPPED=0
FAILED=0

for migration_file in "${MIGRATIONS[@]}"; do
    migration_name=$(basename "$migration_file")
    
    # Verificar se já foi aplicada
    if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT 1 FROM schema_migrations WHERE filename = '$migration_name'" 2>/dev/null | grep -q 1; then
        log_warn "Pulando $migration_name (já aplicada)"
        ((SKIPPED++))
        continue
    fi
    
    log_step "Aplicando $migration_name..."
    
    # Aplicar migration
    if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file" 2>&1; then
        # Registrar no schema_migrations
        psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -q \
            -c "INSERT INTO schema_migrations (filename) VALUES ('$migration_name')"
        log_step "✓ $migration_name aplicada com sucesso"
        ((APPLIED++))
    else
        log_err "✗ Falha ao aplicar $migration_name"
        ((FAILED++))
        break
    fi
done

# ============================================================================
# 6. Resultado final
# ============================================================================
echo ""
echo "=========================================="
if [[ $FAILED -eq 0 ]]; then
    log_step "DEPLOY CONCLUÍDO"
    echo "=========================================="
    echo "Aplicadas: $APPLIED"
    echo "Puladas: $SKIPPED"
    echo "Falhas: $FAILED"
    echo ""
    echo "Próximo passo:"
    echo "  ./scripts/deploy-api-staging.sh"
    exit 0
else
    log_err "DEPLOY FALHOU"
    echo "=========================================="
    echo "Aplicadas: $APPLIED"
    echo "Puladas: $SKIPPED"
    echo "Falhas: $FAILED"
    exit 1
fi
