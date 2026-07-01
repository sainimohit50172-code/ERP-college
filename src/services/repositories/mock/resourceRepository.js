import { normalizePagination } from '../../../api/contracts/pagination.js';

export function createMockResourceRepo(resourceName, initial = []) {
  let items = Array.isArray(initial) ? [...initial] : [];

  return {
    list: async (params = {}) => {
      const page = Number(params.page || 1);
      const pageSize = Number(params.pageSize || 10);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const slice = items.slice(start, end);
      return normalizePagination({ items: slice, total: items.length, page, pageSize, hasNextPage: end < items.length, hasPreviousPage: page > 1 });
    },
    get: async (id) => items.find((it) => String(it.id) === String(id)) || null,
    create: async (payload) => {
      const id = payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const created = { ...payload, id };
      items.push(created);
      return created;
    },
    update: async (id, payload) => {
      const idx = items.findIndex((it) => String(it.id) === String(id));
      const updated = { ...(idx >= 0 ? items[idx] : {}), ...payload, id };
      if (idx >= 0) items[idx] = updated; else items.push(updated);
      return updated;
    },
    remove: async (id) => {
      items = items.filter((it) => String(it.id) !== String(id));
      return { success: true, id };
    },
    search: async (q) => items.filter((it) => JSON.stringify(it).toLowerCase().includes(String(q || '').toLowerCase())),
  };
}

export default createMockResourceRepo;
