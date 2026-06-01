import { TrendingUp, TrendingDown } from "lucide-react";

const tones = {
  total: { top: "#7c3aed", glow: "rgba(124,58,237,0.18)", icon: "rgba(124,58,237,0.2)", iconText: "#a78bfa" },
  green: { top: "#10b981", glow: "rgba(16,185,129,0.16)",  icon: "rgba(16,185,129,0.18)",  iconText: "#34d399" },
  blue:  { top: "#3b82f6", glow: "rgba(59,130,246,0.16)",  icon: "rgba(59,130,246,0.18)",  iconText: "#60a5fa" },
  amber: { top: "#f59e0b", glow: "rgba(245,158,11,0.16)",  icon: "rgba(245,158,11,0.18)",  iconText: "#fbbf24" },
};

function Sparkline({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const W = 60, H = 24;
  const bw = (W / data.length) - 1.5;
  return (
    <svg width={W} height={H} className="overflow-visible">
      {data.map((v, i) => {
        const bh = Math.max(2, (v / max) * H);
        return (
          <rect key={i} x={i * (bw + 1.5)} y={H - bh} width={bw} height={bh}
            rx="1.5" fill="rgba(255,255,255,0.22)" />
        );
      })}
    </svg>
  );
}

export default function StatCard({ label, value, tone = "total", icon: Icon, sublabel, trend }) {
  const t = tones[tone] || tones.total;

  let pct = null, isUp = true;
  if (trend?.length >= 2) {
    const prev = trend[trend.length - 2];
    if (prev > 0) { pct = Math.round(((value - prev) / prev) * 100); isUp = pct >= 0; }
  }

  return (
    <div
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderTop: `2.5px solid ${t.top}`,
        boxShadow: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = t.glow + " 0 0 32px"; e.currentTarget.style.borderColor = "var(--border2)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      {/* Top row — label + icon */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--t3)" }}>
          {label}
        </p>
        {Icon && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: t.icon }}
          >
            <Icon size={15} style={{ color: t.iconText }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="tabular text-[2.25rem] font-black leading-none" style={{ color: "var(--t1)" }}>
          {value}
        </p>
        {sublabel && (
          <p className="mt-1 text-xs" style={{ color: "var(--t4)" }}>{sublabel}</p>
        )}
      </div>

      {/* Bottom — sparkline + trend */}
      <div className="flex items-end justify-between gap-2">
        <Sparkline data={trend} />
        {pct !== null && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-bold"
            style={{ color: isUp ? "#34d399" : "#f87171" }}
          >
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isUp ? "+" : ""}{pct}%
          </span>
        )}
      </div>
    </div>
  );
}
