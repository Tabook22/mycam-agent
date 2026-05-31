export default function EventBadge({ type }) {
  const styles = {
    cash: "bg-emerald-100 text-emerald-700",
    card: "bg-blue-100 text-blue-700",
    uncertain: "bg-amber-100 text-amber-700"
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[type] || styles.uncertain}`}>
      {type}
    </span>
  );
}
