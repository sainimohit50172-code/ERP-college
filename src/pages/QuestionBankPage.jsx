import { useMemo, useState } from 'react';
import { FaFileUpload, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import { useERP } from '../services/ERPContext.jsx';
// Data powered by API (question-bank)
const typeOptions = [
  { value: 'All', label: 'All types' },
  { value: 'Theory', label: 'Theory' },
  { value: 'Practical', label: 'Practical' },
  { value: 'MCQ', label: 'Multiple Choice' },
];
export default function QuestionBankPage() {
  const { currentUser, setNotifications } = useERP();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const { data, _isLoading, _isError, _error } = useResourceList('questionBank', { page, pageSize, search, filter });
  const createQuestion = useCreateResource('questionBank');
  const questions = data?.items || [];
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { question: '', subject: '', type: 'Theory', difficulty: 'Medium', marks: '5', createdBy: '', status: 'Active' },
  });
  const filteredQuestions = useMemo(() => {
    return (questions || []).filter((q) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [q.question || '', q.subject || '', q.createdBy || ''].some((value) => String(value).toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || q.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [questions, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const displayedQuestions = filteredQuestions.slice((page - 1) * pageSize, page * pageSize);
  const onSubmit = (data) => {
    const payload = { ...data, usageCount: 0, createdBy: currentUser?.name || data.createdBy };
    createQuestion.mutate(payload, {
      onSuccess: () => setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Question added', date: new Date().toISOString().split('T')[0], details: 'Question added to the bank' }, ...prev]),
      onError: () => setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Add failed', date: new Date().toISOString().split('T')[0], details: 'Could not add question', type: 'error' }, ...prev]),
    });
    reset({ question: '', subject: '', type: 'Theory', difficulty: 'Medium', marks: '5', createdBy: '', status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };
  const totalQuestions = (questions || []).length;
  const theoryQuestions = (questions || []).filter((q) => q.type === 'Theory').length;
  const practicalQuestions = (questions || []).filter((q) => q.type === 'Practical').length;
  return (
    <div className="space-y-6">
      <SectionHeader title="Question bank" subtitle="Maintain a repository of questions for tests, exams and assessments." />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total questions</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalQuestions}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Theory questions</p>
          <p className="mt-3 text-2xl font-semibold text-white">{theoryQuestions}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Practical questions</p>
          <p className="mt-3 text-2xl font-semibold text-white">{practicalQuestions}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Question repository</h2>
            <p className="text-sm text-slate-400">Add, categorize and manage questions for exams and assessments.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaFileUpload /> Import</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Add question</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={typeOptions} /></div>
        <div className="mt-4">
          <DataTable
            columns={['Question', 'Subject', 'Type', 'Difficulty', 'Marks', 'Created by', 'Used', 'Status']}
            rows={displayedQuestions.map((question) => [
              <div key={question.id} className="max-w-sm truncate font-semibold text-white">{question.question}</div>,
              question.subject,
              <div key={`${question.id}-type`} className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${question.type === 'Theory' ? 'bg-blue-400/10 text-blue-300' : 'bg-green-400/10 text-green-300'}`}>{question.type}</div>,
              <div key={`${question.id}-difficulty`} className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${question.difficulty === 'Easy' ? 'bg-emerald-400/10 text-emerald-300' : question.difficulty === 'Medium' ? 'bg-amber-400/10 text-amber-300' : 'bg-rose-400/10 text-rose-300'}`}>{question.difficulty}</div>,
              question.marks,
              question.createdBy,
              question.usageCount,
              <StatusBadge key={`${question.id}-status`} status={question.status} />,
            ])}
          />
        </div>
        <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Add new question" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Add question</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Question"><textarea {...register('question', { required: 'Question is required' })} rows="3" className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Enter the question..." />{errors.question && <p className="mt-1 text-sm text-rose-400">{errors.question.message}</p>}</FormField>
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Question type"><select {...register('type')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Theory">Theory</option><option value="Practical">Practical</option><option value="MCQ">Multiple Choice</option></select></FormField>
          <FormField label="Difficulty"><select {...register('difficulty')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></FormField>
          <FormField label="Marks"><input type="number" {...register('marks', { required: 'Marks is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="5" />{errors.marks && <p className="mt-1 text-sm text-rose-400">{errors.marks.message}</p>}</FormField>
          <FormField label="Created by"><input type="text" {...register('createdBy', { required: 'Creator is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Dr. Priya Menon" />{errors.createdBy && <p className="mt-1 text-sm text-rose-400">{errors.createdBy.message}</p>}</FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Active">Active</option><option value="Archived">Archived</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}