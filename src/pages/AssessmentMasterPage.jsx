import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Copy, Plus, ChevronDown, Filter, Eye, Edit2, Trash2 } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const STORAGE_KEY = 'assessmentMasterRows';

const assessments = [
  { id: 'SCH', name: 'Scholastic Assessment', code: 'SCH', type: 'SCHOLASTIC', description: 'Scholastic assessment activities', createdOn: '15 May 2026', status: 'Active' },
  { id: 'CO-SCH', name: 'Co-Scholastic Assessment', code: 'CO-SCH', type: 'CO-SCHOLASTIC', description: 'Co-scholastic assessment activities', createdOn: '15 May 2026', status: 'Active' },
  { id: 'DIS', name: 'Discipline Assessment', code: 'DIS', type: 'DISCIPLINE', description: 'Discipline related assessment', createdOn: '16 May 2026', status: 'Active' },
  { id: 'SKL', name: 'Skill Assessment', code: 'SKL', type: 'SKILL', description: 'Skill based assessment', createdOn: '16 May 2026', status: 'Active' },
  { id: 'MAJ', name: 'Major Assessment', code: 'MAJ', type: 'MAJOR', description: 'Major subject assessment', createdOn: '17 May 2026', status: 'Active' },
  { id: 'MIN', name: 'Minor Assessment', code: 'MIN', type: 'MINOR', description: 'Minor subject assessment', createdOn: '17 May 2026', status: 'Active' },
  { id: 'MDC', name: 'MDC Assessment', code: 'MDC', type: 'MDC', description: 'Multidisciplinary course assessment', createdOn: '18 May 2026', status: 'Active' },
  { id: 'SEC', name: 'SEC Assessment', code: 'SEC', type: 'SEC', description: 'Skill enhancement course assessment', createdOn: '18 May 2026', status: 'Active' },
  { id: 'VAC', name: 'VAC Assessment', code: 'VAC', type: 'VAC', description: 'Value added course assessment', createdOn: '19 May 2026', status: 'Active' },
  { id: 'AEC', name: 'AEC Assessment', code: 'AEC', type: 'AEC', description: 'Ability enhancement course assessment', createdOn: '19 May 2026', status: 'Active' },
  { id: 'VOC', name: 'VOC Assessment', code: 'VOC', type: 'VOC', description: 'Vocational course assessment', createdOn: '20 May 2026', status: 'Active' },
];

const TYPE_OPTIONS = [
  { emoji: '📘', value: 'SCHOLASTIC' },
  { emoji: '👥', value: 'CO-SCHOLASTIC' },
  { emoji: '🛡', value: 'DISCIPLINE' },
  { emoji: '⚙', value: 'SKILL' },
  { emoji: '⭐', value: 'MAJOR' },
  { emoji: '📗', value: 'MINOR' },
  { emoji: '🎓', value: 'MDC' },
  { emoji: '🛡', value: 'SEC' },
  { emoji: '✈', value: 'VAC' },
  { emoji: '✏', value: 'AEC' },
  { emoji: '🎤', value: 'VOC' },
];

