import { useEffect, useState } from "react";
import {
  Activity, Banknote, Camera, CreditCard, HelpCircle,
  Play, Square, Video, VideoOff, Zap, Cpu,
} from "lucide-react";
import {
  cameraStreamUrl, closeCamera, detectionStreamUrl,
  fetchCameras, fetchDetectionStatus, fetchEvents,
  fetchSummary, openCamera, startDetection, stopDetection,
} from "../api";
import EventBadge       from "../components/EventBadge";
import ManualEventPanel from "../components/ManualEventPanel";
import StatCard         from "../components/StatCard";

function makeTrend(n) {
  if (n === 0) return [0,0,0,0,0,0,0];
  return Array.from({ length: 7 }, (_, i) => {
    if (i === 6) return n;
    const base = Math.round(n * (0.45 + i * 0.075));
    const wave = Math.round(Math.sin(i * 1.9 + n * 0.2) * n * 0.08);
    return Math.max(0, base + wave);
  });
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex justify-between">
        <div className="skeleton h-2.5 w-20 rounded-full" />
        <div className="skeleton h-8 w-8 rounded-xl" />
      </div>
      <div className="skeleton h-9 w-14 rounded-lg" />
      <div className="skeleton h-2 w-16 rounded-full" />
      <div className="skeleton h-5 w-14 rounded" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3.5 animate-pulse">
      <div className="skeleton h-9 w-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-40 rounded-full" />
        <div className="skeleton h-2.5 w-24 rounded-full" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
  );
}

