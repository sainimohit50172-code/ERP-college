import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  GripVertical,
  Layers3,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const initialFields = [
  { id: 1, name: 'studentName', label: 'Student Name', section: 'Personal Information', fieldType: 'Text', mandatory: true, visible: true, defaultValue: '', validation: 'Required', status: 'Active', description: 'Full legal name of the student as per admission documents.', order: 1 },
  { id: 2, name: 'fatherName', label: 'Father Name', section: 'Personal Information', fieldType: 'Text', mandatory: true, visible: true, defaultValue: '', validation: 'Required', status: 'Active', description: 'Father or guardian name for student profile.', order: 2 },
  { id: 3, name: 'motherName', label: 'Mother Name', section: 'Personal Information', fieldType: 'Text', mandatory: false, visible: true, defaultValue: '', validation: 'Optional', status: 'Active', description: 'Mother name for record keeping.', order: 3 },
  { id: 4, name: 'email', label: 'Email Address', section: 'Personal Information', fieldType: 'Email', mandatory: true, visible: true, defaultValue: '', validation: 'Email format', status: 'Active', description: 'Primary email address for communication.', order: 4 },
  { id: 5, name: 'mobile', label: 'Mobile Number', section: 'Personal Information', fieldType: 'Phone', mandatory: true, visible: true, defaultValue: '', validation: 'Phone format', status: 'Active', description: 'Student contact number.', order: 5 },
  { id: 6, name: 'aadhaarNumber', label: 'Aadhaar Number', section: 'Identity Documents', fieldType: 'Number', mandatory: true, visible: true, defaultValue: '', validation: '12 digits', status: 'Active', description: 'Government ID reference for verification.', order: 6 },
  { id: 7, name: 'bloodGroup', label: 'Blood Group', section: 'Personal Information', fieldType: 'Dropdown', mandatory: false, visible: true, defaultValue: 'O+', validation: 'Select one', status: 'Active', description: 'Blood group for medical emergency use.', order: 7 },
  { id: 8, name: 'category', label: 'Category', section: 'Identity Documents', fieldType: 'Dropdown', mandatory: true, visible: true, defaultValue: 'General', validation: 'Select one', status: 'Active', description: 'Reservation or category classification.', order: 8 },
  { id: 9, name: 'religion', label: 'Religion', section: 'Personal Information', fieldType: 'Dropdown', mandatory: false, visible: true, defaultValue: 'Hindu', validation: 'Select one', status: 'Active', description: 'Cultural and demographic field.', order: 9 },
  { id: 10, name: 'dob', label: 'Date of Birth', section: 'Personal Information', fieldType: 'Date', mandatory: true, visible: true, defaultValue: '', validation: 'Date required', status: 'Active', description: 'Birth date for student profile.', order: 10 },
  { id: 11, name: 'gender', label: 'Gender', section: 'Personal Information', fieldType: 'Radio', mandatory: true, visible: true, defaultValue: 'Male', validation: 'Select one', status: 'Active', description: 'Gender classification field.', order: 11 },
  { id: 12, name: 'address', label: 'Address', section: 'Address', fieldType: 'Textarea', mandatory: true, visible: true, defaultValue: '', validation: 'Required', status: 'Active', description: 'Permanent address for correspondence.', order: 12 },
  { id: 13, name: 'state', label: 'State', section: 'Address', fieldType: 'Dropdown', mandatory: true, visible: true, defaultValue: 'Uttarakhand', validation: 'Select one', status: 'Active', description: 'State of residence.', order: 13 },
  { id: 14, name: 'city', label: 'City', section: 'Address', fieldType: 'Dropdown', mandatory: true, visible: true, defaultValue: 'Haridwar', validation: 'Select one', status: 'Active', description: 'City of residence.', order: 14 },
  { id: 15, name: 'pinCode', label: 'PIN Code', section: 'Address', fieldType: 'Number', mandatory: true, visible: true, defaultValue: '', validation: '6 digits', status: 'Active', description: 'Postal code for resident address.', order: 15 },
  { id: 16, name: 'course', label: 'Course', section: 'Academic Information', fieldType: 'Dropdown', mandatory: true, visible: true, defaultValue: 'BCA', validation: 'Select one', status: 'Active', description: 'Selected academic program.', order: 16 },
  { id: 17, name: 'branch', label: 'Branch', section: 'Academic Information', fieldType: 'Dropdown', mandatory: true, visible: true, defaultValue: 'Computer Science', validation: 'Select one', status: 'Active', description: 'Department or specialty branch.', order: 17 },
  { id: 18, name: 'semester', label: 'Semester', section: 'Academic Information', fieldType: 'Dropdown', mandatory: true, visible: true, defaultValue: '1', validation: 'Select one', status: 'Active', description: 'Current semester of the student.', order: 18 },
  { id: 19, name: 'hostelRequired', label: 'Hostel Required', section: 'Hostel Information', fieldType: 'Checkbox', mandatory: false, visible: true, defaultValue: 'No', validation: 'Optional', status: 'Active', description: 'Marks whether student needs hostel.', order: 19 },
  { id: 20, name: 'transportRequired', label: 'Transport Required', section: 'Transport Information', fieldType: 'Checkbox', mandatory: false, visible: true, defaultValue: 'No', validation: 'Optional', status: 'Active', description: 'Marks whether transport is required.', order: 20 },
  { id: 21, name: 'emergencyContact', label: 'Emergency Contact', section: 'Emergency Contact', fieldType: 'Phone', mandatory: true, visible: true, defaultValue: '', validation: 'Phone format', status: 'Active', description: 'Emergency contact mobile number.', order: 21 },
  { id: 22, name: 'uploadId', label: 'Upload ID Proof', section: 'Identity Documents', fieldType: 'File Upload', mandatory: true, visible: true, defaultValue: '', validation: 'Required', status: 'Draft', description: 'Upload parent or student identity proof.', order: 22 },
];

