import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';
import { calculateLeaveBalanceSnapshot } from './leaveBalanceService.js';

const service = createResourceService('leaveRequests');

const buildDefaultBalance = (leaveType = 'Casual Leave') => ({
  leaveType,
  annualAllocation: 12,
  used: 0,
  pendingApproval: 0,
  carryForward: 0,
  expiredBalance: 0,
});

export async function listLeaveRequests(params = {}) {
  return service.list(params);
}

export async function getLeaveRequest(id) {
  return service.get(id);
}

export async function createLeaveRequest(payload) {
  const created = await service.create({
    ...payload,
    status: payload.status || 'Draft',
    createdAt: new Date().toISOString(),
    attachments: payload.attachments || [],
  });
  recordAuditEvent({ action: 'Create', moduleKey: 'leaveManagement', description: `Leave request ${created.id} created`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Leave request created', details: `${payload.leaveType || 'Leave'} request has been created`, meta: { leaveRequestId: created.id } });
  return created;
}

export async function updateLeaveRequest(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'leaveManagement', description: `Leave request ${id} updated`, resourceId: id });
  return updated;
}

export async function submitLeaveRequest(id) {
  const existing = await service.get(id);
  const updated = await service.update(id, { ...existing, status: 'Submitted', submittedAt: new Date().toISOString() });
  notificationsService.addNotification({ title: 'Leave submitted', details: `Leave ${id} was submitted for approval`, meta: { leaveRequestId: id } });
  return updated;
}

export async function approveLeaveRequest(id, payload = {}) {
  const existing = await service.get(id);
  const updated = await service.update(id, { ...existing, status: 'Approved', approvedAt: new Date().toISOString(), decisionRemarks: payload.remarks || existing.decisionRemarks || '' });
  recordAuditEvent({ action: 'Approve', moduleKey: 'leaveManagement', description: `Leave request ${id} approved`, resourceId: id });
  notificationsService.addNotification({ title: 'Leave approved', details: `Leave ${id} has been approved`, meta: { leaveRequestId: id } });
  return updated;
}

export async function rejectLeaveRequest(id, payload = {}) {
  const existing = await service.get(id);
  const updated = await service.update(id, { ...existing, status: 'Rejected', rejectedAt: new Date().toISOString(), decisionRemarks: payload.remarks || existing.decisionRemarks || '' });
  recordAuditEvent({ action: 'Reject', moduleKey: 'leaveManagement', description: `Leave request ${id} rejected`, resourceId: id });
  notificationsService.addNotification({ title: 'Leave rejected', details: `Leave ${id} was rejected`, meta: { leaveRequestId: id } });
  return updated;
}

export async function cancelLeaveRequest(id) {
  const existing = await service.get(id);
  const updated = await service.update(id, { ...existing, status: 'Cancelled', cancelledAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Cancel', moduleKey: 'leaveManagement', description: `Leave request ${id} cancelled`, resourceId: id });
  return updated;
}

export function getLeaveBalanceForRequest(request, balanceState = {}) {
  const base = buildDefaultBalance(request?.leaveType || balanceState.leaveType || 'Casual Leave');
  const balance = { ...base, ...(balanceState || {}) };
  return calculateLeaveBalanceSnapshot(balance);
}

export default service;
