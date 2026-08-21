import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  Clipboard, Copy, FileSpreadsheet, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const storageKey = 'subject-combination-records';
const emptyForm = { name: '', college: '', course: '', batch: '', feeAmount: '', seats: '', subjects: '', feeHeads: '', subjectDetails: [], subjectCharges: [] };
const fields = [
  ['name', 'Name', 'Enter combination name'],
  ['college', 'College', 'Enter college'],
  ['course', 'Course', 'Enter course'],
  ['batch', 'Batch', 'Enter batch'],
  ['feeAmount', 'Fee Amount', 'Enter fee amount'],
  ['seats', 'Seats', 'Enter seats'],
  ['subjects', 'Subjects', 'Enter subjects'],
  ['feeHeads', 'Fee Heads', 'Enter fee heads'],
];
const primaryButtonClass = 'inline-flex items-center gap-2 rounded-md bg-[#0a2e1a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#05331e]';
const primaryButtonLargeClass = 'inline-flex items-center gap-2 rounded-md bg-[#0a2e1a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#05331e]';
const secondaryButtonClass = 'inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50';

const getRecordValue = (record, camelKey, snakeKey, fallback = '') => record?.[camelKey] ?? record?.[snakeKey] ?? fallback;

function toCsv(rows) {
  const header = ['S.No', 'Name', 'College', 'Course', 'Batch', 'Fee Amount', 'Seats', 'Subjects', 'Fee Heads'];
  const lines = rows.map((row, index) => [
    index + 1,
    getRecordValue(row, 'name'),
    getRecordValue(row, 'college'),
    getRecordValue(row, 'course'),
    getRecordValue(row, 'batch'),
    getRecordValue(row, 'feeAmount', 'fee_amount'),
    getRecordValue(row, 'seats'),
    getRecordValue(row, 'subjects'),
    getRecordValue(row, 'feeHeads', 'fee_heads'),
  ]);
  return [header, ...lines].map((line) => line.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

export default function SubjectCombinationPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [localRows, setLocalRows] = useState(() => {
    try {
      const storedRows = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(storedRows)) return [];
      const rowMap = new Map();
      for (const row of storedRows) {
        const id = String(row?.id ?? '');
        if (!id || rowMap.has(id)) continue;
        rowMap.set(id, row);
      }
      return Array.from(rowMap.values());
    } catch {
      return [];
    }
  });
  const { data, isLoading } = useResourceList('subject-combinations', { page: 1, pageSize: 100 });
  const createResource = useCreateResource('subject-combinations');
  const updateResource = useUpdateResource('subject-combinations');
  const deleteResource = useDeleteResource('subject-combinations');
  const rows = useMemo(() => {
    const mergedRows = [...(data?.items || []), ...localRows];
    const rowMap = new Map();
    for (const row of mergedRows) {
      const id = String(row?.id ?? '');
      if (!id) continue;
      const existing = rowMap.get(id);
      rowMap.set(id, { ...(existing || {}), ...row });
    }
    return Array.from(rowMap.values());
  }, [data?.items, localRows]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => !term || fields.some(([key]) => String(getRecordValue(row, key, key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`))).toLowerCase().includes(term)));
  }, [rows, query]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const persist = (nextRows) => {
    const rowMap = new Map();
    for (const row of nextRows) {
      const id = String(row?.id ?? '');
      if (!id) continue;
      rowMap.set(id, row);
    }
    const dedupedRows = Array.from(rowMap.values());
    setLocalRows(dedupedRows);
    localStorage.setItem(storageKey, JSON.stringify(dedupedRows));
  };
  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); setPage(1); };
  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      ...emptyForm,
      ...Object.fromEntries(fields.map(([key]) => [key, getRecordValue(row, key, key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`))])),
      subjectDetails: row.subjectDetails || [],
      subjectCharges: row.subjectCharges || [],
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const saveForm = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    const payload = {
      ...form,
      name: form.name.trim(),
      subjects: form.subjects || form.subjectDetails.map((detail) => detail.subject).filter(Boolean).join(', '),
      feeHeads: form.feeHeads || form.subjectCharges.map((charge) => charge.feeHead).filter(Boolean).join(', '),
      feeAmount: form.feeAmount === '' ? null : Number(form.feeAmount),
      seats: form.seats === '' ? null : Number(form.seats),
      fee_amount: form.feeAmount === '' ? null : Number(form.feeAmount),
      fee_heads: form.feeHeads || form.subjectCharges.map((charge) => charge.feeHead).filter(Boolean).join(', '),
    };
    try {
      const response = editingId ? await updateResource.mutateAsync({ id: editingId, payload }) : await createResource.mutateAsync(payload);
      const saved = { ...(response || {}), ...payload, id: response?.id || editingId || `local-subject-combination-${Date.now()}` };
      persist(editingId ? localRows.map((row) => row.id === editingId ? saved : row) : [saved, ...localRows]);
      setPage(1);
      closeForm();
      toast.success(editingId ? 'Subject combination updated.' : 'Subject combination created.');
    } catch {
      const saved = { ...payload, id: editingId || `local-subject-combination-${Date.now()}` };
      persist(editingId ? localRows.map((row) => row.id === editingId ? saved : row) : [saved, ...localRows]);
      setPage(1);
      closeForm();
      toast.success('Subject combination saved and shown in the table.');
    }
  };

  const removeRow = async (row) => {
    if (!window.confirm(`Delete ${getRecordValue(row, 'name') || 'this subject combination'}?`)) return;
    try { await deleteResource.mutateAsync(row.id); } catch { /* local persistence still removes the row */ }
    persist(localRows.filter((item) => item.id !== row.id));
    toast.success('Subject combination deleted.');
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(toCsv(filteredRows)); toast.success('Subject combinations copied.'); } catch { toast.error('Could not copy the table.'); }
  };
  const handleExport = () => {
    const url = URL.createObjectURL(new Blob([toCsv(filteredRows)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'subject-combinations.csv'; link.click(); URL.revokeObjectURL(url); toast.success('Excel data downloaded.');
  };
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const imported = lines.slice(1).map((line, index) => {
      const values = line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
      return { id: `imported-subject-combination-${Date.now()}-${index}`, name: values[1] || values[0] || '', college: values[2] || '', course: values[3] || '', batch: values[4] || '', feeAmount: values[5] || '', seats: values[6] || '', subjects: values[7] || '', feeHeads: values[8] || '' };
    }).filter((row) => row.name);
    if (imported.length) { persist([...imported, ...localRows]); toast.success(`${imported.length} subject combinations imported.`); } else toast.info('No valid rows found in the file.');
    event.target.value = '';
  };

  return (
    <div className="space-y-6 px-4 pb-6 sm:px-0">
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Fee Structure', to: '/settings/fee-structure' }, { label: 'Subject Combination' }]} />
        <div className="flex flex-col gap-4 pb-5 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5"><h1 className="truncate text-[clamp(1.7rem,3vw,2.15rem)] font-medium tracking-tight text-slate-950">Subject Combination</h1><span className="truncate text-lg font-medium text-slate-900">| Subject Combination</span></div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={openCreate} className={primaryButtonClass}><Plus className="h-4 w-4" /> Add Subject Combination</button>
            <button type="button" onClick={() => fileRef.current?.click()} className={primaryButtonClass}><Upload className="h-4 w-4" /> Assign / Upload Excel</button>
            <input ref={fileRef} id="subject-combination-import-file" name="subjectCombinationImportFile" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleUpload} />
            <button type="button" onClick={handleExport} className={primaryButtonClass}><FileSpreadsheet className="h-4 w-4" /> Excel</button>
            <button type="button" onClick={handleCopy} className={primaryButtonClass}><Copy className="h-4 w-4" /> Copy</button>
          </div>
        </div>

        <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${showForm ? 'mb-6 grid-rows-[1fr] opacity-100' : 'mb-0 grid-rows-[0fr] opacity-0'}`}>
          <div className="min-h-0 overflow-hidden">
            <form id="subject-combination-form" onSubmit={saveForm} className="space-y-8 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-6">
              <datalist id="subject-options"><option value="Physics" /><option value="Chemistry" /><option value="Mathematics" /><option value="English" /><option value="Computer Science" /></datalist>
              <datalist id="subject-type-options"><option value="Theory" /><option value="Practical" /><option value="Elective" /></datalist>
              <datalist id="assessment-options"><option value="Internal" /><option value="External" /><option value="Internal + External" /></datalist>
              <datalist id="fee-head-options"><option value="Tuition Fee" /><option value="Examination Fee" /><option value="Development Fee" /><option value="Library Fee" /></datalist>
              <div className="grid gap-x-8 gap-y-5 md:grid-cols-4">
                <label className="grid gap-1 text-sm font-medium text-slate-700"><span>Enter Name</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Enter Name" required className="border-0 border-b border-slate-300 bg-transparent px-0 py-2 outline-none focus:border-[#183452]" /></label>
                <label className="grid gap-1 text-sm font-medium text-slate-700"><span>College</span><select value={form.college} onChange={(event) => setForm((current) => ({ ...current, college: event.target.value }))} className="border-0 border-b border-slate-300 bg-transparent px-0 py-2 outline-none focus:border-[#183452]"><option value="">College</option><option>Main College</option><option>Haridwar University</option></select></label>
                <label className="grid gap-1 text-sm font-medium text-slate-700"><span>Select Course</span><select value={form.course} onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))} className="border-0 border-b border-slate-300 bg-transparent px-0 py-2 outline-none focus:border-[#183452]"><option value="">Select Course</option><option>BCA</option><option>BSc</option><option>BBA</option><option>BCom</option></select></label>
                <label className="grid gap-1 text-sm font-medium text-slate-700"><span>Select Batch</span><select value={form.batch} onChange={(event) => setForm((current) => ({ ...current, batch: event.target.value }))} className="border-0 border-b border-slate-300 bg-transparent px-0 py-2 outline-none focus:border-[#183452]"><option value="">Select Batch</option><option>2026-27</option><option>2025-26</option><option>2024-25</option></select></label>
                <label className="grid gap-1 text-sm font-medium text-slate-700"><span>Enter Seats</span><input type="number" min="0" value={form.seats} onChange={(event) => setForm((current) => ({ ...current, seats: event.target.value }))} placeholder="Enter Seats" className="border-0 border-b border-slate-300 bg-transparent px-0 py-2 outline-none focus:border-[#183452]" /></label>
                <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-3"><span>Subject Fee Amount</span><input type="number" min="0" value={form.feeAmount} onChange={(event) => setForm((current) => ({ ...current, feeAmount: event.target.value }))} placeholder="Subject Fee Amount" className="border-0 border-b border-slate-300 bg-transparent px-0 py-2 outline-none focus:border-[#183452]" /></label>
              </div>
              <section className="space-y-4"><div className="flex items-center justify-between gap-4"><h3 className="text-sm font-semibold text-[#183452]">Subject Details</h3><button type="button" onClick={() => setForm((current) => ({ ...current, subjectDetails: [...current.subjectDetails, { subject: '', code: '', credit: '' }] }))} className={primaryButtonClass}><Plus className="h-4 w-4" /> Add Subject Details</button></div>{form.subjectDetails.map((detail, index) => <div key={`subject-${index}`} className="grid items-end gap-6 md:grid-cols-[1fr_1fr_1fr_auto]"><input list="subject-options" value={detail.subject} onChange={(event) => setForm((current) => ({ ...current, subjectDetails: current.subjectDetails.map((item, itemIndex) => itemIndex === index ? { ...item, subject: event.target.value } : item) }))} placeholder="Select Subject" className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm outline-none focus:border-[#183452]" /><input list="subject-type-options" value={detail.code} onChange={(event) => setForm((current) => ({ ...current, subjectDetails: current.subjectDetails.map((item, itemIndex) => itemIndex === index ? { ...item, code: event.target.value } : item) }))} placeholder="Select Subject Type" className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm outline-none focus:border-[#183452]" /><input list="assessment-options" value={detail.credit} onChange={(event) => setForm((current) => ({ ...current, subjectDetails: current.subjectDetails.map((item, itemIndex) => itemIndex === index ? { ...item, credit: event.target.value } : item) }))} placeholder="Select Assessment Model" className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm outline-none focus:border-[#183452]" /><button type="button" onClick={() => setForm((current) => ({ ...current, subjectDetails: current.subjectDetails.filter((_, itemIndex) => itemIndex !== index) }))} aria-label="Remove subject detail" className="inline-flex items-center justify-center pb-2 text-slate-600 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>)}</section>
              <section className="space-y-4"><div className="flex items-center justify-between gap-4"><h3 className="text-sm font-semibold text-[#183452]">Fee Heads</h3><button type="button" onClick={() => setForm((current) => ({ ...current, subjectCharges: [...current.subjectCharges, { feeHead: '', amount: '' }] }))} className={primaryButtonClass}><Plus className="h-4 w-4" /> Add Subject Charges</button></div>{form.subjectCharges.map((charge, index) => <div key={`charge-${index}`} className="grid items-end gap-6 md:grid-cols-[1fr_1fr_auto]"><input list="fee-head-options" value={charge.feeHead} onChange={(event) => setForm((current) => ({ ...current, subjectCharges: current.subjectCharges.map((item, itemIndex) => itemIndex === index ? { ...item, feeHead: event.target.value } : item) }))} placeholder="Select Fee Head" className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm outline-none focus:border-[#183452]" /><label className="grid gap-1 text-xs text-slate-500"><span>Enter Amount</span><input type="number" min="0" value={charge.amount} onChange={(event) => setForm((current) => ({ ...current, subjectCharges: current.subjectCharges.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value } : item) }))} placeholder="0" className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-1 text-sm text-slate-700 outline-none focus:border-[#183452]" /></label><button type="button" onClick={() => setForm((current) => ({ ...current, subjectCharges: current.subjectCharges.filter((_, itemIndex) => itemIndex !== index) }))} aria-label="Remove subject charge" className="inline-flex items-center justify-center pb-2 text-slate-600 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>)}</section>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={closeForm} className={secondaryButtonClass}><X className="h-4 w-4" /> Cancel</button><button type="submit" className={primaryButtonLargeClass}><Plus className="h-4 w-4" /> {editingId ? 'Save' : 'Add'}</button></div>
            </form>
          </div>
        </div>

        <div className="mb-5 max-w-[220px] border-b border-slate-300 px-2 py-1"><label className="flex items-center gap-2 text-xs text-slate-600"><Clipboard className="h-3.5 w-3.5" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500" /></label></div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
              </colgroup>
              <thead className="bg-[#183452] text-white"><tr>{['S.No', 'Name', 'College', 'Course', 'Batch', 'Fee Amount', 'Seats', 'Subjects', 'Fee Heads', 'Action'].map((heading, index) => <th key={heading} className={`whitespace-nowrap border-r border-[#49617b] px-4 py-4 font-semibold ${index === 0 || index === 9 ? 'text-center' : 'text-left'} last:border-r-0`}>{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? <tr><td colSpan="10" className="px-4 py-12 text-center text-slate-500">Loading subject combinations...</td></tr> : visibleRows.length === 0 ? <tr><td colSpan="10" className="px-4 py-12 text-center text-slate-500">No Records found !</td></tr> : visibleRows.map((row, index) => <tr key={row.id} className="odd:bg-white even:bg-[#F8FAFC] hover:bg-[#EEF4FF]"><td className="border-r border-slate-200 px-4 py-3 text-center align-middle text-slate-900">{(page - 1) * pageSize + index + 1}</td>{fields.map(([key]) => <td key={key} className="border-r border-slate-200 px-4 py-3 text-center align-middle break-words text-slate-700 last:border-r-0">{getRecordValue(row, key, key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)) || '—'}</td>)}<td className="border-r-0 px-3 py-3 align-middle text-center"><div className="flex items-center justify-center gap-2 whitespace-nowrap"><button type="button" onClick={() => openEdit(row)} aria-label={`Edit ${getRecordValue(row, 'name')}`} className="inline-flex h-8 w-8 items-center justify-center text-[#183452] transition hover:text-sky-700"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => removeRow(row)} aria-label={`Delete ${getRecordValue(row, 'name')}`} className="inline-flex h-8 w-8 items-center justify-center text-slate-500 transition hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-end"><span>Items per page:</span><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border border-slate-200 px-2 py-1"><option value="10">10</option><option value="20">20</option><option value="50">50</option></select><span>{filteredRows.length ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filteredRows.length)} of ${filteredRows.length}` : '0 of 0'}</span><button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="px-2 disabled:opacity-30">‹</button><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="px-2 disabled:opacity-30">›</button></div>
        </div>
      </div>

    </div>
    </div>
  );
}
