import { useEffect, useState } from "react";

import { fetchEvents } from "../api";
import EventBadge from "../components/EventBadge";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: "", payment_type: "" });

  async function loadEvents() {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const data = await fetchEvents({ ...params, limit: 100 });
    setEvents(data.items);
    setTotal(data.total);
  }

  useEffect(() => {
    loadEvents();
  }, [filters.payment_type]);

  function submit(event) {
    event.preventDefault();
    loadEvents();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-1 text-slate-500">Search, filter, and export payment records.</p>
        </div>
        <a href="http://localhost:8000/api/events/export" className="btn bg-ink text-white">
          Export CSV
        </a>
      </div>

      <form onSubmit={submit} className="card grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <input
          className="input"
          placeholder="Search notes or observed signals"
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
        />
        <select
          className="input"
          value={filters.payment_type}
          onChange={(event) => setFilters((current) => ({ ...current, payment_type: event.target.value }))}
        >
          <option value="">All payment types</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="uncertain">Uncertain</option>
        </select>
        <button className="btn bg-brand text-white">Search</button>
      </form>

      <div className="card overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Payment Events</h2>
          <span className="text-sm text-slate-500">{total} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Payment Type</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Camera</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.event_id}>
                  <td className="px-4 py-3">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3"><EventBadge type={event.payment_type} /></td>
                  <td className="px-4 py-3 capitalize">{event.confidence}</td>
                  <td className="px-4 py-3">{event.camera_id}</td>
                  <td className="px-4 py-3">{event.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <p className="p-6 text-sm text-slate-500">No matching events found.</p>}
        </div>
      </div>
    </div>
  );
}
