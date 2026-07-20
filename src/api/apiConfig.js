const DEFAULT_API_BASE = '/api';

export function resolveApiBaseUrl(env = {}) {
  const runtimeEnv = env && typeof env === 'object' ? env : {};
  const fromViteEnv = runtimeEnv.VITE_API_BASE_URL || runtimeEnv.VITE_API_URL || runtimeEnv.REACT_APP_API_URL;
  if (typeof fromViteEnv === 'string' && fromViteEnv.trim()) {
    const trimmed = fromViteEnv.trim().replace(/\/+$/, '');
    try {
      const url = new URL(trimmed);
      const isLocalHost = ['127.0.0.1', 'localhost'].includes(url.hostname);
      const isLocalViteOrigin = isLocalHost && ['', '3000', '5173', '5175'].includes(url.port);
      const isLocalBackendOrigin = isLocalHost && ['8000', '8001', '8002'].includes(url.port);
      if (isLocalViteOrigin || isLocalBackendOrigin) {
        return DEFAULT_API_BASE;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }
  return DEFAULT_API_BASE;
}

export function getApiBaseUrl() {
  const runtimeEnv = (typeof import.meta !== 'undefined' && import.meta && import.meta.env)
    ? import.meta.env
    : (typeof globalThis !== 'undefined' && globalThis.process ? globalThis.process.env : {});
  return resolveApiBaseUrl(runtimeEnv || {});
}
