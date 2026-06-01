import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Camera,
  LayoutDashboard,
  List,
  Settings,
  Menu,
  X,
  Activity,
  Wifi,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/events", label: "Events", icon: List },
  { to: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ onClose }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
            <Camera size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-white">MyCamAgent</h1>
            <p className="text-xs text-violet-300">Perfume Shop</p>
          </div>
        </div>
        {/* Live badge */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
          <div className="live-dot" />
          <span className="text-xs font-semibold text-emerald-400">System Live</span>
          <Activity size={12} className="ml-auto text-slate-400" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30"
                  : "text-slate-400 hover:bg-white/8 hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="border-t border-white/8 p-4">
        <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-500">
          <div className="mb-2 flex items-center gap-2">
            <Wifi size={12} className="text-violet-400" />
            <span className="font-semibold text-slate-400">Connection</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>Backend API</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> OK
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span className="font-semibold text-slate-300">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto lg:block"
        style={{ background: "linear-gradient(180deg,#0f172a 0%,#1a1040 60%,#0f172a 100%)" }}>
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(180deg,#0f172a 0%,#1a1040 60%,#0f172a 100%)" }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur-md lg:hidden">
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
          <div className="ml-auto flex items-center gap-2">
            <div className="live-dot" />
            <span className="text-xs font-semibold text-emerald-600">Live</span>
          </div>
        </header>

        <div className="p-5 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
