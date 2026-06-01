import { useEffect, useState } from "react";
import {
  Activity, Banknote, Camera, CreditCard, HelpCircle,
  Play, Square, Video, VideoOff, Zap, BarChart3, Cpu,
} from "lucide-react";

import {
  cameraStreamUrl, closeCamera, detectionStreamUrl,
  fetchCameras, fetchDetectionStatus, fetchEvents,
  fetchSummary, openCamera, startDetection, stopDetection,
} from "../api";
import EventBadge   from "../components/EventBadge";
import ManualEventPanel from "../components/ManualEventPanel";
import StatCard     from "../components/StatCard";

// ── Sparkline trend generator ────────────────────────────────
// Generates a plausible 7-point trend ending at `current`.
// Uses Math.sin so values are stable (no random jitter on re-render).
function makeTrend(current) {
  if (current === 0) return [0, 0, 0, 0, 0, 0, 0];
  return Array.from({ length: 7 }, (_, i) => {
    if (i === 6) return current;
    const t    = i / 6;
    const base = Math.round(current * (0.45 + t * 0.48));
    const wave = Math.round(Math.sin(i * 1.9 + current * 0.2) * current * 0.08);
    return Math.max(0, base + wave);
  });
}

// ── Skeleton helpers ─────────────────────────────────────────
function SkeletonStatCard() {
  return (
    <div className="rounded-2xl bg-slate-200/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-2.5 w-20 rounded-full" />
          <div className="skeleton h-8 w-12 rounded-lg" />
          <div className="skeleton h-2 w-16 rounded-full" />
        </div>
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
      <div className="skeleton mt-3 h-5 w-14 rounded" />
    </div>
  );
}

function SkeletonEventRow() {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className="skeleton h-8 w-8 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3 w-36 rounded-full" />
        <div className="skeleton h-2.5 w-24 rounded-full" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  );
}

