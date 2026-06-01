import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Camera, LayoutDashboard, List, Settings,
  Menu, X, Activity, Shield,
} from "lucide-react";
import { api } from "../api";
import TopBar from "./TopBar";

const navItems = [
  { to: "/",         label: "Dashboard", icon: LayoutDashboard },
  { to: "/events",   label: "Events",    icon: List },
  { to: "/settings", label: "Settings",  icon: Settings },
];

function SidebarContent({ onClose, apiOk }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-900/40">
            <Camera size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold leading-tight text-white">MyCamAgent</p>
            <p className="text-xs text-violet-300/80">Retail Intelligence</p>
          </div>
        </div>

        {/* Live status pill */}
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
          <div className="live-dot shrink-0" />
          <span className="text-xs font-semibold text-emerald-400">System Online</span>
          <Activity size={11} className="ml-auto text-slate-600" />
        </div>
      </div>

      <div className="mx-5 border-t border-white/8" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40"
                  : "text-slate-400 hover:bg-white/7 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active accent bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white/60" />
                )}
                <Icon size={16} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer — live health */}
      <div className="mx-5 border-t border-white/8 pb-5 pt-4">
        <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/8">
          <div className="mb-2.5 flex items-center gap-2">
            <Shield size={12} className="text-violet-400" />
            <span className="text-xs font-semibold text-slate-300">System Status</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Backend API</span>
              <span className={`flex items-center gap-1.5 font-bold ${apiOk ? "text-emerald-400" : "text-red-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${apiOk ? "bg-emerald-400" : "bg-red-400"}`} />
                {apiOk ? "Healthy" : "Down"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Version</span>
              <span className="font-semibold text-slate-400">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiOk, setApiOk] = useState(true);

  // ── Live API health ping every 30 s ──────────
  useEffect(() => {
    async function ping() {
      try {
        await api.get("/health");
        setApiOk(true);
      } catch {
        setApiOk(false);
      }
    }
    ping();
    const t = setInterval(ping, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Desktop sidebar ─────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-60 overflow-y-auto md:block"
        style={{ background: "linear-gradient(180deg,#0c1120 0%,#160f35 50%,#0c1120 100%)" }}
      >
        <SidebarContent onClose={() => {}} apiOk={apiOk} />
      </aside>

      {/* ── Mobile backdrop ──────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(180deg,#0c1120 0%,#160f35 50%,#0c1120 100%)" }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
        <SidebarContent onClose={() => setMobileOpen(false)} apiOk={apiOk} />
      </aside>

      {/* ── Main content ────────────────────────── */}
      <main className="md:pl-60">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Camera size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">MyCamAgent</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="live-dot" />
            <span className="text-xs font-semibold text-emerald-600">Live</span>
          </div>
        </header>

        {/* Desktop TopBar — sticky date/time/bell */}
        <div className="hidden md:block">
          <TopBar />
        </div>

        {/* Page body */}
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
