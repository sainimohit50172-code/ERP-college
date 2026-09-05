import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardPlus, Filter, LoaderCircle, RefreshCw, X } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useResourceList } from '../hooks/useResourceHooks';
import { updatePayment } from '../services/paymentService.js';

const TYPES = ['Concession', 'Waiver', 'Fine reversal', 'Scholarship', 'Correction'];
const STATUSES = ['All', 'Paid', 'Success', 'Pending', 'Cancelled', 'Failed'];
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateOf = (payment) => (payment.paidAt || payment.date || payment.createdAt || '').slice(0, 10);

function studentLabel(payment, students) {
  const student = students.find((item) => String(item.id) === String(payment.studentId));
  return payment.studentName || student?.name || student?.fullName || payment.studentId || 'Unknown student';
}

function badgeClass(status) {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Rejected') return 'bg-rose-100 text-rose-700';
  return 'bg-amber-100 text-amber-700';
}

export default function FeeAdjustmentPage() {
  const queryClient = useQueryClient();
  const { data: paymentsData, isLoading } = useResourceList('payments', { page: 1, pageSize: 500 });
  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 500 });
  const payments = useMemo(() => paymentsData?.items || [], [paymentsData]);
  const students = useMemo(() => studentsData?.items || [], [studentsData]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);

  const rows = useMemo(() => payments.filter((payment) => {
    const adjustment = payment.metadata?.adjustment;
    const term = search.trim().toLowerCase();
    const text = [payment.receiptNumber, payment.paymentId, payment.studentId, studentLabel(payment, students), adjustment?.reason].filter(Boolean).join(' ').toLowerCase();
    return (!term || text.includes(term)) && (status === 'All' || payment.status === status) && (type === 'All' || adjustment?.type === type);
  }), [payments, search, status, students, type]);

  const summary = useMemo(() => payments.reduce((result, payment) => {
    const adjustment = payment.metadata?.adjustment;
    if (!adjustment) return result;
    result.count += 1;
    result.amount += Number(adjustment.amount || 0);
    if (adjustment.status === 'Pending') result.pending += 1;
    if (adjustment.status === 'Approved') result.approved += 1;
    return result;
  }, { count: 0, amount: 0, pending: 0, approved: 0 }), [payments]);

  const mutation = useMutation({
    mutationFn: ({ id, payload }) => updatePayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setNotice('Fee adjustment saved and audit logged successfully.');
      setForm(null);
      setSelected(null);
    },
    onError: (error) => setNotice(error?.message || 'Adjustment could not be saved.'),
  });

  const openAdjustment = (payment) => {
    const existing = payment.metadata?.adjustment;
    setSelected(payment);
    setForm({ type: existing?.type || 'Concession', amount: existing?.amount || '', status: existing?.status || 'Pending', reason: existing?.reason || '', approvedBy: existing?.approvedBy || '' });
    setNotice('');
  };

  const submit = (event) => {
    event.preventDefault();
    const amount = Number(form?.amount);
    if (!selected || !form || !Number.isFinite(amount) || amount <= 0 || !form.reason.trim()) {
      setNotice('Enter a valid adjustment amount and reason.');
      return;
    }
    const previousAdjustment = selected.metadata?.adjustment;
    const payload = {
      ...selected,
      metadata: { ...(selected.metadata || {}), adjustment: { ...form, amount, appliedAt: new Date().toISOString(), previous: previousAdjustment || null } },
      adjustmentAmount: amount,
      adjustmentType: form.type,
      adjustmentStatus: form.status,
    };
    mutation.mutate({ id: selected.id, payload });
  };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader title="Fee adjustment" subtitle="Fee desk / Concessions, waivers and corrections" action={<button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ['payments'] })} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"><RefreshCw size={15} /> Refresh</button>} />
      <div className="grid gap-4 md:grid-cols-4"><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adjusted records</p><p className="mt-2 text-2xl font-bold text-slate-950">{summary.count}</p><p className="mt-1 text-xs text-slate-500">Payments with adjustments</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adjustment value</p><p className="mt-2 text-2xl font-bold text-emerald-700">{money(summary.amount)}</p><p className="mt-1 text-xs text-slate-500">Total adjustment amount</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending approval</p><p className="mt-2 text-2xl font-bold text-amber-700">{summary.pending}</p><p className="mt-1 text-xs text-slate-500">Needs review</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved</p><p className="mt-2 text-2xl font-bold text-sky-700">{summary.approved}</p><p className="mt-1 text-xs text-slate-500">Approved adjustments</p></div></div>
      {notice && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={17} /> {notice}</div>}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-bold text-slate-950"><Filter size={18} /> Find fee records</h3><p className="mt-1 text-sm text-slate-500">Review existing adjustments or apply one to a payment.</p></div><button type="button" onClick={() => { setSearch(''); setStatus('All'); setType('All'); }} className="text-xs font-semibold text-slate-500">Clear filters</button></div><div className="grid gap-3 md:grid-cols-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student or receipt" className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /><select aria-label="Filter payment status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{STATUSES.map((item) => <option key={item}>{item === 'All' ? 'All payment statuses' : item}</option>)}</select><select aria-label="Filter adjustment type" value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"><option>All</option>{TYPES.map((item) => <option key={item}>{item}</option>)}</select></div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Receipt</th><th className="pb-3">Student</th><th className="pb-3">Payment date</th><th className="pb-3">Original amount</th><th className="pb-3">Adjustment</th><th className="pb-3">Reason</th><th className="pb-3">Approval</th><th className="pb-3">Action</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="8" className="py-10 text-center text-slate-500">Loading fee records...</td></tr> : rows.length ? rows.map((payment) => { const adjustment = payment.metadata?.adjustment; return <tr key={payment.id} className="border-b border-slate-100 last:border-0"><td className="py-3 font-semibold text-slate-800">{payment.receiptNumber || payment.paymentId || payment.id}</td><td className="py-3 text-slate-600">{studentLabel(payment, students)}</td><td className="py-3 text-slate-600">{dateOf(payment) || 'N/A'}</td><td className="py-3 text-slate-600">{money(payment.amount)}</td><td className="py-3 font-semibold text-emerald-700">{adjustment ? `${adjustment.type}: ${money(adjustment.amount)}` : 'No adjustment'}</td><td className="max-w-[220px] truncate py-3 text-slate-600">{adjustment?.reason || '—'}</td><td className="py-3">{adjustment ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(adjustment.status)}`}>{adjustment.status}</span> : <span className="text-xs text-slate-400">Not applied</span>}</td><td className="py-3"><button type="button" onClick={() => openAdjustment(payment)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"><ClipboardPlus size={14} /> {adjustment ? 'Edit' : 'Adjust'}</button></td></tr>; }) : <tr><td colSpan="8" className="py-10 text-center text-slate-500">No fee records match these filters.</td></tr>}</tbody></table></div></section>
      {form && selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"><div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold text-slate-950">Apply fee adjustment</h3><p className="mt-1 text-sm text-slate-500">{selected.receiptNumber || selected.paymentId || selected.id}</p></div><button type="button" onClick={() => setForm(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close adjustment form"><X size={18} /></button></div><form onSubmit={submit} className="mt-5 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Adjustment type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-emerald-500">{TYPES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Amount<input required min="1" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-emerald-500" /></label></div><label className="block text-sm font-semibold text-slate-700">Approval status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-emerald-500"><option>Pending</option><option>Approved</option><option>Rejected</option></select></label><label className="block text-sm font-semibold text-slate-700">Reason<textarea required rows="3" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Why is this adjustment required?" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal text-slate-900 outline-none focus:border-emerald-500" /></label><label className="block text-sm font-semibold text-slate-700">Approved by<input value={form.approvedBy} onChange={(event) => setForm({ ...form, approvedBy: event.target.value })} placeholder="Optional approver name" className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-emerald-500" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setForm(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{mutation.isPending && <LoaderCircle size={15} className="animate-spin" />}Save adjustment</button></div></form></div></div>}
    </div>
  );
}
