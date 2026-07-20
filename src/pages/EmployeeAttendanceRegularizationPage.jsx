import { useMemo, useState } from 'react';
import {
  Plus,
  Calendar,
  Edit3,
  Clock3,
  ArrowRight,
} from 'lucide-react';
import Modal from '../components/ui/Modal.jsx';
import ViewButton from '../components/ui/ViewButton.jsx';

const tabItems = [
  { id: 'myData', label: 'My Data' },
  { id: 'reportees', label: 'Reportees' },
  { id: 'allAr', label: 'All AR' },
];

const initialMyData = [
  { id: 1, name: 'Aditi Sharma', date: '2026-07-01', type: 'Late Arrival', reason: 'Traffic delay', time: '09:45', status: 'Pending' },
  { id: 2, name: 'Rahul Verma', date: '2026-06-28', type: 'Missed Punch', reason: 'Forgot to punch', time: '09:10', status: 'Approved' },
];

const initialReportees = [
  { id: 3, name: 'Nisha Patel', date: '2026-06-25', type: 'Early Departure', reason: 'Medical appointment', time: '15:30', status: 'Pending' },
  { id: 4, name: 'Sunil Reddy', date: '2026-06-22', type: 'Work From Home', reason: 'Client meeting', time: '09:00', status: 'Approved' },
];

const initialAllAr = [
  { id: 5, name: 'Mira Joshi', date: '2026-06-15', type: 'Late Arrival', reason: 'Public transport delay', time: '10:00', status: 'Rejected' },
  { id: 6, name: 'Karan Singh', date: '2026-06-11', type: 'Missed Punch', reason: 'System issue', time: '09:05', status: 'Approved' },
];

const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'];
const arTypeOptions = ['All', 'Late Arrival', 'Early Departure', 'Missed Punch', 'Work From Home'];

function statusBadge(status) {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Pending') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export default function EmployeeAttendanceRegularizationPage() {
  const [activeTab, setActiveTab] = useState('myData');
  const [showModal, setShowModal] = useState(false);
  const [records, setRecords] = useState({
    myData: initialMyData,
    reportees: initialReportees,
    allAr: initialAllAr,
  });
  const [filterValues, setFilterValues] = useState({
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'All',
    type: 'All',
  });
  const [activeFilters, setActiveFilters] = useState(filterValues);
  const [formState, setFormState] = useState({ date: '2026-07-01', type: 'Late Arrival', time: '09:00', reason: '' });

  const currentRecords = records[activeTab];

  const filteredRecords = useMemo(() => {
    return currentRecords.filter((item) => {
      const matchesStatus = activeFilters.status === 'All' || item.status === activeFilters.status;
      const matchesType = activeFilters.type === 'All' || item.type === activeFilters.type;
      const matchesStart = !activeFilters.startDate || item.date >= activeFilters.startDate;
      const matchesEnd = !activeFilters.endDate || item.date <= activeFilters.endDate;
      return matchesStatus && matchesType && matchesStart && matchesEnd;
    });
  }, [activeFilters, currentRecords]);

  const handleApplyFilters = () => {
    setActiveFilters(filterValues);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newRecord = {
      id: Date.now(),
      name: 'Admin User',
      date: formState.date,
      type: formState.type,
      reason: formState.reason,
      time: formState.time,
      status: 'Pending',
    };
    setRecords((prev) => ({
      ...prev,
      myData: [newRecord, ...prev.myData],
    }));
    setActiveTab('myData');
    setShowModal(false);
    setFormState({ date: '2026-07-01', type: 'Late Arrival', time: '09:00', reason: '' });
  };

  return (
    <div className="h-[calc(100vh-88px)] overflow-hidden bg-[#F8FAFC] py-6 font-sans">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Dashboard &gt; Employee Attendance Regularization</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Employee Attendance Regularization</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E293B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] p-2 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-[115px] rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-[#64748B]">Start Date</label>
                <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2">
                  <Calendar size={16} className="text-[#1E293B]" />
                  <input
                    type="date"
                    value={filterValues.startDate}
                    onChange={(event) => setFilterValues((prev) => ({ ...prev, startDate: event.target.value }))}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-[#64748B]">End Date</label>
                <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2">
                  <Calendar size={16} className="text-[#1E293B]" />
                  <input
                    type="date"
                    value={filterValues.endDate}
                    onChange={(event) => setFilterValues((prev) => ({ ...prev, endDate: event.target.value }))}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
              <div className="min-w-[160px] flex-1">
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-[#64748B]">Status List</label>
                <select
                  value={filterValues.status}
                  onChange={(event) => setFilterValues((prev) => ({ ...prev, status: event.target.value }))}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[160px] flex-1">
                <label className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-[#64748B]">AR Type</label>
                <select
                  value={filterValues.type}
                  onChange={(event) => setFilterValues((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm outline-none"
                >
                  {arTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="ml-auto min-w-[120px]">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1E293B] px-4 text-sm font-semibold text-white transition hover:bg-slate-800 hover-gradient-border"
                >
                  Go
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="h-full overflow-hidden p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Attendance Regularization Requests</p>
                  <p className="text-sm text-slate-500">{tabItems.find((tab) => tab.id === activeTab)?.label} records</p>
                </div>
                <div className="text-sm text-slate-500">{filteredRecords.length} items</div>
              </div>

              <div className="h-[calc(100%-4rem)] overflow-y-auto">
                {filteredRecords.length === 0 ? (
                  <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Clock3 size={24} />
                    </div>
                    <p className="text-lg font-semibold">No Records Found</p>
                    <p className="mt-2 text-sm text-slate-500">Submit a new request or update your filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-sm">
                      <thead className="bg-[#F8FAFC] text-xs uppercase tracking-[0.16em] text-slate-500">
                        <tr>
                          <th className="whitespace-nowrap px-4 py-3 text-left">Employee Name</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">Date</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">AR Type</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">Reason</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">Requested Time</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">Status</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                            <td className="px-4 py-4 font-semibold text-slate-900">{item.name}</td>
                            <td className="px-4 py-4 text-slate-700">{item.date}</td>
                            <td className="px-4 py-4 text-slate-700">{item.type}</td>
                            <td className="px-4 py-4 text-slate-700">{item.reason}</td>
                            <td className="px-4 py-4 text-slate-700">{item.time}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadge(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 text-slate-600">
                                <ViewButton
                                  title="View request"
                                  ariaLabel="View request"
                                  className="rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                />
                                {item.status === 'Pending' && (
                                  <button type="button" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 transition hover:bg-slate-100 hover-gradient-border">
                                    <Edit3 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Submit Attendance Regularization"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="attendance-regularization-form"
              className="rounded-lg bg-[#1E293B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 hover-gradient-border"
            >
              Submit
            </button>
          </>
        }
      >
        <form id="attendance-regularization-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[#64748B]">Date</span>
              <input
                type="date"
                value={formState.date}
                onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[#64748B]">AR Type</span>
              <select
                value={formState.type}
                onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-3 text-sm outline-none"
              >
                {arTypeOptions.slice(1).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[#64748B]">Requested Time</span>
              <input
                type="time"
                value={formState.time}
                onChange={(event) => setFormState((prev) => ({ ...prev, time: event.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-3 text-sm outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[#64748B]">Reason</span>
              <textarea
                value={formState.reason}
                onChange={(event) => setFormState((prev) => ({ ...prev, reason: event.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-3 text-sm outline-none resize-none"
              />
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
