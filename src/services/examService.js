import { recordAuditEvent } from './auditService.js';

const EXAM_MASTER_STORAGE_KEY = 'erp_exam_masters';
const EXAM_SCHEDULE_STORAGE_KEY = 'erp_exam_schedules';

const defaultMasters = [
  { id: 'master-1', kind: 'academicYear', name: '2024-2025', description: 'Academic year' },
  { id: 'master-2', kind: 'examType', name: 'Mid Semester', description: 'Mid-semester assessment' },
  { id: 'master-3', kind: 'examType', name: 'End Semester', description: 'End-semester assessment' },
  { id: 'master-4', kind: 'examType', name: 'Practical', description: 'Lab/practical evaluation' },
  { id: 'master-5', kind: 'examType', name: 'Viva', description: 'Viva voce' },
  { id: 'master-6', kind: 'examType', name: 'Internal', description: 'Continuous internal assessment' },
  { id: 'master-7', kind: 'examType', name: 'External', description: 'External examination' },
  { id: 'master-8', kind: 'examType', name: 'Supplementary', description: 'Supplementary examination' },
  { id: 'master-9', kind: 'examType', name: 'Improvement', description: 'Improvement examination' },
];

const defaultSchedules = [
  {
    id: 'schedule-1',
    examName: 'Mid Semester Examination',
    course: 'BCA',
    department: 'Computer Science',
    semester: '5',
    subject: 'Data Structures',
    date: '2026-07-15',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Lab-A',
    invigilator: 'Dr. Priya Menon',
    duration: '120 mins',
    status: 'Scheduled',
  },
];

function readCollection(storageKey, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return fallback;
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function writeCollection(storageKey, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

function ensureSeeded(storageKey, fallback) {
  const existing = readCollection(storageKey, null);
  if (existing) return existing;
  writeCollection(storageKey, fallback);
  return fallback;
}

export function listExamMasters() {
  const items = ensureSeeded(EXAM_MASTER_STORAGE_KEY, defaultMasters);
  return { items, total: items.length };
}

export function createExamMaster(payload) {
  const collection = ensureSeeded(EXAM_MASTER_STORAGE_KEY, defaultMasters);
  const entry = {
    id: `master-${Date.now()}`,
    kind: payload.kind || 'examType',
    name: payload.name,
    description: payload.description || '',
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...collection];
  writeCollection(EXAM_MASTER_STORAGE_KEY, next);
  recordAuditEvent({
    action: 'Create',
    moduleKey: 'examinations',
    description: `Created exam master ${entry.name}`,
    resourceId: entry.id,
    metadata: { kind: entry.kind },
  });
  return { item: entry };
}

export function listExamSchedules() {
  const items = ensureSeeded(EXAM_SCHEDULE_STORAGE_KEY, defaultSchedules);
  return { items, total: items.length };
}

export function createExamSchedule(payload) {
  const collection = ensureSeeded(EXAM_SCHEDULE_STORAGE_KEY, defaultSchedules);
  const entry = {
    id: `schedule-${Date.now()}`,
    ...payload,
    status: payload.status || 'Scheduled',
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...collection];
  writeCollection(EXAM_SCHEDULE_STORAGE_KEY, next);
  recordAuditEvent({
    action: 'Create',
    moduleKey: 'examinations',
    description: `Scheduled exam ${entry.examName}`,
    resourceId: entry.id,
    metadata: { course: entry.course, department: entry.department },
  });
  return { item: entry };
}

export function updateExamSchedule(id, payload) {
  const collection = ensureSeeded(EXAM_SCHEDULE_STORAGE_KEY, defaultSchedules);
  const next = collection.map((item) => (item.id === id ? { ...item, ...payload } : item));
  writeCollection(EXAM_SCHEDULE_STORAGE_KEY, next);
  recordAuditEvent({
    action: 'Update',
    moduleKey: 'examinations',
    description: `Updated exam schedule ${id}`,
    resourceId: id,
    metadata: payload,
  });
  return { items: next };
}

export function getExamMasterSummary() {
  const masters = listExamMasters().items;
  return {
    academicYears: masters.filter((item) => item.kind === 'academicYear').length,
    examTypes: masters.filter((item) => item.kind === 'examType').length,
    totalMasters: masters.length,
  };
}
