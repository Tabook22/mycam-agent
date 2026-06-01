# Deployment Guide

## Hostinger VPS — Production Setup

**Server:** `76.13.124.173`  
**User:** `nasser`  
**Project path:** `/opt/mycam-agent`

### First-time VPS Setup

```bash
# SSH into VPS
ssh nasser@76.13.124.173

# Install system dependencies
sudo apt update && sudo apt install -y python3.11 python3.11-venv python3-pip git nginx nodejs npm

# Clone the repository
sudo mkdir -p /opt/mycam-agent
sudo chown nasser:nasser /opt/mycam-agent
git clone https://github.com/tabook22/mycam-agent.git /opt/mycam-agent

# Backend setup
cd /opt/mycam-agent/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your actual values:
nano .env

# Frontend setup
cd /opt/mycam-agent/frontend
npm install
npm run build
```

### Systemd Service (Backend)

Create `/etc/systemd/system/mycam-agent.service`:

```ini
[Unit]
Description=MyCamAgent FastAPI Backend
After=network.target

[Service]
User=nasser
WorkingDirectory=/opt/mycam-agent/backend
ExecStart=/opt/mycam-agent/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5
Environment=APP_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable mycam-agent
sudo systemctl start mycam-agent
sudo systemctl status mycam-agent
```

### Nginx Configuration

Create `/etc/nginx/sites-available/mycam-agent`:

```nginx
server {
    listen 80;
    server_name 76.13.124.173;

    # Frontend — serve built React files
    location / {
        root /opt/mycam-agent/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;

        # Required for MJPEG camera streaming
        proxy_buffering off;
        proxy_read_timeout 3600s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mycam-agent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Routine Deployment (Pull & Restart)

After pushing code to GitHub, deploy to VPS:

```bash
# Option 1: SSH manually
ssh nasser@76.13.124.173
cd /opt/mycam-agent
git pull origin main
source backend/.venv/bin/activate
pip install -r backend/requirements.txt   # only if requirements changed
cd frontend && npm install && npm run build   # only if frontend changed
sudo systemctl restart mycam-agent

# Option 2: Use the deploy script
ssh nasser@76.13.124.173 'bash /opt/mycam-agent/deployment/deploy.sh'
```

---

## Docker Compose (Alternative)

For a simpler setup without systemd:

```bash
docker compose up --build -d
```

Services:
- Backend: `http://76.13.124.173:8000`
- Frontend: `http://76.13.124.173:5174`

For production, use Nginx in front to serve both on port 80/443.

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
APP_ENV=production
DATABASE_URL=sqlite:////opt/mycam-agent/data/mycamagent.db
CORS_ORIGINS=http://76.13.124.173,http://localhost:5174
CAMERA_SOURCES=0
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

---

## Camera Devices on VPS

USB cameras require device access:

```yaml
# docker-compose.yml
devices:
  - /dev/video0:/dev/video0
```

For remote cameras (RTSP/IP cameras), ensure the VPS can reach the camera IP:

```bash
# Test RTSP from VPS
ffprobe rtsp://username:password@camera-ip:554/live
```

---

## Data Persistence

SQLite database lives at `/opt/mycam-agent/data/mycamagent.db`.  
Back it up regularly:

```bash
cp /opt/mycam-agent/data/mycamagent.db /opt/mycam-agent/data/backup_$(date +%Y%m%d).db
```

---

## Security Checklist

- [ ] Restrict dashboard to trusted IPs or VPN
- [ ] Add HTTPS via Let's Encrypt (`certbot --nginx`)
- [ ] Keep Telegram tokens out of git (`.gitignore` covers `.env`)
- [ ] Rotate tokens if ever exposed
- [ ] Do not add face recognition or biometric storage
