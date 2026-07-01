import createResourceService from '../api/resourceService.js';
import { normalizeAcademicContext, normalizeEntityPayload } from '../utils/domainModels.js';
import { recordAuditEvent } from './auditService.js';

const feeService = createResourceService('fees');

const defaultFeeStructures = [
  {
    id: 'FEE-STR-001',
    academicYear: '2025-26',
    campus: 'Main Campus',
    departmentId: 'DEPT-CS',
    courseId: 'COURSE-BCA',
    semesterId: 'SEM-BCA-1',
    category: 'Undergraduate',
    feeHeads: {
      tuition: 32000,
      admission: 4500,
      exam: 1200,
      library: 800,
      hostel: 0,
      transport: 2400,
      misc: 1500,
    },
    installments: 3,
    dueDates: ['2025-06-30', '2025-08-31', '2025-10-15'],
    lateFeeRules: {
      graceDays: 7,
      flatAmount: 250,
      percentage: 2,
    },
    discounts: [
      { id: 'DISC-001', name: 'Early bird', type: 'fixed', value: 1500 },
      { id: 'DISC-002', name: 'Sibling discount', type: 'percentage', value: 5 },
    ],
    scholarships: ['Merit Scholarship', 'Need Based Scholarship'],
    status: 'Active',
  },
  {
    id: 'FEE-STR-002',
    academicYear: '2025-26',
    campus: 'Main Campus',
    departmentId: 'DEPT-BA',
    courseId: 'COURSE-MBA',
    semesterId: 'SEM-MBA-1',
    category: 'Postgraduate',
    feeHeads: {
      tuition: 52000,
      admission: 6000,
      exam: 1400,
      library: 900,
      hostel: 0,
      transport: 2600,
      misc: 1800,
    },
    installments: 4,
    dueDates: ['2025-06-15', '2025-08-15', '2025-10-01', '2025-12-01'],
    lateFeeRules: {
      graceDays: 5,
      flatAmount: 300,
      percentage: 3,
    },
    discounts: [
      { id: 'DISC-003', name: 'Merit discount', type: 'percentage', value: 10 },
    ],
    scholarships: ['Academic Excellence Scholarship'],
    status: 'Active',
  },
];

export function calculateFeeTotal(feeHeads) {
  if (!feeHeads) return 0;
  return Object.values(feeHeads).reduce((sum, value) => sum + Number(value || 0), 0);
}

export function calculateDiscountAmount(totalFee, discounts = []) {
  return discounts.reduce((sum, discount) => {
    if (discount.type === 'percentage') {
      return sum + (totalFee * Number(discount.value || 0)) / 100;
    }
    return sum + Number(discount.value || 0);
  }, 0);
}

export function getInstallmentSchedule({ totalFee, installments = 1, dueDates = [], lateFeeRules = {} }) {
  const schedule = [];
  const baseAmount = Math.floor(totalFee / installments);
  const remainder = totalFee - baseAmount * installments;

  for (let index = 0; index < installments; index += 1) {
    schedule.push({
      installmentNumber: index + 1,
      amount: baseAmount + (index === installments - 1 ? remainder : 0),
      dueDate: dueDates[index] || null,
      status: 'Pending',
      lateFeeRules,
    });
  }

  return schedule;
}

export function getDefaultFeeStructure(id) {
  return defaultFeeStructures.find((structure) => structure.id === id) || null;
}

export async function listFeeStructures(params = {}) {
  const data = await feeService.list(params);
  if (!data.items?.length) {
    return {
      items: defaultFeeStructures,
      total: defaultFeeStructures.length,
      page: 1,
      pageSize: defaultFeeStructures.length,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
  return data;
}

export async function getFeeStructure(id) {
  const structure = await feeService.get(id);
  if (structure) return structure;
  return getDefaultFeeStructure(id);
}

export async function createFeeStructure(payload) {
  const totalHeadAmount = calculateFeeTotal(payload.feeHeads);
  const enriched = normalizeEntityPayload(
    {
      ...payload,
      totalAmount: totalHeadAmount,
      feeHeads: payload.feeHeads || {},
    },
    { fallbackContext: normalizeAcademicContext(payload) },
  );
  const item = await feeService.create(enriched);
  recordAuditEvent({ action: 'Create', moduleKey: 'fees', description: `Created fee structure ${item.id}`, resourceId: item.id });
  return item;
}

export async function updateFeeStructure(id, payload) {
  const totalHeadAmount = calculateFeeTotal(payload.feeHeads);
  const enriched = normalizeEntityPayload(
    {
      ...payload,
      totalAmount: totalHeadAmount,
      feeHeads: payload.feeHeads || {},
    },
    { fallbackContext: normalizeAcademicContext(payload) },
  );
  enriched.id = id;
  const item = await feeService.update(id, enriched);
  recordAuditEvent({ action: 'Update', moduleKey: 'fees', description: `Updated fee structure ${id}`, resourceId: id });
  return item;
}

export async function deleteFeeStructure(id) {
  const result = await feeService.remove(id);
  recordAuditEvent({ action: 'Delete', moduleKey: 'fees', description: `Deleted fee structure ${id}`, resourceId: id });
  return result;
}

export function calculateStudentLedger(student, payments = [], scholarships = []) {
  const totalFee = Number(student.totalFee || student.balance || 0);
  const paidAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const scholarshipAmount = scholarships.reduce((sum, scholarship) => {
    if (scholarship.status !== 'Approved') return sum;
    if (scholarship.type === 'percentage') {
      return sum + (totalFee * Number(scholarship.value || 0)) / 100;
    }
    return sum + Number(scholarship.value || scholarship.amount || 0);
  }, 0);
  const waiver = Number(student.waiver || 0);
  const fine = Number(student.fine || 0);
  const balance = Math.max(0, totalFee - paidAmount - scholarshipAmount - waiver + fine);

  return {
    totalFee,
    paidAmount,
    pendingAmount: Math.max(0, totalFee - paidAmount),
    waiver,
    scholarshipAmount,
    fine,
    balance,
  };
}
