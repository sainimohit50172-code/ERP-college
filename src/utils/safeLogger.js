const SENSITIVE_KEYS = new Set([
  'password',
  'new_password',
  'old_password',
  'confirm_password',
  'confirmpassword',
  'password_confirmation',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'secret',
  'clientsecret',
  'client_secret',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'sessionid',
  'session_id',
  'otp',
  'otp_code',
  'code',
]);

const REDACTED_VALUE = '***REDACTED***';

export function redact(value, seen = new WeakMap()) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'function') {
    return '[Function]';
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.set(value, true);

    const result = {};
    Object.entries(value).forEach(([key, item]) => {
      const normalizedKey = String(key).trim().toLowerCase();
      if (SENSITIVE_KEYS.has(normalizedKey) || SENSITIVE_KEYS.has(String(key).trim().toLowerCase())) {
        result[key] = REDACTED_VALUE;
        return;
      }

      result[key] = redact(item, seen);
    });

    seen.delete(value);
    return result;
  }

  return value;
}

function shouldLog() {
  return typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env.DEV === true;
}

function safeWrite(method, ...args) {
  if (!shouldLog()) return;
  const sanitizedArgs = args.map((arg) => redact(arg));
  console[method](...sanitizedArgs);
}

export const safeLog = {
  log: (...args) => safeWrite('log', ...args),
  info: (...args) => safeWrite('info', ...args),
  warn: (...args) => safeWrite('warn', ...args),
  error: (...args) => safeWrite('error', ...args),
  debug: (...args) => safeWrite('debug', ...args),
};

export default safeLog;
