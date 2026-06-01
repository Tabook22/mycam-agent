import { useState } from "react";
import { Banknote, CreditCard, HelpCircle, CheckCircle2, Video } from "lucide-react";
import { createPaymentEvent } from "../api";

const defaultSignals = {
  cash:      ["banknotes detected", "cash drawer opened"],
  card:      ["pos terminal interaction", "card detected"],
  uncertain: [],
};

const btnConfig = [
  {
    type:    "cash",
    label:   "Cash",
    icon:    Banknote,
    wrapper: "border-emerald-200 bg-emerald-50/80 hover:border-emerald-400 hover:bg-emerald-100 focus-visible:ring-emerald-500",
    iconBg:  "bg-gradient-to-br from-emerald-500 to-teal-500",
    text:    "text-emerald-800",
  },
  {
    type:    "card",
    label:   "Card / POS",
    icon:    CreditCard,
    wrapper: "border-blue-200 bg-blue-50/80 hover:border-blue-400 hover:bg-blue-100 focus-visible:ring-blue-500",
    iconBg:  "bg-gradient-to-br from-blue-500 to-cyan-500",
    text:    "text-blue-800",
  },
  {
    type:    "uncertain",
    label:   "Uncertain",
    icon:    HelpCircle,
    wrapper: "border-amber-200 bg-amber-50/80 hover:border-amber-400 hover:bg-amber-100 focus-visible:ring-amber-500",
    iconBg:  "bg-gradient-to-br from-amber-500 to-orange-500",
    text:    "text-amber-800",
  },
];

export default function ManualEventPanel({ cameraId = "cam01", onCreated }) {
  const [notes,     setNotes]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  async function submit(paymentType) {
    setSaving(true);
    try {
      const event = await createPaymentEvent({
        payment_type:     paymentType,
        confidence:       paymentType === "uncertain" ? "low" : "high",
        camera_id:        cameraId,
        observed_signals: defaultSignals[paymentType],
        notes:            notes || (paymentType === "uncertain" ? "Payment type unclear" : `Manual ${paymentType} payment event`),
        source:           "manual",
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
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-800">Manual Capture</h2>
          <p className="mt-0.5 text-xs text-slate-500">Record a payment event you observed at the counter.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 ring-1 ring-violet-200/60">
          <Video size={11} className="text-violet-600" />
          <span className="text-[11px] font-bold text-violet-700">{cameraId}</span>
        </div>
      </div>

      {/* Notes textarea */}
      <textarea
        className="input resize-none leading-relaxed"
        rows={3}
        placeholder="Optional notes — invoice number, cashier name, or observation…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Success toast */}
      {lastSaved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 ring-1 ring-emerald-200 animate-fade-in">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>
            <span className="font-bold capitalize">{lastSaved}</span> payment recorded
          </span>
        </div>
      )}

      {/* Card-style capture buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {btnConfig.map(({ type, label, icon: Icon, wrapper, iconBg, text }) => (
          <button
            key={type}
            disabled={saving}
            onClick={() => submit(type)}
            className={`group flex flex-col items-center gap-2.5 rounded-2xl border-2 p-3.5 transition-all duration-150 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 ${wrapper} disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} text-white shadow-sm transition-transform group-hover:scale-105`}>
              <Icon size={18} />
            </div>
            <span className={`text-xs font-bold leading-tight ${text}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
