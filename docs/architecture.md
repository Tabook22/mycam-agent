# MyCamAgent Architecture

## Overview

MyCamAgent is split into a FastAPI backend and React dashboard.

The backend owns camera access, event storage, classification interfaces, notification delivery, and API contracts. The frontend provides live monitoring, manual event capture, search, filtering, export, and settings visibility.

## Version 1 Flow

1. OpenCV connects to a configured camera source.
2. FastAPI exposes the camera as an MJPEG stream.
3. A cashier/operator clicks Cash, Card, or Uncertain in the dashboard.
4. The backend validates and stores the event in SQLite.
5. Telegram notification is sent in the background when configured.
6. Dashboard summary and event tables refresh through API calls.

## Backend Modules

- `camera.py`: OpenCV camera source management and MJPEG streaming.
- `detector.py`: Versioned detector extension point.
- `payment_classifier.py`: Signal-based fallback classification for uncertain manual events.
- `models.py`: SQLAlchemy payment event schema.
- `schemas.py`: Pydantic request and response models.
- `telegram_notifier.py`: Telegram Bot API integration.
- `routers/`: API routes for cameras, events, and settings.

## Privacy Boundary

The system only stores payment event metadata. It does not store faces, biometric templates, customer identities, or customer profiles.

## Future CV Extension

Version 2 detectors should run inside `detector.py` or dedicated detector classes. Keep outputs action-focused:

- observed signals
- payment type
- confidence
- notes

Avoid identity features entirely.
