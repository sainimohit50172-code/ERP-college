import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useResourceList,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useBulkExport,
} from '../hooks/useResourceHooks';
import uploadService from '../api/uploadService';
import {
  ShieldCheck,
  Users,
  MapPin,
  Car,
  ClipboardList,
  CalendarCheck,
  Printer,
  Download,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import PanelCard from '../components/ui/PanelCard.jsx';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'guards', label: 'Guards' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'visitors', label: 'Visitors' },
  { key: 'gatePass', label: 'Gate Pass' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'reports', label: 'Reports' },
];

const guardStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'On Duty', label: 'On Duty' },
  { value: 'Off Duty', label: 'Off Duty' },
  { value: 'Suspended', label: 'Suspended' },
];

const attendanceStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
  { value: 'Late', label: 'Late' },
  { value: 'Overtime', label: 'Overtime' },
];

const visitorStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Inside', label: 'Inside' },
  { value: 'Exited', label: 'Exited' },
];

const gatePassStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Verified', label: 'Verified' },
];

const vehicleStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Parked', label: 'Parked' },
  { value: 'Exited', label: 'Exited' },
];

const incidentStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
];

const defaultGuardValues = {
  guardId: '',
  name: '',
  mobile: '',
  email: '',
  shift: 'Day',
  dutyArea: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  salary: '3200',
  emergencyContact: '',
  status: 'Active',
  photo: null,
};

const defaultAttendanceValues = {
  guardId: '',
  date: new Date().toISOString().slice(0, 10),
  shift: 'Day',
  status: 'Present',
  lateEntry: '00:00',
  earlyExit: '00:00',
  overtime: '00:00',
  notes: '',
};

const defaultVisitorValues = {
  visitorId: '',
  name: '',
  mobile: '',
  purpose: '',
  meetingPerson: '',
  department: '',
  entryTime: new Date().toISOString().slice(0, 16),
  exitTime: '',
  vehicleNumber: '',
  status: 'Inside',
  idProof: null,
};

const defaultGatePassValues = {
  passNumber: '',
  applicantType: 'Student',
  applicantName: '',
  reason: '',
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toLocaleTimeString().slice(0, 5),
  expectedReturn: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16),
  returnStatus: 'Outside',
  approvalStage: 'Teacher Approval',
  status: 'Pending',
  category: 'Official Duty',
  qrCode: '',
  barcode: '',
};

const defaultVehicleValues = {
  vehicleId: '',
  ownerType: 'Student',
  ownerName: '',
  vehicleNumber: '',
  parkingSlot: '',
  entryTime: new Date().toISOString().slice(0, 16),
  exitTime: '',
  status: 'Parked',
};

