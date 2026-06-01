import { useEffect, useState } from "react";
import {
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Sliders,
  MonitorCheck,
  Loader2,
} from "lucide-react";
import { addCamera, fetchCameras, fetchSettings, removeCamera, testCameraSource } from "../api";

const sourceHelp = {
  pc: "Use 0 for the built-in webcam. Try 1, 2, or 3 for another USB camera.",
  mobile: "Use a mobile camera app stream URL, e.g. http://PHONE-IP:8080/video.",
  rtsp: "Use an IP/CCTV/RTSP stream, e.g. rtsp://user:pass@camera-ip:554/live.",
  video: "Use a local video file path the backend can access, e.g. video.mp4.",
  custom: "Use any OpenCV-compatible camera source string.",
};

const cameraTypeOptions = [
  { value: "pc", label: "PC / USB Camera" },
  { value: "mobile", label: "Mobile Camera" },
  { value: "rtsp", label: "RTSP / CCTV" },
  { value: "video", label: "Video File" },
  { value: "custom", label: "Custom Source" },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [cameraType, setCameraType] = useState("pc");
  const [cameraId, setCameraId] = useState("");
  const [source, setSource] = useState("0");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [s, c] = await Promise.all([fetchSettings(), fetchCameras()]);
    setSettings(s);
    setCameras(c.cameras);
  }

  useEffect(() => { load(); }, []);

  function selectCameraType(type) {
    setCameraType(type);
    setMessage(null);
    if (type === "pc") setSource("0");
    else if (type === "mobile") setSource("http://PHONE-IP:8080/video");
    else if (type === "rtsp") setSource("rtsp://username:password@camera-ip:554/live");
    else if (type === "video") setSource("video.mp4");
    else setSource("");
  }

  async function handleTest() {
    setSaving(true);
    setMessage({ type: "info", text: "Testing camera source…" });
    try {
      const result = await testCameraSource(source);
      setMessage({ type: result.ok ? "success" : "error", text: result.message });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Camera test failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "info", text: "Adding camera…" });
    try {
      await addCamera({ source, camera_id: cameraId || null });
      setCameraId("");
      setMessage({ type: "success", text: "Camera added. Go to Dashboard, select it, then click Open Camera." });
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Unable to add camera" });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id) {
    setSaving(true);
    setMessage(null);
    try {
      await removeCamera(id);
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Unable to remove camera" });
    } finally {
      setSaving(false);
    }
  }

  const msgStyles = {
    success: { cls: "bg-emerald-50 border-emerald-200 text-emerald-700", Icon: CheckCircle2 },
    error:   { cls: "bg-red-50 border-red-200 text-red-700", Icon: XCircle },
    info:    { cls: "bg-violet-50 border-violet-200 text-violet-700", Icon: Loader2 },
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">Configuration</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">Manage cameras, notifications, and detection thresholds.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Camera Setup — spans 2 cols on xl */}
        <section className="card xl:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
              <Camera size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Camera Setup</h2>
              <p className="text-xs text-slate-500">Add or remove cameras from any source.</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[160px_1fr_140px]">
            <select
              className="input"
              value={cameraType}
              onChange={(e) => selectCameraType(e.target.value)}
            >
              {cameraTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              className="input font-mono"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="0, rtsp://…, http://…"
            />
            <input
              className="input"
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              placeholder="Custom ID (opt)"
            />
            <div className="flex gap-2 sm:col-span-3">
              <button type="button" disabled={saving || !source} onClick={handleTest} className="btn btn-ghost">
                <MonitorCheck size={14} /> Test Source
              </button>
              <button disabled={saving || !source} className="btn btn-brand">
                <Plus size={15} /> Add Camera
              </button>
            </div>
          </form>

          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {sourceHelp[cameraType]}
          </p>

          {message && (() => {
            const { cls, Icon } = msgStyles[message.type] || msgStyles.info;
            return (
              <div className={`mt-3 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm animate-fade-in ${cls}`}>
                <Icon size={16} className="mt-0.5 shrink-0" />
                {message.text}
              </div>
            );
          })()}

          {/* Camera list */}
          {cameras.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {cameras.map((cam) => (
                <div key={cam.camera_id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Camera size={14} className="shrink-0 text-violet-500" />
                      <p className="font-semibold text-slate-800">{cam.camera_id}</p>
                    </div>
                    <p className="mt-1 break-all font-mono text-xs text-slate-500">{cam.source}</p>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                      cam.status === "streaming"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      {cam.status}
                    </span>
                    {cam.last_error && (
                      <p className="mt-1.5 flex items-start gap-1 text-xs text-red-600">
                        <AlertCircle size={11} className="mt-0.5 shrink-0" /> {cam.last_error}
                      </p>
                    )}
                  </div>
                  <button
                    disabled={saving}
                    onClick={() => handleRemove(cam.camera_id)}
                    className="shrink-0 rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Telegram */}
          <section className="card">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100">
                <Send size={16} className="text-sky-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Telegram Bot</h2>
                <p className="text-xs text-slate-500">Set token in backend/.env</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Enabled", value: settings?.telegram_enabled },
                { label: "Configured", value: settings?.telegram_configured },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className={`flex items-center gap-1.5 font-semibold ${value ? "text-emerald-600" : "text-slate-400"}`}>
                    {value ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {value ? "Yes" : "No"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Detection thresholds */}
          <section className="card">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                <Sliders size={16} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Detection Thresholds</h2>
                <p className="text-xs text-slate-500">Reserved for Version 2 CV scoring</p>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(settings?.confidence_thresholds || {}).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold capitalize text-slate-500">{label}</p>
                    <p className="font-bold text-slate-800">{value}</p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                      style={{ width: `${value * 100}%` }}
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
