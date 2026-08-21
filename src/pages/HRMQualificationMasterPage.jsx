import { useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  BookOpenCheck,
  Download,
  Eye,
  FileDown,
  GraduationCap,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import { createQualification, deleteQualification, listQualifications, resetQualifications, updateQualification } from '../services/qualificationService.js';
import { toast } from '../utils/toast.js';

const emptyForm = { name: '', level: 'UG', status: 'Active' };
const pageSize = 8;

export default function HRMQualificationMasterPage() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const fileInputRef = useRef(null);

  const { data: qualificationsData, isLoading } = useQuery({
    queryKey: ['qualifications', 'master'],
    queryFn: () => listQualifications({ page: 1, pageSize: 200 }),
  });

  const qualifications = useMemo(() => qualificationsData?.items || [], [qualificationsData]);

  const filteredQualifications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const sorted = [...qualifications].filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesSearch = !query || [item.name, item.level, item.status].join(' ').toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });

    sorted.sort((a, b) => {
      const left = a[sortBy] || '';
      const right = b[sortBy] || '';
      const comparison = String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [qualifications, searchTerm, statusFilter, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredQualifications.length / pageSize));
  const visibleQualifications = filteredQualifications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCount = qualifications.filter((item) => item.status === 'Active').length;
  const inactiveCount = qualifications.filter((item) => item.status === 'Inactive').length;

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSortBy('name');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (qualification) => {
    setEditingId(qualification.id);
    setFormData({ name: qualification.name, level: qualification.level, status: qualification.status });
    setIsModalOpen(true);
  };

  const openViewModal = (qualification) => {
    setSelectedQualification(qualification);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  };

  const handleCloseViewModal = () => {
    setSelectedQualification(null);
    setIsViewModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = formData.name.trim();
    if (!name) return;

    setIsSaving(true);
    try {
      const payload = { ...formData, name, status: formData.status || 'Active' };

      if (editingId) {
        await updateQualification(editingId, payload);
      } else {
        await createQualification(payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['qualifications', 'master'] });
      handleCloseModal();
      setCurrentPage(1);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const item = qualifications.find((qualification) => qualification.id === id);
    if (!item) return;
    if (!window.confirm(`Delete qualification "${item.name}"?`)) return;

    await deleteQualification(id);
    await queryClient.invalidateQueries({ queryKey: ['qualifications', 'master'] });
    setCurrentPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetData = async () => {
    await resetQualifications();
    await queryClient.invalidateQueries({ queryKey: ['qualifications', 'master'] });
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = ['Qualification', 'Level', 'Status'];
    const rows = qualifications.map((item) => [item.name, item.level, item.status]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qualification-master.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text
        .split(/\r?\n/)
        .map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')))
        .filter((row) => row.some((cell) => cell));

      if (rows.length < 2) return;
      const headerMap = rows[0].map((header) => header.toLowerCase());
      const nameIndex = headerMap.findIndex((header) => ['qualification', 'qualification name', 'name'].includes(header));
      const levelIndex = headerMap.findIndex((header) => ['level', 'qualification level'].includes(header));
      const statusIndex = headerMap.findIndex((header) => ['status'].includes(header));

      const importedItems = rows.slice(1).flatMap((row) => {
        const name = row[nameIndex] || row[0];
        if (!name) return [];
        return [{
          id: Date.now() + Math.random(),
          name,
          level: row[levelIndex] || 'UG',
          status: row[statusIndex] || 'Active',
        }];
      });

      if (importedItems.length > 0) {
        for (const item of importedItems) {
          await createQualification(item);
        }
        await queryClient.invalidateQueries({ queryKey: ['qualifications', 'master'] });
        toast.success(`${importedItems.length} qualification${importedItems.length === 1 ? '' : 's'} imported successfully.`);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Unable to import the file. Please use a valid CSV with Qualification, Level, and Status columns.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Qualification Master' }]} />
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p>
              <h1 className="mt-1 text-[16px] font-medium tracking-tight text-slate-900">Qualification Master</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <FileDown className="h-3.5 w-3.5" />
                Print
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <Upload className="h-3.5 w-3.5" />
                Import
              </button>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button type="button" onClick={handleResetData} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Data
              </button>
              <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d432b]">
                <Plus className="h-3.5 w-3.5" />
                Add Qualification
              </button>
            </div>
          </div>
        </div>

        <section className="mb-5 grid gap-3 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <BookOpenCheck className="h-3.5 w-3.5 text-emerald-600" />
              Total
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{qualifications.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
              Active
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{activeCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Search className="h-3.5 w-3.5 text-emerald-600" />
              Inactive
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{inactiveCount}</div>
          </div>
        </section>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="text-[10px] font-semibold text-slate-600">
              Search
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search qualification"
                className="mt-1 h-[20px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-400"
              />
            </label>
            <label className="text-[10px] font-semibold text-slate-600">
              Status
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 h-[20px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-400"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            <label className="text-[10px] font-semibold text-slate-600">
              Sort By
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 h-[20px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-400"
              >
                <option value="name">Qualification</option>
                <option value="level">Level</option>
                <option value="status">Status</option>
              </select>
            </label>
            <label className="text-[10px] font-semibold text-slate-600">
              Order
              <button
                type="button"
                onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
                className="mt-1 inline-flex h-[20px] w-fit items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none hover:bg-slate-100 focus:border-emerald-400"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100">
              <RefreshCw className="h-3 w-3" />
              Reset Filters
            </button>
          </div>
        </section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <GraduationCap className="h-3.5 w-3.5" />
              Qualification List
            </div>
            <span className="text-[10px] text-slate-500">Showing {filteredQualifications.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[10px] text-slate-700">
              <thead>
                <tr className="bg-[#0f5132] text-white">
                  <th className="border-r border-[#195f46] px-3 py-2.5 text-center font-semibold">S.No.</th>
                  <th className="border-r border-[#195f46] px-3 py-2.5 font-semibold text-left">Qualification</th>
                  <th className="border-r border-[#195f46] px-3 py-2.5 font-semibold text-left">Level</th>
                  <th className="border-r border-[#195f46] px-3 py-2.5 font-semibold text-left">Status</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-500">
                      Loading qualifications...
                    </td>
                  </tr>
                ) : visibleQualifications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-500">
                      No qualification records found.
                    </td>
                  </tr>
                ) : (
                  visibleQualifications.map((qualification, index) => (
                    <tr key={qualification.id} className="border-b border-slate-200 odd:bg-slate-50/50 hover:bg-emerald-50/30">
                      <td className="px-3 py-2 text-center">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{qualification.name}</td>
                      <td className="px-3 py-2">{qualification.level}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${qualification.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {qualification.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-1">
                          <button type="button" onClick={() => openViewModal(qualification)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100" title="View">
                            <Eye className="h-3 w-3" />
                          </button>
                          <button type="button" onClick={() => openEditModal(qualification)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" title="Edit">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button type="button" onClick={() => handleDelete(qualification.id)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50" title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 px-3 py-3 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredQualifications.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredQualifications.length)} of {filteredQualifications.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Previous</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-md border px-2.5 py-1 ${page === currentPage ? 'border-[#0f5132] bg-[#0f5132] text-white' : 'border-slate-200 bg-white'}`}
                >
                  {page}
                </button>
              ))}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Qualification' : 'Add Qualification'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCloseModal} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" form="qualification-form" disabled={isSaving} className="rounded-lg bg-[#0f5132] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d432b] disabled:opacity-60">
              {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Qualification'}
            </button>
          </div>
        }
      >
        <form id="qualification-form" onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-[10px] font-semibold text-slate-600">
            Qualification Name
            <input
              required
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[10px] font-semibold text-slate-600">
              Level
              <select
                value={formData.level}
                onChange={(event) => setFormData((current) => ({ ...current, level: event.target.value }))}
                className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"
              >
                <option>School</option>
                <option>UG</option>
                <option>PG</option>
                <option>Research</option>
                <option>Professional</option>
              </select>
            </label>

            <label className="block text-[10px] font-semibold text-slate-600">
              Status
              <select
                value={formData.status}
                onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
                className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Qualification Details"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCloseViewModal} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100">Close</button>
          </div>
        }
      >
        {selectedQualification ? (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Qualification Name</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selectedQualification.name}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Level</div>
                <div className="mt-1 font-medium text-slate-900">{selectedQualification.level}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</div>
                <div className="mt-1">
                  <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${selectedQualification.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedQualification.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
