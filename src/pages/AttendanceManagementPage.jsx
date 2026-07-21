import { useMemo, useState } from 'react';
import { Plus, Search, RefreshCw, Eye, Pencil, Trash2, X, Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const initialPolicies = [
  { id: 1, policyName: 'General Attendance Policy', department: 'All Departments', attendanceType: 'Daily', workingDays: 'Mon-Fri', graceTime: '10 Minutes', minAttendance: '75%', lateRule: 'After 30 min', status: 'Active', remarks: 'Default policy for all courses' },
  { id: 2, policyName: 'Engineering Attendance', department: 'Engineering', attendanceType: 'Biometric', workingDays: 'Mon-Sat', graceTime: '15 Minutes', minAttendance: '80%', lateRule: 'After 15 min', status: 'Active', remarks: 'Stricter policy for lab courses' },
  { id: 3, policyName: 'MBA Attendance', department: 'Management', attendanceType: 'Manual', workingDays: 'Mon-Fri', graceTime: '20 Minutes', minAttendance: '85%', lateRule: 'After 20 min', status: 'Active', remarks: 'Professional course standard' },
  { id: 4, policyName: 'Hostel Attendance', department: 'Hostel', attendanceType: 'Hybrid', workingDays: '24/7', graceTime: '5 Minutes', minAttendance: '90%', lateRule: 'After 5 min', status: 'Active', remarks: 'Residential tracking policy' },
  { id: 5, policyName: 'Laboratory Attendance', department: 'Science', attendanceType: 'Biometric', workingDays: 'Mon-Fri', graceTime: '5 Minutes', minAttendance: '85%', lateRule: 'No entry after 15 min', status: 'Active', remarks: 'Strict for practical sessions' },
  { id: 6, policyName: 'Faculty Attendance', department: 'All Departments', attendanceType: 'Hybrid', workingDays: 'Mon-Fri', graceTime: '15 Minutes', minAttendance: '90%', lateRule: 'After 30 min', status: 'Active', remarks: 'For teaching faculty only' },
  { id: 7, policyName: 'Administrative Staff Attendance', department: 'Admin', attendanceType: 'Manual', workingDays: 'Mon-Fri', graceTime: '10 Minutes', minAttendance: '95%', lateRule: 'After 30 min', status: 'Active', remarks: 'Office hours tracking' },
  { id: 8, policyName: 'Pharmacy Attendance', department: 'Pharmacy', attendanceType: 'Daily', workingDays: 'Mon-Sat', graceTime: '10 Minutes', minAttendance: '80%', lateRule: 'After 20 min', status: 'Draft', remarks: 'Under review for next semester' },
  { id: 9, policyName: 'Sports Activity Attendance', department: 'Sports', attendanceType: 'Manual', workingDays: 'Mon-Sun', graceTime: '15 Minutes', minAttendance: '70%', lateRule: 'After 30 min', status: 'Active', remarks: 'Flexible for outdoor activities' },
  { id: 10, policyName: 'Practical Session Attendance', department: 'Engineering', attendanceType: 'Biometric', workingDays: 'Mon-Fri', graceTime: '5 Minutes', minAttendance: '85%', lateRule: 'No entry after start', status: 'Inactive', remarks: 'Deprecated - use Lab policy' },
  { id: 11, policyName: 'Online Course Attendance', department: 'E-Learning', attendanceType: 'Hybrid', workingDays: 'Mon-Sun', graceTime: '30 Minutes', minAttendance: '75%', lateRule: 'After 45 min', status: 'Draft', remarks: 'New policy for virtual courses' },
  { id: 12, policyName: 'Seminar Attendance', department: 'All Departments', attendanceType: 'Manual', workingDays: 'Variable', graceTime: '5 Minutes', minAttendance: '100%', lateRule: 'No entry after start', status: 'Active', remarks: 'For guest lectures and seminars' },
  { id: 13, policyName: 'Internship Attendance', department: 'All Departments', attendanceType: 'Manual', workingDays: 'Mon-Fri', graceTime: '15 Minutes', minAttendance: '90%', lateRule: 'After 30 min', status: 'Active', remarks: 'Industrial placement tracking' },
  { id: 14, policyName: 'Library Attendance', department: 'Library', attendanceType: 'Manual', workingDays: 'Mon-Sun', graceTime: 'N/A', minAttendance: 'N/A', lateRule: 'N/A', status: 'Active', remarks: 'Entry-exit tracking only' },
  { id: 15, policyName: 'Research Scholar Attendance', department: 'Research', attendanceType: 'Hybrid', workingDays: 'Mon-Sat', graceTime: '1 Hour', minAttendance: '80%', lateRule: 'Self-tracking', status: 'Active', remarks: 'Flexible with lab requirements' },
  { id: 16, policyName: 'Cafeteria Attendance', department: 'Support', attendanceType: 'Manual', workingDays: 'Daily', graceTime: 'N/A', minAttendance: '100%', lateRule: 'Per shift', status: 'Draft', remarks: 'For canteen staff scheduling' },
  { id: 17, policyName: 'Special Events Attendance', department: 'Events', attendanceType: 'Manual', workingDays: 'Variable', graceTime: '5 Minutes', minAttendance: '100%', lateRule: 'Strictly enforced', status: 'Active', remarks: 'Convocation, conferences, etc.' },
  { id: 18, policyName: 'Remedial Classes Attendance', department: 'Academics', attendanceType: 'Manual', workingDays: 'Mon-Fri', graceTime: '10 Minutes', minAttendance: '75%', lateRule: 'After 20 min', status: 'Active', remarks: 'For catch-up sessions' },
  { id: 19, policyName: 'Counseling Session Attendance', department: 'Wellness', attendanceType: 'Manual', workingDays: 'Mon-Fri', graceTime: '10 Minutes', minAttendance: 'N/A', lateRule: 'Flexible', status: 'Active', remarks: 'Student counseling tracking' },
  { id: 20, policyName: 'Guest Lecture Attendance', department: 'All Departments', attendanceType: 'Manual', workingDays: 'Variable', graceTime: '5 Minutes', minAttendance: '100%', lateRule: 'No entry after 15 min', status: 'Inactive', remarks: 'Managed through department' },
];

const emptyForm = {
  policyName: '',
  department: 'All Departments',
  attendanceType: 'Daily',
  workingDays: 'Mon-Fri',
  graceTime: '10 Minutes',
  minAttendance: '75%',
  lateRule: 'After 30 min',
  status: 'Active',
  remarks: '',
};

function getStatusClasses(status) {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-700';
    case 'Draft':
      return 'bg-amber-100 text-amber-700';
    case 'Inactive':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export default function AttendanceManagementPage() {
  const [policies, setPolicies] = useState(initialPolicies);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredPolicies = useMemo(() => {
    const term = search.toLowerCase();
    return policies.filter((policy) => {
      const matchesText = [policy.policyName, policy.department, policy.attendanceType, policy.status]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term));
      const matchesDept = departmentFilter === 'All' || policy.department === departmentFilter;
      const matchesType = typeFilter === 'All' || policy.attendanceType === typeFilter;
      const matchesStatus = statusFilter === 'All' || policy.status === statusFilter;
      return matchesText && matchesDept && matchesType && matchesStatus;
    });
  }, [policies, search, departmentFilter, typeFilter, statusFilter]);

  const departmentOptions = ['All', ...Array.from(new Set(policies.map((p) => p.department)))];
  const typeOptions = ['All', ...Array.from(new Set(policies.map((p) => p.attendanceType)))];
  const statusOptions = ['All', 'Active', 'Draft', 'Inactive'];

  const summaryCards = [
    { label: 'Total Attendance Policies', value: policies.length, icon: Calendar },
    { label: 'Active Policies', value: policies.filter((p) => p.status === 'Active').length, icon: AlertCircle },
    { label: 'Departments', value: Array.from(new Set(policies.map((p) => p.department))).length, icon: Users },
    { label: 'Attendance Types', value: Array.from(new Set(policies.map((p) => p.attendanceType))).length, icon: Clock },
  ];

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!form.policyName.trim()) errors.policyName = 'Policy name is required';
    if (!form.department.trim()) errors.department = 'Department is required';
    if (!form.attendanceType.trim()) errors.attendanceType = 'Attendance type is required';
    if (!form.workingDays.trim()) errors.workingDays = 'Working days is required';
    if (!form.graceTime.trim()) errors.graceTime = 'Grace time is required';
    if (!form.minAttendance.trim()) errors.minAttendance = 'Minimum attendance is required';
    if (!form.lateRule.trim()) errors.lateRule = 'Late rule is required';
    return errors;
  };

  const handleAddSubmit = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const nextPolicy = {
      id: Date.now(),
      policyName: form.policyName.trim(),
      department: form.department.trim(),
      attendanceType: form.attendanceType.trim(),
      workingDays: form.workingDays.trim(),
      graceTime: form.graceTime.trim(),
      minAttendance: form.minAttendance.trim(),
      lateRule: form.lateRule.trim(),
      status: form.status,
      remarks: form.remarks.trim(),
    };

    setPolicies((current) => [nextPolicy, ...current]);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setPolicies((current) =>
      current.map((item) =>
        item.id === selectedPolicy.id
          ? {
              ...item,
              policyName: form.policyName.trim(),
              department: form.department.trim(),
              attendanceType: form.attendanceType.trim(),
              workingDays: form.workingDays.trim(),
              graceTime: form.graceTime.trim(),
              minAttendance: form.minAttendance.trim(),
              lateRule: form.lateRule.trim(),
              status: form.status,
              remarks: form.remarks.trim(),
            }
          : item
      )
    );
    setIsEditOpen(false);
    setSelectedPolicy(null);
    resetForm();
  };

  const openEditModal = (policy) => {
    setSelectedPolicy(policy);
    setForm({
      policyName: policy.policyName,
      department: policy.department,
      attendanceType: policy.attendanceType,
      workingDays: policy.workingDays,
      graceTime: policy.graceTime,
      minAttendance: policy.minAttendance,
      lateRule: policy.lateRule,
      status: policy.status,
      remarks: policy.remarks,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const openViewModal = (policy) => {
    setSelectedPolicy(policy);
    setIsViewOpen(true);
  };

  const confirmDelete = (policy) => {
    setDeleteTarget(policy);
    setIsDeleteOpen(true);
  };

  const removePolicy = () => {
    if (!deleteTarget) return;
    setPolicies((current) => current.filter((item) => item.id !== deleteTarget.id));
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const refreshFilters = () => {
    setSearch('');
    setDepartmentFilter('All');
    setTypeFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="mx-[10px] space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mt-3">
              <Breadcrumb
                items={[
                  { label: 'Settings', to: '/settings' },
                  { label: 'Institute Setup', to: '/settings/institute' },
                  { label: 'Attendance' },
                ]}
              />
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Attendance Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Configure attendance policies, attendance sessions, working days and attendance rules for the institution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition hover-gradient-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Content Card */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Attendance overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Attendance Configuration</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border"
          >
            <Plus className="h-4 w-4" /> Add Attendance Policy
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover-gradient-border">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search policy name, department..."
              className="w-full bg-transparent outline-none sm:w-56"
            />
          </label>
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Departments' : option}
                </option>
              ))}
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Types' : option}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Status' : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={refreshFilters} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead>
              <tr className="bg-emerald-600 text-left uppercase tracking-[0.12em] text-white">
                <th className="px-4 py-4">#</th>
                <th className="px-4 py-4">Policy Name</th>
                <th className="px-4 py-4">Department</th>
                <th className="px-4 py-4">Attendance Type</th>
                <th className="px-4 py-4">Working Days</th>
                <th className="px-4 py-4">Grace Time</th>
                <th className="px-4 py-4">Min Attendance %</th>
                <th className="px-4 py-4">Late Rule</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              {filteredPolicies.map((policy, index) => (
                <tr key={policy.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{index + 1}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">{policy.policyName}</td>
                  <td className="whitespace-nowrap px-4 py-4">{policy.department}</td>
                  <td className="whitespace-nowrap px-4 py-4">{policy.attendanceType}</td>
                  <td className="whitespace-nowrap px-4 py-4">{policy.workingDays}</td>
                  <td className="whitespace-nowrap px-4 py-4">{policy.graceTime}</td>
                  <td className="whitespace-nowrap px-4 py-4">{policy.minAttendance}</td>
                  <td className="whitespace-nowrap px-4 py-4">{policy.lateRule}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusClasses(policy.status)}`}>{policy.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openViewModal(policy)} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover-gradient-border">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => openEditModal(policy)} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover-gradient-border">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => confirmDelete(policy)} title="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 transition hover:bg-rose-50 hover-gradient-border">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPolicies.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-600">No attendance policies found</p>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or create a new policy</p>
          </div>
        )}
      </section>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-2 py-3 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
            <button type="button" onClick={() => setIsAddOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-semibold text-slate-900">Add Attendance Policy</h2>
            <p className="mt-1 text-sm text-slate-600">Create a new attendance configuration for your institution</p>

            <form onSubmit={handleAddSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Policy Name *</label>
                  <input
                    type="text"
                    value={form.policyName}
                    onChange={(e) => setForm({ ...form, policyName: e.target.value })}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none ${formErrors.policyName ? 'border-rose-400' : 'border-slate-200 hover-gradient-border'}`}
                    placeholder="e.g., General Attendance Policy"
                  />
                  {formErrors.policyName && <p className="mt-1 text-xs text-rose-600">{formErrors.policyName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Department *</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Management</option>
                    <option>Science</option>
                    <option>Pharmacy</option>
                    <option>Hostel</option>
                    <option>Admin</option>
                    <option>Support</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Attendance Type *</label>
                  <select value={form.attendanceType} onChange={(e) => setForm({ ...form, attendanceType: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>Daily</option>
                    <option>Biometric</option>
                    <option>Manual</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Working Days *</label>
                  <select value={form.workingDays} onChange={(e) => setForm({ ...form, workingDays: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>Mon-Fri</option>
                    <option>Mon-Sat</option>
                    <option>24/7</option>
                    <option>Variable</option>
                    <option>Mon-Sun</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Grace Time *</label>
                  <select value={form.graceTime} onChange={(e) => setForm({ ...form, graceTime: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>5 Minutes</option>
                    <option>10 Minutes</option>
                    <option>15 Minutes</option>
                    <option>20 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Minimum Attendance % *</label>
                  <select value={form.minAttendance} onChange={(e) => setForm({ ...form, minAttendance: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>70%</option>
                    <option>75%</option>
                    <option>80%</option>
                    <option>85%</option>
                    <option>90%</option>
                    <option>95%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Late Entry Rule *</label>
                <input
                  type="text"
                  value={form.lateRule}
                  onChange={(e) => setForm({ ...form, lateRule: e.target.value })}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none ${formErrors.lateRule ? 'border-rose-400' : 'border-slate-200 hover-gradient-border'}`}
                  placeholder="e.g., After 30 min"
                />
                {formErrors.lateRule && <p className="mt-1 text-xs text-rose-600">{formErrors.lateRule}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Remarks</label>
                <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border" placeholder="Additional notes..." rows="3" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 hover-gradient-border">
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-2 py-3 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
            <button type="button" onClick={() => setIsEditOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-semibold text-slate-900">Edit Attendance Policy</h2>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Policy Name *</label>
                  <input
                    type="text"
                    value={form.policyName}
                    onChange={(e) => setForm({ ...form, policyName: e.target.value })}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none ${formErrors.policyName ? 'border-rose-400' : 'border-slate-200 hover-gradient-border'}`}
                  />
                  {formErrors.policyName && <p className="mt-1 text-xs text-rose-600">{formErrors.policyName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Department *</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Management</option>
                    <option>Science</option>
                    <option>Pharmacy</option>
                    <option>Hostel</option>
                    <option>Admin</option>
                    <option>Support</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Attendance Type *</label>
                  <select value={form.attendanceType} onChange={(e) => setForm({ ...form, attendanceType: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>Daily</option>
                    <option>Biometric</option>
                    <option>Manual</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Working Days *</label>
                  <select value={form.workingDays} onChange={(e) => setForm({ ...form, workingDays: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>Mon-Fri</option>
                    <option>Mon-Sat</option>
                    <option>24/7</option>
                    <option>Variable</option>
                    <option>Mon-Sun</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Grace Time *</label>
                  <select value={form.graceTime} onChange={(e) => setForm({ ...form, graceTime: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>5 Minutes</option>
                    <option>10 Minutes</option>
                    <option>15 Minutes</option>
                    <option>20 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Minimum Attendance % *</label>
                  <select value={form.minAttendance} onChange={(e) => setForm({ ...form, minAttendance: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>70%</option>
                    <option>75%</option>
                    <option>80%</option>
                    <option>85%</option>
                    <option>90%</option>
                    <option>95%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Late Entry Rule *</label>
                <input
                  type="text"
                  value={form.lateRule}
                  onChange={(e) => setForm({ ...form, lateRule: e.target.value })}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none ${formErrors.lateRule ? 'border-rose-400' : 'border-slate-200 hover-gradient-border'}`}
                />
                {formErrors.lateRule && <p className="mt-1 text-xs text-rose-600">{formErrors.lateRule}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border">
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Remarks</label>
                <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none hover-gradient-border" rows="3" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 hover-gradient-border">
                  Update Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-2 py-3 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
            <button type="button" onClick={() => setIsViewOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-semibold text-slate-900">Policy Details</h2>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">Policy Name</p>
                  <p className="mt-1 text-slate-900">{selectedPolicy.policyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Department</p>
                  <p className="mt-1 text-slate-900">{selectedPolicy.department}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">Attendance Type</p>
                  <p className="mt-1 text-slate-900">{selectedPolicy.attendanceType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Working Days</p>
                  <p className="mt-1 text-slate-900">{selectedPolicy.workingDays}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">Grace Time</p>
                  <p className="mt-1 text-slate-900">{selectedPolicy.graceTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Minimum Attendance %</p>
                  <p className="mt-1 text-slate-900">{selectedPolicy.minAttendance}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">Late Entry Rule</p>
                  <p className="mt-1 text-slate-900">{selectedPolicy.lateRule}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Status</p>
                  <p className="mt-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusClasses(selectedPolicy.status)}`}>{selectedPolicy.status}</span>
                  </p>
                </div>
              </div>

              {selectedPolicy.remarks && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Remarks</p>
                  <p className="mt-1 text-slate-900">{selectedPolicy.remarks}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setIsViewOpen(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                Close
              </button>
              <button type="button" onClick={() => { setIsViewOpen(false); openEditModal(selectedPolicy); }} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 hover-gradient-border">
                Edit Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Delete Policy?</h2>
            <p className="mt-2 text-sm text-slate-600">Are you sure you want to delete this attendance policy? This action cannot be undone.</p>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setIsDeleteOpen(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={removePolicy} className="flex-1 rounded-lg bg-rose-600 px-4 py-2 font-medium text-white transition hover:bg-rose-500 hover-gradient-border">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
