import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Layers3,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const sectionDefinitions = [
  {
    key: 'basicPersonalInformation',
    title: 'Basic / Personal Information',
    description: 'Core identity and student lifecycle defaults',
    fields: [
      { key: 'studentId', label: 'Student ID', type: 'Text' },
      { key: 'admissionNumber', label: 'Admission Number', type: 'Text' },
      { key: 'firstName', label: 'First Name', type: 'Text' },
      { key: 'middleName', label: 'Middle Name', type: 'Text' },
      { key: 'lastName', label: 'Last Name', type: 'Text' },
      { key: 'photoUpload', label: 'Photo Upload', type: 'File' },
      { key: 'dob', label: 'DOB', type: 'Date' },
      { key: 'gender', label: 'Gender', type: 'Select' },
      { key: 'bloodGroup', label: 'Blood Group', type: 'Select' },
      { key: 'nationality', label: 'Nationality', type: 'Text' },
      { key: 'religion', label: 'Religion', type: 'Select' },
      { key: 'category', label: 'Category', type: 'Select' },
      { key: 'aadharNumber', label: 'Aadhar Number', type: 'Text' },
      { key: 'governmentId', label: 'Government ID', type: 'Text' },
      { key: 'maritalStatus', label: 'Marital Status', type: 'Select' },
    ],
  },
  {
    key: 'academicInformation',
    title: 'Academic Information',
    description: 'Program, semester, session and academic defaults',
    fields: [
      { key: 'course', label: 'Course', type: 'Select' },
      { key: 'program', label: 'Program', type: 'Select' },
      { key: 'department', label: 'Department', type: 'Select' },
      { key: 'section', label: 'Section', type: 'Select' },
      { key: 'batch', label: 'Batch', type: 'Select' },
      { key: 'academicSession', label: 'Academic Session', type: 'Select' },
      { key: 'semester', label: 'Semester', type: 'Select' },
      { key: 'rollNumber', label: 'Roll Number', type: 'Text' },
      { key: 'admissionDate', label: 'Admission Date', type: 'Date' },
      { key: 'admissionType', label: 'Admission Type', type: 'Select' },
      { key: 'previousSchool', label: 'Previous School', type: 'Text' },
      { key: 'previousBoard', label: 'Previous Board', type: 'Text' },
      { key: 'previousPercentage', label: 'Previous Percentage', type: 'Text' },
      { key: 'stream', label: 'Stream', type: 'Select' },
      { key: 'subjects', label: 'Subjects', type: 'Text' },
      { key: 'medium', label: 'Medium of Instruction', type: 'Select' },
    ],
  },
  {
    key: 'contactInformation',
    title: 'Contact Information',
    description: 'Current and permanent address and contact channels',
    fields: [
      { key: 'currentAddress', label: 'Current Address', type: 'Text' },
      { key: 'permanentAddress', label: 'Permanent Address', type: 'Text' },
      { key: 'studentMobile', label: 'Student Mobile', type: 'Text' },
      { key: 'parentMobile', label: 'Parent Mobile', type: 'Text' },
      { key: 'email', label: 'Email', type: 'Text' },
      { key: 'emergencyContact', label: 'Emergency Contact', type: 'Text' },
      { key: 'alternateContact', label: 'Alternate Contact', type: 'Text' },
    ],
  },
  {
    key: 'parentGuardian',
    title: 'Parent / Guardian',
    description: 'Financial and family profile defaults',
    fields: [
      { key: 'fatherName', label: 'Father Name', type: 'Text' },
      { key: 'fatherOccupation', label: 'Occupation', type: 'Text' },
      { key: 'fatherQualification', label: 'Qualification', type: 'Text' },
      { key: 'fatherContact', label: 'Contact', type: 'Text' },
      { key: 'motherName', label: 'Mother Name', type: 'Text' },
      { key: 'motherOccupation', label: 'Occupation', type: 'Text' },
      { key: 'motherQualification', label: 'Qualification', type: 'Text' },
      { key: 'motherContact', label: 'Contact', type: 'Text' },
      { key: 'guardianDetails', label: 'Guardian Details', type: 'Text' },
      { key: 'annualFamilyIncome', label: 'Annual Family Income', type: 'Text' },
    ],
  },
  {
    key: 'documents',
    title: 'Documents',
    description: 'Mandatory and upload-sensitive student documents',
    fields: [
      { key: 'birthCertificate', label: 'Birth Certificate', type: 'File' },
      { key: 'transferCertificate', label: 'Transfer Certificate', type: 'File' },
      { key: 'migrationCertificate', label: 'Migration Certificate', type: 'File' },
      { key: 'marksheet', label: 'Marksheet', type: 'File' },
      { key: 'aadharCard', label: 'Aadhar Card', type: 'File' },
      { key: 'passportPhoto', label: 'Passport Photo', type: 'File' },
      { key: 'signature', label: 'Signature', type: 'File' },
      { key: 'incomeCertificate', label: 'Income Certificate', type: 'File' },
      { key: 'casteCertificate', label: 'Caste Certificate', type: 'File' },
      { key: 'medicalCertificate', label: 'Medical Certificate', type: 'File' },
      { key: 'characterCertificate', label: 'Character Certificate', type: 'File' },
    ],
  },
  {
    key: 'feeFinance',
    title: 'Fee & Finance',
    description: 'Fee mapping, waiver and payment defaults',
    fields: [
      { key: 'feeCategory', label: 'Fee Category', type: 'Select' },
      { key: 'scholarship', label: 'Scholarship', type: 'Text' },
      { key: 'concession', label: 'Concession', type: 'Text' },
      { key: 'bankAccount', label: 'Bank Account', type: 'Text' },
      { key: 'ifsc', label: 'IFSC', type: 'Text' },
      { key: 'paymentMode', label: 'Payment Mode', type: 'Select' },
      { key: 'refundAccount', label: 'Refund Account', type: 'Text' },
    ],
  },
  {
    key: 'hostel',
    title: 'Hostel',
    description: 'Rooming and hostel dependency defaults',
    fields: [
      { key: 'hostelRequired', label: 'Hostel Required', type: 'Select' },
      { key: 'hostelBlock', label: 'Hostel Block', type: 'Select' },
      { key: 'roomCategory', label: 'Room Category', type: 'Select' },
      { key: 'messRequired', label: 'Mess Required', type: 'Select' },
    ],
  },
  {
    key: 'transport',
    title: 'Transport',
    description: 'Transportation and route preferences',
    fields: [
      { key: 'transportRequired', label: 'Transport Required', type: 'Select' },
      { key: 'route', label: 'Route', type: 'Select' },
      { key: 'pickupPoint', label: 'Pickup Point', type: 'Select' },
      { key: 'vehicle', label: 'Vehicle', type: 'Select' },
    ],
  },
  {
    key: 'medical',
    title: 'Medical',
    description: 'Medical conditions and wellness guidance',
    fields: [
      { key: 'medicalConditions', label: 'Medical Conditions', type: 'Text' },
      { key: 'allergies', label: 'Allergies', type: 'Text' },
      { key: 'disability', label: 'Disability', type: 'Text' },
      { key: 'specialNeeds', label: 'Special Needs', type: 'Text' },
      { key: 'doctorRemarks', label: 'Doctor Remarks', type: 'Text' },
    ],
  },
  {
    key: 'otherInformation',
    title: 'Other Information',
    description: 'Portal access and lifecycle status defaults',
    fields: [
      { key: 'studentStatus', label: 'Student Status', type: 'Select' },
      { key: 'house', label: 'House', type: 'Select' },
      { key: 'club', label: 'Club', type: 'Select' },
      { key: 'sports', label: 'Sports', type: 'Select' },
      { key: 'siblingDetails', label: 'Sibling Details', type: 'Text' },
      { key: 'portalLogin', label: 'Portal Login', type: 'Select' },
      { key: 'username', label: 'Username', type: 'Text' },
      { key: 'passwordPolicy', label: 'Password Policy', type: 'Text' },
      { key: 'remarks', label: 'Remarks', type: 'Text' },
    ],
  },
  {
    key: 'systemInformation',
    title: 'System Information',
    description: 'Audit and governance defaults',
    fields: [
      { key: 'createdBy', label: 'Created By', type: 'Text' },
      { key: 'createdDate', label: 'Created Date', type: 'Date' },
      { key: 'modifiedBy', label: 'Modified By', type: 'Text' },
      { key: 'modifiedDate', label: 'Modified Date', type: 'Date' },
      { key: 'approvalStatus', label: 'Approval Status', type: 'Select' },
      { key: 'auditTrail', label: 'Audit Trail', type: 'Text' },
      { key: 'activityHistory', label: 'Activity History', type: 'Text' },
    ],
  },
];

