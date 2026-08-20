import { recordAuditEvent } from './auditService.js';

const STORAGE_KEY = 'erp:qualifications';

export const defaultQualifications = [
  { id: 'qual-001', name: 'Matriculation', level: 'School', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'qual-002', name: 'Intermediate', level: 'School', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'qual-003', name: 'Bachelor Degree', level: 'UG', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'qual-004', name: 'Master Degree', level: 'PG', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'qual-005', name: 'Doctorate / Ph.D.', level: 'Research', status: 'Inactive', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'qual-006', name: 'Diploma', level: 'Professional', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'qual-007', name: 'Certification', level: 'Professional', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'qual-008', name: 'Post Graduate Diploma', level: 'PG', status: 'Inactive', createdAt: '2026-01-01T10:30:00.000Z' },
];

function readQualifications() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQualifications(items) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function ensureQualificationsSeeded() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (window.localStorage.getItem(STORAGE_KEY) !== null) return;
  writeQualifications(defaultQualifications);
}

export async function listQualifications(params = {}) {
  ensureQualificationsSeeded();
  const items = readQualifications();
  const page = Number(params.page || 1);
  const pageSize = Number(params.pageSize || items.length || 10);
  return { items, total: items.length, page, pageSize, pages: Math.max(1, Math.ceil(items.length / pageSize)) };
}

export async function getQualification(id) {
  ensureQualificationsSeeded();
  return readQualifications().find((qualification) => String(qualification.id) === String(id)) || null;
}

export async function createQualification(payload) {
  ensureQualificationsSeeded();
  const created = {
    ...payload,
    id: payload.id || `qual-${Date.now()}`,
    createdAt: payload.createdAt || new Date().toISOString(),
    status: payload.status || 'Active',
  };

  const next = [created, ...readQualifications()];
  writeQualifications(next);
  recordAuditEvent({ action: 'Create', moduleKey: 'hrm', description: `Qualification ${created.name} created`, resourceId: created.id });
  return created;
}

export async function updateQualification(id, payload) {
  ensureQualificationsSeeded();
  const updated = { ...payload, id, updatedAt: new Date().toISOString() };
  const next = readQualifications().map((qualification) => String(qualification.id) === String(id) ? { ...qualification, ...updated } : qualification);
  writeQualifications(next);
  recordAuditEvent({ action: 'Update', moduleKey: 'hrm', description: `Qualification ${id} updated`, resourceId: id });
  return updated;
}

export async function deleteQualification(id) {
  ensureQualificationsSeeded();
  const next = readQualifications().filter((qualification) => String(qualification.id) !== String(id));
  writeQualifications(next);
  recordAuditEvent({ action: 'Delete', moduleKey: 'hrm', description: `Qualification ${id} deleted`, resourceId: id });
  return { id };
}

export async function resetQualifications() {
  writeQualifications(defaultQualifications);
  return defaultQualifications;
}

export default {
  listQualifications,
  getQualification,
  createQualification,
  updateQualification,
  deleteQualification,
  resetQualifications,
};