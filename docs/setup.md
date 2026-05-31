# Local Development Guide

## Requirements

- Python 3.11+
- Node.js 20+
- npm
- A USB webcam, RTSP camera, CCTV stream, or video file

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

API docs are available at `http://localhost:8000/docs`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## RTSP Setup

Edit `backend/.env`:

```env
CAMERA_SOURCES=rtsp://username:password@camera-ip:554/live
```

Multiple cameras can be comma-separated:

```env
CAMERA_SOURCES=0,rtsp://camera-ip/live,video.mp4
```

OpenCV handles USB camera indexes, RTSP URLs, CCTV stream URLs, and local video files.

## Telegram Setup

1. Create a bot with BotFather in Telegram.
2. Copy the bot token.
3. Send a message to the bot from the target owner account or group.
4. Get the chat ID using Telegram Bot API tools or a chat ID helper bot.
5. Set:

```env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_CHAT_ID=your-chat-id
```

Restart the backend after changing `.env`.

## Version 1 Testing

1. Start backend and frontend.
2. Confirm the camera appears on Dashboard.
3. Click Cash, Card, and Uncertain.
4. Open Events and confirm the rows are stored.
5. Click Export CSV.
6. If Telegram is configured, confirm messages are delivered.