const sectionOptions = ['All Sections', 'Personal Information', 'Academic Information', 'Parent Details', 'Guardian Details', 'Address', 'Identity Documents', 'Bank Details', 'Hostel Information', 'Transport Information', 'Emergency Contact'];
const typeOptions = ['All Types', 'Text', 'Number', 'Email', 'Phone', 'Date', 'Dropdown', 'Radio', 'Checkbox', 'Textarea', 'File Upload'];
const mandatoryOptions = ['All', 'Mandatory', 'Optional'];
const statusOptions = ['All Status', 'Active', 'Draft', 'Hidden'];

const initialForm = {
  label: '',
  name: '',
  section: 'Personal Information',
  fieldType: 'Text',
  placeholder: '',
  defaultValue: '',
  validationRule: 'Required',
  mandatory: true,
  visible: true,
  readOnly: false,
  status: 'Active',
  description: '',
};

function getStatusClasses(status) {
  switch (status) {
    case 'Active': return 'bg-emerald-100 text-emerald-700';
    case 'Draft': return 'bg-amber-100 text-amber-700';
    case 'Hidden': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export default function StudentFieldsManagementPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState(initialFields);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [mandatoryFilter, setMandatoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [summaryFilter, setSummaryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [previewField, setPreviewField] = useState(initialFields[0]);
  const [draggedFieldId, setDraggedFieldId] = useState(null);

  const summaryCards = useMemo(() => [
    { id: 'all', label: 'Total Fields', value: fields.length, subtitle: 'All configured fields', icon: Layers3 },
    { id: 'mandatory', label: 'Mandatory Fields', value: fields.filter((field) => field.mandatory).length, subtitle: 'Required in admission flow', icon: ClipboardList },
    { id: 'optional', label: 'Optional Fields', value: fields.filter((field) => !field.mandatory).length, subtitle: 'Selectable and flexible', icon: FileText },
    { id: 'hidden', label: 'Hidden Fields', value: fields.filter((field) => field.status === 'Hidden').length, subtitle: 'Not visible in forms', icon: Eye },
    { id: 'sections', label: 'Active Sections', value: Array.from(new Set(fields.filter((field) => field.status === 'Active').map((field) => field.section))).length, subtitle: 'Live admission sections', icon: BookOpen },
    { id: 'custom', label: 'Custom Fields', value: fields.filter((field) => field.id > 20).length, subtitle: 'Admin-created additions', icon: Sparkles },
  ], []);

  const filteredFields = useMemo(() => {
    const term = search.toLowerCase();
    return fields.filter((field) => {
      const matchesSearch = [field.label, field.name, field.section, field.fieldType, field.status, field.validation]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term));
      const matchesSection = sectionFilter === 'All Sections' || field.section === sectionFilter;
      const matchesType = typeFilter === 'All Types' || field.fieldType === typeFilter;
      const matchesMandatory = mandatoryFilter === 'All' || (mandatoryFilter === 'Mandatory' ? field.mandatory : !field.mandatory);
      const matchesStatus = statusFilter === 'All Status' || field.status === statusFilter;
      const matchesSummary = summaryFilter === 'all'
        || (summaryFilter === 'mandatory' && field.mandatory)
        || (summaryFilter === 'optional' && !field.mandatory)
        || (summaryFilter === 'hidden' && field.status === 'Hidden')
        || (summaryFilter === 'sections' && field.status === 'Active')
        || (summaryFilter === 'custom' && field.id > 20);
      return matchesSearch && matchesSection && matchesType && matchesMandatory && matchesStatus && matchesSummary;
    });
  }, [fields, search, sectionFilter, typeFilter, mandatoryFilter, statusFilter, summaryFilter]);

  const openModal = (field = null) => {
    if (field) {
      setForm({
        label: field.label,
        name: field.name,
        section: field.section,
        fieldType: field.fieldType,
        placeholder: '',
        defaultValue: field.defaultValue,
        validationRule: field.validation,
        mandatory: field.mandatory,
        visible: field.visible,
        readOnly: false,
        status: field.status,
        description: field.description,
      });
      setSelectedField(field);
    } else {
      setForm(initialForm);
      setSelectedField(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedField(null);
    setForm(initialForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedName = form.name.trim().replace(/\s+/g, '_').toLowerCase();
    const nextField = {
      id: selectedField ? selectedField.id : Date.now(),
      name: normalizedName || `field_${Date.now()}`,
      label: form.label.trim(),
      section: form.section,
      fieldType: form.fieldType,
      mandatory: form.mandatory,
      visible: form.visible,
      defaultValue: form.defaultValue.trim(),
      validation: form.validationRule,
      status: form.status,
      description: form.description.trim(),
      order: selectedField ? selectedField.order : fields.length + 1,
    };

    if (selectedField) {
      setFields((current) => current.map((field) => (field.id === selectedField.id ? nextField : field)));
    } else {
      setFields((current) => [nextField, ...current]);
    }
    setPreviewField(nextField);
    closeModal();
  };

  const handleDelete = (fieldId) => {
    setFields((current) => current.filter((field) => field.id !== fieldId));
  };

  const handlePreview = (field) => {
    setPreviewField(field);
  };

  const moveField = (fromId, toId) => {
    if (fromId === toId) return;
    const fromIndex = fields.findIndex((field) => field.id === fromId);
    const toIndex = fields.findIndex((field) => field.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const updated = [...fields];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFields(updated);
  };

  return (
    <div className="mx-[10px] space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 hover-gradient-border" aria-label="Go back">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="mt-3">
              <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Student Fields' }]} />
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Student Fields Management</h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-[15px]">Configure student registration fields, admission form sections, validation rules and visibility settings from one centralized workspace.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Form builder workspace</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.03 }}
              onClick={() => setSummaryFilter(card.id)}
              className={`group rounded-[22px] border p-4 text-left shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-[0_16px_35px_rgba(15,23,42,0.08)] hover-gradient-border ${summaryFilter === card.id ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}
            >
              <div className="inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-600">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
              <div className="mt-2 text-xl font-semibold text-slate-900">{card.value}</div>
              <p className="mt-2 text-sm text-slate-500">{card.subtitle}</p>
              <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">Filter table <ChevronRight className="h-4 w-4" /></div>
            </motion.button>
          );
        })}
      </div>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Student Field Configuration</h2>
            <p className="mt-1 text-sm text-slate-600">Create, organize and preview student admission fields with modern controls.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openModal} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover-gradient-border">
              <Plus className="h-4 w-4" /> Add Student Field
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">Import Fields</button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 hover-gradient-border">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search field" className="w-full border-none bg-transparent outline-none" />
            </label>
            <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border">
              {sectionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border">
              {typeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select value={mandatoryFilter} onChange={(event) => setMandatoryFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border">
                {mandatoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border">
                {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Sparkles className="h-4 w-4 text-emerald-600" /> Field Preview</div>
            <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Live Preview</p>
              <div className="mt-3 space-y-3">
                {previewField?.fieldType === 'Checkbox' ? (
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" className="rounded border-slate-300" /> {previewField.label}</label>
                ) : previewField?.fieldType === 'Radio' ? (
                  <div className="space-y-2 text-sm text-slate-700">
                    <label className="flex items-center gap-2"><input type="radio" name="preview" /> {previewField.label}</label>
                    <label className="flex items-center gap-2"><input type="radio" name="preview" /> Option 2</label>
                  </div>
                ) : previewField?.fieldType === 'Dropdown' ? (
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <option>{previewField.label}</option>
                  </select>
                ) : previewField?.fieldType === 'Date' ? (
                  <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
                ) : previewField?.fieldType === 'Email' ? (
                  <input type="email" placeholder={previewField.label} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
                ) : previewField?.fieldType === 'Phone' ? (
                  <input type="tel" placeholder={previewField.label} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
                ) : previewField?.fieldType === 'Textarea' ? (
                  <textarea rows="3" placeholder={previewField.label} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
                ) : previewField?.fieldType === 'File Upload' ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">{previewField.label}</div>
                ) : (
                  <input type="text" placeholder={previewField.label} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
                )}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{previewField?.description || 'Select a field to preview the admission form appearance.'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Field Name</th>
                  <th className="px-3 py-3">Label</th>
                  <th className="px-3 py-3">Section</th>
                  <th className="px-3 py-3">Field Type</th>
                  <th className="px-3 py-3">Mandatory</th>
                  <th className="px-3 py-3">Visible</th>
                  <th className="px-3 py-3">Default Value</th>
                  <th className="px-3 py-3">Validation</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFields.map((field, index) => (
                  <tr
                    key={field.id}
                    draggable
                    onDragStart={() => setDraggedFieldId(field.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (draggedFieldId) {
                        moveField(draggedFieldId, field.id);
                        setDraggedFieldId(null);
                      }
                    }}
                    onDragEnd={() => setDraggedFieldId(null)}
                    onClick={() => handlePreview(field)}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-3 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2"><GripVertical className="h-4 w-4 text-slate-400" /> {field.name}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{field.label}</td>
                    <td className="px-3 py-3 text-slate-700">{field.section}</td>
                    <td className="px-3 py-3 text-slate-700">{field.fieldType}</td>
                    <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${field.mandatory ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{field.mandatory ? 'Yes' : 'No'}</span></td>
                    <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${field.visible ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'}`}>{field.visible ? 'Yes' : 'No'}</span></td>
                    <td className="px-3 py-3 text-slate-700">{field.defaultValue || '—'}</td>
                    <td className="px-3 py-3 text-slate-700">{field.validation}</td>
                    <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(field.status)}`}>{field.status}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover-gradient-border" aria-label="Preview field"><Eye className="h-4 w-4" /></button>
                        <button type="button" onClick={() => openModal(field)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover-gradient-border" aria-label="Edit field"><UserRound className="h-4 w-4" /></button>
                        <button type="button" onClick={() => handleDelete(field.id)} className="rounded-full border border-slate-200 bg-white p-2 text-rose-600 transition hover-gradient-border" aria-label="Delete field"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Add Student Field</h3>
                <p className="mt-1 text-sm text-slate-600">Create a new field for student registration and admission forms.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Field Label</span>
                <input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border" placeholder="Enter field label" required />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Field Name</span>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border" placeholder="Enter field name" required />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Section</span>
                <select value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border">
                  {sectionOptions.filter((option) => option !== 'All Sections').map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Field Type</span>
                <select value={form.fieldType} onChange={(event) => setForm({ ...form, fieldType: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border">
                  {typeOptions.filter((option) => option !== 'All Types').map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Placeholder</span>
                <input value={form.placeholder} onChange={(event) => setForm({ ...form, placeholder: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border" placeholder="Enter placeholder" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Default Value</span>
                <input value={form.defaultValue} onChange={(event) => setForm({ ...form, defaultValue: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border" placeholder="Default value" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Validation Rule</span>
                <input value={form.validationRule} onChange={(event) => setForm({ ...form, validationRule: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border" placeholder="Required / Optional / Email" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border">
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.mandatory} onChange={(event) => setForm({ ...form, mandatory: event.target.checked })} /> Mandatory
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.visible} onChange={(event) => setForm({ ...form, visible: event.target.checked })} /> Visible
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.readOnly} onChange={(event) => setForm({ ...form, readOnly: event.target.checked })} /> Read Only
              </label>
              <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                <span className="mb-2 block">Description</span>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border" placeholder="Describe the purpose of this field" />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">Save Field</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
