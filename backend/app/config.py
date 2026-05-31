from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MyCamAgent"
    app_env: str = "development"
    database_url: str = "sqlite:///./mycamagent.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    camera_sources: str = Field(default="0", description="Comma-separated camera sources")
    default_camera_id: str = "cam01"
    frame_width: int = 960
    frame_height: int = 540
    jpeg_quality: int = 80

    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    telegram_enabled: bool = True

    low_confidence_threshold: float = 0.35
    medium_confidence_threshold: float = 0.65
    high_confidence_threshold: float = 0.85

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def configured_camera_sources(self) -> List[str]:
        return [source.strip() for source in self.camera_sources.split(",") if source.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
