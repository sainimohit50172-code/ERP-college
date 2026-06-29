import test from 'node:test';
import assert from 'node:assert/strict';
import createResourceService from '../src/api/resourceService.js';
import api from '../src/api/axios.js';

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

test('resource service falls back to local storage for CRUD operations', async () => {
  globalThis.localStorage = new MemoryStorage();
  api.get = async () => { throw new Error('offline'); };
  api.post = async () => { throw new Error('offline'); };
  api.put = async () => { throw new Error('offline'); };
  api.delete = async () => { throw new Error('offline'); };

  const service = createResourceService('students');

  const initial = await service.list({ page: 1, pageSize: 10 });
  assert.deepEqual(initial.items, []);

  const created = await service.create({ name: 'Ada Lovelace' });
  assert.equal(created.name, 'Ada Lovelace');
  assert.ok(created.id);

  const listed = await service.list();
  assert.equal(listed.items.length, 1);

  const updated = await service.update(created.id, { name: 'Grace Hopper' });
  assert.equal(updated.name, 'Grace Hopper');
  assert.equal(updated.id, created.id);

  const removed = await service.remove(created.id);
  assert.equal(removed.success, true);

  const afterDelete = await service.list();
  assert.deepEqual(afterDelete.items, []);
});
