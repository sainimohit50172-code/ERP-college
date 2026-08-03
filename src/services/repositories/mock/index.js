import createMockResourceRepo from './resourceRepository.js';

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

export default {
  vendors,
  examCalendars,
  purchaseOrders,
  assets,
  stockMovements,
  assetAssignments,
  maintenanceRequests,
};
