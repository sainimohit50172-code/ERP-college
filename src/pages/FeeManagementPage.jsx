import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useResourceList,
  useBulkImport,
  useBulkExport,
} from '../hooks/useResourceHooks';
import {
  FaDownload,
  FaFileImport,
  FaPlus,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { createPayment, cancelPayment } from '../services/paymentService.js';
import { downloadReceiptPdf } from '../services/receiptService.js';
import { calculateStudentLedger } from '../services/feeService.js';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const defaultPaymentValues = {
  studentId: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  method: 'Cash',
  status: 'Paid',
  installmentNumber: '',
  scholarshipAmount: 0,
  discountAmount: 0,
  waiverAmount: 0,
  fine: 0,
  notes: '',
};

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString()}`;
}

function normalizeSearchValue(value) {
  return String(value || '').toLowerCase();
}

export default function FeeManagementPage() {
  const importInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: paymentsData } = useResourceList('payments', { page: 1, pageSize: 200 });
  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 200 });
  const { data: receiptsData } = useResourceList('receipts', { page: 1, pageSize: 200 });
  const { data: scholarshipsData } = useResourceList('scholarships', { page: 1, pageSize: 200 });

  const payments = paymentsData?.items || [];
  const students = studentsData?.items || [];
  const receipts = receiptsData?.items || [];
  const scholarships = scholarshipsData?.items || [];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const pageSize = 6;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultPaymentValues });

  const selectedStudent = students.find((student) => student.id === selectedStudentId) || null;

  const studentMap = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);

  const filteredPayments = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(search);

    return payments.filter((payment) => {
      const student = studentMap.get(payment.studentId) || {};
      const studentName = normalizeSearchValue(student.name);
      const admissionNo = normalizeSearchValue(student.enrollmentNo);
      const receiptNumber = normalizeSearchValue(payment.receiptNumber);
      const status = normalizeSearchValue(payment.status);
      const method = normalizeSearchValue(payment.method);
      const courseId = student.courseId || '';
      const departmentId = student.departmentId || '';

      const matchesSearch = [studentName, admissionNo, receiptNumber, method, status, payment.paymentId, payment.id]
        .filter(Boolean)
        .some((field) => normalizeSearchValue(field).includes(normalizedQuery));

      const matchesStatus = statusFilter === 'All' || normalizeSearchValue(statusFilter) === status;
      const matchesCourse = courseFilter === 'All' || courseFilter === courseId;
      const matchesDepartment = departmentFilter === 'All' || departmentFilter === departmentId;

      return matchesSearch && matchesStatus && matchesCourse && matchesDepartment;
    });
  }, [payments, search, statusFilter, courseFilter, departmentFilter, studentMap]);

  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const displayedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  const paymentSummary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const monthly = new Date().getMonth();
    const year = new Date().getFullYear();

    return payments.reduce(
      (summary, payment) => {
        const paidValue = Number(payment.amount || 0);
        const scholarshipValue = Number(payment.scholarshipAmount || 0);
        const fineValue = Number(payment.fine || 0);
        const dateValue = payment.paidAt || payment.date || payment.createdAt || '';
        const paidAt = new Date(dateValue);
        const paidDateKey = paidAt.toISOString().slice(0, 10);

        if (payment.status === 'Paid') {
          summary.totalCollection += paidValue;
          summary.paidTransactions += 1;
          summary.scholarshipTotal += scholarshipValue;
          summary.fineCollected += fineValue;
          if (paidDateKey === today) summary.todaysCollection += paidValue;
          if (paidAt.getMonth() === monthly && paidAt.getFullYear() === year) summary.monthlyCollection += paidValue;
        }

        if (payment.status === 'Pending') {
          summary.pendingAmount += paidValue;
        }

        if (payment.status === 'Pending' && payment.dueDate) {
          const dueDate = new Date(payment.dueDate);
          if (dueDate < new Date()) {
            summary.overdueStudents.add(payment.studentId);
          }
        }

        return summary;
      },
      {
        totalCollection: 0,
        paidTransactions: 0,
        monthlyCollection: 0,
        todaysCollection: 0,
        pendingAmount: 0,
        scholarshipTotal: 0,
        fineCollected: 0,
        overdueStudents: new Set(),
      },
    );
  }, [payments]);

  const studentPayments = useMemo(
    () => (selectedStudent ? payments.filter((payment) => payment.studentId === selectedStudent.id) : []),
    [payments, selectedStudent],
  );
  const studentScholarships = useMemo(
    () => (selectedStudent ? scholarships.filter((scholarship) => scholarship.studentId === selectedStudent.id) : []),
    [scholarships, selectedStudent],
  );

  const studentLedger = useMemo(() => {
    if (!selectedStudent) return null;
    return calculateStudentLedger(selectedStudent, studentPayments, studentScholarships);
  }, [selectedStudent, studentPayments, studentScholarships]);

  const createPaymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['receipts']);
      queryClient.invalidateQueries(['students']);
      setImportStatus('Payment recorded successfully.');
    },
  });

  const cancelPaymentMutation = useMutation({
    mutationFn: cancelPayment,
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      setImportStatus('Payment cancelled and audit logged.');
    },
  });


  const importPayments = useBulkImport('payments');
  const exportPayments = useBulkExport('payments');

  const handleImport = (file) => {
    if (!file) return;
    setImportStatus('Importing payments…');
    const formData = new FormData();
    formData.append('file', file);
    importPayments.mutate(formData, {
      onSuccess: () => setImportStatus('Payments imported successfully.'),
      onError: () => setImportStatus('Import failed. Please check the CSV format and try again.'),
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleImport(file);
    event.target.value = '';
  };

  const handleExport = async () => {
    try {
      const blob = await exportPayments.mutateAsync();
      downloadBlob(blob, 'payments-export.xlsx');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitPayment = async (data) => {
    const student = students.find((item) => item.id === data.studentId);
    const paymentPayload = {
      ...data,
      studentName: student?.name || '',
      departmentId: student?.departmentId || '',
      courseId: student?.courseId || '',
      receiptNumber: data.receiptNumber || undefined,
      paymentId: data.paymentId || undefined,
    };
    await createPaymentMutation.mutateAsync(paymentPayload, {
      onSuccess: () => {
        reset(defaultPaymentValues);
        setPage(1);
        setIsModalOpen(false);
      },
    });
  };

  const handleCancelPayment = (id) => {
    cancelPaymentMutation.mutate(id);
  };

  const handleDownloadReceipt = async (receipt) => {
    try {
      const blob = await downloadReceiptPdf(receipt);
      downloadBlob(blob, `${receipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error(error);
    }
  };

  const courseOptions = useMemo(
    () => ['All', ...Array.from(new Set(students.map((student) => student.courseId).filter(Boolean)))],
    [students],
  );
  const departmentOptions = useMemo(
    () => ['All', ...Array.from(new Set(students.map((student) => student.departmentId).filter(Boolean)))],
    [students],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fee management"
        subtitle="Manage fee collections, overdue balances, receipts and payment reconciliation."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"
            >
              <FaDownload /> Export fees
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <FaFileImport /> Import CSV
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              <FaPlus /> Record payment
            </button>
          </div>
        }
      />

      <input ref={importInputRef} type="file" accept=".csv" className="hidden hover-gradient-border" onChange={handleFileChange} />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Today&apos;s collection</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(paymentSummary.todaysCollection)}</p>
        </div>
        <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Monthly collection</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(paymentSummary.monthlyCollection)}</p>
        </div>
        <div className="hover-gradient-border rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pending amount</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(paymentSummary.pendingAmount)}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Overdue students</p>
          <p className="mt-3 text-2xl font-semibold text-white">{paymentSummary.overdueStudents.size}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Scholarship total</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(paymentSummary.scholarshipTotal)}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Fine collected</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(paymentSummary.fineCollected)}</p>
        </div>
      </div>

      {importStatus && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">{importStatus}</div>
      )}

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Fee ledger</h2>
            <p className="text-sm text-slate-400">Review receipts, reconcile pending dues, and keep fee records audit-ready.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SearchFilter search={search} onSearch={setSearch} filter={statusFilter} onFilter={setStatusFilter} options={statusOptions} />
            <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-3 shadow-sm">
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.24em] text-slate-500">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200/70 bg-slate-50 px-3 text-sm text-slate-900 outline-none"
              >
                {courseOptions.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-3 shadow-sm">
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.24em] text-slate-500">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200/70 bg-slate-50 px-3 text-sm text-slate-900 outline-none"
              >
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total collection</p>
            <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(paymentSummary.totalCollection)}</p>
            <p className="text-sm text-slate-400">{paymentSummary.paidTransactions} paid receipts</p>
          </div>
          <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total pending</p>
            <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(paymentSummary.pendingAmount)}</p>
            <p className="text-sm text-slate-400">Pending payments awaiting collection</p>
          </div>
          <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Overdue</p>
            <p className="mt-3 text-2xl font-semibold text-white">{paymentSummary.overdueStudents.size}</p>
            <p className="text-sm text-slate-400">Students with overdue fee installments</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-[20px] border border-slate-700/60 bg-slate-900/80">
          <DataTable
            compact
            columns={['Student', 'Admission No', 'Receipt', 'Amount', 'Date', 'Status', 'Actions']}
            rows={displayedPayments.map((payment) => {
              const student = studentMap.get(payment.studentId) || {};
              return [
                <div key={payment.id} className="space-y-1">
                  <p className="font-semibold text-white">{student.name || 'Unknown'}</p>
                  <p className="text-sm text-slate-400">{student.courseId || student.departmentId || 'N/A'}</p>
                </div>,
                student.enrollmentNo || 'N/A',
                payment.receiptNumber || payment.paymentId || 'N/A',
                formatCurrency(payment.amount),
                payment.paidAt?.slice(0, 10) || payment.date || 'N/A',
                <StatusBadge key={`${payment.id}-status`} status={payment.status || 'Pending'} />,
                <div key={`${payment.id}-actions`} className="flex flex-wrap gap-2">
                  <button
                    key={`${payment.id}-receipt`}
                    type="button"
                    onClick={() => payment.receiptNumber && handleDownloadReceipt(receipts.find((receipt) => receipt.receiptNumber === payment.receiptNumber) || { receiptNumber: payment.receiptNumber, studentName: student.name, amount: payment.amount, paymentMethod: payment.method, date: payment.paidAt?.slice(0, 10) || payment.date })}
                    className="rounded-full bg-slate-700 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-600"
                  >
                    Receipt
                  </button>
                  {payment.status !== 'Cancelled' && (
                    <button
                      key={`${payment.id}-cancel`}
                      type="button"
                      onClick={() => handleCancelPayment(payment.id)}
                      className="rounded-full bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>,
              ];
            })}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Student fee ledger</h2>
            <p className="text-sm text-slate-400">Select a student to review their fee balance, scholarship, and installment history.</p>
          </div>
          <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-3 shadow-sm">
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.24em] text-slate-500">Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200/70 bg-slate-50 px-3 text-sm text-slate-900 outline-none"
            >
              <option value="">Choose a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name} · {student.enrollmentNo}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedStudent ? (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total fee</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(studentLedger?.totalFee)}</p>
            </div>
            <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Paid</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(studentLedger?.paidAmount)}</p>
            </div>
            <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Outstanding balance</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(studentLedger?.balance)}</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4 text-sm text-slate-300">
            Select a student to see their ledger details and installment history.
          </div>
        )}

        {selectedStudent && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Scholarship</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(studentLedger?.scholarshipAmount)}</p>
            </div>
            <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Discount / waiver</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(studentLedger?.waiver)}</p>
            </div>
            <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fine</p>
              <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(studentLedger?.fine)}</p>
            </div>
          </div>
        )}

        {selectedStudent && (
          <div className="mt-4 overflow-x-auto rounded-[20px] border border-slate-700/60 bg-slate-900/80">
            <DataTable
              compact
              columns={['Receipt', 'Amount', 'Installment', 'Status', 'Date']}
              rows={studentPayments.map((payment) => [
                payment.receiptNumber || payment.paymentId,
                formatCurrency(payment.amount),
                payment.installmentNumber || 'N/A',
                <StatusBadge key={`${payment.id}-status`} status={payment.status || 'Pending'} />,
                payment.paidAt?.slice(0, 10) || payment.date || 'N/A',
              ])}
            />
          </div>
        )}
      </div>

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Reports</h2>
            <p className="text-sm text-slate-400">Generate daily, monthly, outstanding, scholarship and fine reports for fee operations.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover-gradient-border">Daily report</button>
            <button type="button" className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover-gradient-border">Monthly report</button>
            <button type="button" className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover-gradient-border">Outstanding report</button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Payment history</p>
            <p className="mt-3 text-2xl font-semibold text-white">{payments.length}</p>
            <p className="text-sm text-slate-400">Total recorded payment actions</p>
          </div>
          <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Receipts</p>
            <p className="mt-3 text-2xl font-semibold text-white">{receipts.length}</p>
            <p className="text-sm text-slate-400">Generated payment receipts</p>
          </div>
          <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Scholarships</p>
            <p className="mt-3 text-2xl font-semibold text-white">{scholarships.length}</p>
            <p className="text-sm text-slate-400">Scholarship adjustments available</p>
          </div>
        </div>
      </div>

      <Modal
        title="Record fee payment"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmit(handleSubmitPayment)}
            disabled={isSubmitting || createPaymentMutation.isLoading}
            className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60 hover-gradient-border"
          >
            Save payment
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Student">
            <select
              {...register('studentId', { required: 'Student is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name} · {student.enrollmentNo}</option>
              ))}
            </select>
            {errors.studentId && <p className="mt-1 text-sm text-rose-400">{errors.studentId.message}</p>}
          </FormField>
          <FormField label="Amount">
            <input
              type="number"
              {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Enter a valid amount' } })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
              placeholder="0"
            />
            {errors.amount && <p className="mt-1 text-sm text-rose-400">{errors.amount.message}</p>}
          </FormField>
          <FormField label="Scholarship adjustment">
            <input
              type="number"
              {...register('scholarshipAmount')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
              placeholder="0"
            />
          </FormField>
          <FormField label="Discount / waiver">
            <input
              type="number"
              {...register('waiverAmount')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
              placeholder="0"
            />
          </FormField>
          <FormField label="Fine / late fee">
            <input
              type="number"
              {...register('fine')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
              placeholder="0"
            />
          </FormField>
          <FormField label="Discount amount">
            <input
              type="number"
              {...register('discountAmount')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
              placeholder="0"
            />
          </FormField>
          <FormField label="Installment number">
            <input
              type="text"
              {...register('installmentNumber')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
              placeholder="1/3"
            />
          </FormField>
          <FormField label="Payment date">
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
            />
            {errors.date && <p className="mt-1 text-sm text-rose-400">{errors.date.message}</p>}
          </FormField>
          <FormField label="Payment method">
            <select
              {...register('method', { required: 'Method is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </FormField>
          <FormField label="Notes">
            <textarea
              {...register('notes')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"
              rows={4}
              placeholder="Payment notes or reference"
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
