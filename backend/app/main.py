from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.camera import camera_manager
from app.config import get_settings
from app.database import init_db
from app.routers import cameras, events, settings as settings_router
from app.schemas import HealthCheck


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    camera_manager.release_all()


app = FastAPI(
    title="MyCamAgent API",
    description="AI-ready camera payment detection backend for perfume shop cashier monitoring.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cameras.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")


@app.get("/api/health", response_model=HealthCheck)
def health() -> HealthCheck:
    return HealthCheck(status="ok", app=settings.app_name)
