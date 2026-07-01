import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';

const service = createResourceService('hostels');

export async function listHostels(params = {}) {
  return service.list(params);
}

export async function getHostel(id) {
  return service.get(id);
}

export async function createHostel(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'hostel', description: `Hostel created: ${created.name || created.id}`, resourceId: created.id });
  return created;
}

export async function updateHostel(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'hostel', description: `Hostel updated: ${id}`, resourceId: id });
  return updated;
}

export async function deleteHostel(id) {
  const removed = await service.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'hostel', description: `Hostel deleted: ${id}`, resourceId: id });
  return removed;
}

export default service;
