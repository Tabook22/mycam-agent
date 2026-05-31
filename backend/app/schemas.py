from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel, Field


class PaymentType(str, Enum):
    cash = "cash"
    card = "card"
    uncertain = "uncertain"


class Confidence(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class PaymentEventCreate(BaseModel):
    payment_type: PaymentType
    confidence: Confidence = Confidence.low
    camera_id: str = "cam01"
    observed_signals: List[str] = Field(default_factory=list)
    notes: str = ""
    source: str = "manual"


class PaymentEventRead(PaymentEventCreate):
    event_id: str
    timestamp: datetime

    class Config:
        from_attributes = True


class PaymentEventList(BaseModel):
    items: List[PaymentEventRead]
    total: int


class CameraSource(BaseModel):
    camera_id: str
    source: str
    status: str


class CameraStatus(BaseModel):
    cameras: List[CameraSource]


class EventSummary(BaseModel):
    cash: int = 0
    card: int = 0
    uncertain: int = 0
    total: int = 0


class HealthCheck(BaseModel):
    status: str
    app: str
