import { useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import uploadService from '../api/uploadService';
export default function LectureNotesPage() {
  const { data, _isLoading } = useResourceList('lectureNotes', { page: 1, pageSize: 200 });
  const createLectureNote = useCreateResource('lectureNotes');
  const lectureNotes = data?.items || [];
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { subject: '', chapter: '', uploadedBy: '', fileType: 'PDF', status: 'Pending Review' },
  });
  const filteredNotes = useMemo(() => {
    return lectureNotes.filter((note) => {
      const searchTerm = search.toLowerCase();
      return [note.subject || '', note.title || note.chapter || '', note.uploadedBy || ''].some((value) => String(value).toLowerCase().includes(searchTerm));
    });
  }, [lectureNotes, search]);
  const pageCount = Math.max(1, Math.ceil(filteredNotes.length / pageSize));
  const displayedNotes = filteredNotes.slice((page - 1) * pageSize, page * pageSize);
  const onSubmit = async (formValues) => {
    let fileInfo = null;
    try {
      const file = formValues.file && formValues.file[0];
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fileInfo = await uploadService.upload('lectureNotes', fd);
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
    const payload = {
      subject: formValues.subject,
      chapter: formValues.chapter,
      uploadedBy: formValues.uploadedBy,
      fileType: formValues.fileType,
      status: formValues.status,
      fileInfo,
    };
    createLectureNote.mutate(payload, {
      onSuccess: () => {
        reset({ subject: '', chapter: '', uploadedBy: '', fileType: 'PDF', status: 'Pending Review' });
        setPage(1);
        setIsModalOpen(false);
      },
    });
  };
  const totalNotes = lectureNotes.length;
  const approved = lectureNotes.filter((n) => n.status === 'Approved').length;
  const totalDownloads = lectureNotes.reduce((acc, n) => acc + parseInt(n.downloads || 0), 0);
  return (
    <div className="space-y-6">
      <SectionHeader title="Lecture notes" subtitle="Upload, manage and distribute lecture materials to students." />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total notes</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalNotes}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Approved</p>
          <p className="mt-3 text-2xl font-semibold text-white">{approved}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total downloads</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalDownloads}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Materials library</h2>
            <p className="text-sm text-slate-400">Upload lecture notes, manage versions and track usage statistics.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Upload notes</button>
        </div>
        <div className="mt-4">
          <input type="text" placeholder="Search by subject, chapter or teacher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
        </div>
        <div className="mt-6">
          <DataTable
            columns={['Subject', 'Chapter', 'Uploaded by', 'Date', 'Size', 'Downloads', 'Status']}
            rows={displayedNotes.map((note) => [
              <div key={note.id} className="font-semibold text-white">{note.subject}</div>,
              note.chapter,
              note.uploadedBy,
              note.uploadDate,
              note.fileSize,
              note.downloads,
              <StatusBadge key={`${note.id}-status`} status={note.status} />,
            ])}
          />
        </div>
        <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Upload lecture notes" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<Button onClick={handleSubmit(onSubmit)} variant="primary">Upload</Button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Chapter/Topic"><input type="text" {...register('chapter', { required: 'Chapter is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Chapter 5: Linked Lists" />{errors.chapter && <p className="mt-1 text-sm text-rose-400">{errors.chapter.message}</p>}</FormField>
          <FormField label="Uploaded by"><input type="text" {...register('uploadedBy', { required: 'Uploader name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Dr. Priya Menon" />{errors.uploadedBy && <p className="mt-1 text-sm text-rose-400">{errors.uploadedBy.message}</p>}</FormField>
          <FormField label="File type"><select {...register('fileType')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="PDF">PDF</option><option value="DOCX">Word Document</option><option value="PPTX">Presentation</option><option value="ZIP">Compressed</option></select></FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Pending Review">Pending Review</option><option value="Approved">Approved</option></select></FormField>
          <FormField label="Upload file"><input type="file" {...register('file')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" /></FormField>
        </form>
      </Modal>
    </div>
  );
}