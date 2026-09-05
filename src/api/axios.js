import axios from 'axios';
import safeLog from '../utils/safeLogger.js';
import { toast } from '../utils/toast.js';
import { getApiBaseUrl } from './apiConfig.js';
import { getRetryDelay, shouldSuppressStartupToast } from './startupReadiness.js';

const API_BASE = getApiBaseUrl();
const DEFAULT_TIMEOUT = 10000; // Reduced to 10 seconds for faster failure detection
const isProductionRuntime = (typeof import.meta !== 'undefined' && import.meta && import.meta.env)
  ? import.meta.env.PROD === true
  : (typeof globalThis !== 'undefined' && globalThis.process
    ? globalThis.process.env.NODE_ENV === 'production' || globalThis.process.env.PROD === 'true' || globalThis.process.env.PROD === true
    : false);
let productionApiConfigErrorLogged = false;

function isNodeEnvironment() {
  return typeof window === 'undefined' && typeof process !== 'undefined' && process.versions != null && !!process.versions.node;
}

function resolveAxiosBaseURL(baseURL) {
  if (typeof baseURL !== 'string' || !baseURL.trim()) return undefined;
  if (isNodeEnvironment() && baseURL.startsWith('/')) {
    return `http://localhost${baseURL}`;
  }
  return baseURL;
}

if (isProductionRuntime && API_BASE) {
  // In production, avoid verbose logging; only surface the resolved base when explicitly enabled.
  if (!isProductionRuntime && import.meta.env && import.meta.env.DEBUG_API_BASE) {
    safeLog.info('[api-config] Using production API base URL:', API_BASE);
  }
}

const api = axios.create({
  baseURL: resolveAxiosBaseURL(API_BASE) || undefined,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT,
});

const SENSITIVE_LOG_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'apikey',
  'api_key',
  'clientsecret',
  'client_secret',
  'confirmPassword',
  'otp',
  'authorization',
  'cookie',
]);

export function redactSensitiveFields(value, seen = new WeakMap()) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'function') {
    return '[Function]';
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveFields(item, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.set(value, true);

    const output = {};
    Object.entries(value).forEach(([key, item]) => {
      const normalizedKey = String(key).toLowerCase();
      if (SENSITIVE_LOG_KEYS.has(normalizedKey) || SENSITIVE_LOG_KEYS.has(String(key))) {
        output[key] = '[REDACTED]';
        return;
      }

      output[key] = redactSensitiveFields(item, seen);
    });

    seen.delete(value);
    return output;
  }

  return value;
}

function shouldLogApiRuntime() {
  return import.meta.env && import.meta.env.DEV === true;
}

function getApiBasePath(baseURL = '') {
  if (typeof baseURL !== 'string' || !baseURL.trim()) return '';
  try {
    const url = new URL(baseURL, 'http://localhost');
    return url.pathname.replace(/\/+$|^\s+|\s+$/g, '') || '';
  } catch (error) {
    return baseURL.replace(/^[^/]*\/\/[^/]+/, '').replace(/\/+$|^\s+|\s+$/g, '') || '';
  }
}

export function normalizeApiUrl(config) {
  const url = config?.url;
  const baseURL = config?.baseURL || '';
  if (typeof url !== 'string') {
    return url;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return '/';
  }

  if (!baseURL) {
    return trimmedUrl;
  }

  if (/^https?:\/\//i.test(trimmedUrl) || trimmedUrl.startsWith('//')) {
    return trimmedUrl;
  }

  const normalizedUrl = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
  const basePath = getApiBasePath(baseURL);
  if (!basePath) {
    return normalizedUrl;
  }

  const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  if (normalizedUrl === normalizedBasePath || normalizedUrl.startsWith(`${normalizedBasePath}/`)) {
    // If the requested URL already contains the API base path, strip it
    // so axios's `baseURL` + `url` combination does not duplicate the prefix.
    if (normalizedUrl === normalizedBasePath) return '/';
    if (normalizedUrl.startsWith(`${normalizedBasePath}/`)) {
      const remainder = normalizedUrl.slice(normalizedBasePath.length);
      return remainder.startsWith('/') ? remainder : `/${remainder}`;
    }
    return normalizedUrl;
  }

  return `${normalizedBasePath}${normalizedUrl}`;
}

