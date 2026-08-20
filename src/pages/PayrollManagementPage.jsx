import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Download, Edit3, FileDown, Filter, Lock, FileText, Plus, RefreshCcw, Send, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { useResourceList } from '../hooks/useResourceHooks';
import createResourceService from '../api/resourceService.js';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import IconActionButton from '../components/ui/IconActionButton.jsx';
import { useAuth } from '../services/AuthContext.jsx';
import { createSalaryStructure, updateSalaryStructure } from '../services/salaryStructureService.js';
import { createSalaryRevision, updateSalaryRevision } from '../services/salaryRevisionService.js';
import { createPayrollRun, updatePayrollRun, submitPayrollRun, approvePayrollRun, lockPayrollRun, calculatePayrollBreakdown } from '../services/payrollService.js';
import { createPayslip, buildPayslipPreview } from '../services/payslipService.js';
import { createTaxComponent, updateTaxComponent } from '../services/taxService.js';
import { hasPermission } from '../services/rbac.js';
import { loadPayrollSettings } from '../services/payrollSettings.js';

const formDefaults = {
  name: '',
  employeeName: '',
  employeeId: '',
  frequency: 'Monthly',
  type: '',
  value: '',
  basicSalary: 50000,
  hraPercent: 20,
  daPercent: 5,
  specialAllowancePercent: 10,
  overtimeRate: 1000,
  providentFundPercent: 12,
  esiPercent: 0.75,
  professionalTaxAmount: 200,
  incomeTaxPercent: 5,
  approvedLeaveDays: 0,
  overtimeHours: 0,
  bonusAmount: 0,
  incentiveAmount: 0,
  status: 'Draft',
  period: '',
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

function downloadPayslipPdf(payslip) {
  const lines = [
    ['Employee', payslip.employeeName || 'Employee'],
    ['Employee ID', payslip.employeeId || '-'],
    ['Period', payslip.period || '-'],
    ['Gross salary', `INR ${Number(payslip.grossSalary || 0).toLocaleString()}`],
    ['Deductions', `INR ${Number(payslip.deductions || 0).toLocaleString()}`],
    ['Net salary', `INR ${Number(payslip.netSalary || 0).toLocaleString()}`],
    ['Status', payslip.status || 'Draft'],
  ];
  const pdf = new jsPDF();
  pdf.setFontSize(18);
  pdf.text('Employee Payslip', 20, 20);
  pdf.setFontSize(11);
  lines.forEach(([label, value], index) => pdf.text(`${label}: ${value}`, 20, 38 + index * 10));
  pdf.save(`${payslip.employeeId || payslip.id || 'payslip'}-${payslip.period || 'current'}.pdf`);
}

export default function PayrollManagementPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const payrollSettings = loadPayrollSettings();
  const isPayrollMaster = location.pathname === '/payroll-master';
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [editingRevision, setEditingRevision] = useState(null);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [editingTax, setEditingTax] = useState(null);
  const [form, setForm] = useState(formDefaults);
  const [busyMessage, setBusyMessage] = useState('');

  const { data: structuresData } = useResourceList('salaryStructures', { page: 1, pageSize: 100 });
  const { data: revisionsData } = useResourceList('salaryRevisions', { page: 1, pageSize: 100 });
  const { data: payrollData } = useResourceList('payrollRuns', { page: 1, pageSize: 100 });
  const { data: payslipsData } = useResourceList('payslips', { page: 1, pageSize: 100 });
  const { data: taxData } = useResourceList('taxComponents', { page: 1, pageSize: 100 });

  const salaryStructures = structuresData?.items || [];
  const salaryRevisions = revisionsData?.items || [];
  const payrollRuns = useMemo(() => payrollData?.items || [], [payrollData]);
  const payslips = payslipsData?.items || [];
  const taxComponents = taxData?.items || [];

  const filteredPayrollRuns = useMemo(() => payrollRuns.filter((payroll) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [payroll.employeeName, payroll.employeeId, payroll.period, payroll.status].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'All' || (payroll.status || 'Draft') === statusFilter;
    const matchesPeriod = periodFilter === 'All' || String(payroll.period || '').startsWith(periodFilter);
    return matchesSearch && matchesStatus && matchesPeriod;
  }), [payrollRuns, periodFilter, searchTerm, statusFilter]);

  const resetRunFilters = () => { setSearchTerm(''); setStatusFilter('All'); setPeriodFilter('All'); };
  const payrollPeriods = useMemo(() => [...new Set(payrollRuns.map((payroll) => payroll.period).filter(Boolean))].sort().reverse(), [payrollRuns]);

  const resetForm = () => setForm({ ...formDefaults, frequency: payrollSettings.frequency, employeeId: auth?.user?.id || '', employeeName: auth?.user?.name || '' });

  const handleStructureSubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving salary structure…');
    const payload = { ...form, basicSalary: Number(form.basicSalary || 0), hraPercent: Number(form.hraPercent || 0), daPercent: Number(form.daPercent || 0), specialAllowancePercent: Number(form.specialAllowancePercent || 0), overtimeRate: Number(form.overtimeRate || 0), providentFundPercent: Number(form.providentFundPercent || 0), esiPercent: Number(form.esiPercent || 0), professionalTaxAmount: Number(form.professionalTaxAmount || 0), incomeTaxPercent: Number(form.incomeTaxPercent || 0) };
    if (editingStructure) {
      await updateSalaryStructure(editingStructure.id, payload);
    } else {
      await createSalaryStructure(payload);
    }
    queryClient.invalidateQueries(['salaryStructures']);
    setBusyMessage('');
    setIsStructureModalOpen(false);
    setEditingStructure(null);
    resetForm();
  };

  const handleRevisionSubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving salary revision…');
    const payload = { ...form, effectiveDate: form.period, newBasicSalary: Number(form.basicSalary || 0) };
    if (editingRevision) {
      await updateSalaryRevision(editingRevision.id, payload);
    } else {
      await createSalaryRevision(payload);
    }
    queryClient.invalidateQueries(['salaryRevisions']);
    setBusyMessage('');
    setIsRevisionModalOpen(false);
    setEditingRevision(null);
    resetForm();
  };

  const handlePayrollSubmit = async (event) => {
    event.preventDefault();
    if (!form.employeeName.trim() || !form.period) {
      setBusyMessage('Employee and payroll period are required.');
      return;
    }
    setBusyMessage('Generating payroll…');
    const breakdown = calculatePayrollBreakdown({
      salaryStructure: form,
      attendanceDays: Number(form.attendanceDays || 30),
      approvedLeaveDays: Number(form.approvedLeaveDays || 0),
      overtimeHours: Number(form.overtimeHours || 0),
      bonusAmount: Number(form.bonusAmount || 0),
      incentiveAmount: Number(form.incentiveAmount || 0),
      frequency: form.frequency,
      payrollSettings,
    });
    const payload = {
      ...form,
      employeeName: form.employeeName || auth?.user?.name || 'Employee',
      employeeId: form.employeeId || auth?.user?.id || 'EMP-001',
      grossSalary: breakdown.grossEarnings,
      totalDeductions: breakdown.totalDeductions,
      netSalary: breakdown.netSalary,
      breakdown,
      status: editingPayroll ? form.status : payrollSettings.approvalRequired ? 'Draft' : 'Processed',
    };
    if (editingPayroll) {
      await updatePayrollRun(editingPayroll.id, payload);
    } else {
      await createPayrollRun(payload);
    }
    queryClient.invalidateQueries(['payrollRuns']);
    setBusyMessage('');
    setIsPayrollModalOpen(false);
    setEditingPayroll(null);
    resetForm();
  };

  const handlePayslipCreate = async (payroll) => {
    setBusyMessage('Creating payslip…');
    const payslip = await createPayslip(buildPayslipPreview(payroll));
    queryClient.invalidateQueries(['payslips']);
    downloadPayslipPdf(payslip);
    setBusyMessage('');
  };

  const processPayrollAction = async (payroll, action) => {
    const permissionAction = action === 'edit' ? 'edit' : action === 'delete' ? 'delete' : action === 'submit' || action === 'approve' || action === 'lock' ? 'approve' : 'view';
    if (!hasPermission(auth?.permissions || {}, 'payroll', permissionAction)) return;
    const status = payroll.status || 'Draft';
    if (action === 'submit' && status !== 'Draft') return;
    if (action === 'approve' && !['Review', 'HR Approval', 'Finance Approval'].includes(status)) return;
    if (action === 'lock' && status !== 'Processed') return;
    if (action === 'edit' && ['Locked', 'Processed'].includes(status)) return;
    if (action === 'submit') {
      await submitPayrollRun(payroll.id);
    } else if (action === 'approve') {
      await approvePayrollRun(payroll.id, { remarks: 'Approved from payroll module' });
    } else if (action === 'lock') {
      await lockPayrollRun(payroll.id);
    } else if (action === 'delete') {
      const resource = createResourceService('payrollRuns');
      await resource.remove(payroll.id);
    } else if (action === 'edit') {
      setEditingPayroll(payroll);
      setForm({ ...formDefaults, ...payroll, employeeName: payroll.employeeName, employeeId: payroll.employeeId, period: payroll.period || '' });
      setIsPayrollModalOpen(true);
      return;
    }
    queryClient.invalidateQueries(['payrollRuns']);
  };

  const deleteSalaryStructure = async (structure) => {
    const resource = createResourceService('salaryStructures');
    await resource.remove(structure.id);
    queryClient.invalidateQueries(['salaryStructures']);
  };

  const deleteSalaryRevision = async (revision) => {
    const resource = createResourceService('salaryRevisions');
    await resource.remove(revision.id);
    queryClient.invalidateQueries(['salaryRevisions']);
  };

  const deleteTaxComponent = async (component) => {
    const resource = createResourceService('taxComponents');
    await resource.remove(component.id);
    queryClient.invalidateQueries(['taxComponents']);
  };

  const handleTaxSubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving tax component…');
    const payload = {
      name: form.name,
      type: form.type,
      value: form.value,
      status: form.status,
    };

    if (editingTax) {
      await updateTaxComponent(editingTax.id, payload);
    } else {
      await createTaxComponent(payload);
    }

    queryClient.invalidateQueries(['taxComponents']);
    setBusyMessage('');
    setIsTaxModalOpen(false);
    setEditingTax(null);
    setForm({ ...formDefaults, employeeId: auth?.user?.id || '', employeeName: auth?.user?.name || '' });
  };

  const deletePayslip = async (payslip) => {
    const resource = createResourceService('payslips');
    await resource.remove(payslip.id);
    queryClient.invalidateQueries(['payslips']);
  };

  const exportPayroll = (format = 'csv') => {
    const headers = ['Employee', 'Period', 'Gross', 'Deductions', 'Net', 'Status'];
    const rows = filteredPayrollRuns.map((payroll) => ({ Employee: payroll.employeeName, Period: payroll.period, Gross: payroll.grossSalary || 0, Deductions: payroll.totalDeductions || 0, Net: payroll.netSalary || 0, Status: payroll.status }));
    const content = [headers, ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `payroll-${format}.csv`);
  };

  const payrollSummary = useMemo(() => ({
    due: filteredPayrollRuns.filter((item) => item.status === 'Draft').length,
    processed: filteredPayrollRuns.filter((item) => item.status === 'Processed').length,
    approvals: filteredPayrollRuns.filter((item) => ['Review', 'HR Approval', 'Finance Approval'].includes(item.status)).length,
    salaryExpense: filteredPayrollRuns.reduce((sum, item) => sum + Number(item.netSalary || 0), 0),
    employeesProcessed: filteredPayrollRuns.filter((item) => item.status !== 'Draft').length,
  }), [filteredPayrollRuns]);

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] text-slate-500"><button type="button" onClick={() => navigate(-1)} aria-label="Go back" title="Go back" className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"><ArrowLeft className="h-3.5 w-3.5" /></button><button type="button" onClick={() => navigate('/')} className="transition hover:text-emerald-700">Dashboard</button><span>›</span><button type="button" onClick={() => navigate('/settings/hrm')} className="transition hover:text-emerald-700">HRM Master</button><span>›</span><span className="font-semibold text-slate-700">{isPayrollMaster ? 'Payroll Master' : 'Payroll Management'}</span></div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Payroll &amp; HRM</p>
              <h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">{isPayrollMaster ? 'Payroll Master' : 'Payroll Management'}</h1>
              <p className="mt-1 text-[11px] text-slate-400">{isPayrollMaster ? 'Manage payroll cycles, approvals, salary controls and employee payslips.' : 'Salary structures, payroll runs, tax controls and payslips in one workspace.'}</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button>
              <button type="button" onClick={() => setIsStructureModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Plus className="h-3.5 w-3.5" /> Salary Structure</button>
              <button type="button" onClick={() => setIsRevisionModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><SlidersHorizontal className="h-3.5 w-3.5" /> Salary Revision</button>
              <button type="button" onClick={() => { resetForm(); setIsPayrollModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><CalendarDays className="h-3.5 w-3.5" /> Generate Payroll</button>
            </div>
          </div>
        </div>

        {busyMessage ? <div className="mb-4 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700">{busyMessage}</div> : null}

        <div className="mb-5 rounded-[16px] border border-slate-200 bg-slate-50 p-2.5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {['overview', 'runs', 'structures', 'tax', 'payslips'].map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveSection(tab)} className={`rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition ${activeSection === tab ? 'border-[#0f5132] bg-[#0f5132] text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-[#0f5132]'}`}>
                {tab === 'overview' ? 'Overview' : tab === 'runs' ? 'Payroll Runs' : tab === 'structures' ? 'Structures' : tab === 'tax' ? 'Tax' : 'Payslips'}
              </button>
            ))}
          </div>
        </div>

        {activeSection === 'overview' && (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Payroll due</p><p className="mt-3 text-2xl font-semibold text-slate-950">{payrollSummary.due}</p></div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Processed</p><p className="mt-3 text-2xl font-semibold text-slate-950">{payrollSummary.processed}</p></div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pending approvals</p><p className="mt-3 text-2xl font-semibold text-slate-950">{payrollSummary.approvals}</p></div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Salary expense</p><p className="mt-3 text-2xl font-semibold text-slate-950">₹{payrollSummary.salaryExpense.toLocaleString()}</p></div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Employees processed</p><p className="mt-3 text-2xl font-semibold text-slate-950">{payrollSummary.employeesProcessed}</p></div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Salary structures</h3>
            <div className="mt-4 space-y-2">
              {salaryStructures.slice(0, 4).map((structure) => <div key={structure.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">{structure.name} · ₹{Number(structure.basicSalary || 0).toLocaleString()}</div>)}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'runs' && (
        <div className="space-y-4">
          <div className="rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Filter className="h-3.5 w-3.5" /> Payroll Run Filters</div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              <label htmlFor="payroll-run-search" className="text-[10px] font-semibold text-slate-600">Employee or period<input id="payroll-run-search" name="payroll_run_search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search payroll run..." className="mt-1 h-[24px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400" /></label>
              <label htmlFor="payroll-run-status" className="text-[10px] font-semibold text-slate-600">Status<select id="payroll-run-status" name="payroll_run_status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1 h-[24px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400"><option>All</option><option>Draft</option><option>Review</option><option>HR Approval</option><option>Finance Approval</option><option>Locked</option><option>Processed</option></select></label>
              <label htmlFor="payroll-run-period" className="text-[10px] font-semibold text-slate-600">Payroll period<select id="payroll-run-period" name="payroll_run_period" value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)} className="mt-1 h-[24px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400"><option>All</option>{payrollPeriods.map((period) => <option key={period}>{period}</option>)}</select></label>
              <div className="flex items-end justify-end gap-2"><button type="button" onClick={() => exportPayroll('csv')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Download className="h-3 w-3" /> Export CSV</button><button type="button" onClick={resetRunFilters} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><RefreshCcw className="h-3 w-3" /> Reset</button></div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><CalendarDays className="h-3.5 w-3.5" /> Payroll Runs</div><span className="text-[10px] text-slate-500">{filteredPayrollRuns.length} records</span></div>
            {filteredPayrollRuns.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No payroll runs found.
              </div>
            ) : (
              <div className="overflow-x-auto"><table className="min-w-[980px] w-full border-collapse text-center text-[10px]"><thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Employee</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Period</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Gross</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Deductions</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Net Salary</th><th className="border-r border-white/30 px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Actions</th></tr></thead><tbody>{filteredPayrollRuns.map((payroll) => <tr key={payroll.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="border-r border-white px-3 py-2 text-left font-semibold text-slate-900">{payroll.employeeName || payroll.employeeId || 'Employee'}</td><td className="border-r border-white px-3 py-2">{payroll.period || '-'}</td><td className="border-r border-white px-3 py-2">₹{Number(payroll.grossSalary || 0).toLocaleString()}</td><td className="border-r border-white px-3 py-2">₹{Number(payroll.totalDeductions || 0).toLocaleString()}</td><td className="border-r border-white px-3 py-2 font-semibold text-slate-900">₹{Number(payroll.netSalary || 0).toLocaleString()}</td><td className="border-r border-white px-3 py-2"><StatusBadge status={payroll.status} /></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><IconActionButton icon={Send} title="Submit payroll" ariaLabel="Submit payroll" variant="primary" className="h-6 w-6" onClick={() => processPayrollAction(payroll, 'submit')} /><IconActionButton icon={CheckCircle2} title="Approve payroll" ariaLabel="Approve payroll" variant="success" className="h-6 w-6" onClick={() => processPayrollAction(payroll, 'approve')} /><IconActionButton icon={Lock} title="Lock payroll" ariaLabel="Lock payroll" className="h-6 w-6" onClick={() => processPayrollAction(payroll, 'lock')} /><IconActionButton icon={Edit3} title="Edit payroll" ariaLabel="Edit payroll" className="h-6 w-6" onClick={() => processPayrollAction(payroll, 'edit')} /><IconActionButton icon={FileText} title="Create payslip" ariaLabel="Create payslip" className="h-6 w-6" onClick={() => handlePayslipCreate(payroll)} /></div></td></tr>)}</tbody></table></div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'structures' && (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Salary structures</h3>
            <div className="mt-4 space-y-3">
              {salaryStructures.map((structure) => (
              <div key={structure.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{structure.name}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setEditingStructure(structure); setForm({ ...formDefaults, ...structure }); setIsStructureModalOpen(true); }} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => deleteSalaryStructure(structure)} className="rounded-full border border-slate-200 bg-white p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">Basic: ₹{Number(structure.basicSalary || 0).toLocaleString()} · HRA {structure.hraPercent}% · PF {structure.providentFundPercent}%</p>
              </div>
            ))}
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Salary revisions</h3>
            <div className="mt-4 space-y-3">
              {salaryRevisions.map((revision) => (
                <div key={revision.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{revision.employeeName}</p>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => { setEditingRevision(revision); setForm({ ...formDefaults, ...revision, employeeName: revision.employeeName, period: revision.effectiveDate || revision.period || '' }); setIsRevisionModalOpen(true); }} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => deleteSalaryRevision(revision)} className="rounded-full border border-slate-200 bg-white p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Effective {revision.effectiveDate || revision.period} · ₹{Number(revision.newBasicSalary || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'tax' && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-950">Tax configuration</h3>
            <button type="button" onClick={() => { setEditingTax(null); setForm({ ...formDefaults, employeeId: auth?.user?.id || '', employeeName: auth?.user?.name || '' }); setIsTaxModalOpen(true); }} className="rounded-2xl bg-[#0a2e1a] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#051f0f]">Add component</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {taxComponents.map((component) => (
              <div key={component.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{component.name}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setEditingTax(component); setForm({ ...formDefaults, ...component, name: component.name, type: component.type, value: component.value, status: component.status || 'Active' }); setIsTaxModalOpen(true); }} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => deleteTaxComponent(component)} className="rounded-full border border-slate-200 bg-white p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{component.type} · {component.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'payslips' && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Payslips</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {payslips.map((payslip) => (
              <div key={payslip.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{payslip.employeeName}</p>
                  <button type="button" onClick={() => deletePayslip(payslip)} className="rounded-full border border-slate-200 bg-white p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <p className="mt-2 text-sm text-slate-600">{payslip.period} · Net ₹{Number(payslip.netSalary || 0).toLocaleString()}</p>
                <button type="button" onClick={() => downloadPayslipPdf(payslip)} className="mt-3 rounded-3xl border border-slate-300 bg-white px-3 py-2 text-sm">Download PDF</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal title={editingStructure ? 'Update salary structure' : 'Create salary structure'} isOpen={isStructureModalOpen} onClose={() => { setIsStructureModalOpen(false); setEditingStructure(null); resetForm(); }} footer={<button type="button" onClick={handleStructureSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border">Save structure</button>}>
        <form className="space-y-4" onSubmit={handleStructureSubmit}>
          <FormField label="Structure name"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Frequency"><select value={form.frequency} onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"><option>Monthly</option><option>Weekly</option><option>Daily</option><option>Contract</option></select></FormField>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Basic salary"><input type="number" value={form.basicSalary} onChange={(event) => setForm((current) => ({ ...current, basicSalary: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField><FormField label="HRA %"><input type="number" value={form.hraPercent} onChange={(event) => setForm((current) => ({ ...current, hraPercent: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="DA %"><input type="number" value={form.daPercent} onChange={(event) => setForm((current) => ({ ...current, daPercent: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField><FormField label="Special allowance %"><input type="number" value={form.specialAllowancePercent} onChange={(event) => setForm((current) => ({ ...current, specialAllowancePercent: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Overtime rate"><input type="number" value={form.overtimeRate} onChange={(event) => setForm((current) => ({ ...current, overtimeRate: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField><FormField label="PF %"><input type="number" value={form.providentFundPercent} onChange={(event) => setForm((current) => ({ ...current, providentFundPercent: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="ESI %"><input type="number" value={form.esiPercent} onChange={(event) => setForm((current) => ({ ...current, esiPercent: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField><FormField label="Professional tax"><input type="number" value={form.professionalTaxAmount} onChange={(event) => setForm((current) => ({ ...current, professionalTaxAmount: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField></div>
          <FormField label="Income tax %"><input type="number" value={form.incomeTaxPercent} onChange={(event) => setForm((current) => ({ ...current, incomeTaxPercent: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title={editingRevision ? 'Update salary revision' : 'Create salary revision'} isOpen={isRevisionModalOpen} onClose={() => { setIsRevisionModalOpen(false); setEditingRevision(null); resetForm(); }} footer={<button type="button" onClick={handleRevisionSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border">Save revision</button>}>
        <form className="space-y-4" onSubmit={handleRevisionSubmit}>
          <FormField label="Employee name"><input value={form.employeeName} onChange={(event) => setForm((current) => ({ ...current, employeeName: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Effective date"><input type="date" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="New basic salary"><input type="number" value={form.basicSalary} onChange={(event) => setForm((current) => ({ ...current, basicSalary: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title={editingPayroll ? 'Update payroll run' : 'Generate payroll run'} isOpen={isPayrollModalOpen} onClose={() => { setIsPayrollModalOpen(false); setEditingPayroll(null); resetForm(); }} footer={<button type="button" onClick={handlePayrollSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover-gradient-border">Save run</button>}>
        <form className="space-y-4" onSubmit={handlePayrollSubmit}>
          <FormField label="Employee"><input value={form.employeeName} onChange={(event) => setForm((current) => ({ ...current, employeeName: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Period"><input type="month" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
          <FormField label="Frequency"><select value={form.frequency} onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"><option>Monthly</option><option>Weekly</option><option>Daily</option><option>Contract</option></select></FormField>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Attendance days"><input type="number" value={form.attendanceDays || 30} onChange={(event) => setForm((current) => ({ ...current, attendanceDays: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField><FormField label="Approved leave days"><input type="number" value={form.approvedLeaveDays || 0} onChange={(event) => setForm((current) => ({ ...current, approvedLeaveDays: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Overtime hours"><input type="number" value={form.overtimeHours || 0} onChange={(event) => setForm((current) => ({ ...current, overtimeHours: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField><FormField label="Bonus"><input type="number" value={form.bonusAmount || 0} onChange={(event) => setForm((current) => ({ ...current, bonusAmount: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField></div>
          <FormField label="Incentive"><input type="number" value={form.incentiveAmount || 0} onChange={(event) => setForm((current) => ({ ...current, incentiveAmount: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" /></FormField>
        </form>
      </Modal>

      <Modal title={editingTax ? 'Update tax component' : 'Add tax component'} isOpen={isTaxModalOpen} onClose={() => { setIsTaxModalOpen(false); setEditingTax(null); resetForm(); }} footer={<button type="button" onClick={handleTaxSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Save component</button>}>
        <form className="space-y-4" onSubmit={handleTaxSubmit}>
          <FormField label="Component name"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none hover-gradient-border" /></FormField>
          <FormField label="Type"><input value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none hover-gradient-border" /></FormField>
          <FormField label="Value"><input value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none hover-gradient-border" /></FormField>
          <FormField label="Status"><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"><option>Active</option><option>Inactive</option></select></FormField>
        </form>
      </Modal>
    </div>
  </div>
  );
}
