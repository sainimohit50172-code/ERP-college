import createMockResourceRepo from './resourceRepository.js';
import { feePayments } from '../../erpData.js';

// Provide a small set of named mock repos used by the app. Keep lightweight — pages call via provider.
const vendors = createMockResourceRepo('vendors', [
  { id: 'v-1', name: 'Acme Supplies', gst: 'GST123', email: 'procure@acme.example' },
]);

const examCalendars = createMockResourceRepo('examCalendars', [
  {
    id: 'ec-1',
    examName: 'END TERM EXAMINATION EVEN SEMESTER 2025-26',
    academicSession: '2025-26',
    examType: 'End Term Examination',
    examCategory: 'Regular',
    startDate: '2026-04-28',
    endDate: '2026-06-30',
    description: 'Final examination schedule for even semester covering all regular courses and programs.',
    createdBy: 'Dr. Meera Sharma',
    createdDate: '2026-03-28',
    status: 'Upcoming',
  },
  {
    id: 'ec-2',
    examName: 'MID TERM EXAMINATION 2025-26',
    academicSession: '2025-26',
    examType: 'Mid Term Examination',
    examCategory: 'Internal',
    startDate: '2025-12-03',
    endDate: '2025-12-18',
    description: 'Mid-term assessment schedule for first half of the academic session.',
    createdBy: 'Dr. Ravi Patel',
    createdDate: '2025-11-10',
    status: 'Completed',
  },
  {
    id: 'ec-3',
    examName: 'SUPPLEMENTARY EXAMINATION SPRING 2026',
    academicSession: '2025-26',
    examType: 'Supplementary Examination',
    examCategory: 'Supplementary',
    startDate: '2026-07-05',
    endDate: '2026-07-20',
    description: 'Supplementary exam cycle for students needing a second attempt in regular subjects.',
    createdBy: 'Mr. Arjun Singh',
    createdDate: '2026-06-15',
    status: 'Active',
  },
  {
    id: 'ec-4',
    examName: 'BACK PAPER EXAMINATION 2026',
    academicSession: '2026-27',
    examType: 'Back Paper Examination',
    examCategory: 'Supplementary',
    startDate: '2026-11-10',
    endDate: '2026-11-25',
    description: 'Back paper exams for students carrying backlog subjects from the previous session.',
    createdBy: 'Ms. Sanya Verma',
    createdDate: '2026-10-20',
    status: 'Upcoming',
  },
  {
    id: 'ec-5',
    examName: 'PRACTICAL EXAMINATION 2026-27',
    academicSession: '2026-27',
    examType: 'Practical Examination',
    examCategory: 'Practical',
    startDate: '2027-01-15',
    endDate: '2027-01-29',
    description: 'Practical examination window for laboratory and workshop based courses.',
    createdBy: 'Dr. Priya Nair',
    createdDate: '2026-12-10',
    status: 'Upcoming',
  },
]);

const purchaseOrders = createMockResourceRepo('purchaseOrders', [
  { id: 'po-1', purchaseOrderId: 'PO-1001', supplier: 'Acme Supplies', grandTotal: 120000, status: 'Approved', purchaseDate: '2026-06-01' },
]);

const assets = createMockResourceRepo('assets', [
  { id: 'as-1', name: 'Projector', status: 'Available', quantity: 2, purchasePrice: 50000 },
]);

const stockMovements = createMockResourceRepo('stockMovements', []);
const assetAssignments = createMockResourceRepo('assetAssignments', []);
const maintenanceRequests = createMockResourceRepo('maintenanceRequests', []);

const salaryStructures = createMockResourceRepo('salaryStructures', [
  {
    id: 'salary-struct-001',
    name: 'Standard Academic Staff',
    frequency: 'Monthly',
    basicSalary: 68000,
    hraPercent: 20,
    daPercent: 5,
    specialAllowancePercent: 12,
    overtimeRate: 900,
    providentFundPercent: 12,
    esiPercent: 0.75,
    professionalTaxAmount: 200,
    incomeTaxPercent: 5,
    active: true,
  },
  {
    id: 'salary-struct-002',
    name: 'Lab Technician Structure',
    frequency: 'Monthly',
    basicSalary: 52000,
    hraPercent: 18,
    daPercent: 5,
    specialAllowancePercent: 10,
    overtimeRate: 750,
    providentFundPercent: 12,
    esiPercent: 0.75,
    professionalTaxAmount: 180,
    incomeTaxPercent: 4,
    active: true,
  },
  {
    id: 'salary-struct-003',
    name: 'Support Staff Structure',
    frequency: 'Monthly',
    basicSalary: 36000,
    hraPercent: 15,
    daPercent: 4,
    specialAllowancePercent: 8,
    overtimeRate: 500,
    providentFundPercent: 12,
    esiPercent: 0.75,
    professionalTaxAmount: 150,
    incomeTaxPercent: 3,
    active: true,
  },
]);

