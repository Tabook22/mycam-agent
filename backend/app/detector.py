from app.payment_classifier import classify_from_signals
from app.schemas import PaymentEventCreate


class PaymentDetector:
    """Version 1 detector placeholder.

    V1 intentionally relies on manual operator input. This class is the stable
    extension point for V2 computer vision models and V3 AI-assisted reasoning.
    """

    def classify_manual_event(self, payload: PaymentEventCreate) -> PaymentEventCreate:
        if payload.payment_type.value != "uncertain":
            return payload

        payment_type, confidence = classify_from_signals(payload.observed_signals)
        return payload.model_copy(update={"payment_type": payment_type, "confidence": confidence})


payment_detector = PaymentDetector()
