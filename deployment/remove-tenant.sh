#!/bin/bash
# ============================================================
# remove-tenant.sh — Remove a tenant instance
# ============================================================
# Usage:
#   ./remove-tenant.sh --tenant-id acme
#   ./remove-tenant.sh --tenant-id acme --keep-data
# ============================================================

set -euo pipefail

DB_HOST="localhost"
DB_USER="postgres"
DB_SUPERPASS="${POSTGRES_SUPERPASS:-postgres}"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
TENANTS_DIR="$DEPLOY_DIR/tenants"
KEEP_DATA=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --tenant-id)  TENANT_ID="$2"; shift 2;;
    --keep-data)  KEEP_DATA=true; shift;;
    --db-host)    DB_HOST="$2";   shift 2;;
    *) echo "Unknown option: $1"; exit 1;;
  esac
done

if [[ -z "${TENANT_ID:-}" ]]; then
  echo "❌ Missing --tenant-id"; exit 1
fi

TENANT_DIR="$TENANTS_DIR/$TENANT_ID"
DB_NAME="hr_${TENANT_ID}"

echo "══════════════════════════════════════════════════════"
echo "  Removing tenant: $TENANT_ID"
echo "  Keep data: $KEEP_DATA"
echo "══════════════════════════════════════════════════════"

# 1. Stop container
echo "🛑 Stopping container..."
if [[ -f "$TENANT_DIR/docker-compose.yml" ]]; then
  cd "$TENANT_DIR" && docker compose down 2>/dev/null || true
fi
docker rm -f "hr-${TENANT_ID}" 2>/dev/null || true

# 2. Remove Nginx config
echo "🌐 Removing Nginx config..."
sudo rm -f "/etc/nginx/sites-enabled/$TENANT_ID"
sudo rm -f "/etc/nginx/sites-available/$TENANT_ID"
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true

# 3. Drop database (unless --keep-data)
if [[ "$KEEP_DATA" == "false" ]]; then
  echo "🗑️  Dropping database: $DB_NAME"
  PGPASSWORD="$DB_SUPERPASS" psql -h "$DB_HOST" -U "$DB_USER" -c \
    "DROP DATABASE IF EXISTS \"$DB_NAME\";" 2>/dev/null || true
  PGPASSWORD="$DB_SUPERPASS" psql -h "$DB_HOST" -U "$DB_USER" -c \
    "DROP USER IF EXISTS \"hr_${TENANT_ID}\";" 2>/dev/null || true
else
  echo "📦 Keeping database: $DB_NAME"
fi

# 4. Clean up files
echo "📁 Removing tenant files..."
rm -f "$TENANTS_DIR/${TENANT_ID}.port"
rm -rf "$TENANT_DIR"

echo ""
echo "✅ Tenant $TENANT_ID removed."
