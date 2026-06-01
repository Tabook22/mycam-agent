import { useEffect, useState } from "react";
import { Search, Download, Filter, Calendar } from "lucide-react";
import { fetchEvents } from "../api";
import EventBadge from "../components/EventBadge";

const T = { // convenience style objects
  t1: { color: "var(--t1)" },
  t2: { color: "var(--t2)" },
  t3: { color: "var(--t3)" },
  t4: { color: "var(--t4)" },
};

export default function Events() {
  const [events,  setEvents]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", payment_type: "" });

  async function load() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v));
      const data   = await fetchEvents({ ...params, limit: 100 });
      setEvents(data.items);
      setTotal(data.total);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filters.payment_type]);

  const typeColor = {
    cash:      { bg:"var(--g-dim)",  border:"rgba(16,185,129,0.2)",  color:"var(--green)" },
    card:      { bg:"var(--b-dim)",  border:"rgba(59,130,246,0.2)",  color:"var(--blue)"  },
    uncertain: { bg:"var(--am-dim)", border:"rgba(245,158,11,0.2)",  color:"var(--amber)" },
  };
  const confColor = {
    high:   { bg:"var(--g-dim)",  border:"rgba(16,185,129,0.2)",  color:"var(--green)" },
    medium: { bg:"var(--b-dim)",  border:"rgba(59,130,246,0.2)",  color:"var(--blue)"  },
    low:    { bg:"var(--am-dim)", border:"rgba(245,158,11,0.2)",  color:"var(--amber)" },
  };

  const labelStyle = { fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"var(--accent)" };

  return (
    <div className="page space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p style={labelStyle}>History</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl" style={T.t1}>Payment Events</h1>
          <p className="mt-1 text-sm" style={T.t3}>Search, filter, and export all recorded transactions.</p>
        </div>
        <a
          href="http://localhost:8000/api/events/export"
          className="btn btn-secondary self-start gap-1.5 sm:self-auto"
        >
          <Download size={14}/> Export CSV
        </a>
      </div>

      {/* Filters */}
      <form
        onSubmit={e => { e.preventDefault(); load(); }}
        className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
        style={{ background:"var(--surface)", border:"1px solid var(--border)" }}
      >
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={T.t4} />
          <input
            className="input pl-9"
            placeholder="Search notes or signals…"
            value={filters.search}
            onChange={e => setFilters(f => ({...f, search: e.target.value}))}
          />
        </div>
        <div className="relative sm:w-52">
          <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={T.t4} />
          <select
            className="input pl-9"
            value={filters.payment_type}
            onChange={e => setFilters(f => ({...f, payment_type: e.target.value}))}
          >
            <option value="">All types</option>
            <option value="cash">Cash</option>
            <option value="card">Card / POS</option>
            <option value="uncertain">Uncertain</option>
          </select>
        </div>
        <button className="btn btn-primary shrink-0 gap-1.5">
          <Search size={13}/> Search
        </button>
      </form>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
          <p className="font-semibold" style={T.t1}>All Records</p>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background:"var(--s2)", color:"var(--t3)" }}
          >
            <Calendar size={11}/>
            {total} total
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr style={{ background:"var(--s2)" }}>
                {["Timestamp","Type","Confidence","Camera","Notes"].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={T.t4}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_,i) => (
                    <tr key={i} style={{ borderTop:"1px solid var(--border)" }}>
                      {Array(5).fill(0).map((_,j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="skeleton h-3 w-24 rounded-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : events.map(ev => {
                    const tc = typeColor[ev.payment_type] || typeColor.uncertain;
                    const cc = confColor[ev.confidence]   || confColor.low;
                    return (
                      <tr
                        key={ev.event_id}
                        className="transition-colors"
                        style={{ borderTop:"1px solid var(--border)" }}
                        onMouseEnter={e => e.currentTarget.style.background="var(--s2)"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}
                      >
                        <td className="px-5 py-3.5 text-xs mono" style={T.t2}>
                          {new Date(ev.timestamp).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5"><EventBadge type={ev.payment_type}/></td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                            style={{ background:cc.bg, border:`1px solid ${cc.border}`, color:cc.color }}
                          >
                            {ev.confidence}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 mono text-xs" style={T.t3}>{ev.camera_id}</td>
                        <td className="px-5 py-3.5 text-xs max-w-[240px] truncate" style={T.t2}>{ev.notes}</td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>

          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16">
              <Search size={32} style={{ color:"var(--t4)" }} className="opacity-30" />
              <p className="text-sm" style={T.t4}>No matching events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
