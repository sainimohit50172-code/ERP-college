import { recordAuditEvent } from './auditService.js';

const RESULT_STORAGE_KEY = 'erp_exam_results';

const defaultResults = [
  {
    id: 'result-1',
    studentName: 'Aarav Sharma',
    studentId: 'STU-001',
    semester: '5',
    course: 'BCA',
    total: 179,
    percentage: 89.5,
    cgpa: 8.9,
    sgpa: 8.8,
    grade: 'A',
    rank: 1,
    status: 'Pass',
    backPaper: false,
    merit: 'Merit',
    published: true,
  },
];

function readCollection() {
  if (typeof window === 'undefined') return defaultResults;
  try {
    const stored = window.localStorage.getItem(RESULT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultResults;
  } catch {
    return defaultResults;
  }
}

function writeCollection(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(items));
}

export function listResults() {
  return { items: readCollection() };
}

export function createResult(payload) {
  const collection = readCollection();
  const entry = {
    id: `result-${Date.now()}`,
    published: false,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...collection];
  writeCollection(next);
  recordAuditEvent({
    action: 'Create',
    moduleKey: 'examinations',
    description: `Created result for ${entry.studentName}`,
    resourceId: entry.id,
    metadata: { semester: entry.semester, status: entry.status },
  });
  return { item: entry };
}

export function publishResult(id) {
  const collection = readCollection();
  const next = collection.map((item) => (item.id === id ? { ...item, published: true, status: 'Pass' } : item));
  writeCollection(next);
  recordAuditEvent({
    action: 'Publish',
    moduleKey: 'examinations',
    description: `Published result ${id}`,
    resourceId: id,
  });
  return { items: next };
}

export function updateResult(id, payload) {
  const collection = readCollection();
  const next = collection.map((item) => (item.id === id ? { ...item, ...payload } : item));
  writeCollection(next);
  recordAuditEvent({
    action: 'Edit',
    moduleKey: 'examinations',
    description: `Edited result ${id}`,
    resourceId: id,
    metadata: payload,
  });
  return { items: next };
}

export function getResultSummary() {
  const items = readCollection();
  return {
    totalResults: items.length,
    publishedResults: items.filter((item) => item.published).length,
    passCount: items.filter((item) => item.status === 'Pass').length,
    failCount: items.filter((item) => item.status === 'Fail').length,
  };
}
