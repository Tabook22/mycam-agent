import { useState } from "react";

import { createPaymentEvent } from "../api";

const defaultSignals = {
  cash: ["banknotes detected", "cash drawer opened"],
  card: ["pos terminal interaction", "card detected"],
  uncertain: []
};

export default function ManualEventPanel({ cameraId = "cam01", onCreated }) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(paymentType) {
    setSaving(true);
    try {
      const event = await createPaymentEvent({
        payment_type: paymentType,
        confidence: paymentType === "uncertain" ? "low" : "high",
        camera_id: cameraId,
        observed_signals: defaultSignals[paymentType],
        notes: notes || (paymentType === "uncertain" ? "Payment type unclear" : `Manual ${paymentType} payment event`),
        source: "manual"
      });
      setNotes("");
      onCreated?.(event);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Manual Event Capture</h2>
          <p className="text-sm text-slate-500">Version 1 records cashier-observed events instantly.</p>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">{cameraId}</span>
      </div>
      <textarea
        className="input mt-4 min-h-24"
        placeholder="Optional notes, such as invoice number or cashier observation"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button disabled={saving} onClick={() => submit("cash")} className="btn bg-emerald-600 text-white">
          Cash
        </button>
        <button disabled={saving} onClick={() => submit("card")} className="btn bg-blue-600 text-white">
          Card / POS
        </button>
        <button disabled={saving} onClick={() => submit("uncertain")} className="btn bg-amber-500 text-white">
          Uncertain
        </button>
      </div>
    </div>
  );
}
