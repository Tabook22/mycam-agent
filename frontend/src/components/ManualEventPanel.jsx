import { useState } from "react";
import { Banknote, CreditCard, HelpCircle, CheckCircle2, Video } from "lucide-react";
import { createPaymentEvent } from "../api";

const defaultSignals = {
  cash:      ["banknotes detected", "cash drawer opened"],
  card:      ["pos terminal interaction", "card detected"],
  uncertain: [],
};

const btns = [
  {
    type: "cash", label: "Cash", icon: Banknote,
    iconBg: "rgba(16,185,129,0.18)", iconColor: "#34d399",
    hoverBorder: "rgba(16,185,129,0.35)",
  },
  {
    type: "card", label: "Card / POS", icon: CreditCard,
    iconBg: "rgba(59,130,246,0.18)", iconColor: "#60a5fa",
    hoverBorder: "rgba(59,130,246,0.35)",
  },
  {
    type: "uncertain", label: "Uncertain", icon: HelpCircle,
    iconBg: "rgba(245,158,11,0.18)", iconColor: "#fbbf24",
    hoverBorder: "rgba(245,158,11,0.35)",
  },
];

export default function ManualEventPanel({ cameraId = "cam01", onCreated }) {
  const [notes,     setNotes]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  async function submit(type) {
    setSaving(true);
    try {
      const ev = await createPaymentEvent({
        payment_type:     type,
        confidence:       type === "uncertain" ? "low" : "high",
        camera_id:        cameraId,
        observed_signals: defaultSignals[type],
        notes:            notes || (type === "uncertain" ? "Payment type unclear" : `Manual ${type} payment event`),
        source:           "manual",
      });
      setNotes("");
      setLastSaved(type);
      setTimeout(() => setLastSaved(null), 3000);
      onCreated?.(ev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold" style={{ color: "var(--t1)" }}>Manual Capture</p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--t3)" }}>Record a payment event you observed.</p>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: "var(--a-dim)", border: "1px solid rgba(124,58,237,0.22)", color: "#a78bfa" }}
        >
          <Video size={11} />
          {cameraId}
        </div>
      </div>

      {/* Notes */}
      <textarea
        className="input resize-none leading-relaxed"
        rows={3}
        placeholder="Optional notes — invoice #, cashier name, observation…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />

      {/* Toast */}
      {lastSaved && (
        <div
          className="page flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium"
          style={{ background: "var(--g-dim)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}
        >
          <CheckCircle2 size={14} />
          <span className="capitalize font-bold">{lastSaved}</span>&nbsp;payment recorded
        </div>
      )}

      {/* Capture buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {btns.map(({ type, label, icon: Icon, iconBg, iconColor, hoverBorder }) => (
          <button
            key={type}
            disabled={saving}
            onClick={() => submit(type)}
            className="capture-btn"
            onMouseEnter={e => { e.currentTarget.style.borderColor = hoverBorder; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: iconBg }}
            >
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            <span className="text-xs font-semibold leading-tight" style={{ color: "var(--t2)" }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
