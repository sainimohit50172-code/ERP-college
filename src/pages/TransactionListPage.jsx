import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Download, Eye, Filter, RefreshCw, X } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useResourceList } from '../hooks/useResourceHooks';

const TYPES = ['All', 'Regular fee', 'Online fee', 'Miscellaneous fee', 'Other income'];
const METHODS = ['All', 'Cash', 'UPI', 'Card', 'Net Banking', 'Bank Transfer', 'Cheque', 'Payment Link'];
const STATUSES = ['All', 'Paid', 'Success', 'Recorded', 'Pending', 'Cancelled', 'Failed'];
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function statusClass(status) {
  if (status === 'Cancelled' || status === 'Failed') return 'bg-rose-100 text-rose-700';
  if (status === 'Pending') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

function normalizeTransactions(payments, incomes) {
  const feeRows = payments.map((payment) => {
    const source = payment.metadata?.source === 'miscellaneous-fee' ? 'Miscellaneous fee' : payment.method === 'Payment Link' || payment.method === 'UPI' || payment.method === 'Card' || payment.method === 'Net Banking' ? 'Online fee' : 'Regular fee';
    return {
      id: `payment-${payment.id}`,
      source,
      date: (payment.paidAt || payment.date || payment.createdAt || '').slice(0, 10),
      reference: payment.receiptNumber || payment.paymentId || payment.id,
      party: payment.studentName || payment.studentId || 'Student',
      category: payment.metadata?.chargeType || source,
      method: payment.method || payment.paymentMethod || 'Cash',
      amount: Number(payment.amount || 0),
      status: payment.status || 'Pending',
      notes: payment.notes || '',
      raw: payment,
    };
  });
  const incomeRows = incomes.map((entry) => ({
    id: `income-${entry.id}`,
    source: 'Other income',
    date: entry.date || (entry.createdAt || '').slice(0, 10),
    reference: entry.reference || entry.id,
    party: entry.payerName || 'Income source',
    category: entry.category || 'Other income',
    method: entry.method || 'Cash',
    amount: Number(entry.amount || 0),
    status: entry.status || 'Recorded',
    notes: entry.notes || '',
    raw: entry,
  }));
  return [...feeRows, ...incomeRows].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function downloadCsv(rows) {
  const header = ['Date', 'Type', 'Reference', 'Party', 'Category', 'Payment mode', 'Amount', 'Status'];
  const body = rows.map((row) => [row.date, row.source, row.reference, row.party, row.category, row.method, row.amount, row.status]);
  const csv = [header, ...body].map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fee-transactions.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function TransactionListPage() {
  const queryClient = useQueryClient();
  const { data: paymentsData, isLoading: paymentsLoading } = useResourceList('payments', { page: 1, pageSize: 500 });
  const { data: incomeData, isLoading: incomeLoading } = useResourceList('otherIncome', { page: 1, pageSize: 500 });
  const transactions = useMemo(() => normalizeTransactions(paymentsData?.items || [], incomeData?.items || []), [incomeData, paymentsData]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [method, setMethod] = useState('All');
  const [status, setStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactions.filter((row) => {
      const haystack = [row.reference, row.party, row.category, row.source, row.notes].join(' ').toLowerCase();
      return (!term || haystack.includes(term)) && (type === 'All' || row.source === type) && (method === 'All' || row.method === method) && (status === 'All' || row.status === status) && (!fromDate || row.date >= fromDate) && (!toDate || row.date <= toDate);
    });
  }, [fromDate, method, search, status, toDate, transactions, type]);
  const totals = useMemo(() => filtered.reduce((result, row) => { result.amount += row.amount; result.count += 1; if (row.status === 'Pending') result.pending += row.amount; if (row.status === 'Paid' || row.status === 'Success' || row.status === 'Recorded') result.success += row.amount; return result; }, { amount: 0, pending: 0, success: 0, count: 0 }), [filtered]);
  const loading = paymentsLoading || incomeLoading;
  const clearFilters = () => { setSearch(''); setType('All'); setMethod('All'); setStatus('All'); setFromDate(''); setToDate(''); };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader title="Transaction list" subtitle="Fee desk / Complete financial transaction ledger" action={<div className="flex items-center gap-3"><button type="button" onClick={() => downloadCsv(filtered)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"><Download size={15} /> Export CSV</button><button type="button" onClick={() => { queryClient.invalidateQueries({ queryKey: ['payments'] }); queryClient.invalidateQueries({ queryKey: ['otherIncome'] }); }} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"><RefreshCw size={15} /> Refresh</button></div>} />
      <div className="grid gap-4 md:grid-cols-4"><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transactions</p><p className="mt-2 text-2xl font-bold text-slate-950">{totals.count}</p><p className="mt-1 text-xs text-slate-500">Matching records</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total value</p><p className="mt-2 text-2xl font-bold text-emerald-700">{money(totals.amount)}</p><p className="mt-1 text-xs text-slate-500">Filtered transaction value</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed value</p><p className="mt-2 text-2xl font-bold text-sky-700">{money(totals.success)}</p><p className="mt-1 text-xs text-slate-500">Paid and recorded</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending value</p><p className="mt-2 text-2xl font-bold text-amber-700">{money(totals.pending)}</p><p className="mt-1 text-xs text-slate-500">Needs reconciliation</p></div></div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-bold text-slate-950"><Filter size={18} /> Filter all transactions</h3><p className="mt-1 text-sm text-slate-500">Use multiple filters to reconcile a specific collection set.</p></div><button type="button" onClick={clearFilters} className="text-xs font-semibold text-slate-500 hover:text-slate-900">Clear filters</button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><input aria-label="Search transactions" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search party, reference or category" className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /><select aria-label="Filter transaction type" value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{TYPES.map((item) => <option key={item}>{item === 'All' ? 'All transaction types' : item}</option>)}</select><select aria-label="Filter payment mode" value={method} onChange={(event) => setMethod(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{METHODS.map((item) => <option key={item}>{item === 'All' ? 'All payment modes' : item}</option>)}</select><select aria-label="Filter transaction status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{STATUSES.map((item) => <option key={item}>{item === 'All' ? 'All statuses' : item}</option>)}</select><label className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} /><input aria-label="From date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label><label className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} /><input aria-label="To date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label></div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Date</th><th className="pb-3">Type</th><th className="pb-3">Reference</th><th className="pb-3">Party / student</th><th className="pb-3">Category</th><th className="pb-3">Mode</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Action</th></tr></thead><tbody>{loading ? <tr><td colSpan="9" className="py-10 text-center text-sm text-slate-500">Loading transactions...</td></tr> : filtered.length ? filtered.map((row) => <tr key={row.id} className="border-b border-slate-100 last:border-0"><td className="py-3 text-slate-600">{row.date || 'N/A'}</td><td className="py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{row.source}</span></td><td className="py-3 font-semibold text-slate-800">{row.reference}</td><td className="py-3 text-slate-600">{row.party}</td><td className="py-3 text-slate-600">{row.category}</td><td className="py-3 text-slate-600">{row.method}</td><td className="py-3 font-semibold text-slate-800">{money(row.amount)}</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>{row.status}</span></td><td className="py-3"><button type="button" onClick={() => setSelected(row)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"><Eye size={14} /> View</button></td></tr>) : <tr><td colSpan="9" className="py-10 text-center text-sm text-slate-500">No transactions match the selected filters.</td></tr>}</tbody></table></div></section>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold text-slate-950">Transaction details</h3><p className="mt-1 text-sm text-slate-500">{selected.reference}</p></div><button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close transaction details"><X size={18} /></button></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Type</dt><dd className="font-semibold text-slate-900">{selected.source}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Party / student</dt><dd className="font-semibold text-slate-900">{selected.party}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Category</dt><dd className="font-semibold text-slate-900">{selected.category}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Amount</dt><dd className="font-semibold text-emerald-700">{money(selected.amount)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Payment mode</dt><dd className="font-semibold text-slate-900">{selected.method}</dd></div><div><dt className="text-slate-500">Notes</dt><dd className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800">{selected.notes || 'No notes added.'}</dd></div></dl></div></div>}
    </div>
  );
}