api.interceptors.request.use((config) => {
  if (isProductionRuntime && !API_BASE) {
    if (!productionApiConfigErrorLogged) {
      productionApiConfigErrorLogged = true;
      safeLog.warn('[api-config] Missing VITE_API_BASE_URL in production. Falling back to /api for request routing.');
    }
  }

  const normalizedUrl = normalizeApiUrl(config);
  if (typeof normalizedUrl === 'string') {
    config.url = normalizedUrl;
  }

  // Extra safety: if the normalized URL still contains the base path prefix, remove it
  try {
    const basePath = getApiBasePath(config.baseURL || '');
    if (basePath && typeof config.url === 'string') {
      const normalizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`;
      if (config.url.startsWith(normalizedBase)) {
        const remainder = config.url.slice(normalizedBase.length) || '/';
        config.url = remainder.startsWith('/') ? remainder : `/${remainder}`;
      }
    }
  } catch (e) {
    // ignore; best-effort cleanup
  }
  const resolvedUrl = `${config.baseURL || ''}${typeof config.url === 'string' ? config.url : ''}`;
  const safeRequestData = shouldLogApiRuntime() ? redactSensitiveFields(config.data) : undefined;
  if (shouldLogApiRuntime()) {
    safeLog.info('[api-request]', config.method?.toUpperCase?.() || 'REQUEST', resolvedUrl, safeRequestData);
  }
  return config;
}, (error) => {
  if (shouldLogApiRuntime()) safeLog.error('[api-request-error]', error);
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  if (shouldLogApiRuntime()) {
    safeLog.info('[api-response]', response.status, response.config?.url, redactSensitiveFields(response.data));
  }
  return response;
}, (error) => {
  const original = error.config || {};
  const suppressStartupErrors = shouldSuppressStartupToast(error, original);
  if (!suppressStartupErrors && shouldLogApiRuntime()) {
    safeLog.error('[api-response-error]', error?.response?.status, error?.config?.url, redactSensitiveFields(error?.response?.data || error?.message));
  }
  return Promise.reject(error);
});

// Simple queue to handle refresh token requests and retry pending calls
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
}

// attach token
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore in SSR or non-browser environments
  }
  return config;
}, (error) => Promise.reject(error));

// Basic retry/backoff for idempotent requests
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config || {};
    if (!original || typeof original.url !== 'string') {
      return Promise.reject(err);
    }

    // Network or timeout errors
    const networkError = !err.response;

    // retry logic for GET/HEAD (idempotent)
    const method = (original.method || 'get').toLowerCase();
    original._retryCount = original._retryCount || 0;
    const shouldRetry = (networkError || (err.response && err.response.status >= 500)) && ['get', 'head'].includes(method) && original._retryCount < 2;
    if (shouldRetry) {
      original._retryCount += 1;
      const delay = getRetryDelay(original._retryCount - 1);
      await new Promise((res) => setTimeout(res, delay));
      return api(original);
    }

    if (shouldSuppressStartupToast(err, original)) {
      return Promise.reject(err);
    }

    // handle 401 -> try refresh flow
    if (err.response && err.response.status === 401 && !original.__isRetryRefresh) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // no refresh token — clear and signal
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location && (window.location.href = '/auth/login');
          return Promise.reject(err);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          }).catch((e) => Promise.reject(e));
        }

        isRefreshing = true;
        const refreshClient = axios.create({ baseURL: resolveAxiosBaseURL(API_BASE) });
        const resp = await refreshClient.post('/auth/refresh', { refresh_token: refreshToken });
        const newToken = resp?.data?.access_token;
        const newRefresh = resp?.data?.refresh_token || refreshToken;
        if (newToken) {
          localStorage.setItem('access_token', newToken);
          localStorage.setItem('refresh_token', newRefresh);
          processQueue(null, newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          return api(original);
        }
        throw new Error('Refresh failed');
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location && (window.location.href = '/auth/login');
        return Promise.reject(refreshErr);
      }
    }

    // user-friendly messages
    if (err.response) {
      const { status } = err.response;
      if (status === 403) toast.error('Forbidden. Insufficient permissions.');
      else if (status === 404) {
        // allow callers to decide how to handle missing endpoints
      } else if (status >= 500) toast.error('Server error. Try again later.');
    } else if (networkError) {
      toast.error('Network error. Check your connection.');
    }

    return Promise.reject(err);
  }
);

export default api;
