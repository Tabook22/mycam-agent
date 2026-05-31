from app.schemas import Confidence, PaymentType


CASH_SIGNALS = {
    "banknotes detected",
    "cash drawer opened",
    "cashier received cash",
    "cashier counting money",
    "change returned",
    "money placed into drawer",
}

CARD_SIGNALS = {
    "card detected",
    "pos terminal interaction",
    "customer tapped card",
    "pin entry behavior",
    "mobile payment tap",
    "card inserted into pos",
}


def classify_from_signals(observed_signals: list[str]) -> tuple[PaymentType, Confidence]:
    normalized = {signal.strip().lower() for signal in observed_signals}
    cash_score = len(normalized.intersection(CASH_SIGNALS))
    card_score = len(normalized.intersection(CARD_SIGNALS))

    if cash_score == 0 and card_score == 0:
        return PaymentType.uncertain, Confidence.low
    if cash_score == card_score:
        return PaymentType.uncertain, Confidence.medium

    score = max(cash_score, card_score)
    confidence = Confidence.high if score >= 2 else Confidence.medium
    payment_type = PaymentType.cash if cash_score > card_score else PaymentType.card
    return payment_type, confidence
