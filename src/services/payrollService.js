import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('payrollRuns');

export function calculatePayrollBreakdown({
  salaryStructure = {},
  attendanceDays = 30,
  approvedLeaveDays = 0,
  overtimeHours = 0,
  bonusAmount = 0,
  incentiveAmount = 0,
  frequency = 'Monthly',
}) {
  const basic = Number(salaryStructure.basicSalary || 0);
  const hra = Number((basic * ((salaryStructure.hraPercent || 0) / 100)).toFixed(2));
  const da = Number((basic * ((salaryStructure.daPercent || 0) / 100)).toFixed(2));
  const specialAllowance = Number((basic * ((salaryStructure.specialAllowancePercent || 0) / 100)).toFixed(2));
  const overtime = Number((Number(salaryStructure.overtimeRate || 0) * Number(overtimeHours || 0)).toFixed(2));
  const grossEarnings = basic + hra + da + specialAllowance + overtime + Number(bonusAmount || 0) + Number(incentiveAmount || 0);
  const monthlyDays = frequency === 'Weekly' ? 7 : frequency === 'Daily' ? 1 : 30;
  const daysWorked = Math.max(0, monthlyDays - Number(approvedLeaveDays || 0));
  const effectiveDays = Math.max(1, attendanceDays || daysWorked || monthlyDays);
  const dailyEquivalent = basic / Math.max(1, monthlyDays);
  const leaveDeduction = Number((dailyEquivalent * Number(approvedLeaveDays || 0)).toFixed(2));
  const lop = leaveDeduction;
  const providentFund = Number((basic * ((salaryStructure.providentFundPercent || 0) / 100)).toFixed(2));
  const esi = Number((grossEarnings * ((salaryStructure.esiPercent || 0) / 100)).toFixed(2));
  const professionalTax = Number(Number(salaryStructure.professionalTaxAmount || 0).toFixed(2));
  const incomeTax = Number((grossEarnings * ((salaryStructure.incomeTaxPercent || 0) / 100)).toFixed(2));
  const totalDeductions = leaveDeduction + providentFund + esi + professionalTax + incomeTax;
  const netSalary = Number((grossEarnings - totalDeductions).toFixed(2));

  return {
    basic,
    hra,
    da,
    specialAllowance,
    overtime,
    bonus: Number(Number(bonusAmount || 0).toFixed(2)),
    incentive: Number(Number(incentiveAmount || 0).toFixed(2)),
    leaveDeduction,
    lop,
    providentFund,
    esi,
    professionalTax,
    incomeTax,
    grossEarnings: Number(grossEarnings.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netSalary,
    attendanceDays: Number(attendanceDays || effectiveDays),
    approvedLeaveDays: Number(approvedLeaveDays || 0),
  };
}

export async function listPayrollRuns(params = {}) {
  return service.list(params);
}

export async function createPayrollRun(payload) {
  const created = await service.create({ ...payload, status: payload.status || 'Draft', createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'payroll', description: `Created payroll run ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Payroll run created', details: `Payroll run ${created.id} is ready for review`, meta: { payrollRunId: created.id } });
  return created;
}

export async function updatePayrollRun(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'payroll', description: `Updated payroll run ${id}`, resourceId: id });
  return updated;
}

export async function submitPayrollRun(id) {
  const existing = await service.get(id);
  const updated = await service.update(id, { ...existing, status: 'Review' });
  notificationsService.addNotification({ title: 'Payroll submitted', details: `Payroll run ${id} moved to review`, meta: { payrollRunId: id } });
  return updated;
}

export async function approvePayrollRun(id, payload = {}) {
  const existing = await service.get(id);
  const updated = await service.update(id, { ...existing, status: 'HR Approval', approvedAt: new Date().toISOString(), approvalRemarks: payload.remarks || '' });
  return updated;
}

export async function lockPayrollRun(id) {
  const existing = await service.get(id);
  const updated = await service.update(id, { ...existing, status: 'Locked' });
  return updated;
}

export default service;
