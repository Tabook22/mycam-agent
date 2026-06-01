from __future__ import annotations

import json
import threading
import time
from collections import Counter, deque
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from app.camera import camera_manager
from app.config import get_settings
from app.database import SessionLocal
from app.models import PaymentEvent
from app.payment_classifier import classify_from_signals

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

try:
    import cv2
except ImportError:
    cv2 = None


CASH_LABELS = {"banknote", "cash", "money", "bill", "currency", "cash_drawer"}
CARD_LABELS = {"credit_card", "debit_card", "card", "pos_terminal", "payment_terminal", "terminal"}
MOBILE_LABELS = {"mobile_phone", "cell phone", "phone", "smartphone"}


@dataclass
class DetectionRuntime:
    running: bool = False
    camera_id: str | None = None
    mode: str = "heuristic"
    last_signals: list[str] = field(default_factory=list)
    last_event_at: str | None = None
    last_error: str | None = None
    frames_processed: int = 0


@dataclass
class DetectionObject:
    label: str
    signal: str
    confidence: float
    box: tuple[int, int, int, int]


class CVPaymentDetector:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.runtime = DetectionRuntime()
        self._thread: threading.Thread | None = None
        self._stop_event = threading.Event()
        self._model: Any | None = None

    def _load_model(self) -> Any | None:
        if not self.settings.yolo_model_path:
            self.runtime.mode = "heuristic"
            return None
        if YOLO is None:
            self.runtime.last_error = "Ultralytics is not installed. Run: pip install ultralytics"
            self.runtime.mode = "heuristic"
            return None

        self.runtime.mode = "yolo"
        return YOLO(self.settings.yolo_model_path)

    def _detections_from_yolo(self, frame: Any) -> list[DetectionObject]:
        if self._model is None:
            return []

        detections: list[DetectionObject] = []
        results = self._model.predict(frame, verbose=False, conf=0.35)
        for result in results:
            names = result.names or {}
            for box in result.boxes or []:
                label = names.get(int(box.cls[0]), "").strip().lower().replace(" ", "_")
                confidence = float(box.conf[0]) if box.conf is not None else 0.0
                x1, y1, x2, y2 = [int(value) for value in box.xyxy[0].tolist()]
                if label in CASH_LABELS:
                    signal = "banknote object detected" if label != "cash_drawer" else "cash drawer opened"
                    detections.append(DetectionObject(label=label, signal=signal, confidence=confidence, box=(x1, y1, x2, y2)))
                elif label in CARD_LABELS:
                    signal = "card object detected" if "card" in label else "pos terminal detected"
                    detections.append(DetectionObject(label=label, signal=signal, confidence=confidence, box=(x1, y1, x2, y2)))
                elif label in MOBILE_LABELS:
                    detections.append(DetectionObject(label=label, signal="mobile payment tap", confidence=confidence, box=(x1, y1, x2, y2)))
        return detections

    def _detections_from_heuristics(self, frame: Any) -> list[DetectionObject]:
        if cv2 is None or frame is None:
            return []

        detections: list[DetectionObject] = []
        frame_height, frame_width = frame.shape[:2]
        resized_width, resized_height = 480, 270
        resized = cv2.resize(frame, (resized_width, resized_height))
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 80, 180)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        scale_x = frame_width / resized_width
        scale_y = frame_height / resized_height

        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 900 or area > 18000:
                continue
            x, y, w, h = cv2.boundingRect(contour)
            if h == 0:
                continue
            aspect = w / h
            box = (
                int(x * scale_x),
                int(y * scale_y),
                int((x + w) * scale_x),
                int((y + h) * scale_y),
            )
            if 1.6 <= aspect <= 3.4:
                detections.append(DetectionObject("cash-like rectangle", "cash-like rectangular object detected", 0.45, box))
            elif 1.35 <= aspect <= 1.75 and 700 <= area <= 6000:
                detections.append(DetectionObject("card-like rectangle", "card-like object detected", 0.45, box))

        return detections

    def detect_objects(self, frame: Any) -> list[DetectionObject]:
        yolo_detections = self._detections_from_yolo(frame)
        if yolo_detections:
            return yolo_detections
        return self._detections_from_heuristics(frame)

    def analyze_frame(self, frame: Any) -> list[str]:
        return sorted({detection.signal for detection in self.detect_objects(frame)})

    def annotate_frame(self, frame: Any) -> Any:
        if cv2 is None or frame is None:
            return frame

        annotated = frame.copy()
        detections = self.detect_objects(annotated)
        for detection in detections:
            x1, y1, x2, y2 = detection.box
            color = (38, 166, 91) if "cash" in detection.signal or "banknote" in detection.signal else (255, 128, 0)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            label = f"{detection.label} {detection.confidence:.2f}"
            cv2.putText(annotated, label, (x1, max(y1 - 8, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)

        mode_label = f"Detection: {self.runtime.mode}"
        cv2.putText(annotated, mode_label, (16, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (124, 58, 237), 2)
        return annotated

    def annotated_mjpeg_stream(self, camera_id: str):
        while True:
            frame = camera_manager.read_frame(camera_id)
            if frame is None or cv2 is None:
                time.sleep(1)
                continue

            annotated = self.annotate_frame(frame)
            ok, buffer = cv2.imencode(".jpg", annotated, [int(cv2.IMWRITE_JPEG_QUALITY), self.settings.jpeg_quality])
            if ok:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
            time.sleep(0.05)

    def _create_event(self, camera_id: str, signals: list[str]) -> None:
        payment_type, confidence = classify_from_signals(signals)
        db = SessionLocal()
        try:
            event = PaymentEvent(
                payment_type=payment_type.value,
                confidence=confidence.value,
                camera_id=camera_id,
                observed_signals=json.dumps(signals),
                notes=f"Auto-detected {payment_type.value} payment from camera signals",
                source="auto_cv",
            )
            db.add(event)
            db.commit()
            self.runtime.last_event_at = datetime.utcnow().isoformat()
        finally:
            db.close()

    def _run(self, camera_id: str) -> None:
        signal_window: deque[tuple[float, str]] = deque()
        last_event_time = 0.0
        self._model = self._load_model()

        while not self._stop_event.is_set():
            try:
                frame = camera_manager.read_frame(camera_id)
                if frame is None:
                    self.runtime.last_error = "No frame received from camera"
                    time.sleep(1)
                    continue

                self.runtime.frames_processed += 1
                now = time.time()
                for signal in self.analyze_frame(frame):
                    signal_window.append((now, signal))

                while signal_window and now - signal_window[0][0] > self.settings.auto_detection_window_seconds:
                    signal_window.popleft()

                counts = Counter(signal for _, signal in signal_window)
                signals = sorted(counts.keys())
                self.runtime.last_signals = signals
                self.runtime.last_error = None

                if len(signals) >= 1 and now - last_event_time >= self.settings.auto_detection_cooldown_seconds:
                    self._create_event(camera_id, signals)
                    last_event_time = now

                time.sleep(self.settings.auto_detection_frame_interval_seconds)
            except Exception as exc:
                self.runtime.last_error = str(exc)
                time.sleep(2)

        self.runtime.running = False

    def start(self, camera_id: str) -> DetectionRuntime:
        if self.runtime.running:
            return self.runtime

        camera_manager.get_camera(camera_id)
        self._stop_event.clear()
        self.runtime = DetectionRuntime(running=True, camera_id=camera_id)
        self._thread = threading.Thread(target=self._run, args=(camera_id,), daemon=True)
        self._thread.start()
        return self.runtime

    def stop(self) -> DetectionRuntime:
        self._stop_event.set()
        self.runtime.running = False
        return self.runtime

    def status(self) -> DetectionRuntime:
        return self.runtime


cv_payment_detector = CVPaymentDetector()
