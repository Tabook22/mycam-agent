from fastapi import APIRouter
from pydantic import BaseModel

from app.config import get_settings
from app.telegram_notifier import telegram_notifier


class RuntimeSettings(BaseModel):
    camera_sources: list[str]
    telegram_configured: bool
    telegram_enabled: bool
    confidence_thresholds: dict[str, float]


router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=RuntimeSettings)
def read_settings() -> RuntimeSettings:
    settings = get_settings()
    return RuntimeSettings(
        camera_sources=settings.configured_camera_sources,
        telegram_configured=telegram_notifier.enabled,
        telegram_enabled=settings.telegram_enabled,
        confidence_thresholds={
            "low": settings.low_confidence_threshold,
            "medium": settings.medium_confidence_threshold,
            "high": settings.high_confidence_threshold,
        },
    )
