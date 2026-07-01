import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('leavePolicies');

const STORAGE_KEY = 'erp:leave-policies';

const defaultPolicies = [
  {
    id: 'policy-casual',
    leaveType: 'Casual Leave',
    annualAllocation: 12,
    carryForward: 3,
    encashmentEligible: false,
    genderRestriction: '',
    probationRestricted: true,
    maxConsecutiveDays: 3,
    active: true,
  },
  {
    id: 'policy-sick',
    leaveType: 'Sick Leave',
    annualAllocation: 10,
    carryForward: 0,
    encashmentEligible: false,
    genderRestriction: '',
    probationRestricted: true,
    maxConsecutiveDays: 5,
    active: true,
  },
  {
    id: 'policy-earned',
    leaveType: 'Earned Leave',
    annualAllocation: 18,
    carryForward: 6,
    encashmentEligible: true,
    genderRestriction: '',
    probationRestricted: true,
    maxConsecutiveDays: 8,
    active: true,
  },
];

function readPolicies() {
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

function writePolicies(items) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function ensurePoliciesSeeded() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const existing = readPolicies();
  if (existing.length) return;
  writePolicies(defaultPolicies);
}

export async function listLeavePolicies(params = {}) {
  ensurePoliciesSeeded();
  return service.list(params);
}

export async function getLeavePolicy(id) {
  return service.get(id);
}

export async function createLeavePolicy(payload) {
  const created = await service.create({ ...payload, active: payload.active !== false });
  recordAuditEvent({ action: 'Create', moduleKey: 'leaveManagement', description: `Created leave policy ${payload.leaveType || created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Leave policy created', details: `${payload.leaveType || 'Policy'} is now available`, meta: { leavePolicyId: created.id } });
  return created;
}

export async function updateLeavePolicy(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'leaveManagement', description: `Updated leave policy ${id}`, resourceId: id });
  return updated;
}

export async function getLeavePolicyByType(type) {
  const policies = await listLeavePolicies();
  const items = Array.isArray(policies?.items) ? policies.items : policies || [];
  return items.find((policy) => policy.leaveType === type) || null;
}

export default service;
