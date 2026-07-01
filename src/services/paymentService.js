import createResourceService from '../api/resourceService.js';
import { normalizeEntityPayload } from '../utils/domainModels.js';
import { recordAuditEvent } from './auditService.js';
import { createReceipt } from './receiptService.js';

const paymentService = createResourceService('payments');

const paymentMethods = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'Bank Transfer'];

export const PAYMENT_METHODS = paymentMethods;

export function buildPaymentPayload(data) {
  const normalized = normalizeEntityPayload(
    {
      id: data.id || data.paymentId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      paymentId: data.paymentId || data.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      studentId: data.studentId || '',
      studentName: data.studentName || data.studentName || '',
      departmentId: data.departmentId || data.departmentId || '',
      courseId: data.courseId || data.courseId || '',
      amount: Number(data.amount || 0),
      fine: Number(data.fine || 0),
      scholarshipAmount: Number(data.scholarshipAmount || 0),
      waiverAmount: Number(data.waiverAmount || 0),
      discountAmount: Number(data.discountAmount || 0),
      method: data.method || data.paymentMethod || 'Cash',
      paidAt: data.paidAt || new Date().toISOString(),
      dueDate: data.dueDate || data.paidAt || new Date().toISOString(),
      receiptNumber: data.receiptNumber || null,
      installmentNumber: data.installmentNumber || null,
      status: data.status || 'Paid',
      notes: data.notes || '',
      metadata: data.metadata || {},
    },
    { fallbackId: data?.id || data?.paymentId || null },
  );

  return {
    ...normalized,
    paymentId: normalized.paymentId || normalized.id,
    method: normalized.method || 'Cash',
  };
}

export async function createPayment(data) {
  const payload = buildPaymentPayload(data);
  const created = await paymentService.create(payload);
  const receipt = await createReceipt({
    studentId: payload.studentId,
    studentName: payload.studentName,
    amount: payload.amount,
    paymentMethod: payload.method,
    date: payload.paidAt.slice(0, 10),
    paymentId: payload.paymentId,
    metadata: { source: 'fees', paymentId: payload.paymentId },
  });

  if (!created.receiptNumber || created.receiptNumber !== receipt.receiptNumber) {
    await paymentService.update(created.id, { receiptNumber: receipt.receiptNumber });
  }

  recordAuditEvent({
    action: 'Create',
    moduleKey: 'fees',
    description: `Recorded payment ${payload.paymentId}`,
    resourceId: created.id,
    metadata: { status: payload.status, installmentNumber: payload.installmentNumber },
  });
  return { ...created, receiptNumber: receipt.receiptNumber };
}

export async function listPayments(params = {}) {
  return paymentService.list(params);
}

export async function getPayment(id) {
  return paymentService.get(id);
}

export async function updatePayment(id, payload) {
  const result = await paymentService.update(id, payload);
  recordAuditEvent({
    action: 'Update',
    moduleKey: 'fees',
    description: `Updated payment ${id}`,
    resourceId: id,
    metadata: { status: payload.status },
  });
  return result;
}

export async function cancelPayment(id, reason = 'Cancelled by user') {
  const payload = {
    status: 'Cancelled',
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason,
  };
  const result = await paymentService.update(id, payload);
  recordAuditEvent({
    action: 'Cancel',
    moduleKey: 'fees',
    description: `Cancelled payment ${id}`,
    resourceId: id,
    metadata: { reason },
  });
  return result;
}

export async function deletePayment(id) {
  const result = await paymentService.remove(id);
  recordAuditEvent({
    action: 'Delete',
    moduleKey: 'fees',
    description: `Deleted payment ${id}`,
    resourceId: id,
  });
  return result;
}

export default paymentService;
