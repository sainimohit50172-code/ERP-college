import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('transportRoutes');

export async function listRoutes(params = {}) { return service.list(params); }
export async function getRoute(id) { return service.get(id); }

export async function createRoute(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'transport', description: `Created route ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Route created', details: `Route ${created.id} created`, meta: { routeId: created.id } });
  return created;
}

export async function updateRoute(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'transport', description: `Updated route ${id}`, resourceId: id });
  return updated;
}

export async function deleteRoute(id) {
  const res = await service.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'transport', description: `Deleted route ${id}`, resourceId: id });
  return res;
}

export default service;
