#!/bin/bash
# MyCamAgent — VPS Deployment Script
# Run on Hostinger VPS: bash /opt/mycam-agent/deployment/deploy.sh

set -e

PROJECT_DIR="/opt/mycam-agent"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
SERVICE_NAME="mycam-agent"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   MyCamAgent — Deploying Latest      ║"
echo "╚══════════════════════════════════════╝"
echo ""

cd "$PROJECT_DIR"

echo "▶  Pulling latest code from GitHub..."
git pull origin main

echo "▶  Installing backend dependencies..."
source "$BACKEND_DIR/.venv/bin/activate"
pip install -q -r "$BACKEND_DIR/requirements.txt"
deactivate

echo "▶  Building frontend..."
cd "$FRONTEND_DIR"
npm install --silent
npm run build

echo "▶  Restarting backend service..."
sudo systemctl restart "$SERVICE_NAME"
sleep 2
systemctl is-active --quiet "$SERVICE_NAME" && echo "   ✓ Backend service running" || echo "   ✗ Backend service failed — check: sudo journalctl -u $SERVICE_NAME -n 30"

echo "▶  Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx && echo "   ✓ Nginx reloaded"

echo ""
echo "✓  Deployment complete."
echo "   App:  http://76.13.124.173"
echo "   API:  http://76.13.124.173/api"
echo "   Docs: http://76.13.124.173/api/docs"
echo ""
