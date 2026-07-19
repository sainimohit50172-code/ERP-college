import { useEffect, useMemo, useState } from 'react';
import { Download, Filter, Plus, Trash2, X } from 'lucide-react';
import ViewButton from '../components/ui/ViewButton.jsx';

const today = new Date().toISOString().slice(0, 10);

const SAMPLE_TRANSACTIONS = [
  {
    id: 1,
    applicationNumber: 'HU-2026-27/4517',
    studentName: 'KIMAYA BALASUBRAMANIAN',
    college: 'Roorkee College of Engineering',
    course: 'B.Sc. Computer Science',
    amount: 32500,
    paymentMode: 'Online',
    voucherStatus: 'TRUE',
    status: 'CONFIRM',
    transactionDate: '2026-07-04',
    voucherNo: 'VCH-20260704-001',
    transactionId: 'TXN-1001',
    details: 'Paid via UPI. Receipt #RCPT-1001. Remarks: Admission fee received.',
  },
  {
    id: 2,
    applicationNumber: 'HU-2026-27/4516',
    studentName: 'HRISHITA ACHARYA',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA Cyber Security',
    amount: 24500,
    paymentMode: 'Cash',
    voucherStatus: 'FALSE',
    status: 'CANCELLED',
    transactionDate: '2026-07-06',
    voucherNo: 'VCH-20260706-018',
    transactionId: 'TXN-1002',
    details: 'Cash payment pending voucher approval. Remarks: Pending document verification.',
  },
  {
    id: 3,
    applicationNumber: 'HU-2026-27/4515',
    studentName: 'ZAINA ANNE',
    college: 'Roorkee College of Allied Health Sciences',
    course: 'B.Sc. Nursing',
    amount: 42000,
    paymentMode: 'Cheque',
    voucherStatus: 'TRUE',
    status: 'CONFIRM',
    transactionDate: '2026-07-08',
    voucherNo: 'VCH-20260708-025',
    transactionId: 'TXN-1003',
    details: 'Cheque cleared. Receipt #RCPT-1003. Remarks: Scholarship adjustment applied.',
  },
];

const SESSION_OPTIONS = ['2026-27 Odd', '2026-27 Even', '2025-26 Odd'];
const STATUS_OPTIONS = ['CONFIRM', 'CANCELLED'];
const VOUCHER_OPTIONS = ['TRUE', 'FALSE'];
const PAYMENT_MODES = ['Online', 'Cash', 'Cheque', 'Card'];

