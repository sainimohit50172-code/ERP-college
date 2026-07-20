import { useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

// syllabi migrated to API-backed resources

export default function SyllabusUploadPage() {
  const { data: syllabiData } = useResourceList('syllabi', { page: 1, pageSize: 200 });
  const syllabi = syllabiData?.items || [];
  const createSyllabus = useCreateResource('syllabi');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { subject: '', code: '', course: 'BCA', semester: '1', uploadedBy: '', version: '1.0', topics: '', status: 'Pending Review' },
  });

  const filteredSyllabi = useMemo(() => {
    return syllabi.filter((syllabus) => {
      const searchTerm = search.toLowerCase();
      return [syllabus.subject || '', syllabus.code || '', syllabus.course || ''].some((value) => String(value).toLowerCase().includes(searchTerm));
    });
  }, [syllabi, search]);

  const pageCount = Math.max(1, Math.ceil(filteredSyllabi.length / pageSize));
  const displayedSyllabi = filteredSyllabi.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (formValues) => {
    createSyllabus.mutate(formValues, { onSuccess: () => { reset({ subject: '', code: '', course: 'BCA', semester: '1', uploadedBy: '', version: '1.0', topics: '', status: 'Pending Review' }); setPage(1); setIsModalOpen(false); } });
  };

  const totalSyllabi = syllabi.length;
  const approved = syllabi.filter((s) => s.status === 'Approved').length;
  const totalTopics = syllabi.reduce((acc, s) => acc + parseInt(s.topics || 0), 0);

  return (
    <div className="space-y-8">
      <SectionHeader title="Syllabus management" subtitle="Upload, maintain and version control course syllabi." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total syllabi</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalSyllabi}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Approved</p>
          <p className="mt-4 text-3xl font-semibold text-white">{approved}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total topics</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalTopics}</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Syllabus repository</h2>
            <p className="text-sm text-slate-400">Upload course syllabi with topics, learning outcomes and assessment methods.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Upload syllabus</button>
        </div>

        <div className="mt-6">
          <input type="text" placeholder="Search by subject, code or course..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
        </div>

        <div className="mt-6">
          <DataTable
            columns={['Subject', 'Code', 'Course', 'Semester', 'Uploaded by', 'Date', 'Version', 'Status']}
            rows={displayedSyllabi.map((syllabus) => [
              <div key={syllabus.id} className="font-semibold text-white">{syllabus.subject}</div>,
              syllabus.code,
              syllabus.course,
              syllabus.semester,
              syllabus.uploadedBy,
              syllabus.uploadDate,
              syllabus.version,
              <StatusBadge key={`${syllabus.id}-status`} status={syllabus.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      <Modal title="Upload syllabus" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Save syllabus</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Subject code"><input type="text" {...register('code', { required: 'Code is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="CS501" />{errors.code && <p className="mt-1 text-sm text-rose-400">{errors.code.message}</p>}</FormField>
          <FormField label="Course"><input type="text" {...register('course')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="BCA" /></FormField>
          <FormField label="Semester"><input type="text" {...register('semester')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="5" /></FormField>
          <FormField label="Uploaded by"><input type="text" {...register('uploadedBy', { required: 'Uploader name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Dr. Priya Menon" />{errors.uploadedBy && <p className="mt-1 text-sm text-rose-400">{errors.uploadedBy.message}</p>}</FormField>
          <FormField label="Version"><input type="text" {...register('version')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="1.0" /></FormField>
          <FormField label="Number of topics"><input type="number" {...register('topics', { required: 'Topics count is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="12" />{errors.topics && <p className="mt-1 text-sm text-rose-400">{errors.topics.message}</p>}</FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Pending Review">Pending Review</option><option value="Approved">Approved</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}
