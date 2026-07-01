// Standard API error shapes

export const ApiError = {
  message: 'An error occurred',
  code: null,
  details: null,
};

export const ValidationError = {
  message: 'Validation failed',
  errors: [
    // { field: 'name', message: 'Required' }
  ],
};

export function normalizeError(err) {
  if (!err) return { message: 'Unknown error' };
  if (err.response && err.response.data) {
    const data = err.response.data;
    const out = { message: data.message || data.detail || 'Request failed', code: data.code || err.response.status || null };
    if (data.errors) out.details = data.errors;
    if (data.validation) out.validation = data.validation;
    return out;
  }
  return { message: err.message || String(err) };
}

export default { ApiError, ValidationError, normalizeError };
