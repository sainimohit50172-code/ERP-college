import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('salaryRevisions');

export async function listSalaryRevisions(params = {}) {
  return service.list(params);
}

export async function createSalaryRevision(payload) {
  const created = await service.create({ ...payload, createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'payroll', description: `Created salary revision ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Salary revision created', details: `Revision for ${payload.employeeName || 'employee'} is ready for review`, meta: { salaryRevisionId: created.id } });
  return created;
}

export async function updateSalaryRevision(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'payroll', description: `Updated salary revision ${id}`, resourceId: id });
  return updated;
}

export default service;
