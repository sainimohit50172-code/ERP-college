import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('transportVehicles');

export async function listVehicles(params = {}) { return service.list(params); }
export async function getVehicle(id) { return service.get(id); }

export async function createVehicle(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'transport', description: `Created vehicle ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Vehicle added', details: `Vehicle ${created.id} added`, meta: { vehicleId: created.id } });
  return created;
}

export async function updateVehicle(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'transport', description: `Updated vehicle ${id}`, resourceId: id });
  return updated;
}

export async function deleteVehicle(id) {
  const res = await service.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'transport', description: `Deleted vehicle ${id}`, resourceId: id });
  return res;
}

export default service;
