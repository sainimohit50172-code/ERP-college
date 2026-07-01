import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildProcurementSummary,
  calculateProcurementValue,
  getProcurementHealthStatus,
} from '../src/services/procurementService.js';

test('calculateProcurementValue sums purchase order totals', () => {
  const value = calculateProcurementValue([
    { grandTotal: 120000 },
    { grandTotal: 45000 },
    { grandTotal: '8000' },
  ]);

  assert.equal(value, 173000);
});

test('buildProcurementSummary reports stock and asset health metrics', () => {
  const summary = buildProcurementSummary({
    assets: [
      { status: 'Available', quantity: 1, purchasePrice: 1000 },
      { status: 'Assigned', quantity: 2, purchasePrice: 2500 },
      { status: 'Damaged', quantity: 1, purchasePrice: 800 },
      { status: 'Under Maintenance', quantity: 3, purchasePrice: 3000 },
    ],
    vendors: [{ id: 1 }, { id: 2 }],
    purchases: [{ grandTotal: 120000, status: 'Approved' }, { grandTotal: 45000, status: 'Pending' }],
    stockMovements: [{ type: 'Stock Out' }, { type: 'Transfer' }],
    assignments: [{ status: 'Pending' }, { status: 'Assigned' }],
    maintenanceRequests: [{ status: 'Requested' }, { status: 'Completed' }],
  });

  assert.equal(summary.totalAssets, 4);
  assert.equal(summary.availableAssets, 1);
  assert.equal(summary.assignedAssets, 1);
  assert.equal(summary.damagedAssets, 1);
  assert.equal(summary.underMaintenance, 1);
  assert.equal(summary.lowStockItems, 4);
  assert.equal(summary.totalVendors, 2);
  assert.equal(summary.purchaseOrdersCount, 2);
  assert.equal(summary.procurementValue, 165000);
  assert.equal(summary.pendingRequests, 1);
  assert.equal(summary.assetValue, 7300);
});

test('getProcurementHealthStatus flags low stock and pending approvals', () => {
  const status = getProcurementHealthStatus({ lowStockItems: 3, pendingApprovals: 2, openMaintenanceRequests: 1 });

  assert.equal(status, 'Watch');
});
