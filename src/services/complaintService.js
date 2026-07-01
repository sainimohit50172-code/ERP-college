import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('hostelComplaints');

export async function listComplaints(params = {}) { return service.list(params); }
export async function getComplaint(id) { return service.get(id); }

export async function submitComplaint(payload) {
  const created = await service.create({ ...payload, status: 'Submitted', submittedAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'hostel', description: `Complaint submitted: ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Complaint submitted', details: `${created.title || 'New complaint'} has been submitted`, meta: { complaintId: created.id } });
  return created;
}

export async function updateComplaint(id, payload) {
  const curr = await service.get(id);
  const updated = await service.update(id, { ...curr, ...payload });
  recordAuditEvent({ action: 'Update', moduleKey: 'hostel', description: `Complaint updated: ${id}`, resourceId: id });
  notificationsService.addNotification({ title: 'Complaint status updated', details: `Complaint ${id} updated`, meta: { complaintId: id } });
  return updated;
}

export default service;
