import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Edit3, Lock, FileText, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useResourceList } from '../hooks/useResourceHooks';
import createResourceService from '../api/resourceService.js';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
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

const formDefaults = {
  name: '',
  employeeName: '',
  employeeId: '',
  frequency: 'Monthly',
  type: '',
  value: '',
  status: 'Active',
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

export default function PayrollManagementPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
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

  const { data: structuresData } = useResourceList('salaryStructures', { page: 1, pageSize: 200 });
  const { data: revisionsData } = useResourceList('salaryRevisions', { page: 1, pageSize: 200 });
  const { data: payrollData } = useResourceList('payrollRuns', { page: 1, pageSize: 200 });
  const { data: payslipsData } = useResourceList('payslips', { page: 1, pageSize: 200 });
  const { data: taxData } = useResourceList('taxComponents', { page: 1, pageSize: 200 });

  const salaryStructures = structuresData?.items || [];
  const salaryRevisions = revisionsData?.items || [];
  const payrollRuns = payrollData?.items || [];
  const payslips = payslipsData?.items || [];
  const taxComponents = taxData?.items || [];

  const filteredPayrollRuns = useMemo(() => payrollRuns.filter((payroll) => {
    const term = searchTerm.toLowerCase();
    return [payroll.employeeName, payroll.period, payroll.status].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
  }), [payrollRuns, searchTerm]);

  const resetForm = () => setForm({ ...formDefaults, employeeId: auth?.user?.id || '', employeeName: auth?.user?.name || '' });

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
    setBusyMessage('Generating payroll…');
    const breakdown = calculatePayrollBreakdown({
      salaryStructure: form,
      attendanceDays: Number(form.attendanceDays || 30),
      approvedLeaveDays: Number(form.approvedLeaveDays || 0),
      overtimeHours: Number(form.overtimeHours || 0),
      bonusAmount: Number(form.bonusAmount || 0),
      incentiveAmount: Number(form.incentiveAmount || 0),
      frequency: form.frequency,
    });
    const payload = {
      ...form,
      employeeName: form.employeeName || auth?.user?.name || 'Employee',
      employeeId: form.employeeId || auth?.user?.id || 'EMP-001',
      grossSalary: breakdown.grossEarnings,
      totalDeductions: breakdown.totalDeductions,
      netSalary: breakdown.netSalary,
      breakdown,
      status: editingPayroll ? form.status : 'Draft',
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
    await createPayslip(buildPayslipPreview(payroll));
    queryClient.invalidateQueries(['payslips']);
    setBusyMessage('');
  };

  const processPayrollAction = async (payroll, action) => {
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
    <div className="min-h-screen bg-[#eef1f4] p-2 sm:p-3">
      <div className="rounded-[20px] border border-slate-200 bg-[#f3f4f6] p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div className="rounded-[16px] border border-slate-200 bg-white/90 p-2.5 sm:p-3">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Go back"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 sm:gap-2">
              <button type="button" onClick={() => navigate('/')} className="transition hover:text-slate-700">Dashboard</button>
              <span>›</span>
              <button type="button" onClick={() => navigate('/settings/hrm')} className="transition hover:text-slate-700">HRM Master</button>
              <span>›</span>
              <span className="font-medium text-slate-700">Payroll Management</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-0.5">
              <h1 className="text-[1.55rem] font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[1.85rem]">
                Payroll Management
              </h1>
              <p className="text-[0.65rem] font-normal leading-tight text-slate-500 sm:text-[0.7rem]">
                Salary Structures, Payroll Runs & Tax Controls
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button type="button" onClick={() => setIsStructureModalOpen(true)} className="rounded-2xl bg-[#0a2e1a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#051f0f] sm:px-3.5 sm:py-2 sm:text-sm">Salary structures</button>
              <button type="button" onClick={() => setIsRevisionModalOpen(true)} className="rounded-2xl bg-[#0a2e1a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#051f0f] sm:px-3.5 sm:py-2 sm:text-sm">Salary revision</button>
              <button type="button" onClick={() => setIsPayrollModalOpen(true)} className="rounded-2xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-3.5 sm:py-2 sm:text-sm">Generate payroll</button>
            </div>
          </div>
        </div>

        {busyMessage ? <div className="mt-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{busyMessage}</div> : null}

        <div className="mt-3 rounded-[20px] border border-slate-200 bg-slate-50 p-2.5 shadow-sm">
          <div className="flex flex-wrap gap-1.5">
            {['overview', 'runs', 'structures', 'tax', 'payslips'].map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveSection(tab)} className={`rounded-2xl border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${activeSection === tab ? 'border-[#0a2e1a] bg-[#0a2e1a] text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-[#0a2e1a] hover:text-white'}`}>
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
          <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search payroll run" className="w-full max-w-md rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
            <button type="button" onClick={() => exportPayroll('csv')} className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Export CSV</button>
            <button type="button" className="rounded-3xl bg-[#0a2e1a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#051f0f]">Upload Excel</button>
          </div>

          <div className="grid gap-4">
            {filteredPayrollRuns.length === 0 ? (
              <div className="rounded-[20px] border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                No payroll runs found.
              </div>
            ) : (
              filteredPayrollRuns.map((payroll) => (
                <div key={payroll.id} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{payroll.employeeName}</h3>
                        <StatusBadge status={payroll.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{payroll.period} · {payroll.employeeId}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <IconActionButton icon={Send} title="Submit payroll" ariaLabel="Submit payroll" variant="primary" className="h-8 w-8" onClick={() => processPayrollAction(payroll, 'submit')} />
                      <IconActionButton icon={CheckCircle2} title="Approve payroll" ariaLabel="Approve payroll" variant="success" className="h-8 w-8" onClick={() => processPayrollAction(payroll, 'approve')} />
                      <IconActionButton icon={Lock} title="Lock payroll" ariaLabel="Lock payroll" className="h-8 w-8" onClick={() => processPayrollAction(payroll, 'lock')} />
                      <IconActionButton icon={Edit3} title="Edit payroll" ariaLabel="Edit payroll" className="h-8 w-8" onClick={() => processPayrollAction(payroll, 'edit')} />
                      <IconActionButton icon={FileText} title="Create payslip" ariaLabel="Create payslip" className="h-8 w-8" onClick={() => handlePayslipCreate(payroll)} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Gross</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">₹{Number(payroll.grossSalary || 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Deductions</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">₹{Number(payroll.totalDeductions || 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Net Salary</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">₹{Number(payroll.netSalary || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
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
                <button type="button" onClick={() => downloadBlob(new Blob([JSON.stringify(payslip)], { type: 'application/json' }), `${payslip.id}.json`)} className="mt-3 rounded-3xl border border-slate-300 bg-white px-3 py-2 text-sm">Download</button>
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
