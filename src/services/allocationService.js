import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('hostelAllocations');
const rooms = createResourceService('hostelRooms');

export async function listAllocations(params = {}) {
  return service.list(params);
}

export async function getAllocation(id) {
  return service.get(id);
}

export async function allocateRoom({ studentId, hostelId, roomId, bedNumber, user = null } = {}) {
  // create allocation record
  const payload = { studentId, hostelId, roomId, bedNumber, status: 'Allocated', allocatedAt: new Date().toISOString(), user };
  const created = await service.create(payload);
  // update room occupancy
  try {
    const r = await rooms.get(roomId);
    const occupied = Number(r.occupiedBeds || 0) + 1;
    await rooms.update(roomId, { ...r, occupiedBeds: occupied });
  } catch (e) { console.warn('update room occupancy failed', e); }
  recordAuditEvent({ action: 'Allocate', moduleKey: 'hostel', description: `Allocated room ${roomId} bed ${bedNumber} to ${studentId}`, resourceId: created.id, user });
  notificationsService.addNotification({ title: 'Hostel allocation', details: `You have been allocated room ${roomId}, bed ${bedNumber}`, meta: { allocationId: created.id, studentId } });
  return created;
}

export async function transferAllocation(allocationId, { newHostelId, newRoomId, newBedNumber, user = null } = {}) {
  const alloc = await service.get(allocationId);
  if (!alloc) throw new Error('Allocation not found');
  const prevRoomId = alloc.roomId;
  const updated = await service.update(allocationId, { ...alloc, hostelId: newHostelId, roomId: newRoomId, bedNumber: newBedNumber, transferredAt: new Date().toISOString(), status: 'Transferred' });
  // adjust room occupancy
  try {
    const prev = await rooms.get(prevRoomId);
    await rooms.update(prevRoomId, { ...prev, occupiedBeds: Math.max(0, Number(prev.occupiedBeds || 1) - 1) });
  } catch (e) { console.warn('decrement prev room failed', e); }
  try {
    const nxt = await rooms.get(newRoomId);
    await rooms.update(newRoomId, { ...nxt, occupiedBeds: Number(nxt.occupiedBeds || 0) + 1 });
  } catch (e) { console.warn('increment new room failed', e); }
  recordAuditEvent({ action: 'Transfer', moduleKey: 'hostel', description: `Transferred allocation ${allocationId} to room ${newRoomId}`, resourceId: allocationId, user });
  notificationsService.addNotification({ title: 'Hostel transfer', details: `Your room has been changed to ${newRoomId}`, meta: { allocationId } });
  return updated;
}

export async function checkIn(allocationId, { user = null } = {}) {
  const alloc = await service.get(allocationId);
  const updated = await service.update(allocationId, { ...alloc, checkedInAt: new Date().toISOString(), status: 'CheckedIn' });
  recordAuditEvent({ action: 'CheckIn', moduleKey: 'hostel', description: `Checked in allocation ${allocationId}`, resourceId: allocationId, user });
  return updated;
}

export async function checkOut(allocationId, { user = null } = {}) {
  const alloc = await service.get(allocationId);
  const updated = await service.update(allocationId, { ...alloc, checkedOutAt: new Date().toISOString(), status: 'CheckedOut' });
  // decrement occupancy
  try {
    const r = await rooms.get(alloc.roomId);
    await rooms.update(r.id, { ...r, occupiedBeds: Math.max(0, Number(r.occupiedBeds || 1) - 1) });
  } catch (e) { console.warn('decrement occupancy failed', e); }
  recordAuditEvent({ action: 'CheckOut', moduleKey: 'hostel', description: `Checked out allocation ${allocationId}`, resourceId: allocationId, user });
  notificationsService.addNotification({ title: 'Hostel checkout', details: `You have checked out from room ${alloc.roomId}`, meta: { allocationId } });
  return updated;
}

export async function reserveRoom({ studentId, hostelId, roomId, bedNumber, expiresInDays = 2, user = null } = {}) {
  const payload = { studentId, hostelId, roomId, bedNumber, status: 'Reserved', reservedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + expiresInDays * 24 * 3600 * 1000).toISOString(), user };
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Reserve', moduleKey: 'hostel', description: `Reserved room ${roomId} bed ${bedNumber} for ${studentId}`, resourceId: created.id, user });
  return created;
}

export async function cancelReservation(reservationId, { user = null } = {}) {
  const resv = await service.get(reservationId);
  if (!resv) throw new Error('Reservation not found');
  const updated = await service.update(reservationId, { ...resv, status: 'Cancelled', cancelledAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Update', moduleKey: 'hostel', description: `Reservation cancelled: ${reservationId}`, resourceId: reservationId, user });
  return updated;
}

export default service;
