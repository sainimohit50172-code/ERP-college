import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeIndianRupee,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CreditCard,
  FileText,
  LoaderCircle,
  Plus,
  Receipt,
  Smartphone,
  Wallet,
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useResourceList } from '../hooks/useResourceHooks';
import { createPayment } from '../services/paymentService.js';

const CHARGE_TYPES = [
  'Application fee',
  'Certificate fee',
  'Duplicate ID card',
  'Document verification',
  'Late submission fee',
  'Other service charge',
];

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', icon: Wallet },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'Card', label: 'Card', icon: CreditCard },
  { value: 'Bank Transfer', label: 'Bank transfer', icon: BadgeIndianRupee },
];

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const getStudentName = (student) => student?.name || student?.fullName || student?.studentName || 'Student';

export default function MiscellaneousFeePage() {
  const queryClient = useQueryClient();
  const { data: studentsData, isLoading: studentsLoading } = useResourceList('students', { page: 1, pageSize: 300 });
  const { data: paymentsData } = useResourceList('payments', { page: 1, pageSize: 100 });
  const students = useMemo(() => studentsData?.items || [], [studentsData]);
  const miscellaneousPayments = useMemo(
    () => (paymentsData?.items || []).filter((payment) => payment.metadata?.source === 'miscellaneous-fee'),
    [paymentsData],
  );

  const [query, setQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [chargeType, setChargeType] = useState(CHARGE_TYPES[0]);
  const [customType, setCustomType] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState(null);

  const selectedStudent = students.find((student) => String(student.id) === String(selectedStudentId));
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students.slice(0, 8);
    return students.filter((student) => [getStudentName(student), student.enrollmentNo, student.rollNumber, student.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term))).slice(0, 8);
  }, [query, students]);

  const collectionMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      setNotice({ type: 'success', text: `Miscellaneous fee collected. Receipt ${payment.receiptNumber || 'generated'} is ready.` });
      setAmount('');
      setReference('');
      setNotes('');
    },
    onError: (error) => setNotice({ type: 'error', text: error?.message || 'Fee could not be collected.' }),
  });

  const selectStudent = (student) => {
    setSelectedStudentId(student.id);
    setQuery(getStudentName(student));
    setNotice(null);
  };

  const submit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    const finalChargeType = chargeType === 'Other service charge' && customType.trim() ? customType.trim() : chargeType;
    if (!selectedStudent) {
      setNotice({ type: 'error', text: 'Select a student before collecting the fee.' });
      return;
    }
    if (!finalChargeType) {
      setNotice({ type: 'error', text: 'Select or enter a charge type.' });
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setNotice({ type: 'error', text: 'Enter a valid amount greater than zero.' });
      return;
    }
    collectionMutation.mutate({
      studentId: selectedStudent.id,
      studentName: getStudentName(selectedStudent),
      amount: numericAmount,
      method: paymentMethod,
      status: 'Paid',
      notes: `${reference ? `Reference: ${reference}. ` : ''}${notes}`.trim(),
      metadata: { source: 'miscellaneous-fee', chargeType: finalChargeType },
    });
  };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader
        title="Collect miscellaneous fee"
        subtitle="Fee desk / Service charge collection"
        action={<span className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Receipt size={16} /> Receipt on save</span>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today collected</p><p className="mt-2 text-2xl font-bold text-emerald-700">{money(miscellaneousPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}</p><p className="mt-1 text-xs text-slate-500">Miscellaneous services</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total receipts</p><p className="mt-2 text-2xl font-bold text-slate-900">{miscellaneousPayments.length}</p><p className="mt-1 text-xs text-slate-500">Recorded in this view</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Students available</p><p className="mt-2 text-2xl font-bold text-sky-700">{students.length}</p><p className="mt-1 text-xs text-slate-500">Searchable student records</p></div>
      </div>

      {notice && <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${notice.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{notice.type === 'error' ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}{notice.text}</div>}

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><h3 className="text-lg font-bold text-slate-950">New miscellaneous collection</h3><p className="mt-1 text-sm text-slate-500">Collect a one-time service or administrative charge.</p></div>
          <div className="relative"><label className="mb-2 block text-sm font-semibold text-slate-700">Student</label><input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedStudentId(''); }} placeholder="Search name, admission number or email" className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />{query && !selectedStudentId && <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">{studentsLoading ? <p className="p-3 text-sm text-slate-500">Loading students...</p> : matches.length ? matches.map((student) => <button type="button" key={student.id} onClick={() => selectStudent(student)} className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left hover:bg-emerald-50"><span><strong className="block text-sm text-slate-900">{getStudentName(student)}</strong><small className="text-xs text-slate-500">{student.enrollmentNo || student.rollNumber || student.id}</small></span><ChevronRight size={15} className="text-slate-400" /></button>) : <p className="p-3 text-sm text-slate-500">No student found.</p>}</div>}</div>
          {selectedStudent && <div className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:grid-cols-3"><div><p className="text-xs text-emerald-700">Selected student</p><p className="mt-1 text-sm font-bold text-slate-900">{getStudentName(selectedStudent)}</p></div><div><p className="text-xs text-slate-500">Admission no.</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedStudent.enrollmentNo || selectedStudent.rollNumber || 'N/A'}</p></div><div><p className="text-xs text-slate-500">Course</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedStudent.courseId || selectedStudent.course || 'N/A'}</p></div></div>}
          <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="misc-charge-type" className="mb-2 block text-sm font-semibold text-slate-700">Charge type</label><select id="misc-charge-type" value={chargeType} onChange={(event) => setChargeType(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{CHARGE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div><div><label htmlFor="misc-amount" className="mb-2 block text-sm font-semibold text-slate-700">Amount</label><div className="flex h-11 items-center rounded-lg border border-slate-300"><span className="px-3 text-sm text-slate-400">₹</span><input id="misc-amount" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" className="w-full bg-transparent pr-3 text-sm font-semibold text-slate-900 outline-none" /></div></div></div>
          {chargeType === 'Other service charge' && <div><label htmlFor="misc-custom-type" className="mb-2 block text-sm font-semibold text-slate-700">Custom charge name</label><input id="misc-custom-type" value={customType} onChange={(event) => setCustomType(event.target.value)} placeholder="Enter charge name" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /></div>}
          <div><label htmlFor="misc-payment-mode" className="mb-2 block text-sm font-semibold text-slate-700">Payment mode</label><select id="misc-payment-mode" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500">{PAYMENT_METHODS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="text-lg font-bold text-slate-950">Collection details</h3><p className="mt-1 text-sm text-slate-500">Optional information for audit and reconciliation.</p></div><div><label htmlFor="misc-reference" className="mb-2 block text-sm font-semibold text-slate-700">Reference number</label><input id="misc-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Receipt / transaction reference" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /></div><div><label htmlFor="misc-notes" className="mb-2 block text-sm font-semibold text-slate-700">Notes</label><textarea id="misc-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" placeholder="Add a short note" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></div><div className="rounded-lg bg-slate-950 p-4 text-white"><p className="text-xs uppercase tracking-wider text-slate-400">Amount to collect</p><p className="mt-1 text-3xl font-bold">{money(amount)}</p><p className="mt-1 text-xs text-slate-400">{chargeType === 'Other service charge' && customType ? customType : chargeType}</p></div><button type="submit" disabled={collectionMutation.isPending} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{collectionMutation.isPending ? <><LoaderCircle size={17} className="animate-spin" /> Saving...</> : <><Plus size={17} /> Collect fee & generate receipt</>}</button></div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><FileText size={18} className="text-slate-500" /><div><h3 className="font-bold text-slate-950">Recent miscellaneous receipts</h3><p className="mt-1 text-sm text-slate-500">Review one-time charges collected by the fee desk.</p></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Receipt</th><th className="pb-3">Student</th><th className="pb-3">Charge</th><th className="pb-3">Mode</th><th className="pb-3">Amount</th><th className="pb-3">Status</th></tr></thead><tbody>{miscellaneousPayments.length ? miscellaneousPayments.map((payment) => <tr key={payment.id} className="border-b border-slate-100 last:border-0"><td className="py-3 font-semibold text-slate-800">{payment.receiptNumber || payment.paymentId || payment.id}</td><td className="py-3 text-slate-600">{payment.studentName || payment.studentId}</td><td className="py-3 text-slate-600">{payment.metadata?.chargeType || 'Service charge'}</td><td className="py-3 text-slate-600">{payment.method || 'Cash'}</td><td className="py-3 font-semibold text-slate-800">{money(payment.amount)}</td><td className="py-3"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{payment.status || 'Paid'}</span></td></tr>) : <tr><td colSpan="6" className="py-8 text-center text-sm text-slate-500">No miscellaneous receipts found.</td></tr>}</tbody></table></div></div>
    </div>
  );
}
