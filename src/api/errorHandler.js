export function parseApiError(error) {
  if (!error) return { message: 'Unknown error' };
  if (error.response && error.response.data) {
    return { message: error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data) };
  }
  if (error.message) return { message: error.message };
  return { message: String(error) };
}

export default { parseApiError };
