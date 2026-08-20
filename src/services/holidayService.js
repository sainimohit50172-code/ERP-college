import { recordAuditEvent } from './auditService.js';

const defaultHolidays = [
  { id: 'hol-001', title: 'Independence Day', date: '2026-08-15', type: 'Public', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'hol-002', title: 'Diwali', date: '2026-11-01', type: 'Festival', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
  { id: 'hol-003', title: 'Christmas', date: '2026-12-25', type: 'Public', status: 'Active', createdAt: '2026-01-01T10:30:00.000Z' },
];

function readHolidays() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem('erp:holidays');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHolidays(items) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem('erp:holidays', JSON.stringify(items));
}

function ensureSeeded() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (window.localStorage.getItem('erp:holidays') !== null) return;
  writeHolidays(defaultHolidays);
}

export async function listHolidays(params = {}) {
  ensureSeeded();
  const items = readHolidays();
  const page = Number(params.page || 1);
  const pageSize = Number(params.pageSize || items.length || 10);
  return { items, total: items.length, page, pageSize, pages: Math.max(1, Math.ceil(items.length / pageSize)) };
}

export async function getHoliday(id) {
  ensureSeeded();
  return readHolidays().find((holiday) => String(holiday.id) === String(id)) || null;
}

export async function createHoliday(payload) {
  ensureSeeded();
  const created = { ...payload, id: `hol-${Date.now()}`, createdAt: new Date().toISOString() };
  writeHolidays([created, ...readHolidays()]);
  recordAuditEvent({ action: 'Create', moduleKey: 'leaveManagement', description: `Holiday ${created.id} created`, resourceId: created.id });
  return created;
}

export async function updateHoliday(id, payload) {
  ensureSeeded();
  const updated = { ...payload, id, updatedAt: new Date().toISOString() };
  writeHolidays(readHolidays().map((holiday) => String(holiday.id) === String(id) ? { ...holiday, ...updated } : holiday));
  recordAuditEvent({ action: 'Update', moduleKey: 'leaveManagement', description: `Holiday ${id} updated`, resourceId: id });
  return updated;
}

export async function deleteHoliday(id) {
  ensureSeeded();
  writeHolidays(readHolidays().filter((holiday) => String(holiday.id) !== String(id)));
  recordAuditEvent({ action: 'Delete', moduleKey: 'leaveManagement', description: `Holiday ${id} deleted`, resourceId: id });
  return { id };
}
