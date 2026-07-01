import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('budgets');

export function calculateBudgetVariance(budget = {}, actual = 0) {
  const planned = Number(budget.amount || 0);
  const variance = Number((actual - planned).toFixed(2));
  return { planned, actual: Number(actual || 0), variance, status: variance > 0 ? 'Over' : 'On Track' };
}

export async function listBudgets(params = {}) {
  return service.list(params);
}

export async function createBudget(payload) {
  const created = await service.create({ ...payload, createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'budget', description: `Created budget ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Budget created', details: `Budget ${created.name || created.id} is ready for tracking`, meta: { budgetId: created.id } });
  return created;
}

export async function updateBudget(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'budget', description: `Updated budget ${id}`, resourceId: id });
  return updated;
}

export default service;
