import { recordAuditEvent } from './auditService.js';
import createResourceService from '../api/resourceService.js';

const receiptService = createResourceService('receipts');

export function generateReceiptNumber() {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RCT-${timestamp}-${randomSuffix}`;
}

export async function createReceipt(payload) {
  const receipt = {
    ...payload,
    id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    receiptNumber: payload.receiptNumber || generateReceiptNumber(),
    amount: Number(payload.amount || 0),
    paymentMethod: payload.paymentMethod || payload.method || 'Cash',
    date: payload.date || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    issuedBy: payload.issuedBy || 'Accounts Team',
    organization: payload.organization || 'Enterprise College',
    branding: payload.branding || {
      name: 'Enterprise College',
      address: '123 College Road, Education City',
      contact: 'contact@enterprise.edu',
    },
  };
  const result = await receiptService.create(receipt);
  recordAuditEvent({ action: 'Create', moduleKey: 'fees', description: `Generated receipt ${result.receiptNumber}`, resourceId: result.id });
  return result;
}

export async function getReceipt(id) {
  return receiptService.get(id);
}

export async function regenerateReceipt(receiptId, overrides = {}) {
  const existing = await receiptService.get(receiptId);
  if (!existing) {
    throw new Error(`Receipt not found: ${receiptId}`);
  }
  const updated = {
    ...existing,
    ...overrides,
    receiptNumber: generateReceiptNumber(),
    regeneratedAt: new Date().toISOString(),
  };
  const result = await receiptService.update(receiptId, updated);
  recordAuditEvent({ action: 'Update', moduleKey: 'fees', description: `Regenerated receipt ${updated.receiptNumber}`, resourceId: receiptId });
  return result;
}

export async function listReceipts(params = {}) {
  return receiptService.list(params);
}

export async function downloadReceiptPdf(receipt) {
  const content = `Receipt #${receipt.receiptNumber}\nStudent: ${receipt.studentName}\nAmount: ${receipt.amount}\nMethod: ${receipt.paymentMethod}\nDate: ${receipt.date}`;
  return new Blob([content], { type: 'application/pdf' });
}

export default receiptService;
