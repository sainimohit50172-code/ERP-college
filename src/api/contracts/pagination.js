// Standard pagination response and helpers
export const PaginationResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function normalizePagination(data = {}, defaults = { page: 1, pageSize: 10 }) {
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: Number(data.total || 0),
    page: Number(data.page || defaults.page),
    pageSize: Number(data.pageSize || defaults.pageSize),
    hasNextPage: Boolean(data.hasNextPage),
    hasPreviousPage: Boolean(data.hasPreviousPage),
  };
}

export default { PaginationResponse, normalizePagination };