export default function Dashboard() {
  const [summary,   setSummary]   = useState({ cash:0, card:0, uncertain:0, total:0 });
  const [trends,    setTrends]    = useState(null);
  const [events,    setEvents]    = useState([]);
  const [cameras,   setCameras]   = useState([]);
  const [detection, setDetection] = useState({ running:false, mode:"heuristic", last_signals:[] });
  const [selCam,    setSelCam]    = useState("cam01");
  const [streaming, setStreaming] = useState(null);
  const [loading,   setLoading]   = useState(true);

  const activeCam = (cameras.find(c => c.camera_id === selCam) || cameras[0])?.camera_id || "cam01";
  const selCamera = cameras.find(c => c.camera_id === selCam) || cameras[0];
  const useDetStream = detection.running && detection.camera_id === activeCam;

  async function refresh() {
    try {
      const [s, e, c, d] = await Promise.all([
        fetchSummary(1), fetchEvents({ limit: 6 }), fetchCameras(), fetchDetectionStatus(),
      ]);
      setSummary(s); setEvents(e.items); setCameras(c.cameras); setDetection(d);
      setTrends(p => p || { total: makeTrend(s.total), cash: makeTrend(s.cash), card: makeTrend(s.card), uncertain: makeTrend(s.uncertain) });
      if (!c.cameras.some(c => c.camera_id === selCam)) setSelCam(c.cameras[0]?.camera_id || "cam01");
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); const t = setInterval(refresh, 10_000); return () => clearInterval(t); }, []);

  const handleOpen  = async () => { await openCamera(activeCam); setStreaming(activeCam); refresh(); };
  const handleClose = async () => { await closeCamera(activeCam); setStreaming(null); refresh(); };
  const handleStart = async () => { await openCamera(activeCam); setStreaming(activeCam); setDetection(await startDetection(activeCam)); refresh(); };
  const handleStop  = async () => { setDetection(await stopDetection()); refresh(); };

  // ── Page label style ──────────────────────────────────────
  const pageLabel = { fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)" };

  return (
    <div className="page space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <p style={pageLabel}>Live Monitoring</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl" style={{ color: "var(--t1)" }}>Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--t3)" }}>Real-time cashier payment intelligence.</p>
      </div>

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading
          ? Array(4).fill(0).map((_,i) => <SkeletonCard key={i}/>)
          : <>
              <StatCard label="Total Events"  value={summary.total}     tone="total" icon={Activity}   sublabel="All types"      trend={trends?.total} />
              <StatCard label="Cash"          value={summary.cash}      tone="green" icon={Banknote}   sublabel="Detected today" trend={trends?.cash}  />
              <StatCard label="Card / POS"    value={summary.card}      tone="blue"  icon={CreditCard} sublabel="Detected today" trend={trends?.card}  />
              <StatCard label="Uncertain"     value={summary.uncertain} tone="amber" icon={HelpCircle} sublabel="Needs review"   trend={trends?.uncertain} />
            </>
        }
      </div>

      {/* ── Camera + Manual ─────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">

        {/* Camera card */}
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold" style={{ color: "var(--t1)" }}>Live Camera Feed</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--t3)" }}>Source: {selCamera?.source || "0"}</p>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={selCamera?.status === "streaming"
                ? { background: "var(--g-dim)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.25)" }
                : { background: "rgba(255,255,255,0.05)", color: "var(--t3)", border: "1px solid var(--border)" }
              }
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: selCamera?.status === "streaming" ? "var(--green)" : "var(--t4)" }} />
              {selCamera?.status || "stopped"}
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input max-w-[180px] flex-1"
              value={activeCam}
              onChange={e => { setSelCam(e.target.value); setStreaming(null); }}
            >
              {cameras.map(c => <option key={c.camera_id} value={c.camera_id}>{c.camera_id} — {c.source}</option>)}
            </select>
            <button onClick={handleOpen}  className="btn btn-secondary shrink-0 gap-1.5"><Video size={13}/> Open</button>
            <button onClick={handleClose} className="btn btn-ghost shrink-0 gap-1.5"><VideoOff size={13}/> Close</button>
          </div>

          {selCamera?.last_error && (
            <p className="rounded-xl px-3 py-2.5 text-xs" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}>
              {selCamera.last_error}
            </p>
          )}

          {/* Video frame */}
          <div className="relative overflow-hidden rounded-2xl" style={{ background: "#06060b", border: "1px solid var(--border)" }}>
            {streaming === activeCam ? (
              <>
                <img
                  src={useDetStream ? detectionStreamUrl(activeCam) : cameraStreamUrl(activeCam)}
                  alt="stream" className="aspect-video w-full object-contain"
                />
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)" }}>
                  <div className="live-dot" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Live</span>
                </div>
                {useDetStream && (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background:"rgba(124,58,237,0.8)", backdropFilter:"blur(8px)" }}>
                    <Zap size={11} className="text-yellow-300" />
                    <span className="text-xs font-bold text-white">AI On</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background:"rgba(255,255,255,0.04)" }}>
                  <Camera size={28} style={{ color:"var(--t4)" }} />
                </div>
                <p className="text-sm" style={{ color:"var(--t4)" }}>Select a camera and click <span style={{color:"var(--t2)"}}>Open</span></p>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {cameras.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {cameras.map(cam => (
                <button
                  key={cam.camera_id}
                  onClick={() => { setSelCam(cam.camera_id); setStreaming(null); }}
                  className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl transition-all"
                  style={{ border: cam.camera_id === activeCam ? "2px solid var(--accent)" : "2px solid var(--border)", boxShadow: cam.camera_id === activeCam ? "0 0 12px rgba(124,58,237,0.4)" : "none", opacity: cam.camera_id === activeCam ? 1 : 0.5 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background:"#06060b" }}>
                    <img src={cameraStreamUrl(cam.camera_id)} alt={cam.camera_id} className="h-full w-full object-cover" onError={e=>e.currentTarget.style.display="none"} />
                    <Camera size={14} style={{ color:"var(--t4)", position:"absolute" }} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 px-2 py-1" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.8),transparent)" }}>
                    <p className="text-[10px] font-bold text-white">{cam.camera_id}</p>
                  </div>
                  {cam.camera_id === activeCam && <div className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow:"0 0 6px #34d399" }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <ManualEventPanel cameraId={activeCam} onCreated={refresh} />
      </div>

      {/* ── AI Detection — dark command panel ───────────── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "#07070f", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background:"rgba(255,255,255,0.04)" }}>
              {detection.running && <div className="absolute inset-0 animate-ping rounded-xl" style={{ background:"rgba(16,185,129,0.2)" }} />}
              <Cpu size={19} style={{ color: detection.running ? "var(--green)" : "var(--t4)" }} />
            </div>
            <div>
              <p className="font-semibold text-white">AI Detection Engine</p>
              <p className="text-xs mt-0.5" style={{ color:"var(--t4)" }}>
                Mode: {detection.mode || "heuristic"} · {detection.frames_processed || 0} frames analyzed
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleStart} className="btn btn-primary"><Play size={13}/> Start</button>
            <button onClick={handleStop}  className="btn btn-secondary"><Square size={12}/> Stop</button>
          </div>
        </div>

        {/* Status cells */}
        <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0" style={{ "--tw-divide-opacity":"1", borderColor:"var(--border)" }}>
          {[
            { label:"Status", value: detection.running ? "Active" : "Idle", dot: detection.running },
            { label:"Camera", value: detection.camera_id || activeCam, mono: true },
            { label:"Last Detection", value: detection.last_event_at || "—" },
          ].map(({ label, value, dot, mono }) => (
            <div key={label} className="px-5 py-4" style={{ borderColor:"var(--border)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color:"var(--t4)" }}>{label}</p>
              <div className="mt-2 flex items-center gap-2">
                {dot !== undefined && (
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot ? "var(--green)" : "var(--t4)", boxShadow: dot ? "0 0 10px rgba(16,185,129,0.8)" : "none" }} />
                )}
                <span className={`text-lg font-black text-white ${mono ? "mono" : ""}`}>{value}</span>
              </div>
            </div>
          ))}
        </div>

        {detection.last_error && (
          <div className="px-5 py-3 text-sm" style={{ borderTop:"1px solid var(--border)", color:"#f87171", background:"var(--r-dim)" }}>
            {detection.last_error}
          </div>
        )}

        {/* Signals */}
        <div className="px-5 py-4" style={{ borderTop:"1px solid var(--border)" }}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color:"var(--t4)" }}>Live Signals</p>
          <div className="flex flex-wrap gap-2">
            {(detection.last_signals || []).map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background:"rgba(124,58,237,0.18)", border:"1px solid rgba(124,58,237,0.28)", color:"#c4b5fd" }}>
                <Zap size={10}/>{s}
              </span>
            ))}
            {!detection.last_signals?.length && <span className="text-sm" style={{ color:"var(--t4)" }}>No signals observed yet.</span>}
          </div>
        </div>
      </div>

      {/* ── Recent events ────────────────────────────────── */}
      <div className="card">
        <div className="mb-4">
          <p className="font-semibold" style={{ color:"var(--t1)" }}>Recent Events</p>
          <p className="text-xs mt-0.5" style={{ color:"var(--t3)" }}>Latest 6 detected or recorded transactions</p>
        </div>
        <div className="space-y-1">
          {loading
            ? Array(4).fill(0).map((_,i) => <SkeletonRow key={i}/>)
            : events.length === 0
              ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <Activity size={28} style={{ color:"var(--t4)" }} className="opacity-40" />
                  <p className="text-sm" style={{ color:"var(--t4)" }}>No events recorded yet.</p>
                </div>
              )
              : events.map((ev, idx) => {
                  const isNew = Date.now() - new Date(ev.timestamp).getTime() < 60_000;
                  const borderColor = ev.payment_type==="cash" ? "var(--green)" : ev.payment_type==="card" ? "var(--blue)" : "var(--amber)";
                  const iconBg      = ev.payment_type==="cash" ? "var(--g-dim)"  : ev.payment_type==="card" ? "var(--b-dim)"  : "var(--am-dim)";
                  return (
                    <div
                      key={ev.event_id}
                      className="event-row flex items-center gap-3 rounded-xl py-3 pl-3 pr-3 transition-colors"
                      style={{ borderLeft:`3px solid ${borderColor}`, animationDelay:`${idx*40}ms` }}
                      onMouseEnter={e => e.currentTarget.style.background="var(--s2)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background:iconBg }}>
                        {ev.payment_type==="cash"      && <Banknote   size={15} style={{color:"var(--green)"}}/>}
                        {ev.payment_type==="card"      && <CreditCard size={15} style={{color:"var(--blue)"}} />}
                        {ev.payment_type==="uncertain" && <HelpCircle size={15} style={{color:"var(--amber)"}}/>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold" style={{color:"var(--t1)"}}>{ev.notes || "Payment event"}</p>
                        <p className="text-xs" style={{color:"var(--t4)"}}>{new Date(ev.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isNew && <span className="animate-pulse rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide" style={{background:"var(--green)",color:"#fff"}}>New</span>}
                        <EventBadge type={ev.payment_type}/>
                      </div>
                    </div>
                  );
                })
          }
        </div>
      </div>
    </div>
  );
}
