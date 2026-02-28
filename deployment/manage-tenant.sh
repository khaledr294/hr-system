#!/bin/bash
# ============================================================
# manage-tenant.sh — Manage tenant instances
# ============================================================
# Usage:
#   ./manage-tenant.sh list
#   ./manage-tenant.sh status
#   ./manage-tenant.sh extend-trial --tenant-id acme --days 15
#   ./manage-tenant.sh activate --tenant-id acme
#   ./manage-tenant.sh suspend --tenant-id acme
#   ./manage-tenant.sh backup --tenant-id acme
#   ./manage-tenant.sh update --tenant-id acme
#   ./manage-tenant.sh update-all
# ============================================================

set -euo pipefail

DB_HOST="localhost"
DB_USER="postgres"
DB_SUPERPASS="${POSTGRES_SUPERPASS:-postgres}"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
TENANTS_DIR="$DEPLOY_DIR/tenants"

ACTION="${1:-help}"
shift || true

TENANT_ID=""
DAYS=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --tenant-id) TENANT_ID="$2"; shift 2;;
    --days)      DAYS="$2";      shift 2;;
    --db-host)   DB_HOST="$2";   shift 2;;
    *) shift;;
  esac
done

# ── Helper: run SQL on tenant DB ─────────────────────────────
run_sql() {
  local db="hr_${1}"
  local sql="$2"
  PGPASSWORD="$DB_SUPERPASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$db" -t -c "$sql" 2>/dev/null
}

# ── Commands ──────────────────────────────────────────────────
case "$ACTION" in

  list)
    echo "┌──────────────┬──────────────────────────┬───────┬───────────┬─────────────┐"
    echo "│ Tenant ID    │ Domain                   │ Port  │ Status    │ Created     │"
    echo "├──────────────┼──────────────────────────┼───────┼───────────┼─────────────┤"
    for meta in "$TENANTS_DIR"/*/metadata.json; do
      [[ -f "$meta" ]] || continue
      tid=$(jq -r '.tenantId' "$meta")
      dom=$(jq -r '.domain' "$meta")
      port=$(jq -r '.appPort' "$meta")
      stat=$(jq -r '.status' "$meta")
      created=$(jq -r '.createdAt' "$meta" | cut -d'T' -f1)
      printf "│ %-12s │ %-24s │ %-5s │ %-9s │ %-11s │\n" "$tid" "$dom" "$port" "$stat" "$created"
    done
    echo "└──────────────┴──────────────────────────┴───────┴───────────┴─────────────┘"
    ;;

  status)
    echo "Checking all tenant containers..."
    echo ""
    for meta in "$TENANTS_DIR"/*/metadata.json; do
      [[ -f "$meta" ]] || continue
      tid=$(jq -r '.tenantId' "$meta")
      dom=$(jq -r '.domain' "$meta")
      port=$(jq -r '.appPort' "$meta")
      container="hr-${tid}"

      running=$(docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null || echo "not found")
      health=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/api/system/health" 2>/dev/null || echo "000")

      if [[ "$running" == "true" ]]; then
        status_icon="🟢"
      else
        status_icon="🔴"
      fi

      echo "$status_icon $tid ($dom) — container: $running, health: $health"
    done
    ;;

  extend-trial)
    [[ -z "$TENANT_ID" ]] && { echo "❌ --tenant-id required"; exit 1; }
    [[ -z "$DAYS" ]] && { echo "❌ --days required"; exit 1; }
    echo "📅 Extending trial for $TENANT_ID by $DAYS days..."
    run_sql "$TENANT_ID" \
      "UPDATE \"SystemSettings\" SET \"trialEndDate\" = \"trialEndDate\" + INTERVAL '$DAYS days', \"subscriptionStatus\" = 'trial', \"isTrialActive\" = true WHERE id = 'system';"
    # Update metadata
    META="$TENANTS_DIR/$TENANT_ID/metadata.json"
    [[ -f "$META" ]] && jq '.status = "trial"' "$META" > "$META.tmp" && mv "$META.tmp" "$META"
    echo "✅ Trial extended by $DAYS days."
    ;;

  activate)
    [[ -z "$TENANT_ID" ]] && { echo "❌ --tenant-id required"; exit 1; }
    echo "✅ Activating subscription for $TENANT_ID..."
    run_sql "$TENANT_ID" \
      "UPDATE \"SystemSettings\" SET \"subscriptionStatus\" = 'active', \"isTrialActive\" = false, \"trialEndDate\" = NULL WHERE id = 'system';"
    META="$TENANTS_DIR/$TENANT_ID/metadata.json"
    [[ -f "$META" ]] && jq '.status = "active"' "$META" > "$META.tmp" && mv "$META.tmp" "$META"
    echo "✅ Subscription activated."
    ;;

  suspend)
    [[ -z "$TENANT_ID" ]] && { echo "❌ --tenant-id required"; exit 1; }
    echo "⏸️  Suspending $TENANT_ID..."
    run_sql "$TENANT_ID" \
      "UPDATE \"SystemSettings\" SET \"subscriptionStatus\" = 'suspended' WHERE id = 'system';"
    META="$TENANTS_DIR/$TENANT_ID/metadata.json"
    [[ -f "$META" ]] && jq '.status = "suspended"' "$META" > "$META.tmp" && mv "$META.tmp" "$META"
    echo "✅ Tenant suspended."
    ;;

  backup)
    [[ -z "$TENANT_ID" ]] && { echo "❌ --tenant-id required"; exit 1; }
    BACKUP_FILE="$TENANTS_DIR/$TENANT_ID/backup-$(date +%Y%m%d_%H%M%S).sql"
    echo "💾 Backing up $TENANT_ID to $BACKUP_FILE..."
    PGPASSWORD="$DB_SUPERPASS" pg_dump -h "$DB_HOST" -U "$DB_USER" "hr_${TENANT_ID}" > "$BACKUP_FILE"
    echo "✅ Backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
    ;;

  update)
    [[ -z "$TENANT_ID" ]] && { echo "❌ --tenant-id required"; exit 1; }
    TENANT_DIR="$TENANTS_DIR/$TENANT_ID"
    echo "🔄 Updating $TENANT_ID..."
    cd "$TENANT_DIR"
    docker compose pull 2>/dev/null || true
    docker compose up -d
    sleep 5
    docker exec "hr-${TENANT_ID}" sh -c "npx prisma migrate deploy" || true
    echo "✅ Updated."
    ;;

  update-all)
    echo "🔄 Rebuilding Docker image..."
    cd "$PROJECT_DIR"
    docker build -t hr-system:latest .

    echo "🔄 Updating all tenants..."
    for meta in "$TENANTS_DIR"/*/metadata.json; do
      [[ -f "$meta" ]] || continue
      tid=$(jq -r '.tenantId' "$meta")
      echo "  → Updating $tid..."
      cd "$TENANTS_DIR/$tid"
      docker compose up -d
      sleep 3
      docker exec "hr-${tid}" sh -c "npx prisma migrate deploy" 2>/dev/null || true
    done
    echo "✅ All tenants updated."
    ;;

  help|*)
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  list                         List all tenants"
    echo "  status                       Health check all tenants"
    echo "  extend-trial --tenant-id X --days N"
    echo "  activate --tenant-id X       Convert trial → active"
    echo "  suspend --tenant-id X        Suspend a tenant"
    echo "  backup --tenant-id X         Dump tenant database"
    echo "  update --tenant-id X         Restart with latest image"
    echo "  update-all                   Rebuild image + update all"
    ;;

esac
