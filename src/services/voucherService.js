import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('vouchers');

export function generateVoucherNumber(prefix = 'JV', dateValue = new Date().toISOString().slice(0, 10), sequence = 1) {
  return `${prefix}-${dateValue.replace(/-/g, '')}-${String(sequence).padStart(6, '0')}`;
}

export function buildVoucherSummary(vouchers = []) {
  return vouchers.reduce((summary, voucher) => {
    summary.count += 1;
    summary.amount += Number(voucher.amount || 0);
    return summary;
  }, { count: 0, amount: 0 });
}

export async function listVouchers(params = {}) {
  return service.list(params);
}

export async function createVoucher(payload) {
  const created = await service.create({ ...payload, voucherNumber: payload.voucherNumber || generateVoucherNumber(payload.prefix || 'JV', payload.date || new Date().toISOString().slice(0, 10), payload.sequence || 1), createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'voucher', description: `Created voucher ${created.voucherNumber}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Voucher created', details: `Voucher ${created.voucherNumber} prepared for posting`, meta: { voucherId: created.id } });
  return created;
}

export async function postVoucher(id) {
  const updated = await service.update(id, { posted: true, postedAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Post', moduleKey: 'voucher', description: `Posted voucher ${id}`, resourceId: id });
  return updated;
}

export default service;
