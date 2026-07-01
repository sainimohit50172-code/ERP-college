import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';

const service = createResourceService('taxComponents');

export function calculateTaxSummary(payrollDetails = {}) {
  const taxableIncome = Number(payrollDetails.grossSalary || payrollDetails.netSalary || 0);
  const taxPercent = Number(payrollDetails.taxPercent || 0);
  const taxAmount = Number((taxableIncome * (taxPercent / 100)).toFixed(2));
  const additionalDeductions = Number(payrollDetails.additionalDeductions || 0);
  return {
    taxableIncome,
    taxPercent,
    taxAmount: Number((taxAmount - additionalDeductions).toFixed(2)),
    additionalDeductions,
  };
}

export async function listTaxComponents(params = {}) {
  return service.list(params);
}

export async function createTaxComponent(payload) {
  const created = await service.create({ ...payload, createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'payroll', description: `Created tax component ${payload.name || created.id}`, resourceId: created.id });
  return created;
}

export async function updateTaxComponent(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'payroll', description: `Updated tax component ${id}`, resourceId: id });
  return updated;
}

export default service;
