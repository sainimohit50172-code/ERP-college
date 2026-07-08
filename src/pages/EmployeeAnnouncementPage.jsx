import { useMemo, useState } from 'react';
import { Download, Plus, Calendar, Eye, Edit2, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const departments = ['Administration', 'Finance', 'Academic', 'Support'];
const designations = ['Manager', 'Senior Staff', 'Junior Staff', 'Coordinator'];
const employeeTypes = ['Teaching', 'Non-Teaching', 'Admin', 'All'];
const notificationTypes = ['General', 'Urgent', 'Event', 'Policy Update'];

const initialAnnouncements = [
  {
    id: 1,
    title: 'Campus Safety Drill',
    department: 'Administration',
    designation: 'Manager',
    employeeType: 'All',
    notificationType: 'General',
    date: '2026-08-10',
    sentBy: 'Admin',
    status: 'Published',
    tab: 'all',
  },
  {
    id: 2,
    title: 'Holiday Schedule Update',
    department: 'Academic',
    designation: 'Senior Staff',
    employeeType: 'Teaching',
    notificationType: 'Event',
    date: '2026-08-15',
    sentBy: 'Admin',
    status: 'Scheduled',
    tab: 'all',
  },
  {
    id: 3,
    title: 'Payroll Submission Reminder',
    department: 'Finance',
    designation: 'Junior Staff',
    employeeType: 'Non-Teaching',
    notificationType: 'Urgent',
    date: '2026-08-12',
    sentBy: 'Admin',
    status: 'Draft',
    tab: 'sent',
  },
  {
    id: 4,
    title: 'New Policy: Dress Code',
    department: 'Support',
    designation: 'Coordinator',
    employeeType: 'All',
    notificationType: 'Policy Update',
    date: '2026-08-18',
    sentBy: 'Admin',
    status: 'Published',
    tab: 'shared',
  },
  {
    id: 5,
    title: 'Guest Lecture on Leadership',
    department: 'Academic',
    designation: 'Manager',
    employeeType: 'Teaching',
    notificationType: 'Event',
    date: '2026-08-20',
    sentBy: 'Admin',
    status: 'Published',
    tab: 'sent',
  },
];

const statusClasses = {
  Published: 'bg-emerald-500 text-white',
  Draft: 'bg-amber-500 text-slate-950',
  Scheduled: 'bg-sky-500 text-white',
};

export default function EmployeeAnnouncementPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [records, setRecords] = useState(initialAnnouncements);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: '',
    designation: '',
    employeeType: 'All',
    notificationType: '',
  });
  const [page, setPage] = useState(1);

  const filteredRecords = useMemo(() => {
    const pageRecords = records.filter((record) => activeTab === 'all' || record.tab === activeTab);
    return pageRecords.filter((record) => {
      if (filters.startDate && record.date < filters.startDate) return false;
      if (filters.endDate && record.date > filters.endDate) return false;
      if (filters.department && record.department !== filters.department) return false;
      if (filters.designation && record.designation !== filters.designation) return false;
      if (filters.employeeType && filters.employeeType !== 'All' && record.employeeType !== filters.employeeType) return false;
      if (filters.notificationType && record.notificationType !== filters.notificationType) return false;
      return true;
    });
  }, [activeTab, filters, records]);

  const handleExport = () => {
    toast.success('Exported successfully');
  };

  const handleModalSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const newRecord = {
      id: records.length + 1,
      title: form.title.value,
      department: form.department.value,
      designation: form.designation.value,
      employeeType: form.employeeType.value,
      notificationType: form.notificationType.value,
      date: form.date.value,
      sentBy: 'Admin',
      status: 'Published',
      tab: 'sent',
    };
    setRecords((current) => [newRecord, ...current]);
    setShowModal(false);
    toast.success('Announcement published');
    setActiveTab('sent');
    setPage(1);
    form.reset();
  };

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pageRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-[calc(100vh-88px)] overflow-x-hidden bg-[#F8FAFC] p-4 text-slate-900 md:p-6">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />

      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Dashboard &gt; Employee Announcement</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-bold text-slate-950 sm:text-2xl md:text-3xl">Employee Announcement</h1>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E293B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              <Download size={16} />
              Excel
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E293B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-xl bg-[#F1F5F9] p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
          {['all', 'shared', 'sent'].map((tabKey) => {
            const label = tabKey === 'all' ? 'All' : tabKey === 'shared' ? 'Shared With You' : 'Sent By You';
            const active = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
                  active ? 'bg-white text-slate-950 shadow-sm' : 'bg-transparent text-slate-500'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Enter Start Date</label>
            <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2">
              <Calendar size={16} className="text-slate-500" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Enter End Date</label>
            <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-2">
              <Calendar size={16} className="text-slate-500" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Select Designation</label>
            <select
              value={filters.designation}
              onChange={(e) => handleFilterChange('designation', e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="">All Designations</option>
              {designations.map((designation) => (
                <option key={designation} value={designation}>{designation}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Employee Type</label>
            <select
              value={filters.employeeType}
              onChange={(e) => handleFilterChange('employeeType', e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none"
            >
              {employeeTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Notification Type</label>
            <select
              value={filters.notificationType}
              onChange={(e) => handleFilterChange('notificationType', e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="">All Notification Types</option>
              {notificationTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end sm:col-span-2 lg:col-span-1">
            <button
              type="button"
              onClick={() => setPage(1)}
              className="w-full rounded-lg bg-[#1E293B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 md:w-auto"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#F8FAFC] text-sm uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Title</th>
                <th className="px-4 py-4 font-medium">Department</th>
                <th className="px-4 py-4 font-medium">Designation</th>
                <th className="px-4 py-4 font-medium">Employee Type</th>
                <th className="px-4 py-4 font-medium">Notification Type</th>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Sent By</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pageRecords.length > 0 ? (
                pageRecords.map((record) => (
                  <tr key={record.id} className="text-sm text-slate-700">
                    <td className="px-4 py-4">{record.title}</td>
                    <td className="px-4 py-4">{record.department}</td>
                    <td className="px-4 py-4">{record.designation}</td>
                    <td className="px-4 py-4">{record.employeeType}</td>
                    <td className="px-4 py-4">{record.notificationType}</td>
                    <td className="px-4 py-4">{record.date}</td>
                    <td className="px-4 py-4">{record.sentBy}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 text-slate-500">
                        <button type="button" className="inline-flex items-center gap-1 text-slate-600 transition hover:text-slate-900">
                          <Eye size={16} />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        {record.sentBy === 'Admin' && (
                          <button type="button" className="inline-flex items-center gap-1 text-slate-600 transition hover:text-slate-900">
                            <Edit2 size={16} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-sm text-slate-500">
                    <div className="mx-auto inline-flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-10 py-12">
                      <span className="text-4xl">📄</span>
                      <div className="text-base font-semibold text-slate-700">No Records Found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
          <div className="text-sm text-slate-500">Showing {pageRecords.length} of {filteredRecords.length} records</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index + 1)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${page === index + 1 ? 'bg-[#1E293B] text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page === pageCount}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="w-[95%] max-w-lg overflow-y-auto rounded-[24px] bg-white p-4 shadow-2xl md:max-w-2xl md:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">New Employee Announcement</h2>
                <p className="text-sm text-slate-500">Create a new announcement to share with employees.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Title</label>
                  <input name="title" required className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Department</label>
                  <select name="department" required className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none">
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Designation</label>
                  <select name="designation" required className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none">
                    <option value="">Select Designation</option>
                    {designations.map((designation) => (
                      <option key={designation} value={designation}>{designation}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Employee Type</label>
                  <select name="employeeType" required className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none">
                    {employeeTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Notification Type</label>
                  <select name="notificationType" required className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none">
                    <option value="">Select Notification Type</option>
                    {notificationTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Date</label>
                  <input name="date" type="date" required className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Message / Description</label>
                <textarea name="message" rows="4" className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
              </div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-[#1E293B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