const createFieldSettings = (label, overrides = {}) => ({
  label,
  visible: true,
  mandatory: true,
  editable: true,
  unique: false,
  defaultValue: '',
  placeholder: '',
  required: false,
  uploadEnabled: false,
  ...overrides,
});

const createDefaultMasterConfig = () => {
  const config = {};

  sectionDefinitions.forEach((section) => {
    const sectionConfig = {};
    section.fields.forEach((field) => {
      sectionConfig[field.key] = createFieldSettings(field.label, field.key === 'photoUpload' ? { uploadEnabled: true, required: true } : {});
    });
    config[section.key] = sectionConfig;
  });

  return config;
};

const createInitialMasters = () => [
  {
    id: 'student-master-01',
    masterName: 'UG Admissions Profile',
    department: 'Computer Science',
    program: 'BCA',
    academicSession: '2025-26',
    status: 'Active',
    updatedBy: 'Admin Office',
    updatedDate: '2026-07-17',
    category: 'Undergraduate',
    description: 'Master blueprint for new undergraduate student onboarding and lifecycle configuration.',
    config: createDefaultMasterConfig(),
  },
  {
    id: 'student-master-02',
    masterName: 'PG Academic Setup',
    department: 'Business Administration',
    program: 'MBA',
    academicSession: '2026-27',
    status: 'Draft',
    updatedBy: 'Academic Team',
    updatedDate: '2026-07-12',
    category: 'Postgraduate',
    description: 'Configuration set tailored for postgraduate admissions, scholarship and document validation.',
    config: createDefaultMasterConfig(),
  },
  {
    id: 'student-master-03',
    masterName: 'Hostel & Transport',
    department: 'Student Welfare',
    program: 'All Programs',
    academicSession: '2025-26',
    status: 'Active',
    updatedBy: 'Welfare Office',
    updatedDate: '2026-07-10',
    category: 'Residential',
    description: 'Student lifecycle settings aligned with hostel, transport, medical and welfare management.',
    config: createDefaultMasterConfig(),
  },
];

