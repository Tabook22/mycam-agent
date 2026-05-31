import { useEffect, useState } from "react";

import { cameraStreamUrl, fetchCameras, fetchEvents, fetchSummary } from "../api";
import EventBadge from "../components/EventBadge";
import ManualEventPanel from "../components/ManualEventPanel";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [summary, setSummary] = useState({ cash: 0, card: 0, uncertain: 0, total: 0 });
  const [events, setEvents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const activeCamera = cameras[0]?.camera_id || "cam01";

  async function refresh() {
    const [summaryData, eventData, cameraData] = await Promise.all([
      fetchSummary(1),
      fetchEvents({ limit: 5 }),
      fetchCameras()
    ]);
    setSummary(summaryData);
    setEvents(eventData.items);
    setCameras(cameraData.cameras);
  }

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 10000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-slate-500">Monitor cashier payment activity in real time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Today" value={summary.total} />
        <StatCard label="Cash" value={summary.cash} tone="green" />
        <StatCard label="Card" value={summary.card} tone="blue" />
        <StatCard label="Uncertain" value={summary.uncertain} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Live Camera Feed</h2>
              <p className="text-sm text-slate-500">Source: {cameras[0]?.source || "0"}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {cameras[0]?.status || "configured"}
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl bg-slate-900">
            <img
              src={cameraStreamUrl(activeCamera)}
              alt="Live cashier camera stream"
              className="aspect-video w-full object-contain"
            />
          </div>
        </div>
        <ManualEventPanel cameraId={activeCamera} onCreated={refresh} />
      </div>

      <div className="card">
        <h2 className="text-lg font-bold">Active Alerts & Recent Events</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {events.map((event) => (
            <div key={event.event_id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-semibold">{event.notes || "Payment event"}</p>
                <p className="text-sm text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
              <EventBadge type={event.payment_type} />
            </div>
          ))}
          {events.length === 0 && <p className="py-6 text-sm text-slate-500">No payment events recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
