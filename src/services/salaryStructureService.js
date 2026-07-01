import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('salaryStructures');

const STORAGE_KEY = 'erp:salary-structures';

const defaultTemplates = [
  {
    id: 'template-salary-structure',
    name: 'Standard Monthly Structure',
    frequency: 'Monthly',
    basicSalary: 50000,
    hraPercent: 20,
    daPercent: 5,
    specialAllowancePercent: 10,
    overtimeRate: 1000,
    providentFundPercent: 12,
    esiPercent: 0.75,
    professionalTaxAmount: 200,
    incomeTaxPercent: 5,
    active: true,
  },
];

function readStructures() {
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

function writeStructures(items) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function ensureSeeded() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const existing = readStructures();
  if (existing.length) return;
  writeStructures(defaultTemplates);
}

export async function listSalaryStructures(params = {}) {
  ensureSeeded();
  return service.list(params);
}

export async function createSalaryStructure(payload) {
  const created = await service.create({ ...payload, active: payload.active !== false });
  recordAuditEvent({ action: 'Create', moduleKey: 'payroll', description: `Created salary structure ${payload.name || created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Salary structure created', details: `${payload.name || 'Salary structure'} is now available`, meta: { salaryStructureId: created.id } });
  return created;
}

export async function updateSalaryStructure(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'payroll', description: `Updated salary structure ${id}`, resourceId: id });
  return updated;
}

export default service;
