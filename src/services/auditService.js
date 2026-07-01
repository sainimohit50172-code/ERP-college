const AUDIT_LOG_STORAGE_KEY = 'erp_audit_logs';

const defaultLogs = [];

function loadAuditLogs() {
  const stored = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
  if (!stored) return [...defaultLogs];
  try {
    return JSON.parse(stored);
  } catch {
    return [...defaultLogs];
  }
}

function saveAuditLogs(logs) {
  localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(logs));
}

export function getAuditLogs() {
  return loadAuditLogs();
}

export function recordAuditEvent({ action, moduleKey = 'system', description = '', resourceId = null, user = null, metadata = {} }) {
  const logs = loadAuditLogs();
  const event = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    action,
    moduleKey,
    description,
    resourceId,
    user,
    metadata,
  };
  logs.unshift(event);
  saveAuditLogs(logs.slice(0, 200));
  return event;
}

export function clearAuditLogs() {
  saveAuditLogs([]);
}
