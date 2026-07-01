import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';
import vehicles from './vehicleService.js';

const service = createResourceService('studentTransportAssignments');

export async function listAssignments(params = {}) { return service.list(params); }
export async function getAssignment(id) { return service.get(id); }

export async function assignStudent(payload) {
  // payload: { studentId, routeId, vehicleId, boardingStopId, dropStopId, effectiveDate }
  const created = await service.create({ ...payload, assignedAt: new Date().toISOString(), status: 'Assigned' });
  // update vehicle occupancy if present
  try {
    if (created.vehicleId) {
      const v = await vehicles.get(created.vehicleId);
      await vehicles.update(created.vehicleId, { ...v, occupiedSeats: Number(v.occupiedSeats || 0) + 1 });
    }
  } catch (e) { console.warn('update vehicle occupancy failed', e); }
  recordAuditEvent({ action: 'Assign', moduleKey: 'transport', description: `Assigned student ${created.studentId} to vehicle ${created.vehicleId}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Transport assigned', details: `You have been assigned transport route ${created.routeId}`, meta: { assignmentId: created.id, studentId: created.studentId } });
  return created;
}

export async function unassignStudent(id) {
  const a = await service.get(id);
  const updated = await service.update(id, { ...a, status: 'Unassigned', unassignedAt: new Date().toISOString() });
  try {
    if (a.vehicleId) {
      const v = await vehicles.get(a.vehicleId);
      await vehicles.update(a.vehicleId, { ...v, occupiedSeats: Math.max(0, Number(v.occupiedSeats || 1) - 1) });
    }
  } catch (e) { console.warn('decrement vehicle occupancy failed', e); }
  recordAuditEvent({ action: 'Unassign', moduleKey: 'transport', description: `Unassigned student ${a.studentId}`, resourceId: id });
  notificationsService.addNotification({ title: 'Transport unassigned', details: `Your transport assignment was removed`, meta: { assignmentId: id, studentId: a.studentId } });
  return updated;
}

export default service;
