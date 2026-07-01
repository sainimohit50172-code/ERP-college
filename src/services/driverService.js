import createResourceService from '../api/resourceService.js';
import vehicleService from './vehicleService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('transportDrivers');

export async function listDrivers(params = {}) { return service.list(params); }
export async function getDriver(id) { return service.get(id); }

export async function createDriver(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'transport', description: `Created driver ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Driver added', details: `Driver ${created.id} created`, meta: { driverId: created.id } });
  return created;
}

export async function updateDriver(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'transport', description: `Updated driver ${id}`, resourceId: id });
  return updated;
}

export async function assignVehicle(driverId, vehicleId) {
  const driver = await service.get(driverId);
  const drivers = await service.list({ page: 1, pageSize: 1000 });
  const currentlyAssigned = (drivers.items || []).find((item) => String(item.assignedVehicle) === String(vehicleId) && String(item.id) !== String(driverId));

  if (currentlyAssigned) {
    await service.update(currentlyAssigned.id, {
      ...currentlyAssigned,
      assignedVehicle: null,
      status: currentlyAssigned.status === 'Assigned' ? 'Active' : currentlyAssigned.status,
      assignmentHistory: [
        ...(currentlyAssigned.assignmentHistory || []),
        { vehicleId, unassignedAt: new Date().toISOString() },
      ],
    });
    recordAuditEvent({ action: 'Unassign', moduleKey: 'transport', description: `Unassigned driver ${currentlyAssigned.id} from vehicle ${vehicleId} to assign new driver`, resourceId: currentlyAssigned.id });
  }

  const assignmentHistory = [
    ...(driver.assignmentHistory || []),
    { vehicleId, assignedAt: new Date().toISOString() },
  ];

  const updated = await service.update(driverId, {
    ...driver,
    assignedVehicle: vehicleId,
    status: 'Assigned',
    assignmentHistory,
  });

  try {
    const vehicle = await vehicleService.get(vehicleId);
    await vehicleService.update(vehicleId, { ...vehicle, assignedDriver: driverId });
  } catch (error) {
    console.warn('Failed to update vehicle assigned driver', error);
  }

  recordAuditEvent({ action: 'Assign', moduleKey: 'transport', description: `Assigned vehicle ${vehicleId} to driver ${driverId}`, resourceId: driverId });
  notificationsService.addNotification({ title: 'Driver assigned', details: `Driver ${driver.name || driverId} assigned to vehicle ${vehicleId}`, meta: { driverId, vehicleId } });
  return updated;
}

export async function unassignVehicle(driverId) {
  const driver = await service.get(driverId);
  const updated = await service.update(driverId, {
    ...driver,
    assignmentHistory: [
      ...(driver.assignmentHistory || []),
      { vehicleId: driver.assignedVehicle, unassignedAt: new Date().toISOString() },
    ],
    assignedVehicle: null,
    status: driver.status === 'Assigned' ? 'Active' : driver.status,
  });

  try {
    if (driver.assignedVehicle) {
      const vehicle = await vehicleService.get(driver.assignedVehicle);
      await vehicleService.update(driver.assignedVehicle, { ...vehicle, assignedDriver: null });
    }
  } catch (error) {
    console.warn('Failed to clear assigned driver on vehicle', error);
  }

  recordAuditEvent({ action: 'Unassign', moduleKey: 'transport', description: `Unassigned driver ${driverId} from vehicle ${driver.assignedVehicle || 'N/A'}`, resourceId: driverId });
  notificationsService.addNotification({ title: 'Driver unassigned', details: `Driver ${driver.name || driverId} is no longer assigned`, meta: { driverId } });
  return updated;
}

export async function archiveDriver(id) {
  const driver = await service.get(id);
  const updated = await service.update(id, {
    ...driver,
    status: 'Archived',
    archivedAt: new Date().toISOString(),
  });
  recordAuditEvent({ action: 'Archive', moduleKey: 'transport', description: `Archived driver ${id}`, resourceId: id });
  return updated;
}

export async function deleteDriver(id) {
  const res = await service.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'transport', description: `Deleted driver ${id}`, resourceId: id });
  return res;
}

export default service;
