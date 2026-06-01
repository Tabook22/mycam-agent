import { useState } from "react";
import { Banknote, CreditCard, HelpCircle, CheckCircle2, Video } from "lucide-react";
import { createPaymentEvent } from "../api";

const defaultSignals = {
  cash: ["banknotes detected", "cash drawer opened"],
  card: ["pos terminal interaction", "card detected"],
  uncertain: [],
};

export default function ManualEventPanel({ cameraId = "cam01", onCreated }) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  async function submit(paymentType) {
    setSaving(true);
    try {
      const event = await createPaymentEvent({
        payment_type: paymentType,
        confidence: paymentType === "uncertain" ? "low" : "high",
        camera_id: cameraId,
        observed_signals: defaultSignals[paymentType],
        notes: notes || (paymentType === "uncertain" ? "Payment type unclear" : `Manual ${paymentType} payment event`),
        source: "manual",
      });
      setNotes("");
      setLastSaved(paymentType);
      setTimeout(() => setLastSaved(null), 3000);
      onCreated?.(event);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Manual Capture</h2>
          <p className="mt-0.5 text-sm text-slate-500">Record observed payment events instantly.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5">
          <Video size={12} className="text-violet-600" />
          <span className="text-xs font-semibold text-violet-700">{cameraId}</span>
        </div>
      </div>

      <textarea
        className="input mt-4 min-h-[96px] resize-none leading-relaxed"
        placeholder="Optional notes — invoice number, cashier name, or observation..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {lastSaved && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 animate-fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold capitalize">{lastSaved}</span> payment recorded
        </div>
      )}

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        <button
          disabled={saving}
          onClick={() => submit("cash")}
          className="btn btn-green flex-col gap-1 py-4"
        >
          <Banknote size={20} />
          <span>Cash</span>
        </button>
        <button
          disabled={saving}
          onClick={() => submit("card")}
          className="btn btn-blue flex-col gap-1 py-4"
        >
          <CreditCard size={20} />
          <span>Card / POS</span>
        </button>
        <button
          disabled={saving}
          onClick={() => submit("uncertain")}
          className="btn btn-amber flex-col gap-1 py-4"
        >
          <HelpCircle size={20} />
          <span>Uncertain</span>
        </button>
      </div>
    </div>
  );
}
