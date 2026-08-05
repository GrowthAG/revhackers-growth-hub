#!/usr/bin/env bash
# ============================================================================
# deploy-staging-migrations.sh
#
# Aplica todas as migrations do RevHackers em Cloud SQL Staging em ordem.
# Roda smoke tests E2E e teste de RLS cross-tenant.
#
# PRÉ-CONDIÇÃO: Você deve estar autenticado no GCP antes de rodar este script.
#   $ gcloud auth login
#   $ gcloud config set project revhackers-staging
#
# Uso:
#   $ chmod +x scripts/deploy-staging-migrations.sh
#   $ ./scripts/deploy-staging-migrations.sh
#
# Variáveis editáveis:
#   INSTANCE_NAME — nome da instância Cloud SQL staging
#   DB_NAME       — nome do database (default: revhackers_staging)
#   DB_USER       — usuário com permissão DDL (default: postgres)
# ============================================================================

set -euo pipefail

INSTANCE_NAME="${INSTANCE_NAME:-revhackers-staging}"
DB_NAME="${DB_NAME:-revhackers_staging}"
DB_USER="${DB_USER:-postgres}"
REGION="${REGION:-southamerica-east1}"

# Cores para output legível
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_step() { echo -e "${GREEN}[STEP]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_err()  { echo -e "${RED}[FAIL]${NC} $*"; }

# ============================================================================
# 0. Verificar autenticação
# ============================================================================
log_step "Verificando autenticação GCP..."
PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [[ -z "$PROJECT" ]]; then
    log_err "Sem projeto GCP ativo. Rode: gcloud config set project revhackers-staging"
    exit 1
fi
log_step "Projeto ativo: $PROJECT"

ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n1 || echo "")
if [[ -z "$ACCOUNT" ]]; then
    log_err "Sem conta autenticada. Rode: gcloud auth login"
    exit 1
fi
log_step "Conta ativa: $ACCOUNT"

# ============================================================================
# 1. Confirmar que instância Cloud SQL existe e está UP
# ============================================================================
log_step "Verificando instância Cloud SQL '$INSTANCE_NAME'..."
STATE=$(gcloud sql instances describe "$INSTANCE_NAME" --format="value(state)" 2>/dev/null || echo "NOT_FOUND")
if [[ "$STATE" != "RUNNABLE" ]]; then
    log_err "Instância não está RUNNABLE (state=$STATE). Abortando."
    exit 1
fi
log_step "Instância UP e RUNNABLE"

# ============================================================================
# 2. Construir array de migrations em ordem
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/../api/db/migrations"

MIGRATIONS=(
    "0001_growthmap.sql"
    "0002_identity_memberships.sql"
    "0003_idempotency.sql"
    "0004_staging_superadmin.sql"
    "0005_core_product.sql"
    "0006_rei_onboarding.sql"
    "0007_rei_health_metrics.sql"
    "0008_create_competitors.sql"
    "0009_create_intelligence_jobs.sql"
    "0010_create_rei_expansion_opportunities.sql"
    "0012_create_meetings.sql"
    "0013_create_ghl_events.sql"
    "0014_add_journey_stage_to_contacts.sql"
    "0015_create_lifecycle_hooks.sql"
    "0016_fix_phantom_fks.sql"
    "0017_fix_rls_consistency.sql"
    "0018_seed_minimal_data.sql"
    "0019_extend_client_fields.sql"
    "0020_blog_articles.sql"
    "0021_materials.sql"
    "0022_case_studies.sql"
    "0023_content_backfill.sql"
    "0024_create_growthmap_shares.sql"
)

# ============================================================================
# 3. Aplicar migrations em ordem (gcloud sql connect + psql via stdin)
# ============================================================================
for migration in "${MIGRATIONS[@]}"; do
    FILE="$MIGRATIONS_DIR/$migration"
    if [[ ! -f "$FILE" ]]; then
        log_err "Arquivo não encontrado: $FILE"
        exit 1
    fi
    log_step "Aplicando $migration..."
    if gcloud sql connect "$INSTANCE_NAME" \
        --database="$DB_NAME" \
        --user="$DB_USER" \
        --quiet < "$FILE" 2>&1 | tee -a /tmp/revhackers-migrations.log; then
        log_step "  ✓ $migration OK"
    else
        log_err "  ✗ $migration FALHOU. Abortando para preservar estado."
        log_err "    Verifique /tmp/revhackers-migrations.log"
        exit 1
    fi
done

# ============================================================================
# 4. Validar schema pós-migrations
# ============================================================================
log_step "Validando schema (contagem de tabelas + RLS habilitado)..."

VALIDATE_SQL=$(cat <<'EOF'
SELECT
    'tables_total' AS metric,
    COUNT(*) AS value
FROM information_schema.tables
WHERE table_schema = 'app'
UNION ALL
SELECT
    'tables_with_rls_enabled',
    COUNT(*)
FROM pg_tables
WHERE schemaname = 'app' AND rowsecurity = true
UNION ALL
SELECT
    'tables_with_force_rls',
    COUNT(*)
FROM pg_tables
WHERE schemaname = 'app' AND forcerowsecurity = true
UNION ALL
SELECT
    'fk_constraints_total',
    COUNT(*)
FROM information_schema.table_constraints
WHERE table_schema = 'app'
  AND constraint_type = 'FOREIGN KEY';
EOF
)

