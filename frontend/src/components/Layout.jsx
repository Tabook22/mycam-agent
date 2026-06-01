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

        {/* ── Dark / Light toggle ─────── */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isLight ? "dark" : "light"} mode`}
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
          style={{
            background: isLight ? "var(--s2)" : "rgba(255,255,255,0.07)",
            border: "1px solid var(--border)",
            color: "var(--t2)",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          {isLight
            ? <Moon size={14} style={{ color: "#818cf8" }} />
            : <Sun  size={14} style={{ color: "#fbbf24" }} />
          }
          <span className="hidden sm:inline">{isLight ? "Dark" : "Light"}</span>
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
      {/* Brand */}
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 18px rgba(124,58,237,0.4)" }}
          >
            <Camera size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--t1)" }}>MyCamAgent</p>
            <p className="text-[10px]" style={{ color: "var(--t4)" }}>Retail Intelligence</p>
          </div>
        </div>

        {/* Live pill */}
        <div
          className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(16,185,129,0.09)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <div className="live-dot" />
          <span className="text-xs font-medium" style={{ color: "var(--green)" }}>System Online</span>
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
            key={to} to={to} end={to === "/"} onClick={onClose}
            className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? "var(--a-dim)" : "transparent",
              color: isActive ? (isLight ? "#6d28d9" : "#c4b5fd") : "var(--t3)",
              border: isActive ? "1px solid rgba(124,58,237,0.22)" : "1px solid transparent",
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                    style={{ width: "3px", height: "18px", background: "var(--accent)" }} />
                )}
                <Icon size={15} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mx-4 mb-4">
        {/* Theme toggle in sidebar (mobile-friendly) */}
        <button
          onClick={toggleTheme}
          className="mb-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all"
          style={{ background: "var(--s2)", border: "1px solid var(--border)", color: "var(--t2)" }}
        >
          {isLight
            ? <><Moon size={14} style={{ color: "#818cf8" }} /> Switch to Dark Mode</>
            : <><Sun  size={14} style={{ color: "#fbbf24" }} /> Switch to Light Mode</>
          }
        </button>

        {/* System status */}
        <div className="rounded-xl p-3 text-xs space-y-2"
          style={{ background: "rgba(128,128,128,0.05)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck size={11} style={{ color: "var(--t4)" }} />
            <span className="font-semibold uppercase tracking-wider" style={{ color: "var(--t4)", fontSize: "10px" }}>
              System Status
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--t4)" }}>Backend API</span>
            <span className={`flex items-center gap-1 font-semibold ${apiOk ? "text-emerald-500" : "text-red-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${apiOk ? "bg-emerald-500" : "bg-red-400"}`} />
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
            <button onClick={toggleTheme} className="rounded-lg p-1.5" style={{ color: "var(--t3)" }}>
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <div className="live-dot" />
            <span className="text-xs font-medium" style={{ color: "var(--green)" }}>Live</span>
          </div>
        </header>

        {/* Desktop TopBar */}
        <div className="hidden md:block">
          <TopBar theme={theme} toggleTheme={toggleTheme} />
        </div>

        {/* ── Page content — 10% horizontal margins ── */}
        <main className="flex-1 px-[5%] py-8 sm:px-[7%] lg:px-[8%]">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
