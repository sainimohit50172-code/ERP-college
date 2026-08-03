import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, Filter, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../hooks/useResourceHooks.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import ExportButton from '../components/ui/ExportButton.jsx';
import SearchableSelect from '../components/ui/SearchableSelect.jsx';

const sessionOptions = [
  { value: 'All', label: 'All Academic Sessions' },
  { value: '2025-26', label: '2025-26' },
  { value: '2026-27', label: '2026-27' },
  { value: '2027-28', label: '2027-28' },
];

const typeOptions = [
  { value: 'All', label: 'All Exam Types' },
  { value: 'End Term Examination', label: 'End Term Examination' },
  { value: 'Mid Term Examination', label: 'Mid Term Examination' },
  { value: 'Supplementary Examination', label: 'Supplementary Examination' },
  { value: 'Back Paper Examination', label: 'Back Paper Examination' },
  { value: 'Practical Examination', label: 'Practical Examination' },
];

const statusOptions = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const exportColumns = [
  'S.No',
  'Exam Name',
  'Academic Session',
  'Exam Type',
  'Exam Category',
  'Start Date',
  'End Date',
  'Status',
];

const defaultValues = {
  examName: '',
  academicSession: '2025-26',
  examType: 'End Term Examination',
  examCategory: 'Regular',
  startDate: '',
  endDate: '',
  description: '',
  status: 'Upcoming',
};

function normalizeText(value = '') {
  return String(value || '').trim();
}

