// Domain DTO stubs (JS objects). These are lightweight and used as reference types across the app.

export const StudentDTO = {
  id: null,
  admissionNumber: null,
  firstName: '',
  lastName: '',
  dob: null,
  gender: null,
  class: null,
  section: null,
  enrollmentDate: null,
};

export const EmployeeDTO = {
  id: null,
  employeeId: null,
  name: '',
  designation: '',
  department: '',
  dateOfJoining: null,
};

export const VendorDTO = {
  id: null,
  name: '',
  gst: '',
  email: '',
  phone: '',
  address: '',
};

export const PurchaseOrderDTO = {
  id: null,
  purchaseOrderId: null,
  supplier: null,
  purchaseDate: null,
  grandTotal: 0,
  status: 'Draft',
  items: [],
};

export const InventoryItemDTO = {
  id: null,
  assetId: null,
  name: '',
  category: null,
  quantity: 1,
  purchasePrice: 0,
  status: 'Available',
};

export default {
  StudentDTO,
  EmployeeDTO,
  VendorDTO,
  PurchaseOrderDTO,
  InventoryItemDTO,
};
