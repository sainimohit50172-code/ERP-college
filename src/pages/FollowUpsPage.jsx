import { useMemo, useState } from 'react';
import { Plus, Download, Filter, X } from 'lucide-react';
import ViewButton from '../components/ui/ViewButton.jsx';

const collegeOptions = [
  'Roorkee College of Smart Computing',
  'Roorkee College of Engineering',
  'Roorkee College of Business Studies',
  'Roorkee College of Agricultural Sciences',
  'Roorkee College of Allied Health Sciences',
];

const counselorOptions = ['Chitarekha Khara', 'Amit Sharma', 'Neha Verma', 'Priya Singh'];
const statusOptions = ['Pending', 'Completed', 'Overdue'];

const initialRows = [
  {
    id: 'FU-001',
    applicationNumber: 'HU-2026-27/3056',
    applicationDate: '12/May/2026',
    name: 'SAKSHI SRIVASTAV',
    phone: '7217236714',
    college: 'Roorkee College of Smart Computing',
    stream: 'B.Tech. Hons. CSE',
    counselor: 'Chitarekha Khara',
    createdAt: '16/May/2026',
    query: 'She is outside, call later.',
    followUpDate: '16/May/2026 17:43',
    status: 'Completed',
    completionRemark: 'Call on Monday',
    isToday: false,
    isUpcoming: false,
    isOverdue: false,
  },
  {
    id: 'FU-002',
    applicationNumber: 'HU-2026-27/2508',
    applicationDate: '12/May/2026',
    name: 'ANSHIKA PANDEY',
    phone: '8429410600',
    college: 'Roorkee College of Smart Computing',
    stream: 'B.Tech. Hons. Data Science',
    counselor: 'Chitarekha Khara',
    createdAt: '16/May/2026',
    query: 'On Monday 18 May',
    followUpDate: '18/May/2026 09:38',
    status: 'Completed',
    completionRemark: 'On Monday',
    isToday: false,
    isUpcoming: false,
    isOverdue: false,
  },
  {
    id: 'FU-003',
    applicationNumber: 'HU-2026-27/2508',
    applicationDate: '12/May/2026',
    name: 'ANSHIKA PANDEY',
    phone: '8429410600',
    college: 'Roorkee College of Smart Computing',
    stream: 'B.Tech. Hons. Data Science',
    counselor: 'Chitarekha Khara',
    createdAt: '16/May/2026',
    query: 'Not received the call',
    followUpDate: '16/May/2026 17:32',
    status: 'Completed',
    completionRemark: 'Not received call again on Monday',
    isToday: false,
    isUpcoming: false,
    isOverdue: false,
  },
  {
    id: 'FU-004',
    applicationNumber: 'HU-2026-27/2701',
    applicationDate: '13/May/2026',
    name: 'KUNDAN KUMAR',
    phone: '9856321470',
    college: 'Roorkee College of Allied Health Sciences',
    stream: 'B.Sc. Nursing',
    counselor: 'Amit Sharma',
    createdAt: '16/May/2026',
    query: 'Needs to visit campus',
    followUpDate: '19/May/2026 11:00',
    status: 'Completed',
    completionRemark: 'Ready for campus tour',
    isToday: false,
    isUpcoming: false,
    isOverdue: false,
  },
  {
    id: 'FU-005',
    applicationNumber: 'HU-2026-27/2903',
    applicationDate: '14/May/2026',
    name: 'PRIYA RANI',
    phone: '9981122334',
    college: 'Roorkee College of Business Studies',
    stream: 'B.Com',
    counselor: 'Neha Verma',
    createdAt: '16/May/2026',
    query: 'Awaiting documents',
    followUpDate: '20/May/2026 14:20',
    status: 'Pending',
    completionRemark: '',
    isToday: false,
    isUpcoming: false,
    isOverdue: false,
  },
  {
    id: 'FU-006',
    applicationNumber: 'HU-2026-27/3122',
    applicationDate: '15/May/2026',
    name: 'AMAN SHARMA',
    phone: '7012345678',
    college: 'Roorkee College of Engineering',
    stream: 'B.Tech. Hons. AI & ML',
    counselor: 'Priya Singh',
    createdAt: '16/May/2026',
    query: 'Follow up on fee confirmation',
    followUpDate: '21/May/2026 10:00',
    status: 'Pending',
    completionRemark: '',
    isToday: false,
    isUpcoming: false,
    isOverdue: false,
  },
];

