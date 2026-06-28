import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useResourceList,
  useCreateResource,
  useBulkImport,
  useBulkExport,
} from '../hooks/useResourceHooks';
import {
  FaDownload,
  FaFileImport,
  FaPlus,
  FaSearch,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { usePermissions } from '../services/permissionHelpers.js';

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
  method: 'Online',
  status: 'Paid',
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

export default function FeeManagementPage() {
  const importInputRef = useRef(null);

  const { data: feePaymentsData } = useResourceList('feePayments', { page: 1, pageSize: 200 });
  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 200 });
  const feePayments = feePaymentsData?.items || [];
  const students = studentsData?.items || [];

  const createFeePayment = useCreateResource('feePayments');
  const importFeePayments = useBulkImport('feePayments');
  const exportFeePayments = useBulkExport('feePayments');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 6;

  const perms = usePermissions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultPaymentValues });

  const studentMap = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);

  const filteredPayments = useMemo(() => {
    return feePayments.filter((payment) => {
      const searchTerm = search.toLowerCase();
      const studentName = studentMap.get(payment.studentId)?.name || '';
      const matchesSearch = [studentName, payment.method, payment.date, payment.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || payment.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [feePayments, filter, search, studentMap]);

  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const displayedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  const totalCollection = useMemo(
    () => feePayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0),
    [feePayments],
  );
  const pendingCount = useMemo(() => feePayments.filter((payment) => payment.status === 'Pending').length, [feePayments]);
  const paidCount = useMemo(() => feePayments.filter((payment) => payment.status === 'Paid').length, [feePayments]);
  const overdueAmount = useMemo(
    () => feePayments.reduce((sum, payment) => (payment.status === 'Pending' ? sum + (Number(payment.amount) || 0) : sum), 0),
    [feePayments],
  );

  const handleImport = (file) => {
    if (!file) return;
    setImportStatus('Importing fee payments…');
    const formData = new FormData();
    formData.append('file', file);
    importFeePayments.mutate(formData, {
      onSuccess: () => setImportStatus('Fee payments imported successfully.'),
      onError: () => setImportStatus('Import failed. Please check the CSV format and try again.'),
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleImport(file);
    event.target.value = '';
  };

  const HeaderActions = (
    <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200">
      {perms.canExport('feePayments') && <button onClick={() => exportFeePayments.mutateAsync().catch(() => {})}><FaDownload /> Export</button>}
      {perms.canImport('feePayments') && <button onClick={() => importInputRef.current?.click()} className="ml-2"><FaFileImport /> Import</button>}
      {perms.canCreate('feePayments') && <button onClick={() => setIsModalOpen(true)} className="ml-2 bg-sky-400 px-3 py-2 rounded-3xl text-slate-950"> <FaPlus /> New payment</button>}
    </div>
  );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportFeePayments.mutateAsync();
      downloadBlob(blob, 'fee-payments-export.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const onSubmit = (data) => {
    createFeePayment.mutate(data, {
      onSuccess: () => {
        reset(defaultPaymentValues);
        setPage(1);
        setIsModalOpen(false);
      },
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Fee management"
        subtitle="Manage fee collections, overdue balances, receipts and payment reconciliation."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
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

      <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total collection</p>
          <p className="mt-4 text-3xl font-semibold text-white">${totalCollection.toLocaleString()}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Paid transactions</p>
          <p className="mt-4 text-3xl font-semibold text-white">{paidCount}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pending balance</p>
          <p className="mt-4 text-3xl font-semibold text-white">${overdueAmount.toLocaleString()}</p>
        </div>
      </div>

      {importStatus && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">{importStatus}</div>
      )}

      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Fee ledger</h2>
            <p className="text-sm text-slate-400">Review receipts, reconcile pending dues, and keep fee records audit-ready.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
          </div>
        </div>

        <div className="mt-6">
          <DataTable
            columns={['Student', 'Amount', 'Date', 'Method', 'Status']}
            rows={displayedPayments.map((payment) => [
              <div key={payment.id} className="space-y-1">
                <p className="font-semibold text-white">{studentMap.get(payment.studentId)?.name || payment.studentId}</p>
                <p className="text-sm text-slate-400">{studentMap.get(payment.studentId)?.enrollmentNo || 'Enrollment pending'}</p>
              </div>,
              `$${Number(payment.amount).toLocaleString()}`,
              payment.date,
              payment.method,
              <StatusBadge key={`${payment.id}-status`} status={payment.status} />,
            ])}
          />
        </div>
        <div className="mt-6">
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </div>

      <Modal
        title="Record fee payment"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save payment
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Student">
            <select
              {...register('studentId', { required: 'Student is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
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
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="0"
            />
            {errors.amount && <p className="mt-1 text-sm text-rose-400">{errors.amount.message}</p>}
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
            {errors.date && <p className="mt-1 text-sm text-rose-400">{errors.date.message}</p>}
          </FormField>
          <FormField label="Payment method">
            <select
              {...register('method', { required: 'Method is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
