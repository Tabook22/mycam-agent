from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.cv_detector import cv_payment_detector
from app.schemas import DetectionStartRequest, DetectionStatus


router = APIRouter(prefix="/detection", tags=["detection"])


def _status_response() -> DetectionStatus:
    runtime = cv_payment_detector.status()
    return DetectionStatus(
        running=runtime.running,
        camera_id=runtime.camera_id,
        mode=runtime.mode,
        last_signals=runtime.last_signals,
        last_event_at=runtime.last_event_at,
        last_error=runtime.last_error,
        frames_processed=runtime.frames_processed,
    )


@router.get("/status", response_model=DetectionStatus)
def detection_status() -> DetectionStatus:
    return _status_response()


@router.post("/start", response_model=DetectionStatus)
def start_detection(payload: DetectionStartRequest) -> DetectionStatus:
    try:
        cv_payment_detector.start(payload.camera_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return _status_response()


@router.post("/stop", response_model=DetectionStatus)
def stop_detection() -> DetectionStatus:
    cv_payment_detector.stop()
    return _status_response()


@router.get("/{camera_id}/stream")
def detection_stream(camera_id: str) -> StreamingResponse:
    try:
        return StreamingResponse(
            cv_payment_detector.annotated_mjpeg_stream(camera_id),
            media_type="multipart/x-mixed-replace; boundary=frame",
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
