import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ClipboardCheck, Eye, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Modal from '../components/ui/Modal.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks.js';

const preferenceDefaults = {
  academicSession: '', institute: '', course: '', program: '', semester: '', examType: '', formOpeningDate: '', formClosingDate: '', lateFeeDate: '', lateFeeAmount: 0, withoutLateFee: true, withLateFee: false, maximumSubjects: 8, minimumSubjects: 1, allowImprovement: false, allowBackPaper: false, allowReappear: false, allowPracticalOnly: false, allowTheoryOnly: false, status: 'Active', remarks: '', createdBy: '', createdDate: '', updatedBy: '', updatedDate: '',
};

const headerDefaults = {
  headerName: '', headerHtml: '<div style="text-align:center"><h1>Institute Name</h1></div>', footerHtml: '<div style="text-align:center">Footer text</div>', institute: '', examType: '', logo: '', watermark: '', status: 'Active', createdBy: '', createdDate: '', updatedBy: '', updatedDate: '',
};

const preferenceFields = [
  ['academicSession', 'Academic Session'], ['institute', 'Institute'], ['course', 'Course'], ['program', 'Program'], ['semester', 'Semester'], ['examType', 'Exam Type'], ['formOpeningDate', 'Form Opening Date', 'date'], ['formClosingDate', 'Form Closing Date', 'date'], ['lateFeeDate', 'Late Fee Date', 'date'], ['lateFeeAmount', 'Late Fee Amount', 'number'], ['maximumSubjects', 'Maximum Subjects', 'number'], ['minimumSubjects', 'Minimum Subjects', 'number'], ['remarks', 'Remarks', 'textarea'], ['createdBy', 'Created By'], ['createdDate', 'Created Date', 'date'], ['updatedBy', 'Updated By'], ['updatedDate', 'Updated Date', 'date'],
];
const preferenceFlags = [['withoutLateFee', 'Without Late Fee'], ['withLateFee', 'With Late Fee'], ['allowImprovement', 'Allow Improvement'], ['allowBackPaper', 'Allow Back Paper'], ['allowReappear', 'Allow Reappear'], ['allowPracticalOnly', 'Allow Practical Only'], ['allowTheoryOnly', 'Allow Theory Only']];
const headerFields = [['headerName', 'Header Name'], ['institute', 'Institute'], ['examType', 'Exam Type'], ['logo', 'Logo URL'], ['watermark', 'Watermark URL'], ['createdBy', 'Created By'], ['createdDate', 'Created Date', 'date'], ['updatedBy', 'Updated By'], ['updatedDate', 'Updated Date', 'date']];

function valueFor(item, key) {
  return item?.[key] ?? item?.[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] ?? '';
}

