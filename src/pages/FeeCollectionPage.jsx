import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeIndianRupee,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  History,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useResourceList } from '../hooks/useResourceHooks';
import { createPayment } from '../services/paymentService.js';

const FEE_HEADS = [
  { key: 'tuition', label: 'Tuition fee', amount: 32000 },
  { key: 'exam', label: 'Examination fee', amount: 1200 },
  { key: 'library', label: 'Library fee', amount: 800 },
  { key: 'transport', label: 'Transport fee', amount: 2400 },
  { key: 'hostel', label: 'Hostel fee', amount: 0 },
];

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', icon: Wallet },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'Card', label: 'Card', icon: CreditCard },
  { value: 'Net Banking', label: 'Net banking', icon: BadgeIndianRupee },
];

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function getStudentName(student) {
  return student?.name || student?.fullName || student?.studentName || 'Student';
}

export default function FeeCollectionPage() {
  const queryClient = useQueryClient();
  const { data: studentsData, isLoading: studentsLoading } = useResourceList('students', { page: 1, pageSize: 300 });
  const { data: paymentsData } = useResourceList('payments', { page: 1, pageSize: 8 });
  const students = useMemo(() => studentsData?.items || [], [studentsData]);
  const recentPayments = useMemo(() => paymentsData?.items || [], [paymentsData]);
  const [query, setQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedHeads, setSelectedHeads] = useState(() => Object.fromEntries(FEE_HEADS.map((head) => [head.key, head.amount])));
  const [discount, setDiscount] = useState(0);
  const [fine, setFine] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  const selectedStudent = students.find((student) => String(student.id) === String(selectedStudentId));
  const matchingStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return students.slice(0, 8);
    return students.filter((student) => [getStudentName(student), student.enrollmentNo, student.rollNumber, student.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery))).slice(0, 8);
  }, [query, students]);

  const subtotal = Object.values(selectedHeads).reduce((sum, amount) => sum + Number(amount || 0), 0);
  const total = Math.max(0, subtotal - Number(discount || 0) + Number(fine || 0));

  const collectMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      setStatus(`Payment collected. Receipt ${payment.receiptNumber || 'is ready'} generated successfully.`);
      setReference('');
      setNotes('');
    },
    onError: (error) => setStatus(error?.message || 'Payment could not be recorded. Please try again.'),
  });

  const selectStudent = (student) => {
    setSelectedStudentId(student.id);
    setQuery(getStudentName(student));
    setStatus('');
  };

  const toggleHead = (key) => {
    setSelectedHeads((current) => ({ ...current, [key]: current[key] ? 0 : FEE_HEADS.find((head) => head.key === key)?.amount || 0 }));
  };

  const submitPayment = (event) => {
    event.preventDefault();
    if (!selectedStudent) {
      setStatus('Select a student before collecting the fee.');
      return;
    }
    if (total <= 0) {
      setStatus('Enter at least one fee amount before collecting.');
      return;
    }
    collectMutation.mutate({
      studentId: selectedStudent.id,
      studentName: getStudentName(selectedStudent),
      amount: total,
      method: paymentMethod,
      status: 'Paid',
      scholarshipAmount: 0,
      discountAmount: Number(discount || 0),
      fine: Number(fine || 0),
      notes: `${reference ? `Reference: ${reference}. ` : ''}${notes}`.trim(),
      metadata: { feeHeads: selectedHeads },
    });
  };

  return (
    <div className="space-y-5 pb-8">
      <SectionHeader
        title="Collect fee"
        subtitle="Fee desk / Student payment collection"
        action={<div className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><ShieldCheck size={16} /> Secure cashier session</div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[['Today collected', money(124500), '18 receipts', 'text-emerald-700'], ['Pending approvals', '06', 'Manual review required', 'text-amber-700'], ['Average receipt', money(6917), 'This billing cycle', 'text-sky-700']].map(([label, value, hint, tone]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          </div>
        ))}
      </div>

      {status && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={18} /> {status}</div>}

      <form onSubmit={submitPayment} className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div><h3 className="text-lg font-bold text-slate-950">1. Find student</h3><p className="mt-1 text-sm text-slate-500">Search by name, admission number, roll number, or email.</p></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{students.length} students</span>
          </div>
          <div className="relative">
            <input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedStudentId(''); }} placeholder="Search student..." className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            {query && !selectedStudentId && <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              {studentsLoading ? <p className="p-3 text-sm text-slate-500">Loading students...</p> : matchingStudents.length ? matchingStudents.map((student) => <button type="button" key={student.id} onClick={() => selectStudent(student)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-emerald-50"><span><strong className="block text-sm text-slate-900">{getStudentName(student)}</strong><small className="text-xs text-slate-500">{student.enrollmentNo || student.rollNumber || student.id} · {student.courseId || student.course || 'Course not mapped'}</small></span><ChevronRight size={16} className="text-slate-400" /></button>) : <p className="p-3 text-sm text-slate-500">No student found.</p>}
            </div>}
          </div>
          {selectedStudent ? <div className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-3"><div><p className="text-xs uppercase tracking-wider text-emerald-700">Selected student</p><p className="mt-1 font-bold text-slate-950">{getStudentName(selectedStudent)}</p></div><div><p className="text-xs text-slate-500">Admission number</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedStudent.enrollmentNo || selectedStudent.rollNumber || 'Not available'}</p></div><div><p className="text-xs text-slate-500">Course / semester</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedStudent.courseId || selectedStudent.course || 'Not mapped'}</p></div></div> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">Choose a student to unlock fee heads and payment collection.</div>}

          <div><div className="mb-3 flex items-center justify-between"><div><h3 className="text-lg font-bold text-slate-950">2. Select fee heads</h3><p className="mt-1 text-sm text-slate-500">Adjust the amount for partial or custom collections.</p></div><button type="button" onClick={() => setSelectedHeads(Object.fromEntries(FEE_HEADS.map((head) => [head.key, head.amount])))} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Reset heads</button></div><div className="grid gap-3 sm:grid-cols-2">{FEE_HEADS.map((head) => <div key={head.key} className={`rounded-xl border p-3 transition ${selectedHeads[head.key] ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}><div className="flex items-center gap-3"><input type="checkbox" checked={Boolean(selectedHeads[head.key])} onChange={() => toggleHead(head.key)} className="h-4 w-4 accent-emerald-600" /><label className="flex-1 text-sm font-semibold text-slate-800">{head.label}</label><span className="text-xs text-slate-500">Due</span></div><div className="mt-3 flex items-center rounded-lg border border-slate-200 bg-white"><span className="px-3 text-sm text-slate-400">₹</span><input type="number" min="0" value={selectedHeads[head.key]} onChange={(event) => setSelectedHeads((current) => ({ ...current, [head.key]: event.target.value }))} disabled={!selectedHeads[head.key]} className="h-9 w-full bg-transparent pr-3 text-right text-sm font-semibold text-slate-900 outline-none disabled:text-slate-400" /></div></div>)}</div></div>
        </div>

        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="text-lg font-bold text-slate-950">3. Payment summary</h3><p className="mt-1 text-sm text-slate-500">Review the receipt total before posting.</p></div><div className="space-y-3 border-b border-slate-200 pb-4 text-sm"><div className="flex justify-between text-slate-600"><span>Fee heads subtotal</span><span className="font-semibold text-slate-900">{money(subtotal)}</span></div><label className="flex items-center justify-between gap-4 text-slate-600"><span>Discount / concession</span><input type="number" min="0" value={discount} onChange={(event) => setDiscount(event.target.value)} className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-right text-sm text-slate-900 outline-none focus:border-emerald-500" /></label><label className="flex items-center justify-between gap-4 text-slate-600"><span>Late fine</span><input type="number" min="0" value={fine} onChange={(event) => setFine(event.target.value)} className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-right text-sm text-slate-900 outline-none focus:border-emerald-500" /></label></div><div className="rounded-xl bg-slate-950 p-4 text-white"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Amount payable</p><p className="mt-2 text-3xl font-bold">{money(total)}</p><p className="mt-1 text-xs text-slate-400">Includes applicable fine, after discount</p></div><div><p className="mb-3 text-sm font-bold text-slate-800">Payment method</p><div className="grid grid-cols-2 gap-2">{PAYMENT_METHODS.map(({ value, label, icon: Icon }) => <button type="button" key={value} onClick={() => setPaymentMethod(value)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${paymentMethod === value ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}><Icon size={16} />{label}</button>)}</div></div><input value={reference} onChange={(event) => setReference(event.target.value)} placeholder={`${paymentMethod} reference / transaction ID`} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500" /><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional collection notes" rows="2" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /><button type="submit" disabled={collectMutation.isPending || !selectedStudent} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Receipt size={18} />{collectMutation.isPending ? 'Posting payment...' : 'Collect fee & generate receipt'}</button></div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-lg font-bold text-slate-950"><History size={19} /> Recent collections</h3><p className="mt-1 text-sm text-slate-500">Latest receipts posted by the fee desk.</p></div><button type="button" className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><Download size={15} /> Export</button></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="pb-3">Receipt</th><th className="pb-3">Student</th><th className="pb-3">Mode</th><th className="pb-3">Amount</th><th className="pb-3">Status</th></tr></thead><tbody>{recentPayments.length ? recentPayments.map((payment) => <tr key={payment.id} className="border-b border-slate-100 last:border-0"><td className="py-3 font-semibold text-slate-800">{payment.receiptNumber || payment.paymentId || payment.id}</td><td className="py-3 text-slate-600">{payment.studentName || payment.studentId}</td><td className="py-3 text-slate-600">{payment.method || payment.paymentMethod || 'Cash'}</td><td className="py-3 font-semibold text-slate-800">{money(payment.amount)}</td><td className="py-3"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{payment.status || 'Paid'}</span></td></tr>) : <tr><td colSpan="5" className="py-8 text-center text-sm text-slate-500">No recent collections found.</td></tr>}</tbody></table></div></div>
    </div>
  );
}
