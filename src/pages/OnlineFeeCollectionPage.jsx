import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeIndianRupee,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Copy,
  CreditCard,
  ExternalLink,
  Link2,
  LoaderCircle,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useResourceList } from '../hooks/useResourceHooks';
import { createPayment } from '../services/paymentService.js';

const FEE_HEADS = [
  { key: 'tuition', label: 'Tuition fee', amount: 32000 },
  { key: 'exam', label: 'Examination fee', amount: 1200 },
  { key: 'library', label: 'Library fee', amount: 800 },
  { key: 'transport', label: 'Transport fee', amount: 2400 },
];

const GATEWAYS = [
  { value: 'UPI', label: 'UPI / QR', detail: 'Instant settlement', icon: Smartphone },
  { value: 'Card', label: 'Cards', detail: 'Credit or debit card', icon: CreditCard },
  { value: 'Net Banking', label: 'Net banking', detail: 'All major banks', icon: BadgeIndianRupee },
  { value: 'Payment Link', label: 'Payment link', detail: 'Share with student', icon: Link2 },
];

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function studentName(student) {
  return student?.name || student?.fullName || student?.studentName || 'Student';
}

function statusTone(status) {
  if (status === 'Paid' || status === 'Success') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Failed' || status === 'Cancelled') return 'bg-rose-100 text-rose-700';
  return 'bg-amber-100 text-amber-700';
}

