import { Banknote, CreditCard, HelpCircle } from "lucide-react";

const config = {
  cash: {
    classes: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    icon: Banknote,
  },
  card: {
    classes: "bg-blue-100 text-blue-700 border border-blue-200",
    icon: CreditCard,
  },
  uncertain: {
    classes: "bg-amber-100 text-amber-700 border border-amber-200",
    icon: HelpCircle,
  },
};

export default function EventBadge({ type }) {
  const { classes, icon: Icon } = config[type] || config.uncertain;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${classes}`}>
      <Icon size={11} />
      {type || "uncertain"}
    </span>
  );
}
