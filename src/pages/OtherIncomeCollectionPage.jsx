import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeIndianRupee,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  Smartphone,
  Wallet,
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useResourceList } from '../hooks/useResourceHooks';
import createResourceService from '../api/resourceService.js';

const CATEGORIES = ['Application form', 'Alumni contribution', 'Event registration', 'Sale of prospectus', 'Rental income', 'Donation', 'Other'];
const METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];
const METHOD_ICONS = { Cash: Wallet, UPI: Smartphone, Card: CreditCard, 'Bank Transfer': BadgeIndianRupee, Cheque: FileText };
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function OtherIncomeCollectionPage() {
  const queryClient = useQueryClient();
  const service = useMemo(() => createResourceService('otherIncome'), []);
  const { data, isLoading } = useResourceList('otherIncome', { page: 1, pageSize: 100 });
  const entries = useMemo(() => data?.items || [], [data]);
  const [form, setForm] = useState({ category: CATEGORIES[0], customCategory: '', payerName: '', amount: '', method: 'Cash', reference: '', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [notice, setNotice] = useState(null);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => (!term || [entry.payerName, entry.category, entry.reference].filter(Boolean).join(' ').toLowerCase().includes(term)) && (categoryFilter === 'All' || entry.category === categoryFilter));
  }, [categoryFilter, entries, search]);
  const total = entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const filteredTotal = filteredEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const saveMutation = useMutation({
    mutationFn: (payload) => service.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otherIncome'] });
      setNotice({ type: 'success', text: 'Other income recorded successfully.' });
      setForm((current) => ({ ...current, payerName: '', amount: '', reference: '', notes: '' }));
    },
    onError: (error) => setNotice({ type: 'error', text: error?.message || 'Other income could not be recorded.' }),
  });

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    const category = form.category === 'Other' && form.customCategory.trim() ? form.customCategory.trim() : form.category;
    if (!form.payerName.trim() || !category || !Number.isFinite(amount) || amount <= 0) {
      setNotice({ type: 'error', text: 'Enter payer name, category and a valid amount.' });
      return;
    }
    saveMutation.mutate({ ...form, category, amount, status: 'Recorded', createdAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader title="Collect other income" subtitle="Fee desk / Non-fee income collection" action={<button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ['otherIncome'] })} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"><RefreshCw size={15} /> Refresh</button>} />
      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total income</p><p className="mt-2 text-2xl font-bold text-emerald-700">{money(total)}</p><p className="mt-1 text-xs text-slate-500">All recorded entries</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Entries</p><p className="mt-2 text-2xl font-bold text-slate-950">{entries.length}</p><p className="mt-1 text-xs text-slate-500">Income transactions</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtered total</p><p className="mt-2 text-2xl font-bold text-sky-700">{money(filteredTotal)}</p><p className="mt-1 text-xs text-slate-500">Current filter result</p></div></div>
      {notice && <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${notice.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{notice.type === 'error' ? <CircleAlert size={17} /> : <CheckCircle2 size={17} />}{notice.text}</div>}
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-bold text-slate-950">New income entry</h3><p className="mt-1 text-sm text-slate-500">Record income outside regular student fees.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Income category<select value={form.category} onChange={(event) => updateField('category', event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-emerald-500">{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Amount<div className="mt-2 flex h-11 items-center rounded-lg border border-slate-300"><span className="px-3 text-slate-400">₹</span><input required min="1" type="number" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} placeholder="0" className="w-full bg-transparent pr-3 font-normal text-slate-900 outline-none" /></div></label>{form.category === 'Other' && <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Custom category<input value={form.customCategory} onChange={(event) => updateField('customCategory', event.target.value)} placeholder="Enter income category" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-emerald-500" /></label>}<label className="text-sm font-semibold text-slate-700">Payer / source<input required value={form.payerName} onChange={(event) => updateField('payerName', event.target.value)} placeholder="Person, company or department" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-emerald-500" /></label><label className="text-sm font-semibold text-slate-700">Collection date<input required type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-emerald-500" /></label></div></div><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-bold text-slate-950">Payment details</h3><p className="mt-1 text-sm text-slate-500">Keep reference information for reconciliation.</p><label className="mt-5 block text-sm font-semibold text-slate-700">Payment mode<select value={form.method} onChange={(event) => updateField('method', event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-emerald-500">{METHODS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-slate-700">Reference<input value={form.reference} onChange={(event) => updateField('reference', event.target.value)} placeholder="Receipt / transaction number" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-emerald-500" /></label><label className="mt-4 block text-sm font-semibold text-slate-700">Notes<textarea rows="3" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Optional notes" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal text-slate-900 outline-none focus:border-emerald-500" /></label><button type="submit" disabled={saveMutation.isPending} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{saveMutation.isPending ? <><LoaderCircle size={17} className="animate-spin" /> Saving...</> : <><Plus size={17} /> Record other income</>}</button></div></form>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold text-slate-950">Other income history</h3><p className="mt-1 text-sm text-slate-500">Search and review recorded income entries.</p></div><div className="flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search payer or reference" className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /><select aria-label="Filter income category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"><option>All</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Date</th><th className="pb-3">Category</th><th className="pb-3">Payer / source</th><th className="pb-3">Mode</th><th className="pb-3">Reference</th><th className="pb-3">Amount</th><th className="pb-3">Status</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="7" className="py-8 text-center text-slate-500">Loading income entries...</td></tr> : filteredEntries.length ? filteredEntries.map((entry) => { const Icon = METHOD_ICONS[entry.method] || Wallet; return <tr key={entry.id} className="border-b border-slate-100 last:border-0"><td className="py-3 text-slate-600">{entry.date || 'N/A'}</td><td className="py-3 font-semibold text-slate-800">{entry.category}</td><td className="py-3 text-slate-600">{entry.payerName}</td><td className="py-3 text-slate-600"><span className="inline-flex items-center gap-1"><Icon size={14} />{entry.method}</span></td><td className="py-3 text-slate-600">{entry.reference || '—'}</td><td className="py-3 font-semibold text-slate-800">{money(entry.amount)}</td><td className="py-3"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{entry.status || 'Recorded'}</span></td></tr>; }) : <tr><td colSpan="7" className="py-8 text-center text-slate-500">No income entries found.</td></tr>}</tbody></table></div></section>
    </div>
  );
}
