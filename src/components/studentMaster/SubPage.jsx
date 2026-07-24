import { useEffect, useState } from 'react';
import { Download, Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';

export default function SubPage({ title, subtitle, columns = [], demoData = [], addLabel = 'Add', _backPath = '/settings/institute/student-master' }) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState(demoData);

  useEffect(() => setRows(demoData), [demoData]);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return Object.values(r).some((v) => String(v || '').toLowerCase().includes(term));
  });

  const openAdd = () => setIsAddOpen(true);
  const openEdit = (row) => { setSelected(row); setIsEditOpen(true); };
  const openView = (row) => { setSelected(row); setIsViewOpen(true); };
  const openDelete = (row) => { setSelected(row); setIsDeleteOpen(true); };

  const saveAdd = (item) => { setRows((r) => [item, ...r]); setIsAddOpen(false); };
  const saveEdit = (item) => { setRows((r) => r.map((row) => row.id === item.id ? item : row)); setIsEditOpen(false); };
  const confirmDelete = () => { setRows((r) => r.filter((row) => row.id !== selected.id)); setIsDeleteOpen(false); };

  return (
    <div className="mx-[10px] space-y-6">
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mt-4">
          <Breadcrumb items={[{ to: '/settings', label: 'Settings' }, { to: '/settings/institute', label: 'Institute Setup' }, { label: 'Student Master Setup' }, { label: title }]} />
        </div>
        <div className="mt-5 rounded-[24px] border border-emerald-200 bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_60%,#f7fff9_100%)] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">Student master</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[34px]">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">{subtitle}</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">Manage {title.toLowerCase()} configuration and mappings.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 hover-gradient-border">
              <Plus className="h-4 w-4" /> {addLabel}
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <Download className="h-4 w-4" /> Export
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 hover-gradient-border">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="w-full border-none bg-transparent outline-none" />
            </label>
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">System</p>
            <p className="mt-2 text-sm text-slate-600">Demo data and frontend-only actions.</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-3 py-3">#</th>
                  {columns.map((col) => <th key={col.key} className="px-3 py-3">{col.label}</th>)}
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((row, idx) => (
                  <tr key={row.id} className="transition hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-500">{idx + 1}</td>
                    {columns.map((col) => <td key={col.key} className="px-3 py-3 text-slate-700">{row[col.key]}</td>)}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openView(row)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover-gradient-border" aria-label="View"><Eye className="h-4 w-4" /></button>
                        <button type="button" onClick={() => openEdit(row)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover-gradient-border" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        <button type="button" onClick={() => openDelete(row)} className="rounded-full border border-slate-200 bg-white p-2 text-rose-600 transition hover-gradient-border" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{addLabel}</h3>
                <p className="mt-1 text-sm text-slate-600">Create a new record (demo only).</p>
              </div>
              <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-50">Close</button>
            </div>
            <div className="mt-5 grid gap-4">
              {columns.slice(0, 3).map((col) => (
                <label key={col.key} className="text-sm font-semibold text-slate-700">
                  <span className="mb-2 block">{col.label}</span>
                  <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
                </label>
              ))}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                <button type="button" onClick={() => saveAdd({ id: `demo-${Date.now()}`, ...Object.fromEntries(columns.map((c) => [c.key, `${c.label} ${Math.floor(Math.random() * 99)}`])) })} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Edit</h3>
                <p className="mt-1 text-sm text-slate-600">Edit the selected record (demo only).</p>
              </div>
              <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-50">Close</button>
            </div>
            <div className="mt-5 grid gap-4">
              {columns.slice(0, 3).map((col) => (
                <label key={col.key} className="text-sm font-semibold text-slate-700">
                  <span className="mb-2 block">{col.label}</span>
                  <input defaultValue={selected[col.key]} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
                </label>
              ))}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                <button type="button" onClick={() => { saveEdit({ ...selected }); }} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Details</h3>
                <p className="mt-1 text-sm text-slate-600">Record details (demo only).</p>
              </div>
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-50">Close</button>
            </div>
            <div className="mt-5 grid gap-3">
              {columns.map((col) => (
                <div key={col.key} className="text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">{col.label}</p>
                  <p className="mt-1">{selected[col.key]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete</h3>
            <p className="mt-2 text-sm text-slate-600">This will remove the selected record. Continue?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setIsDeleteOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={confirmDelete} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
