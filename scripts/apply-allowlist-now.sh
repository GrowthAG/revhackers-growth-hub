#!/bin/bash
# Aplica a migration 0026_admin_allowlist.sql via Cloud SQL Proxy
# Uso: ./scripts/apply-allowlist-now.sh
set -e

PROXY="./cloud-sql-proxy"
MIGRATION="api/db/migrations/0026_admin_allowlist.sql"

if [ ! -x "$PROXY" ]; then
  ARCH=$(uname -m)
  if [ "$ARCH" = "arm64" ]; then
    URL="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.darwin.arm64"
  else
    URL="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.darwin.amd64"
  fi
  echo "Baixando Cloud SQL Proxy para $ARCH..."
  curl -o "$PROXY" "$URL"
  chmod +x "$PROXY"
fi

echo "Iniciando Cloud SQL Proxy..."
echo "Se pedir login, autentique com sua conta GCP no link exibido."

# Inicia proxy em background, aplica migration, e mata o proxy
"$PROXY" revhackers-staging:southamerica-east1:revhackers-staging-pg --port 5433 &
PROXY_PID=$!
sleep 4

echo ""
echo "=== Aplicando migration 0026_admin_allowlist.sql ==="
PGPASSWORD="" psql -h 127.0.0.1 -p 5433 -U postgres -d revhackers -f "$MIGRATION" 2>&1

echo ""
echo "=== Verificando dados inseridos ==="
PGPASSWORD="" psql -h 127.0.0.1 -p 5433 -U postgres -d revhackers \
  -c "SELECT email_pattern FROM admin_allowlist ORDER BY email_pattern;" 2>&1

kill $PROXY_PID 2>/dev/null || true
wait $PROXY_PID 2>/dev/null || true
echo ""
echo "=== Concluido ==="
