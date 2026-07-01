import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';

const service = createResourceService('holidays');

const defaultHolidays = [
  { id: 'hol-001', title: 'Independence Day', date: '2026-08-15', type: 'Public' },
  { id: 'hol-002', title: 'Diwali', date: '2026-11-01', type: 'Festival' },
  { id: 'hol-003', title: 'Christmas', date: '2026-12-25', type: 'Public' },
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
  if (readHolidays().length) return;
  writeHolidays(defaultHolidays);
}

export async function listHolidays(params = {}) {
  ensureSeeded();
  return service.list(params);
}

export async function getHoliday(id) {
  return service.get(id);
}

export async function createHoliday(payload) {
  const created = await service.create(payload);
  recordAuditEvent({ action: 'Create', moduleKey: 'leaveManagement', description: `Holiday ${created.id} created`, resourceId: created.id });
  return created;
}

export async function updateHoliday(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'leaveManagement', description: `Holiday ${id} updated`, resourceId: id });
  return updated;
}

export default service;
