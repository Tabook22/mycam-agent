export default function StatCard({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700"
  };

  return (
    <div className="card">
      <p className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</p>
      <p className="mt-4 text-3xl font-bold">{value}</p>
    </div>
  );
}
