import { useMemo, useState } from 'react';
import { BriefcaseBusiness, Check, Copy, Download, Eye, FileDown, Hash, Pencil, Plus, RotateCcw, Search, Settings2, ShieldCheck, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const storageKey = 'erp:employee-id-settings';
const defaults = {
  prefix: 'EMP',
  separator: '-',
  digits: 4,
  nextSequence: 1001,
  includeYear: true,
  status: 'Active',
};

const readSettings = () => {
  if (typeof window === 'undefined') return defaults;
  try {
    return { ...defaults, ...JSON.parse(window.localStorage.getItem(storageKey) || '{}') };
  } catch {
    return defaults;
  }
};

const buildEmployeeId = (settings, sequence = settings.nextSequence) => {
  const year = settings.includeYear ? `${new Date().getFullYear()}${settings.separator}` : '';
  return `${String(settings.prefix || 'EMP').toUpperCase()}${settings.separator}${year}${String(sequence).padStart(Number(settings.digits) || 4, '0')}`;
};

const getEmployeeName = (employee) => [employee.first_name, employee.last_name].filter(Boolean).join(' ') || employee.name || employee.employee_code || employee.id || 'Unnamed employee';
const getEmployeeCode = (employee) => employee.employee_code || employee.employeeCode || employee.code || '';

export default function EmployeeIdSetupPage() {
  const [settings, setSettings] = useState(readSettings);
  const [draftSettings, setDraftSettings] = useState(readSettings);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignEmployee, setAssignEmployee] = useState(null);
  const [assignSequence, setAssignSequence] = useState(String(settings.nextSequence));

  const { data: employeesData, isLoading } = useResourceList('employees', { page: 1, pageSize: 500 });
  const updateEmployee = useUpdateResource('employees');
  const employees = useMemo(() => employeesData?.items || [], [employeesData]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const status = employee.status || 'Active';
      const matchesSearch = !query || [getEmployeeName(employee), getEmployeeCode(employee), employee.department, employee.designation, employee.email].filter(Boolean).join(' ').toLowerCase().includes(query);
      return matchesSearch && (statusFilter === 'All' || status === statusFilter);
    });
  }, [employees, search, statusFilter]);

  const assignedCount = employees.filter((employee) => getEmployeeCode(employee)).length;
  const activeCount = employees.filter((employee) => (employee.status || 'Active') === 'Active').length;
  const unassignedCount = employees.length - assignedCount;

  const saveSettings = (event) => {
    event.preventDefault();
    const next = { ...draftSettings, prefix: String(draftSettings.prefix || 'EMP').trim().replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase(), digits: Math.min(8, Math.max(2, Number(draftSettings.digits) || 4)), nextSequence: Math.max(1, Number(draftSettings.nextSequence) || 1) };
    setSettings(next);
    setDraftSettings(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setIsSettingsOpen(false);
    toast.success('Employee ID policy saved');
  };

  const resetSettings = () => {
    setDraftSettings(defaults);
    setSettings(defaults);
    window.localStorage.removeItem(storageKey);
    toast.success('Employee ID policy reset');
  };

  const openAssign = (employee) => {
    setAssignEmployee(employee);
    setAssignSequence(String(settings.nextSequence));
    setIsAssignOpen(true);
  };

  const assignId = async (event) => {
    event.preventDefault();
    if (!assignEmployee) return;
    const employeeCode = buildEmployeeId(settings, Number(assignSequence));
    try {
      await updateEmployee.mutateAsync({ id: assignEmployee.id, payload: { ...assignEmployee, employee_code: employeeCode } });
      const nextSettings = { ...settings, nextSequence: Number(assignSequence) + 1 };
      setSettings(nextSettings);
      setDraftSettings(nextSettings);
      window.localStorage.setItem(storageKey, JSON.stringify(nextSettings));
      toast.success(`${employeeCode} assigned successfully`);
      setIsAssignOpen(false);
    } catch {
      toast.error('Unable to assign employee ID');
    }
  };

  const exportCsv = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Status', 'Email'];
    const rows = filteredEmployees.map((employee) => [getEmployeeCode(employee) || 'Unassigned', getEmployeeName(employee), employee.department || '-', employee.designation || '-', employee.status || 'Active', employee.email || '-']);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee-id-roster.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3"><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Employee ID Setup' }]} /></div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">Employee ID Setup</h1><p className="mt-1 text-[11px] text-slate-400">Control employee identity numbering and keep the workforce roster consistent.</p></div>
            <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button><button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" /> Export</button><button type="button" onClick={() => { setDraftSettings(settings); setIsSettingsOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f5132] bg-white px-3 py-2 text-xs font-semibold text-[#0f5132] hover:bg-emerald-50"><Settings2 className="h-3.5 w-3.5" /> ID Policy</button><button type="button" onClick={() => { setAssignEmployee(null); setIsAssignOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" /> Assign ID</button></div>
          </div>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total employees</p><Users className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-2xl font-semibold text-slate-950">{employees.length}</p><p className="mt-1 text-[10px] text-slate-400">Current HR roster</p></div><div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">IDs assigned</p><Check className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-2xl font-semibold text-slate-950">{assignedCount}</p><p className="mt-1 text-[10px] text-emerald-600">{employees.length ? Math.round((assignedCount / employees.length) * 100) : 0}% coverage</p></div><div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Unassigned</p><Hash className="h-4 w-4 text-amber-500" /></div><p className="mt-3 text-2xl font-semibold text-slate-950">{unassignedCount}</p><p className="mt-1 text-[10px] text-amber-600">Needs attention</p></div><div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Active workforce</p><ShieldCheck className="h-4 w-4 text-sky-600" /></div><p className="mt-3 text-2xl font-semibold text-slate-950">{activeCount}</p><p className="mt-1 text-[10px] text-slate-400">Eligible employees</p></div></section>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" /> Filters &amp; Search</div><div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4"><label htmlFor="employee-id-search" className="text-[10px] font-semibold text-slate-600">Search employee or ID<input id="employee-id-search" name="employee_id_search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, ID, department..." className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400" /></label><label htmlFor="employee-id-status" className="text-[10px] font-semibold text-slate-600">Status<select id="employee-id-status" name="employee_id_status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] font-normal outline-none focus:border-emerald-400"><option>All</option><option>Active</option><option>On Leave</option><option>Resigned</option></select></label><div className="flex items-end"><div className="w-full rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] text-emerald-800"><span className="font-semibold">Format preview:</span> {buildEmployeeId(settings)}</div></div><button type="button" onClick={() => { setSearch(''); setStatusFilter('All'); }} className="inline-flex h-[28px] items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"><RotateCcw className="h-3 w-3" /> Reset filters</button></div></section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><BriefcaseBusiness className="h-3.5 w-3.5" /> Employee ID Roster</div><span className="text-[10px] text-slate-500">Showing {filteredEmployees.length} of {employees.length} employees</span></div><div className="overflow-x-auto"><table className="min-w-[900px] w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5 font-semibold">S.No.</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Employee ID</th><th className="border-r border-white/30 px-3 py-2.5 text-left font-semibold">Employee</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Department</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Designation</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="7" className="py-12 text-center text-slate-500">Loading employee roster...</td></tr> : filteredEmployees.length === 0 ? <tr><td colSpan="7" className="py-12 text-center text-slate-500">No employees found.</td></tr> : filteredEmployees.map((employee, index) => <tr key={employee.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2">{index + 1}</td><td className="border-r border-white px-3 py-2 font-semibold text-emerald-700">{getEmployeeCode(employee) || <span className="text-amber-600">Unassigned</span>}</td><td className="border-r border-white px-3 py-2 text-left font-semibold text-slate-900">{getEmployeeName(employee)}<span className="block text-[9px] font-normal text-slate-400">{employee.email || 'No email available'}</span></td><td className="border-r border-white px-3 py-2">{employee.department || '-'}</td><td className="border-r border-white px-3 py-2">{employee.designation || '-'}</td><td className="border-r border-white px-3 py-2"><span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">{employee.status || 'Active'}</span></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => { setSelected(employee); setIsViewOpen(true); }} aria-label="View employee ID details" title="View" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openAssign(employee)} aria-label="Assign or regenerate employee ID" title={getEmployeeCode(employee) ? 'Regenerate ID' : 'Assign ID'} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div></section>
      </div>

      {isSettingsOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Configuration</p><h2 className="text-xl font-semibold text-slate-900">Employee ID Policy</h2></div><button type="button" onClick={() => setIsSettingsOpen(false)} aria-label="Close policy" className="text-slate-500 hover:text-slate-900"><X className="h-4 w-4" /></button></div><form onSubmit={saveSettings} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Prefix<input value={draftSettings.prefix} onChange={(event) => setDraftSettings({ ...draftSettings, prefix: event.target.value })} maxLength={8} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" placeholder="EMP" /></label><label className="text-sm font-medium text-slate-700">Separator<select value={draftSettings.separator} onChange={(event) => setDraftSettings({ ...draftSettings, separator: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"><option value="-">Hyphen (-)</option><option value="/">Slash (/)</option><option value="">No separator</option></select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Number of digits<input type="number" min="2" max="8" value={draftSettings.digits} onChange={(event) => setDraftSettings({ ...draftSettings, digits: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><label className="text-sm font-medium text-slate-700">Next sequence<input type="number" min="1" value={draftSettings.nextSequence} onChange={(event) => setDraftSettings({ ...draftSettings, nextSequence: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label></div><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"><input type="checkbox" checked={draftSettings.includeYear} onChange={(event) => setDraftSettings({ ...draftSettings, includeYear: event.target.checked })} className="h-4 w-4 accent-emerald-700" /> Include current year in employee ID</label><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs font-semibold text-emerald-800">Live preview</p><p className="mt-2 font-mono text-xl font-semibold text-emerald-950">{buildEmployeeId(draftSettings)}</p></div><div className="flex justify-between gap-3 pt-2"><button type="button" onClick={resetSettings} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" /> Reset policy</button><div className="flex gap-3"><button type="button" onClick={() => setIsSettingsOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button><button type="submit" className="rounded-lg bg-[#0f5132] px-4 py-2.5 text-sm font-semibold text-white">Save policy</button></div></div></form></div></div>}

      {isAssignOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Roster action</p><h2 className="text-xl font-semibold text-slate-900">Assign Employee ID</h2></div><button type="button" onClick={() => setIsAssignOpen(false)} aria-label="Close assign dialog"><X className="h-4 w-4 text-slate-500" /></button></div><form onSubmit={assignId} className="space-y-4"><label className="text-sm font-medium text-slate-700">Employee<select required value={assignEmployee?.id || ''} onChange={(event) => setAssignEmployee(employees.find((employee) => String(employee.id) === event.target.value) || null)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{getEmployeeName(employee)} {getEmployeeCode(employee) ? `(${getEmployeeCode(employee)})` : ''}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Sequence number<input type="number" min="1" required value={assignSequence} onChange={(event) => setAssignSequence(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" /></label><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs text-emerald-700">New employee ID</p><p className="mt-1 font-mono text-lg font-semibold text-emerald-950">{buildEmployeeId(settings, Number(assignSequence) || settings.nextSequence)}</p></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setIsAssignOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button><button type="submit" disabled={updateEmployee.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Check className="h-3.5 w-3.5" /> {updateEmployee.isPending ? 'Saving...' : 'Assign ID'}</button></div></form></div></div>}

      {isViewOpen && selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Employee record</p><h2 className="text-xl font-semibold text-slate-900">ID Details</h2></div><button type="button" onClick={() => { setIsViewOpen(false); setSelected(null); }} aria-label="Close details"><X className="h-4 w-4 text-slate-500" /></button></div><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-center"><p className="text-xs text-emerald-700">Employee ID</p><p className="mt-2 font-mono text-2xl font-semibold text-emerald-950">{getEmployeeCode(selected) || 'Unassigned'}</p></div><div className="mt-4 grid gap-3 text-sm text-slate-700"><p><strong>Employee:</strong> {getEmployeeName(selected)}</p><p><strong>Department:</strong> {selected.department || '-'}</p><p><strong>Designation:</strong> {selected.designation || '-'}</p><p><strong>Status:</strong> {selected.status || 'Active'}</p><p><strong>Email:</strong> {selected.email || '-'}</p></div><div className="mt-5 flex justify-end"><button type="button" onClick={() => { navigator.clipboard?.writeText(getEmployeeCode(selected)); toast.success('Employee ID copied'); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white"><Copy className="h-3.5 w-3.5" /> Copy ID</button></div></div></div>}
    </div>
  );
}
