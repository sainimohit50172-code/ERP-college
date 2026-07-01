import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useResourceList } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useAuth } from '../services/AuthContext.jsx';
import { createLeavePolicy, updateLeavePolicy } from '../services/leavePolicyService.js';
import { createLeaveRequest, updateLeaveRequest, submitLeaveRequest, approveLeaveRequest, rejectLeaveRequest, cancelLeaveRequest } from '../services/leaveRequestService.js';
import { createHoliday, updateHoliday } from '../services/holidayService.js';
import { buildLeaveBalanceSummary, calculateLeaveBalanceSnapshot } from '../services/leaveBalanceService.js';

const policyDefaults = {
  leaveType: 'Casual Leave',
  annualAllocation: 12,
  carryForward: 3,
  encashmentEligible: false,
  genderRestriction: '',
  probationRestricted: true,
  maxConsecutiveDays: 3,
  active: true,
};

const requestDefaults = {
  employeeId: '',
  employeeName: '',
  leaveType: 'Casual Leave',
  startDate: '',
  endDate: '',
  days: 1,
  reason: '',
  status: 'Draft',
  supportingDocuments: '',
};

const holidayDefaults = {
  title: '',
  date: '',
  type: 'Public',
};

const requestStatuses = ['All', 'Draft', 'Submitted', 'Manager Review', 'HR Review', 'Approved', 'Rejected', 'Cancelled'];

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

