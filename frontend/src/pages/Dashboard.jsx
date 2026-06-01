import { useEffect, useState } from "react";
import {
  Activity,
  Banknote,
  Camera,
  CreditCard,
  HelpCircle,
  Play,
  Square,
  Video,
  VideoOff,
  Zap,
  BarChart3,
} from "lucide-react";

import {
  cameraStreamUrl,
  closeCamera,
  detectionStreamUrl,
  fetchCameras,
  fetchDetectionStatus,
  fetchEvents,
  fetchSummary,
  openCamera,
  startDetection,
  stopDetection,
} from "../api";
import EventBadge from "../components/EventBadge";
import ManualEventPanel from "../components/ManualEventPanel";
import StatCard from "../components/StatCard";

function SectionHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState({ cash: 0, card: 0, uncertain: 0, total: 0 });
  const [events, setEvents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [detection, setDetection] = useState({ running: false, mode: "heuristic", last_signals: [] });
  const [selectedCameraId, setSelectedCameraId] = useState("cam01");
  const [streamingCameraId, setStreamingCameraId] = useState(null);

  const selectedCamera = cameras.find((c) => c.camera_id === selectedCameraId) || cameras[0];
  const activeCamera = selectedCamera?.camera_id || "cam01";
  const useDetectionStream = detection.running && detection.camera_id === activeCamera;

  async function refresh() {
    const [s, e, c, d] = await Promise.all([
      fetchSummary(1),
      fetchEvents({ limit: 6 }),
      fetchCameras(),
      fetchDetectionStatus(),
    ]);
    setSummary(s);
    setEvents(e.items);
    setCameras(c.cameras);
    setDetection(d);
    if (!c.cameras.some((cam) => cam.camera_id === selectedCameraId)) {
      setSelectedCameraId(c.cameras[0]?.camera_id || "cam01");
    }
  }

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 10000);
    return () => window.clearInterval(timer);
  }, []);

  async function handleOpenCamera() {
    await openCamera(activeCamera);
    setStreamingCameraId(activeCamera);
    await refresh();
  }

  async function handleCloseCamera() {
    await closeCamera(activeCamera);
    setStreamingCameraId(null);
    await refresh();
  }

  async function handleStartDetection() {
    await openCamera(activeCamera);
    setStreamingCameraId(activeCamera);
    const status = await startDetection(activeCamera);
    setDetection(status);
    await refresh();
  }

  async function handleStopDetection() {
    const status = await stopDetection();
    setDetection(status);
    await refresh();
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">Live Monitoring</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">Real-time cashier payment activity at a glance.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm sm:flex">
          <BarChart3 size={16} className="text-violet-500" />
          <span className="text-sm font-semibold text-slate-700">Today's Overview</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Events" value={summary.total} tone="total" icon={Activity} sublabel="All payment types" />
        <StatCard label="Cash Payments" value={summary.cash} tone="green" icon={Banknote} sublabel="Detected today" />
        <StatCard label="Card / POS" value={summary.card} tone="blue" icon={CreditCard} sublabel="Detected today" />
        <StatCard label="Uncertain" value={summary.uncertain} tone="amber" icon={HelpCircle} sublabel="Needs review" />
      </div>

      {/* Camera + Manual Panel */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Camera feed */}
        <div className="card">
          <SectionHeader
            title="Live Camera Feed"
            subtitle={`Source: ${selectedCamera?.source || "0"}`}
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                selectedCamera?.status === "streaming"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${selectedCamera?.status === "streaming" ? "bg-emerald-500" : "bg-slate-400"}`} />
              {selectedCamera?.status || "configured"}
            </span>
          </SectionHeader>

          {/* Controls */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <select
              className="input max-w-[200px]"
              value={activeCamera}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                setStreamingCameraId(null);
              }}
            >
              {cameras.map((c) => (
                <option key={c.camera_id} value={c.camera_id}>
                  {c.camera_id} — {c.source}
                </option>
              ))}
            </select>
            <button onClick={handleOpenCamera} className="btn btn-green">
              <Video size={15} /> Open
            </button>
            <button onClick={handleCloseCamera} className="btn btn-slate">
              <VideoOff size={15} /> Close
            </button>
          </div>

          {selectedCamera?.last_error && (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {selectedCamera.last_error}
            </p>
          )}

          {/* Video container */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
            {streamingCameraId === activeCamera ? (
              <>
                <img
                  src={useDetectionStream ? detectionStreamUrl(activeCamera) : cameraStreamUrl(activeCamera)}
                  alt="Camera stream"
                  className="aspect-video w-full object-contain"
                />
                {/* Live overlay */}
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                  <div className="live-dot" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Live</span>
                </div>
                {useDetectionStream && (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-violet-600/80 px-3 py-1.5 backdrop-blur-sm">
                    <Zap size={11} className="text-yellow-300" />
                    <span className="text-xs font-bold text-white">AI Detection</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 text-slate-500">
                <Camera size={40} className="opacity-30" />
                <p className="text-sm">Select a camera and click <strong className="text-slate-300">Open</strong></p>
              </div>
            )}
          </div>
        </div>

        <ManualEventPanel cameraId={activeCamera} onCreated={refresh} />
      </div>

      {/* Auto Detection */}
      <div className="card">
        <SectionHeader
          title="Automatic Payment Detection"
          subtitle={`Mode: ${detection.mode || "heuristic"} · Frames processed: ${detection.frames_processed || 0}`}
        >
          <div className="flex gap-2.5">
            <button onClick={handleStartDetection} className="btn btn-brand">
              <Play size={15} /> Start Detection
            </button>
            <button onClick={handleStopDetection} className="btn btn-slate">
              <Square size={14} /> Stop
            </button>
          </div>
        </SectionHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className={`rounded-2xl border p-4 transition-colors ${
            detection.running
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-200 bg-slate-50"
          }`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
            <div className="mt-2 flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${detection.running ? "bg-emerald-500" : "bg-slate-300"}`}
                style={detection.running ? { animation: "livePulse 2s infinite" } : {}} />
              <p className="text-lg font-bold text-slate-800">{detection.running ? "Running" : "Stopped"}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Camera</p>
            <p className="mt-2 text-lg font-bold text-slate-800">{detection.camera_id || activeCamera}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Event</p>
            <p className="mt-2 text-sm font-bold text-slate-800">{detection.last_event_at || "None yet"}</p>
          </div>
        </div>

        {detection.last_error && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {detection.last_error}
          </p>
        )}

        {/* Signals */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Observed Signals</p>
          <div className="flex flex-wrap gap-2">
            {(detection.last_signals || []).map((signal) => (
              <span key={signal} className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Zap size={10} />
                {signal}
              </span>
            ))}
            {(detection.last_signals || []).length === 0 && (
              <span className="text-sm text-slate-400">No payment signals observed yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <SectionHeader title="Recent Payment Events" subtitle="Last 6 detected or recorded events" />
        <div className="divide-y divide-slate-100">
          {events.map((event, i) => (
            <div
              key={event.event_id}
              className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-slate-50 -mx-1 px-1 rounded-xl"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  event.payment_type === "cash"
                    ? "bg-emerald-100"
                    : event.payment_type === "card"
                    ? "bg-blue-100"
                    : "bg-amber-100"
                }`}>
                  {event.payment_type === "cash" && <Banknote size={15} className="text-emerald-600" />}
                  {event.payment_type === "card" && <CreditCard size={15} className="text-blue-600" />}
                  {event.payment_type === "uncertain" && <HelpCircle size={15} className="text-amber-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{event.notes || "Payment event"}</p>
                  <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <EventBadge type={event.payment_type} />
            </div>
          ))}
          {events.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
              <Activity size={32} className="opacity-30" />
              <p className="text-sm">No payment events recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
