import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';

const scholarshipService = createResourceService('scholarships');

export async function listScholarships(params = {}) {
  return scholarshipService.list(params);
}

export async function getScholarship(id) {
  return scholarshipService.get(id);
}

export async function createScholarship(payload) {
  const scholarship = {
    ...payload,
    id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  const result = await scholarshipService.create(scholarship);
  recordAuditEvent({ action: 'Create', moduleKey: 'fees', description: `Created scholarship ${result.name}`, resourceId: result.id });
  return result;
}

export async function updateScholarship(id, payload) {
  const result = await scholarshipService.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'fees', description: `Updated scholarship ${id}`, resourceId: id });
  return result;
}

export async function deleteScholarship(id) {
  const result = await scholarshipService.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'fees', description: `Deleted scholarship ${id}`, resourceId: id });
  return result;
}

export default scholarshipService;
