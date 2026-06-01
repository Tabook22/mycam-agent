import { useEffect, useState } from "react";
import { Bell, Store, Clock } from "lucide-react";

export default function TopBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/88 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left — date + clock */}
      <div className="flex items-center gap-3">
        <Clock size={15} className="hidden shrink-0 text-violet-500 sm:block" />
        <span className="hidden text-sm font-medium text-slate-600 sm:block">{dateStr}</span>
        <div className="rounded-lg bg-slate-100 px-3 py-1.5">
          <span className="tabular font-mono text-sm font-semibold text-slate-700">{timeStr}</span>
        </div>
      </div>

      {/* Right — bell + store chip */}
      <div className="flex items-center gap-2">
        <button className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200">
          <Bell size={17} />
          {/* notification badge */}
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
            2
          </span>
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 px-3 py-2 ring-1 ring-violet-200/60">
          <Store size={14} className="text-violet-600" />
          <span className="text-sm font-semibold text-violet-800">Perfume Shop</span>
        </div>
      </div>
    </div>
  );
}
