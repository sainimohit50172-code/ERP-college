import { getApiBaseUrl } from './apiConfig.js';

const API_BASE = getApiBaseUrl();
const API_BASE_PATH = typeof API_BASE === 'string' && API_BASE.trim()
  ? API_BASE.trim().replace(/\/+$|^\s+|\s+$/g, '')
  : null;
const isProductionRuntime = (typeof import.meta !== 'undefined' && import.meta && import.meta.env)
  ? import.meta.env.PROD === true
  : (typeof globalThis !== 'undefined' && globalThis.process
    ? globalThis.process.env.NODE_ENV === 'production' || globalThis.process.env.PROD === 'true' || globalThis.process.env.PROD === true
    : false);
let startupConfigErrorLogged = false;
// When running in production, do not fall back to a relative '/api/health' endpoint.
const DEFAULT_HEALTH_ENDPOINT = API_BASE_PATH ? `${API_BASE_PATH}/health` : null;
const MAX_HEALTH_CHECK_ATTEMPTS = 5;
const HEALTH_CHECK_DELAY_MS = 1000;
const DEV_HEALTH_ATTEMPTS = 1;

const startupState = {
  ready: false,
  startupWindow: true,
  startedAt: Date.now(),
  lastCheckAt: null,
  healthCheckInFlight: false,
  healthPromise: null,
  healthCheckAttempts: 0,
  lastHealthCheckOutcome: null,
};

function now() {
  return Date.now();
}

export function setBackendHealthState(nextState = {}) {
  Object.assign(startupState, nextState);
  if (typeof nextState.ready === 'boolean') {
    startupState.startupWindow = !nextState.ready;
  }
  startupState.lastCheckAt = now();
  return startupState;
}

export function getBackendHealthState() {
  return { ...startupState };
}

export function setHealthCheckInFlight(value) {
  startupState.healthCheckInFlight = value;
  if (!value) {
    startupState.lastCheckAt = now();
  }
}

export function resetStartupGate() {
  startupState.ready = false;
  startupState.startupWindow = true;
  startupState.startedAt = now();
  startupState.lastCheckAt = null;
  startupState.healthCheckInFlight = false;
  startupState.healthPromise = null;
  startupState.healthCheckAttempts = 0;
  startupState.lastHealthCheckOutcome = null;
}

export function shouldSuppressStartupToast(error, config = {}) {
  const startupSuppressionEnabled = config._suppressStartupErrors !== false;
  const isStartupWindow = startupState.startupWindow || !startupState.ready;
  const hasResponse = Boolean(error?.response);
  const status = error?.response?.status;
  const isStartupFailure = isStartupWindow && (!hasResponse || status === 404 || status === 500 || status === 502 || status === 503 || !status);
  return startupSuppressionEnabled && isStartupFailure;
}

export function getRetryDelay(retryCount = 0) {
  return HEALTH_CHECK_DELAY_MS;
}

export async function waitForBackendHealth({ endpoint = DEFAULT_HEALTH_ENDPOINT, timeoutMs = 5000, retryDelayMs = HEALTH_CHECK_DELAY_MS, maxAttempts = isProductionRuntime ? MAX_HEALTH_CHECK_ATTEMPTS : DEV_HEALTH_ATTEMPTS } = {}) {
  if (startupState.ready) {
    return true;
  }

  if (!startupState.ready && startupState.lastHealthCheckOutcome === 'error' && !startupState.healthCheckInFlight) {
    setBackendHealthState({ ready: false, startupWindow: false });
    return false;
  }

  if (isProductionRuntime && !API_BASE_PATH) {
    if (!startupConfigErrorLogged) {
      startupConfigErrorLogged = true;
      console.warn('[startup] Missing VITE_API_BASE_URL in production. Falling back to /api for backend checks.');
    }
    setBackendHealthState({ ready: false, startupWindow: false });
  }

  if (!endpoint) {
    return false;
  }

  if (startupState.healthPromise) {
    return startupState.healthPromise;
  }

  startupState.healthPromise = (async () => {
    const startedAt = now();
    const maxWaitMs = Math.max(timeoutMs, 0);
    startupState.healthCheckAttempts = 0;

    while (startupState.healthCheckAttempts < maxAttempts && now() - startedAt < maxWaitMs) {
      startupState.healthCheckAttempts += 1;
      try {
        const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
        if (response.ok) {
          startupState.lastHealthCheckOutcome = 'ready';
          setBackendHealthState({ ready: true, startupWindow: false });
          return true;
        }

        startupState.lastHealthCheckOutcome = response.status;
        if (response.status === 404) {
          setBackendHealthState({ ready: false, startupWindow: true });
          return false;
        }
      } catch (error) {
        startupState.lastHealthCheckOutcome = 'error';
        setBackendHealthState({ ready: false, startupWindow: false });
        return false;
      }

      if (startupState.healthCheckAttempts < maxAttempts) {
        setHealthCheckInFlight(true);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    setBackendHealthState({ ready: false, startupWindow: true });
    setHealthCheckInFlight(false);
    return false;
  })();

  try {
    return await startupState.healthPromise;
  } finally {
    startupState.healthPromise = null;
    setHealthCheckInFlight(false);
  }
}
