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
  payrollSettings = {},
}) {
  const basic = Number(salaryStructure.basicSalary || 0);
  const hra = Number((basic * ((salaryStructure.hraPercent || 0) / 100)).toFixed(2));
  const da = Number((basic * ((salaryStructure.daPercent || 0) / 100)).toFixed(2));
  const specialAllowance = Number((basic * ((salaryStructure.specialAllowancePercent || 0) / 100)).toFixed(2));
  const overtime = Number((Number(salaryStructure.overtimeRate || 0) * Number(overtimeHours || 0)).toFixed(2));
  const monthlyDays = frequency === 'Weekly' ? 7 : frequency === 'Daily' ? 1 : 30;
  const configuredWorkingDays = Number(payrollSettings.workingDays || 0);
  const cycleDays = configuredWorkingDays > 0 && frequency === 'Monthly' ? configuredWorkingDays : monthlyDays;
  const effectiveAttendanceDays = Math.min(cycleDays, Math.max(0, Number(attendanceDays || cycleDays)));
  const dailyEquivalent = basic / Math.max(1, cycleDays);
  const unpaidLeaveDays = Math.min(effectiveAttendanceDays, Math.max(0, Number(approvedLeaveDays || 0)));
  const payableDays = Math.max(0, effectiveAttendanceDays - unpaidLeaveDays);
  const attendanceFactor = payableDays / Math.max(1, cycleDays);
  const payableBasic = basic * attendanceFactor;
  const payableHra = hra * attendanceFactor;
  const payableDa = da * attendanceFactor;
  const payableSpecialAllowance = specialAllowance * attendanceFactor;
  const payableOvertime = payrollSettings.overtimeEnabled === false ? 0 : overtime;
  const payableBonus = payrollSettings.bonusEnabled === false ? 0 : Number(bonusAmount || 0);
  const payableIncentive = payrollSettings.bonusEnabled === false ? 0 : Number(incentiveAmount || 0);
  const grossEarnings = payableBasic + payableHra + payableDa + payableSpecialAllowance + payableOvertime + payableBonus + payableIncentive;
  const leaveDeduction = Number((dailyEquivalent * unpaidLeaveDays).toFixed(2));
  const lop = leaveDeduction;
  const providentFund = payrollSettings.pfEnabled === false ? 0 : Number((payableBasic * ((salaryStructure.providentFundPercent || 0) / 100)).toFixed(2));
  const esi = payrollSettings.esiEnabled === false ? 0 : Number((grossEarnings * ((salaryStructure.esiPercent || 0) / 100)).toFixed(2));
  const professionalTax = payrollSettings.professionalTaxEnabled === false ? 0 : Number(Number(salaryStructure.professionalTaxAmount || 0).toFixed(2));
  const incomeTax = Number((grossEarnings * ((salaryStructure.incomeTaxPercent || 0) / 100)).toFixed(2));
  const totalDeductions = leaveDeduction + providentFund + esi + professionalTax + incomeTax;
  const netSalary = Number((grossEarnings - totalDeductions).toFixed(2));

  return {
    basic: Number(payableBasic.toFixed(2)),
    hra: Number(payableHra.toFixed(2)),
    da: Number(payableDa.toFixed(2)),
    specialAllowance: Number(payableSpecialAllowance.toFixed(2)),
    overtime: Number(payableOvertime.toFixed(2)),
    bonus: Number(payableBonus.toFixed(2)),
    incentive: Number(payableIncentive.toFixed(2)),
    leaveDeduction,
    lop,
    providentFund,
    esi,
    professionalTax,
    incomeTax,
    grossEarnings: Number(grossEarnings.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netSalary,
    attendanceDays: effectiveAttendanceDays,
    approvedLeaveDays: unpaidLeaveDays,
    payableDays,
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
  const nextStatus = existing.status === 'Review'
    ? 'HR Approval'
    : existing.status === 'HR Approval'
      ? 'Finance Approval'
      : existing.status === 'Finance Approval'
        ? 'Processed'
        : existing.status;
  const updated = await service.update(id, { ...existing, status: nextStatus, approvedAt: new Date().toISOString(), approvalRemarks: payload.remarks || '' });
  return updated;
}

export async function lockPayrollRun(id) {
  const existing = await service.get(id);
  const updated = await service.update(id, { ...existing, status: 'Locked' });
  return updated;
}

export default service;
