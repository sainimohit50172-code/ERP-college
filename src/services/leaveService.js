import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('hostelLeaves');

export async function listLeaves(params = {}) { return service.list(params); }
export async function getLeave(id) { return service.get(id); }

export async function submitLeave(payload) {
  const created = await service.create({ ...payload, status: 'Draft', submittedAt: null });
  recordAuditEvent({ action: 'Create', moduleKey: 'hostel', description: `Leave created: ${created.id}`, resourceId: created.id });
  return created;
}

export async function createLeave(payload) {
  const created = await service.create({ ...payload, createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'hostel', description: `Leave created: ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Leave created', details: `Leave ${created.id} created`, meta: { leaveId: created.id } });
  return created;
}

export async function submitForApproval(id) {
  const l = await service.get(id);
  const updated = await service.update(id, { ...l, status: 'Submitted', submittedAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Submit', moduleKey: 'hostel', description: `Leave submitted: ${id}`, resourceId: id });
  notificationsService.addNotification({ title: 'Leave submitted', details: `Leave ${id} submitted for approval`, meta: { leaveId: id } });
  return updated;
}

export async function approveLeave(id, { approver = null } = {}) {
  const l = await service.get(id);
  const updated = await service.update(id, { ...l, status: 'Approved', approvedAt: new Date().toISOString(), approver });
  recordAuditEvent({ action: 'Approve', moduleKey: 'hostel', description: `Leave approved: ${id}`, resourceId: id });
  notificationsService.addNotification({ title: 'Leave approved', details: `Leave ${id} approved`, meta: { leaveId: id } });
  return updated;
}

export async function rejectLeave(id, { approver = null, reason = '' } = {}) {
  const l = await service.get(id);
  const updated = await service.update(id, { ...l, status: 'Rejected', rejectedAt: new Date().toISOString(), approver, reason });
  recordAuditEvent({ action: 'Reject', moduleKey: 'hostel', description: `Leave rejected: ${id}`, resourceId: id });
  notificationsService.addNotification({ title: 'Leave rejected', details: `Leave ${id} rejected`, meta: { leaveId: id } });
  return updated;
}

export default service;