const statusStyles = {
  Completed: 'bg-emerald-500 text-white',
  Pending: 'bg-amber-300 text-slate-900',
  Overdue: 'bg-rose-500 text-white',
};

const tabs = [
  { label: 'All', key: 'All' },
  { label: "Today's Follow Up", key: 'Today' },
  { label: 'Upcoming Follow Up', key: 'Upcoming' },
  { label: 'Overdue Follow Up', key: 'Overdue' },
  { label: 'Completed', key: 'Completed' },
];

function encodeCsvValue(value) {
  if (value == null) return '';
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
}

export default function FollowUpsPage() {
  const [rows, setRows] = useState(initialRows);
  const [activeTab, setActiveTab] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [filterCollege, setFilterCollege] = useState('');
  const [filterCounselor, setFilterCounselor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [newRow, setNewRow] = useState({
    applicationNumber: '',
    applicationDate: '',
    name: '',
    phone: '',
    college: collegeOptions[0],
    stream: '',
    counselor: counselorOptions[0],
    createdAt: '',
    query: '',
    followUpDate: '',
    status: 'Pending',
    completionRemark: '',
  });

  const counts = useMemo(() => {
    const all = rows.length;
    const completed = rows.filter((row) => row.status === 'Completed').length;
    const today = rows.filter((row) => row.isToday).length;
    const upcoming = rows.filter((row) => row.isUpcoming).length;
    const overdue = rows.filter((row) => row.isOverdue).length;
    return { all, completed, today, upcoming, overdue };
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Today' && row.isToday) ||
        (activeTab === 'Upcoming' && row.isUpcoming) ||
        (activeTab === 'Overdue' && row.isOverdue) ||
        (activeTab === 'Completed' && row.status === 'Completed');

      if (!matchesTab) return false;

      const query = searchText.trim().toLowerCase();
      if (query) {
        const searchValue = `${row.applicationNumber} ${row.name} ${row.phone}`.toLowerCase();
        if (!searchValue.includes(query)) return false;
      }

      if (filterCollege && row.college !== filterCollege) return false;
      if (filterCounselor && row.counselor !== filterCounselor) return false;
      if (filterStatus && row.status !== filterStatus) return false;
      if (filterStartDate && row.followUpDate) {
        const followUpDate = new Date(row.followUpDate.replace(/\//g, '-'));
        const start = new Date(filterStartDate);
        if (followUpDate < start) return false;
      }
      if (filterEndDate && row.followUpDate) {
        const followUpDate = new Date(row.followUpDate.replace(/\//g, '-'));
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        if (followUpDate > end) return false;
      }
      return true;
    });
  }, [rows, activeTab, searchText, filterCollege, filterCounselor, filterStatus, filterStartDate, filterEndDate]);

  const openViewModal = (row) => {
    setSelectedRow(row);
    setIsViewOpen(true);
  };

  const handleSaveRow = () => {
    if (!newRow.applicationNumber || !newRow.name) return;
    const nextRow = {
      ...newRow,
      id: `FU-${Date.now()}`,
      isToday: false,
      isUpcoming: false,
      isOverdue: newRow.status === 'Overdue',
    };
    setRows((prev) => [nextRow, ...prev]);
    setIsAddOpen(false);
    setNewRow({
      applicationNumber: '',
      applicationDate: '',
      name: '',
      phone: '',
      college: collegeOptions[0],
      stream: '',
      counselor: counselorOptions[0],
      createdAt: '',
      query: '',
      followUpDate: '',
      status: 'Pending',
      completionRemark: '',
    });
  };

  const handleDeleteRow = (id) => {
    if (!window.confirm('Are you sure you want to delete this follow-up?')) return;
    setRows((prev) => prev.filter((row) => row.id !== id));
    setIsViewOpen(false);
  };

  const handleUpdateSelected = () => {
    if (!selectedRow) return;
    setRows((prev) => prev.map((row) => (row.id === selectedRow.id ? selectedRow : row)));
    setIsViewOpen(false);
  };

  const downloadCsv = () => {
    const headers = [
      'S.No',
      'Application Number',
      'Application Date',
      'Name',
      'Phone',
      'College',
      'Stream',
      'Counselor Name',
      'Created At',
      'FollowUp Query',
      'FollowUp Date',
      'Status',
      'Completion Remark',
    ];
    const rowsData = filteredRows.map((row, index) => [
      index + 1,
      row.applicationNumber,
      row.applicationDate,
      row.name,
      row.phone,
      row.college,
      row.stream,
      row.counselor,
      row.createdAt,
      row.query,
      row.followUpDate,
      row.status,
      row.completionRemark,
    ]);

    const csvContent = [headers, ...rowsData]
      .map((row) => row.map(encodeCsvValue).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'follow-ups.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.28em] text-slate-500">Dashboard <span className="mx-2">&gt;</span> Admission Reports <span className="mx-2">&gt;</span> Follow Ups</div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Follow Ups</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={downloadCsv}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Download size={16} /> Export To Excel
          </button>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Filter size={16} /> Filter
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={16} /> Add Follow Up
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 sm:grid-cols-5">
          {tabs.map((tab) => {
            const count =
              tab.key === 'All'
                ? counts.all
                : tab.key === 'Today'
                ? counts.today
                : tab.key === 'Upcoming'
                ? counts.upcoming
                : tab.key === 'Overdue'
                ? counts.overdue
                : counts.completed;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div>{tab.label}</div>
                <div className="mt-1 text-xs text-slate-400">({count})</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search"
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-[13px] text-slate-700">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[9%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[13%]" />
              <col className="w-[6%]" />
            </colgroup>
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">S.No</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">Application</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">Name</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">College</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">Counselor Name</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">Created At</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">FollowUp Query</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">FollowUp Date</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">Status & Remark</th>
                <th className="whitespace-nowrap px-2 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-2 py-3 align-top text-slate-700">{index + 1}</td>
                  <td className="px-2 py-3 align-top text-slate-900">
                    <div className="mb-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">Application Number</div>
                    <button className="text-blue-600 hover:underline text-[13px]">{row.applicationNumber}</button>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">Application Date</div>
                    <button className="text-blue-600 hover:underline text-[13px]">{row.applicationDate}</button>
                  </td>
                  <td className="px-2 py-3 align-top text-slate-900">
                    <div className="mb-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">Name</div>
                    <button className="text-blue-600 font-semibold hover:underline text-[13px]">{row.name}</button>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">Phone No.</div>
                    <button className="text-blue-600 hover:underline text-[13px]">{row.phone}</button>
                  </td>
                  <td className="px-2 py-3 align-top text-slate-900 break-words">
                    <div className="mb-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">College</div>
                    <div className="font-semibold text-[13px]">{row.college}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">Stream</div>
                    <div className="font-semibold text-[13px]">{row.stream}</div>
                  </td>
                  <td className="px-2 py-3 align-top text-slate-900 text-[13px]">{row.counselor}</td>
                  <td className="px-2 py-3 align-top text-slate-900 text-[13px]">{row.createdAt}</td>
                  <td className="px-2 py-3 align-top text-slate-900 break-words text-[13px]">{row.query}</td>
                  <td className="px-2 py-3 align-top text-slate-900 text-[13px]">{row.followUpDate}</td>
                  <td colSpan="2" className="px-2 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusStyles[row.status]}`}>
                        {row.status}
                      </span>
                      {row.completionRemark && (
                        <div className="text-slate-900 break-words text-[12px] leading-5 mt-1">
                          {row.completionRemark}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 align-top text-slate-900">
                    <ViewButton
                      title="View follow-up"
                      ariaLabel="View follow-up"
                      className="rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                      onClick={() => openViewModal(row)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Filter Follow Ups</h2>
                <p className="mt-1 text-sm text-slate-500">Use advanced filters to narrow down follow-up records.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">College</label>
                <select
                  value={filterCollege}
                  onChange={(event) => setFilterCollege(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">All Colleges</option>
                  {collegeOptions.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Counselor</label>
                <select
                  value={filterCounselor}
                  onChange={(event) => setFilterCounselor(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">All Counselors</option>
                  {counselorOptions.map((counselor) => (
                    <option key={counselor} value={counselor}>{counselor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Follow Up Date Start</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(event) => setFilterStartDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Follow Up Date End</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(event) => setFilterEndDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setFilterCollege('');
                  setFilterCounselor('');
                  setFilterStatus('');
                  setFilterStartDate('');
                  setFilterEndDate('');
                }}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Add Follow Up</h2>
                <p className="mt-1 text-sm text-slate-500">Create a new follow-up record.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Application Number</label>
                <input
                  type="text"
                  value={newRow.applicationNumber}
                  onChange={(event) => setNewRow({ ...newRow, applicationNumber: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Application Date</label>
                <input
                  type="text"
                  value={newRow.applicationDate}
                  onChange={(event) => setNewRow({ ...newRow, applicationDate: event.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</label>
                <input
                  type="text"
                  value={newRow.name}
                  onChange={(event) => setNewRow({ ...newRow, name: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone Number</label>
                <input
                  type="text"
                  value={newRow.phone}
                  onChange={(event) => setNewRow({ ...newRow, phone: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">College</label>
                <select
                  value={newRow.college}
                  onChange={(event) => setNewRow({ ...newRow, college: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {collegeOptions.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Stream</label>
                <input
                  type="text"
                  value={newRow.stream}
                  onChange={(event) => setNewRow({ ...newRow, stream: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Counselor</label>
                <select
                  value={newRow.counselor}
                  onChange={(event) => setNewRow({ ...newRow, counselor: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {counselorOptions.map((counselor) => (
                    <option key={counselor} value={counselor}>{counselor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Created At</label>
                <input
                  type="text"
                  value={newRow.createdAt}
                  onChange={(event) => setNewRow({ ...newRow, createdAt: event.target.value })}
                  placeholder="DD/Mon/YYYY"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">FollowUp Query</label>
                <textarea
                  rows={3}
                  value={newRow.query}
                  onChange={(event) => setNewRow({ ...newRow, query: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">FollowUp Date</label>
                <input
                  type="text"
                  value={newRow.followUpDate}
                  onChange={(event) => setNewRow({ ...newRow, followUpDate: event.target.value })}
                  placeholder="DD/Mon/YYYY HH:mm"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
                <select
                  value={newRow.status}
                  onChange={(event) => setNewRow({ ...newRow, status: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Completion Remark</label>
                <input
                  type="text"
                  value={newRow.completionRemark}
                  onChange={(event) => setNewRow({ ...newRow, completionRemark: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRow}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save Follow Up
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewOpen && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Follow Up Details</h2>
                <p className="mt-1 text-sm text-slate-500">View or edit the selected follow-up record.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Application Number</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRow.applicationNumber}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Application Date</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRow.applicationDate}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRow.name}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRow.phone}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">College</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRow.college}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Stream</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRow.stream}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Counselor</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRow.counselor}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Created At</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRow.createdAt}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">FollowUp Query</div>
                <div className="mt-2 text-sm text-slate-900">{selectedRow.query}</div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">FollowUp Date</label>
                <input
                  type="text"
                  value={selectedRow.followUpDate}
                  onChange={(event) => setSelectedRow({ ...selectedRow, followUpDate: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
                <select
                  value={selectedRow.status}
                  onChange={(event) => setSelectedRow({ ...selectedRow, status: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Completion Remark</label>
                <input
                  type="text"
                  value={selectedRow.completionRemark}
                  onChange={(event) => setSelectedRow({ ...selectedRow, completionRemark: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => selectedRow && handleDeleteRow(selectedRow.id)}
                className="rounded-2xl border border-rose-300 bg-white px-5 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={handleUpdateSelected}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
