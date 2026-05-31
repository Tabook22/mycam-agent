# MyCamAgent Backend

FastAPI backend for Version 1 of MyCamAgent.

## Features

- USB webcam, IP camera, RTSP, CCTV, and video file sources through OpenCV.
- MJPEG live camera streaming.
- Manual payment event creation for cash, card, and uncertain payments.
- SQLite storage with SQLAlchemy models.
- CSV export and daily event summary endpoint.
- Telegram notification support.
- Stable extension points for future YOLO, Ultralytics, OpenAI Vision, and Gemini Vision detectors.

## Quick Start

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Open API docs at `http://localhost:8000/docs`.

## Environment

Set `CAMERA_SOURCES` to `0`, `rtsp://camera-ip/live`, or a video path such as `video.mp4`.

Telegram notifications require:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

The system does not perform face recognition, identity tracking, biometric storage, or customer profiling.
