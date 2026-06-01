import { Banknote, CreditCard, HelpCircle } from "lucide-react";

const cfg = {
  cash:      { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)",  color: "#34d399", icon: Banknote },
  card:      { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)",  color: "#60a5fa", icon: CreditCard },
  uncertain: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)",  color: "#fbbf24", icon: HelpCircle },
};

export default function EventBadge({ type }) {
  const { bg, border, color, icon: Icon } = cfg[type] || cfg.uncertain;
  return (
    <span
      className="badge"
      style={{ background: bg, borderColor: border, color }}
    >
      <Icon size={10} />
      {type || "uncertain"}
    </span>
  );
}
