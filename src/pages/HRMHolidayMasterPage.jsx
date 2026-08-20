import { useMemo, useState } from 'react';
import { CalendarDays, Eye, FileDown, Pencil, Plus, RotateCcw, Search, Trash2, Upload } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import { createHoliday, deleteHoliday, listHolidays, updateHoliday } from '../services/holidayService.js';

const emptyForm = { title: '', date: '', type: 'Public', status: 'Active' };
const pageSize = 10;

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDay = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-US', { weekday: 'long' });
};

export default function HRMHolidayMasterPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { data: holidaysData, isLoading } = useQuery({ queryKey: ['holidays', 'master'], queryFn: () => listHolidays({ page: 1, pageSize: 100 }) });
  const holidays = useMemo(() => holidaysData?.items || [], [holidaysData]);

  const years = useMemo(() => [...new Set(holidays.map((holiday) => new Date(holiday.date).getFullYear()).filter(Number.isFinite))].sort((a, b) => b - a), [holidays]);
  const filteredHolidays = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return holidays.filter((holiday) => {
      const holidayYear = new Date(holiday.date).getFullYear();
      const matchesSearch = !query || [holiday.title, holiday.type, holiday.status].filter(Boolean).join(' ').toLowerCase().includes(query);
      const matchesDate = !dateFilter || holiday.date === dateFilter;
      const matchesType = typeFilter === 'All' || (holiday.type || 'Public') === typeFilter;
      const matchesYear = yearFilter === 'All' || String(holidayYear) === yearFilter;
      const matchesStatus = statusFilter === 'All' || (holiday.status || 'Active') === statusFilter;
      return matchesSearch && matchesDate && matchesType && matchesYear && matchesStatus;
    }).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  }, [holidays, searchTerm, dateFilter, typeFilter, yearFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHolidays.length / pageSize));
  const visibleHolidays = filteredHolidays.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setTypeFilter('All');
    setYearFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const openCreate = () => {
    setEditingHoliday(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (holiday) => {
    setEditingHoliday(holiday);
    setForm({ title: holiday.title || '', date: holiday.date || '', type: holiday.type || 'Public', status: holiday.status || 'Active' });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingHoliday(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.date) return;
    const payload = { ...form, title: form.title.trim() };
    setIsSaving(true);
    try {
      if (editingHoliday?.id) {
        await updateHoliday(editingHoliday.id, payload);
      } else {
        await createHoliday(payload);
      }
      await queryClient.invalidateQueries({ queryKey: ['holidays', 'master'] });
      closeForm();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (holiday) => {
    if (!holiday?.id || !window.confirm(`Delete holiday "${holiday.title}"?`)) return;
    await deleteHoliday(holiday.id);
    await queryClient.invalidateQueries({ queryKey: ['holidays', 'master'] });
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsUploading(true);
    try {
      const text = await file.text();
      const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const headers = headerLine.split(',').map((header) => header.trim().toLowerCase());
      const rows = lines.map((line) => line.split(',').map((value) => value.trim())).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
      for (const row of rows) {
        const title = row.title || row.name || row['holiday name'];
        const date = row.date || row['holiday date'];
        if (title && date) await createHoliday({ title, date, type: row.type || row['holiday type'] || 'Public', status: row.status || 'Active' });
      }
      await queryClient.invalidateQueries({ queryKey: ['holidays', 'master'] });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 flex items-center gap-3">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Holiday Master' }]} />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">HRM Master</p>
              <h1 className="mt-1 text-[16px] font-medium tracking-tight text-slate-900">HRM Holiday Master</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button>
              <label htmlFor="holiday-upload-file" className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 ${isUploading ? 'opacity-60' : ''}`}><Upload className="h-3.5 w-3.5" /> {isUploading ? 'Uploading...' : 'Upload'}<input id="holiday-upload-file" name="holiday_upload_file" type="file" accept=".csv,text/csv" onChange={handleUpload} disabled={isUploading} className="hidden" /></label>
              <button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" /> Add New Holiday</button>
            </div>
          </div>
        </div>

        <section className="mb-5 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-800"><Search className="h-3.5 w-3.5" /> Filters &amp; Search</div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
            <label htmlFor="holiday-search" className="text-[10px] font-semibold text-slate-600">Holiday Name<input id="holiday-search" name="holiday_search" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Search holiday name..." className="mt-1 h-[20px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400" /></label>
            <label htmlFor="holiday-date-filter" className="text-[10px] font-semibold text-slate-600">Holiday Date<input id="holiday-date-filter" name="holiday_date_filter" type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400" /></label>
            <label htmlFor="holiday-type-filter" className="text-[10px] font-semibold text-slate-600">Holiday Type<select id="holiday-type-filter" name="holiday_type_filter" value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400"><option>All</option><option>Public</option><option>Festival</option><option>Optional</option></select></label>
            <label htmlFor="holiday-year-filter" className="text-[10px] font-semibold text-slate-600">Year<select id="holiday-year-filter" name="holiday_year_filter" value={yearFilter} onChange={(event) => { setYearFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400"><option value="All">All</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
            <label htmlFor="holiday-status-filter" className="text-[10px] font-semibold text-slate-600">Status<select id="holiday-status-filter" name="holiday_status_filter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] font-normal text-slate-700 outline-none focus:border-emerald-400"><option>All</option><option>Active</option><option>Inactive</option></select></label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setCurrentPage(1)} className="inline-flex items-center gap-1 rounded-lg bg-[#0f5132] px-3 py-1.5 text-[10px] font-semibold text-white"><Search className="h-3 w-3" /> Search</button>
            <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><RotateCcw className="h-3 w-3" /> Reset</button>
          </div>
        </section>

        <section className="flex-1 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><CalendarDays className="h-3.5 w-3.5" /> Holiday List</div><span className="text-[10px] text-slate-500">Showing {visibleHolidays.length} of {filteredHolidays.length} entries</span></div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-center text-[10px]">
              <colgroup><col style={{ width: '100px' }} /></colgroup>
              <thead><tr className="bg-[#0f5132] text-white"><th className="border-r border-[#195f46] px-3 py-2.5 text-center font-semibold">S.No.</th><th className="border-r border-[#195f46] px-3 py-2.5 font-semibold">Holiday Name</th><th className="border-r border-[#195f46] px-3 py-2.5 font-semibold">Holiday Date</th><th className="border-r border-[#195f46] px-3 py-2.5 font-semibold">Day</th><th className="border-r border-[#195f46] px-3 py-2.5 font-semibold">Holiday Type</th><th className="border-r border-[#195f46] px-3 py-2.5 font-semibold">Year</th><th className="border-r border-[#195f46] px-3 py-2.5 font-semibold">Created On</th><th className="border-r border-[#195f46] px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 text-center font-semibold">Actions</th></tr></thead>
              <tbody>{isLoading ? <tr><td colSpan="9" className="py-12 text-center text-slate-500">Loading holidays...</td></tr> : visibleHolidays.length === 0 ? <tr><td colSpan="9" className="py-12 text-center text-slate-500">No holidays found.</td></tr> : visibleHolidays.map((holiday, index) => <tr key={holiday.id} className="border-b border-slate-200 text-slate-700 odd:bg-slate-50/50 hover:bg-emerald-50/30"><td className="px-3 py-2 text-center">{(currentPage - 1) * pageSize + index + 1}</td><td className="px-3 py-2 font-semibold text-slate-900">{holiday.title || '-'}</td><td className="px-3 py-2">{formatDate(holiday.date)}</td><td className="px-3 py-2">{getDay(holiday.date)}</td><td className="px-3 py-2">{holiday.type || 'Public'}</td><td className="px-3 py-2">{new Date(holiday.date).getFullYear() || '-'}</td><td className="px-3 py-2">{formatDate(holiday.created_at || holiday.createdAt)}</td><td className="px-3 py-2"><span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">{holiday.status || 'Active'}</span></td><td className="px-3 py-2"><div className="flex justify-center gap-1"><button type="button" onClick={() => { setSelectedHoliday(holiday); setIsViewOpen(true); }} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100" title="View"><Eye className="h-3 w-3" /></button><button type="button" onClick={() => openEdit(holiday)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" title="Edit"><Pencil className="h-3 w-3" /></button><button type="button" onClick={() => handleDelete(holiday)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-200 px-3 py-3 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>Showing {filteredHolidays.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredHolidays.length)} of {filteredHolidays.length} entries</span><div className="flex items-center gap-1"><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((page) => <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`rounded-md border px-2.5 py-1 ${page === currentPage ? 'border-[#0f5132] bg-[#0f5132] text-white' : 'border-slate-200 bg-white'}`}>{page}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Next</button></div></div>
        </section>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={editingHoliday ? 'Edit Holiday' : 'Add New Holiday'} footer={<div className="flex justify-end gap-2"><button type="button" onClick={closeForm} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs">Cancel</button><button type="submit" form="holiday-form" disabled={isSaving} className="rounded-lg bg-[#0f5132] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">{isSaving ? 'Saving...' : editingHoliday ? 'Save Changes' : 'Add Holiday'}</button></div>}><form id="holiday-form" onSubmit={handleSubmit} className="space-y-3"><label className="block text-[10px] font-semibold text-slate-600">Holiday Name<input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-[10px] font-semibold text-slate-600">Holiday Date<input required type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="block text-[10px] font-semibold text-slate-600">Holiday Type<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Public</option><option>Festival</option><option>Optional</option></select></label></div><label className="block text-[10px] font-semibold text-slate-600">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1 h-[20px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Active</option><option>Inactive</option></select></label></form></Modal>
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Holiday Details" footer={<button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-[#0f5132] px-3 py-1.5 text-xs font-semibold text-white">Close</button>}>{selectedHoliday && <div className="grid gap-3 text-xs text-slate-700"><p><strong>Holiday Name:</strong> {selectedHoliday.title}</p><p><strong>Date:</strong> {formatDate(selectedHoliday.date)}</p><p><strong>Day:</strong> {getDay(selectedHoliday.date)}</p><p><strong>Type:</strong> {selectedHoliday.type || 'Public'}</p><p><strong>Status:</strong> {selectedHoliday.status || 'Active'}</p></div>}</Modal>
    </div>
  );
}
