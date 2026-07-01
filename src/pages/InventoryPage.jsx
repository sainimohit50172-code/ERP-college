import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useResourceList,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useBulkImport,
  useBulkExport,
} from '../hooks/useResourceHooks';
import uploadService from '../api/uploadService';
import {
  Database,
  Box,
  ShoppingCart,
  Users,
  Truck,
  Tag,
  ClipboardList,
  CheckSquare,
  ShieldCheck,
  CalendarCheck,
  Download,
  Printer,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import AdvancedFilter from '../components/ui/AdvancedFilter.jsx';
import ExportButton from '../components/ui/ExportButton.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import PanelCard from '../components/ui/PanelCard.jsx';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { buildProcurementSummary, getProcurementHealthStatus } from '../services/procurementService.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Title);

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'categories', label: 'Asset Categories' },
  { key: 'assets', label: 'Assets' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'stock', label: 'Stock' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'transfers', label: 'Transfers' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'reports', label: 'Reports' },
];

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Requested', label: 'Requested' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Purchased', label: 'Purchased' },
  { value: 'Received', label: 'Received' },
  { value: 'Available', label: 'Available' },
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'In Use', label: 'In Use' },
  { value: 'Under Maintenance', label: 'Under Maintenance' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Lost', label: 'Lost' },
  { value: 'Scrapped', label: 'Scrapped' },
  { value: 'Disposed', label: 'Disposed' },
];

const defaultFilterOptions = [
  { value: 'All', label: 'All' },
];

const stockTypeOptions = [
  { value: 'All', label: 'All movements' },
  { value: 'Stock In', label: 'Stock In' },
  { value: 'Stock Out', label: 'Stock Out' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Return', label: 'Return' },
  { value: 'Adjustment', label: 'Adjustment' },
];

const assignmentStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Returned', label: 'Returned' },
];

const maintenanceStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Requested', label: 'Requested' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

