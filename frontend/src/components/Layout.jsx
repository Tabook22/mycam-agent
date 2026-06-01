import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Camera, LayoutDashboard, ListFilter, Settings2,
  Menu, X, ShieldCheck, Bell, Clock, Store, Sun, Moon,
} from "lucide-react";
import { api } from "../api";

const NAV = [
  { to: "/",         label: "Dashboard", icon: LayoutDashboard },
  { to: "/events",   label: "Events",    icon: ListFilter },
  { to: "/settings", label: "Settings",  icon: Settings2 },
];

// ── Top bar (date / clock / theme toggle / bell) ─────────────
function TopBar({ theme, toggleTheme }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const isLight = theme === "light";

  return (
    <div
      className="sticky top-0 z-20 flex h-12 items-center justify-between gap-4 px-6"
      style={{
        background: "var(--topbar-bg)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left — date + clock */}
      <div className="flex items-center gap-3">
        <Clock size={13} style={{ color: "var(--t3)" }} className="hidden sm:block" />
        <span className="hidden text-xs sm:block" style={{ color: "var(--t3)" }}>{date}</span>
        <div
          className="rounded-md px-2.5 py-1 tabular mono text-xs font-semibold"
          style={{ background: "var(--s2)", color: "var(--t1)", border: "1px solid var(--border)" }}
        >
          {time}
        </div>
      </div>

      {/* Right — theme toggle + bell + store */}
      <div className="flex items-center gap-2">

        {/* ── Dark / Light toggle — high contrast ── */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isLight ? "dark" : "light"} mode`}
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200"
          style={isLight ? {
            /* In light mode → button looks dark so user knows they'll go dark */
            background: "#1e1b2e",
            color: "#e0d9ff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          } : {
            /* In dark mode → button looks light so user knows they'll go light */
            background: "#f0f4f8",
            color: "#1e1b2e",
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
          }}
        >
          {isLight
            ? <Moon size={13} style={{ color: "#a78bfa" }} />
            : <Sun  size={13} style={{ color: "#f59e0b" }} />
          }
          <span>{isLight ? "Dark Mode" : "Light Mode"}</span>
        </button>

        {/* Bell */}
        <button
          className="relative rounded-xl p-2 transition-colors"
          style={{ color: "var(--t3)" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--s2)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Bell size={15} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
        </button>

        {/* Store chip */}
        <div
          className="hidden items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium sm:flex"
          style={{
            background: "var(--a-dim)",
            border: "1px solid rgba(124,58,237,0.2)",
            color: isLight ? "#6d28d9" : "#c4b5fd",
          }}
        >
          <Store size={12} />
          Perfume Shop
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────
function Sidebar({ onClose, apiOk, theme, toggleTheme }) {
  const isLight = theme === "light";

  return (
    <div className="flex h-full flex-col">

      {/* ── Brand ─────────────────────────────── */}
      <div className="px-6 pb-5 pt-7">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}
          >
            <Camera size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--t1)" }}>MyCamAgent</p>
            <p className="text-[11px]" style={{ color: "var(--t4)" }}>Retail Intelligence</p>
          </div>
        </div>

        {/* Online pill */}
        <div
          className="mt-4 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          style={{ background: "rgba(16,185,129,0.09)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <div className="live-dot" />
          <span className="text-xs font-semibold" style={{ color: "var(--green)" }}>System Online</span>
        </div>
      </div>

      <div className="divider mx-6" />

      {/* ── Navigation ────────────────────────── */}
      <nav className="flex-1 px-4 py-5">
        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t4)" }}>
          Navigation
        </p>
        <div className="space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to} end={to === "/"} onClick={onClose}
              className="group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150"
              style={({ isActive }) => ({
                background: isActive ? "var(--a-dim)" : "transparent",
                color: isActive ? (isLight ? "#6d28d9" : "#c4b5fd") : "var(--t2)",
                border: isActive ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                      style={{ width: "3px", height: "20px", background: "var(--accent)" }}
                    />
                  )}
                  <Icon size={16} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="divider mx-6" />

      {/* ── Footer ────────────────────────────── */}
      <div className="px-4 py-5 space-y-3">

        {/* Theme toggle — card style */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ border: "1px solid var(--border)", background: "var(--s2)" }}
        >
          <p className="px-4 pt-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t4)" }}>
            Appearance
          </p>
          <button
            onClick={toggleTheme}
            className="mt-2 mb-3 mx-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200"
            style={isLight ? {
              background: "#1e1b2e",
              color: "#e0d9ff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
            } : {
              background: "#f0f4f8",
              color: "#1e1b2e",
              boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
            }}
          >
            {isLight
              ? <><Moon size={14} style={{ color: "#a78bfa" }} /> Switch to Dark Mode</>
              : <><Sun  size={14} style={{ color: "#f59e0b" }} /> Switch to Light Mode</>
            }
          </button>
        </div>

        {/* System status — card style */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ border: "1px solid var(--border)", background: "var(--s2)" }}
        >
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
            <ShieldCheck size={12} style={{ color: "var(--t4)" }} />
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t4)" }}>
              System Status
            </p>
          </div>
          <div className="px-4 pb-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--t3)" }}>Backend API</span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${apiOk ? "text-emerald-500" : "text-red-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${apiOk ? "bg-emerald-500" : "bg-red-400"}`} />
                {apiOk ? "Healthy" : "Down"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--t3)" }}>Version</span>
              <span className="text-xs font-semibold" style={{ color: "var(--t2)" }}>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root Layout ──────────────────────────────────────────────
export default function Layout() {
  const [open,  setOpen]  = useState(false);
  const [apiOk, setApiOk] = useState(true);

  // ── Theme persisted to localStorage ──────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem("mcaTheme") || "dark");

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("mcaTheme", next);
      return next;
    });
  }

  // ── API health ping ───────────────────────────────────────
  useEffect(() => {
    async function ping() {
      try { await api.get("/health"); setApiOk(true); }
      catch { setApiOk(false); }
    }
    ping();
    const t = setInterval(ping, 30_000);
    return () => clearInterval(t);
  }, []);

  const themeClass = theme === "light" ? "theme-light" : "theme-dark";

  return (
    <div className={`${themeClass} flex min-h-screen`} style={{ background: "var(--bg)" }}>

      {/* ── Desktop sidebar ─────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-52 shrink-0 overflow-y-auto md:flex md:flex-col"
        style={{ background: "var(--nav)", borderRight: "1px solid var(--border)" }}
      >
        <Sidebar onClose={() => {}} apiOk={apiOk} theme={theme} toggleTheme={toggleTheme} />
      </aside>

      {/* ── Mobile backdrop ─────────────────── */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)} />
      )}

      {/* ── Mobile drawer ───────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto transition-transform duration-300 ease-out md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--nav)", borderRight: "1px solid var(--border)" }}
      >
        <button onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-2" style={{ color: "var(--t3)" }}>
          <X size={18} />
        </button>
        <Sidebar onClose={() => setOpen(false)} apiOk={apiOk} theme={theme} toggleTheme={toggleTheme} />
      </aside>

      {/* ── Main ────────────────────────────── */}
      <div className="flex min-h-screen w-full flex-col md:pl-52">

        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 px-4 md:hidden"
          style={{ background: "var(--topbar-bg)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setOpen(true)} className="rounded-xl p-2" style={{ color: "var(--t3)" }}>
            <Menu size={19} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              <Camera size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--t1)" }}>MyCamAgent</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
              style={theme === "light"
                ? { background: "#1e1b2e", color: "#e0d9ff" }
                : { background: "#f0f4f8", color: "#1e1b2e" }}
            >
              {theme === "light" ? <Moon size={12} style={{ color: "#a78bfa" }} /> : <Sun size={12} style={{ color: "#f59e0b" }} />}
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <div className="live-dot" />
            <span className="text-xs font-medium" style={{ color: "var(--green)" }}>Live</span>
          </div>
        </header>

        {/* Desktop TopBar */}
        <div className="hidden md:block">
          <TopBar theme={theme} toggleTheme={toggleTheme} />
        </div>

        {/* ── Page content — 5% all sides ── */}
        <main className="flex-1 p-[5%]">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
