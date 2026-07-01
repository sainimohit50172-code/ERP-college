import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('payslips');

export function buildPayslipPreview(payrollEntry) {
  return {
    id: payrollEntry?.id || 'payslip-preview',
    employeeName: payrollEntry?.employeeName || 'Employee',
    employeeId: payrollEntry?.employeeId || 'EMP-001',
    period: payrollEntry?.period || 'Current Month',
    grossSalary: payrollEntry?.grossSalary || 0,
    netSalary: payrollEntry?.netSalary || 0,
    deductions: payrollEntry?.totalDeductions || 0,
    status: payrollEntry?.status || 'Draft',
  };
}

export async function listPayslips(params = {}) {
  return service.list(params);
}

export async function createPayslip(payload) {
  const created = await service.create({ ...payload, createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'payroll', description: `Created payslip ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Payslip generated', details: `Payslip ${created.id} is ready for download`, meta: { payslipId: created.id } });
  return created;
}

export async function updatePayslip(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'payroll', description: `Updated payslip ${id}`, resourceId: id });
  return updated;
}

export default service;
