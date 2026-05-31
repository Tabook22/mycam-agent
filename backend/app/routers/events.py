import csv
import io
import json
from datetime import datetime, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, Query, Response
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.detector import payment_detector
from app.models import PaymentEvent
from app.schemas import EventSummary, PaymentEventCreate, PaymentEventList, PaymentEventRead
from app.telegram_notifier import telegram_notifier
from app.database import get_db


router = APIRouter(prefix="/events", tags=["events"])


def _serialize_event(model: PaymentEvent) -> PaymentEventRead:
    return PaymentEventRead(
        event_id=model.event_id,
        timestamp=model.timestamp,
        payment_type=model.payment_type,
        confidence=model.confidence,
        camera_id=model.camera_id,
        observed_signals=json.loads(model.observed_signals or "[]"),
        notes=model.notes or "",
        source=model.source,
    )


@router.post("", response_model=PaymentEventRead, status_code=201)
async def create_event(
    payload: PaymentEventCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> PaymentEventRead:
    classified = payment_detector.classify_manual_event(payload)
    event = PaymentEvent(
        payment_type=classified.payment_type.value,
        confidence=classified.confidence.value,
        camera_id=classified.camera_id,
        observed_signals=json.dumps(classified.observed_signals),
        notes=classified.notes,
        source=classified.source,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    response = _serialize_event(event)
    background_tasks.add_task(telegram_notifier.send_payment_event, response)
    return response


@router.get("", response_model=PaymentEventList)
def list_events(
    db: Session = Depends(get_db),
    search: str | None = None,
    payment_type: str | None = None,
    confidence: str | None = None,
    camera_id: str | None = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> PaymentEventList:
    query = select(PaymentEvent)
    count_query = select(func.count()).select_from(PaymentEvent)

    filters = []
    if payment_type:
        filters.append(PaymentEvent.payment_type == payment_type)
    if confidence:
        filters.append(PaymentEvent.confidence == confidence)
    if camera_id:
        filters.append(PaymentEvent.camera_id == camera_id)
    if search:
        like = f"%{search}%"
        filters.append(or_(PaymentEvent.notes.ilike(like), PaymentEvent.observed_signals.ilike(like)))

    for item in filters:
        query = query.where(item)
        count_query = count_query.where(item)

    total = db.execute(count_query).scalar_one()
    rows = db.execute(query.order_by(PaymentEvent.timestamp.desc()).offset(offset).limit(limit)).scalars().all()
    return PaymentEventList(items=[_serialize_event(row) for row in rows], total=total)


@router.get("/summary", response_model=EventSummary)
def event_summary(db: Session = Depends(get_db), days: int = Query(1, ge=1, le=365)) -> EventSummary:
    since = datetime.utcnow() - timedelta(days=days)
    rows = db.execute(
        select(PaymentEvent.payment_type, func.count(PaymentEvent.event_id))
        .where(PaymentEvent.timestamp >= since)
        .group_by(PaymentEvent.payment_type)
    ).all()
    data = {payment_type: count for payment_type, count in rows}
    return EventSummary(
        cash=data.get("cash", 0),
        card=data.get("card", 0),
        uncertain=data.get("uncertain", 0),
        total=sum(data.values()),
    )


@router.get("/export")
def export_events(db: Session = Depends(get_db)) -> Response:
    rows = db.execute(select(PaymentEvent).order_by(PaymentEvent.timestamp.desc())).scalars().all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["event_id", "timestamp", "payment_type", "confidence", "camera_id", "observed_signals", "notes"])
    for row in rows:
        writer.writerow([
            row.event_id,
            row.timestamp.isoformat(),
            row.payment_type,
            row.confidence,
            row.camera_id,
            row.observed_signals,
            row.notes,
        ])
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mycamagent-events.csv"},
    )
