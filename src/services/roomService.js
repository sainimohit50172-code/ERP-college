import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';

const service = createResourceService('hostelRooms');

export async function listRooms(params = {}) {
  return service.list(params);
}

export async function getRoom(id) {
  return service.get(id);
}

export async function createRoom(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'hostel', description: `Room created: ${created.roomNumber || created.id}`, resourceId: created.id });
  return created;
}

export async function updateRoom(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'hostel', description: `Room updated: ${id}`, resourceId: id });
  return updated;
}

export async function deleteRoom(id) {
  const removed = await service.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'hostel', description: `Room deleted: ${id}`, resourceId: id });
  return removed;
}

export default service;
