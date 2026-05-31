# MyCamAgent

MyCamAgent is an AI-ready camera monitoring system for perfume shop cashier areas. Version 1 provides a complete working system with live camera streaming, manual payment event capture, SQLite storage, Telegram notifications, CSV export, and a business dashboard.

The application classifies payment events as:

- `cash`
- `card`
- `uncertain`

It never performs face recognition, customer identification, biometric storage, customer profiling, or identity tracking.

## Stack

Backend: Python, FastAPI, OpenCV, SQLite, SQLAlchemy, Pydantic, Uvicorn, python-dotenv.

Frontend: React, Vite, React Router, Axios, Tailwind CSS.

## Quick Start

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Docker

```bash
docker compose up --build
```

Backend runs on `http://localhost:8000`. Frontend runs on `http://localhost:5173`.

## Version Roadmap

Version 1 is implemented: camera connection, live stream, manual Cash/Card/Uncertain buttons, SQLite storage, Telegram notifications, dashboard, events, settings, export, and docs.

Version 2 should add computer vision detectors for cash, card, POS terminal usage, hand movement, and region-of-interest analysis.

Version 3 should add AI-assisted event explanations, confidence scoring, daily summaries, and business analytics.
