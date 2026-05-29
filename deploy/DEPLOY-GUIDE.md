# Sovereign Kanban — VPS Deployment Guide

## Architecture

```
[Pi5: Ptah] ──Tailscale──→ [VPS: Kanban + API] ←──Tailscale── [MacBook→Mac Mini: Shisat]
                                  │
                              Tailscale-only
                              No public ports open
                                  │
                           [Vercel: Landing pages only]
                           (No API, no DB, no internal data)
```

## Prerequisites

1. **VPS** with Tailscale installed and authenticated
2. **Docker** and **Docker Compose** on the VPS
3. **Tailscale** on all accessing devices (Pi5, MacBook, future Mac Mini)

## Step-by-Step Deployment

### 1. Install Tailscale on VPS

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# Note the Tailscale IP (100.x.x.x) — this is your Kanban access point
```

### 2. Clone the Repository

```bash
cd /opt
git clone https://github.com/digitalassetsstudio/beta-kanban.git
cd beta-kanban
```

### 3. Configure Environment

```bash
cp deploy/.env.example .env
nano .env
```

**CRITICAL: Change the default password!**
```
KANBAN_PASSWORD=your-strong-password-here
```

**Generate agent API keys for Ptah and Shisat:**
```bash
echo "ptah-key-$(openssl rand -hex 16)"
echo "shisat-key-$(openssl rand -hex 16)"
echo "aset-key-$(openssl rand -hex 16)"
```
Add these to `AGENT_API_KEYS` in `.env`, comma-separated.

### 4. Update docker-compose.yml

Edit `deploy/docker-compose.yml` and replace `100.x.x.x` with your VPS Tailscale IP:
```yaml
ports:
  - "100.64.1.2:3000:3000"  # Your actual Tailscale IP
```

### 5. Build and Deploy

```bash
# Build the Docker image
docker compose -f deploy/docker-compose.yml build

# Initialize the database
docker compose -f deploy/docker-compose.yml run --rm kanban npx prisma db push

# Seed demo data (optional)
docker compose -f deploy/docker-compose.yml run --rm kanban npx prisma db seed

# Start the service
docker compose -f deploy/docker-compose.yml up -d
```

### 6. Verify

From any Tailscale-connected device:
```bash
# Check auth endpoint
curl http://100.x.x.x:3000/api/auth

# Login
curl -X POST http://100.x.x.x:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password-here"}' \
  -c cookies.txt

# Verify session
curl http://100.x.x.x:3000/api/auth -b cookies.txt
```

### 7. Agent Access (Ptah, Shisat, Aset)

Agents can post notifications using their API key:
```bash
curl -X POST http://100.x.x.x:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "X-Agent-Key: ptah-key-abc123..." \
  -d '{
    "zone": "ops",
    "title": "Daily Backup Complete",
    "body": "2.4GB compressed. Duration: 3m 22s",
    "source": "Ptah",
    "taskId": null,
    "projectId": null
  }'
```

### 8. Configure Cron Jobs (Pi5)

Update Ptah's cron scripts to point to the VPS Tailscale IP instead of Vercel:
```bash
# Old: https://beta-kanban.vercel.app/api/notifications
# New: http://100.x.x.x:3000/api/notifications

# Example crontab entry:
0 */3 * * * /home/pi/scripts/health-check.sh && curl -s -X POST http://100.x.x.x:3000/api/notifications -H "Content-Type: application/json" -H "X-Agent-Key: ptah-key-abc123..." -d '{"zone":"ops","title":"Health Check OK","body":"All systems nominal","source":"Ptah"}' > /dev/null 2>&1
```

## Tailscale Serve (Optional — HTTPS)

For HTTPS without managing certificates:
```bash
tailscale serve https / http://127.0.0.1:3000
# Now accessible at https://kanban.tail-xxxxx.ts.net
```

## Migration from Vercel

1. **Before June 25th**: Run both VPS (full data) and Vercel (sanitized landing page only)
2. **Export data from Vercel**: `curl https://beta-kanban.vercel.app/api/projects > backup.json`
3. **Import to VPS**: Write a migration script or re-seed
4. **After VPS is confirmed working**: Remove API routes from Vercel deployment, keep only static landing page
5. **After Mac Mini arrives (June 25th)**: Move Shisat to Mac Mini, VPS stays as Kanban host

## Firewall Rules

The VPS should ONLY expose port 3000 to Tailscale:
```bash
# UFW example
sudo ufw deny 3000/tcp          # Block public access
sudo ufw allow from 100.64.0.0/10 to any port 3000  # Allow Tailscale
```

## Backup

The SQLite database is in the Docker volume `kanban-data`. To back up:
```bash
docker compose -f deploy/docker-compose.yml exec kanban \
  sqlite3 /app/data/kanban.db ".backup /app/data/backup.db"
docker cp kanban-command:/app/data/backup.db ./kanban-backup-$(date +%Y%m%d).db
```

## Troubleshooting

- **Can't access**: Verify Tailscale is running on both VPS and client device
- **401 Unauthorized**: Check KANBAN_PASSWORD in .env, clear browser cookies
- **Agent posts failing**: Verify AGENT_API_KEYS in .env, check X-Agent-Key header
- **Database errors**: Run `docker compose exec kanban npx prisma db push` to sync schema