function escapeCsv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function FormFields({ mode, register, errors }) {
  const fields = mode === 'preferences' ? preferenceFields : headerFields;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map(([name, label, type]) => (
        <label key={name} className={type === 'textarea' ? 'md:col-span-2' : ''}>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>
          {type === 'textarea' ? (
            <textarea rows={3} {...register(name, { required: ['academicSession', 'institute', 'course', 'semester', 'examType', 'formOpeningDate', 'formClosingDate', 'headerName', 'headerHtml', 'footerHtml'].includes(name) ? `${label} is required` : false })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          ) : (
            <input type={type || 'text'} step={type === 'number' ? '0.01' : undefined} {...register(name, { required: ['academicSession', 'institute', 'course', 'semester', 'examType', 'formOpeningDate', 'formClosingDate', 'headerName'].includes(name) ? `${label} is required` : false, valueAsNumber: type === 'number' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          )}
          {errors[name] && <span className="mt-1 block text-xs text-rose-600">{errors[name].message}</span>}
        </label>
      ))}
      {mode === 'preferences' && (
        <div className="md:col-span-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Registration Rules</span>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {preferenceFlags.map(([name, label]) => <label key={name} htmlFor={`pref-${name}`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"><input id={`pref-${name}`} type="checkbox" {...register(name)} className="h-4 w-4 accent-emerald-600" />{label}</label>)}
          </div>
        </div>
      )}
      <label htmlFor="exam-status">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Status</span>
        <select id="exam-status" {...register('status')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500"><option>Active</option><option>Inactive</option><option>Draft</option></select>
      </label>
      {mode === 'headers' && <>
        <label htmlFor="header-html" className="md:col-span-2"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Header HTML</span><textarea id="header-html" rows={5} {...register('headerHtml', { required: 'Header HTML is required' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs outline-none focus:border-emerald-500" />{errors.headerHtml && <span className="mt-1 block text-xs text-rose-600">{errors.headerHtml.message}</span>}</label>
        <label htmlFor="footer-html" className="md:col-span-2"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Footer HTML</span><textarea id="footer-html" rows={5} {...register('footerHtml', { required: 'Footer HTML is required' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs outline-none focus:border-emerald-500" />{errors.footerHtml && <span className="mt-1 block text-xs text-rose-600">{errors.footerHtml.message}</span>}</label>
      </>}
    </div>
  );
}

export default function ExamFormCrudPage({ mode }) {
  const isPreferences = mode === 'preferences';
  const resource = isPreferences ? 'examFormPreferences' : 'examFormHeadersFooters';
  const title = isPreferences ? 'Exam Form Preferences' : 'Exam Form Headers / Footers';
  const defaults = isPreferences ? preferenceDefaults : headerDefaults;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [examType, setExamType] = useState('');
  const [institute, setInstitute] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState({ key: 'created_at', direction: 'desc' });
  const [editor, setEditor] = useState(null);
  const [view, setView] = useState(null);
  const [remove, setRemove] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: defaults });
  const { data, isLoading, isFetching } = useResourceList(resource, { page: 1, pageSize: 200, search, status, examType, institute, sort_by: sort.key, sort_order: sort.direction });
  const createMutation = useCreateResource(resource);
  const updateMutation = useUpdateResource(resource);
  const deleteMutation = useDeleteResource(resource);
  const items = data?.items || [];
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const visibleItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);

  useEffect(() => setPage(1), [search, status, examType, institute, pageSize]);

  const openCreate = () => { reset(defaults); setEditor({ item: null }); };
  const openEdit = (item) => { reset(Object.fromEntries(Object.keys(defaults).map((key) => [key, valueFor(item, key)]))); setEditor({ item }); };
  const closeEditor = () => { setEditor(null); reset(defaults); };
  const onSubmit = async (values) => {
    const payload = Object.fromEntries(Object.entries({ ...values, lateFeeAmount: Number(values.lateFeeAmount || 0), maximumSubjects: Number(values.maximumSubjects || 1), minimumSubjects: Number(values.minimumSubjects || 1) }).filter(([key, value]) => value !== '' || ['remarks', 'program', 'logo', 'watermark'].includes(key)));
    if (isPreferences && new Date(payload.formClosingDate) < new Date(payload.formOpeningDate)) { toast.error('Form Closing Date cannot be before Form Opening Date.'); return; }
    try {
      if (editor.item) { await updateMutation.mutateAsync({ id: editor.item.id, payload }); toast.success(`${title} updated successfully.`); }
      else { await createMutation.mutateAsync(payload); toast.success(`${title} created successfully.`); }
      closeEditor();
    } catch (error) { toast.error(error?.message || `Unable to save ${title.toLowerCase()}.`); }
  };
  const handleDelete = async () => { try { await deleteMutation.mutateAsync(remove.id); toast.success(`${title} deleted successfully.`); setRemove(null); } catch (error) { toast.error(error?.message || 'Unable to delete record.'); } };
  const exportCsv = () => {
    const columns = Object.keys(defaults);
    const rows = [columns, ...items.map((item) => columns.map((key) => valueFor(item, key)))];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${resource}.csv`; anchor.click(); URL.revokeObjectURL(url);
    toast.success('Export downloaded successfully.');
  };
  const toggleSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));

  return <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
    <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Exam Form Preferences', to: '/coe/master/exam-form-preferences/settings' }, { label: title }]} />
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        {[
          { label: 'Exam Form Preferences', subtitle: 'Configure form windows, fee rules and subject limits.', icon: ClipboardCheck, to: '/coe/master/exam-form-preferences/settings', active: isPreferences },
          { label: 'Exam Form Headers / Footers', subtitle: 'Manage reusable form branding and print content.', icon: FileText, to: '/coe/master/exam-form-preferences/header-footer', active: !isPreferences },
        ].map(({ label, subtitle, icon: Icon, to, active }) => <Link key={label} to={to} className={`group flex min-h-[170px] flex-col justify-between rounded-[18px] border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-emerald-500 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${active ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'}`}><div className="w-fit rounded-full bg-[#F5F8FC] p-3 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white"><Icon className="h-9 w-9" /></div><div><h2 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600">{label}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p></div></Link>)}
      </section>
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">Production configuration with searchable, auditable records.</p></div><Button onClick={openCreate}><Plus className="mr-2 inline h-4 w-4" />Add New</Button></div>
      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_160px_180px_180px_auto] md:items-center"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All Statuses</option><option>Active</option><option>Inactive</option><option>Draft</option></select><input value={examType} onChange={(event) => setExamType(event.target.value)} placeholder="Exam type" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" /><input value={institute} onChange={(event) => setInstitute(event.target.value)} placeholder="Institute" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" /><Button variant="secondary" onClick={exportCsv}><span className="mr-2">↓</span>Export</Button></div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[1000px] w-full text-left text-sm"><thead className="erp-table-header text-white text-xs uppercase tracking-wide"><tr><th className="px-4 py-3">#</th>{(isPreferences ? [['academicSession', 'Session'], ['institute', 'Institute'], ['course', 'Course'], ['examType', 'Exam Type'], ['formOpeningDate', 'Opening'], ['formClosingDate', 'Closing']] : [['headerName', 'Header Name'], ['institute', 'Institute'], ['examType', 'Exam Type'], ['logo', 'Logo'], ['watermark', 'Watermark']]).map(([key, label]) => <th key={key} className="cursor-pointer px-4 py-3" onClick={() => toggleSort(key)}>{label} {sort.key === key ? (sort.direction === 'asc' ? '↑' : '↓') : ''}</th>)}<th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{isLoading || isFetching ? <tr><td colSpan="9" className="px-4 py-10 text-center text-slate-500">Loading records...</td></tr> : visibleItems.length === 0 ? <tr><td colSpan="9" className="px-4 py-10 text-center text-slate-500">No records found.</td></tr> : visibleItems.map((item, index) => <tr key={item.id} className="transition hover:bg-emerald-50/40"><td className="px-4 py-3 text-slate-500">{(page - 1) * pageSize + index + 1}</td>{(isPreferences ? ['academicSession', 'institute', 'course', 'examType', 'formOpeningDate', 'formClosingDate'] : ['headerName', 'institute', 'examType', 'logo', 'watermark']).map((key) => <td key={key} className="max-w-[220px] truncate px-4 py-3 text-slate-700">{valueFor(item, key) || '—'}</td>)}<td className="px-4 py-3"><StatusBadge status={valueFor(item, 'status')} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button title="View" onClick={() => setView(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye className="h-4 w-4" /></button><button title="Edit" onClick={() => openEdit(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button><button title="Delete" onClick={() => setRemove(item)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
      <div className="mt-4 flex flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row sm:items-center"><span>Showing {visibleItems.length} of {items.length} records</span><div className="flex items-center gap-2"><select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-lg border border-slate-200 px-2 py-1"><option value="10">10 / page</option><option value="25">25 / page</option><option value="50">50 / page</option></select><button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">Prev</button><span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">Next</button></div></div>
    </div>
    <Modal isOpen={Boolean(editor)} onClose={closeEditor} title={`${editor?.item ? 'Edit' : 'Create'} ${title}`} footer={<><Button variant="secondary" onClick={closeEditor}>Cancel</Button><Button type="submit" form="exam-form-editor" isLoading={createMutation.isPending || updateMutation.isPending}>{editor?.item ? 'Save Changes' : 'Create Record'}</Button></>}><form id="exam-form-editor" onSubmit={handleSubmit(onSubmit)}><FormFields mode={mode} register={register} errors={errors} /></form></Modal>
    <Modal isOpen={Boolean(view)} onClose={() => setView(null)} title={`${title} Details`} footer={<Button variant="secondary" onClick={() => setView(null)}>Close</Button>}><div className="grid gap-3 sm:grid-cols-2">{Object.keys(defaults).map((key) => <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{key.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase())}</p><p className="mt-1 break-words text-sm text-slate-800">{valueFor(view, key) || '—'}</p></div>)}</div>{!isPreferences && <iframe title="Header/footer preview" srcDoc={`${valueFor(view, 'headerHtml')}<hr/>${valueFor(view, 'footerHtml')}`} className="mt-5 h-64 w-full rounded-xl border border-slate-200 bg-white" sandbox="" />}</Modal>
    <ConfirmDialog open={Boolean(remove)} title={`Delete ${title}?`} description="This record will be removed from active lists. This action cannot be undone from the UI." onCancel={() => setRemove(null)} onConfirm={handleDelete} confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'} />
  </div>;
}
