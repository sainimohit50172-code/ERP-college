import { recordAuditEvent } from './auditService.js';

const MARK_ENTRY_STORAGE_KEY = 'erp_mark_entries';

const defaultEntries = [
  {
    id: 'mark-1',
    studentName: 'Aarav Sharma',
    studentId: 'STU-001',
    course: 'BCA',
    semester: '5',
    subject: 'Data Structures',
    internalMarks: 42,
    externalMarks: 68,
    practicalMarks: 40,
    assignmentMarks: 18,
    attendanceMarks: 9,
    graceMarks: 2,
    total: 179,
    grade: 'A',
    result: 'Pass',
    status: 'Published',
    locked: true,
  },
];

function readCollection() {
  if (typeof window === 'undefined') return defaultEntries;
  try {
    const stored = window.localStorage.getItem(MARK_ENTRY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultEntries;
  } catch {
    return defaultEntries;
  }
}

function writeCollection(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MARK_ENTRY_STORAGE_KEY, JSON.stringify(items));
}

export function listMarkEntries() {
  return { items: readCollection() };
}

export function createMarkEntry(payload) {
  const collection = readCollection();
  const entry = {
    id: `mark-${Date.now()}`,
    ...payload,
    locked: false,
    status: payload.status || 'Draft',
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...collection];
  writeCollection(next);
  recordAuditEvent({
    action: 'Create',
    moduleKey: 'examinations',
    description: `Created mark entry for ${entry.studentName}`,
    resourceId: entry.id,
    metadata: { subject: entry.subject, status: entry.status },
  });
  return { item: entry };
}

export function updateMarkEntry(id, payload) {
  const collection = readCollection();
  const next = collection.map((item) => (item.id === id ? { ...item, ...payload } : item));
  writeCollection(next);
  recordAuditEvent({
    action: 'Update',
    moduleKey: 'examinations',
    description: `Updated mark entry ${id}`,
    resourceId: id,
    metadata: payload,
  });
  return { items: next };
}

export function publishMarkEntries(ids = []) {
  const collection = readCollection();
  const next = collection.map((item) => (ids.includes(item.id) || !ids.length ? { ...item, status: 'Published', locked: true } : item));
  writeCollection(next);
  recordAuditEvent({
    action: 'Publish',
    moduleKey: 'examinations',
    description: `Published mark entries (${ids.length || next.length})`,
    metadata: { count: ids.length || next.length },
  });
  return { items: next };
}

export function getMarkEntrySummary() {
  const items = readCollection();
  return {
    totalEntries: items.length,
    publishedEntries: items.filter((item) => item.status === 'Published').length,
    draftEntries: items.filter((item) => item.status === 'Draft').length,
    pendingEntries: items.filter((item) => item.status === 'Pending').length,
  };
}