const createId = () => `asses-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getInitialRows = () => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        return assessments;
      }
    }
  }
  return assessments;
};


export default function AssessmentMasterPage() {
  const [query, setQuery] = useState('');
  const [openAddMenu, setOpenAddMenu] = useState(false);
  const [openInlineForm, setOpenInlineForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: '' });
  const [typeFilter, setTypeFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [rows, setRows] = useState(getInitialRows);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    // Hide the global BackNavigationButton to keep only the in-page back button
    const selector = '.erp-content-wrapper > .pt-1 > .mb-3';
    const el = document.querySelector(selector);
    let prevDisplay;
    if (el) {
      prevDisplay = el.style.display;
      el.style.display = 'none';
    }
    return () => { if (el) el.style.display = prevDisplay || ''; };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    }
  }, [rows]);

  const filteredRows = rows.filter((row) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;
    return [row.name, row.code, row.type, row.description, row.status, row.createdOn]
      .some((value) => value.toLowerCase().includes(search));
  });

  return (
    <div className="min-h-screen w-full min-w-0 px-[12px] pb-8 pt-4 lg:px-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Academics Setup', to: '/settings/academics' }, { label: 'Assessment', to: '/settings/assessment' }, { label: 'Assessment Master' }]} />
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">Assessment Master</h1>
              <span className="text-sm text-slate-500">Assessment Master</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition">
            <Copy className="h-4 w-4" /> Copy
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setOpenInlineForm((s) => !s)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#08203a] px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-95 transition"
            >
              <Plus className="h-4 w-4" /> Add New Details <ChevronDown className="h-4 w-4 text-white/80" />
            </button>

            {/* Inline expandable form */}
            <div className={`mt-4 overflow-visible transition-all duration-300 ${openInlineForm ? 'max-h-[220px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!form.name || !form.type) return;
                    if (editingId) {
                      setRows((r) => r.map((row) => (row.id === editingId ? { ...row, name: form.name, type: form.type, description: `${form.name} - ${form.type} description` } : row)));
                      setEditingId(null);
                    } else {
                      const newCode = form.type.replace(/[^A-Z]/g, '').slice(0, 6) || 'NEW';
                      const newRow = {
                        id: createId(),
                        name: form.name,
                        code: newCode,
                        type: form.type,
                        description: `${form.name} - ${form.type} description`,
                        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        status: 'Active',
                      };
                      setRows((r) => [newRow, ...r]);
                    }
                    setForm({ name: '', type: '' });
                    setTypeFilter('');
                    setOpenInlineForm(false);
                  }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Assessment Name *</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Enter Assessment Name"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="w-[260px] min-w-[160px]">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Assessment Type *</label>
                      <div
                        className="relative"
                        onMouseEnter={() => {
                          if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                          setOpenAddMenu(true);
                        }}
                        onMouseLeave={() => {
                          if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                          closeTimerRef.current = setTimeout(() => { setOpenAddMenu(false); closeTimerRef.current = null; }, 180);
                        }}
                      >
                        <input
                          value={typeFilter || form.type}
                          onChange={(e) => { setTypeFilter(e.target.value); }}
                          onFocus={() => setOpenAddMenu(true)}
                          placeholder="Select type"
                          className="h-10 w-full rounded-md border border-slate-200 bg-white pl-3 pr-10 text-sm placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>

                        <div className={`absolute left-0 right-0 mt-10 z-30 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${openAddMenu ? '' : 'hidden'}`}>
                          <div className="max-h-40 overflow-auto py-1">
                            {TYPE_OPTIONS
                              .filter((opt) => (typeFilter ? opt.value.toLowerCase().includes(typeFilter.toLowerCase()) : true))
                              .map((opt) => (
                                <button key={opt.value} type="button" onClick={() => { setForm((f) => ({ ...f, type: opt.value })); setTypeFilter(''); setOpenAddMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-3">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-sm">{opt.emoji}</span>
                                  <span>{opt.value}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                        <span className="text-lg">💾</span> Save
                      </button>
                      <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', type: '' }); setTypeFilter(''); }} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assessment..." className="h-10 w-[320px] rounded-md border border-slate-200 bg-white px-3 text-sm placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-200" />
            </div>
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-[#08203a] text-white rounded-t-lg">
                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">NAME</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">CODE</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">TYPE</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">DESCRIPTION</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">STATUS</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">CREATED ON</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredRows.map((row, idx) => (
                <tr key={row.id} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-4 text-sm text-slate-700">{idx + 1}</td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{row.code}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">{row.type}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{row.description}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{row.createdOn}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    <div className="inline-flex items-center gap-2 justify-center">
                      <button type="button" onClick={() => { /* view currently no-op */ }} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-[#1E293B] hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => { setForm({ name: row.name, type: row.type }); setOpenInlineForm(true); setEditingId(row.id); }} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-[#1E293B] hover:bg-emerald-50">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => { if (window.confirm('Delete this assessment?')) setRows((r) => r.filter((x) => x.id !== row.id)); }} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-[#EF4444] hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-600">Showing 1 to {filteredRows.length} of {rows.length} entries</div>
          <div className="inline-flex items-center gap-2">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700">&lt;</button>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#08203a] text-white">1</button>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
