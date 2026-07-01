import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateRoom, transferAllocation } from '../src/services/allocationService.js';
import createResourceService from '../src/api/resourceService.js';

// Provide a minimal in-memory localStorage for Node test environment
globalThis.localStorage = globalThis.localStorage || (function () {
  const store = Object.create(null);
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { for (const k of Object.keys(store)) delete store[k]; },
  };
})();

// Simple allocation workflow tests
test('Hostel allocation workflows: creates rooms and allocates a student, updating occupancy', async () => {
  const roomSvc = createResourceService('hostelRooms');
  const created = await roomSvc.create({ roomNumber: 'R-101', capacity: 2, occupiedBeds: 0, status: 'Available' });
  const allocation = await allocateRoom({ studentId: 'S-1', hostelId: 'H-1', roomId: created.id, bedNumber: 1 });
  assert.equal(allocation.studentId, 'S-1');
  const updatedRoom = await roomSvc.get(created.id);
  assert.equal(Number(updatedRoom.occupiedBeds), 1);
});

test('Hostel allocation workflows: transfers allocation and updates room occupancy correctly', async () => {
  const roomSvc = createResourceService('hostelRooms');
  const r1 = await roomSvc.create({ roomNumber: 'R-201', capacity: 2, occupiedBeds: 0 });
  const r2 = await roomSvc.create({ roomNumber: 'R-202', capacity: 2, occupiedBeds: 0 });
  const alloc = await allocateRoom({ studentId: 'S-2', hostelId: 'H-1', roomId: r1.id, bedNumber: 1 });
  const transferred = await transferAllocation(alloc.id, { newHostelId: 'H-1', newRoomId: r2.id, newBedNumber: 1 });
  assert.equal(transferred.roomId, r2.id);
  const updatedR1 = await roomSvc.get(r1.id);
  const updatedR2 = await roomSvc.get(r2.id);
  assert.equal(Number(updatedR1.occupiedBeds), 0);
  assert.equal(Number(updatedR2.occupiedBeds), 1);
});

test('Hostel leave workflow: submits and approves leave', async () => {
  const leaveSvc = createResourceService('hostelLeaves');
  const leave = await leaveSvc.create({ studentId: 'S-3', type: 'Home Leave', status: 'Draft' });
  const leaveId = leave.id;
  // simulate submit
  const svc = createResourceService('hostelLeaves');
  const sub = await svc.update(leaveId, { ...leave, status: 'Submitted', submittedAt: new Date().toISOString() });
  assert.equal(sub.status, 'Submitted');
  const appr = await svc.update(leaveId, { ...sub, status: 'Approved', approvedAt: new Date().toISOString() });
  assert.equal(appr.status, 'Approved');
});
