import { useMemo, useState } from 'react';
import { Filter, X } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);

const SAMPLE_COLLECTIONS = [
  {
    id: 1,
    transactionDate: '2026-07-03',
    session: '2026-27 Odd',
    applicationNumber: 'HU-2026-27/4517',
    studentName: 'KIMAYA BALASUBRAMANIAN',
    college: 'Roorkee College of Engineering',
    course: 'B.Sc. Computer Science',
    amount: 32500,
    paymentMode: 'Online',
    voucherStatus: 'TRUE',
    status: 'CONFIRM',
    transactionId: 'TXN-1001',
  },
  {
    id: 2,
    transactionDate: '2026-07-04',
    session: '2026-27 Odd',
    applicationNumber: 'HU-2026-27/4516',
    studentName: 'HRISHITA ACHARYA',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA Cyber Security',
    amount: 24500,
    paymentMode: 'Cash',
    voucherStatus: 'FALSE',
    status: 'CANCELLED',
    transactionId: 'TXN-1002',
  },
  {
    id: 3,
    transactionDate: '2026-07-05',
    session: '2026-27 Odd',
    applicationNumber: 'HU-2026-27/4515',
    studentName: 'ZAINA ANNE',
    college: 'Roorkee College of Allied Health Sciences',
    course: 'B.Sc. Nursing',
    amount: 42000,
    paymentMode: 'Cheque',
    voucherStatus: 'TRUE',
    status: 'CONFIRM',
    transactionId: 'TXN-1003',
  },
];

const SESSION_OPTIONS = ['2026-27 Odd', '2026-27 Even', '2025-26 Odd'];
const COURSE_OPTIONS = [
  'B.Sc. Computer Science',
  'BCA Cyber Security',
  'B.Sc. Nursing',
  'BBA Marketing',
];
const PAYMENT_MODES = ['Online', 'Cash', 'Cheque', 'Card'];
const STATUS_OPTIONS = ['CONFIRM', 'CANCELLED'];
const VOUCHER_OPTIONS = ['TRUE', 'FALSE'];

const STATUS_STYLES = {
  CONFIRM: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const VOUCHER_STYLES = {
  TRUE: 'bg-emerald-100 text-emerald-800',
  FALSE: 'bg-red-100 text-red-800',
};

export default function DailyCollectionReportPage() {
  const [searchText, setSearchText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterState, setFilterState] = useState({
    startDate: '2026-07-03',
    endDate: '2026-07-10',
    paymentMode: '',
    status: 'CONFIRM',
    course: '',
    session: '2026-27 Odd',
  });
  const [appliedFilters, setAppliedFilters] = useState(filterState);
  const [collections] = useState(SAMPLE_COLLECTIONS);

  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.applicationNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        item.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.transactionId.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = !appliedFilters.status || item.status === appliedFilters.status;
      const matchesPaymentMode = !appliedFilters.paymentMode || item.paymentMode === appliedFilters.paymentMode;
      const matchesCourse = !appliedFilters.course || item.course === appliedFilters.course;
      const matchesSession = !appliedFilters.session || item.session === appliedFilters.session;
      const dateValue = new Date(item.transactionDate).getTime();
      const fromValue = new Date(appliedFilters.startDate).getTime();
      const toValue = new Date(appliedFilters.endDate).getTime();
      const matchesDate = !appliedFilters.startDate || !appliedFilters.endDate || (dateValue >= fromValue && dateValue <= toValue);

      return matchesSearch && matchesStatus && matchesPaymentMode && matchesCourse && matchesSession && matchesDate;
    });
  }, [collections, searchText, appliedFilters]);

  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = () => setIsFilterOpen(false);

  const handleApplyFilter = () => {
    setAppliedFilters(filterState);
    closeFilter();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 text-slate-900">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Dashboard <span className="mx-2">&gt;</span> Admission Reports <span className="mx-2">&gt;</span> Daily Collection Report
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold text-slate-950">Daily Collection Reports</h1>
            <span className="text-sm font-medium text-slate-500">Daily Collection Report</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openFilter}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-navy px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-navy-dark"
          >
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_280px]">
          <div>
            <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex items-end justify-end">
            <div className="text-sm text-slate-500">
              Search by Application No, Student Name, or Transaction ID
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm text-slate-700">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="bg-primary-navy text-white">
              <tr>
                <th className="px-3 py-4 text-left font-semibold">S.No</th>
                <th className="px-3 py-4 text-left font-semibold">Transaction Date</th>
                <th className="px-3 py-4 text-left font-semibold">Application Number</th>
                <th className="px-3 py-4 text-left font-semibold">Student Name</th>
                <th className="px-3 py-4 text-left font-semibold">College</th>
                <th className="px-3 py-4 text-left font-semibold">Course</th>
                <th className="px-3 py-4 text-left font-semibold">Amount</th>
                <th className="px-3 py-4 text-left font-semibold">Payment Mode</th>
                <th className="px-3 py-4 text-left font-semibold">Voucher Status</th>
                <th className="px-3 py-4 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-16 text-center text-sm text-slate-500">
                    No Records found !
                  </td>
                </tr>
              ) : (
                filteredCollections.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-3 py-4 text-slate-700">{index + 1}</td>
                    <td className="px-3 py-4 text-slate-700">{item.transactionDate}</td>
                    <td className="px-3 py-4 text-slate-900 font-semibold break-words">{item.applicationNumber}</td>
                    <td className="px-3 py-4 text-slate-900 break-words">{item.studentName}</td>
                    <td className="px-3 py-4 text-slate-700 break-words">{item.college}</td>
                    <td className="px-3 py-4 text-slate-700 break-words">{item.course}</td>
                    <td className="px-3 py-4 text-slate-700">₹{item.amount.toLocaleString()}</td>
                    <td className="px-3 py-4 text-slate-700">{item.paymentMode}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${VOUCHER_STYLES[item.voucherStatus]}`}>
                        {item.voucherStatus}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Transaction</h2>
                <p className="mt-1 text-sm text-slate-500">Filter collection records by date and status.</p>
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
              <span>Date & Status Details</span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">i</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Enter Start Date</label>
                <input
                  type="date"
                  value={filterState.startDate}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, startDate: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Enter End Date</label>
                <input
                  type="date"
                  value={filterState.endDate}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, endDate: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Select Payment Mode</label>
                <select
                  value={filterState.paymentMode}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, paymentMode: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select Payment Mode</option>
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
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
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-8 mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span>Class Information</span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">i</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Select Courses</label>
                <select
                  value={filterState.course}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, course: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select Courses</option>
                  {COURSE_OPTIONS.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Select Session</label>
                <select
                  value={filterState.session}
                  onChange={(event) => setFilterState((prev) => ({ ...prev, session: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select Session</option>
                  {SESSION_OPTIONS.map((sessionOption) => (
                    <option key={sessionOption} value={sessionOption}>{sessionOption}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeFilter}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="rounded-2xl bg-primary-navy px-6 py-3 text-sm font-semibold text-white hover:bg-primary-navy-dark"
              >
                Go →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
