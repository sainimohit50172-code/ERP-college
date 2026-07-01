import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('chartOfAccounts');

export function calculateTrialBalance(accounts = [], entries = []) {
  return accounts.map((account) => {
    const totalDebit = entries
      .filter((entry) => String(entry.accountId) === String(account.id))
      .reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
    const totalCredit = entries
      .filter((entry) => String(entry.accountId) === String(account.id))
      .reduce((sum, entry) => sum + Number(entry.credit || 0), 0);

    return {
      ...account,
      debit: Number(totalDebit.toFixed(2)),
      credit: Number(totalCredit.toFixed(2)),
      balance: Number((totalDebit - totalCredit).toFixed(2)),
    };
  });
}

export async function listChartOfAccounts(params = {}) {
  return service.list(params);
}

export async function createChartOfAccount(payload) {
  const created = await service.create({ ...payload, createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'finance', description: `Created account ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Chart of accounts updated', details: `Account ${created.name || created.id} added`, meta: { accountId: created.id } });
  return created;
}

export async function updateChartOfAccount(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'finance', description: `Updated account ${id}`, resourceId: id });
  return updated;
}

export default service;