export default function CoeExamCalendarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'examName', direction: 'asc' });
  const [refreshKey, setRefreshKey] = useState(0);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({ defaultValues });
  const { data: examData, isLoading } = useResourceList('examCalendars', { page: 1, pageSize: 200 });
  const createExam = useCreateResource('examCalendars');
  const updateExam = useUpdateResource('examCalendars');
  const deleteExam = useDeleteResource('examCalendars');
  const csvLink = useRef(null);

  const exams = examData?.items || [];

  const filteredExams = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return exams
      .filter((exam) => {
        if (sessionFilter !== 'All' && exam.academicSession !== sessionFilter) return false;
        if (typeFilter !== 'All' && exam.examType !== typeFilter) return false;
        if (statusFilter !== 'All' && exam.status !== statusFilter) return false;
        if (!normalizedSearch) return true;
        return [exam.examName, exam.academicSession, exam.examType, exam.examCategory, exam.createdBy]
          .some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
      })
      .sort((a, b) => {
        const aValue = String(a[sortConfig.key] || '').toLowerCase();
        const bValue = String(b[sortConfig.key] || '').toLowerCase();
        if (sortConfig.direction === 'asc') return aValue.localeCompare(bValue);
        return bValue.localeCompare(aValue);
      });
  }, [exams, searchTerm, sessionFilter, typeFilter, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));
  const visibleExams = filteredExams.slice((activePage - 1) * pageSize, activePage * pageSize);

  useEffect(() => {
    setActivePage(1);
  }, [searchTerm, sessionFilter, typeFilter, statusFilter, pageSize]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSessionFilter('All');
    setTypeFilter('All');
    setStatusFilter('All');
  };

  const openCreateModal = () => {
    setSelectedExam(null);
    reset(defaultValues);
    setIsAddModalOpen(true);
  };

  const openEditModal = (exam) => {
    setSelectedExam(exam);
    reset({
      examName: exam.examName,
      academicSession: exam.academicSession,
      examType: exam.examType,
      examCategory: exam.examCategory,
      startDate: exam.startDate,
      endDate: exam.endDate,
      description: exam.description,
      status: exam.status,
    });
    setIsAddModalOpen(true);
  };

  const openViewModal = (exam) => {
    setSelectedExam(exam);
    setIsViewModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedExam(null);
  };

  const handleDelete = async () => {
    if (!selectedExam) return;
    try {
      await deleteExam.mutateAsync(selectedExam.id);
      toast.success('Exam calendar entry deleted successfully.');
      setIsConfirmOpen(false);
      setSelectedExam(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error?.message || 'Unable to delete exam calendar entry.');
    }
  };

  const validateForm = (data) => {
    const trimmedName = normalizeText(data.examName);
    if (!trimmedName) {
      toast.error('Exam Name is required.');
      return false;
    }
    if (!data.academicSession) {
      toast.error('Academic Session is required.');
      return false;
    }
    if (!data.examType) {
      toast.error('Exam Type is required.');
      return false;
    }
    if (!data.startDate) {
      toast.error('Start Date is required.');
      return false;
    }
    if (!data.endDate) {
      toast.error('End Date is required.');
      return false;
    }
    if (new Date(data.endDate) < new Date(data.startDate)) {
      toast.error('End Date cannot be before Start Date.');
      return false;
    }
    const duplicate = exams.find((exam) =>
      exam.id !== selectedExam?.id &&
      normalizeText(exam.examName).toLowerCase() === trimmedName.toLowerCase() &&
      exam.academicSession === data.academicSession,
    );
    if (duplicate) {
      toast.error('Duplicate exam name is not allowed within the same academic session.');
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateForm(data)) return;
    const payload = {
      examName: normalizeText(data.examName),
      academicSession: data.academicSession,
      examType: data.examType,
      examCategory: normalizeText(data.examCategory),
      startDate: data.startDate,
      endDate: data.endDate,
      description: normalizeText(data.description),
      status: data.status,
      createdBy: selectedExam?.createdBy || 'System Administrator',
      createdDate: selectedExam?.createdDate || new Date().toISOString().slice(0, 10),
    };

    try {
      if (selectedExam) {
        await updateExam.mutateAsync({ id: selectedExam.id, payload });
        toast.success('Exam calendar updated successfully.');
      } else {
        await createExam.mutateAsync(payload);
        toast.success('Exam calendar entry added successfully.');
      }
      setIsAddModalOpen(false);
      setSelectedExam(null);
      reset(defaultValues);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error?.message || 'Unable to save exam calendar entry.');
    }
  };

  const exportRows = useMemo(() => filteredExams.map((exam, index) => ([
    index + 1,
    exam.examName,
    exam.academicSession,
    exam.examType,
    exam.examCategory,
    exam.startDate,
    exam.endDate,
    exam.status,
  ])), [filteredExams]);

  const csvExportData = useMemo(() => [exportColumns, ...exportRows], [exportRows]);

  const handleExportExcel = () => {
    if (!filteredExams.length) {
      toast.info('No data available to export.');
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ['Exam Calendar Report'],
      [],
      exportColumns,
      ...exportRows,
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Calendar');

    XLSX.writeFile(workbook, `Exam_Calendar_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportCsv = () => {
    if (!filteredExams.length) {
      toast.info('No data available to export.');
      return;
    }
    if (csvLink.current) {
      csvLink.current.link.click();
    }
  };

  const handleExportPdf = () => {
    if (!filteredExams.length) {
      toast.info('No data available to export.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const now = new Date();
    const generatedDate = now.toLocaleDateString('en-GB');
    const generatedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const totalRecords = filteredExams.length;

    const headerHeight = 100;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Haridwar University', 40, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('COE Department', 40, 62);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Calendar Report', 40, 82);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated Date: ${generatedDate}`, 40, 102);
    doc.text(`Generated Time: ${generatedTime}`, 200, 102);
    doc.text(`Total Records: ${totalRecords}`, 380, 102);

    doc.autoTable({
      head: [exportColumns],
      body: exportRows,
      startY: 120,
      theme: 'striped',
      headStyles: { fillColor: [22, 101, 52], textColor: 255, halign: 'center' },
      styles: { fontSize: 10, cellPadding: 6, halign: 'left' },
      margin: { left: 40, right: 40, top: 40, bottom: 40 },
      didDrawPage: () => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        const pageText = `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`;
        doc.text(pageText, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 20);
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 160 },
        2: { cellWidth: 110 },
        3: { cellWidth: 140 },
        4: { cellWidth: 100 },
        5: { cellWidth: 90 },
        6: { cellWidth: 90 },
        7: { cellWidth: 80 },
      },
    });

    doc.save('Exam_Calendar_Report.pdf');
  };

  const handlePrint = () => {
    if (!filteredExams.length) {
      toast.info('No data available to export.');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-6 shadow-sm">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Exam Calendar' }]} />
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">COE Master</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Exam Calendar</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-500">Manage Examination Calendar</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <Plus className="h-4 w-4" /> Add Exam Calendar
            </button>
            <div className="hidden sm:block">
              <ExportButton
                onExcel={handleExportExcel}
                onCsv={handleExportCsv}
                onPdf={handleExportPdf}
                onPrint={handlePrint}
              />
            </div>
          </div>
        </div>
      </div>
      <CSVLink data={csvExportData} filename="Exam_Calendar.csv" className="hidden" ref={csvLink} target="_blank" />

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Exam Calendar</h2>
            <p className="mt-1 text-sm text-slate-500">Search, filter, and manage examination calendar entries with full preview and action controls.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full min-w-[240px] sm:w-auto">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search Exam Calendar..."
                className="w-full rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                aria-label="Search Exam Calendar"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">Search</span>
            </div>
            <button type="button" onClick={() => setSessionFilter('All')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Academic Session</label>
            <SearchableSelect options={sessionOptions} value={sessionFilter} onChange={setSessionFilter} placeholder="Select session" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Exam Type</label>
            <SearchableSelect options={typeOptions} value={typeFilter} onChange={setTypeFilter} placeholder="Select exam type" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</label>
            <SearchableSelect options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Select status" />
          </div>
          <div className="flex items-end gap-3">
            <button type="button" onClick={clearFilters} className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <X className="h-4 w-4" /> Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200/70 bg-slate-50 p-1">
          <table className="min-w-[960px] w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 text-left">S.No</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Exam Name</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Academic Session</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Exam Type</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Start Date</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">End Date</th>
                <th className="whitespace-nowrap px-4 py-4 text-left">Status</th>
                <th className="whitespace-nowrap px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {visibleExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">No exam calendar records found. Adjust the filters or add a new exam calendar entry.</td>
                </tr>
              ) : visibleExams.map((exam, index) => (
                <tr key={exam.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold text-slate-900">{(activePage - 1) * pageSize + index + 1}</td>
                  <td className="px-4 py-4">{exam.examName}</td>
                  <td className="px-4 py-4">{exam.academicSession}</td>
                  <td className="px-4 py-4">{exam.examType}</td>
                  <td className="px-4 py-4">{exam.startDate}</td>
                  <td className="px-4 py-4">{exam.endDate}</td>
                  <td className="px-4 py-4"><StatusBadge status={exam.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button type="button" onClick={() => openViewModal(exam)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100" aria-label="View exam calendar">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => openEditModal(exam)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100" aria-label="Edit exam calendar">
                        <Plus className="h-4 w-4 rotate-45" />
                      </button>
                      <button type="button" onClick={() => { setSelectedExam(exam); setIsConfirmOpen(true); }} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:border-rose-300 hover:bg-rose-100" aria-label="Delete exam calendar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>Items per page</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              {[10, 20, 30].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>{`Showing ${visibleExams.length} of ${filteredExams.length} records`}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => setActivePage((page) => Math.max(page - 1, 1))}
                className="inline-flex h-10 items-center justify-center rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-700">Page {activePage} of {totalPages}</span>
              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => setActivePage((page) => Math.min(page + 1, totalPages))}
                className="inline-flex h-10 items-center justify-center rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={selectedExam ? 'Edit Exam Calendar' : 'Add Exam Calendar'}
        isOpen={isAddModalOpen}
        onClose={closeModals}
        footer={(
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => { reset(defaultValues); if (selectedExam) openEditModal(selectedExam); }}>
              Reset
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setIsAddModalOpen(false); setSelectedExam(null); reset(defaultValues); }}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleSubmit(onSubmit)}>
              {selectedExam ? 'Update' : 'Save'}
            </Button>
            {!selectedExam && (
              <Button type="button" variant="success" onClick={() => handleSubmit(async (data) => {
                await onSubmit(data);
                reset(defaultValues);
                setIsAddModalOpen(true);
              })}>
                Save & New
              </Button>
            )}
          </div>
        )}
      >
        <form className="grid gap-4 lg:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Academic Session *</label>
          <select {...register('academicSession', { required: true })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
            {sessionOptions.slice(1).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <label className="block text-sm font-medium text-slate-700">Exam Name *</label>
          <input {...register('examName', { required: true, setValueAs: (val) => normalizeText(val) })} type="text" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          <label className="block text-sm font-medium text-slate-700">Exam Type *</label>
          <select {...register('examType', { required: true })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
            {typeOptions.slice(1).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <label className="block text-sm font-medium text-slate-700">Exam Category</label>
          <input {...register('examCategory', { setValueAs: (val) => normalizeText(val) })} type="text" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          <label className="block text-sm font-medium text-slate-700">Start Date *</label>
          <input {...register('startDate', { required: true })} type="date" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          <label className="block text-sm font-medium text-slate-700">End Date *</label>
          <input {...register('endDate', { required: true })} type="date" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea {...register('description', { setValueAs: (val) => normalizeText(val) })} rows={4} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select {...register('status', { required: true })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
            {statusOptions.slice(1).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </form>
      </Modal>

      <Modal title="View Exam Calendar" isOpen={isViewModalOpen} onClose={closeModals} footer={<Button variant="secondary" onClick={closeModals}>Close</Button>}>
        {selectedExam ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Exam Name</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{selectedExam.examName}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Academic Session</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{selectedExam.academicSession}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Exam Type</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{selectedExam.examType}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
              <div className="mt-2"><StatusBadge status={selectedExam.status} /></div>
            </div>
            <div className="sm:col-span-2 rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Description</p>
              <p className="mt-2 text-sm text-slate-700">{selectedExam.description || 'Not specified'}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Start Date</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{selectedExam.startDate}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">End Date</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{selectedExam.endDate}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Created By</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{selectedExam.createdBy}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Created Date</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{selectedExam.createdDate}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 p-6 text-center text-slate-500">No exam selected.</div>
        )}
      </Modal>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete exam calendar entry"
        description="Are you sure you want to delete this exam calendar entry? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
