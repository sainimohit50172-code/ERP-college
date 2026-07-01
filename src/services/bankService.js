import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('bankAccounts');

export function getBankBalance(accounts = []) {
  return accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
}

export async function listBankAccounts(params = {}) {
  return service.list(params);
}

export async function createBankAccount(payload) {
  const created = await service.create({ ...payload, createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'bank', description: `Created bank account ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Bank account created', details: `Bank account ${created.name || created.id} is available`, meta: { bankAccountId: created.id } });
  return created;
}

export async function updateBankAccount(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'bank', description: `Updated bank account ${id}`, resourceId: id });
  return updated;
}

export default service;