const salaryRevisions = createMockResourceRepo('salaryRevisions', [
  {
    id: 'salary-revision-001',
    employeeName: 'Riya Sharma',
    employeeId: 'EMP-2024-101',
    effectiveDate: '2026-08-01',
    newBasicSalary: 72000,
    period: '2026-08',
    status: 'Approved',
  },
  {
    id: 'salary-revision-002',
    employeeName: 'Amit Verma',
    employeeId: 'EMP-2024-205',
    effectiveDate: '2026-09-01',
    newBasicSalary: 58000,
    period: '2026-09',
    status: 'Pending',
  },
]);

const payrollRuns = createMockResourceRepo('payrollRuns', [
  {
    id: 'payroll-run-001',
    employeeName: 'Riya Sharma',
    employeeId: 'EMP-2024-101',
    period: '2026-08',
    grossSalary: 95000,
    totalDeductions: 12850,
    netSalary: 82150,
    status: 'Processed',
    frequency: 'Monthly',
    approvedLeaveDays: 2,
    attendanceDays: 28,
  },
  {
    id: 'payroll-run-002',
    employeeName: 'Amit Verma',
    employeeId: 'EMP-2024-205',
    period: '2026-08',
    grossSalary: 72000,
    totalDeductions: 10660,
    netSalary: 61340,
    status: 'Review',
    frequency: 'Monthly',
    approvedLeaveDays: 1,
    attendanceDays: 29,
  },
  {
    id: 'payroll-run-003',
    employeeName: 'Neha Singh',
    employeeId: 'EMP-2024-118',
    period: '2026-08',
    grossSalary: 64000,
    totalDeductions: 9450,
    netSalary: 54550,
    status: 'Draft',
    frequency: 'Monthly',
    approvedLeaveDays: 0,
    attendanceDays: 30,
  },
]);

const payslips = createMockResourceRepo('payslips', [
  {
    id: 'payslip-001',
    employeeName: 'Riya Sharma',
    employeeId: 'EMP-2024-101',
    period: '2026-08',
    grossSalary: 95000,
    netSalary: 82150,
    deductions: 12850,
    status: 'Approved',
  },
  {
    id: 'payslip-002',
    employeeName: 'Amit Verma',
    employeeId: 'EMP-2024-205',
    period: '2026-08',
    grossSalary: 72000,
    netSalary: 61340,
    deductions: 10660,
    status: 'Generated',
  },
]);

const taxComponents = createMockResourceRepo('taxComponents', [
  {
    id: 'tax-001',
    name: 'Income Tax',
    type: 'Deduction',
    value: '5%',
    status: 'Active',
  },
  {
    id: 'tax-002',
    name: 'Professional Tax',
    type: 'Deduction',
    value: '₹200',
    status: 'Active',
  },
  {
    id: 'tax-003',
    name: 'Provident Fund',
    type: 'Deduction',
    value: '12%',
    status: 'Active',
  },
]);

const payments = createMockResourceRepo('payments', feePayments.map((payment) => ({
  ...payment,
  paymentId: payment.id,
  receiptNumber: `RCT-${payment.id}`,
  paidAt: payment.date,
  paymentMethod: payment.method,
  studentName: payment.studentId,
})),
);

const receipts = createMockResourceRepo('receipts', feePayments.map((payment) => ({
  id: `receipt-${payment.id}`,
  receiptNumber: `RCT-${payment.id}`,
  studentId: payment.studentId,
  studentName: payment.studentId,
  amount: payment.amount,
  paymentMethod: payment.method,
  date: payment.date,
})),
);


const hostelRooms = createMockResourceRepo('hostelRooms');
const hostelAllocations = createMockResourceRepo('hostelAllocations');
const hostelLeaves = createMockResourceRepo('hostelLeaves');
const libraryBooks = createMockResourceRepo('libraryBooks');
const transports = createMockResourceRepo('transports');
const transportVehicles = createMockResourceRepo('transportVehicles');
const transportRoutes = createMockResourceRepo('transportRoutes');
const studentTransportAssignments = createMockResourceRepo('studentTransportAssignments');
const otherIncome = createMockResourceRepo('otherIncome');
export default {
  vendors,
  examCalendars,
  purchaseOrders,
  assets,
  stockMovements,
  assetAssignments,
  maintenanceRequests,
  salaryStructures,
  salaryRevisions,
  payrollRuns,
  payslips,
  taxComponents,
  payments,
  receipts,
  hostelRooms,
  hostelAllocations,
  hostelLeaves,
  libraryBooks,
  transports,
  transportVehicles,
  transportRoutes,
  studentTransportAssignments,
  otherIncome,
};
