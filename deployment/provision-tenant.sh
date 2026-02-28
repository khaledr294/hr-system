#!/bin/bash
# ============================================================
# provision-tenant.sh — Create a new tenant instance
# ============================================================
# Usage:
#   ./provision-tenant.sh \
#     --tenant-id acme \
#     --domain hr.acme.com \
#     --company-name "شركة النخبة" \
#     --admin-email admin@acme.com \
#     --admin-password SecurePass123 \
#     --trial-days 30
# ============================================================

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────
DB_HOST="localhost"
DB_USER="postgres"
DB_SUPERPASS="${POSTGRES_SUPERPASS:-postgres}"
TRIAL_DAYS=30
BASE_PORT=3001
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$DEPLOY_DIR")"
TENANTS_DIR="$DEPLOY_DIR/tenants"

# ── Parse arguments ───────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --tenant-id)     TENANT_ID="$2";     shift 2;;
    --domain)        DOMAIN="$2";        shift 2;;
    --company-name)  COMPANY_NAME="$2";  shift 2;;
    --admin-email)   ADMIN_EMAIL="$2";   shift 2;;
    --admin-password) ADMIN_PASSWORD="$2"; shift 2;;
    --trial-days)    TRIAL_DAYS="$2";    shift 2;;
    --db-host)       DB_HOST="$2";       shift 2;;
    *) echo "Unknown option: $1"; exit 1;;
  esac
done

# ── Validate ──────────────────────────────────────────────────
for var in TENANT_ID DOMAIN COMPANY_NAME ADMIN_EMAIL ADMIN_PASSWORD; do
  if [[ -z "${!var:-}" ]]; then
    echo "❌ Missing required argument: --$(echo $var | tr '_' '-' | tr 'A-Z' 'a-z')"
    exit 1
  fi
done

echo "══════════════════════════════════════════════════════"
echo "  Provisioning tenant: $TENANT_ID"
echo "  Domain: $DOMAIN"
echo "  Company: $COMPANY_NAME"
echo "  Trial: $TRIAL_DAYS days"
echo "══════════════════════════════════════════════════════"

