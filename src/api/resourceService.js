import api from './axios';
import { getEndpoint } from './endpoints';

const createMemoryStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
};

const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return createMemoryStorage();
};

const getStorageKey = (endpoint) => `erp:${endpoint}`;

const readStoredItems = (endpoint) => {
  const storage = getStorage();
  const raw = storage.getItem(getStorageKey(endpoint));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredItems = (endpoint, items) => {
  const storage = getStorage();
  storage.setItem(getStorageKey(endpoint), JSON.stringify(items));
};

const normalizePayload = (payload, fallbackId) => {
  if (!payload || typeof payload !== 'object') {
    return { id: fallbackId };
  }
  return { ...payload, id: payload.id || fallbackId };
};

const paginateItems = (items, params = {}) => {
  const page = Number(params.page || 1);
  const pageSize = Number(params.pageSize || items.length || 10);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    total: items.length,
    page,
    pageSize,
    hasNextPage: end < items.length,
    hasPreviousPage: page > 1,
  };
};

export const createResourceService = (resource) => {
  const endpoint = getEndpoint(resource);

  return {
    list: async (params = {}) => {
      try {
        const res = await api.get(`/${endpoint}`, { params });
        return res.data;
      } catch {
        const items = readStoredItems(endpoint);
        return paginateItems(items, params);
      }
    },
    get: async (id) => {
      try {
        const res = await api.get(`/${endpoint}/${id}`);
        return res.data;
      } catch {
        const items = readStoredItems(endpoint);
        return items.find((item) => String(item.id) === String(id)) || null;
      }
    },
    create: async (payload) => {
      try {
        const res = await api.post(`/${endpoint}`, payload);
        return res.data;
      } catch {
        const items = readStoredItems(endpoint);
        const normalized = normalizePayload(payload, `${Date.now()}-${Math.random().toString(16).slice(2)}`);
        const nextItems = [...items, normalized];
        writeStoredItems(endpoint, nextItems);
        return normalized;
      }
    },
    update: async (id, payload) => {
      try {
        const res = await api.put(`/${endpoint}/${id}`, payload);
        return res.data;
      } catch {
        const items = readStoredItems(endpoint);
        const index = items.findIndex((item) => String(item.id) === String(id));
        const updated = normalizePayload(payload, id);
        updated.id = id;
        const nextItems = [...items];
        if (index >= 0) {
          nextItems[index] = { ...nextItems[index], ...updated };
        } else {
          nextItems.push(updated);
        }
        writeStoredItems(endpoint, nextItems);
        return updated;
      }
    },
    remove: async (id) => {
      try {
        const res = await api.delete(`/${endpoint}/${id}`);
        return res.data;
      } catch {
        const items = readStoredItems(endpoint);
        const nextItems = items.filter((item) => String(item.id) !== String(id));
        writeStoredItems(endpoint, nextItems);
        return { success: true, id };
      }
    },
    search: async (q) => {
      try {
        const res = await api.get(`/${endpoint}/search`, { params: { q } });
        return res.data;
      } catch {
        const items = readStoredItems(endpoint);
        const term = String(q || '').toLowerCase();
        return items.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
      }
    },
  };
};

export default createResourceService;
