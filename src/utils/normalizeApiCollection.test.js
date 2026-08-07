import { describe, expect, it } from 'vitest';
import { normalizeApiCollection } from './normalizeApiCollection.js';

describe('normalizeApiCollection', () => {
  it('returns arrays unchanged', () => {
    expect(normalizeApiCollection([{ id: 1 }])).toEqual([{ id: 1 }]);
  });

  it('normalizes payloads exposed under items', () => {
    expect(normalizeApiCollection({ items: [{ id: 1 }, { id: 2 }] })).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('wraps single objects in an array', () => {
    expect(normalizeApiCollection({ id: 1, name: 'demo' })).toEqual([{ id: 1, name: 'demo' }]);
  });

  it('returns an empty array for empty values', () => {
    expect(normalizeApiCollection(null)).toEqual([]);
    expect(normalizeApiCollection(undefined)).toEqual([]);
  });
});
