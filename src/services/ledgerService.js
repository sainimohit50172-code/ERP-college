import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('journalEntries');

export function summarizeLedger(entries = []) {
  return entries.reduce((summary, entry) => {
    summary.totalDebit += Number(entry.debit || 0);
    summary.totalCredit += Number(entry.credit || 0);
    summary.entries += 1;
    return summary;
  }, { totalDebit: 0, totalCredit: 0, entries: 0 });
}

export async function listLedgerEntries(params = {}) {
  return service.list(params);
}

export async function createLedgerEntry(payload) {
  const created = await service.create({ ...payload, createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'ledger', description: `Created ledger entry ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Ledger entry posted', details: `Entry ${created.id} posted to the general ledger`, meta: { entryId: created.id } });
  return created;
}

export async function approveLedgerEntry(id, payload = {}) {
  const updated = await service.update(id, { approved: true, approvedAt: new Date().toISOString(), approvalRemarks: payload.remarks || '' });
  recordAuditEvent({ action: 'Approve', moduleKey: 'ledger', description: `Approved ledger entry ${id}`, resourceId: id });
  return updated;
}

export default service;
