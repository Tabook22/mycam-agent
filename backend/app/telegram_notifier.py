from datetime import datetime

import httpx

from app.config import get_settings
from app.schemas import PaymentEventRead


class TelegramNotifier:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def enabled(self) -> bool:
        return bool(
            self.settings.telegram_enabled
            and self.settings.telegram_bot_token
            and self.settings.telegram_chat_id
        )

    def _format_message(self, event: PaymentEventRead) -> str:
        event_time = event.timestamp.strftime("%H:%M:%S") if isinstance(event.timestamp, datetime) else ""
        observed = "\n".join(f"- {signal}" for signal in event.observed_signals) or "- No strong signals recorded"
        confidence = event.confidence.value.title() if hasattr(event.confidence, "value") else str(event.confidence).title()

        if event.payment_type == "cash":
            return f"Cash Payment Detected\n\nTime: {event_time}\nConfidence: {confidence}\n\nObserved:\n{observed}"
        if event.payment_type == "card":
            return f"Card Payment Detected\n\nTime: {event_time}\nConfidence: {confidence}\n\nObserved:\n{observed}"
        return f"Review Required\n\nTime: {event_time}\n\nPayment type unclear.\nManual review recommended.\n\nObserved:\n{observed}"

    async def send_payment_event(self, event: PaymentEventRead) -> None:
        if not self.enabled:
            return

        url = f"https://api.telegram.org/bot{self.settings.telegram_bot_token}/sendMessage"
        payload = {"chat_id": self.settings.telegram_chat_id, "text": self._format_message(event)}
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()


telegram_notifier = TelegramNotifier()
