import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Eye, Filter, RefreshCw, X } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useResourceList } from '../hooks/useResourceHooks';

const CATEGORIES = ['All', 'Application form', 'Alumni contribution', 'Event registration', 'Sale of prospectus', 'Rental income', 'Donation', 'Other'];
const METHODS = ['All', 'Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function statusClass(status) {
  return status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700';
}

export default function OtherIncomeTransactionsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useResourceList('otherIncome', { page: 1, pageSize: 500 });
  const entries = useMemo(() => data?.items || [], [data]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [method, setMethod] = useState('All');
  const [status, setStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const searchable = [entry.category, entry.payerName, entry.reference, entry.notes].filter(Boolean).join(' ').toLowerCase();
      const date = entry.date || '';
      return (!term || searchable.includes(term))
        && (category === 'All' || entry.category === category)
        && (method === 'All' || entry.method === method)
        && (status === 'All' || (entry.status || 'Recorded') === status)
        && (!fromDate || date >= fromDate)
        && (!toDate || date <= toDate);
    });
  }, [category, entries, fromDate, method, search, status, toDate]);

  const filteredTotal = filteredEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const clearFilters = () => { setSearch(''); setCategory('All'); setMethod('All'); setStatus('All'); setFromDate(''); setToDate(''); };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader title="Other income transaction list" subtitle="Fee desk / Non-fee income ledger" action={<button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ['otherIncome'] })} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"><RefreshCw size={15} /> Refresh</button>} />
      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Matching entries</p><p className="mt-2 text-2xl font-bold text-slate-950">{filteredEntries.length}</p><p className="mt-1 text-xs text-slate-500">Current filters</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtered amount</p><p className="mt-2 text-2xl font-bold text-emerald-700">{money(filteredTotal)}</p><p className="mt-1 text-xs text-slate-500">Recorded income</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">All transactions</p><p className="mt-2 text-2xl font-bold text-sky-700">{entries.length}</p><p className="mt-1 text-xs text-slate-500">Complete ledger count</p></div></div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-bold text-slate-950"><Filter size={18} /> Filter transactions</h3><p className="mt-1 text-sm text-slate-500">Search by payer, category, reference or notes.</p></div><button type="button" onClick={clearFilters} className="text-xs font-semibold text-slate-500 hover:text-slate-900">Clear filters</button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><input aria-label="Search other income transactions" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{CATEGORIES.map((item) => <option key={item}>{item === 'All' ? 'All categories' : item}</option>)}</select><select aria-label="Filter by method" value={method} onChange={(event) => setMethod(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{METHODS.map((item) => <option key={item}>{item === 'All' ? 'All payment modes' : item}</option>)}</select><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"><option>All</option><option>Recorded</option><option>Cancelled</option></select><label className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} /><input aria-label="From date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label><label className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} /><input aria-label="To date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label></div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Date</th><th className="pb-3">Category</th><th className="pb-3">Payer / source</th><th className="pb-3">Mode</th><th className="pb-3">Reference</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Action</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="8" className="py-10 text-center text-sm text-slate-500">Loading transactions...</td></tr> : filteredEntries.length ? filteredEntries.map((entry) => <tr key={entry.id} className="border-b border-slate-100 last:border-0"><td className="py-3 text-slate-600">{entry.date || 'N/A'}</td><td className="py-3 font-semibold text-slate-800">{entry.category}</td><td className="py-3 text-slate-600">{entry.payerName}</td><td className="py-3 text-slate-600">{entry.method}</td><td className="py-3 text-slate-600">{entry.reference || '—'}</td><td className="py-3 font-semibold text-slate-800">{money(entry.amount)}</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(entry.status)}`}>{entry.status || 'Recorded'}</span></td><td className="py-3"><button type="button" onClick={() => setSelectedEntry(entry)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"><Eye size={14} /> View</button></td></tr>) : <tr><td colSpan="8" className="py-10 text-center text-sm text-slate-500">No transactions match the selected filters.</td></tr>}</tbody></table></div></section>
      {selectedEntry && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold text-slate-950">Transaction details</h3><p className="mt-1 text-sm text-slate-500">{selectedEntry.id}</p></div><button type="button" onClick={() => setSelectedEntry(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close transaction details"><X size={18} /></button></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Category</dt><dd className="font-semibold text-slate-900">{selectedEntry.category}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Payer / source</dt><dd className="font-semibold text-slate-900">{selectedEntry.payerName}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Amount</dt><dd className="font-semibold text-emerald-700">{money(selectedEntry.amount)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Payment mode</dt><dd className="font-semibold text-slate-900">{selectedEntry.method}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Reference</dt><dd className="font-semibold text-slate-900">{selectedEntry.reference || '—'}</dd></div><div><dt className="text-slate-500">Notes</dt><dd className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800">{selectedEntry.notes || 'No notes added.'}</dd></div></dl></div></div>}
    </div>
  );
}
