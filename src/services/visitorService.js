import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('hostelVisitors');

export async function listVisitors(params = {}) { return service.list(params); }
export async function getVisitor(id) { return service.get(id); }

export async function registerVisitor(payload) {
  const created = await service.create({ ...payload, entryAt: new Date().toISOString(), status: 'Pending' });
  recordAuditEvent({ action: 'Create', moduleKey: 'hostel', description: `Visitor registered: ${created.name}`, resourceId: created.id });
  // optionally notify warden
  notificationsService.addNotification({ title: 'Visitor registered', details: `${created.name} requested access for ${created.studentId}`, meta: { visitorId: created.id } });
  return created;
}

export async function updateVisitor(id, payload) {
  const curr = await service.get(id);
  const updated = await service.update(id, { ...curr, ...payload });
  recordAuditEvent({ action: 'Update', moduleKey: 'hostel', description: `Visitor updated: ${id}`, resourceId: id });
  return updated;
}

export default service;
