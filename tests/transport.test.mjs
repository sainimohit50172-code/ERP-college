import test from 'node:test';
import assert from 'node:assert/strict';
import createResourceService from '../src/api/resourceService.js';

// minimal localStorage stub for tests
globalThis.localStorage = globalThis.localStorage || (function () {
  const store = Object.create(null);
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { for (const k of Object.keys(store)) delete store[k]; },
  };
})();

test('Transport service basic CRUD', async () => {
  const svc = createResourceService('transports');
  const created = await svc.create({ name: 'Campus Bus A', type: 'Bus', capacity: 40 });
  assert.ok(created.id);
  const listed = await svc.list();
  assert.ok(Array.isArray(listed.items) && listed.items.length >= 1);
  const got = await svc.get(created.id);
  assert.equal(got.name, 'Campus Bus A');
  const updated = await svc.update(created.id, { name: 'Campus Bus A - Updated' });
  assert.equal(updated.name, 'Campus Bus A - Updated');
  const removed = await svc.remove(created.id);
  assert.equal(removed.success, true);
});
