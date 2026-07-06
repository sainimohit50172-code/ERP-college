const DEFAULT_API_BASE = '/api';

export function resolveApiBaseUrl(env = {}) {
  const runtimeEnv = env && typeof env === 'object' ? env : {};
  const fromViteEnv = runtimeEnv.VITE_API_BASE_URL || runtimeEnv.VITE_API_URL || runtimeEnv.REACT_APP_API_URL;
  if (typeof fromViteEnv === 'string' && fromViteEnv.trim()) {
    return fromViteEnv.trim();
  }
  return DEFAULT_API_BASE;
}

export function getApiBaseUrl() {
  const runtimeEnv = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
  return resolveApiBaseUrl(runtimeEnv || {});
}