export default function OnlineFeeCollectionPage() {
  const queryClient = useQueryClient();
  const { data: studentsData, isLoading: studentsLoading } = useResourceList('students', { page: 1, pageSize: 300 });
  const { data: paymentsData } = useResourceList('payments', { page: 1, pageSize: 100 });
  const students = useMemo(() => studentsData?.items || [], [studentsData]);
  const onlinePayments = useMemo(
    () => (paymentsData?.items || []).filter((payment) => ['UPI', 'Card', 'Net Banking', 'Payment Link'].includes(payment.method || payment.paymentMethod)),
    [paymentsData],
  );

  const [query, setQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedHeads, setSelectedHeads] = useState(() => Object.fromEntries(FEE_HEADS.map((head) => [head.key, head.amount])));
  const [gateway, setGateway] = useState('UPI');
  const [discount, setDiscount] = useState(0);
  const [fine, setFine] = useState(0);
  const [reference, setReference] = useState('');
  const [notice, setNotice] = useState(null);
  const [copied, setCopied] = useState(false);

  const selectedStudent = students.find((student) => String(student.id) === String(selectedStudentId));
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students.slice(0, 8);
    return students.filter((student) => [studentName(student), student.enrollmentNo, student.rollNumber, student.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term))).slice(0, 8);
  }, [query, students]);
  const subtotal = Object.values(selectedHeads).reduce((sum, amount) => sum + Number(amount || 0), 0);
  const total = Math.max(0, subtotal - Number(discount || 0) + Number(fine || 0));
  const paymentLink = selectedStudent ? `https://pay.enterprise.edu/fee/${selectedStudent.id}-${Math.round(total)}` : '';

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      setNotice({ type: 'success', text: `Payment successful. Receipt ${payment.receiptNumber || 'generated'} is ready.` });
      setReference('');
    },
    onError: (error) => setNotice({ type: 'error', text: error?.message || 'Online payment could not be completed.' }),
  });

  const selectStudent = (student) => {
    setSelectedStudentId(student.id);
    setQuery(studentName(student));
    setNotice(null);
  };

  const toggleHead = (key) => {
    setSelectedHeads((current) => ({
      ...current,
      [key]: current[key] ? 0 : FEE_HEADS.find((head) => head.key === key)?.amount || 0,
    }));
  };

  const copyLink = async () => {
    if (!paymentLink) return;
    await navigator.clipboard?.writeText(paymentLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const startPayment = (event) => {
    event.preventDefault();
    if (!selectedStudent) {
      setNotice({ type: 'error', text: 'Select a student before starting online collection.' });
      return;
    }
    if (total <= 0) {
      setNotice({ type: 'error', text: 'Select at least one fee head with an amount.' });
      return;
    }
    paymentMutation.mutate({
      studentId: selectedStudent.id,
      studentName: studentName(selectedStudent),
      amount: total,
      method: gateway,
      status: 'Paid',
      discountAmount: Number(discount || 0),
      fine: Number(fine || 0),
      notes: `${reference ? `Gateway reference: ${reference}. ` : ''}Online collection`,
      metadata: { gateway, feeHeads: selectedHeads, paymentLink },
    });
  };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader
        title="Collect fee online"
        subtitle="Fee desk / Digital payment collection"
        action={<div className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><ShieldCheck size={16} /> PCI-ready payment workflow</div>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Online collected', money(onlinePayments.filter((payment) => payment.status === 'Paid' || payment.status === 'Success').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)), 'Current records', 'text-emerald-700'],
          ['Successful payments', onlinePayments.filter((payment) => payment.status === 'Paid' || payment.status === 'Success').length, 'Receipts generated', 'text-sky-700'],
          ['Pending links', onlinePayments.filter((payment) => payment.status === 'Pending').length, 'Awaiting student action', 'text-amber-700'],
          ['Gateway health', '99.9%', 'All systems operational', 'text-violet-700'],
        ].map(([label, value, hint, tone]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          </div>
        ))}
      </div>

      {notice && <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${notice.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{notice.type === 'error' ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}{notice.text}</div>}

      <form onSubmit={startPayment} className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><h3 className="text-lg font-bold text-slate-950">Create online payment</h3><p className="mt-1 text-sm text-slate-500">Choose a student and the fee heads to be paid online.</p></div>
          <div className="relative">
            <input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedStudentId(''); }} placeholder="Search student by name, admission number or email" className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            {query && !selectedStudentId && <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">{studentsLoading ? <p className="p-3 text-sm text-slate-500">Loading students...</p> : matches.length ? matches.map((student) => <button type="button" key={student.id} onClick={() => selectStudent(student)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-emerald-50"><span><strong className="block text-sm text-slate-900">{studentName(student)}</strong><small className="text-xs text-slate-500">{student.enrollmentNo || student.rollNumber || student.id} · {student.courseId || student.course || 'Course not mapped'}</small></span><ChevronRight size={16} className="text-slate-400" /></button>) : <p className="p-3 text-sm text-slate-500">No student found.</p>}</div>}
          </div>
          {selectedStudent ? <div className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-3"><div><p className="text-xs uppercase tracking-wider text-emerald-700">Student</p><p className="mt-1 font-bold text-slate-950">{studentName(selectedStudent)}</p></div><div><p className="text-xs text-slate-500">Admission no.</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedStudent.enrollmentNo || selectedStudent.rollNumber || 'Not available'}</p></div><div><p className="text-xs text-slate-500">Course</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedStudent.courseId || selectedStudent.course || 'Not mapped'}</p></div></div> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">Select a student to load their online dues.</div>}

          <div><div className="mb-3 flex items-center justify-between"><div><h4 className="font-bold text-slate-900">Fee heads</h4><p className="mt-1 text-xs text-slate-500">Partial payments are supported.</p></div><button type="button" onClick={() => setSelectedHeads(Object.fromEntries(FEE_HEADS.map((head) => [head.key, head.amount])))} className="text-xs font-semibold text-emerald-700">Reset</button></div><div className="grid gap-3 sm:grid-cols-2">{FEE_HEADS.map((head) => <div key={head.key} className={`rounded-xl border p-3 ${selectedHeads[head.key] ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}><div className="flex items-center gap-3"><input type="checkbox" checked={Boolean(selectedHeads[head.key])} onChange={() => toggleHead(head.key)} className="h-4 w-4 accent-emerald-600" /><span className="flex-1 text-sm font-semibold text-slate-800">{head.label}</span></div><div className="mt-3 flex items-center rounded-lg border border-slate-200 bg-white"><span className="px-3 text-sm text-slate-400">₹</span><input type="number" min="0" value={selectedHeads[head.key]} onChange={(event) => setSelectedHeads((current) => ({ ...current, [head.key]: event.target.value }))} disabled={!selectedHeads[head.key]} className="h-9 w-full bg-transparent pr-3 text-right text-sm font-semibold text-slate-900 outline-none disabled:text-slate-400" /></div></div>)}</div></div>
        </div>

        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="text-lg font-bold text-slate-950">Payment gateway</h3><p className="mt-1 text-sm text-slate-500">Select how the student will pay.</p></div><div className="grid gap-2 sm:grid-cols-2">{GATEWAYS.map(({ value, label, detail, icon: Icon }) => <button type="button" key={value} onClick={() => setGateway(value)} className={`rounded-xl border p-3 text-left transition ${gateway === value ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'}`}><span className="flex items-center gap-2 text-sm font-bold text-slate-800"><Icon size={17} className={gateway === value ? 'text-emerald-700' : 'text-slate-500'} />{label}</span><small className="mt-1 block text-xs text-slate-500">{detail}</small></button>)}</div><div className="space-y-3 border-y border-slate-200 py-4 text-sm"><div className="flex justify-between text-slate-600"><span>Subtotal</span><strong className="text-slate-900">{money(subtotal)}</strong></div><label className="flex items-center justify-between gap-3 text-slate-600"><span>Discount</span><input type="number" min="0" value={discount} onChange={(event) => setDiscount(event.target.value)} className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-right text-slate-900 outline-none focus:border-emerald-500" /></label><label className="flex items-center justify-between gap-3 text-slate-600"><span>Late fine</span><input type="number" min="0" value={fine} onChange={(event) => setFine(event.target.value)} className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-right text-slate-900 outline-none focus:border-emerald-500" /></label></div><div className="rounded-xl bg-slate-950 p-4 text-white"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Amount payable</p><p className="mt-2 text-3xl font-bold">{money(total)}</p></div>{gateway === 'Payment Link' && <div className="rounded-xl border border-sky-200 bg-sky-50 p-3"><p className="text-xs font-bold uppercase tracking-wider text-sky-800">Shareable payment link</p><div className="mt-2 flex gap-2"><input readOnly value={paymentLink || 'Select a student first'} className="min-w-0 flex-1 rounded-lg border border-sky-200 bg-white px-2 text-xs text-slate-600" /><button type="button" onClick={copyLink} disabled={!paymentLink} className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 text-xs font-bold text-white disabled:opacity-50"><Copy size={14} />{copied ? 'Copied' : 'Copy'}</button></div><div className="mt-3 flex gap-2"><button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700"><Send size={14} /> Send by SMS</button><button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700"><Mail size={14} /> Send by email</button></div></div>}<input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Gateway reference (optional)" className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /><button type="submit" disabled={paymentMutation.isPending || !selectedStudent} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{paymentMutation.isPending ? <><LoaderCircle size={18} className="animate-spin" /> Processing...</> : <><WalletCards size={18} /> Start secure payment</>}</button><p className="flex items-center justify-center gap-1 text-center text-xs text-slate-500"><ShieldCheck size={14} /> No card or bank details are stored in the ERP</p></div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold text-slate-950">Online transaction history</h3><p className="mt-1 text-sm text-slate-500">Track gateway payments, receipts, and pending links.</p></div><button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ['payments'] })} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"><RefreshCw size={14} /> Refresh</button></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Transaction</th><th className="pb-3">Student</th><th className="pb-3">Gateway</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Action</th></tr></thead><tbody>{onlinePayments.length ? onlinePayments.map((payment) => <tr key={payment.id} className="border-b border-slate-100 last:border-0"><td className="py-3 font-semibold text-slate-800">{payment.receiptNumber || payment.paymentId || payment.id}</td><td className="py-3 text-slate-600">{payment.studentName || payment.studentId}</td><td className="py-3 text-slate-600">{payment.method || payment.paymentMethod}</td><td className="py-3 font-semibold text-slate-800">{money(payment.amount)}</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(payment.status)}`}>{payment.status || 'Pending'}</span></td><td className="py-3"><button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><ExternalLink size={14} /> View</button></td></tr>) : <tr><td colSpan="6" className="py-8 text-center text-sm text-slate-500">No online transactions found.</td></tr>}</tbody></table></div></div>
    </div>
  );
}
