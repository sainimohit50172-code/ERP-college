export function normalizeApiCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.items)) {
      return payload.items;
    }

    if (payload.data && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (payload.data && payload.data.items && Array.isArray(payload.data.items)) {
      return payload.data.items;
    }

    if (payload.result && Array.isArray(payload.result)) {
      return payload.result;
    }

    return [payload];
  }

  return [];
}
