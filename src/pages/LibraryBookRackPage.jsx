import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  ChevronRight,
  MapPinned,
  PencilLine,
  Plus,
  Search,
  Settings2,
  Trash2,
  Wrench,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const initialRacks = [
  { id: 'R-101', zone: 'Ground Floor', location: 'Aisle A / Shelf 1', floor: 'Ground', capacity: 240, occupied: 172, available: 68, status: 'Active', utilization: 72, category: 'Reference', type: 'Open Rack' },
  { id: 'R-102', zone: 'Ground Floor', location: 'Aisle A / Shelf 2', floor: 'Ground', capacity: 200, occupied: 196, available: 4, status: 'Full', utilization: 98, category: 'Textbooks', type: 'Open Rack' },
  { id: 'R-203', zone: 'First Floor', location: 'Aisle B / Shelf 3', floor: 'First', capacity: 180, occupied: 94, available: 86, status: 'Active', utilization: 52, category: 'Research', type: 'Closed Stack' },
  { id: 'R-204', zone: 'First Floor', location: 'Aisle C / Shelf 4', floor: 'First', capacity: 160, occupied: 138, available: 22, status: 'Reserved', utilization: 86, category: 'Journals', type: 'Closed Stack' },
  { id: 'R-305', zone: 'Second Floor', location: 'Aisle D / Shelf 5', floor: 'Second', capacity: 220, occupied: 90, available: 130, status: 'Active', utilization: 41, category: 'Fiction', type: 'Open Rack' },
  { id: 'R-306', zone: 'Second Floor', location: 'Aisle D / Shelf 6', floor: 'Second', capacity: 210, occupied: 110, available: 100, status: 'Maintenance', utilization: 52, category: 'Archives', type: 'Secure Rack' },
];

const statusStyles = {
  Active: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  Full: 'border border-amber-200 bg-amber-50 text-amber-700',
  Reserved: 'border border-sky-200 bg-sky-50 text-sky-700',
  Maintenance: 'border border-rose-200 bg-rose-50 text-rose-700',
};

const filters = {
  status: ['All', 'Active', 'Full', 'Reserved', 'Maintenance'],
  floor: ['All floors', 'Ground', 'First', 'Second'],
};

export default function LibraryBookRackPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All floors');

  const filteredRacks = useMemo(() => {
    return initialRacks.filter((rack) => {
      const searchText = `${rack.id} ${rack.zone} ${rack.location} ${rack.category}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'All' || rack.status === statusFilter;
      const matchesFloor = floorFilter === 'All floors' || rack.floor === floorFilter;
      return matchesQuery && matchesStatus && matchesFloor;
    });
  }, [query, statusFilter, floorFilter]);

  const totalCapacity = initialRacks.reduce((sum, rack) => sum + rack.capacity, 0);
  const totalOccupied = initialRacks.reduce((sum, rack) => sum + rack.occupied, 0);
  const avgUtilization = Math.round((totalOccupied / totalCapacity) * 100);
  const activeRacks = initialRacks.filter((rack) => rack.status === 'Active').length;
  const maintenanceRacks = initialRacks.filter((rack) => rack.status === 'Maintenance').length;

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_52%,#f2f7ff_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-5">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Library Setup', to: '/library' }, { label: 'Library Book Rack' }]} />
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">Library setup</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Library Book Rack</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-[15px]">Organize shelf capacity, track rack allocation, and keep your book stacks searchable and ready for circulation.</p>
            </div>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#101824] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d1724]">
              <Plus className="h-4 w-4" />
              Add Rack
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Total racks</p>
              <div className="rounded-xl bg-sky-50 p-2 text-sky-700"><MapPinned className="h-4 w-4" /></div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{initialRacks.length}</p>
            <p className="mt-1 text-xs text-slate-500">Across all library floors</p>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Capacity used</p>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Boxes className="h-4 w-4" /></div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{avgUtilization}%</p>
            <p className="mt-1 text-xs text-emerald-600">{totalOccupied.toLocaleString('en-IN')} / {totalCapacity.toLocaleString('en-IN')} books</p>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Active racks</p>
              <div className="rounded-xl bg-violet-50 p-2 text-violet-700"><BookOpen className="h-4 w-4" /></div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{activeRacks}</p>
            <p className="mt-1 text-xs text-slate-500">Ready for circulation</p>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Maintenance</p>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-700"><Wrench className="h-4 w-4" /></div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{maintenanceRacks}</p>
            <p className="mt-1 text-xs text-slate-500">Requires inspection & repair</p>
          </div>
        </div>

        <section className="mb-5 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Rack overview</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Search and filter racks</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search rack, zone, category"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-300"
              >
                {filters.status.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <select
                value={floorFilter}
                onChange={(event) => setFloorFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-300"
              >
                {filters.floor.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-collapse text-left text-sm">
                <thead className="bg-[#101824] text-white">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Rack ID</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Zone</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Location</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Category</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Capacity</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Occupied</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Available</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Status</th>
                    <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRacks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-500">No rack matches your current filters.</td>
                    </tr>
                  ) : (
                    filteredRacks.map((rack) => (
                      <tr key={rack.id} className="border-b border-slate-200 bg-white text-slate-700 odd:bg-slate-50/80 hover:bg-sky-50/40">
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-semibold text-slate-900">{rack.id}</span>
                            <span className="mt-1 text-[11px] text-slate-500">{rack.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{rack.zone}</td>
                        <td className="px-4 py-3 text-center">{rack.location}</td>
                        <td className="px-4 py-3 text-center">{rack.category}</td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-900">{rack.capacity}</td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-900">{rack.occupied}</td>
                        <td className="px-4 py-3 text-center font-semibold text-emerald-700">{rack.available}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${statusStyles[rack.status] || 'bg-slate-100 text-slate-700'}`}>
                            {rack.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" className="rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100" aria-label="Edit rack">
                              <PencilLine className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100" aria-label="Delete rack">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Utilization</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Rack occupancy</h3>
              </div>
              <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                View details <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {initialRacks.map((rack) => (
                <div key={`${rack.id}-usage`}>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">{rack.id}</span>
                    <span>{rack.utilization}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${rack.status === 'Full' ? 'bg-amber-500' : rack.status === 'Maintenance' ? 'bg-rose-500' : rack.status === 'Reserved' ? 'bg-sky-500' : 'bg-emerald-500'}`}
                      style={{ width: `${rack.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-sky-600" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Quick actions</p>
              </div>
              <div className="space-y-3">
                <button type="button" className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slat-100">
                  Reallocate shelf
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button type="button" className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Audit rack health
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button type="button" className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Print rack summary
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Recent activity</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-xl bg-sky-50 p-3">
                  <p className="font-semibold text-slate-800">R-101 reassigned</p>
                  <p className="mt-1 text-xs text-slate-500">Reference books moved to Aisle A / Shelf 1</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="font-semibold text-slate-800">R-203 opened</p>
                  <p className="mt-1 text-xs text-slate-500">Research collection updated with 18 titles</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="font-semibold text-slate-800">R-306 flagged</p>
                  <p className="mt-1 text-xs text-slate-500">Inspection scheduled for secure archive shelf</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
