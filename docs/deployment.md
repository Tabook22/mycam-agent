# Deployment Guide

## Docker Compose

```bash
docker compose up --build
```

Services:

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

For production, place a reverse proxy such as Nginx, Caddy, or Traefik in front of both services and terminate TLS there.

## Environment

Create `backend/.env` from `backend/.env.example`.

Important values:

```env
DATABASE_URL=sqlite:///./mycamagent.db
CAMERA_SOURCES=0
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

For RTSP, ensure the host machine or container has network access to the camera VLAN.

## Camera Devices in Docker

USB cameras may require device mapping:

```yaml
devices:
  - /dev/video0:/dev/video0
```

On Windows Docker Desktop, RTSP or uploaded video files are usually more reliable than direct USB passthrough.

## Data Persistence

SQLite data is stored in the backend container working directory unless a volume is mounted. Use a volume for production:

```yaml
volumes:
  - ./data:/app/data
```

Then set:

```env
DATABASE_URL=sqlite:////app/data/mycamagent.db
```

## Production Notes

- Restrict dashboard access to trusted staff or VPN.
- Use HTTPS for remote access.
- Keep Telegram tokens out of git.
- Rotate tokens if they are exposed.
- Preserve the privacy boundary: do not add face recognition, identity tracking, or biometric storage.
