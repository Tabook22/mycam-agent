from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.camera import camera_manager
from app.schemas import CameraSource, CameraStatus


router = APIRouter(prefix="/cameras", tags=["cameras"])


@router.get("", response_model=CameraStatus)
def list_cameras() -> CameraStatus:
    return CameraStatus(
        cameras=[
            CameraSource(camera_id=item.camera_id, source=item.source, status=item.status)
            for item in camera_manager.list_cameras()
        ]
    )


@router.get("/{camera_id}/stream")
def camera_stream(camera_id: str) -> StreamingResponse:
    try:
        camera_manager.open(camera_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return StreamingResponse(
        camera_manager.mjpeg_stream(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )
