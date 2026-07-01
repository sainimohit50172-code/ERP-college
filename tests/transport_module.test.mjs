import test from 'node:test';
import assert from 'node:assert/strict';
import createResourceService from '../src/api/resourceService.js';
import { assignStudent, listAssignments } from '../src/services/transportAllocationService.js';

// localStorage stub
globalThis.localStorage = globalThis.localStorage || (function () { const s = Object.create(null); return { getItem(k){ return Object.prototype.hasOwnProperty.call(s,k)?s[k]:null; }, setItem(k,v){ s[k]=String(v); }, removeItem(k){ delete s[k]; }, clear(){ for(const k of Object.keys(s)) delete s[k]; } }; })();

test('Transport module: create vehicle, route and assign student', async () => {
  const vehicleSvc = createResourceService('transportVehicles');
  const routeSvc = createResourceService('transportRoutes');
  const v = await vehicleSvc.create({ registration: 'BUS-9001', capacity: 40 });
  const r = await routeSvc.create({ name: 'North Campus Loop', stops: ['Stop A', 'Stop B'], distance: 12 });
  const assignment = await assignStudent({ studentId: 'S-100', routeId: r.id, vehicleId: v.id, boardingStopId: 'Stop A', dropStopId: 'Stop B', effectiveDate: new Date().toISOString() });
  assert.equal(assignment.studentId, 'S-100');
  const list = await listAssignments();
  assert.ok(list.items.find((x) => x.id === assignment.id));
});
