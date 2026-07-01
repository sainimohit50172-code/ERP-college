import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookRecord, listBooks } from '../src/services/bookService.js';

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

globalThis.localStorage = new MemoryStorage();

test('createBookRecord persists inventory counts', async () => {
  const created = await createBookRecord({
    title: 'Enterprise Architecture',
    author: 'Mina Rao',
    isbn: '978-1-1111-1111-1',
    category: 'Technology',
    copies: 3,
    availableCopies: 3,
    lostCopies: 0,
    damagedCopies: 0,
  });

  assert.equal(created.availableCopies, 3);
  assert.equal(created.copies, 3);

  const books = await listBooks();
  assert.equal(books.items.length, 1);
  assert.equal(books.items[0].title, 'Enterprise Architecture');
});
