import { TrendingUp, TrendingDown } from "lucide-react";

const tones = {
  total: { top: "#7c3aed", dimBg: "rgba(124,58,237,0.06)", icon: "rgba(124,58,237,0.15)", iconText: "#7c3aed" },
  green: { top: "#10b981", dimBg: "rgba(16,185,129,0.05)",  icon: "rgba(16,185,129,0.15)",  iconText: "#059669" },
  blue:  { top: "#3b82f6", dimBg: "rgba(59,130,246,0.05)",  icon: "rgba(59,130,246,0.15)",  iconText: "#2563eb" },
  amber: { top: "#f59e0b", dimBg: "rgba(245,158,11,0.05)",  icon: "rgba(245,158,11,0.15)",  iconText: "#d97706" },
};

// Sparkline uses CSS variable so it works in both dark and light themes
function Sparkline({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const W = 56, H = 22;
  const bw = (W / data.length) - 1.5;
  return (
    <svg width={W} height={H} className="overflow-visible shrink-0">
      {data.map((v, i) => {
        const bh = Math.max(2, (v / max) * H);
        return (
          <rect
            key={i}
            x={i * (bw + 1.5)} y={H - bh}
            width={bw} height={bh} rx="1.5"
            fill="var(--sparkline)"
          />
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
      className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderTop: `3px solid ${t.top}`,
        boxShadow: "var(--card-shadow)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 0 1px var(--border2), 0 8px 32px ${t.dimBg.replace("0.06", "0.2")}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "var(--card-shadow)";
      }}
    >
      {/* Coloured tint strip under the top border */}
      <div style={{ background: `linear-gradient(to bottom, ${t.dimBg}, transparent)`, height: "48px", position: "absolute", inset: "0 0 auto 0", pointerEvents: "none" }} />

      <div className="relative flex flex-col gap-2.5 p-4">
        {/* Label + icon */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: "var(--t3)" }}>
            {label}
          </p>
          {Icon && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: t.icon }}>
              <Icon size={13} style={{ color: t.iconText }} />
            </div>
          )}
        </div>

        {/* Value */}
        <div>
          <p className="tabular text-3xl font-black leading-none" style={{ color: "var(--t1)" }}>
            {value}
          </p>
          {sublabel && (
            <p className="mt-1 text-[11px]" style={{ color: "var(--t4)" }}>{sublabel}</p>
          )}
        </div>

        {/* Sparkline + trend */}
        <div className="flex items-end justify-between gap-2 pt-1">
          <Sparkline data={trend} />
          {pct !== null && (
            <span
              className="flex shrink-0 items-center gap-0.5 text-[11px] font-bold"
              style={{ color: isUp ? "#10b981" : "#ef4444" }}
            >
              {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {isUp ? "+" : ""}{pct}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
