import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('transports');

export async function listTransports(params = {}) { return service.list(params); }
export async function getTransport(id) { return service.get(id); }

export async function createTransport(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'transport', description: `Created transport ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Transport created', details: `Transport ${created.id} created`, meta: { transportId: created.id } });
  return created;
}

export async function updateTransport(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'transport', description: `Updated transport ${id}`, resourceId: id });
  return updated;
}

export async function deleteTransport(id) {
  const res = await service.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'transport', description: `Deleted transport ${id}`, resourceId: id });
  return res;
}

export default service;