const transferStatusOptions = [
  { value: 'All', label: 'All movements' },
  { value: 'Stock In', label: 'Stock In' },
  { value: 'Stock Out', label: 'Stock Out' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Return', label: 'Return' },
  { value: 'Adjustment', label: 'Adjustment' },
];

const warrantyStatusOptions = [
  { value: 'All', label: 'All warranties' },
  { value: 'Active', label: 'Active' },
  { value: 'Expiring Soon', label: 'Expiring Soon' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Untracked', label: 'Untracked' },
];

const insuranceStatusOptions = [
  { value: 'All', label: 'All insurance' },
  { value: 'Active', label: 'Active' },
  { value: 'Renewal Pending', label: 'Renewal Pending' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Untracked', label: 'Untracked' },
];

const defaultCategoryValues = {
  name: '',
  description: '',
  exampleItems: '',
};

const defaultAssetValues = {
  assetId: '',
  assetTag: '',
  qrCode: '',
  barcode: '',
  name: '',
  category: '',
  brand: '',
  model: '',
  serialNumber: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  installationDate: new Date().toISOString().slice(0, 10),
  purchasePrice: '0',
  vendor: '',
  vendorContact: '',
  warranty: '',
  warrantyStart: new Date().toISOString().slice(0, 10),
  warrantyEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
  insuranceCompany: '',
  insurancePolicyNumber: '',
  insuranceStartDate: new Date().toISOString().slice(0, 10),
  insuranceExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
  insuranceClaimStatus: 'Active',
  insurancePremium: '0',
  renewalReminder: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString().slice(0, 10),
  depreciationEstimate: '0',
  amcDetails: '',
  notes: '',
  currentLocation: '',
  assignedTo: '',
  status: 'Requested',
  quantity: 1,
  assetPhoto: null,
  assetAttachments: null,
  invoiceUrl: null,
  purchaseBillUrl: null,
  warrantyCardUrl: null,
  manualUrl: null,
};

const defaultVendorValues = {
  name: '',
  gst: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  bankDetails: '',
};

const defaultPurchaseValues = {
  purchaseOrderId: '',
  supplier: '',
  invoiceNumber: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  tax: '0',
  discount: '0',
  grandTotal: '0',
  attachments: null,
};

const defaultStockValues = {
  movementId: '',
  assetId: '',
  type: 'Stock In',
  quantity: 1,
  source: '',
  destination: '',
  notes: '',
};

const defaultAssignmentValues = {
  assignmentId: '',
  assetId: '',
  assignedTo: '',
  assignedType: 'Teacher',
  department: '',
  location: '',
  assignedDate: new Date().toISOString().slice(0, 10),
  returnDate: '',
  status: 'Pending',
  notes: '',
};

const defaultMaintenanceValues = {
  requestId: '',
  assetId: '',
  issue: '',
  vendor: '',
  scheduleDate: new Date().toISOString().slice(0, 10),
  repairCost: '0',
  spareParts: '',
  technician: '',
  completionDate: '',
  vendorVisitNotes: '',
  warrantyClaim: 'No',
  amcDetails: '',
  status: 'Requested',
  serviceHistory: '',
  remarks: '',
  attachments: null,
};

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function printHtmlContent(title, content) {
  const newWindow = window.open('', '_blank', 'width=900,height=700');
  if (!newWindow) return;
  newWindow.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #0f172a; background: #f8fafc; }
      h1 { margin-bottom: 18px; font-size: 28px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { padding: 12px 14px; border: 1px solid #e2e8f0; }
      th { background: #f1f5f9; text-align: left; }
      .card { border: 1px solid #cbd5e1; border-radius: 22px; margin-bottom: 18px; padding: 18px; background: white; }
    </style>
    </head><body><h1>${title}</h1>${content}</body></html>
  `);
  newWindow.document.close();
  newWindow.focus();
  newWindow.print();
}

export default function InventoryPage() {
  const assetPhotoRef = useRef(null);
  const documentRef = useRef(null);
  const purchaseAttachmentRef = useRef(null);
  const maintenanceAttachmentRef = useRef(null);

  const { data: categoryData = {} } = useResourceList('assetCategories', { page: 1, pageSize: 200 });
  const { data: assetData = {} } = useResourceList('assets', { page: 1, pageSize: 200 });
  const { data: vendorData = {} } = useResourceList('vendors', { page: 1, pageSize: 200 });
  const { data: purchaseData = {} } = useResourceList('purchaseOrders', { page: 1, pageSize: 200 });
  const { data: stockData = {} } = useResourceList('stockMovements', { page: 1, pageSize: 200 });
  const { data: assignmentData = {} } = useResourceList('assetAssignments', { page: 1, pageSize: 200 });
  const { data: maintenanceData = {} } = useResourceList('maintenanceRequests', { page: 1, pageSize: 200 });

  const categories = categoryData.items || [];
  const assets = assetData.items || [];
  const vendors = vendorData.items || [];
  const purchases = purchaseData.items || [];
  const stockMovements = stockData.items || [];
  const assignments = assignmentData.items || [];
  const maintenanceRequests = maintenanceData.items || [];

  const createCategory = useCreateResource('assetCategories');
  const updateCategory = useUpdateResource('assetCategories');
  const deleteCategory = useDeleteResource('assetCategories');
  const exportCategories = useBulkExport('assetCategories');
  const _importCategories = useBulkImport('assetCategories');

  const createAsset = useCreateResource('assets');
  const updateAsset = useUpdateResource('assets');
  const deleteAsset = useDeleteResource('assets');
  const exportAssets = useBulkExport('assets');
  const _importAssets = useBulkImport('assets');

  const createVendor = useCreateResource('vendors');
  const updateVendor = useUpdateResource('vendors');
  const deleteVendor = useDeleteResource('vendors');
  const exportVendors = useBulkExport('vendors');
  const _importVendors = useBulkImport('vendors');

  const createPurchase = useCreateResource('purchaseOrders');
  const updatePurchase = useUpdateResource('purchaseOrders');
  const deletePurchase = useDeleteResource('purchaseOrders');
  const exportPurchases = useBulkExport('purchaseOrders');
  const _importPurchases = useBulkImport('purchaseOrders');

  const createStock = useCreateResource('stockMovements');
  const updateStock = useUpdateResource('stockMovements');
  const deleteStock = useDeleteResource('stockMovements');
  const exportStock = useBulkExport('stockMovements');

  const createAssignment = useCreateResource('assetAssignments');
  const updateAssignment = useUpdateResource('assetAssignments');
  const deleteAssignment = useDeleteResource('assetAssignments');
  const exportAssignments = useBulkExport('assetAssignments');

  const createMaintenance = useCreateResource('maintenanceRequests');
  const updateMaintenance = useUpdateResource('maintenanceRequests');
  const deleteMaintenance = useDeleteResource('maintenanceRequests');
  const exportMaintenance = useBulkExport('maintenanceRequests');

  const [activeTab, setActiveTab] = useState('overview');
  const [categorySearch, setCategorySearch] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('All');
  const [stockSearch, setStockSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('All');
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  const [maintenanceFilter, setMaintenanceFilter] = useState('All');
  const [transferSearch, setTransferSearch] = useState('');
  const [transferFilter, setTransferFilter] = useState('All');
  const [warrantySearch, setWarrantySearch] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState('All');
  const [insuranceSearch, setInsuranceSearch] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('All');

  const [categoryPage, setCategoryPage] = useState(1);
  const [assetPage, setAssetPage] = useState(1);
  const [vendorPage, setVendorPage] = useState(1);
  const [purchasePage, setPurchasePage] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [maintenancePage, setMaintenancePage] = useState(1);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategory, setIsEditCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isEditAsset, setIsEditAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isEditVendor, setIsEditVendor] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isEditPurchase, setIsEditPurchase] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isEditStock, setIsEditStock] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isEditAssignment, setIsEditAssignment] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isEditMaintenance, setIsEditMaintenance] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const [transferPage, setTransferPage] = useState(1);
  const [warrantyPage, setWarrantyPage] = useState(1);
  const [insurancePage, setInsurancePage] = useState(1);

  const categoryForm = useForm({ defaultValues: defaultCategoryValues });
  const assetForm = useForm({ defaultValues: defaultAssetValues });
  const vendorForm = useForm({ defaultValues: defaultVendorValues });
  const purchaseForm = useForm({ defaultValues: defaultPurchaseValues });
  const stockForm = useForm({ defaultValues: defaultStockValues });
  const assignmentForm = useForm({ defaultValues: defaultAssignmentValues });
  const maintenanceForm = useForm({ defaultValues: defaultMaintenanceValues });

  const { register: registerCategory, handleSubmit: handleSubmitCategory, reset: resetCategory, formState: { errors: categoryErrors } } = categoryForm;
  const { register: registerAsset, handleSubmit: handleSubmitAsset, reset: resetAsset, formState: { errors: assetErrors } } = assetForm;
  const { register: registerVendor, handleSubmit: handleSubmitVendor, reset: resetVendor, formState: { errors: vendorErrors } } = vendorForm;
  const { register: registerPurchase, handleSubmit: handleSubmitPurchase, reset: resetPurchase, formState: { errors: _purchaseErrors } } = purchaseForm;
  const { register: registerStock, handleSubmit: handleSubmitStock, reset: resetStock, formState: { errors: _stockErrors } } = stockForm;
  const { register: registerAssignment, handleSubmit: handleSubmitAssignment, reset: resetAssignment, formState: { errors: _assignmentErrors } } = assignmentForm;
  const { register: registerMaintenance, handleSubmit: handleSubmitMaintenance, reset: resetMaintenance, formState: { errors: _maintenanceErrors } } = maintenanceForm;

  const procurementSummary = useMemo(() => buildProcurementSummary({
    assets,
    vendors,
    purchases,
    stockMovements,
    assignments,
    maintenanceRequests,
  }), [assets, vendors, purchases, stockMovements, assignments, maintenanceRequests]);

  const {
    totalAssets,
    availableAssets,
    assignedAssets,
    damagedAssets,
    underMaintenance,
    lowStockItems,
    totalVendors,
    purchaseOrdersCount,
    pendingRequests,
    assetValue,
    procurementValue,
  } = procurementSummary;

  const procurementHealthStatus = useMemo(() => getProcurementHealthStatus({
    lowStockItems,
    pendingApprovals: purchases.filter((purchase) => purchase.status === 'Pending').length,
    openMaintenanceRequests: maintenanceRequests.filter((request) => request.status !== 'Completed').length,
  }), [lowStockItems, purchases, maintenanceRequests]);

  const _assetCategoryDistribution = useMemo(() => {
    const counts = {};
    assets.forEach((asset) => {
      const category = asset.category || 'Uncategorized';
      counts[category] = (counts[category] || 0) + Number(asset.quantity || 1);
    });
    return counts;
  }, [assets]);

  const purchaseTrend = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        label: date.toLocaleString('default', { month: 'short' }),
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      };
    });

    const values = months.map(() => 0);
    purchases.forEach((purchase) => {
      if (!purchase.purchaseDate) return;
      const date = new Date(purchase.purchaseDate);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const index = months.findIndex((month) => month.key === key);
      if (index >= 0) {
        values[index] += Number(purchase.grandTotal || 0);
      }
    });

    return { labels: months.map((month) => month.label), values };
  }, [purchases]);

  const assetStatusDistribution = useMemo(() => {
    const statuses = ['Requested', 'Approved', 'Purchased', 'Received', 'Available', 'In Stock', 'Assigned', 'In Use', 'Under Maintenance', 'Damaged', 'Lost', 'Scrapped', 'Disposed'];
    const counts = statuses.map((status) => assets.filter((asset) => asset.status === status).length);
    return { labels: statuses, counts };
  }, [assets]);

  const categoryRows = useMemo(() => {
    const searchTerm = categorySearch.toLowerCase();
    return categories.filter((category) => [category.name, category.description, category.exampleItems]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm)));
  }, [categories, categorySearch]);

  const assetRows = useMemo(() => {
    const searchTerm = assetSearch.toLowerCase();
    return assets.filter((asset) => {
      const matchesSearch = [asset.assetId, asset.name, asset.category, asset.brand, asset.model, asset.serialNumber, asset.vendor, asset.department, asset.currentLocation, asset.assignedTo, asset.status]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = assetFilter === 'All' || asset.status === assetFilter;
      return matchesSearch && matchesFilter;
    });
  }, [assets, assetSearch, assetFilter]);

  const vendorRows = useMemo(() => {
    const searchTerm = vendorSearch.toLowerCase();
    return vendors.filter((vendor) => [vendor.name, vendor.gst, vendor.email, vendor.phone, vendor.address, vendor.contactPerson, vendor.bankDetails]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm)));
  }, [vendors, vendorSearch]);

  const purchaseRows = useMemo(() => {
    const searchTerm = purchaseSearch.toLowerCase();
    return purchases.filter((purchase) => [purchase.purchaseOrderId, purchase.supplier, purchase.invoiceNumber, purchase.purchaseDate, purchase.grandTotal]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(searchTerm)));
  }, [purchases, purchaseSearch]);

  const stockRows = useMemo(() => {
    const searchTerm = stockSearch.toLowerCase();
    return stockMovements.filter((movement) => {
      const matchesSearch = [movement.movementId, movement.assetId, movement.type, movement.source, movement.destination, movement.notes]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = stockFilter === 'All' || movement.type === stockFilter;
      return matchesSearch && matchesFilter;
    });
  }, [stockMovements, stockSearch, stockFilter]);

  const assignmentRows = useMemo(() => {
    const searchTerm = assignmentSearch.toLowerCase();
    return assignments.filter((assignment) => {
      const matchesSearch = [assignment.assignmentId, assignment.assetId, assignment.assignedTo, assignment.assignedType, assignment.department, assignment.location, assignment.status]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = assignmentFilter === 'All' || assignment.status === assignmentFilter;
      return matchesSearch && matchesFilter;
    });
  }, [assignments, assignmentSearch, assignmentFilter]);

  const maintenanceRows = useMemo(() => {
    const searchTerm = maintenanceSearch.toLowerCase();
    return maintenanceRequests.filter((request) => {
      const matchesSearch = [request.requestId, request.assetId, request.issue, request.vendor, request.status, request.amcDetails]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = maintenanceFilter === 'All' || request.status === maintenanceFilter;
      return matchesSearch && matchesFilter;
    });
  }, [maintenanceRequests, maintenanceSearch, maintenanceFilter]);

  const categoryPageSize = 6;
  const assetPageSize = 8;
  const vendorPageSize = 6;
  const purchasePageSize = 6;
  const stockPageSize = 7;
  const assignmentPageSize = 7;
  const maintenancePageSize = 6;

  const displayedCategories = categoryRows.slice((categoryPage - 1) * categoryPageSize, categoryPage * categoryPageSize);
  const categoryPageCount = Math.max(1, Math.ceil(categoryRows.length / categoryPageSize));

  const displayedAssets = assetRows.slice((assetPage - 1) * assetPageSize, assetPage * assetPageSize);
  const assetPageCount = Math.max(1, Math.ceil(assetRows.length / assetPageSize));

  const displayedVendors = vendorRows.slice((vendorPage - 1) * vendorPageSize, vendorPage * vendorPageSize);
  const vendorPageCount = Math.max(1, Math.ceil(vendorRows.length / vendorPageSize));

  const displayedPurchases = purchaseRows.slice((purchasePage - 1) * purchasePageSize, purchasePage * purchasePageSize);
  const purchasePageCount = Math.max(1, Math.ceil(purchaseRows.length / purchasePageSize));

  const displayedStock = stockRows.slice((stockPage - 1) * stockPageSize, stockPage * stockPageSize);
  const stockPageCount = Math.max(1, Math.ceil(stockRows.length / stockPageSize));

  const displayedAssignments = assignmentRows.slice((assignmentPage - 1) * assignmentPageSize, assignmentPage * assignmentPageSize);
  const assignmentPageCount = Math.max(1, Math.ceil(assignmentRows.length / assignmentPageSize));

  const transferRows = useMemo(() => {
    const searchTerm = transferSearch.toLowerCase();
    return stockMovements.filter((movement) => {
      const matchesSearch = [movement.movementId, movement.assetId, movement.type, movement.source, movement.destination, movement.notes]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = transferFilter === 'All' || movement.type === transferFilter;
      return matchesSearch && matchesFilter;
    });
  }, [stockMovements, transferSearch, transferFilter]);

  const getWarrantyStatus = (asset) => {
    if (!asset.warranty || !asset.warrantyEnd) return 'Untracked';
    const now = new Date();
    const end = new Date(asset.warrantyEnd);
    if (end < now) return 'Expired';
    const threshold = new Date(now);
    threshold.setMonth(now.getMonth() + 1);
    return end <= threshold ? 'Expiring Soon' : 'Active';
  };

  const warrantyRows = useMemo(() => {
    const searchTerm = warrantySearch.toLowerCase();
    return assets
      .map((asset) => ({ ...asset, warrantyStatus: getWarrantyStatus(asset) }))
      .filter((asset) => {
        const matchesSearch = [asset.assetId, asset.name, asset.vendor, asset.category, asset.warranty, asset.warrantyStatus]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(searchTerm));
        const matchesFilter = warrantyFilter === 'All' || asset.warrantyStatus === warrantyFilter;
        return matchesSearch && matchesFilter;
      });
  }, [assets, warrantySearch, warrantyFilter]);

  const getInsuranceStatus = (asset) => {
    if (!asset.insuranceCompany || !asset.insuranceExpiryDate) return 'Untracked';
    const now = new Date();
    const expiry = new Date(asset.insuranceExpiryDate);
    if (expiry < now) return 'Expired';
    const threshold = new Date(now);
    threshold.setMonth(now.getMonth() + 1);
    return expiry <= threshold ? 'Renewal Pending' : 'Active';
  };

  const insuranceRows = useMemo(() => {
    const searchTerm = insuranceSearch.toLowerCase();
    return assets
      .map((asset) => ({ ...asset, insuranceStatus: getInsuranceStatus(asset) }))
      .filter((asset) => {
        const matchesSearch = [asset.assetId, asset.name, asset.insuranceCompany, asset.insurancePolicyNumber, asset.category, asset.insuranceStatus]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(searchTerm));
        const matchesFilter = insuranceFilter === 'All' || asset.insuranceStatus === insuranceFilter;
        return matchesSearch && matchesFilter;
      });
  }, [assets, insuranceSearch, insuranceFilter]);

  const expiringWarranties = useMemo(() => assets.filter((asset) => getWarrantyStatus(asset) === 'Expiring Soon').length, [assets]);
  const _expiredWarranties = useMemo(() => assets.filter((asset) => getWarrantyStatus(asset) === 'Expired').length, [assets]);
  const insuranceRenewalPending = useMemo(() => assets.filter((asset) => getInsuranceStatus(asset) === 'Renewal Pending').length, [assets]);
  const _insuranceExpiredCount = useMemo(() => assets.filter((asset) => getInsuranceStatus(asset) === 'Expired').length, [assets]);

  const displayedMaintenance = maintenanceRows.slice((maintenancePage - 1) * maintenancePageSize, maintenancePage * maintenancePageSize);
  const maintenancePageCount = Math.max(1, Math.ceil(maintenanceRows.length / maintenancePageSize));

  const transferPageSize = 7;
  const warrantyPageSize = 7;
  const insurancePageSize = 7;

  const displayedTransfers = transferRows.slice((transferPage - 1) * transferPageSize, transferPage * transferPageSize);
  const transferPageCount = Math.max(1, Math.ceil(transferRows.length / transferPageSize));

  const displayedWarranty = warrantyRows.slice((warrantyPage - 1) * warrantyPageSize, warrantyPage * warrantyPageSize);
  const warrantyPageCount = Math.max(1, Math.ceil(warrantyRows.length / warrantyPageSize));

  const displayedInsurance = insuranceRows.slice((insurancePage - 1) * insurancePageSize, insurancePage * insurancePageSize);
  const insurancePageCount = Math.max(1, Math.ceil(insuranceRows.length / insurancePageSize));

  const uploadFile = async (resource, formData) => {
    if (!formData) return null;
    const response = await uploadService.upload(resource, formData);
    return response?.url || response?.path || response?.file || '';
  };

  const resetCategoryForm = () => {
    resetCategory(defaultCategoryValues);
    setSelectedCategory(null);
    setIsEditCategory(false);
  };

  const openNewCategoryModal = () => {
    resetCategoryForm();
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category) => {
    setSelectedCategory(category);
    setIsEditCategory(true);
    resetCategory({
      ...defaultCategoryValues,
      ...category,
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = (data) => {
    const payload = { ...data };
    if (isEditCategory && selectedCategory) {
      updateCategory.mutate({ id: selectedCategory.id, payload }, {
        onSuccess: resetCategoryForm,
      });
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          resetCategoryForm();
          setCategoryPage(1);
        },
      });
    }
  };

  const handleDeleteCategory = (category) => {
    if (!window.confirm(`Delete category ${category.name}?`)) return;
    deleteCategory.mutate(category.id);
  };

  const resetAssetForm = () => {
    resetAsset(defaultAssetValues);
    setSelectedAsset(null);
    setIsEditAsset(false);
  };

  const openNewAssetModal = () => {
    resetAssetForm();
    setIsAssetModalOpen(true);
  };

  const openEditAssetModal = (asset) => {
    setSelectedAsset(asset);
    setIsEditAsset(true);
    resetAsset({
      ...defaultAssetValues,
      ...asset,
      assetPhoto: null,
      documents: null,
    });
    setIsAssetModalOpen(true);
  };

  const handleAssetSubmit = async (data) => {
    const payload = {
      assetId: data.assetId || `AS-${Date.now().toString().slice(-6)}`,
      assetTag: data.assetTag,
      qrCode: data.qrCode,
      barcode: data.barcode,
      name: data.name,
      category: data.category,
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      installationDate: data.installationDate,
      purchasePrice: data.purchasePrice,
      vendor: data.vendor,
      vendorContact: data.vendorContact,
      warranty: data.warranty,
      warrantyStart: data.warrantyStart,
      warrantyEnd: data.warrantyEnd,
      insuranceCompany: data.insuranceCompany,
      insurancePolicyNumber: data.insurancePolicyNumber,
      insuranceStartDate: data.insuranceStartDate,
      insuranceExpiryDate: data.insuranceExpiryDate,
      insuranceClaimStatus: data.insuranceClaimStatus,
      insurancePremium: data.insurancePremium,
      renewalReminder: data.renewalReminder,
      depreciationEstimate: data.depreciationEstimate,
      amcDetails: data.amcDetails,
      notes: data.notes,
      currentLocation: data.currentLocation,
      assignedTo: data.assignedTo,
      status: data.status,
      quantity: Number(data.quantity || 1),
    };

    if (data.assetPhoto?.[0]) {
      payload.assetPhoto = await uploadFile('assets', data.assetPhoto[0]);
    }
    if (data.documents?.[0]) {
      payload.documents = await uploadFile('assets', data.documents[0]);
    }

    if (isEditAsset && selectedAsset) {
      updateAsset.mutate({ id: selectedAsset.id, payload }, {
        onSuccess: resetAssetForm,
      });
    } else {
      createAsset.mutate(payload, {
        onSuccess: () => {
          resetAssetForm();
          setAssetPage(1);
        },
      });
    }
  };

  const handleDeleteAsset = (asset) => {
    if (!window.confirm(`Delete asset ${asset.name}?`)) return;
    deleteAsset.mutate(asset.id);
  };

  const resetVendorForm = () => {
    resetVendor(defaultVendorValues);
    setSelectedVendor(null);
    setIsEditVendor(false);
  };

  const openNewVendorModal = () => {
    resetVendorForm();
    setIsVendorModalOpen(true);
  };

  const openEditVendorModal = (vendor) => {
    setSelectedVendor(vendor);
    setIsEditVendor(true);
    resetVendor({
      ...defaultVendorValues,
      ...vendor,
    });
    setIsVendorModalOpen(true);
  };

  const handleVendorSubmit = (data) => {
    const payload = { ...data };
    if (isEditVendor && selectedVendor) {
      updateVendor.mutate({ id: selectedVendor.id, payload }, {
        onSuccess: resetVendorForm,
      });
    } else {
      createVendor.mutate(payload, {
        onSuccess: () => {
          resetVendorForm();
          setVendorPage(1);
        },
      });
    }
  };

  const handleDeleteVendor = (vendor) => {
    if (!window.confirm(`Delete vendor ${vendor.name}?`)) return;
    deleteVendor.mutate(vendor.id);
  };

  const resetPurchaseForm = () => {
    resetPurchase(defaultPurchaseValues);
    setSelectedPurchase(null);
    setIsEditPurchase(false);
  };

  const openNewPurchaseModal = () => {
    resetPurchaseForm();
    setIsPurchaseModalOpen(true);
  };

  const openEditPurchaseModal = (purchase) => {
    setSelectedPurchase(purchase);
    setIsEditPurchase(true);
    resetPurchase({
      ...defaultPurchaseValues,
      ...purchase,
      attachments: null,
    });
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSubmit = async (data) => {
    const payload = {
      purchaseOrderId: data.purchaseOrderId || `PO-${Date.now().toString().slice(-6)}`,
      supplier: data.supplier,
      invoiceNumber: data.invoiceNumber,
      purchaseDate: data.purchaseDate,
      tax: data.tax,
      discount: data.discount,
      grandTotal: data.grandTotal,
    };

    if (data.attachments?.[0]) {
      payload.attachments = await uploadFile('purchaseOrders', data.attachments[0]);
    }

    if (isEditPurchase && selectedPurchase) {
      updatePurchase.mutate({ id: selectedPurchase.id, payload }, {
        onSuccess: resetPurchaseForm,
      });
    } else {
      createPurchase.mutate(payload, {
        onSuccess: () => {
          resetPurchaseForm();
          setPurchasePage(1);
        },
      });
    }
  };

  const handleDeletePurchase = (purchase) => {
    if (!window.confirm(`Delete purchase ${purchase.purchaseOrderId}?`)) return;
    deletePurchase.mutate(purchase.id);
  };

  const resetStockForm = () => {
    resetStock(defaultStockValues);
    setSelectedStock(null);
    setIsEditStock(false);
  };

  const openNewStockModal = () => {
    resetStockForm();
    setIsStockModalOpen(true);
  };

  const openEditStockModal = (stock) => {
    setSelectedStock(stock);
    setIsEditStock(true);
    resetStock({
      ...defaultStockValues,
      ...stock,
    });
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = (data) => {
    const payload = {
      movementId: data.movementId || `SM-${Date.now().toString().slice(-6)}`,
      assetId: data.assetId,
      type: data.type,
      quantity: Number(data.quantity || 1),
      source: data.source,
      destination: data.destination,
      notes: data.notes,
    };

    if (isEditStock && selectedStock) {
      updateStock.mutate({ id: selectedStock.id, payload }, {
        onSuccess: resetStockForm,
      });
    } else {
      createStock.mutate(payload, {
        onSuccess: () => {
          resetStockForm();
          setStockPage(1);
        },
      });
    }
  };

  const handleDeleteStock = (stock) => {
    if (!window.confirm(`Delete stock movement ${stock.movementId}?`)) return;
    deleteStock.mutate(stock.id);
  };

  const resetAssignmentForm = () => {
    resetAssignment(defaultAssignmentValues);
    setSelectedAssignment(null);
    setIsEditAssignment(false);
  };

  const openNewAssignmentModal = () => {
    resetAssignmentForm();
    setIsAssignmentModalOpen(true);
  };

  const openEditAssignmentModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsEditAssignment(true);
    resetAssignment({
      ...defaultAssignmentValues,
      ...assignment,
    });
    setIsAssignmentModalOpen(true);
  };

  const handleAssignmentSubmit = (data) => {
    const payload = {
      assignmentId: data.assignmentId || `ASG-${Date.now().toString().slice(-6)}`,
      assetId: data.assetId,
      assignedTo: data.assignedTo,
      assignedType: data.assignedType,
      department: data.department,
      location: data.location,
      assignedDate: data.assignedDate,
      returnDate: data.returnDate,
      status: data.status,
      notes: data.notes,
    };

    if (isEditAssignment && selectedAssignment) {
      updateAssignment.mutate({ id: selectedAssignment.id, payload }, {
        onSuccess: resetAssignmentForm,
      });
    } else {
      createAssignment.mutate(payload, {
        onSuccess: () => {
          resetAssignmentForm();
          setAssignmentPage(1);
        },
      });
    }
  };

  const handleDeleteAssignment = (assignment) => {
    if (!window.confirm(`Delete assignment ${assignment.assignmentId}?`)) return;
    deleteAssignment.mutate(assignment.id);
  };

  const resetMaintenanceForm = () => {
    resetMaintenance(defaultMaintenanceValues);
    setSelectedMaintenance(null);
    setIsEditMaintenance(false);
  };

  const openNewMaintenanceModal = () => {
    resetMaintenanceForm();
    setIsMaintenanceModalOpen(true);
  };

  const openEditMaintenanceModal = (request) => {
    setSelectedMaintenance(request);
    setIsEditMaintenance(true);
    resetMaintenance({
      ...defaultMaintenanceValues,
      ...request,
      attachments: null,
    });
    setIsMaintenanceModalOpen(true);
  };

  const handleMaintenanceSubmit = async (data) => {
    const payload = {
      requestId: data.requestId || `MR-${Date.now().toString().slice(-6)}`,
      assetId: data.assetId,
      issue: data.issue,
      vendor: data.vendor,
      scheduleDate: data.scheduleDate,
      repairCost: data.repairCost,
      warrantyClaim: data.warrantyClaim,
      amcDetails: data.amcDetails,
      status: data.status,
      serviceHistory: data.serviceHistory,
    };

    if (data.attachments?.[0]) {
      payload.attachments = await uploadFile('maintenanceRequests', data.attachments[0]);
    }

    if (isEditMaintenance && selectedMaintenance) {
      updateMaintenance.mutate({ id: selectedMaintenance.id, payload }, {
        onSuccess: resetMaintenanceForm,
      });
    } else {
      createMaintenance.mutate(payload, {
        onSuccess: () => {
          resetMaintenanceForm();
          setMaintenancePage(1);
        },
      });
    }
  };

  const handleDeleteMaintenance = (request) => {
    if (!window.confirm(`Delete maintenance request ${request.requestId}?`)) return;
    deleteMaintenance.mutate(request.id);
  };

  const handleExport = async (exporter, filename) => {
    try {
      const blob = await exporter.mutateAsync();
      downloadBlob(blob, filename);
    } catch (error) {
      console.error(error);
    }
  };

  const _lowStockAssets = assets.filter((asset) => Number(asset.quantity || 1) <= 5).slice(0, 4);
  const recentActivity = maintenanceRequests.slice(-6).reverse();

  return (
    <div className="space-y-8">
      <div className="rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-600">Inventory & Asset Management</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Asset Operations Command Center</h1>
            <p className="max-w-2xl text-slate-500">Track asset lifecycle, vendor relationships, purchase planning, stock movements, assignments, and maintenance from a single enterprise console.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('assets')}
              className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <Box className="h-4 w-4" /> Manage assets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('purchases')}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ShoppingCart className="h-4 w-4" /> Purchase orders
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <MetricCard label="Total Assets" value={totalAssets.toString()} icon={Database} delta="+9%" />
        <MetricCard label="Available Assets" value={availableAssets.toString()} icon={CheckSquare} delta="+6%" />
        <MetricCard label="Assigned Assets" value={assignedAssets.toString()} icon={Users} delta="+4%" />
        <MetricCard label="Damaged Assets" value={damagedAssets.toString()} icon={AlertTriangle} delta="-2%" />
        <MetricCard label="Under Maintenance" value={underMaintenance.toString()} icon={ShieldCheck} delta="+5%" />
        <MetricCard label="Low Stock Items" value={lowStockItems.toString()} icon={Truck} delta="+3%" />
        <MetricCard label="Warranty expiring soon" value={expiringWarranties.toString()} icon={CalendarCheck} delta="+2%" />
        <MetricCard label="Insurance renewals" value={insuranceRenewalPending.toString()} icon={ShieldCheck} delta="+5%" />
        <MetricCard label="Total Vendors" value={totalVendors.toString()} icon={Users} delta="+8%" />
        <MetricCard label="Purchase Orders" value={purchaseOrdersCount.toString()} icon={ShoppingCart} delta="+11%" />
        <MetricCard label="Pending Requests" value={pendingRequests.toString()} icon={ClipboardList} delta="+7%" />
        <MetricCard label="Asset Value" value={`₹${assetValue.toLocaleString()}`} icon={Tag} delta="+12%" />
        <MetricCard label="Procurement Value" value={`₹${procurementValue.toLocaleString()}`} icon={ShoppingCart} delta="+10%" />
        <MetricCard label="Health" value={procurementHealthStatus} icon={ShieldCheck} delta="Stable" />
      </div>

      <div className="rounded-[32px] border border-slate-200/70 bg-white/95 p-4 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
          <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Inventory overview</h2>
                <p className="text-sm text-slate-500">Operational insights for asset lifecycle, procurement and maintenance.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <CalendarCheck className="h-4 w-4 text-emerald-600" /> Live summary
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <PanelCard title="Category distribution" items={categories.slice(0, 4).map((category) => `${category.name} • ${category.exampleItems || 'Example assets'}`)} />
              <PanelCard title="Recent vendor partners" items={vendors.slice(0, 4).map((vendor) => `${vendor.name} • ${vendor.contactPerson || vendor.phone}`)} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Procurement trend</h3>
                    <p className="text-sm text-slate-500">Last 6 months of purchase order spending.</p>
                  </div>
                </div>
                <div className="mt-6 h-[280px]">
                  <Line
                    data={{
                      labels: purchaseTrend.labels,
                      datasets: [
                        {
                          label: 'Procurement value',
                          data: purchaseTrend.values,
                          borderColor: '#16a34a',
                          backgroundColor: 'rgba(16, 163, 74, 0.18)',
                          tension: 0.35,
                          fill: true,
                          pointRadius: 3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: '#64748b' } },
                        y: { grid: { color: 'rgba(148, 163, 184, 0.16)' }, ticks: { color: '#64748b' } },
                      },
                    }}
                  />
                </div>
              </section>
              <section className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Asset status split</h3>
                    <p className="text-sm text-slate-500">Real-time status breakdown for all tracked assets.</p>
                  </div>
                </div>
                <div className="mt-6 flex h-[280px] items-center justify-center">
                  <Doughnut
                    data={{
                      labels: assetStatusDistribution.labels,
                      datasets: [
                        {
                          data: assetStatusDistribution.counts,
                          backgroundColor: ['#10b981', '#0ea5e9', '#f97316', '#facc15', '#94a3b8'],
                          borderColor: '#ffffff',
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { color: '#475569' } },
                        title: { display: false },
                      },
                    }}
                  />
                </div>
              </section>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-[32px] border border-slate-200/70 bg-slate-50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-950">Asset health</h3>
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Low stock alerts</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-700">{lowStockItems}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Pending maintenance</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-700">{maintenanceRequests.filter((request) => request.status !== 'Completed').length}</p>
                  </div>
                </div>
              </section>
              <section className="rounded-[32px] border border-slate-200/70 bg-slate-50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-950">Recent activity timeline</h3>
                <div className="mt-4 space-y-3">
                  {recentActivity.length ? (
                    recentActivity.map((item) => (
                      <div key={item.id || item.activityId} className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-700">{item.message || item.activity}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{item.createdAt || item.date || 'Unknown'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl bg-white p-4 shadow-sm text-slate-500">No recent activity yet.</div>
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'categories' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Asset Categories"
            subtitle="Configure inventory categories and track example asset groups."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewCategoryModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New category
                </button>
                <button onClick={() => handleExport(exportCategories, 'asset-categories.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter search={categorySearch} onSearch={setCategorySearch} filter="All" onFilter={() => {}} options={defaultFilterOptions} />
          <DataTable
            columns={['Category', 'Description', 'Example items', 'Actions']}
            rows={displayedCategories.map((category) => [
              <div key={`${category.id}-name`} className="font-semibold text-slate-950">{category.name}</div>,
              category.description || '—',
              category.exampleItems || '—',
              <div key={`${category.id}-actions`} className="flex items-center gap-2">
                <button onClick={() => openEditCategoryModal(category)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteCategory(category)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
              </div>,
            ])}
          />
          <TablePagination page={categoryPage} pageCount={categoryPageCount} onPageChange={setCategoryPage} />
        </section>
      )}

      {activeTab === 'assets' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Asset Management"
            subtitle="Capture asset lifecycle details and attach photos or documents."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewAssetModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New asset
                </button>
                <button onClick={() => handleExport(exportAssets, 'assets.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
                <button onClick={() => printHtmlContent('Asset Inventory', `<div>${displayedAssets.map((asset) => `<div><strong>${asset.name}</strong> • ${asset.category} • ${asset.status}</div>`).join('')}</div>`) } className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Printer className="h-4 w-4" /> Print
                </button>
              </div>
            )}
          />
          <SearchFilter search={assetSearch} onSearch={setAssetSearch} filter={assetFilter} onFilter={setAssetFilter} options={statusOptions} />
          <DataTable
            columns={['Asset', 'Category', 'Location', 'Status', 'Value', 'Actions']}
            rows={displayedAssets.map((asset) => [
              <div key={`${asset.id}-name`} className="font-semibold text-slate-950">{asset.name}<div className="text-sm text-slate-500">{asset.assetId}</div></div>,
              asset.category,
              asset.currentLocation || asset.department || '—',
              <StatusBadge key={`${asset.id}-status`} status={asset.status} />,
              `₹${Number(asset.purchasePrice || 0).toLocaleString()}`,
              <div key={`${asset.id}-actions`} className="flex items-center gap-2">
                <button onClick={() => openEditAssetModal(asset)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteAsset(asset)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
              </div>,
            ])}
          />
          <TablePagination page={assetPage} pageCount={assetPageCount} onPageChange={setAssetPage} />
        </section>
      )}

      {activeTab === 'vendors' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Vendor Management"
            subtitle="Manage vendor details, GST, and supplier banking information."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewVendorModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New vendor
                </button>
                <button onClick={() => handleExport(exportVendors, 'vendors.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter search={vendorSearch} onSearch={setVendorSearch} filter="All" onFilter={() => {}} options={defaultFilterOptions} />
          <DataTable
            columns={['Vendor', 'GST', 'Email', 'Phone', 'Contact', 'Actions']}
            rows={displayedVendors.map((vendor) => [
              <div key={`${vendor.id}-name`} className="font-semibold text-slate-950">{vendor.name}</div>,
              vendor.gst || '—',
              vendor.email || '—',
              vendor.phone || '—',
              vendor.contactPerson || '—',
              <div key={`${vendor.id}-actions`} className="flex items-center gap-2">
                <button onClick={() => openEditVendorModal(vendor)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteVendor(vendor)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
              </div>,
            ])}
          />
          <TablePagination page={vendorPage} pageCount={vendorPageCount} onPageChange={setVendorPage} />
        </section>
      )}

      {activeTab === 'purchases' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Purchase Management"
            subtitle="Track purchase orders, invoices, and procurement value."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewPurchaseModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New purchase
                </button>
                <button onClick={() => handleExport(exportPurchases, 'purchase-orders.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter search={purchaseSearch} onSearch={setPurchaseSearch} filter="All" onFilter={() => {}} options={defaultFilterOptions} />
          <DataTable
            columns={['PO', 'Vendor', 'Invoice', 'Date', 'Total', 'Actions']}
            rows={displayedPurchases.map((purchase) => [
              purchase.purchaseOrderId || '—',
              purchase.supplier || '—',
              purchase.invoiceNumber || '—',
              purchase.purchaseDate || '—',
              `₹${Number(purchase.grandTotal || 0).toLocaleString()}`,
              <div key={`${purchase.id}-actions`} className="flex items-center gap-2">
                <button onClick={() => openEditPurchaseModal(purchase)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDeletePurchase(purchase)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
              </div>,
            ])}
          />
          <TablePagination page={purchasePage} pageCount={purchasePageCount} onPageChange={setPurchasePage} />
        </section>
      )}

      {activeTab === 'stock' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Stock Management"
            subtitle="Manage stock movements, transfer history, returns, and adjustments."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewStockModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New stock move
                </button>
                <button onClick={() => handleExport(exportStock, 'stock-movements.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter search={stockSearch} onSearch={setStockSearch} filter={stockFilter} onFilter={setStockFilter} options={stockTypeOptions} />
          <DataTable
            columns={['Movement', 'Asset', 'Type', 'Qty', 'Source', 'Destination', 'Actions']}
            rows={displayedStock.map((movement) => [
              movement.movementId || '—',
              movement.assetId || '—',
              movement.type || '—',
              movement.quantity?.toString() || '—',
              movement.source || '—',
              movement.destination || '—',
              <div key={`${movement.id}-actions`} className="flex items-center gap-2">
                <button onClick={() => openEditStockModal(movement)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteStock(movement)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
              </div>,
            ])}
          />
          <TablePagination page={stockPage} pageCount={stockPageCount} onPageChange={setStockPage} />
        </section>
      )}

      {activeTab === 'assignments' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Asset Assignment"
            subtitle="Track assignments for teachers, employees, labs, library and hostel."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewAssignmentModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> Assign asset
                </button>
                <button onClick={() => handleExport(exportAssignments, 'asset-assignments.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter search={assignmentSearch} onSearch={setAssignmentSearch} filter={assignmentFilter} onFilter={setAssignmentFilter} options={assignmentStatusOptions} />
          <DataTable
            columns={['Assignment', 'Asset', 'Assigned to', 'Type', 'Department', 'Status', 'Actions']}
            rows={displayedAssignments.map((item) => [
              item.assignmentId || '—',
              item.assetId || '—',
              item.assignedTo || '—',
              item.assignedType || '—',
              item.department || item.location || '—',
              <StatusBadge key={`${item.id}-status`} status={item.status || 'Pending'} />,
              <div key={`${item.id}-actions`} className="flex items-center gap-2">
                <button onClick={() => openEditAssignmentModal(item)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteAssignment(item)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
              </div>,
            ])}
          />
          <TablePagination page={assignmentPage} pageCount={assignmentPageCount} onPageChange={setAssignmentPage} />
        </section>
      )}

      {activeTab === 'maintenance' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Maintenance Management"
            subtitle="Log service requests, repair details, AMC coverage and warranty claims."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewMaintenanceModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New request
                </button>
                <button onClick={() => handleExport(exportMaintenance, 'maintenance-requests.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter search={maintenanceSearch} onSearch={setMaintenanceSearch} filter={maintenanceFilter} onFilter={setMaintenanceFilter} options={maintenanceStatusOptions} />
          <DataTable
            columns={['Request', 'Asset', 'Issue', 'Vendor', 'Status', 'Cost', 'Actions']}
            rows={displayedMaintenance.map((request) => [
              request.requestId || '—',
              request.assetId || '—',
              request.issue || '—',
              request.vendor || '—',
              <StatusBadge key={`${request.id}-status`} status={request.status || 'Requested'} />,
              `₹${Number(request.repairCost || 0).toLocaleString()}`,
              <div key={`${request.id}-actions`} className="flex items-center gap-2">
                <button onClick={() => openEditMaintenanceModal(request)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteMaintenance(request)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
              </div>,
            ])}
          />
          <TablePagination page={maintenancePage} pageCount={maintenancePageCount} onPageChange={setMaintenancePage} />
        </section>
      )}

      {activeTab === 'transfers' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Transfer History"
            subtitle="Review stock transfers, asset movement, returns and inventory adjustments."
            action={(
              <button onClick={() => handleExport(exportStock, 'transfer-history.xlsx')} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                <Download className="h-4 w-4" /> Export transfers
              </button>
            )}
          />
          <SearchFilter search={transferSearch} onSearch={setTransferSearch} filter={transferFilter} onFilter={setTransferFilter} options={transferStatusOptions} />
          <DataTable
            columns={['Movement', 'Asset', 'Type', 'Qty', 'Source', 'Destination', 'Notes']}
            rows={displayedTransfers.map((movement) => [
              movement.movementId || '—',
              movement.assetId || '—',
              movement.type || '—',
              movement.quantity?.toString() || '—',
              movement.source || '—',
              movement.destination || '—',
              movement.notes || '—',
            ])}
          />
          <TablePagination page={transferPage} pageCount={transferPageCount} onPageChange={setTransferPage} />
        </section>
      )}

      {activeTab === 'warranty' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Warranty Tracker"
            subtitle="Track warranty coverage across assets and flag upcoming expirations."
            action={(
              <ExportButton
                onExcel={() => handleExport(exportAssets, 'warranty-inventory.xlsx')}
                onPdf={() => handleExport(exportAssets, 'warranty-inventory.pdf')}
                onPrint={() => printHtmlContent('Warranty Inventory', `<div>${displayedWarranty.map((asset) => `<div><strong>${asset.name}</strong> • ${asset.warrantyStatus}</div>`).join('')}</div>`) }
              />
            )}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <SearchFilter search={warrantySearch} onSearch={setWarrantySearch} filter={warrantyFilter} onFilter={setWarrantyFilter} options={warrantyStatusOptions} />
            <AdvancedFilter label="Warranty range" value={warrantyFilter} onChange={setWarrantyFilter} options={warrantyStatusOptions} />
          </div>
          <DataTable
            columns={['Asset', 'Category', 'Warranty', 'Expiry', 'Status', 'Vendor']}
            rows={displayedWarranty.map((asset) => [
              <div key={`${asset.id}-name`} className="font-semibold text-slate-950">{asset.name}<div className="text-sm text-slate-500">{asset.assetId}</div></div>,
              asset.category || '—',
              asset.warranty || '—',
              asset.warrantyEnd || '—',
              <StatusBadge key={`${asset.id}-status`} status={asset.warrantyStatus} />,
              asset.vendor || '—',
            ])}
          />
          <TablePagination page={warrantyPage} pageCount={warrantyPageCount} onPageChange={setWarrantyPage} />
        </section>
      )}

      {activeTab === 'insurance' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Insurance Tracker"
            subtitle="Monitor insurance coverage and renewal status for insured assets."
            action={(
              <ExportButton
                onExcel={() => handleExport(exportAssets, 'insurance-inventory.xlsx')}
                onPdf={() => handleExport(exportAssets, 'insurance-inventory.pdf')}
                onPrint={() => printHtmlContent('Insurance Inventory', `<div>${displayedInsurance.map((asset) => `<div><strong>${asset.name}</strong> • ${asset.insuranceStatus}</div>`).join('')}</div>`) }
              />
            )}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <SearchFilter search={insuranceSearch} onSearch={setInsuranceSearch} filter={insuranceFilter} onFilter={setInsuranceFilter} options={insuranceStatusOptions} />
            <AdvancedFilter label="Insurance range" value={insuranceFilter} onChange={setInsuranceFilter} options={insuranceStatusOptions} />
          </div>
          <DataTable
            columns={['Asset', 'Category', 'Insurance', 'Expiry', 'Status', 'Premium']}
            rows={displayedInsurance.map((asset) => [
              <div key={`${asset.id}-name`} className="font-semibold text-slate-950">{asset.name}<div className="text-sm text-slate-500">{asset.assetId}</div></div>,
              asset.category || '—',
              asset.insuranceCompany || '—',
              asset.insuranceExpiryDate || '—',
              <StatusBadge key={`${asset.id}-status`} status={asset.insuranceStatus} />,
              `₹${Number(asset.insurancePremium || 0).toLocaleString()}`,
            ])}
          />
          <TablePagination page={insurancePage} pageCount={insurancePageCount} onPageChange={setInsurancePage} />
        </section>
      )}

      {activeTab === 'reports' && (
        <section className="space-y-6 rounded-[18px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
          <SectionHeader
            title="Reports & Export"
            subtitle="Generate asset, vendor, procurement, maintenance and department reports."
            action={(
              <ExportButton
                onExcel={() => handleExport(exportAssets, 'inventory-dashboard.xlsx')}
                onPdf={() => handleExport(exportAssets, 'inventory-dashboard.pdf')}
                onPrint={() => printHtmlContent('Inventory Dashboard', `<div><strong>Assets</strong>: ${totalAssets}</div><div><strong>Vendors</strong>: ${totalVendors}</div></div>`) }
              />
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button onClick={() => handleExport(exportAssets, 'asset-report.xlsx')} className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-left shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Asset Report</p>
              <p className="mt-4 text-xl font-semibold text-slate-950">Export asset inventory</p>
            </button>
            <button onClick={() => handleExport(exportVendors, 'vendor-report.xlsx')} className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-left shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Vendor Report</p>
              <p className="mt-4 text-xl font-semibold text-slate-950">Export supplier list</p>
            </button>
            <button onClick={() => handleExport(exportPurchases, 'purchase-report.xlsx')} className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-left shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Purchase Report</p>
              <p className="mt-4 text-xl font-semibold text-slate-950">Export procurement history</p>
            </button>
            <button onClick={() => handleExport(exportMaintenance, 'maintenance-report.xlsx')} className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-left shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Maintenance Report</p>
              <p className="mt-4 text-xl font-semibold text-slate-950">Export service requests</p>
            </button>
            <button onClick={() => printHtmlContent('Department-wise Asset Report', `<div>${categories.map((category) => `<div><strong>${category.name}</strong></div>`).join('')}</div>`) } className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-left shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Department Report</p>
              <p className="mt-4 text-xl font-semibold text-slate-950">Print department assets</p>
            </button>
          </div>
        </section>
      )}

      <Modal
        title={isEditCategory ? 'Edit asset category' : 'Create asset category'}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitCategory(handleCategorySubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditCategory ? 'Save category' : 'Create category'}
          </button>
        )}
      >
        <div className="grid gap-6">
          <FormField label="Category name">
            <input type="text" {...registerCategory('name', { required: true })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            {categoryErrors.name && <p className="text-sm text-rose-600">Name is required.</p>}
          </FormField>
          <FormField label="Description">
            <textarea {...registerCategory('description')} rows="4" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Example items">
            <input type="text" {...registerCategory('exampleItems')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditAsset ? 'Edit asset' : 'Register asset'}
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitAsset(handleAssetSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditAsset ? 'Update asset' : 'Create asset'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Asset ID">
            <input type="text" {...registerAsset('assetId')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Auto-generated if blank" />
          </FormField>
          <FormField label="Asset name">
            <input type="text" {...registerAsset('name', { required: true })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            {assetErrors.name && <p className="text-sm text-rose-600">Name is required.</p>}
          </FormField>
          <FormField label="Category">
            <select {...registerAsset('category', { required: true })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option value="">Select category</option>
              {categories.map((category) => (<option key={category.id} value={category.name}>{category.name}</option>))}
            </select>
            {assetErrors.category && <p className="text-sm text-rose-600">Category is required.</p>}
          </FormField>
          <FormField label="Brand">
            <input type="text" {...registerAsset('brand')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Model">
            <input type="text" {...registerAsset('model')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Serial number">
            <input type="text" {...registerAsset('serialNumber')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Purchase date">
            <input type="date" {...registerAsset('purchaseDate')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Purchase price">
            <input type="number" {...registerAsset('purchasePrice')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Vendor">
            <select {...registerAsset('vendor')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (<option key={vendor.id} value={vendor.name}>{vendor.name}</option>))}
            </select>
          </FormField>
          <FormField label="Warranty">
            <input type="text" {...registerAsset('warranty')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Department">
            <input type="text" {...registerAsset('department')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Current location">
            <input type="text" {...registerAsset('currentLocation')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Assigned to">
            <input type="text" {...registerAsset('assignedTo')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Status">
            <select {...registerAsset('status')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Quantity">
            <input type="number" {...registerAsset('quantity')} min="1" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Asset photo">
            <input type="file" accept="image/*" {...registerAsset('assetPhoto')} ref={(e) => { registerAsset('assetPhoto').ref(e); assetPhotoRef.current = e; }} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none" />
          </FormField>
          <FormField label="Documents">
            <input type="file" accept="image/*,.pdf" {...registerAsset('documents')} ref={(e) => { registerAsset('documents').ref(e); documentRef.current = e; }} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none" />
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditVendor ? 'Edit vendor' : 'Create vendor'}
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitVendor(handleVendorSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditVendor ? 'Save vendor' : 'Create vendor'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Vendor name">
            <input type="text" {...registerVendor('name', { required: true })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            {vendorErrors.name && <p className="text-sm text-rose-600">Name is required.</p>}
          </FormField>
          <FormField label="GST">
            <input type="text" {...registerVendor('gst')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Email">
            <input type="email" {...registerVendor('email')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Phone">
            <input type="tel" {...registerVendor('phone')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Address">
            <textarea {...registerVendor('address')} rows="4" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Contact person">
            <input type="text" {...registerVendor('contactPerson')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Bank details">
            <textarea {...registerVendor('bankDetails')} rows="4" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditPurchase ? 'Edit purchase order' : 'Create purchase order'}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitPurchase(handlePurchaseSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditPurchase ? 'Save purchase' : 'Create purchase'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Purchase order ID">
            <input type="text" {...registerPurchase('purchaseOrderId')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Auto-generated if blank" />
          </FormField>
          <FormField label="Supplier">
            <select {...registerPurchase('supplier')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (<option key={vendor.id} value={vendor.name}>{vendor.name}</option>))}
            </select>
          </FormField>
          <FormField label="Invoice number">
            <input type="text" {...registerPurchase('invoiceNumber')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Purchase date">
            <input type="date" {...registerPurchase('purchaseDate')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Tax">
            <input type="number" {...registerPurchase('tax')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Discount">
            <input type="number" {...registerPurchase('discount')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Grand total">
            <input type="number" {...registerPurchase('grandTotal')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Attachments">
            <input type="file" accept="image/*,.pdf" {...registerPurchase('attachments')} ref={(e) => { registerPurchase('attachments').ref(e); purchaseAttachmentRef.current = e; }} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none" />
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditStock ? 'Edit stock movement' : 'Create stock movement'}
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitStock(handleStockSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditStock ? 'Save movement' : 'Create movement'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Movement ID">
            <input type="text" {...registerStock('movementId')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Auto-generated if blank" />
          </FormField>
          <FormField label="Asset ID">
            <select {...registerStock('assetId')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option value="">Select asset</option>
              {assets.map((asset) => (<option key={asset.id} value={asset.assetId}>{asset.name}</option>))}
            </select>
          </FormField>
          <FormField label="Movement type">
            <select {...registerStock('type')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option>Stock In</option>
              <option>Stock Out</option>
              <option>Transfer</option>
              <option>Return</option>
              <option>Adjustment</option>
            </select>
          </FormField>
          <FormField label="Quantity">
            <input type="number" {...registerStock('quantity')} min="1" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Source">
            <input type="text" {...registerStock('source')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Destination">
            <input type="text" {...registerStock('destination')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Notes">
            <textarea {...registerStock('notes')} rows="4" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditAssignment ? 'Edit assignment' : 'Create asset assignment'}
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitAssignment(handleAssignmentSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditAssignment ? 'Save assignment' : 'Assign asset'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Assignment ID">
            <input type="text" {...registerAssignment('assignmentId')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Auto-generated if blank" />
          </FormField>
          <FormField label="Asset ID">
            <select {...registerAssignment('assetId')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option value="">Select asset</option>
              {assets.map((asset) => (<option key={asset.id} value={asset.assetId}>{asset.name}</option>))}
            </select>
          </FormField>
          <FormField label="Assigned to">
            <input type="text" {...registerAssignment('assignedTo')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Assigned type">
            <select {...registerAssignment('assignedType')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option>Teacher</option>
              <option>Employee</option>
              <option>Department</option>
              <option>Lab</option>
              <option>Library</option>
              <option>Hostel</option>
            </select>
          </FormField>
          <FormField label="Department / location">
            <input type="text" {...registerAssignment('department')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Location">
            <input type="text" {...registerAssignment('location')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Assigned date">
            <input type="date" {...registerAssignment('assignedDate')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Return date">
            <input type="date" {...registerAssignment('returnDate')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Status">
            <select {...registerAssignment('status')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option>Pending</option>
              <option>Assigned</option>
              <option>Returned</option>
            </select>
          </FormField>
          <FormField label="Notes">
            <textarea {...registerAssignment('notes')} rows="4" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditMaintenance ? 'Update maintenance request' : 'Create maintenance request'}
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitMaintenance(handleMaintenanceSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditMaintenance ? 'Save request' : 'Create request'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Request ID">
            <input type="text" {...registerMaintenance('requestId')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="Auto-generated if blank" />
          </FormField>
          <FormField label="Asset ID">
            <select {...registerMaintenance('assetId')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option value="">Select asset</option>
              {assets.map((asset) => (<option key={asset.id} value={asset.assetId}>{asset.name}</option>))}
            </select>
          </FormField>
          <FormField label="Issue">
            <input type="text" {...registerMaintenance('issue')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Vendor">
            <select {...registerMaintenance('vendor')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (<option key={vendor.id} value={vendor.name}>{vendor.name}</option>))}
            </select>
          </FormField>
          <FormField label="Schedule date">
            <input type="date" {...registerMaintenance('scheduleDate')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Repair cost">
            <input type="number" {...registerMaintenance('repairCost')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Warranty claim">
            <select {...registerMaintenance('warrantyClaim')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option>No</option>
              <option>Yes</option>
            </select>
          </FormField>
          <FormField label="AMC details">
            <input type="text" {...registerMaintenance('amcDetails')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Status">
            <select {...registerMaintenance('status')} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option>Requested</option>
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </FormField>
          <FormField label="Service history">
            <textarea {...registerMaintenance('serviceHistory')} rows="4" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </FormField>
          <FormField label="Attachments">
            <input type="file" accept="image/*,.pdf" {...registerMaintenance('attachments')} ref={(e) => { registerMaintenance('attachments').ref(e); maintenanceAttachmentRef.current = e; }} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none" />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
