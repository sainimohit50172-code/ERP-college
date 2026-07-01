import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('transportMaintenance');

export async function listMaintenance(params = {}) { return service.list(params); }
export async function getMaintenance(id) { return service.get(id); }

export async function createMaintenance(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'transport', description: `Created maintenance record ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Maintenance logged', details: `Maintenance ${created.id} logged`, meta: { maintenanceId: created.id } });
  return created;
}

export async function updateMaintenance(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'transport', description: `Updated maintenance ${id}`, resourceId: id });
  return updated;
}

export async function deleteMaintenance(id) {
  const res = await service.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'transport', description: `Deleted maintenance ${id}`, resourceId: id });
  return res;
}

export default service;
