import createMockResourceRepo from './resourceRepository.js';

// Provide a small set of named mock repos used by the app. Keep lightweight — pages call via provider.
const vendors = createMockResourceRepo('vendors', [
  { id: 'v-1', name: 'Acme Supplies', gst: 'GST123', email: 'procure@acme.example' },
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
  purchaseOrders,
  assets,
  stockMovements,
  assetAssignments,
  maintenanceRequests,
};
