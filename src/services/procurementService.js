import createResourceService from '../api/resourceService.js';
import { recordAuditEvent } from './auditService.js';
import notificationsService from './notificationsService.js';

const service = createResourceService('purchaseOrders');

export function calculateProcurementValue(purchases = []) {
  return purchases.reduce((sum, purchase) => sum + Number(purchase.grandTotal || 0), 0);
}

export function buildProcurementSummary({
  assets = [],
  vendors = [],
  purchases = [],
  stockMovements = [],
  assignments = [],
  maintenanceRequests = [],
} = {}) {
  const totalAssets = assets.length;
  const availableAssets = assets.filter((asset) => ['Available', 'In Stock', 'Received'].includes(asset.status)).length;
  const assignedAssets = assets.filter((asset) => asset.status === 'Assigned').length;
  const damagedAssets = assets.filter((asset) => asset.status === 'Damaged').length;
  const underMaintenance = assets.filter((asset) => asset.status === 'Under Maintenance').length || maintenanceRequests.filter((request) => request.status !== 'Completed').length;
  const lowStockItems = assets.filter((asset) => Number(asset.quantity || 1) <= 5).length;
  const totalVendors = vendors.length;
  const purchaseOrdersCount = purchases.length;
  const pendingRequests = assignments.filter((item) => item.status === 'Pending').length;
  const procurementValue = calculateProcurementValue(purchases);
  const assetValue = assets.reduce((sum, asset) => sum + Number(asset.purchasePrice || 0), 0);
  const stockMovementCount = stockMovements.length;

  return {
    totalAssets,
    availableAssets,
    assignedAssets,
    damagedAssets,
    underMaintenance,
    lowStockItems,
    totalVendors,
    purchaseOrdersCount,
    pendingRequests,
    procurementValue,
    assetValue,
    stockMovementCount,
  };
}

export function getProcurementHealthStatus({ lowStockItems = 0, pendingApprovals = 0, openMaintenanceRequests = 0 } = {}) {
  if (lowStockItems >= 3 || pendingApprovals >= 2 || openMaintenanceRequests >= 1) {
    return 'Watch';
  }
  return 'Healthy';
}

export async function listPurchaseOrders(params = {}) {
  return service.list(params);
}

export async function createPurchaseOrder(payload) {
  const created = await service.create({ ...payload, status: payload.status || 'Draft', createdAt: new Date().toISOString() });
  recordAuditEvent({ action: 'Create', moduleKey: 'inventory', description: `Created purchase order ${created.id}`, resourceId: created.id });
  notificationsService.addNotification({ title: 'Purchase order created', details: `Purchase order ${created.id} is ready for review`, meta: { purchaseOrderId: created.id } });
  return created;
}

export async function updatePurchaseOrder(id, payload) {
  const updated = await service.update(id, payload);
  recordAuditEvent({ action: 'Update', moduleKey: 'inventory', description: `Updated purchase order ${id}`, resourceId: id });
  return updated;
}

export default service;