export default function StudentMasterSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { masterId } = useParams();
  const [masters, setMasters] = useState(createInitialMasters);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [programFilter, setProgramFilter] = useState('All Programs');
  const [sessionFilter, setSessionFilter] = useState('All Sessions');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [configSearch, setConfigSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState(Object.fromEntries(sectionDefinitions.map((section) => [section.key, true])));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [form, setForm] = useState({ masterName: '', department: '', program: '', academicSession: '', status: 'Active', updatedBy: '', updatedDate: '', category: '', description: '' });
  const [message, setMessage] = useState('Student master rules are ready for review.');
  const [importFileName, setImportFileName] = useState('');
  const [importSummary, setImportSummary] = useState('');

  const filteredMasters = useMemo(() => {
    const term = search.toLowerCase();
    return masters.filter((master) => {
      const matchesSearch = [master.masterName, master.department, master.program, master.academicSession, master.status, master.category, master.description]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term));
      const matchesDepartment = departmentFilter === 'All Departments' || master.department === departmentFilter;
      const matchesProgram = programFilter === 'All Programs' || master.program === programFilter;
      const matchesSession = sessionFilter === 'All Sessions' || master.academicSession === sessionFilter;
      const matchesStatus = statusFilter === 'All Status' || master.status === statusFilter;
      const matchesCategory = categoryFilter === 'All Categories' || master.category === categoryFilter;
      return matchesSearch && matchesDepartment && matchesProgram && matchesSession && matchesStatus && matchesCategory;
    });
  }, [masters, search, departmentFilter, programFilter, sessionFilter, statusFilter, categoryFilter]);

  const summaryCards = useMemo(() => {
    const allFieldEntries = masters.flatMap((master) => Object.values(master.config || {}).flatMap((section) => Object.values(section || {})));
    const academicEntries = masters.flatMap((master) => Object.values(master.config?.academicInformation || {}));
    const parentEntries = masters.flatMap((master) => Object.values(master.config?.parentGuardian || {}));
    const documentEntries = masters.flatMap((master) => Object.values(master.config?.documents || {}));
    const feeEntries = masters.flatMap((master) => Object.values(master.config?.feeFinance || {}));
    const hostelEntries = masters.flatMap((master) => Object.values(master.config?.hostel || {}));
    const transportEntries = masters.flatMap((master) => Object.values(master.config?.transport || {}));
    const medicalEntries = masters.flatMap((master) => Object.values(master.config?.medical || {}));

    return [
      { label: 'Total Student Fields', value: allFieldEntries.length, subtitle: 'Configured across all student masters', icon: Layers3 },
      { label: 'Mandatory Fields', value: allFieldEntries.filter((field) => field.mandatory).length, subtitle: 'Required in lifecycle workflows', icon: ShieldCheck },
      { label: 'Academic Fields', value: academicEntries.length, subtitle: 'Course and session defaults', icon: BookOpen },
      { label: 'Parent Fields', value: parentEntries.length, subtitle: 'Guardian information controls', icon: Users },
      { label: 'Documents Required', value: documentEntries.filter((field) => field.required).length, subtitle: 'Mandatory uploads and proofs', icon: FileText },
      { label: 'Fee Categories', value: feeEntries.length, subtitle: 'Payment and scholarship mappings', icon: Wallet },
      { label: 'Hostel Configurations', value: hostelEntries.length, subtitle: 'Residential service toggles', icon: BookOpen },
      { label: 'Transport Configurations', value: transportEntries.length, subtitle: 'Route and travel preferences', icon: BookOpen },
      { label: 'Medical Records', value: medicalEntries.length, subtitle: 'Health and support defaults', icon: ShieldCheck },
      { label: 'Student Status Types', value: new Set(masters.map((master) => master.status)).size, subtitle: 'Live lifecycle states', icon: Sparkles },
    ];
  }, [masters]);

  const cardRouteMap = {
    'Total Student Fields': '/settings/institute/student-master/student-fields',
    'Mandatory Fields': '/settings/institute/student-master/mandatory-fields',
    'Academic Fields': '/settings/institute/student-master/academic-fields',
    'Parent Fields': '/settings/institute/student-master/parent-fields',
    'Documents Required': '/settings/institute/student-master/documents',
    'Fee Categories': '/settings/institute/student-master/fee-categories',
    'Hostel Configurations': '/settings/institute/student-master/hostel-configurations',
    'Transport Configurations': '/settings/institute/student-master/transport-configurations',
    'Medical Records': '/settings/institute/student-master/medical-records',
    'Student Status Types': '/settings/institute/student-master/student-status',
  };

  const activeMaster = masters.find((master) => master.id === masterId) || null;
  const routeMode = useMemo(() => {
    const path = location.pathname.replace(/\/+$/, '');
    if (path.endsWith('/new')) return 'new';
    if (path.endsWith('/import')) return 'import';
    if (path.endsWith('/export')) return 'export';
    if (path.endsWith('/print')) return 'print';
    if (path.endsWith('/refresh')) return 'refresh';
    if (path.match(/\/student-master\/[^/]+\/edit$/)) return 'edit';
    if (path.match(/\/student-master\/[^/]+$/)) return 'detail';
    return 'list';
  }, [location.pathname]);

  const departments = Array.from(new Set(masters.map((master) => master.department)));
  const programs = Array.from(new Set(masters.map((master) => master.program)));
  const sessions = Array.from(new Set(masters.map((master) => master.academicSession)));
  const categories = Array.from(new Set(masters.map((master) => master.category)));
  const statuses = Array.from(new Set(masters.map((master) => master.status)));

  const openAddPage = () => {
    setSelectedMaster(null);
    setForm({ masterName: '', department: '', program: '', academicSession: '', status: 'Active', updatedBy: '', updatedDate: new Date().toISOString().slice(0, 10), category: '', description: '' });
    navigate('/settings/institute/student-master/new');
  };

  const openEditPage = (master) => {
    setSelectedMaster(master);
    setForm({
      masterName: master.masterName,
      department: master.department,
      program: master.program,
      academicSession: master.academicSession,
      status: master.status,
      updatedBy: master.updatedBy,
      updatedDate: master.updatedDate,
      category: master.category,
      description: master.description,
    });
    navigate(`/settings/institute/student-master/${master.id}/edit`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMaster(null);
    setForm({ masterName: '', department: '', program: '', academicSession: '', status: 'Active', updatedBy: '', updatedDate: '', category: '', description: '' });
  };

  const handleSaveMaster = (event) => {
    event.preventDefault();
    const baseMaster = {
      masterName: form.masterName,
      department: form.department,
      program: form.program,
      academicSession: form.academicSession,
      status: form.status,
      updatedBy: form.updatedBy || 'Admin',
      updatedDate: form.updatedDate || new Date().toISOString().slice(0, 10),
      category: form.category,
      description: form.description,
    };

    if (selectedMaster) {
      setMasters((current) => current.map((master) => master.id === selectedMaster.id ? { ...master, ...baseMaster } : master));
      setMessage(`Updated ${form.masterName} successfully.`);
      navigate(`/settings/institute/student-master/${selectedMaster.id}`);
    } else {
      const nextMaster = {
        id: `student-master-${Date.now()}`,
        ...baseMaster,
        config: createDefaultMasterConfig(),
      };
      setMasters((current) => [nextMaster, ...current]);
      setMessage(`Added ${form.masterName} to the student master setup.`);
      navigate(`/settings/institute/student-master/${nextMaster.id}`);
    }
    closeModal();
  };

  const requestDelete = (master) => {
    setPendingDelete(master);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setMasters((current) => current.filter((master) => master.id !== pendingDelete.id));
    setMessage(`Removed ${pendingDelete.masterName} from the master workspace.`);
    setPendingDelete(null);
    setIsDeleteOpen(false);
    if (masterId === pendingDelete.id) {
      navigate('/settings/institute/student-master');
    }
  };

  const handleExport = () => {
    const rows = filteredMasters.map((master) => [master.masterName, master.department, master.program, master.academicSession, master.status, master.updatedBy, master.updatedDate].join(','));
    const blob = new Blob([['Master Name', 'Department', 'Program', 'Academic Session', 'Status', 'Updated By', 'Updated Date'].join(',') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-master-setup.csv';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Exported the current student master list.');
  };

  const handleImport = (event) => {
    event.preventDefault();
    const fileName = importFileName || 'student-master-template.xlsx';
    setImportSummary(`Imported ${filteredMasters.length} student master records from ${fileName}.`);
    setMessage(`Import completed for ${fileName}.`);
    navigate('/settings/institute/student-master');
  };

  const handlePrint = () => {
    setMessage('Print preview opened for the current student master workspace.');
    window.print();
  };

  const resetWorkspace = () => {
    setSearch('');
    setDepartmentFilter('All Departments');
    setProgramFilter('All Programs');
    setSessionFilter('All Sessions');
    setStatusFilter('All Status');
    setCategoryFilter('All Categories');
    setConfigSearch('');
    setMessage('Workspace refreshed and filters cleared.');
    navigate('/settings/institute/student-master');
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections((current) => ({ ...current, [sectionKey]: !current[sectionKey] }));
  };

  const updateFieldSetting = (masterIdToUpdate, sectionKey, fieldKey, patch) => {
    setMasters((current) => current.map((master) => {
      if (master.id !== masterIdToUpdate) return master;
      return {
        ...master,
        config: {
          ...master.config,
          [sectionKey]: {
            ...master.config[sectionKey],
            [fieldKey]: {
              ...master.config[sectionKey][fieldKey],
              ...patch,
            },
          },
        },
      };
    }));
  };

  useEffect(() => {
    if (routeMode !== 'refresh') return undefined;
    const timer = window.setTimeout(() => {
      resetWorkspace();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [routeMode]);

  const renderFieldRow = (master, sectionKey, fieldKey, fieldSetting) => {
    const searchMatch = !configSearch || [fieldSetting.label, fieldSetting.defaultValue, fieldSetting.placeholder].filter(Boolean).some((value) => value.toString().toLowerCase().includes(configSearch.toLowerCase()));
    if (!searchMatch) return null;

    

    return (
      <div key={`${master.id}-${sectionKey}-${fieldKey}`} className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{fieldSetting.label}</p>
            <p className="mt-1 text-sm text-slate-500">Visible in admissions, student profile and downstream modules.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              <input type="checkbox" checked={fieldSetting.visible} onChange={(event) => updateFieldSetting(master.id, sectionKey, fieldKey, { visible: event.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300" />
              Visible
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              <input type="checkbox" checked={fieldSetting.mandatory} onChange={(event) => updateFieldSetting(master.id, sectionKey, fieldKey, { mandatory: event.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300" />
              Mandatory
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              <input type="checkbox" checked={fieldSetting.editable} onChange={(event) => updateFieldSetting(master.id, sectionKey, fieldKey, { editable: event.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300" />
              Editable
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              <input type="checkbox" checked={fieldSetting.unique} onChange={(event) => updateFieldSetting(master.id, sectionKey, fieldKey, { unique: event.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300" />
              Unique
            </label>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            <span className="mb-2 block">Default Value</span>
            <input value={fieldSetting.defaultValue} onChange={(event) => updateFieldSetting(master.id, sectionKey, fieldKey, { defaultValue: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" placeholder="Enter default value" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            <span className="mb-2 block">Placeholder</span>
            <input value={fieldSetting.placeholder} onChange={(event) => updateFieldSetting(master.id, sectionKey, fieldKey, { placeholder: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" placeholder="Enter placeholder" />
          </label>
          {sectionKey === 'documents' ? (
            <>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={fieldSetting.required} onChange={(event) => updateFieldSetting(master.id, sectionKey, fieldKey, { required: event.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300" />
                Required
              </label>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={fieldSetting.uploadEnabled} onChange={(event) => updateFieldSetting(master.id, sectionKey, fieldKey, { uploadEnabled: event.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300" />
                Upload Enabled
              </label>
            </>
          ) : null}
        </div>
      </div>
    );
  };

  const routeActionPage = (title, description, children, primaryActionLabel, primaryAction) => (
    <div className="mx-[10px] space-y-6">
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mt-4">
          <Breadcrumb items={[{ to: '/settings', label: 'Settings' }, { to: '/settings/institute', label: 'Institute Setup' }, { label: 'Student Master Setup' }, { label: title }]} />
        </div>
        <div className="mt-5 rounded-[24px] border border-emerald-200 bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_60%,#f7fff9_100%)] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">Student master</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[34px]">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">{description}</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        {children}
        {primaryActionLabel ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={primaryAction} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 hover-gradient-border">
              {primaryActionLabel}
            </button>
            <button type="button" onClick={() => navigate('/settings/institute/student-master')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              Return to list
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );

  if (routeMode === 'new' || routeMode === 'edit') {
    return (
      <div className="mx-[10px] space-y-6">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mt-4">
            <Breadcrumb items={[{ to: '/settings', label: 'Settings' }, { to: '/settings/institute', label: 'Institute Setup' }, { label: 'Student Master Setup' }, { label: routeMode === 'edit' ? 'Edit Master' : 'Add Master' }]} />
          </div>
          <div className="mt-5 rounded-[24px] border border-emerald-200 bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_60%,#f7fff9_100%)] p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">Student master</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[34px]">{routeMode === 'edit' ? 'Edit Student Master' : 'Add Student Master'}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">Create or update a master configuration that can be reused across admissions, fees, hostel, transport and student lifecycle modules.</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSaveMaster}>
            <label className="text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Master Name</span>
              <input value={form.masterName} onChange={(event) => setForm({ ...form, masterName: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" required />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Department</span>
              <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" required />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Program</span>
              <input value={form.program} onChange={(event) => setForm({ ...form, program: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" required />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Academic Session</span>
              <input value={form.academicSession} onChange={(event) => setForm({ ...form, academicSession: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" required />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Status</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border">
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Student Category</span>
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Updated By</span>
              <input value={form.updatedBy} onChange={(event) => setForm({ ...form, updatedBy: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Updated Date</span>
              <input type="date" value={form.updatedDate} onChange={(event) => setForm({ ...form, updatedDate: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
            </label>
            <label className="md:col-span-2 text-sm font-semibold text-slate-700">
              <span className="mb-2 block">Description</span>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
            </label>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/settings/institute/student-master')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">Save Master</button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  if (routeMode === 'import') {
    return routeActionPage(
      'Import Student Master',
      'Upload an Excel or CSV template to bring in master records and configuration mappings for the student lifecycle suite.',
      <div className="space-y-4">
        <div className="rounded-[24px] border border-dashed border-emerald-300 bg-emerald-50/70 p-6 text-center">
          <p className="text-sm font-semibold text-emerald-700">Import workbook</p>
          <p className="mt-2 text-sm text-slate-600">Select a spreadsheet to import master definitions and configuration rules.</p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Choose File
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => setImportFileName(event.target.files?.[0]?.name || '')} />
          </label>
          {importFileName ? <p className="mt-3 text-sm text-slate-600">Selected file: {importFileName}</p> : null}
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {importSummary || 'No import has been completed yet. The system will create a new student master batch once the file is confirmed.'}
        </div>
      </div>,
      'Import Workbook',
      (event) => {
        event.preventDefault();
        handleImport(event);
      }
    );
  }

  if (routeMode === 'export') {
    return routeActionPage(
      'Export Student Master',
      'Generate a downloadable Excel-style export of all active student master configurations, filters and status summaries.',
      <div className="space-y-4">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Current export summary</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Masters</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{filteredMasters.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Departments</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{departments.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{statuses.length}</p>
            </div>
          </div>
        </div>
      </div>,
      'Download Export',
      () => {
        handleExport();
      }
    );
  }

  if (routeMode === 'print') {
    return routeActionPage(
      'Print Student Master',
      'Open a print-ready view of the current student master workspace and its configuration summary.',
      <div className="space-y-4">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Print preview</p>
          <p className="mt-2 text-sm text-slate-600">The page is formatted for a clean professional printout of the master setup records and their active configuration sections.</p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Student Master Workspace</p>
            <p className="mt-2">{filteredMasters.length} records ready for export and print.</p>
          </div>
        </div>
      </div>,
      'Print Now',
      () => {
        handlePrint();
      }
    );
  }

  if (routeMode === 'refresh') {
    return routeActionPage(
      'Refreshing Workspace',
      'Resetting filters and reloading the student master workspace.',
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">The workspace is being refreshed and you will be returned to the main list automatically.</div>,
      null,
      null
    );
  }

  if (routeMode === 'detail' && activeMaster) {
    return (
      <div className="mx-[10px] space-y-6">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mt-4">
            <Breadcrumb items={[{ to: '/settings', label: 'Settings' }, { to: '/settings/institute', label: 'Institute Setup' }, { label: 'Student Master Setup' }, { label: activeMaster.masterName }]} />
          </div>
          <div className="mt-5 rounded-[24px] border border-emerald-200 bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_60%,#f7fff9_100%)] p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">Configuration page</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[34px]">{activeMaster.masterName}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">A complete student master control center for all lifecycle rules and downstream module dependencies.</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Configuration Workspace</h2>
              <p className="mt-1 text-sm text-slate-600">Search, review and update the field-level controls that power every student-related module.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => openEditPage(activeMaster)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 hover-gradient-border">
                Edit Master
              </button>
              <button type="button" onClick={() => requestDelete(activeMaster)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover-gradient-border">
                Delete Master
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 hover-gradient-border">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={configSearch} onChange={(event) => setConfigSearch(event.target.value)} placeholder="Search every field instantly" className="w-full border-none bg-transparent outline-none" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Duplicate validation, mandatory rules and visibility settings are configurable here.</div>
          </div>

          <div className="mt-6 space-y-4">
            {sectionDefinitions.map((section) => {
              const sectionEntries = Object.entries(activeMaster.config[section.key] || {}).filter(([, fieldSetting]) => {
                const term = configSearch.toLowerCase();
                return !term || [fieldSetting.label, fieldSetting.defaultValue, fieldSetting.placeholder].filter(Boolean).some((value) => value.toString().toLowerCase().includes(term));
              });
              return (
                <article key={section.key} className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
                  <button type="button" onClick={() => toggleSection(section.key)} className="flex w-full items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-left shadow-sm hover-gradient-border">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{sectionEntries.length} fields</span>
                      {expandedSections[section.key] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </button>
                  {expandedSections[section.key] ? (
                    <div className="mt-4 space-y-3">
                      {sectionEntries.map(([fieldKey, fieldSetting]) => renderFieldRow(activeMaster, section.key, fieldKey, fieldSetting))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Duplicate Validation</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {['Duplicate Admission No', 'Duplicate Roll No', 'Duplicate Aadhar', 'Duplicate Mobile', 'Duplicate Email'].map((item) => (
                <label key={item} className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
                  <span>{item}</span>
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
                </label>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

    return (
    <div className="mx-[10px] space-y-6">
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mt-4">
          <Breadcrumb items={[{ to: '/settings', label: 'Settings' }, { to: '/settings/institute', label: 'Institute Setup' }, { label: 'Student Master Setup' }]} />
        </div>
        <div className="mt-5 rounded-[24px] border border-emerald-200 bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_60%,#f7fff9_100%)] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">Institute setup</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[34px]">Student Master Setup</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">
            Configure master student information, academic defaults, admission rules, mandatory documents, fee mapping, hostel and transport preferences, and the lifecycle rules that drive every student-facing module.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">Oracle-style enterprise configuration</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600">Microsoft Dynamics Education-ready</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600">SAP Student Lifecycle aligned</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.article
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, delay: index * 0.03 }}
              className="hover-gradient-border rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(15,23,42,0.08)] cursor-pointer"
                onClick={() => { const path = cardRouteMap[card.label]; if (path) navigate(path); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { const path = cardRouteMap[card.label]; if (!path) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(path); } }}
            >
              <div className="inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-600">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
              <div className="mt-2 text-xl font-semibold text-slate-900">{card.value}</div>
              <p className="mt-2 text-sm text-slate-500">{card.subtitle}</p>
            </motion.article>
          );
        })}
      </div>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Student Master Workspace</h2>
            <p className="mt-1 text-sm text-slate-600">Search, filter and manage the student master profiles that govern enrollment, configuration and student lifecycle workflows.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openAddPage} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 hover-gradient-border">
              <Plus className="h-4 w-4" /> Add Student Master
            </button>
            <button type="button" onClick={() => navigate('/settings/institute/student-master/export')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <Download className="h-4 w-4" /> Export Excel
            </button>
            <button type="button" onClick={() => navigate('/settings/institute/student-master/print')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button type="button" onClick={() => navigate('/settings/institute/student-master/refresh')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 hover-gradient-border">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search masters" className="w-full border-none bg-transparent outline-none" />
            </label>
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border">
              <option value="All Departments">Department</option>
              {departments.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={programFilter} onChange={(event) => setProgramFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border">
              <option value="All Programs">Program</option>
              {programs.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border">
              <option value="All Sessions">Academic Session</option>
              {sessions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border">
              <option value="All Status">Status</option>
              {statuses.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">System message</p>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border">
                <option value="All Categories">Student Category</option>
                {categories.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Master Name</th>
                  <th className="px-3 py-3">Department</th>
                  <th className="px-3 py-3">Program</th>
                  <th className="px-3 py-3">Academic Session</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Updated By</th>
                  <th className="px-3 py-3">Updated Date</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMasters.map((master, index) => (
                  <tr key={master.id} className="transition hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => navigate(`/settings/institute/student-master/${master.id}`)} className="text-left font-semibold text-slate-900 transition hover:text-emerald-700">
                        {master.masterName}
                      </button>
                      <p className="mt-1 text-xs text-slate-500">{master.description}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{master.department}</td>
                    <td className="px-3 py-3 text-slate-700">{master.program}</td>
                    <td className="px-3 py-3 text-slate-700">{master.academicSession}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${master.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{master.status}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{master.updatedBy}</td>
                    <td className="px-3 py-3 text-slate-700">{master.updatedDate}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => navigate(`/settings/institute/student-master/${master.id}`)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover-gradient-border" aria-label="View master">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => openEditPage(master)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover-gradient-border" aria-label="Edit master">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => requestDelete(master)} className="rounded-full border border-slate-200 bg-white p-2 text-rose-600 transition hover-gradient-border" aria-label="Delete master">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {activeMaster ? (
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">Configuration page</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeMaster.masterName}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">A complete student master control center for all student lifecycle rules and downstream module dependencies.</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Live configuration view</div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 hover-gradient-border">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={configSearch} onChange={(event) => setConfigSearch(event.target.value)} placeholder="Search every field instantly" className="w-full border-none bg-transparent outline-none" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Duplicate validation, mandatory rules and visibility settings are all configurable here.</div>
          </div>

          <div className="mt-6 space-y-4">
            {sectionDefinitions.map((section) => {
              const sectionEntries = Object.entries(activeMaster.config[section.key] || {}).filter(([, fieldSetting]) => {
                const term = configSearch.toLowerCase();
                return !term || [fieldSetting.label, fieldSetting.defaultValue, fieldSetting.placeholder].filter(Boolean).some((value) => value.toString().toLowerCase().includes(term));
              });
              return (
                <article key={section.key} className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
                  <button type="button" onClick={() => toggleSection(section.key)} className="flex w-full items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-left shadow-sm hover-gradient-border">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{sectionEntries.length} fields</span>
                      {expandedSections[section.key] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </button>
                  {expandedSections[section.key] ? (
                    <div className="mt-4 space-y-3">
                      {sectionEntries.map(([fieldKey, fieldSetting]) => renderFieldRow(activeMaster, section.key, fieldKey, fieldSetting))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Duplicate Validation</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {['Duplicate Admission No', 'Duplicate Roll No', 'Duplicate Aadhar', 'Duplicate Mobile', 'Duplicate Email'].map((item) => (
                <label key={item} className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
                  <span>{item}</span>
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
                </label>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedMaster ? 'Edit Student Master' : 'Add Student Master'}</h3>
                <p className="mt-1 text-sm text-slate-600">Create or update the master configuration record used across admission, fee, hostel, and transport modules.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSaveMaster}>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Master Name</span>
                <input value={form.masterName} onChange={(event) => setForm({ ...form, masterName: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" required />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Department</span>
                <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" required />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Program</span>
                <input value={form.program} onChange={(event) => setForm({ ...form, program: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" required />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Academic Session</span>
                <input value={form.academicSession} onChange={(event) => setForm({ ...form, academicSession: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" required />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Student Category</span>
                <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Updated By</span>
                <input value={form.updatedBy} onChange={(event) => setForm({ ...form, updatedBy: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Updated Date</span>
                <input type="date" value={form.updatedDate} onChange={(event) => setForm({ ...form, updatedDate: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Description</span>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">Save Master</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isDeleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete Student Master</h3>
            <p className="mt-2 text-sm text-slate-600">This will remove the selected master configuration from the workspace. Continue?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setPendingDelete(null); setIsDeleteOpen(false); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={confirmDelete} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
