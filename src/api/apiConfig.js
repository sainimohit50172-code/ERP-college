const DEFAULT_API_BASE = '/api';

function isProductionEnvironment(env = {}) {
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env.PROD === true;
  }

  const runtimeEnv = env && typeof env === 'object' ? env : {};
  return runtimeEnv.PROD === true || runtimeEnv.PROD === 'true' || runtimeEnv.NODE_ENV === 'production';
}

function logProductionApiBase(trimmed) {
  console.info('[api-config] Production API base URL:', trimmed);
}

function logMissingProductionApiBase() {
  const message = '[api-config] Missing VITE_API_BASE_URL in production. Set VITE_API_BASE_URL to your backend origin in Vercel Environment Variables and redeploy.';
  if (typeof window !== 'undefined') {
    if (!window.__VITE_API_BASE_URL_MISSING_LOGGED) {
      window.__VITE_API_BASE_URL_MISSING_LOGGED = true;
      console.warn(message);
    }
    return;
  }
  console.warn(message);
}

export function resolveApiBaseUrl(env = {}) {
  const runtimeEnv = env && typeof env === 'object' ? env : {};
  const isProduction = isProductionEnvironment(runtimeEnv);
  const fromViteEnv = runtimeEnv.VITE_API_BASE_URL;

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
      if (isProduction) {
        logProductionApiBase(trimmed);
      }
      return trimmed;
    } catch {
      if (isProduction) {
        logProductionApiBase(trimmed);
      }
      return trimmed;
    }
  }

  if (isProduction) {
    logMissingProductionApiBase();
    return DEFAULT_API_BASE;
  }

  return DEFAULT_API_BASE;
}

export function getApiBaseUrl() {
  const runtimeEnv = (typeof import.meta !== 'undefined' && import.meta && import.meta.env)
    ? import.meta.env
    : (typeof globalThis !== 'undefined' && globalThis.process ? globalThis.process.env : {});
  return resolveApiBaseUrl(runtimeEnv || {});
}
