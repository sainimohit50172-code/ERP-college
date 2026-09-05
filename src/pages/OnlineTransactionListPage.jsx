import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Download, Eye, Filter, RefreshCw, X } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useResourceList } from '../hooks/useResourceHooks';

const GATEWAYS = ['All', 'UPI', 'Card', 'Net Banking', 'Payment Link'];
const STATUSES = ['All', 'Paid', 'Success', 'Pending', 'Cancelled', 'Failed'];
const ONLINE_METHODS = GATEWAYS.slice(1);
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const paymentDate = (payment) => (payment.paidAt || payment.date || payment.createdAt || '').slice(0, 10);

function statusClass(status) {
  if (status === 'Paid' || status === 'Success') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Cancelled' || status === 'Failed') return 'bg-rose-100 text-rose-700';
  return 'bg-amber-100 text-amber-700';
}

export default function OnlineTransactionListPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useResourceList('payments', { page: 1, pageSize: 500 });
  const onlinePayments = useMemo(() => (data?.items || []).filter((payment) => ONLINE_METHODS.includes(payment.method || payment.paymentMethod)), [data]);
  const [search, setSearch] = useState('');
  const [gateway, setGateway] = useState('All');
  const [status, setStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return onlinePayments.filter((payment) => {
      const method = payment.method || payment.paymentMethod || '';
      const date = paymentDate(payment);
      const text = [payment.receiptNumber, payment.paymentId, payment.studentName, payment.studentId, method, payment.notes].filter(Boolean).join(' ').toLowerCase();
      return (!term || text.includes(term)) && (gateway === 'All' || method === gateway) && (status === 'All' || payment.status === status) && (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    });
  }, [fromDate, gateway, onlinePayments, search, status, toDate]);

  const summary = useMemo(() => filtered.reduce((result, payment) => { const value = Number(payment.amount || 0); result.count += 1; if (payment.status === 'Paid' || payment.status === 'Success') result.success += value; if (payment.status === 'Pending') result.pending += value; return result; }, { count: 0, success: 0, pending: 0 }), [filtered]);
  const clearFilters = () => { setSearch(''); setGateway('All'); setStatus('All'); setFromDate(''); setToDate(''); };

  const downloadCsv = () => {
    const rows = [['Date', 'Transaction', 'Student', 'Gateway', 'Amount', 'Status'], ...filtered.map((payment) => [paymentDate(payment), payment.receiptNumber || payment.paymentId || payment.id, payment.studentName || payment.studentId, payment.method || payment.paymentMethod, payment.amount, payment.status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'online-transactions.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader title="Online transaction list" subtitle="Fee desk / Digital payment reconciliation" action={<div className="flex items-center gap-3"><button type="button" onClick={downloadCsv} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"><Download size={15} /> Export CSV</button><button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ['payments'] })} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"><RefreshCw size={15} /> Refresh</button></div>} />
      <div className="grid gap-4 md:grid-cols-4"><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transactions</p><p className="mt-2 text-2xl font-bold text-slate-950">{summary.count}</p><p className="mt-1 text-xs text-slate-500">Matching online records</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Successful value</p><p className="mt-2 text-2xl font-bold text-emerald-700">{money(summary.success)}</p><p className="mt-1 text-xs text-slate-500">Paid and successful</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending value</p><p className="mt-2 text-2xl font-bold text-amber-700">{money(summary.pending)}</p><p className="mt-1 text-xs text-slate-500">Awaiting gateway response</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Success rate</p><p className="mt-2 text-2xl font-bold text-sky-700">{summary.count ? `${Math.round((filtered.filter((payment) => payment.status === 'Paid' || payment.status === 'Success').length / summary.count) * 100)}%` : '0%'}</p><p className="mt-1 text-xs text-slate-500">Current filtered set</p></div></div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-bold text-slate-950"><Filter size={18} /> Filter online transactions</h3><p className="mt-1 text-sm text-slate-500">Reconcile gateway settlements and pending payments.</p></div><button type="button" onClick={clearFilters} className="text-xs font-semibold text-slate-500">Clear filters</button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><input aria-label="Search online transactions" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student or transaction" className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /><select aria-label="Filter gateway" value={gateway} onChange={(event) => setGateway(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{GATEWAYS.map((item) => <option key={item}>{item === 'All' ? 'All gateways' : item}</option>)}</select><select aria-label="Filter online status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{STATUSES.map((item) => <option key={item}>{item === 'All' ? 'All statuses' : item}</option>)}</select><label className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} /><input aria-label="Online transactions from date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label><label className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} /><input aria-label="Online transactions to date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label></div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Date</th><th className="pb-3">Transaction</th><th className="pb-3">Student</th><th className="pb-3">Gateway</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Action</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="7" className="py-10 text-center text-slate-500">Loading online transactions...</td></tr> : filtered.length ? filtered.map((payment) => <tr key={payment.id} className="border-b border-slate-100 last:border-0"><td className="py-3 text-slate-600">{paymentDate(payment) || 'N/A'}</td><td className="py-3 font-semibold text-slate-800">{payment.receiptNumber || payment.paymentId || payment.id}</td><td className="py-3 text-slate-600">{payment.studentName || payment.studentId}</td><td className="py-3 text-slate-600">{payment.method || payment.paymentMethod}</td><td className="py-3 font-semibold text-slate-800">{money(payment.amount)}</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(payment.status)}`}>{payment.status || 'Pending'}</span></td><td className="py-3"><button type="button" onClick={() => setSelected(payment)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"><Eye size={14} /> View</button></td></tr>) : <tr><td colSpan="7" className="py-10 text-center text-sm text-slate-500">No online transactions match the selected filters.</td></tr>}</tbody></table></div></section>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold text-slate-950">Online transaction details</h3><p className="mt-1 text-sm text-slate-500">{selected.receiptNumber || selected.paymentId || selected.id}</p></div><button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close transaction details"><X size={18} /></button></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Student</dt><dd className="font-semibold text-slate-900">{selected.studentName || selected.studentId}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Gateway</dt><dd className="font-semibold text-slate-900">{selected.method || selected.paymentMethod}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Amount</dt><dd className="font-semibold text-emerald-700">{money(selected.amount)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(selected.status)}`}>{selected.status || 'Pending'}</span></dd></div><div><dt className="text-slate-500">Reference / notes</dt><dd className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800">{selected.notes || 'No notes added.'}</dd></div></dl></div></div>}
    </div>
  );
}