const defaultIncidentValues = {
  incidentId: '',
  title: '',
  category: 'Security',
  priority: 'Medium',
  description: '',
  assignedGuard: '',
  status: 'Open',
  resolution: '',
  timeline: '',
  photos: null,
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

function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function printHtmlContent(title, content) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;
  printWindow.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #0f172a; }
      .card { border: 1px solid #d1d5db; border-radius: 24px; padding: 24px; margin-bottom: 18px; }
      h1 { margin-bottom: 16px; font-size: 28px; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; }
      th, td { padding: 10px 12px; border: 1px solid #e2e8f0; }
      th { background: #f8fafc; text-align: left; }
    </style>
    </head><body><h1>${title}</h1>${content}</body></html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function SecurityPage() {
  const guardPhotoRef = useRef(null);
  const idProofRef = useRef(null);
  const incidentPhotosRef = useRef(null);

  const { data: guardData = {} } = useResourceList('securityGuards', { page: 1, pageSize: 200 });
  const { data: guardAttendanceData = {} } = useResourceList('securityGuardAttendance', { page: 1, pageSize: 200 });
  const { data: visitorData = {} } = useResourceList('visitors', { page: 1, pageSize: 200 });
  const { data: gatePassData = {} } = useResourceList('gatePasses', { page: 1, pageSize: 200 });
  const { data: vehicleData = {} } = useResourceList('vehicles', { page: 1, pageSize: 200 });
  const { data: incidentData = {} } = useResourceList('incidents', { page: 1, pageSize: 200 });

  const guards = guardData.items || [];
  const guardAttendance = guardAttendanceData.items || [];
  const visitors = visitorData.items || [];
  const gatePasses = gatePassData.items || [];
  const vehicles = vehicleData.items || [];
  const incidents = incidentData.items || [];

  const createGuard = useCreateResource('securityGuards');
  const updateGuard = useUpdateResource('securityGuards');
  const deleteGuard = useDeleteResource('securityGuards');
  const exportGuard = useBulkExport('securityGuards');

  const createAttendance = useCreateResource('securityGuardAttendance');
  const exportAttendance = useBulkExport('securityGuardAttendance');

  const createVisitor = useCreateResource('visitors');
  const updateVisitor = useUpdateResource('visitors');
  const deleteVisitor = useDeleteResource('visitors');
  const exportVisitors = useBulkExport('visitors');

  const createGatePass = useCreateResource('gatePasses');
  const updateGatePass = useUpdateResource('gatePasses');
  const deleteGatePass = useDeleteResource('gatePasses');
  const exportGatePasses = useBulkExport('gatePasses');

  const createVehicle = useCreateResource('vehicles');
  const updateVehicle = useUpdateResource('vehicles');
  const deleteVehicle = useDeleteResource('vehicles');
  const exportVehicles = useBulkExport('vehicles');

  const createIncident = useCreateResource('incidents');
  const updateIncident = useUpdateResource('incidents');
  const deleteIncident = useDeleteResource('incidents');
  const exportIncidents = useBulkExport('incidents');

  const [activeTab, setActiveTab] = useState('overview');
  const [guardSearch, setGuardSearch] = useState('');
  const [guardFilter, setGuardFilter] = useState('All');
  const [guardPage, setGuardPage] = useState(1);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [attendancePage, setAttendancePage] = useState(1);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorFilter, setVisitorFilter] = useState('All');
  const [visitorPage, setVisitorPage] = useState(1);
  const [gatePassSearch, setGatePassSearch] = useState('');
  const [gatePassFilter, setGatePassFilter] = useState('All');
  const [gatePassPage, setGatePassPage] = useState(1);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [vehiclePage, setVehiclePage] = useState(1);
  const [incidentSearch, setIncidentSearch] = useState('');
  const [incidentFilter, setIncidentFilter] = useState('All');
  const [incidentPage, setIncidentPage] = useState(1);
  const [isGuardModalOpen, setIsGuardModalOpen] = useState(false);
  const [isEditGuard, setIsEditGuard] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isEditVisitor, setIsEditVisitor] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [isEditGatePass, setIsEditGatePass] = useState(false);
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isEditVehicle, setIsEditVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isEditIncident, setIsEditIncident] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const guardForm = useForm({ defaultValues: defaultGuardValues });
  const attendanceForm = useForm({ defaultValues: defaultAttendanceValues });
  const visitorForm = useForm({ defaultValues: defaultVisitorValues });
  const gatePassForm = useForm({ defaultValues: defaultGatePassValues });
  const vehicleForm = useForm({ defaultValues: defaultVehicleValues });
  const incidentForm = useForm({ defaultValues: defaultIncidentValues });

  const { register: registerGuard, handleSubmit: handleSubmitGuard, reset: resetGuard, formState: { errors: guardErrors, isSubmitting: isGuardSubmitting } } = guardForm;
  const { register: registerAttendance, handleSubmit: handleSubmitAttendance, reset: resetAttendance } = attendanceForm;
  const { register: registerVisitor, handleSubmit: handleSubmitVisitor, reset: resetVisitor, formState: { errors: visitorErrors } } = visitorForm;
  const { register: registerGatePass, handleSubmit: handleSubmitGatePass, reset: resetGatePass, formState: { errors: gatePassErrors } } = gatePassForm;
  const { register: registerVehicle, handleSubmit: handleSubmitVehicle, reset: resetVehicle, formState: { errors: vehicleErrors } } = vehicleForm;
  const { register: registerIncident, handleSubmit: handleSubmitIncident, reset: resetIncident, formState: { errors: incidentErrors } } = incidentForm;

  const activeGuards = guards.filter((guard) => guard.status === 'Active').length;
  const guardsOnDuty = guards.filter((guard) => guard.status === 'Active' && guard.shift === 'Night').length + guards.filter((guard) => guard.status === 'Active' && guard.shift === 'Day').length;
  const pendingGatePasses = gatePasses.filter((pass) => pass.status === 'Pending').length;
  const approvedGatePasses = gatePasses.filter((pass) => pass.status === 'Approved').length;
  const rejectedGatePasses = gatePasses.filter((pass) => pass.status === 'Rejected').length;
  const visitorsToday = visitors.filter((visitor) => isToday(visitor.entryTime)).length;
  const activeVisitors = visitors.filter((visitor) => !visitor.exitTime || visitor.status === 'Inside').length;
  const studentsOutsideCampus = gatePasses.filter((pass) => pass.applicantType === 'Student' && pass.returnStatus === 'Outside').length;
  const employeesOutsideCampus = gatePasses.filter((pass) => pass.applicantType === 'Employee' && pass.returnStatus === 'Outside').length;
  const vehiclesEnteredToday = vehicles.filter((vehicle) => isToday(vehicle.entryTime)).length;
  const vehiclesExitedToday = vehicles.filter((vehicle) => isToday(vehicle.exitTime)).length;

  const guardRows = useMemo(() => {
    const filtered = guards.filter((guard) => {
      const searchTerm = guardSearch.toLowerCase();
      const matchesSearch = [guard.guardId, guard.name, guard.mobile, guard.email, guard.dutyArea, guard.shift]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = guardFilter === 'All' || guard.status === guardFilter;
      return matchesSearch && matchesFilter;
    });
    return filtered;
  }, [guards, guardSearch, guardFilter]);

  const attendanceRows = useMemo(() => {
    const filtered = guardAttendance.filter((row) => {
      const searchTerm = attendanceSearch.toLowerCase();
      const guardName = guards.find((guard) => guard.id === row.guardId)?.name || '';
      const matchesSearch = [guardName, row.date, row.shift, row.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = attendanceFilter === 'All' || row.status === attendanceFilter;
      return matchesSearch && matchesFilter;
    });
    return filtered;
  }, [guardAttendance, attendanceSearch, attendanceFilter, guards]);

  const visitorRows = useMemo(() => {
    const filtered = visitors.filter((visitor) => {
      const searchTerm = visitorSearch.toLowerCase();
      const matchesSearch = [visitor.visitorId, visitor.name, visitor.mobile, visitor.purpose, visitor.meetingPerson, visitor.department, visitor.vehicleNumber]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = visitorFilter === 'All' || visitor.status === visitorFilter;
      return matchesSearch && matchesFilter;
    });
    return filtered;
  }, [visitors, visitorSearch, visitorFilter]);

  const gatePassRows = useMemo(() => {
    const filtered = gatePasses.filter((pass) => {
      const searchTerm = gatePassSearch.toLowerCase();
      const matchesSearch = [pass.passNumber, pass.applicantName, pass.applicantType, pass.reason, pass.approvalStage, pass.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = gatePassFilter === 'All' || pass.status === gatePassFilter;
      return matchesSearch && matchesFilter;
    });
    return filtered;
  }, [gatePasses, gatePassSearch, gatePassFilter]);

  const vehicleRows = useMemo(() => {
    const filtered = vehicles.filter((vehicle) => {
      const searchTerm = vehicleSearch.toLowerCase();
      const matchesSearch = [vehicle.vehicleId, vehicle.ownerName, vehicle.vehicleNumber, vehicle.ownerType, vehicle.parkingSlot, vehicle.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = vehicleFilter === 'All' || vehicle.status === vehicleFilter;
      return matchesSearch && matchesFilter;
    });
    return filtered;
  }, [vehicles, vehicleSearch, vehicleFilter]);

  const incidentRows = useMemo(() => {
    const filtered = incidents.filter((incident) => {
      const searchTerm = incidentSearch.toLowerCase();
      const matchesSearch = [incident.incidentId, incident.title, incident.category, incident.priority, incident.assignedGuard, incident.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = incidentFilter === 'All' || incident.status === incidentFilter;
      return matchesSearch && matchesFilter;
    });
    return filtered;
  }, [incidents, incidentSearch, incidentFilter]);

  const guardPageSize = 6;
  const attendancePageSize = 5;
  const visitorPageSize = 6;
  const gatePassPageSize = 6;
  const vehiclePageSize = 6;
  const incidentPageSize = 6;

  const displayedGuards = guardRows.slice((guardPage - 1) * guardPageSize, guardPage * guardPageSize);
  const guardPageCount = Math.max(1, Math.ceil(guardRows.length / guardPageSize));

  const displayedAttendance = attendanceRows.slice((attendancePage - 1) * attendancePageSize, attendancePage * attendancePageSize);
  const attendancePageCount = Math.max(1, Math.ceil(attendanceRows.length / attendancePageSize));

  const displayedVisitors = visitorRows.slice((visitorPage - 1) * visitorPageSize, visitorPage * visitorPageSize);
  const visitorPageCount = Math.max(1, Math.ceil(visitorRows.length / visitorPageSize));

  const displayedGatePasses = gatePassRows.slice((gatePassPage - 1) * gatePassPageSize, gatePassPage * gatePassPageSize);
  const gatePassPageCount = Math.max(1, Math.ceil(gatePassRows.length / gatePassPageSize));

  const displayedVehicles = vehicleRows.slice((vehiclePage - 1) * vehiclePageSize, vehiclePage * vehiclePageSize);
  const vehiclePageCount = Math.max(1, Math.ceil(vehicleRows.length / vehiclePageSize));

  const displayedIncidents = incidentRows.slice((incidentPage - 1) * incidentPageSize, incidentPage * incidentPageSize);
  const incidentPageCount = Math.max(1, Math.ceil(incidentRows.length / incidentPageSize));

  const uploadFile = async (resource, file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    const response = await uploadService.upload(resource, formData);
    return response?.url || response?.path || response?.file || '';
  };

  const resetGuardForm = () => {
    resetGuard(defaultGuardValues);
    setSelectedGuard(null);
    setIsEditGuard(false);
  };

  const openNewGuardModal = () => {
    resetGuardForm();
    setIsGuardModalOpen(true);
  };

  const openEditGuardModal = (guard) => {
    setSelectedGuard(guard);
    setIsEditGuard(true);
    resetGuard({
      ...defaultGuardValues,
      ...guard,
      photo: null,
    });
    setIsGuardModalOpen(true);
  };

  const handleGuardSubmit = async (data) => {
    const payload = {
      guardId: data.guardId || `SG-${Date.now().toString().slice(-6)}`,
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      shift: data.shift,
      dutyArea: data.dutyArea,
      joiningDate: data.joiningDate,
      salary: data.salary,
      emergencyContact: data.emergencyContact,
      status: data.status,
    };

    if (data.photo?.[0]) {
      payload.photo = await uploadFile('securityGuards', data.photo[0]);
    }

    if (isEditGuard && selectedGuard) {
      updateGuard.mutate({ id: selectedGuard.id, payload }, {
        onSuccess: () => {
          resetGuardForm();
          setIsGuardModalOpen(false);
        },
      });
    } else {
      createGuard.mutate(payload, {
        onSuccess: () => {
          resetGuardForm();
          setIsGuardModalOpen(false);
          setGuardPage(1);
        },
      });
    }
  };

  const handleDeleteGuard = (guard) => {
    if (!window.confirm(`Delete guard ${guard.name}?`)) return;
    deleteGuard.mutate(guard.id);
  };

  const handleAttendanceSubmitInternal = (data) => {
    createAttendance.mutate({
      ...data,
      guardName: guards.find((guard) => guard.id === data.guardId)?.name || 'Unassigned',
    }, {
      onSuccess: () => {
        resetAttendance(defaultAttendanceValues);
        setAttendancePage(1);
      },
    });
  };

  const resetVisitorForm = () => {
    resetVisitor(defaultVisitorValues);
    setSelectedVisitor(null);
    setIsEditVisitor(false);
  };

  const openNewVisitorModal = () => {
    resetVisitorForm();
    setIsVisitorModalOpen(true);
  };

  const openEditVisitorModal = (visitor) => {
    setSelectedVisitor(visitor);
    setIsEditVisitor(true);
    resetVisitor({
      ...defaultVisitorValues,
      ...visitor,
      idProof: null,
    });
    setIsVisitorModalOpen(true);
  };

  const handleVisitorSubmit = async (data) => {
    const payload = {
      visitorId: data.visitorId || `V-${Date.now().toString().slice(-6)}`,
      name: data.name,
      mobile: data.mobile,
      purpose: data.purpose,
      meetingPerson: data.meetingPerson,
      department: data.department,
      entryTime: data.entryTime,
      exitTime: data.exitTime,
      vehicleNumber: data.vehicleNumber,
      status: data.status,
    };

    if (data.idProof?.[0]) {
      payload.idProof = await uploadFile('visitors', data.idProof[0]);
    }

    if (isEditVisitor && selectedVisitor) {
      updateVisitor.mutate({ id: selectedVisitor.id, payload }, {
        onSuccess: () => {
          resetVisitorForm();
          setIsVisitorModalOpen(false);
        },
      });
    } else {
      createVisitor.mutate(payload, {
        onSuccess: () => {
          resetVisitorForm();
          setIsVisitorModalOpen(false);
          setVisitorPage(1);
        },
      });
    }
  };

  const handleVisitorExit = (visitor) => {
    const payload = {
      ...visitor,
      exitTime: new Date().toISOString(),
      status: 'Exited',
    };
    updateVisitor.mutate({ id: visitor.id, payload });
  };

  const resetGatePassForm = () => {
    resetGatePass(defaultGatePassValues);
    setSelectedGatePass(null);
    setIsEditGatePass(false);
  };

  const openNewGatePassModal = () => {
    resetGatePassForm();
    setIsGatePassModalOpen(true);
  };

  const openEditGatePassModal = (gatePass) => {
    setSelectedGatePass(gatePass);
    setIsEditGatePass(true);
    resetGatePass({
      ...defaultGatePassValues,
      ...gatePass,
      qrCode: gatePass.qrCode || `QR-${gatePass.passNumber}`,
      barcode: gatePass.barcode || `BC-${gatePass.passNumber}`,
    });
    setIsGatePassModalOpen(true);
  };

  const handleGatePassSubmit = (data) => {
    const payload = {
      passNumber: data.passNumber || `GP-${Date.now().toString().slice(-6)}`,
      applicantType: data.applicantType,
      applicantName: data.applicantName,
      reason: data.reason,
      date: data.date,
      time: data.time,
      expectedReturn: data.expectedReturn,
      returnStatus: data.returnStatus,
      approvalStage: data.approvalStage,
      status: data.status,
      category: data.category,
      qrCode: data.qrCode || `QR-${data.passNumber || Date.now().toString().slice(-6)}`,
      barcode: data.barcode || `BC-${data.passNumber || Date.now().toString().slice(-6)}`,
    };

    if (isEditGatePass && selectedGatePass) {
      updateGatePass.mutate({ id: selectedGatePass.id, payload }, {
        onSuccess: () => {
          resetGatePassForm();
          setIsGatePassModalOpen(false);
        },
      });
    } else {
      createGatePass.mutate(payload, {
        onSuccess: () => {
          resetGatePassForm();
          setIsGatePassModalOpen(false);
          setGatePassPage(1);
        },
      });
    }
  };

  const handleGatePassApproval = (gatePass, status) => {
    updateGatePass.mutate({ id: gatePass.id, payload: { ...gatePass, status } });
  };

  const handleGatePassPrint = (gatePass) => {
    const content = `
      <div class="card">
        <h2>Gate Pass ${gatePass.passNumber}</h2>
        <p><strong>Applicant:</strong> ${gatePass.applicantName} (${gatePass.applicantType})</p>
        <p><strong>Reason:</strong> ${gatePass.reason}</p>
        <p><strong>Date:</strong> ${gatePass.date}</p>
        <p><strong>Time:</strong> ${gatePass.time}</p>
        <p><strong>Return:</strong> ${gatePass.expectedReturn}</p>
        <p><strong>Status:</strong> ${gatePass.status}</p>
        <p><strong>Approval:</strong> ${gatePass.approvalStage}</p>
        <div class="card" style="margin-top:16px; text-align:center;">QR Code Placeholder: ${gatePass.qrCode}</div>
        <div class="card" style="margin-top:16px; text-align:center;">Barcode Placeholder: ${gatePass.barcode}</div>
      </div>
    `;
    printHtmlContent('Gate Pass', content);
  };

  const resetVehicleForm = () => {
    resetVehicle(defaultVehicleValues);
    setSelectedVehicle(null);
    setIsEditVehicle(false);
  };

  const openNewVehicleModal = () => {
    resetVehicleForm();
    setIsVehicleModalOpen(true);
  };

  const openEditVehicleModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditVehicle(true);
    resetVehicle({
      ...defaultVehicleValues,
      ...vehicle,
    });
    setIsVehicleModalOpen(true);
  };

  const handleVehicleSubmit = (data) => {
    const payload = {
      vehicleId: data.vehicleId || `VH-${Date.now().toString().slice(-6)}`,
      ownerType: data.ownerType,
      ownerName: data.ownerName,
      vehicleNumber: data.vehicleNumber,
      parkingSlot: data.parkingSlot,
      entryTime: data.entryTime,
      exitTime: data.exitTime,
      status: data.status,
    };

    if (isEditVehicle && selectedVehicle) {
      updateVehicle.mutate({ id: selectedVehicle.id, payload }, {
        onSuccess: () => {
          resetVehicleForm();
          setIsVehicleModalOpen(false);
        },
      });
    } else {
      createVehicle.mutate(payload, {
        onSuccess: () => {
          resetVehicleForm();
          setIsVehicleModalOpen(false);
          setVehiclePage(1);
        },
      });
    }
  };

  const handleVehicleExit = (vehicle) => {
    updateVehicle.mutate({
      id: vehicle.id,
      payload: { ...vehicle, exitTime: new Date().toISOString(), status: 'Exited' },
    });
  };

  const resetIncidentForm = () => {
    resetIncident(defaultIncidentValues);
    setSelectedIncident(null);
    setIsEditIncident(false);
  };

  const openNewIncidentModal = () => {
    resetIncidentForm();
    setIsIncidentModalOpen(true);
  };

  const openEditIncidentModal = (incident) => {
    setSelectedIncident(incident);
    setIsEditIncident(true);
    resetIncident({
      ...defaultIncidentValues,
      ...incident,
      photos: null,
    });
    setIsIncidentModalOpen(true);
  };

  const handleIncidentSubmit = async (data) => {
    const payload = {
      incidentId: data.incidentId || `IN-${Date.now().toString().slice(-6)}`,
      title: data.title,
      category: data.category,
      priority: data.priority,
      description: data.description,
      assignedGuard: data.assignedGuard,
      status: data.status,
      resolution: data.resolution,
      timeline: data.timeline,
    };

    if (data.photos?.[0]) {
      payload.photos = await uploadFile('incidents', data.photos[0]);
    }

    if (isEditIncident && selectedIncident) {
      updateIncident.mutate({ id: selectedIncident.id, payload }, {
        onSuccess: () => {
          resetIncidentForm();
          setIsIncidentModalOpen(false);
        },
      });
    } else {
      createIncident.mutate(payload, {
        onSuccess: () => {
          resetIncidentForm();
          setIsIncidentModalOpen(false);
          setIncidentPage(1);
        },
      });
    }
  };

  const handleIncidentResolve = (incident) => {
    updateIncident.mutate({ id: incident.id, payload: { ...incident, status: 'Resolved' } });
  };

  const handleExport = async (exporter, filename) => {
    try {
      const blob = await exporter.mutateAsync();
      downloadBlob(blob, filename);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-600">Security Operations</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Campus Security & Gate Pass</h1>
            <p className="max-w-2xl text-slate-500">Manage guards, visitors, gate passes, vehicles, incidents and security reports from one operational command center.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('guards')}
              className="inline-flex items-center gap-2 rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <ShieldCheck className="h-4 w-4" /> Guard roster
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gatePass')}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ClipboardList className="h-4 w-4" /> Gate passes
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <MetricCard label="Visitors Today" value={visitorsToday.toString()} icon={Users} delta="+12%" />
          <MetricCard label="Active Visitors" value={activeVisitors.toString()} icon={MapPin} delta="+4%" />
          <MetricCard label="Students Outside" value={studentsOutsideCampus.toString()} icon={ShieldCheck} delta="+2%" />
          <MetricCard label="Employees Outside" value={employeesOutsideCampus.toString()} icon={Users} delta="+1.2%" />
          <MetricCard label="Vehicles In" value={vehiclesEnteredToday.toString()} icon={Car} delta="+8%" />
          <MetricCard label="Vehicles Out" value={vehiclesExitedToday.toString()} icon={Car} delta="-3%" />
          <MetricCard label="Guards On Duty" value={guardsOnDuty.toString()} icon={CheckCircle2} delta="+5%" />
          <MetricCard label="Pending Gate Passes" value={pendingGatePasses.toString()} icon={AlertTriangle} delta="+9%" />
          <MetricCard label="Approved Passes" value={approvedGatePasses.toString()} icon={ClipboardList} delta="+17%" />
          <MetricCard label="Rejected Passes" value={rejectedGatePasses.toString()} icon={X} delta="-2%" />
        </div>

        <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-semibold text-slate-950">Security quick actions</h2>
          <p className="mt-2 text-sm text-slate-500">Access the most important workflows for campus access control.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab('visitors')}
              className="rounded-[28px] border border-slate-200/70 bg-slate-50 px-5 py-4 text-left text-slate-900 transition hover:bg-emerald-50"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Visitor entry</p>
              <p className="mt-3 text-lg font-semibold">Log visitor access</p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className="rounded-[28px] border border-slate-200/70 bg-slate-50 px-5 py-4 text-left text-slate-900 transition hover:bg-emerald-50"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Attendance</p>
              <p className="mt-3 text-lg font-semibold">Track guard shifts</p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gatePass')}
              className="rounded-[28px] border border-slate-200/70 bg-slate-50 px-5 py-4 text-left text-slate-900 transition hover:bg-emerald-50"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Gate pass</p>
              <p className="mt-3 text-lg font-semibold">Approve visitor exits</p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('incidents')}
              className="rounded-[28px] border border-slate-200/70 bg-slate-50 px-5 py-4 text-left text-slate-900 transition hover:bg-emerald-50"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Incident management</p>
              <p className="mt-3 text-lg font-semibold">Report campus incidents</p>
            </button>
          </div>
        </section>
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
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.85fr]">
          <section className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Operational overview</h2>
                <p className="text-sm text-slate-500">Live security command insights and action-ready intelligence.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                <CalendarCheck className="h-4 w-4 text-emerald-600" /> Today&apos;s snapshot
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <PanelCard title="Guard roster" items={[`Total guards: ${guards.length}`, `Active guards: ${activeGuards}`, `On duty: ${guardsOnDuty}`]} />
              <PanelCard title="Access activity" items={[`Visitors inside: ${activeVisitors}`, `Pending passes: ${pendingGatePasses}`, `Vehicles in: ${vehiclesEnteredToday}`]} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-[32px] border border-slate-200/70 bg-slate-50/90 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">Approval pipeline</h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Teacher Approval</p>
                    <p className="text-sm text-slate-500">Student gate passes are reviewed first by instructors.</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">HOD / Admin Approval</p>
                    <p className="text-sm text-slate-500">Senior approval for exit passes and verification.</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Security verification</p>
                    <p className="text-sm text-slate-500">Guards verify pass details and release visitors.</p>
                  </div>
                </div>
              </section>
              <section className="rounded-[32px] border border-slate-200/70 bg-slate-50/90 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">Gate pass performance</h3>
                <div className="mt-4 grid gap-4">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Approved gates</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-700">{approvedGatePasses}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Rejected gates</p>
                    <p className="mt-2 text-3xl font-semibold text-rose-700">{rejectedGatePasses}</p>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'guards' && (
        <section className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
          <SectionHeader
            title="Security Guard Management"
            subtitle="Manage guard profiles, shifts, and campus assignments."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewGuardModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New guard
                </button>
                <button onClick={() => handleExport(exportGuard, 'guards-report.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
                <button onClick={() => printHtmlContent('Guard Roster', `<div>${guardRows.map((guard) => `<div style="margin-bottom:12px;"><strong>${guard.name}</strong> — ${guard.shift} — ${guard.status}</div>`).join('')}</div>`) } className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Printer className="h-4 w-4" /> Print
                </button>
              </div>
            )}
          />
          <SearchFilter
            search={guardSearch}
            onSearch={setGuardSearch}
            filter={guardFilter}
            onFilter={setGuardFilter}
            options={guardStatusOptions}
          />
          <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-soft">
            <div className="grid gap-0 bg-slate-100 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500" style={{ gridTemplateColumns: '0.8fr 1fr 1fr 1fr 1fr 1fr 0.9fr' }}>
              <span>Name</span>
              <span>Mobile</span>
              <span>Shift</span>
              <span>Area</span>
              <span>Joined</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-200">
              {displayedGuards.map((guard) => (
                <div key={guard.id} className="grid items-center gap-0 px-5 py-4 text-slate-700" style={{ gridTemplateColumns: '0.8fr 1fr 1fr 1fr 1fr 0.9fr 0.9fr' }}>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{guard.name}</p>
                    <p className="text-sm text-slate-500">{guard.guardId}</p>
                  </div>
                  <span>{guard.mobile}</span>
                  <span>{guard.shift}</span>
                  <span>{guard.dutyArea}</span>
                  <span>{guard.joiningDate}</span>
                  <StatusBadge status={guard.status} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditGuardModal(guard)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteGuard(guard)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination page={guardPage} pageCount={guardPageCount} onPageChange={setGuardPage} />
        </section>
      )}

      {activeTab === 'attendance' && (
        <section className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
          <SectionHeader
            title="Guard Attendance"
            subtitle="Record shift attendance and review daily security performance."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => setIsAttendanceModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> Add attendance
                </button>
                <button onClick={() => handleExport(exportAttendance, 'guard-attendance-report.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter
            search={attendanceSearch}
            onSearch={setAttendanceSearch}
            filter={attendanceFilter}
            onFilter={setAttendanceFilter}
            options={attendanceStatusOptions}
          />
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-soft">
              <div className="grid gap-0 bg-slate-100 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr' }}>
                <span>Guard</span>
                <span>Date</span>
                <span>Shift</span>
                <span>Status</span>
                <span>Late</span>
                <span>Overtime</span>
              </div>
              <div className="divide-y divide-slate-200">
                {displayedAttendance.map((entry) => (
                  <div key={entry.id} className="grid items-center gap-0 px-5 py-4 text-slate-700" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr' }}>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950">{guards.find((guard) => guard.id === entry.guardId)?.name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{entry.guardId}</p>
                    </div>
                    <span>{entry.date}</span>
                    <span>{entry.shift}</span>
                    <StatusBadge status={entry.status} />
                    <span>{entry.lateEntry}</span>
                    <span>{entry.overtime}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[32px] border border-slate-200/70 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">Attendance calendar</h3>
              <p className="mt-2 text-sm text-slate-500">Preview the month and track attendance history at a glance.</p>
              <div className="mt-6 grid gap-3">
                {attendanceRows.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">{guards.find((guard) => guard.id === entry.guardId)?.name || 'Unknown'}</p>
                    <p className="text-sm text-slate-500">{entry.date} • {entry.shift}</p>
                    <StatusBadge status={entry.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <TablePagination page={attendancePage} pageCount={attendancePageCount} onPageChange={setAttendancePage} />
        </section>
      )}

      {activeTab === 'visitors' && (
        <section className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
          <SectionHeader
            title="Visitor Management"
            subtitle="Register visitor entries, exits, and ID validation."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewVisitorModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New visitor
                </button>
                <button onClick={() => handleExport(exportVisitors, 'visitor-report.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter
            search={visitorSearch}
            onSearch={setVisitorSearch}
            filter={visitorFilter}
            onFilter={setVisitorFilter}
            options={visitorStatusOptions}
          />
          <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-soft">
            <div className="grid gap-0 bg-slate-100 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 0.9fr' }}>
              <span>Visitor</span>
              <span>Purpose</span>
              <span>Meeting</span>
              <span>Entry</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-200">
              {displayedVisitors.map((visitor) => (
                <div key={visitor.id} className="grid items-center gap-0 px-5 py-4 text-slate-700" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 0.9fr' }}>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{visitor.name}</p>
                    <p className="text-sm text-slate-500">{visitor.mobile}</p>
                  </div>
                  <span>{visitor.purpose}</span>
                  <span>{visitor.meetingPerson}</span>
                  <span>{formatDateTime(visitor.entryTime)}</span>
                  <StatusBadge status={visitor.status} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditVisitorModal(visitor)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleVisitorExit(visitor)} className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination page={visitorPage} pageCount={visitorPageCount} onPageChange={setVisitorPage} />
        </section>
      )}

      {activeTab === 'gatePass' && (
        <section className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
          <SectionHeader
            title="Gate Pass Management"
            subtitle="Control student, employee, and parent pass requests with approval workflows."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewGatePassModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> New pass
                </button>
                <button onClick={() => handleExport(exportGatePasses, 'gate-passes-report.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter
            search={gatePassSearch}
            onSearch={setGatePassSearch}
            filter={gatePassFilter}
            onFilter={setGatePassFilter}
            options={gatePassStatusOptions}
          />
          <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-soft">
            <div className="grid gap-0 bg-slate-100 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
              <span>Pass</span>
              <span>Applicant</span>
              <span>Type</span>
              <span>Status</span>
              <span>Approval</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-200">
              {displayedGatePasses.map((pass) => (
                <div key={pass.id} className="grid items-center gap-0 px-5 py-4 text-slate-700" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{pass.passNumber}</p>
                    <p className="text-sm text-slate-500">{pass.reason}</p>
                  </div>
                  <span>{pass.applicantName}</span>
                  <span>{pass.applicantType}</span>
                  <StatusBadge status={pass.status} />
                  <span>{pass.approvalStage}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => openEditGatePassModal(pass)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleGatePassApproval(pass, 'Approved')} className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-100">
                      Approve
                    </button>
                    <button onClick={() => handleGatePassApproval(pass, 'Rejected')} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100">
                      Reject
                    </button>
                    <button onClick={() => handleGatePassPrint(pass)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination page={gatePassPage} pageCount={gatePassPageCount} onPageChange={setGatePassPage} />
        </section>
      )}

      {activeTab === 'vehicles' && (
        <section className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
          <SectionHeader
            title="Vehicle Management"
            subtitle="Track campus vehicle entry, exit and parking assignments."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewVehicleModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> Vehicle entry
                </button>
                <button onClick={() => handleExport(exportVehicles, 'vehicle-report.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter
            search={vehicleSearch}
            onSearch={setVehicleSearch}
            filter={vehicleFilter}
            onFilter={setVehicleFilter}
            options={vehicleStatusOptions}
          />
          <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-soft">
            <div className="grid gap-0 bg-slate-100 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
              <span>Vehicle</span>
              <span>Owner</span>
              <span>Type</span>
              <span>Slot</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-200">
              {displayedVehicles.map((vehicle) => (
                <div key={vehicle.id} className="grid items-center gap-0 px-5 py-4 text-slate-700" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{vehicle.vehicleNumber}</p>
                    <p className="text-sm text-slate-500">{vehicle.vehicleId}</p>
                  </div>
                  <span>{vehicle.ownerName}</span>
                  <span>{vehicle.ownerType}</span>
                  <span>{vehicle.parkingSlot}</span>
                  <StatusBadge status={vehicle.status} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditVehicleModal(vehicle)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleVehicleExit(vehicle)} className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-100">
                      Exit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination page={vehiclePage} pageCount={vehiclePageCount} onPageChange={setVehiclePage} />
        </section>
      )}

      {activeTab === 'incidents' && (
        <section className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
          <SectionHeader
            title="Incident Management"
            subtitle="Log campus incidents, assign guards and drive resolution."
            action={(
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openNewIncidentModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> Report incident
                </button>
                <button onClick={() => handleExport(exportIncidents, 'incident-report.xlsx')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            )}
          />
          <SearchFilter
            search={incidentSearch}
            onSearch={setIncidentSearch}
            filter={incidentFilter}
            onFilter={setIncidentFilter}
            options={incidentStatusOptions}
          />
          <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-soft">
            <div className="grid gap-0 bg-slate-100 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
              <span>Incident</span>
              <span>Priority</span>
              <span>Assigned</span>
              <span>Status</span>
              <span>Timeline</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-200">
              {displayedIncidents.map((incident) => (
                <div key={incident.id} className="grid items-center gap-0 px-5 py-4 text-slate-700" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">{incident.title}</p>
                    <p className="text-sm text-slate-500">{incident.incidentId}</p>
                  </div>
                  <span>{incident.priority}</span>
                  <span>{incident.assignedGuard}</span>
                  <StatusBadge status={incident.status} />
                  <span>{incident.timeline || 'N/A'}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditIncidentModal(incident)} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleIncidentResolve(incident)} className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-100">
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination page={incidentPage} pageCount={incidentPageCount} onPageChange={setIncidentPage} />
        </section>
      )}

      {activeTab === 'reports' && (
        <section className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
          <SectionHeader
            title="Security Reports"
            subtitle="Generate export-ready reports for visitors, gate passes, attendance and incidents."
            action={(
              <button onClick={() => handleExport(exportGuard, 'security-dashboard-export.xlsx')} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                <Download className="h-4 w-4" /> Export dashboard data
              </button>
            )}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <PanelCard title="Visitor Report" items={[`Total visitors: ${visitors.length}`, `Today: ${visitorsToday}`, `Active: ${activeVisitors}`]} />
            <PanelCard title="Gate Pass Report" items={[`Pending: ${pendingGatePasses}`, `Approved: ${approvedGatePasses}`, `Rejected: ${rejectedGatePasses}`]} />
            <PanelCard title="Vehicle Report" items={[`Entered today: ${vehiclesEnteredToday}`, `Exited today: ${vehiclesExitedToday}`, `Total vehicles: ${vehicles.length}`]} />
            <PanelCard title="Incident Report" items={[`Open incidents: ${incidents.filter((incident) => incident.status === 'Open').length}`, `Resolved: ${incidents.filter((incident) => incident.status === 'Resolved').length}`, `Assignments: ${incidents.length}`]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button onClick={() => handleExport(exportVisitors, 'visitor-report.xlsx')} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left text-slate-900 shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Visitor Report</p>
              <p className="mt-3 text-lg font-semibold">Export CSV / Excel</p>
            </button>
            <button onClick={() => handleExport(exportGatePasses, 'gate-pass-report.xlsx')} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left text-slate-900 shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Gate Pass Report</p>
              <p className="mt-3 text-lg font-semibold">Download full audit</p>
            </button>
            <button onClick={() => handleExport(exportAttendance, 'guard-attendance-report.xlsx')} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left text-slate-900 shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Attendance Report</p>
              <p className="mt-3 text-lg font-semibold">Export attendance</p>
            </button>
            <button onClick={() => handleExport(exportVehicles, 'vehicle-report.xlsx')} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left text-slate-900 shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Vehicle Report</p>
              <p className="mt-3 text-lg font-semibold">Export parking log</p>
            </button>
            <button onClick={() => handleExport(exportIncidents, 'incident-report.xlsx')} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left text-slate-900 shadow-sm transition hover:bg-slate-50">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Incident Report</p>
              <p className="mt-3 text-lg font-semibold">Export case history</p>
            </button>
          </div>
        </section>
      )}

      <Modal
        title={isEditGuard ? 'Edit guard profile' : 'Add new guard'}
        isOpen={isGuardModalOpen}
        onClose={() => setIsGuardModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitGuard(handleGuardSubmit)}
            disabled={isGuardSubmitting}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditGuard ? 'Save changes' : 'Create guard'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Guard ID">
            <input
              type="text"
              {...registerGuard('guardId')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Auto-generated if left blank"
            />
          </FormField>
          <FormField label="Name">
            <input
              type="text"
              {...registerGuard('name', { required: true })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {guardErrors.name && <p className="text-sm text-rose-600">Name is required.</p>}
          </FormField>
          <FormField label="Mobile">
            <input
              type="tel"
              {...registerGuard('mobile', { required: true })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {guardErrors.mobile && <p className="text-sm text-rose-600">Mobile is required.</p>}
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              {...registerGuard('email')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Shift">
            <select
              {...registerGuard('shift')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Day</option>
              <option>Night</option>
              <option>Flexible</option>
            </select>
          </FormField>
          <FormField label="Duty area">
            <input
              type="text"
              {...registerGuard('dutyArea')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Joining date">
            <input
              type="date"
              {...registerGuard('joiningDate')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Salary">
            <input
              type="text"
              {...registerGuard('salary')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Emergency contact">
            <input
              type="text"
              {...registerGuard('emergencyContact')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Status">
            <select
              {...registerGuard('status')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Active</option>
              <option>On Duty</option>
              <option>Off Duty</option>
              <option>Suspended</option>
            </select>
          </FormField>
          <FormField label="Photo upload">
            <input
              type="file"
              accept="image/*"
              {...registerGuard('photo')}
              ref={(e) => {
                registerGuard('photo').ref(e);
                guardPhotoRef.current = e;
              }}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        title="Add guard attendance"
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitAttendance(handleAttendanceSubmitInternal)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Save attendance
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Guard">
            <select
              {...registerAttendance('guardId', { required: true })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Select guard</option>
              {guards.map((guard) => (
                <option key={guard.id} value={guard.id}>{guard.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              {...registerAttendance('date')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Shift">
            <select
              {...registerAttendance('shift')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Day</option>
              <option>Night</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select
              {...registerAttendance('status')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
              <option>Overtime</option>
            </select>
          </FormField>
          <FormField label="Late entry">
            <input
              type="time"
              {...registerAttendance('lateEntry')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Overtime">
            <input
              type="time"
              {...registerAttendance('overtime')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditVisitor ? 'Edit visitor log' : 'New visitor entry'}
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitVisitor(handleVisitorSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditVisitor ? 'Update visitor' : 'Create visitor'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Visitor ID">
            <input
              type="text"
              {...registerVisitor('visitorId')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Auto-generated if blank"
            />
          </FormField>
          <FormField label="Name">
            <input
              type="text"
              {...registerVisitor('name', { required: true })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {visitorErrors.name && <p className="text-sm text-rose-600">Name is required.</p>}
          </FormField>
          <FormField label="Mobile">
            <input
              type="tel"
              {...registerVisitor('mobile')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Purpose">
            <input
              type="text"
              {...registerVisitor('purpose')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Meeting person">
            <input
              type="text"
              {...registerVisitor('meetingPerson')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Department">
            <input
              type="text"
              {...registerVisitor('department')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Entry time">
            <input
              type="datetime-local"
              {...registerVisitor('entryTime')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Vehicle number">
            <input
              type="text"
              {...registerVisitor('vehicleNumber')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Status">
            <select
              {...registerVisitor('status')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Inside</option>
              <option>Exited</option>
            </select>
          </FormField>
          <FormField label="ID proof upload">
            <input
              type="file"
              accept="image/*,.pdf"
              {...registerVisitor('idProof')}
              ref={(e) => {
                registerVisitor('idProof').ref(e);
                idProofRef.current = e;
              }}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditGatePass ? 'Edit gate pass' : 'New gate pass'}
        isOpen={isGatePassModalOpen}
        onClose={() => setIsGatePassModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitGatePass(handleGatePassSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditGatePass ? 'Save pass' : 'Create pass'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Gate pass number">
            <input
              type="text"
              {...registerGatePass('passNumber')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Auto-generated if blank"
            />
          </FormField>
          <FormField label="Applicant type">
            <select
              {...registerGatePass('applicantType')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Student</option>
              <option>Employee</option>
              <option>Parent</option>
            </select>
          </FormField>
          <FormField label="Applicant name">
            <input
              type="text"
              {...registerGatePass('applicantName', { required: true })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {gatePassErrors.applicantName && <p className="text-sm text-rose-600">Applicant name is required.</p>}
          </FormField>
          <FormField label="Reason">
            <input
              type="text"
              {...registerGatePass('reason')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Category">
            <select
              {...registerGatePass('category')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Official Duty</option>
              <option>Personal Leave</option>
              <option>Half Day</option>
              <option>Emergency Exit</option>
            </select>
          </FormField>
          <FormField label="Approval stage">
            <select
              {...registerGatePass('approvalStage')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Teacher Approval</option>
              <option>HOD Approval</option>
              <option>Admin Approval</option>
              <option>Security Verification</option>
            </select>
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              {...registerGatePass('date')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Time">
            <input
              type="time"
              {...registerGatePass('time')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Expected return">
            <input
              type="datetime-local"
              {...registerGatePass('expectedReturn')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Return status">
            <select
              {...registerGatePass('returnStatus')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Outside</option>
              <option>Returned</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select
              {...registerGatePass('status')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Verified</option>
            </select>
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditVehicle ? 'Edit vehicle entry' : 'New vehicle entry'}
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitVehicle(handleVehicleSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditVehicle ? 'Update vehicle' : 'Create entry'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Vehicle ID">
            <input
              type="text"
              {...registerVehicle('vehicleId')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Auto-generated if blank"
            />
          </FormField>
          <FormField label="Owner type">
            <select
              {...registerVehicle('ownerType')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Student</option>
              <option>Employee</option>
              <option>Visitor</option>
            </select>
          </FormField>
          <FormField label="Owner name">
            <input
              type="text"
              {...registerVehicle('ownerName')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Vehicle number">
            <input
              type="text"
              {...registerVehicle('vehicleNumber')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Parking slot">
            <input
              type="text"
              {...registerVehicle('parkingSlot')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Entry time">
            <input
              type="datetime-local"
              {...registerVehicle('entryTime')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Status">
            <select
              {...registerVehicle('status')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Parked</option>
              <option>Exited</option>
            </select>
          </FormField>
        </div>
      </Modal>

      <Modal
        title={isEditIncident ? 'Edit incident' : 'New incident report'}
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        footer={(
          <button
            type="button"
            onClick={handleSubmitIncident(handleIncidentSubmit)}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isEditIncident ? 'Update incident' : 'Report incident'}
          </button>
        )}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField label="Incident ID">
            <input
              type="text"
              {...registerIncident('incidentId')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Auto-generated if blank"
            />
          </FormField>
          <FormField label="Title">
            <input
              type="text"
              {...registerIncident('title', { required: true })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {incidentErrors.title && <p className="text-sm text-rose-600">Title is required.</p>}
          </FormField>
          <FormField label="Category">
            <select
              {...registerIncident('category')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Security</option>
              <option>Health</option>
              <option>Property</option>
              <option>Safety</option>
            </select>
          </FormField>
          <FormField label="Priority">
            <select
              {...registerIncident('priority')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </FormField>
          <FormField label="Assigned guard">
            <select
              {...registerIncident('assignedGuard')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Unassigned</option>
              {guards.map((guard) => (
                <option key={guard.id} value={guard.name}>{guard.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Status">
            <select
              {...registerIncident('status')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </FormField>
          <FormField label="Description">
            <textarea
              rows="4"
              {...registerIncident('description')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Resolution notes">
            <textarea
              rows="4"
              {...registerIncident('resolution')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Timeline">
            <input
              type="text"
              {...registerIncident('timeline')}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </FormField>
          <FormField label="Attach photos">
            <input
              type="file"
              accept="image/*"
              {...registerIncident('photos')}
              ref={(e) => {
                registerIncident('photos').ref(e);
                incidentPhotosRef.current = e;
              }}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
