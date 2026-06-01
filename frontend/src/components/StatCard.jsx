import { TrendingUp, TrendingDown } from "lucide-react";

const tones = {
  total: { bg: "from-violet-600 to-indigo-600",  ring: "ring-violet-700/30" },
  green: { bg: "from-emerald-600 to-teal-500",   ring: "ring-emerald-700/30" },
  blue:  { bg: "from-blue-600 to-cyan-500",       ring: "ring-blue-700/30"   },
  amber: { bg: "from-amber-500 to-orange-500",    ring: "ring-amber-600/30"  },
};

// Sparkline — 7 SVG bars
function Sparkline({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const W = 56, H = 22;
  const bw = W / data.length - 1.5;
  return (
    <svg width={W} height={H} className="overflow-visible">
      {data.map((v, i) => {
        const bh = Math.max(2, (v / max) * H);
        return (
          <rect
            key={i}
            x={i * (bw + 1.5)}
            y={H - bh}
            width={bw}
            height={bh}
            rx="1.5"
            fill="rgba(255,255,255,0.38)"
          />
        );
      })}
    </svg>
  );
}

export default function StatCard({ label, value, tone = "total", icon: Icon, sublabel, trend }) {
  const { bg, ring } = tones[tone] || tones.total;

  // % change: compare last two trend points
  let pct = null;
  let isUp = true;
  if (trend?.length >= 2) {
    const prev = trend[trend.length - 2];
    if (prev > 0) {
      pct = Math.round(((value - prev) / prev) * 100);
      isUp = pct >= 0;
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bg} p-4 shadow-lg ring-1 ${ring} transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 right-4 h-28 w-28 rounded-full bg-white/5" />

      {/* Top row */}
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 truncate">
            {label}
          </p>
          <p className="mt-1 text-[2rem] font-black leading-none text-white tabular">
            {value}
          </p>
          {sublabel && (
            <p className="mt-0.5 text-[11px] text-white/50">{sublabel}</p>
          )}
        </div>
        {Icon && (
          <div className="shrink-0 rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
            <Icon size={18} className="text-white" />
          </div>
        )}
      </div>

      {/* Bottom row — sparkline + trend badge */}
      <div className="relative mt-3 flex items-end justify-between gap-2">
        <Sparkline data={trend} />
        {pct !== null && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${isUp ? "text-white/75" : "text-red-300"}`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isUp ? "+" : ""}{pct}%
          </span>
        )}
      </div>
    </div>
  );
}