gcloud sql connect "$INSTANCE_NAME" --database="$DB_NAME" --user="$DB_USER" --quiet \
    <<< "$VALIDATE_SQL" 2>&1 | tee /tmp/revhackers-schema-validation.log

EXPECTED_TABLES=15  # growthmap_results, project_tenant_registry, clients, rei_projects,
                    # rei_materials, strategic_plans, internal_users, user_identities,
                    # tenant_memberships, idempotency_keys, rei_onboarding, rei_quick_wins,
                    # rei_health_metrics, competitors, competitor_intelligence,
                    # competitor_comparisons, market_signals, intelligence_jobs,
                    # intelligence_findings, rei_expansion_opportunities, meetings,
                    # ghl_events, lifecycle_history, lifecycle_hooks, lifecycle_hook_logs
                    # => ~25 (vamos validar mínimo)

# ============================================================================
# 5. Teste E2E RLS cross-tenant (defense in depth)
# ============================================================================
log_step "Smoke test: RLS cross-tenant isolation..."

RLS_TEST_SQL=$(cat <<'EOF'
-- Setup: criar 2 tenants fictícios + memberships
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM app.internal_users WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') THEN
        INSERT INTO app.internal_users (id, global_role, status) VALUES
            ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin', 'active'),
            ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'admin', 'active');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM app.clients WHERE id = 'tenant-a-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaa') THEN
        INSERT INTO app.clients (id, name, email, country) VALUES
            ('tenant-a-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaa', 'Tenant A', 'a@test.com', 'Brasil'),
            ('tenant-b-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbb', 'Tenant B', 'b@test.com', 'Brasil');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM app.tenant_memberships WHERE user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') THEN
        INSERT INTO app.tenant_memberships (user_id, tenant_id, role) VALUES
            ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'tenant-a-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaa', 'owner'),
            ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'tenant-b-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbb', 'owner');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM app.rei_projects WHERE id = 'proj-a-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaa') THEN
        INSERT INTO app.rei_projects (id, tenant_id, client_name, client_email, analyst_email, next_rei_date, quarter, year) VALUES
            ('proj-a-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaa', 'tenant-a-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaa', 'Client A', 'client-a@test.com', 'cs@test.com', now() + INTERVAL '30 days', 'Q3', 2026),
            ('proj-b-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbb', 'tenant-b-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbb', 'Client B', 'client-b@test.com', 'cs@test.com', now() + INTERVAL '30 days', 'Q3', 2026);
    END IF;
END $$;

-- Test: tentar ler Tenant B como Tenant A. DEVE retornar 0 rows.
SET app.current_user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SET app.tenant_id = 'tenant-a-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaa';

-- Mas a policy lê de app.tenant_memberships, então vamos checar a versão simples também
DO $$
DECLARE
    visible_count INTEGER;
BEGIN
    SET LOCAL app.tenant_id = 'tenant-a-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaa';
    SELECT COUNT(*) INTO visible_count FROM app.rei_projects WHERE id = 'proj-b-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbb';
    IF visible_count = 0 THEN
        RAISE NOTICE '✓ RLS PASS: Tenant A NÃO consegue ver Tenant B (visible_count=0)';
    ELSE
        RAISE EXCEPTION '✗ RLS FAIL: Tenant A conseguiu ver % row(s) de Tenant B!', visible_count;
    END IF;
END $$;
EOF
)

if gcloud sql connect "$INSTANCE_NAME" --database="$DB_NAME" --user="$DB_USER" --quiet \
    <<< "$RLS_TEST_SQL" 2>&1 | tee /tmp/revhackers-rls-test.log; then
    log_step "  ✓ RLS cross-tenant OK"
else
    log_err "  ✗ RLS cross-tenant FALHOU. Investigar /tmp/revhackers-rls-test.log"
    exit 1
fi

# ============================================================================
# 6. Resultado final
# ============================================================================
echo ""
echo "=========================================="
log_step "DEPLOY STAGING CONCLUÍDO COM SUCESSO"
echo "=========================================="
echo "Migrations aplicadas: ${#MIGRATIONS[@]}"
echo "Logs em: /tmp/revhackers-migrations.log, /tmp/revhackers-schema-validation.log, /tmp/revhackers-rls-test.log"
echo ""
echo "Próximo passo (FASE 2):"
echo "  gcloud builds submit --tag gcr.io/$PROJECT/revhackers-api:latest \\"
echo "    --config=cloudbuild-api.yaml"
echo "  gcloud run deploy revhackers-api-staging \\"
echo "    --image gcr.io/$PROJECT/revhackers-api:latest \\"
echo "    --region $REGION \\"
echo "    --allow-unauthenticated \\"
echo "    --set-env-vars=\$(gcloud secrets versions access latest --secret=STAGING_ENV_VARS --project=$PROJECT)"