const STATUS_STYLES = {
  CONFIRM: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const VOUCHER_STYLES = {
  TRUE: 'bg-emerald-100 text-emerald-800',
  FALSE: 'bg-red-100 text-red-800',
};

export default function AdmissionTransactionsPage() {
  const [session, setSession] = useState('2026-27 Odd');
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [searchText, setSearchText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filterState, setFilterState] = useState({
    startDate: '2026-07-03',
    endDate: '2026-07-10',
    status: '',
    voucherStatus: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filterState);

  const [newTransaction, setNewTransaction] = useState({
    applicationNumber: '',
    studentName: '',
    college: '',
    course: '',
    amount: '',
    paymentMode: 'Online',
    voucherStatus: 'TRUE',
    status: 'CONFIRM',
    transactionDate: today,
    voucherNo: '',
    transactionId: '',
    details: '',
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !searchText ||
        tx.applicationNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.voucherNo.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.transactionId.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = !appliedFilters.status || tx.status === appliedFilters.status;
      const matchesVoucher = !appliedFilters.voucherStatus || tx.voucherStatus === appliedFilters.voucherStatus;
      const dateValue = new Date(tx.transactionDate).getTime();
      const fromValue = new Date(appliedFilters.startDate).getTime();
      const toValue = new Date(appliedFilters.endDate).getTime();
      const matchesDate = !appliedFilters.startDate || !appliedFilters.endDate || (dateValue >= fromValue && dateValue <= toValue);

      return matchesSearch && matchesStatus && matchesVoucher && matchesDate;
    });
  }, [transactions, searchText, appliedFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, appliedFilters]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = () => setIsFilterOpen(false);

  const handleApplyFilter = () => {
    setAppliedFilters(filterState);
    setIsFilterOpen(false);
  };

  const handleClearFilter = () => {
    const reset = { startDate: '2026-07-03', endDate: '2026-07-10', status: '', voucherStatus: '' };
    setFilterState(reset);
    setAppliedFilters(reset);
    setIsFilterOpen(false);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsViewOpen(true);
  };

  const handleDeleteTransaction = (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setTransactions((prev) => prev.filter((tx) => tx.transactionId !== transactionId));
  };

  const handleAddTransaction = () => {
    if (!newTransaction.applicationNumber.trim() || !newTransaction.studentName.trim() || !newTransaction.amount) {
      alert('Please fill in application number, student name, and amount.');
      return;
    }

    const nextId = transactions.length ? Math.max(...transactions.map((tx) => tx.id)) + 1 : 1;
    setTransactions((prev) => [
      {
        id: nextId,
        ...newTransaction,
      },
      ...prev,
    ]);
    setIsAddOpen(false);
    setNewTransaction({
      applicationNumber: '',
      studentName: '',
      college: '',
      course: '',
      amount: '',
      paymentMode: 'Online',
      voucherStatus: 'TRUE',
      status: 'CONFIRM',
      transactionDate: today,
      voucherNo: '',
      transactionId: '',
      details: '',
    });
  };

  const exportToExcel = () => {
    const headers = [
      'S.No',
      'Application Number',
      'Student Name',
      'College',
      'Course',
      'Amount',
      'Payment Mode',
      'Voucher Status',
      'Status',
      'Transaction Date',
      'Voucher No',
      'Transaction ID',
    ];
    const rows = filteredTransactions.map((tx, index) => [
      index + 1,
      tx.applicationNumber,
      tx.studentName,
      tx.college,
      tx.course,
      tx.amount,
      tx.paymentMode,
      tx.voucherStatus,
      tx.status,
      tx.transactionDate,
      tx.voucherNo,
      tx.transactionId,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'admission-transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-900">
      <div className="w-full max-w-full pb-10 pt-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="text-sm uppercase tracking-[0.28em] text-slate-500">
              Dashboard <span className="mx-2">&gt;</span> Transaction
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold text-slate-950">Transaction</h1>
              <span className="text-sm font-medium text-slate-500">| Transactions Details</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
              <label htmlFor="session" className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                Select Session
              </label>
              <select
                id="session"
                value={session}
                onChange={(event) => setSession(event.target.value)}
                className="mt-2 w-full bg-transparent text-sm text-slate-900 outline-none"
              >
                {SESSION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-200 transition hover:bg-slate-800"
            >
              <Plus size={16} /> Add Transaction
            </button>
            <button
              type="button"
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              <Download size={16} /> Export To Excel
            </button>
            <button
              type="button"
              onClick={openFilter}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="block text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Search</label>
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search"
              className="w-full max-w-md bg-transparent border-b border-slate-300 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="w-[4%] px-3 py-4 text-left font-semibold">S.No</th>
                  <th className="w-[12%] px-3 py-4 text-left font-semibold">Application Number</th>
                  <th className="w-[15%] px-3 py-4 text-left font-semibold">Student Name</th>
                  <th className="w-[14%] px-3 py-4 text-left font-semibold">College</th>
                  <th className="w-[12%] px-3 py-4 text-left font-semibold">Course</th>
                  <th className="w-[8%] px-3 py-4 text-left font-semibold">Amount</th>
                  <th className="w-[10%] px-3 py-4 text-left font-semibold">Payment Mode</th>
                  <th className="w-[9%] px-3 py-4 text-left font-semibold">Voucher Status</th>
                  <th className="w-[9%] px-3 py-4 text-left font-semibold">Status</th>
                  <th className="w-[11%] px-3 py-4 text-left font-semibold">Transaction Date</th>
                  <th className="w-[8%] px-3 py-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-14 text-center text-sm text-slate-500">
                      No Records found!
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx, index) => (
                    <tr key={tx.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-3 text-slate-700">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-3 py-3 text-slate-700 break-words">{tx.applicationNumber}</td>
                      <td className="px-3 py-3 text-slate-700 break-words">{tx.studentName}</td>
                      <td className="px-3 py-3 text-slate-700 break-words">{tx.college}</td>
                      <td className="px-3 py-3 text-slate-700 break-words">{tx.course}</td>
                      <td className="px-3 py-3 text-slate-700">₹{tx.amount.toLocaleString()}</td>
                      <td className="px-3 py-3 text-slate-700">{tx.paymentMode}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${VOUCHER_STYLES[tx.voucherStatus]}`}>
                          {tx.voucherStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_STYLES[tx.status]}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{tx.transactionDate}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <ViewButton
                            title="View transaction"
                            ariaLabel="View transaction"
                            onClick={() => handleViewTransaction(tx)}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.transactionId)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600 transition hover:bg-red-200"
                            title="Delete transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Items Per Page:</span>
              <select
                value={itemsPerPage}
                onChange={(event) => {
                  setItemsPerPage(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>
                {filteredTransactions.length === 0 ? '0' : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span className="min-w-[80px] text-center">Page {currentPage} of {pageCount}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
                  disabled={currentPage === pageCount}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Transaction</h2>
                <p className="mt-1 text-sm text-slate-500">Filter transactions by date and status.</p>
              </div>
              <button
                type="button"
                onClick={closeFilter}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-6 h-px bg-slate-200" />
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span>Date & Status</span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">i</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Enter Start Date</label>
                <input
                  type="date"
                  value={filterState.startDate}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, startDate: event.target.value }))}
                  placeholder="03/07/2026"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Enter End Date</label>
                <input
                  type="date"
                  value={filterState.endDate}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, endDate: event.target.value }))}
                  placeholder="10/07/2026"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Select Status</label>
                <select
                  value={filterState.status}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, status: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Voucher Status</label>
                <select
                  value={filterState.voucherStatus}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, voucherStatus: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Voucher Status</option>
                  {VOUCHER_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeFilter}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Go →
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Transaction Details</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedTransaction.transactionId}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Application Number', selectedTransaction.applicationNumber],
                ['Student Name', selectedTransaction.studentName],
                ['College', selectedTransaction.college],
                ['Course', selectedTransaction.course],
                ['Amount', `₹${selectedTransaction.amount.toLocaleString()}`],
                ['Payment Mode', selectedTransaction.paymentMode],
                ['Voucher Status', selectedTransaction.voucherStatus],
                ['Status', selectedTransaction.status],
                ['Voucher No', selectedTransaction.voucherNo],
                ['Transaction Date', selectedTransaction.transactionDate],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Remarks</div>
              <div className="mt-2 whitespace-pre-line">{selectedTransaction.details}</div>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Add Transaction</h2>
                <p className="mt-1 text-sm text-slate-500">Create a new admission transaction record.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Application Number</label>
                <input
                  type="text"
                  value={newTransaction.applicationNumber}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, applicationNumber: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Student Name</label>
                <input
                  type="text"
                  value={newTransaction.studentName}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, studentName: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">College</label>
                <input
                  type="text"
                  value={newTransaction.college}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, college: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Course</label>
                <input
                  type="text"
                  value={newTransaction.course}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, course: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Amount</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, amount: Number(event.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Payment Mode</label>
                <select
                  value={newTransaction.paymentMode}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, paymentMode: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Voucher Status</label>
                <select
                  value={newTransaction.voucherStatus}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, voucherStatus: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {VOUCHER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
                <select
                  value={newTransaction.status}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, status: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Transaction Date</label>
                <input
                  type="date"
                  value={newTransaction.transactionDate}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, transactionDate: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Voucher No</label>
                <input
                  type="text"
                  value={newTransaction.voucherNo}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, voucherNo: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Transaction ID</label>
                <input
                  type="text"
                  value={newTransaction.transactionId}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, transactionId: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTransaction}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-[#f5f6fa] px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
        © 2026 Okie Dokie - Campus Automation Partner
      </footer>
    </div>
  );
}
