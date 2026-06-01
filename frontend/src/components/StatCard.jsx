import { TrendingUp } from "lucide-react";

const toneClasses = {
  total:     "stat-total",
  green:     "stat-cash",
  blue:      "stat-card",
  amber:     "stat-uncertain",
};

const toneOpacity = {
  total:     "bg-white/20",
  green:     "bg-white/20",
  blue:      "bg-white/20",
  amber:     "bg-white/20",
};

export default function StatCard({ label, value, tone = "total", icon: Icon, sublabel }) {
  const bg = toneClasses[tone] || toneClasses.total;
  const iconBg = toneOpacity[tone] || toneOpacity.total;

  return (
    <div className={`${bg} relative overflow-hidden rounded-2xl p-5 shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl`}>
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{label}</p>
          <p className="mt-2 text-4xl font-bold text-white">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-white/60">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={`${iconBg} rounded-xl p-2.5`}>
            <Icon size={20} className="text-white" />
          </div>
        )}
      </div>
      <div className="relative mt-4 flex items-center gap-1.5 text-white/60">
        <TrendingUp size={12} />
        <span className="text-xs font-medium">Today</span>
      </div>
    </div>
  );
}
