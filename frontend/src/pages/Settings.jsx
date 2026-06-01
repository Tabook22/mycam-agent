import { useEffect, useState } from "react";
import {
  Camera, Plus, Trash2, CheckCircle2, XCircle,
  AlertCircle, Send, Sliders, MonitorCheck,
} from "lucide-react";
import { addCamera, fetchCameras, fetchSettings, removeCamera, testCameraSource } from "../api";

const sourceHelp = {
  pc:     "Use 0 for the built-in webcam. Try 1, 2, or 3 for another USB camera.",
  mobile: "Use a mobile camera stream URL, e.g. http://PHONE-IP:8080/video.",
  rtsp:   "Use an IP/CCTV/RTSP stream, e.g. rtsp://user:pass@camera-ip:554/live.",
  video:  "Use a local video file path the backend can access, e.g. video.mp4.",
  custom: "Use any OpenCV-compatible camera source string.",
};

const typeOptions = [
  { value:"pc",     label:"PC / USB Camera" },
  { value:"mobile", label:"Mobile Camera"   },
  { value:"rtsp",   label:"RTSP / CCTV"     },
  { value:"video",  label:"Video File"       },
  { value:"custom", label:"Custom Source"    },
];

function SectionHeader({ icon: Icon, iconColor, iconBg, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: iconBg }}>
        <Icon size={17} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="font-semibold" style={{ color:"var(--t1)" }}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color:"var(--t3)" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Settings() {
  const [settings,    setSettings]    = useState(null);
  const [cameras,     setCameras]     = useState([]);
  const [cameraType,  setCameraType]  = useState("pc");
  const [cameraId,    setCameraId]    = useState("");
  const [source,      setSource]      = useState("0");
  const [message,     setMessage]     = useState(null);
  const [saving,      setSaving]      = useState(false);

  async function load() {
    const [s, c] = await Promise.all([fetchSettings(), fetchCameras()]);
    setSettings(s); setCameras(c.cameras);
  }
  useEffect(() => { load(); }, []);

  function selectType(type) {
    setCameraType(type); setMessage(null);
    if (type==="pc")     setSource("0");
    else if(type==="mobile") setSource("http://PHONE-IP:8080/video");
    else if(type==="rtsp")   setSource("rtsp://username:password@camera-ip:554/live");
    else if(type==="video")  setSource("video.mp4");
    else setSource("");
  }

  async function handleTest() {
    setSaving(true); setMessage({ kind:"info", text:"Testing camera source…" });
    try {
      const r = await testCameraSource(source);
      setMessage({ kind: r.ok ? "ok" : "error", text: r.message });
    } catch(e) {
      setMessage({ kind:"error", text: e.response?.data?.detail || "Camera test failed" });
    } finally { setSaving(false); }
  }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true);
    setMessage({ kind:"info", text:"Adding camera…" });
    try {
      await addCamera({ source, camera_id: cameraId || null });
      setCameraId(""); setMessage({ kind:"ok", text:"Camera added. Go to Dashboard to open it." });
      await load();
    } catch(e) {
      setMessage({ kind:"error", text: e.response?.data?.detail || "Unable to add camera" });
    } finally { setSaving(false); }
  }

  async function handleRemove(id) {
    setSaving(true); setMessage(null);
    try { await removeCamera(id); await load(); }
    catch(e) { setMessage({ kind:"error", text: e.response?.data?.detail || "Unable to remove camera" }); }
    finally { setSaving(false); }
  }

  const msgCfg = {
    ok:    { bg:"var(--g-dim)",  border:"rgba(16,185,129,0.2)",  color:"var(--green)", Icon:CheckCircle2 },
    error: { bg:"var(--r-dim)",  border:"rgba(239,68,68,0.2)",   color:"#f87171",      Icon:XCircle      },
    info:  { bg:"var(--a-dim)",  border:"rgba(124,58,237,0.22)", color:"#a78bfa",      Icon:MonitorCheck  },
  };

  const labelStyle = { fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"var(--accent)" };

  return (
    <div className="page space-y-6">

      {/* Header */}
      <div>
        <p style={labelStyle}>Configuration</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl" style={{ color:"var(--t1)" }}>Settings</h1>
        <p className="mt-1 text-sm" style={{ color:"var(--t3)" }}>Manage cameras, notifications, and detection thresholds.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">

        {/* ── Camera Setup ─────────────────────────────── */}
        <section className="card xl:col-span-2">
          <SectionHeader
            icon={Camera} iconColor="#a78bfa" iconBg="var(--a-dim)"
            title="Camera Setup" subtitle="Add or remove cameras from any source type."
          />

          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[160px_1fr_130px]">
              <select className="input" value={cameraType} onChange={e => selectType(e.target.value)}>
                {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input className="input mono" value={source} onChange={e => setSource(e.target.value)} placeholder="0, rtsp://…, http://…" />
              <input className="input" value={cameraId} onChange={e => setCameraId(e.target.value)} placeholder="Custom ID (opt)" />
            </div>
            <p className="rounded-xl px-3 py-2 text-xs" style={{ background:"var(--s2)", color:"var(--t3)" }}>
              {sourceHelp[cameraType]}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={saving || !source} onClick={handleTest} className="btn btn-ghost gap-1.5">
                <MonitorCheck size={14}/> Test
              </button>
              <button disabled={saving || !source} className="btn btn-primary gap-1.5">
                <Plus size={14}/> Add Camera
              </button>
            </div>
          </form>

          {/* Feedback message */}
          {message && (() => {
            const { bg, border, color, Icon } = msgCfg[message.kind] || msgCfg.info;
            return (
              <div className="page mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm" style={{ background:bg, border:`1px solid ${border}`, color }}>
                <Icon size={15} className="mt-0.5 shrink-0"/>
                {message.text}
              </div>
            );
          })()}

          {/* Camera list */}
          {cameras.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {cameras.map(cam => (
                <div
                  key={cam.camera_id}
                  className="flex items-start justify-between gap-3 rounded-2xl p-4"
                  style={{ background:"var(--s2)", border:"1px solid var(--border)" }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Camera size={13} style={{ color:"var(--accent)" }} className="shrink-0"/>
                      <p className="font-semibold text-sm" style={{ color:"var(--t1)" }}>{cam.camera_id}</p>
                    </div>
                    <p className="mt-1 break-all mono text-xs" style={{ color:"var(--t3)" }}>{cam.source}</p>
                    <span
                      className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={cam.status === "streaming"
                        ? { background:"var(--g-dim)", color:"var(--green)", border:"1px solid rgba(16,185,129,0.2)" }
                        : { background:"rgba(255,255,255,0.05)", color:"var(--t4)", border:"1px solid var(--border)" }
                      }
                    >
                      {cam.status}
                    </span>
                    {cam.last_error && (
                      <p className="mt-2 flex items-start gap-1 text-xs" style={{ color:"#f87171" }}>
                        <AlertCircle size={11} className="mt-0.5 shrink-0"/> {cam.last_error}
                      </p>
                    )}
                  </div>
                  <button
                    disabled={saving}
                    onClick={() => handleRemove(cam.camera_id)}
                    className="shrink-0 rounded-xl p-2 transition-colors"
                    style={{ color:"#f87171" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--r-dim)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Right column ─────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Telegram */}
          <section className="card">
            <SectionHeader
              icon={Send} iconColor="#38bdf8" iconBg="rgba(56,189,248,0.12)"
              title="Telegram Bot" subtitle="Configure token in backend/.env"
            />
            <div className="space-y-2">
              {[
                { label:"Enabled",    value: settings?.telegram_enabled },
                { label:"Configured", value: settings?.telegram_configured },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm" style={{ background:"var(--s2)" }}>
                  <span style={{ color:"var(--t3)" }}>{label}</span>
                  <span
                    className="flex items-center gap-1.5 font-semibold"
                    style={{ color: value ? "var(--green)" : "var(--t4)" }}
                  >
                    {value ? <CheckCircle2 size={13}/> : <XCircle size={13}/>}
                    {value ? "Yes" : "No"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Detection thresholds */}
          <section className="card">
            <SectionHeader
              icon={Sliders} iconColor="#818cf8" iconBg="rgba(129,140,248,0.12)"
              title="Detection Thresholds" subtitle="Reserved for Version 2 CV scoring"
            />
            <div className="space-y-3">
              {Object.entries(settings?.confidence_thresholds || {}).map(([lbl, val]) => (
                <div key={lbl} className="rounded-xl p-4" style={{ background:"var(--s2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium capitalize" style={{ color:"var(--t3)" }}>{lbl}</p>
                    <p className="text-sm font-bold tabular" style={{ color:"var(--t1)" }}>{val}</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background:"rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width:`${val*100}%`, background:"linear-gradient(90deg,#7c3aed,#818cf8)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