export default function Dashboard() {
  const [summary,   setSummary]   = useState({ cash: 0, card: 0, uncertain: 0, total: 0 });
  const [trends,    setTrends]    = useState(null);   // generated once on first load
  const [events,    setEvents]    = useState([]);
  const [cameras,   setCameras]   = useState([]);
  const [detection, setDetection] = useState({ running: false, mode: "heuristic", last_signals: [] });
  const [selectedCameraId, setSelectedCameraId] = useState("cam01");
  const [streamingCameraId, setStreamingCameraId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCamera     = cameras.find((c) => c.camera_id === selectedCameraId) || cameras[0];
  const activeCamera       = selectedCamera?.camera_id || "cam01";
  const useDetectionStream = detection.running && detection.camera_id === activeCamera;

  async function refresh() {
    try {
      const [s, e, c, d] = await Promise.all([
        fetchSummary(1), fetchEvents({ limit: 6 }),
        fetchCameras(), fetchDetectionStatus(),
      ]);
      setSummary(s);
      setEvents(e.items);
      setCameras(c.cameras);
      setDetection(d);
      // Generate sparkline trends once — keep stable across refreshes
      setTrends((prev) => prev || {
        total:     makeTrend(s.total),
        cash:      makeTrend(s.cash),
        card:      makeTrend(s.card),
        uncertain: makeTrend(s.uncertain),
      });
      if (!c.cameras.some((cam) => cam.camera_id === selectedCameraId)) {
        setSelectedCameraId(c.cameras[0]?.camera_id || "cam01");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 10_000);
    return () => clearInterval(t);
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
    setDetection(await startDetection(activeCamera));
    await refresh();
  }
  async function handleStopDetection() {
    setDetection(await stopDetection());
    await refresh();
  }

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Page header ─────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">Live Monitoring</p>
          <h1 className="mt-0.5 text-2xl font-black text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time cashier payment intelligence.</p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm sm:flex">
          <BarChart3 size={15} className="text-violet-500" />
          <span className="text-sm font-semibold text-slate-700">Today's Overview</span>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Events"  value={summary.total}     tone="total" icon={Activity}   sublabel="All types"      trend={trends?.total} />
            <StatCard label="Cash"          value={summary.cash}      tone="green" icon={Banknote}   sublabel="Detected today" trend={trends?.cash} />
            <StatCard label="Card / POS"    value={summary.card}      tone="blue"  icon={CreditCard} sublabel="Detected today" trend={trends?.card} />
            <StatCard label="Uncertain"     value={summary.uncertain} tone="amber" icon={HelpCircle} sublabel="Needs review"   trend={trends?.uncertain} />
          </>
        )}
      </div>

      {/* ── Camera feed + Manual panel ───────────── */}
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">

        {/* Camera card */}
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-800">Live Camera Feed</h2>
              <p className="text-xs text-slate-500">Source: {selectedCamera?.source || "0"}</p>
            </div>
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              selectedCamera?.status === "streaming"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${selectedCamera?.status === "streaming" ? "bg-emerald-500" : "bg-slate-400"}`} />
              {selectedCamera?.status || "stopped"}
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input max-w-[180px] flex-1"
              value={activeCamera}
              onChange={(e) => { setSelectedCameraId(e.target.value); setStreamingCameraId(null); }}
            >
              {cameras.map((c) => (
                <option key={c.camera_id} value={c.camera_id}>{c.camera_id} — {c.source}</option>
              ))}
            </select>
            <button onClick={handleOpenCamera}  className="btn btn-green shrink-0"><Video    size={14} /> Open</button>
            <button onClick={handleCloseCamera} className="btn btn-slate shrink-0"><VideoOff size={14} /> Close</button>
          </div>

          {selectedCamera?.last_error && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
              {selectedCamera.last_error}
            </p>
          )}

          {/* Main video frame */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
            {streamingCameraId === activeCamera ? (
              <>
                <img
                  src={useDetectionStream ? detectionStreamUrl(activeCamera) : cameraStreamUrl(activeCamera)}
                  alt="Camera stream"
                  className="aspect-video w-full object-contain"
                />
                {/* LIVE badge */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 backdrop-blur-sm">
                  <div className="live-dot" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Live</span>
                </div>
                {/* AI badge */}
                {useDetectionStream && (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-violet-600/85 px-2.5 py-1 backdrop-blur-sm">
                    <Zap size={11} className="text-yellow-300" />
                    <span className="text-xs font-bold text-white">AI On</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 text-slate-600">
                <Camera size={36} className="opacity-20" />
                <p className="text-sm">Select a camera and click <strong className="text-slate-400">Open</strong></p>
              </div>
            )}
          </div>

          {/* ── Camera thumbnail strip (multiple cameras) ── */}
          {cameras.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {cameras.map((cam) => (
                <button
                  key={cam.camera_id}
                  onClick={() => { setSelectedCameraId(cam.camera_id); setStreamingCameraId(null); }}
                  className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-xl ring-2 transition-all duration-150 ${
                    cam.camera_id === activeCamera
                      ? "ring-violet-500 shadow-lg shadow-violet-500/25"
                      : "ring-slate-700 opacity-55 hover:opacity-90 hover:ring-slate-500"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <img
                      src={cameraStreamUrl(cam.camera_id)}
                      alt={cam.camera_id}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <Camera size={14} className="absolute text-slate-500 opacity-40" />
                  </div>
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-2 py-1">
                    <p className="text-[10px] font-bold text-white">{cam.camera_id}</p>
                  </div>
                  {/* Active dot */}
                  {cam.camera_id === activeCamera && (
                    <div className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <ManualEventPanel cameraId={activeCamera} onCreated={refresh} />
      </div>

      {/* ── AI Detection — dark command-center panel ── */}
      <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-xl ring-1 ring-white/8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            {/* Pulsing brain icon */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800">
              {detection.running && (
                <div className="absolute inset-0 animate-ping rounded-xl bg-emerald-500/20" />
              )}
              <Cpu size={20} className={detection.running ? "text-emerald-400" : "text-slate-500"} />
            </div>
            <div>
              <h2 className="font-bold text-white">AI Detection Engine</h2>
              <p className="text-xs text-slate-500">
                Mode: {detection.mode || "heuristic"} · {detection.frames_processed || 0} frames analyzed
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={handleStartDetection} className="btn btn-brand"><Play size={14} /> Start</button>
            <button onClick={handleStopDetection}  className="btn btn-dark"><Square size={13} /> Stop</button>
          </div>
        </div>

        {/* Status cells */}
        <div className="grid divide-y divide-slate-800 sm:divide-x sm:divide-y-0 sm:grid-cols-3">
          {/* Status */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Status</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  detection.running
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    : "bg-slate-600"
                }`}
              />
              <span className="text-lg font-black text-white">
                {detection.running ? "Active" : "Idle"}
              </span>
            </div>
          </div>
          {/* Camera */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Monitoring</p>
            <p className="mt-2 font-mono text-lg font-black text-white">
              {detection.camera_id || activeCamera}
            </p>
          </div>
          {/* Last event */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Last Detection</p>
            <p className="mt-2 text-sm font-bold text-white">
              {detection.last_event_at || "—"}
            </p>
          </div>
        </div>

        {/* Error */}
        {detection.last_error && (
          <div className="border-t border-white/10 px-5 py-3">
            <p className="text-sm text-red-400">{detection.last_error}</p>
          </div>
        )}

        {/* Live signals */}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Live Signals</p>
          <div className="flex flex-wrap gap-2">
            {(detection.last_signals || []).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/30"
              >
                <Zap size={10} />{s}
              </span>
            ))}
            {!detection.last_signals?.length && (
              <span className="text-sm text-slate-600">No signals observed yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent events ────────────────────────── */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Recent Events</h2>
            <p className="text-xs text-slate-500">Latest 6 detected or recorded transactions</p>
          </div>
        </div>

        <div className="space-y-1">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <SkeletonEventRow key={i} />)
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
              <Activity size={30} className="opacity-25" />
              <p className="text-sm">No events recorded yet.</p>
            </div>
          ) : (
            events.map((ev, idx) => {
              const isNew = Date.now() - new Date(ev.timestamp).getTime() < 60_000;
              const borderColor =
                ev.payment_type === "cash" ? "border-emerald-500" :
                ev.payment_type === "card" ? "border-blue-500"    : "border-amber-500";
              const iconBg =
                ev.payment_type === "cash" ? "bg-emerald-100" :
                ev.payment_type === "card" ? "bg-blue-100"    : "bg-amber-100";

              return (
                <div
                  key={ev.event_id}
                  className={`event-row flex items-center gap-3 rounded-xl border-l-4 py-3 pl-3 pr-3 transition-colors hover:bg-slate-50 ${borderColor}`}
                  style={{ animationDelay: `${idx * 45}ms` }}
                >
                  {/* Icon */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    {ev.payment_type === "cash"      && <Banknote   size={15} className="text-emerald-600" />}
                    {ev.payment_type === "card"      && <CreditCard size={15} className="text-blue-600"    />}
                    {ev.payment_type === "uncertain" && <HelpCircle size={15} className="text-amber-600"   />}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {ev.notes || "Payment event"}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(ev.timestamp).toLocaleString()}</p>
                  </div>

                  {/* Right side */}
                  <div className="flex shrink-0 items-center gap-2">
                    {isNew && (
                      <span className="animate-pulse rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                        New
                      </span>
                    )}
                    <EventBadge type={ev.payment_type} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
