import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('transportFees');

export async function listFees(params = {}) { return service.list(params); }
export async function getFee(id) { return service.get(id); }

export async function createFee(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'transport', description: `Created transport fee ${created.id}`, resourceId: created.id });
  return created;
}

export async function updateFee(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'transport', description: `Updated transport fee ${id}`, resourceId: id });
  if (payload.amountDue && payload.studentId) {
    notificationsService.addNotification({ title: 'Transport fee updated', details: `Fee updated for student ${payload.studentId}`, meta: { feeId: id, studentId: payload.studentId } });
  }
  return updated;
}

export default service;