function toCsv(rows, headers) {
  const content = [headers, ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  return new Blob([content], { type: 'text/csv;charset=utf-8;' });
}

function toExcelXml(rows, headers) {
  const sheetRows = [
    `<row><c t="inlineStr"><is><t>${headers.join('</t></is></c><c t="inlineStr"><is><t>')}</t></is></c></row>`,
    ...rows.map((row) => `<row>${headers.map((header) => `<c t="inlineStr"><is><t>${String(row[header] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</t></is></c>`).join('')}</row>`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows.join('')}</sheetData></worksheet>`;
  return new Blob([xml], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export default function LeaveManagementPage() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('All');
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [policyForm, setPolicyForm] = useState(policyDefaults);
  const [requestForm, setRequestForm] = useState(requestDefaults);
  const [holidayForm, setHolidayForm] = useState(holidayDefaults);
  const [busyMessage, setBusyMessage] = useState('');

  const { data: policiesData } = useResourceList('leavePolicies', { page: 1, pageSize: 200 });
  const { data: requestsData } = useResourceList('leaveRequests', { page: 1, pageSize: 200 });
  const { data: holidaysData } = useResourceList('holidays', { page: 1, pageSize: 200 });

  const policies = policiesData?.items || [];
  const requests = requestsData?.items || [];
  const holidays = holidaysData?.items || [];

  const filteredRequests = useMemo(() => requests.filter((request) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = [request.employeeName, request.leaveType, request.reason, request.status]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(search));
    const matchesStatus = requestStatusFilter === 'All' || request.status === requestStatusFilter;
    return matchesSearch && matchesStatus;
  }), [requests, searchTerm, requestStatusFilter]);

  const balanceSummary = useMemo(() => {
    const rows = policies.map((policy) => {
      const approvedDays = requests.filter((request) => request.leaveType === policy.leaveType && request.status === 'Approved').reduce((sum, request) => sum + Number(request.days || 0), 0);
      const pendingDays = requests.filter((request) => request.leaveType === policy.leaveType && ['Submitted', 'Manager Review', 'HR Review'].includes(request.status)).reduce((sum, request) => sum + Number(request.days || 0), 0);
      return calculateLeaveBalanceSnapshot({
        annualAllocation: policy.annualAllocation || 0,
        used: approvedDays,
        pendingApproval: pendingDays,
        carryForward: policy.carryForward || 0,
        expiredBalance: 0,
      });
    });
    return buildLeaveBalanceSummary(rows);
  }, [policies, requests]);

  const upcomingHolidays = useMemo(() => [...holidays].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6), [holidays]);

  const resetPolicyForm = () => {
    setPolicyForm(policyDefaults);
    setEditingPolicy(null);
  };

  const resetRequestForm = () => {
    setRequestForm({ ...requestDefaults, employeeId: auth?.user?.id || '', employeeName: auth?.user?.name || '' });
    setEditingRequest(null);
  };

  const resetHolidayForm = () => {
    setHolidayForm(holidayDefaults);
    setEditingHoliday(null);
  };

  const handlePolicySubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving leave policy…');
    const payload = { ...policyForm, annualAllocation: Number(policyForm.annualAllocation || 0), carryForward: Number(policyForm.carryForward || 0), maxConsecutiveDays: Number(policyForm.maxConsecutiveDays || 0) };
    if (editingPolicy) {
      await updateLeavePolicy(editingPolicy.id, payload);
    } else {
      await createLeavePolicy(payload);
    }
    queryClient.invalidateQueries(['leavePolicies']);
    setBusyMessage('');
    setIsPolicyModalOpen(false);
    resetPolicyForm();
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving leave request…');
    const payload = {
      ...requestForm,
      employeeId: requestForm.employeeId || auth?.user?.id || 'EMP-001',
      employeeName: requestForm.employeeName || auth?.user?.name || 'Current Employee',
      days: Number(requestForm.days || 0),
      status: editingRequest ? requestForm.status : 'Draft',
      supportingDocuments: requestForm.supportingDocuments || '',
    };
    if (editingRequest) {
      await updateLeaveRequest(editingRequest.id, payload);
    } else {
      await createLeaveRequest(payload);
    }
    queryClient.invalidateQueries(['leaveRequests']);
    setBusyMessage('');
    setIsRequestModalOpen(false);
    resetRequestForm();
  };

  const handleHolidaySubmit = async (event) => {
    event.preventDefault();
    setBusyMessage('Saving holiday…');
    if (editingHoliday) {
      await updateHoliday(editingHoliday.id, holidayForm);
    } else {
      await createHoliday(holidayForm);
    }
    queryClient.invalidateQueries(['holidays']);
    setBusyMessage('');
    setIsHolidayModalOpen(false);
    resetHolidayForm();
  };

  const handleAction = async (request, action) => {
    if (action === 'submit') {
      await submitLeaveRequest(request.id);
    } else if (action === 'approve') {
      await approveLeaveRequest(request.id, { remarks: 'Approved from leave management module' });
    } else if (action === 'reject') {
      await rejectLeaveRequest(request.id, { remarks: 'Rejected from leave management module' });
    } else if (action === 'cancel') {
      await cancelLeaveRequest(request.id);
    } else if (action === 'review') {
      await updateLeaveRequest(request.id, { ...request, status: 'Manager Review' });
    } else if (action === 'hr') {
      await updateLeaveRequest(request.id, { ...request, status: 'HR Review' });
    }
    queryClient.invalidateQueries(['leaveRequests']);
  };

  const bulkApprove = async () => {
    const pending = filteredRequests.filter((request) => ['Submitted', 'Manager Review', 'HR Review'].includes(request.status));
    for (const request of pending) {
      await approveLeaveRequest(request.id, { remarks: 'Bulk-approved' });
    }
    queryClient.invalidateQueries(['leaveRequests']);
  };

  const exportReport = (format = 'csv') => {
    const headers = ['Employee', 'Leave Type', 'Days', 'Start Date', 'End Date', 'Status'];
    const rows = filteredRequests.map((request) => ({
      Employee: request.employeeName,
      'Leave Type': request.leaveType,
      Days: request.days,
      'Start Date': request.startDate,
      'End Date': request.endDate,
      Status: request.status,
    }));
    const blob = format === 'excel' ? toExcelXml(rows, headers) : toCsv(rows, headers);
    downloadBlob(blob, `leave-report.${format === 'excel' ? 'xlsx' : 'csv'}`);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leave management"
        subtitle="Enterprise leave policies, balances, approvals, and holiday operations."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setIsPolicyModalOpen(true)} className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">Configure policies</button>
            <button type="button" onClick={() => setIsRequestModalOpen(true)} className="rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Apply leave</button>
            <button type="button" onClick={() => setIsHolidayModalOpen(true)} className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Manage holidays</button>
          </div>
        }
      />

      {busyMessage ? <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{busyMessage}</div> : null}

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['overview', 'requests', 'balances', 'calendar', 'reports'].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveSection(tab)} className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${activeSection === tab ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}>
              {tab === 'overview' ? 'Overview' : tab === 'requests' ? 'Requests' : tab === 'balances' ? 'Balances' : tab === 'calendar' ? 'Calendar' : 'Reports'}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'overview' && (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Employees on leave</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{requests.filter((request) => request.status === 'Approved').length}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pending approvals</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{requests.filter((request) => ['Submitted', 'Manager Review', 'HR Review'].includes(request.status)).length}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Upcoming holidays</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{upcomingHolidays.length}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Available balance</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{balanceSummary.availableBalance}</p>
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Upcoming holidays</h3>
                <p className="text-sm text-slate-500">Holiday calendar for the next quarter.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  <span>{holiday.title}</span>
                  <span>{holiday.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'requests' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by employee or leave type" className="w-full max-w-md rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
            <select value={requestStatusFilter} onChange={(event) => setRequestStatusFilter(event.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
              {requestStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <button type="button" onClick={bulkApprove} className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">Bulk approve</button>
          </div>
          <DataTable
            columns={[
              { label: 'Employee', key: 'employeeName', sortable: true },
              { label: 'Leave Type', key: 'leaveType', sortable: true },
              { label: 'Days', key: 'days', sortable: true },
              { label: 'Period', key: 'period', sortable: false, render: (_value, row) => `${row.startDate} → ${row.endDate}` },
              { label: 'Status', key: 'status', sortable: true, render: (value) => <StatusBadge status={value} /> },
              { label: 'Actions', key: 'actions', sortable: false, render: (_value, row) => (
                <div className="flex flex-wrap gap-2">
                  {row.status === 'Draft' && <button type="button" onClick={() => handleAction(row, 'submit')} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs">Submit</button>}
                  {['Submitted', 'Manager Review'].includes(row.status) && <button type="button" onClick={() => handleAction(row, 'approve')} className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Approve</button>}
                  {['Submitted', 'Manager Review'].includes(row.status) && <button type="button" onClick={() => handleAction(row, 'reject')} className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-700">Reject</button>}
                  {row.status !== 'Cancelled' && <button type="button" onClick={() => handleAction(row, 'cancel')} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs">Cancel</button>}
                  <button type="button" onClick={() => { setEditingRequest(row); setRequestForm({ ...row, days: row.days || 1 }); setIsRequestModalOpen(true); }} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs">Edit</button>
                </div>
              ) },
            ]}
            rows={filteredRequests}
            initialPageSize={8}
            placeholder="Search leave requests"
          />
        </div>
      )}

      {activeSection === 'balances' && (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Balance snapshot</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total allocation</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{balanceSummary.totalAllocation}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Used</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{balanceSummary.used}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pending approval</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{balanceSummary.pendingApproval}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Available balance</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{balanceSummary.availableBalance}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Leave policy matrix</h3>
            <div className="mt-4 space-y-3">
              {policies.map((policy) => (
                <div key={policy.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{policy.leaveType}</p>
                    <span className="rounded-full bg-white px-3 py-1">{policy.annualAllocation} days</span>
                  </div>
                  <p className="mt-2">Carry forward: {policy.carryForward || 0}; Encashment: {policy.encashmentEligible ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'calendar' && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Holiday calendar</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{holiday.title}</p>
                <p className="mt-2 text-sm text-slate-600">{holiday.date}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">{holiday.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'reports' && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Leave reports</h3>
              <p className="text-sm text-slate-500">Generate register, balance, utilisation, and monthly summaries.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => exportReport('csv')} className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Export CSV</button>
              <button type="button" onClick={() => exportReport('excel')} className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Export Excel</button>
              <button type="button" onClick={() => window.print()} className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Print</button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Leave register</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{filteredRequests.length} requests</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Balance report</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{balanceSummary.availableBalance} days</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Utilisation</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{balanceSummary.totalAllocation ? Math.round((balanceSummary.used / balanceSummary.totalAllocation) * 100) : 0}%</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Monthly summary</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{new Date().toLocaleString('default', { month: 'long' })}</p>
            </div>
          </div>
        </div>
      )}

      <Modal title={editingPolicy ? 'Update leave policy' : 'Create leave policy'} isOpen={isPolicyModalOpen} onClose={() => { setIsPolicyModalOpen(false); resetPolicyForm(); }} footer={<button type="button" onClick={handlePolicySubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Save policy</button>}>
        <form className="space-y-4" onSubmit={handlePolicySubmit}>
          <FormField label="Leave type">
            <input value={policyForm.leaveType} onChange={(event) => setPolicyForm((current) => ({ ...current, leaveType: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Annual allocation">
            <input type="number" value={policyForm.annualAllocation} onChange={(event) => setPolicyForm((current) => ({ ...current, annualAllocation: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Carry forward">
            <input type="number" value={policyForm.carryForward} onChange={(event) => setPolicyForm((current) => ({ ...current, carryForward: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Maximum consecutive days">
            <input type="number" value={policyForm.maxConsecutiveDays} onChange={(event) => setPolicyForm((current) => ({ ...current, maxConsecutiveDays: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={policyForm.encashmentEligible} onChange={(event) => setPolicyForm((current) => ({ ...current, encashmentEligible: event.target.checked }))} /> Encashment eligible</label>
          <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={policyForm.probationRestricted} onChange={(event) => setPolicyForm((current) => ({ ...current, probationRestricted: event.target.checked }))} /> Probation restricted</label>
          <FormField label="Gender restriction">
            <input value={policyForm.genderRestriction} onChange={(event) => setPolicyForm((current) => ({ ...current, genderRestriction: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
        </form>
      </Modal>

      <Modal title={editingRequest ? 'Update leave request' : 'Apply leave'} isOpen={isRequestModalOpen} onClose={() => { setIsRequestModalOpen(false); resetRequestForm(); }} footer={<button type="button" onClick={handleRequestSubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Save request</button>}>
        <form className="space-y-4" onSubmit={handleRequestSubmit}>
          <FormField label="Employee name">
            <input value={requestForm.employeeName} onChange={(event) => setRequestForm((current) => ({ ...current, employeeName: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Leave type">
            <select value={requestForm.leaveType} onChange={(event) => setRequestForm((current) => ({ ...current, leaveType: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none">
              {['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Compensatory Off', 'Unpaid Leave', 'Work From Home', 'Custom Leave Types'].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Start date">
              <input type="date" value={requestForm.startDate} onChange={(event) => setRequestForm((current) => ({ ...current, startDate: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </FormField>
            <FormField label="End date">
              <input type="date" value={requestForm.endDate} onChange={(event) => setRequestForm((current) => ({ ...current, endDate: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </FormField>
          </div>
          <FormField label="Days">
            <input type="number" value={requestForm.days} onChange={(event) => setRequestForm((current) => ({ ...current, days: Number(event.target.value) }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Reason">
            <textarea value={requestForm.reason} onChange={(event) => setRequestForm((current) => ({ ...current, reason: event.target.value }))} className="min-h-24 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Supporting documents">
            <input value={requestForm.supportingDocuments} onChange={(event) => setRequestForm((current) => ({ ...current, supportingDocuments: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
        </form>
      </Modal>

      <Modal title={editingHoliday ? 'Update holiday' : 'Add holiday'} isOpen={isHolidayModalOpen} onClose={() => { setIsHolidayModalOpen(false); resetHolidayForm(); }} footer={<button type="button" onClick={handleHolidaySubmit} className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Save holiday</button>}>
        <form className="space-y-4" onSubmit={handleHolidaySubmit}>
          <FormField label="Holiday title">
            <input value={holidayForm.title} onChange={(event) => setHolidayForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Date">
            <input type="date" value={holidayForm.date} onChange={(event) => setHolidayForm((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Type">
            <input value={holidayForm.type} onChange={(event) => setHolidayForm((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
