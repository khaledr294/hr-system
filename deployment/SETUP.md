# VPS Setup — HR System Multi-Tenant

## Server Requirements
- Ubuntu 22.04+ / Debian 12+
- 2+ CPU cores, 4GB+ RAM (handles ~10 tenants)
- 50GB+ SSD

## 1. Install Dependencies

```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# PostgreSQL client (for management scripts)
sudo apt install -y postgresql-client jq

# Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx
```

## 2. Setup PostgreSQL (shared instance)

```bash
# Run PostgreSQL as a Docker container (shared for all tenants)
docker run -d \
  --name hr-postgres \
  --restart unless-stopped \
  -e POSTGRES_PASSWORD=YOUR_SECURE_SUPERPASS \
  -p 5432:5432 \
  -v hr_pg_data:/var/lib/postgresql/data \
  postgres:15

# Set in your shell profile:
export POSTGRES_SUPERPASS="YOUR_SECURE_SUPERPASS"
```

## 3. Build the App Image

```bash
git clone YOUR_REPO_URL /opt/hr-system
cd /opt/hr-system
docker build -t hr-system:latest .
```

## 4. Provision First Tenant

```bash
cd /opt/hr-system/deployment
chmod +x *.sh

./provision-tenant.sh \
  --tenant-id client1 \
  --domain hr.client1.com \
  --company-name "شركة العميل الأول" \
  --admin-email admin@client1.com \
  --admin-password SecurePass123 \
  --trial-days 30
```

## 5. DNS Setup

For each client domain, add an **A record** pointing to your VPS IP:
```
hr.client1.com  →  A  →  YOUR_VPS_IP
```

## 6. Daily Operations

```bash
# List all tenants
./manage-tenant.sh list

# Check health of all tenants
./manage-tenant.sh status

# Extend a trial
./manage-tenant.sh extend-trial --tenant-id client1 --days 15

# Activate paid subscription
./manage-tenant.sh activate --tenant-id client1

# Backup a tenant
./manage-tenant.sh backup --tenant-id client1

# Deploy code update to all tenants
./manage-tenant.sh update-all

# Remove a tenant (keeps data)
./remove-tenant.sh --tenant-id client1 --keep-data

# Remove a tenant (deletes everything)
./remove-tenant.sh --tenant-id client1
```

## File Structure After Provisioning

```
deployment/
  tenants/
    client1/
      .env              # Environment variables
      docker-compose.yml # Container config
      nginx.conf        # Reverse proxy config
      metadata.json     # Tenant info
      port.txt          # Assigned port
    client2/
      ...
```

## Resource Estimates

| Tenants | RAM   | CPU   | Disk   | VPS Cost     |
|---------|-------|-------|--------|--------------|
| 1-5     | 4 GB  | 2 CPU | 50 GB  | ~$5-10/mo    |
| 5-15    | 8 GB  | 4 CPU | 100 GB | ~$15-25/mo   |
| 15-30   | 16 GB | 6 CPU | 200 GB | ~$30-50/mo   |
