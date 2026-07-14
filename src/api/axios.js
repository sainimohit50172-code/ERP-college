import axios from 'axios';
import { toast } from '../utils/toast.js';
import { getApiBaseUrl } from './apiConfig.js';

const API_BASE = getApiBaseUrl();
const DEFAULT_TIMEOUT = 10000; // Reduced to 10 seconds for faster failure detection

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT,
});

api.interceptors.request.use((config) => {
  const resolvedUrl = `${config.baseURL || ''}${config.url || ''}`;
  console.info('[api-request]', config.method?.toUpperCase?.() || 'REQUEST', resolvedUrl, config.data);
  return config;
}, (error) => {
  console.error('[api-request-error]', error);
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  console.info('[api-response]', response.status, response.config?.url, response.data);
  return response;
}, (error) => {
  console.error('[api-response-error]', error?.response?.status, error?.config?.url, error?.response?.data || error?.message);
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

    // Network or timeout errors
    const networkError = !err.response;

    // retry logic for GET/HEAD (idempotent)
    const method = (original.method || 'get').toLowerCase();
    original._retryCount = original._retryCount || 0;
    const shouldRetry = (networkError || (err.response && err.response.status >= 500)) && ['get', 'head'].includes(method) && original._retryCount < 2;
    if (shouldRetry) {
      original._retryCount += 1;
      const delay = 200 * Math.pow(2, original._retryCount);
      await new Promise((res) => setTimeout(res, delay));
      return api(original);
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
        const refreshClient = axios.create({ baseURL: API_BASE });
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
