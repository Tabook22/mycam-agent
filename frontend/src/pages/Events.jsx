import { useEffect, useState } from "react";
import { Search, Download, Filter, Calendar, List } from "lucide-react";
import { fetchEvents } from "../api";
import EventBadge from "../components/EventBadge";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: "", payment_type: "" });

  async function loadEvents() {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const data = await fetchEvents({ ...params, limit: 100 });
    setEvents(data.items);
    setTotal(data.total);
  }

  useEffect(() => { loadEvents(); }, [filters.payment_type]);

  function submit(e) {
    e.preventDefault();
    loadEvents();
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">History</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Payment Events</h1>
          <p className="mt-1 text-slate-500">Search, filter, and export all recorded transactions.</p>
        </div>
        <a
          href="http://localhost:8000/api/events/export"
          className="btn btn-slate self-start sm:self-auto"
        >
          <Download size={15} /> Export CSV
        </a>
      </div>

      {/* Filter bar */}
      <form onSubmit={submit} className="card flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search notes or observed signals…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        <div className="relative sm:w-56">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="input pl-9 pr-4"
            value={filters.payment_type}
            onChange={(e) => setFilters((f) => ({ ...f, payment_type: e.target.value }))}
          >
            <option value="">All payment types</option>
            <option value="cash">Cash</option>
            <option value="card">Card / POS</option>
            <option value="uncertain">Uncertain</option>
          </select>
        </div>
        <button className="btn btn-brand shrink-0">
          <Search size={14} /> Search
        </button>
      </form>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <List size={16} className="text-violet-500" />
            <h2 className="font-bold text-slate-800">Payment Events</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
            <Calendar size={12} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">{total} total records</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["Timestamp", "Type", "Confidence", "Camera", "Notes"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.event_id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-slate-600">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <EventBadge type={event.payment_type} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      event.confidence === "high"
                        ? "bg-emerald-100 text-emerald-700"
                        : event.confidence === "medium"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {event.confidence}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{event.camera_id}</td>
                  <td className="px-5 py-3.5 text-slate-600">{event.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {events.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
              <Search size={36} className="opacity-25" />
              <p className="text-sm">No matching events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
