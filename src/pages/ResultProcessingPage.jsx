import { useMemo, useState } from 'react';
import { FaDownload, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useResults } from '../hooks/useResults';
import { useERP } from '../services/ERPContext.jsx';
import { createResult as createResultRecord, listResults, publishResult as publishResultRecord } from '../services/resultService.js';
// Results are provided by API
const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'In Review', label: 'In Review' },
  { value: 'Published', label: 'Published' },
];
export default function ResultProcessingPage() {
  const { currentUser, setNotifications } = useERP();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const { data, _isLoading, _isError, _error, createResult, publishResult } = useResults({ page, pageSize, search, filter });
  const results = data?.items || [];
  const serviceResults = listResults().items;
  const isPublishing = publishResult.isLoading;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { student: '', rollNo: '', subject: '', internal: '0', practical: '0', external: '0', status: 'Pending' },
  });
  const filteredResults = useMemo(() => {
    return (results || []).filter((result) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [result.student || '', result.rollNo || '', result.subject || ''].some((value) => String(value).toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || result.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [results, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const displayedResults = filteredResults.slice((page - 1) * pageSize, page * pageSize);
  const getGrade = (percentage) => {
    const pct = parseInt(percentage);
    if (pct >= 85) return 'A';
    if (pct >= 75) return 'B';
    if (pct >= 65) return 'C';
    if (pct >= 55) return 'D';
    return 'F';
  };
  const onSubmit = async (data) => {
    const total = parseInt(data.internal) + parseInt(data.practical) + parseInt(data.external);
    const percentage = ((total / 200) * 100).toFixed(1);
    const grade = getGrade(percentage);
    const payload = { ...data, total: total.toString(), maxMarks: '200', percentage: `${percentage}%`, grade, createdBy: currentUser?.id };
    const servicePayload = {
      studentName: data.student,
      studentId: data.rollNo,
      semester: data.semester || '5',
      course: data.course || 'BCA',
      total,
      percentage: Number(percentage),
      cgpa: Number(percentage) / 10,
      sgpa: Number(percentage) / 10,
      grade,
      status: data.status || 'Pending',
    };
    createResultRecord(servicePayload);
    await createResult.mutateAsync(payload, {
      onSuccess: () => setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Result processed', date: new Date().toISOString().split('T')[0], details: 'Result processed successfully' }, ...prev]),
      onError: () => setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Process failed', date: new Date().toISOString().split('T')[0], details: 'Could not process result', type: 'error' }, ...prev]),
    });
    reset({ student: '', rollNo: '', subject: '', internal: '0', practical: '0', external: '0', status: 'Pending' });
    setPage(1);
    setIsModalOpen(false);
  };
  const onPublishResult = async (resultId) => {
    try {
      publishResultRecord(resultId);
      await publishResult.mutateAsync(resultId);
      setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Result published', date: new Date().toISOString().split('T')[0], details: 'Result published successfully' }, ...prev]);
    } catch (err) {
      setNotifications((prev) => [{ id: `NOTIF-${Date.now()}`, title: 'Publish failed', date: new Date().toISOString().split('T')[0], details: 'Could not publish result', type: 'error' }, ...prev]);
    }
  };
  const totalRecords = (serviceResults || []).length;
  const published = (serviceResults || []).filter((r) => r.published || r.status === 'Published').length;
  const avgPercentage = ((serviceResults || []).reduce((acc, r) => acc + parseFloat(r.percentage || '0'), 0) / Math.max(1, (serviceResults || []).length)).toFixed(1);
  return (
    <div className="space-y-6">
      <SectionHeader title="Result processing" subtitle="Compile final results from internal, practical and external exam marks." />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total results</p>
          <p className="mt-3 text-2xl font-semibold text-white">{totalRecords}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Published</p>
          <p className="mt-3 text-2xl font-semibold text-white">{published}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Average percentage</p>
          <p className="mt-3 text-2xl font-semibold text-white">{avgPercentage}%</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Result processing</h2>
            <p className="text-sm text-slate-400">Process, compile and publish final results combining all assessment components.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Process result</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>
        <div className="mt-4">
          <DataTable
            columns={['Student', 'Roll No', 'Subject', 'Internal', 'Practical', 'External', 'Total', 'Percent', 'Grade', 'Status', 'Actions']}
            rows={displayedResults.map((result) => [
              <div key={result.id} className="font-semibold text-white">{result.student}</div>,
              result.rollNo,
              result.subject,
              result.internal,
              result.practical,
              result.external,
              result.total,
              <div key={`${result.id}-percent`} className={`font-semibold ${parseFloat(result.percentage) >= 75 ? 'text-emerald-400' : parseFloat(result.percentage) >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{result.percentage}</div>,
              <div key={`${result.id}-grade`} className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${result.grade === 'A' ? 'bg-emerald-400/10 text-emerald-300' : result.grade === 'B' ? 'bg-blue-400/10 text-blue-300' : result.grade === 'C' ? 'bg-amber-400/10 text-amber-300' : 'bg-rose-400/10 text-rose-300'}`}>{result.grade}</div>,
              <StatusBadge key={`${result.id}-status`} status={result.status} />,
              <div key={`${result.id}-actions`} className="flex flex-wrap gap-2">
                <button
                  onClick={() => onPublishResult(result.id)}
                  disabled={isPublishing || result.status === 'Published'}
                  className="rounded-3xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {result.status === 'Published' ? 'Published' : 'Publish'}
                </button>
              </div>,
            ])}
          />
        </div>
        <div className="mt-4"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>
      <Modal title="Process result" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 hover-gradient-border">Process result</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Student name"><input type="text" {...register('student', { required: 'Student name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Raj Kumar" />{errors.student && <p className="mt-1 text-sm text-rose-400">{errors.student.message}</p>}</FormField>
          <FormField label="Roll number"><input type="text" {...register('rollNo', { required: 'Roll number is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="BCA-001" />{errors.rollNo && <p className="mt-1 text-sm text-rose-400">{errors.rollNo.message}</p>}</FormField>
          <FormField label="Subject"><input type="text" {...register('subject', { required: 'Subject is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="Data Structures" />{errors.subject && <p className="mt-1 text-sm text-rose-400">{errors.subject.message}</p>}</FormField>
          <FormField label="Internal marks (out of 50)"><input type="number" min="0" max="50" {...register('internal')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="42" /></FormField>
          <FormField label="Practical marks (out of 50)"><input type="number" min="0" max="50" {...register('practical')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="42" /></FormField>
          <FormField label="External marks (out of 100)"><input type="number" min="0" max="100" {...register('external')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border" placeholder="68" /></FormField>
          <FormField label="Status"><select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 hover-gradient-border"><option value="Pending">Pending</option><option value="In Review">In Review</option><option value="Published">Published</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}