# ── Determine port (auto-increment from BASE_PORT) ───────────
mkdir -p "$TENANTS_DIR"
if ls "$TENANTS_DIR"/*.port 2>/dev/null | head -1 >/dev/null 2>&1; then
  LAST_PORT=$(cat "$TENANTS_DIR"/*.port 2>/dev/null | sort -n | tail -1)
  APP_PORT=$((LAST_PORT + 1))
else
  APP_PORT=$BASE_PORT
fi

# ── Generate secrets ──────────────────────────────────────────
DB_NAME="hr_${TENANT_ID}"
DB_PASSWORD=$(openssl rand -hex 16)
NEXTAUTH_SECRET=$(openssl rand -hex 32)

# ── 1. Create PostgreSQL database ────────────────────────────
echo "📦 Creating database: $DB_NAME"
PGPASSWORD="$DB_SUPERPASS" psql -h "$DB_HOST" -U "$DB_USER" -c \
  "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null || echo "  (database already exists)"

PGPASSWORD="$DB_SUPERPASS" psql -h "$DB_HOST" -U "$DB_USER" -c \
  "CREATE USER \"hr_${TENANT_ID}\" WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true

PGPASSWORD="$DB_SUPERPASS" psql -h "$DB_HOST" -U "$DB_USER" -c \
  "GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"hr_${TENANT_ID}\";" 2>/dev/null || true

# ── 2. Generate tenant files ─────────────────────────────────
TENANT_DIR="$TENANTS_DIR/$TENANT_ID"
mkdir -p "$TENANT_DIR"

# Save port for future reference
echo "$APP_PORT" > "$TENANT_DIR/port.txt"
echo "$APP_PORT" > "$TENANTS_DIR/${TENANT_ID}.port"

# Generate .env file
sed -e "s|{{TENANT_ID}}|$TENANT_ID|g" \
    -e "s|{{DB_PASSWORD}}|$DB_PASSWORD|g" \
    -e "s|{{DB_HOST}}|$DB_HOST|g" \
    -e "s|{{DB_NAME}}|$DB_NAME|g" \
    -e "s|{{NEXTAUTH_SECRET}}|$NEXTAUTH_SECRET|g" \
    -e "s|{{DOMAIN}}|$DOMAIN|g" \
    -e "s|{{COMPANY_NAME}}|$COMPANY_NAME|g" \
    -e "s|{{ADMIN_EMAIL}}|$ADMIN_EMAIL|g" \
    -e "s|{{ADMIN_PASSWORD}}|$ADMIN_PASSWORD|g" \
    -e "s|{{TRIAL_DAYS}}|$TRIAL_DAYS|g" \
    "$DEPLOY_DIR/env.template" > "$TENANT_DIR/.env"

# Generate docker-compose file
sed -e "s|{{TENANT_ID}}|$TENANT_ID|g" \
    -e "s|{{APP_PORT}}|$APP_PORT|g" \
    -e "s|{{DB_PASSWORD}}|$DB_PASSWORD|g" \
    -e "s|{{DB_HOST}}|$DB_HOST|g" \
    -e "s|{{DB_NAME}}|$DB_NAME|g" \
    -e "s|{{NEXTAUTH_SECRET}}|$NEXTAUTH_SECRET|g" \
    -e "s|{{DOMAIN}}|$DOMAIN|g" \
    "$DEPLOY_DIR/docker-compose.tenant.yml.template" > "$TENANT_DIR/docker-compose.yml"

# Generate nginx config
sed -e "s|{{DOMAIN}}|$DOMAIN|g" \
    -e "s|{{APP_PORT}}|$APP_PORT|g" \
    "$DEPLOY_DIR/nginx/tenant.conf.template" > "$TENANT_DIR/nginx.conf"

# Save tenant metadata
cat > "$TENANT_DIR/metadata.json" <<EOF
{
  "tenantId": "$TENANT_ID",
  "domain": "$DOMAIN",
  "companyName": "$COMPANY_NAME",
  "adminEmail": "$ADMIN_EMAIL",
  "appPort": $APP_PORT,
  "dbName": "$DB_NAME",
  "trialDays": $TRIAL_DAYS,
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "trial"
}
EOF

# ── 3. Start the container ───────────────────────────────────
echo "🚀 Starting container on port $APP_PORT"
cd "$TENANT_DIR"
docker compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for container to start..."
sleep 10

# ── 4. Run migrations ────────────────────────────────────────
echo "📚 Running database migrations..."
docker exec "hr-${TENANT_ID}" sh -c "npx prisma migrate deploy"

# ── 5. Seed tenant data (admin user + settings) ──────────────
echo "🌱 Seeding tenant data..."
docker exec "hr-${TENANT_ID}" sh -c \
  "SEED_COMPANY_NAME='$COMPANY_NAME' \
   SEED_ADMIN_EMAIL='$ADMIN_EMAIL' \
   SEED_ADMIN_PASSWORD='$ADMIN_PASSWORD' \
   SEED_TRIAL_DAYS='$TRIAL_DAYS' \
   node scripts/create-tenant-admin.js"

# ── 6. Configure Nginx ───────────────────────────────────────
echo "🌐 Configuring Nginx for $DOMAIN"
sudo cp "$TENANT_DIR/nginx.conf" "/etc/nginx/sites-available/$TENANT_ID"
sudo ln -sf "/etc/nginx/sites-available/$TENANT_ID" "/etc/nginx/sites-enabled/$TENANT_ID"
sudo nginx -t && sudo systemctl reload nginx

# ── 7. SSL Certificate ───────────────────────────────────────
echo "🔒 Requesting SSL certificate for $DOMAIN"
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$ADMIN_EMAIL" || \
  echo "⚠️  SSL setup failed — run manually: sudo certbot --nginx -d $DOMAIN"

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════"
echo "  ✅ Tenant provisioned successfully!"
echo "──────────────────────────────────────────────────────"
echo "  URL:        https://$DOMAIN"
echo "  Admin:      $ADMIN_EMAIL"
echo "  Port:       $APP_PORT"
echo "  Database:   $DB_NAME"
echo "  Trial:      $TRIAL_DAYS days"
echo "  Container:  hr-$TENANT_ID"
echo "  Files:      $TENANT_DIR/"
echo "══════════════════════════════════════════════════════"
