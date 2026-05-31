import threading
import time
from dataclasses import dataclass
from typing import Dict, Iterator

import cv2

from app.config import get_settings


@dataclass
class CameraRuntime:
    camera_id: str
    source: str
    status: str = "stopped"
    last_error: str | None = None


class CameraManager:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._captures: Dict[str, cv2.VideoCapture] = {}
        self._locks: Dict[str, threading.Lock] = {}
        self._runtimes: Dict[str, CameraRuntime] = {}
        self._configure_sources()

    def _configure_sources(self) -> None:
        for index, source in enumerate(self.settings.configured_camera_sources, start=1):
            camera_id = self.settings.default_camera_id if index == 1 else f"cam{index:02d}"
            self._runtimes[camera_id] = CameraRuntime(camera_id=camera_id, source=source)
            self._locks[camera_id] = threading.Lock()

    def list_cameras(self) -> list[CameraRuntime]:
        return list(self._runtimes.values())

    def _normalize_source(self, source: str):
        return int(source) if source.isdigit() else source

    def open(self, camera_id: str) -> cv2.VideoCapture:
        if camera_id not in self._runtimes:
            raise KeyError(f"Unknown camera_id: {camera_id}")

        runtime = self._runtimes[camera_id]
        capture = self._captures.get(camera_id)
        if capture and capture.isOpened():
            runtime.status = "online"
            return capture

        capture = cv2.VideoCapture(self._normalize_source(runtime.source))
        if self.settings.frame_width:
            capture.set(cv2.CAP_PROP_FRAME_WIDTH, self.settings.frame_width)
        if self.settings.frame_height:
            capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self.settings.frame_height)

        self._captures[camera_id] = capture
        if capture.isOpened():
            runtime.status = "online"
            runtime.last_error = None
        else:
            runtime.status = "offline"
            runtime.last_error = "Unable to open camera source"
        return capture

    def read_jpeg(self, camera_id: str) -> bytes | None:
        lock = self._locks[camera_id]
        with lock:
            capture = self.open(camera_id)
            ok, frame = capture.read()

        runtime = self._runtimes[camera_id]
        if not ok or frame is None:
            runtime.status = "offline"
            runtime.last_error = "Frame read failed"
            return None

        runtime.status = "online"
        frame = cv2.resize(frame, (self.settings.frame_width, self.settings.frame_height))
        ok, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), self.settings.jpeg_quality])
        return buffer.tobytes() if ok else None

    def mjpeg_stream(self, camera_id: str) -> Iterator[bytes]:
        while True:
            frame = self.read_jpeg(camera_id)
            if frame is None:
                time.sleep(1)
                continue
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            time.sleep(0.05)

    def release_all(self) -> None:
        for capture in self._captures.values():
            capture.release()
        self._captures.clear()


camera_manager = CameraManager()
