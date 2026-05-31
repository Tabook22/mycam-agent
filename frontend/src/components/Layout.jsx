import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/events", label: "Events" },
  { to: "/settings", label: "Settings" }
];

export default function Layout() {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-ink text-white lg:block">
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Perfume Shop</p>
          <h1 className="mt-2 text-2xl font-bold">MyCamAgent</h1>
          <p className="mt-2 text-sm text-slate-300">Payment detection command center</p>
        </div>
        <nav className="space-y-2 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-medium ${
                  isActive ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white px-6 py-4 lg:hidden">
          <h1 className="text-xl font-bold">MyCamAgent</h1>
          <nav className="mt-3 flex gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="rounded-lg bg-slate-100 px-3 py-2 text-sm">
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <div className="p-5 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
