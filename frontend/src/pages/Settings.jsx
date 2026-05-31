import { useEffect, useState } from "react";

import { fetchSettings } from "../api";

export default function Settings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-slate-500">Runtime configuration is loaded from backend environment variables.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-bold">Camera URLs</h2>
          <p className="mt-1 text-sm text-slate-500">Set `CAMERA_SOURCES` in `backend/.env` as comma-separated values.</p>
          <div className="mt-4 space-y-2">
            {(settings?.camera_sources || ["0"]).map((source, index) => (
              <div key={`${source}-${index}`} className="rounded-xl bg-slate-50 p-3 font-mono text-sm">
                {source}
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="text-lg font-bold">Telegram Bot</h2>
          <p className="mt-1 text-sm text-slate-500">Configure bot token and chat ID in `backend/.env`.</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <dt>Enabled</dt>
              <dd className="font-semibold">{settings?.telegram_enabled ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <dt>Configured</dt>
              <dd className="font-semibold">{settings?.telegram_configured ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </section>

        <section className="card xl:col-span-2">
          <h2 className="text-lg font-bold">Detection Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Version 1 uses manual event buttons. These thresholds are reserved for Version 2 CV scoring.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {Object.entries(settings?.confidence_thresholds || {}).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
