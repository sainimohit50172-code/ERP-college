import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  useResourceList,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useBulkImport,
  useBulkExport,
} from '../hooks/useResourceHooks';
import {
  FaCalendarCheck,
  FaChartLine,
  FaDownload,
  FaEdit,
  FaFileImport,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import WithPermission from '../components/auth/WithPermission.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'On Leave', label: 'On Leave' },
  { value: 'Resigned', label: 'Resigned' },
];
const defaultEmployeeValues = {
  name: '',
  email: '',
  department: 'Admissions',
  designation: 'Assistant',
  shift: 'Day',
  status: 'Active',
  salary: '3200',
  joinDate: '',
};
const defaultAttendanceValues = {
  date: new Date().toISOString().slice(0, 10),
  employeeId: '',
  shift: 'Day',
  status: 'Present',
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
export default function EmployeeManagementPage() {
  const importInputRef = useRef(null);
  const navigate = useNavigate();
  const { data: employeesData } = useResourceList('employees', { page: 1, pageSize: 200 });
  const { data: departmentsData } = useResourceList('departments', { page: 1, pageSize: 200 });
  const { data: employeeAttendanceData } = useResourceList('employeeAttendance', { page: 1, pageSize: 200 });
  const employees = employeesData?.items || [];
  const departments = departmentsData?.items || [];
  const employeeAttendance = employeeAttendanceData?.items || [];
  const createEmployee = useCreateResource('employees');
  const updateEmployee = useUpdateResource('employees');
  const deleteEmployee = useDeleteResource('employees');
  const importEmployee = useBulkImport('employees');
  const exportEmployee = useBulkExport('employees');
  const createAttendance = useCreateResource('employeeAttendance');
  const [searchRoster, setSearchRoster] = useState('');
  const [filterRoster, setFilterRoster] = useState('All');
  const [page, setPage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [_isExporting, setIsExporting] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);
  const pageSize = 6;
  const attendancePageSize = 5;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultEmployeeValues });
  const {
    register: registerAttendance,
    handleSubmit: handleSubmitAttendance,
    reset: resetAttendance,
    formState: { errors: attendanceErrors },
  } = useForm({ defaultValues: defaultAttendanceValues });
  const employeeMap = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees]);
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchTerm = searchRoster.toLowerCase();
      const matchesSearch = [employee.name, employee.email, employee.department, employee.designation]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filterRoster === 'All' || employee.status === filterRoster;
      return matchesSearch && matchesFilter;
    });
  }, [employees, searchRoster, filterRoster]);
  const filteredAttendance = useMemo(() => {
    return employeeAttendance.filter((entry) => {
      const searchTerm = searchRoster.toLowerCase();
      const employeeName = employeeMap.get(entry.employeeId)?.name || '';
      const matchesSearch = [employeeName, entry.date, entry.shift, entry.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      return matchesSearch;
    });
  }, [employeeAttendance, employeeMap, searchRoster]);
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const displayedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);
  const attendancePageCount = Math.max(1, Math.ceil(filteredAttendance.length / attendancePageSize));
  const displayedAttendance = filteredAttendance.slice((attendancePage - 1) * attendancePageSize, attendancePage * attendancePageSize);
  const activeEmployees = employees.filter((employee) => employee.status === 'Active').length;
  const onLeaveEmployees = employees.filter((employee) => employee.status === 'On Leave').length;
  const dayShiftCount = employees.filter((employee) => employee.shift === 'Day').length;
  const nightShiftCount = employees.filter((employee) => employee.shift === 'Night').length;
  const totalPayroll = employees.reduce((sum, employee) => sum + (Number(String(employee.salary).replace(/[^0-9.]/g, '')) || 0), 0);
  const topDepartment = useMemo(() => {
    const counts = employees.reduce((acc, employee) => {
      const dept = employee.department || 'General';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }, [employees]);
  const attendanceSummary = useMemo(() => {
    const present = employeeAttendance.filter((entry) => entry.status === 'Present').length;
    const absent = employeeAttendance.filter((entry) => entry.status === 'Absent').length;
    const late = employeeAttendance.filter((entry) => entry.status === 'Late').length;
    return { present, absent, late };
  }, [employeeAttendance]);
  const resetForm = () => {
    reset(defaultEmployeeValues);
    setSelectedEmployee(null);
    setIsEditMode(false);
  };
  const openNewEmployeeModal = () => {
    resetForm();
    setIsModalOpen(true);
  };
  const openEditEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    setIsEditMode(true);
    reset({
      name: employee.name || '',
      email: employee.email || '',
      department: employee.department || 'Admissions',
      designation: employee.designation || 'Assistant',
      shift: employee.shift || 'Day',
      status: employee.status || 'Active',
      salary: String(employee.salary).replace(/[^0-9.]/g, '') || '3200',
      joinDate: employee.joinDate || '',
    });
    setIsModalOpen(true);
  };
  const formatEmployeePayload = (data, existingEmployee) => {
    const fullName = String(data.name || '').trim();
    const [first_name, ...rest] = fullName.split(' ');
    const last_name = rest.join(' ') || null;
    const inferredEmployeeCode = data.email ? data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-') : fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
      employee_code: existingEmployee?.employee_code || inferredEmployeeCode || `emp-${Date.now()}`,
      first_name: first_name || fullName,
      last_name: last_name,
      email: data.email || null,
      designation: data.designation,
      department: data.department,
      status: data.status,
    };
  };
  const onSubmit = (data) => {
    const payload = formatEmployeePayload(data, selectedEmployee);
    if (isEditMode && selectedEmployee) {
      updateEmployee.mutate(
        { id: selectedEmployee.id, payload },
        {
          onSuccess: () => {
            resetForm();
            setPage(1);
            setIsModalOpen(false);
          },
        },
      );
    } else {
      createEmployee.mutate(payload, {
        onSuccess: () => {
          resetForm();
          setPage(1);
          setIsModalOpen(false);
        },
      });
    }
  };
  const handleDelete = (employee) => {
    if (!window.confirm(`Remove ${employee.name} from the workforce roster?`)) {
      return;
    }
    deleteEmployee.mutate(employee.id);
  };
  const handleImport = (file) => {
    if (!file) return;
    setImportStatus('Importing employee roster…');
    const formData = new FormData();
    formData.append('file', file);
    importEmployee.mutate(formData, {
      onSuccess: () => setImportStatus('Employee roster imported successfully.'),
      onError: () => setImportStatus('Import failed. Please try a valid CSV file.'),
    });
  };
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleImport(file);
    event.target.value = '';
  };
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportEmployee.mutateAsync();
      downloadBlob(blob, 'employees-export.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };
  const handleAttendanceSubmit = (data) => {
    setIsSubmittingAttendance(true);
    createAttendance.mutate(data, {
      onSuccess: () => {
        resetAttendance(defaultAttendanceValues);
        setAttendancePage(1);
      },
      onSettled: () => setIsSubmittingAttendance(false),
    });
  };
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Employee management"
        subtitle="HR operations, workforce analytics, payroll and attendance monitoring."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <FaDownload /> Export payroll
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
              onClick={openNewEmployeeModal}
              className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <FaPlus /> Add employee
            </button>
          </div>
        }
      />
      <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.3fr)]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total employees</p>
              <p className="mt-3 text-2xl font-semibold text-white">{employees.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Day shift</p>
              <p className="mt-3 text-2xl font-semibold text-white">{dayShiftCount}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Payroll burn</p>
              <p className="mt-3 text-2xl font-semibold text-white">${totalPayroll.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Workforce roster</h2>
                <p className="text-sm text-slate-400">Search personnel records, filter by status, and manage role assignments.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-2xl bg-slate-950/70 px-3 py-2 text-sm text-slate-200">Top department: {topDepartment}</div>
                <div className="rounded-2xl bg-slate-950/70 px-3 py-2 text-sm text-slate-200">On leave: {onLeaveEmployees}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SearchFilter
                search={searchRoster}
                onSearch={setSearchRoster}
                filter={filterRoster}
                onFilter={setFilterRoster}
                options={statusOptions}
              />
            </div>
            <div className="mt-4">
              <DataTable
                columns={['Employee', 'Department', 'Designation', 'Shift', 'Salary', 'Status', 'Actions']}
                rows={displayedEmployees.map((employee) => [
                  <div className="space-y-1" key={employee.id}>
                    <p className="font-semibold text-white">{employee.name}</p>
                    <p className="text-sm text-slate-400">{employee.email}</p>
                  </div>,
                  employee.department,
                  employee.designation,
                  employee.shift,
                  employee.salary,
                  <StatusBadge key={`${employee.id}-status`} status={employee.status} />,
                  <div key={`${employee.id}-actions`} className="flex flex-wrap gap-2">
                    <WithPermission moduleKey="employees" action="view">
                      <button
                        type="button"
                        onClick={() => navigate(`/employees/${employee.id}`)}
                        className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
                      >
                        View Profile
                      </button>
                    </WithPermission>
                    <WithPermission moduleKey="employees" action="edit">
                      <button
                        type="button"
                        onClick={() => openEditEmployeeModal(employee)}
                        className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
                      >
                        <FaEdit className="inline-block" /> Edit
                      </button>
                    </WithPermission>
                    <WithPermission moduleKey="employees" action="delete">
                      <button
                        type="button"
                        onClick={() => handleDelete(employee)}
                        className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20"
                      >
                        <FaTrash className="inline-block" /> Remove
                      </button>
                    </WithPermission>
                  </div>,
                ])}
              />
            </div>
            <div className="mt-4">
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
              <FaCalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">HR pulse</p>
              <h3 className="text-lg font-semibold text-white">Employee health</h3>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Attendance compliance</p>
              <p className="mt-2 text-2xl font-semibold text-white">{employees.length ? `${Math.round((activeEmployees / employees.length) * 100)}%` : '0%'}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Contract renewals due</p>
              <p className="mt-2 text-2xl font-semibold text-white">2</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Night shift coverage</p>
              <p className="mt-2 text-2xl font-semibold text-white">{nightShiftCount}</p>
            </div>
          </div>
        </div>
      </div>
      {importStatus && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">{importStatus}</div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Attendance overview</h2>
              <p className="text-sm text-slate-400">Latest employee attendance across shifts and departments.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-3xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">Present: {attendanceSummary.present}</div>
              <div className="rounded-3xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">Absent: {attendanceSummary.absent}</div>
            </div>
          </div>
          <div className="mt-6">
            <DataTable
              columns={['Employee', 'Department', 'Shift', 'Date', 'Status']}
              rows={displayedAttendance.map((entry) => [
                <div key={entry.id} className="font-semibold text-white">{employeeMap.get(entry.employeeId)?.name || entry.employeeId}</div>,
                employeeMap.get(entry.employeeId)?.department || 'Unknown',
                entry.shift,
                entry.date,
                <StatusBadge key={`${entry.id}-status`} status={entry.status} />,
              ])}
            />
          </div>
          <div className="mt-6">
            <TablePagination page={attendancePage} pageCount={attendancePageCount} onPageChange={setAttendancePage} />
          </div>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-700/80 text-slate-200">
              <FaChartLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Payroll and operations</p>
              <h3 className="text-xl font-semibold text-white">Workforce planning</h3>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Active workforce</p>
              <p className="mt-3 text-3xl font-semibold text-white">{activeEmployees}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Average salary</p>
              <p className="mt-3 text-3xl font-semibold text-white">{employees.length ? `$${Math.round(totalPayroll / employees.length).toLocaleString()}` : '$0'}</p>
            </div>
          </div>
          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm text-slate-400">Streamline attendance logging without leaving the roster.</p>
            <form className="mt-4 space-y-4" onSubmit={handleSubmitAttendance(handleAttendanceSubmit)}>
              <FormField label="Employee">
                <select
                  {...registerAttendance('employeeId', { required: 'Employee selection is required' })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
                {attendanceErrors.employeeId && <p className="mt-1 text-sm text-rose-400">{attendanceErrors.employeeId.message}</p>}
              </FormField>
              <FormField label="Date">
                <input
                  type="date"
                  {...registerAttendance('date', { required: 'Date is required' })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
                />
                {attendanceErrors.date && <p className="mt-1 text-sm text-rose-400">{attendanceErrors.date.message}</p>}
              </FormField>
              <FormField label="Shift">
                <select
                  {...registerAttendance('shift', { required: 'Shift selection is required' })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
                >
                  <option value="Day">Day</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Night">Night</option>
                </select>
              </FormField>
              <FormField label="Status">
                <select
                  {...registerAttendance('status', { required: 'Status is required' })}
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </FormField>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                disabled={isSubmittingAttendance}
              >
                Record attendance
              </button>
            </form>
          </div>
        </div>
      </div>
      <Modal
        title={isEditMode ? 'Update employee profile' : 'Add new employee'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditMode ? 'Update employee' : 'Save employee'}
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Full name">
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
              placeholder="Enter full name"
            />
            {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
          </FormField>
          <FormField label="Email address">
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
              placeholder="employee@example.edu"
            />
            {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
          </FormField>
          <FormField label="Department">
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
            >
              {departments.length > 0 ? (
                departments.map((department) => (
                  <option key={department.id} value={department.name}>{department.name}</option>
                ))
              ) : (
                <>
                  <option value="Admissions">Admissions</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Library">Library</option>
                  <option value="Security">Security</option>
                </>
              )}
            </select>
            {errors.department && <p className="mt-1 text-sm text-rose-400">{errors.department.message}</p>}
          </FormField>
          <FormField label="Designation">
            <input
              type="text"
              {...register('designation', { required: 'Designation is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
              placeholder="e.g., HR Coordinator"
            />
            {errors.designation && <p className="mt-1 text-sm text-rose-400">{errors.designation.message}</p>}
          </FormField>
          <FormField label="Shift">
            <select
              {...register('shift', { required: 'Shift selection is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
            >
              <option value="Day">Day</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
            </select>
            {errors.shift && <p className="mt-1 text-sm text-rose-400">{errors.shift.message}</p>}
          </FormField>
          <FormField label="Status">
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}
          </FormField>
          <FormField label="Monthly salary">
            <input
              type="number"
              {...register('salary', {
                required: 'Salary is required',
                min: { value: 1000, message: 'Minimum salary 1000' },
              })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
              placeholder="Salary in USD"
            />
            {errors.salary && <p className="mt-1 text-sm text-rose-400">{errors.salary.message}</p>}
          </FormField>
          <FormField label="Joining date">
            <input
              type="date"
              {...register('joinDate', { required: 'Joining date is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400"
            />
            {errors.joinDate && <p className="mt-1 text-sm text-rose-400">{errors.joinDate.message}</p>}
          </FormField>
        </form>
      </Modal>
    </div>
  );
}