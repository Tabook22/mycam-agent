import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Camera, LayoutDashboard, ListFilter, Settings2,
  Menu, X, Activity, ShieldCheck, Bell, Clock, Store,
} from "lucide-react";
import { api } from "../api";

const NAV = [
  { to: "/",         label: "Dashboard", icon: LayoutDashboard },
  { to: "/events",   label: "Events",    icon: ListFilter },
  { to: "/settings", label: "Settings",  icon: Settings2 },
];

// ── Sticky top bar inside main ───────────────────────────────
function TopBar() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div
      className="sticky top-0 z-20 flex h-12 items-center justify-between gap-4 px-6"
      style={{
        background: "rgba(9,9,14,0.82)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left — date + clock */}
      <div className="flex items-center gap-3">
        <Clock size={13} style={{ color: "var(--t3)" }} className="hidden sm:block" />
        <span className="hidden text-xs sm:block" style={{ color: "var(--t3)" }}>{date}</span>
        <div
          className="rounded-md px-2.5 py-1 tabular mono text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.06)", color: "var(--t1)" }}
        >
          {time}
        </div>
      </div>

      {/* Right — bell + store */}
      <div className="flex items-center gap-2">
        <button
          className="relative rounded-lg p-2 transition-colors"
          style={{ color: "var(--t3)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Bell size={15} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
        </button>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#c4b5fd" }}
        >
          <Store size={12} />
          Perfume Shop
        </div>
      </div>
    </div>
  );
}

// ── Sidebar content ──────────────────────────────────────────
function Sidebar({ onClose, apiOk }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
          >
            <Camera size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--t1)" }}>MyCamAgent</p>
            <p className="text-[10px]" style={{ color: "var(--t4)" }}>Retail Intelligence</p>
          </div>
        </div>

        {/* Status */}
        <div
          className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}
        >
          <div className="live-dot" />
          <span className="text-xs font-medium text-emerald-400">System Online</span>
        </div>
      </div>

      <div className="divider mx-5" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--t4)" }}>
          Workspace
        </p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
              color: isActive ? "#c4b5fd" : "var(--t3)",
              border: isActive ? "1px solid rgba(124,58,237,0.22)" : "1px solid transparent",
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains("active-nav")) {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "var(--t1)";
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.getAttribute("aria-current")) {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "";
              }
            }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                    style={{ width: "3px", height: "18px", background: "#7c3aed" }}
                  />
                )}
                <Icon size={15} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer — live health */}
      <div className="mx-4 mb-5">
        <div
          className="rounded-xl p-3 text-xs space-y-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck size={11} style={{ color: "var(--t4)" }} />
            <span className="font-semibold uppercase tracking-wider" style={{ color: "var(--t4)", fontSize: "10px" }}>
              System Status
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--t4)" }}>Backend API</span>
            <span className={`flex items-center gap-1 font-semibold ${apiOk ? "text-emerald-400" : "text-red-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${apiOk ? "bg-emerald-400" : "bg-red-400"}`} />
              {apiOk ? "Healthy" : "Down"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--t4)" }}>Version</span>
            <span style={{ color: "var(--t3)" }} className="font-medium">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Layout ───────────────────────────────────────────────────
export default function Layout() {
  const [open,  setOpen]  = useState(false);
  const [apiOk, setApiOk] = useState(true);

  useEffect(() => {
    async function ping() {
      try { await api.get("/health"); setApiOk(true); }
      catch { setApiOk(false); }
    }
    ping();
    const t = setInterval(ping, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Desktop sidebar ─────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-52 shrink-0 overflow-y-auto md:flex md:flex-col"
        style={{ background: "var(--nav)", borderRight: "1px solid var(--border)" }}
      >
        <Sidebar onClose={() => {}} apiOk={apiOk} />
      </aside>

      {/* ── Mobile backdrop ─────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto transition-transform duration-300 ease-out md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--nav)", borderRight: "1px solid var(--border)" }}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-2 transition-colors"
          style={{ color: "var(--t3)" }}
        >
          <X size={18} />
        </button>
        <Sidebar onClose={() => setOpen(false)} apiOk={apiOk} />
      </aside>

      {/* ── Main content ────────────────────── */}
      <div className="flex min-h-screen w-full flex-col md:pl-52">
        {/* Mobile topbar */}
        <header
          className="sticky top-0 z-30 flex h-12 items-center gap-3 px-4 md:hidden"
          style={{ background: "rgba(9,9,14,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}
        >
          <button onClick={() => setOpen(true)} className="rounded-lg p-2" style={{ color: "var(--t3)" }}>
            <Menu size={19} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
            >
              <Camera size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--t1)" }}>MyCamAgent</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="live-dot" />
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden md:block">
          <TopBar />
        </div>

        {/* Page body */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
