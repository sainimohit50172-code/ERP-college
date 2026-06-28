import { useMemo, useState } from 'react';
import { FaDownload, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

// migrated to API-backed promotions

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Promoted', label: 'Promoted' },
  { value: 'Conditional', label: 'Conditional' },
  { value: 'Not Promoted', label: 'Not Promoted' },
];

export default function StudentPromotionPage() {
  const { data: promotionsData } = useResourceList('promotions', { page: 1, pageSize: 200 });
  const promotions = promotionsData?.items || [];
  const createPromotion = useCreateResource('promotions');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { student: '', rollNo: '', currentSem: '', nextSem: '', cgpa: '0', backlog: '0', eligibility: 'Pass', promotionStatus: 'Promoted' },
  });

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [promotion.student, promotion.rollNo].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || promotion.promotionStatus === filter;
      return matchesSearch && matchesFilter;
    });
  }, [promotions, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredPromotions.length / pageSize));
  const displayedPromotions = filteredPromotions.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (formValues) => {
    createPromotion.mutate(formValues, {
      onSuccess: () => {
        reset({ student: '', rollNo: '', currentSem: '', nextSem: '', cgpa: '0', backlog: '0', eligibility: 'Pass', promotionStatus: 'Promoted' });
        setPage(1);
        setIsModalOpen(false);
      },
    });
  };

  const totalRecords = promotions.length;
  const promoted = promotions.filter((p) => p.promotionStatus === 'Promoted').length;
  const notPromoted = promotions.filter((p) => p.promotionStatus === 'Not Promoted').length;

  return (
    <div className="space-y-8">
      <SectionHeader title="Student promotion" subtitle="Manage student progression to next semester based on academic performance and eligibility." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total records</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalRecords}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Promoted</p>
          <p className="mt-4 text-3xl font-semibold text-white">{promoted}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Not promoted</p>
          <p className="mt-4 text-3xl font-semibold text-white">{notPromoted}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Promotion management</h2>
            <p className="text-sm text-slate-400">Process and approve student promotions to next semester based on CGPA, backlog and eligibility.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"><FaDownload /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Process promotion</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>

        <div className="mt-6">
          <DataTable
            columns={['Student', 'Roll No', 'Current Sem', 'Next Sem', 'CGPA', 'Backlog', 'Eligibility', 'Status']}
            rows={displayedPromotions.map((promotion) => [
              <div key={promotion.id} className="font-semibold text-white">{promotion.student}</div>,
              promotion.rollNo,
              promotion.currentSem,
              <div key={`${promotion.id}-sem`} className={`font-semibold ${promotion.nextSem === '-' ? 'text-rose-400' : 'text-emerald-400'}`}>{promotion.nextSem}</div>,
              <div key={`${promotion.id}-cgpa`} className={`font-semibold ${parseFloat(promotion.cgpa) >= 3.0 ? 'text-emerald-400' : parseFloat(promotion.cgpa) >= 2.0 ? 'text-amber-400' : 'text-rose-400'}`}>{promotion.cgpa}</div>,
              <div key={`${promotion.id}-backlog`} className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${parseInt(promotion.backlog) === 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>{promotion.backlog}</div>,
              <div key={`${promotion.id}-elig`} className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${promotion.eligibility === 'Pass' ? 'bg-emerald-400/10 text-emerald-300' : promotion.eligibility === 'Conditional Pass' ? 'bg-amber-400/10 text-amber-300' : 'bg-rose-400/10 text-rose-300'}`}>{promotion.eligibility}</div>,
              <StatusBadge key={`${promotion.id}-status`} status={promotion.promotionStatus} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      {/* Promotion Criteria */}
      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-white mb-4">Promotion Criteria</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-emerald-400/10 px-4 py-3 border border-emerald-400/20">
            <p className="text-sm text-slate-400 mb-1">Automatic Promotion</p>
            <p className="text-white font-semibold">CGPA ≥ 3.0</p>
            <p className="text-xs text-slate-400 mt-1">No backlogs</p>
          </div>
          <div className="rounded-2xl bg-amber-400/10 px-4 py-3 border border-amber-400/20">
            <p className="text-sm text-slate-400 mb-1">Conditional Promotion</p>
            <p className="text-white font-semibold">CGPA ≥ 2.0</p>
            <p className="text-xs text-slate-400 mt-1">Max 2 backlogs</p>
          </div>
          <div className="rounded-2xl bg-rose-400/10 px-4 py-3 border border-rose-400/20">
            <p className="text-sm text-slate-400 mb-1">Not Promoted</p>
            <p className="text-white font-semibold">CGPA &lt; 2.0</p>
            <p className="text-xs text-slate-400 mt-1">More than 2 backlogs</p>
          </div>
        </div>
      </div>

      <Modal title="Process student promotion" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Process promotion</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Student name"><input type="text" {...register('student', { required: 'Student name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Raj Kumar" />{errors.student && <p className="mt-1 text-sm text-rose-400">{errors.student.message}</p>}</FormField>
          <FormField label="Roll number"><input type="text" {...register('rollNo', { required: 'Roll number is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="BCA-001" />{errors.rollNo && <p className="mt-1 text-sm text-rose-400">{errors.rollNo.message}</p>}</FormField>
          <FormField label="Current semester"><input type="text" {...register('currentSem', { required: 'Current semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="5" />{errors.currentSem && <p className="mt-1 text-sm text-rose-400">{errors.currentSem.message}</p>}</FormField>
          <FormField label="Next semester"><input type="text" {...register('nextSem', { required: 'Next semester is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="6" />{errors.nextSem && <p className="mt-1 text-sm text-rose-400">{errors.nextSem.message}</p>}</FormField>
          <FormField label="CGPA"><input type="number" step="0.01" {...register('cgpa')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="3.45" /></FormField>
          <FormField label="Number of backlogs"><input type="number" min="0" {...register('backlog')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="0" /></FormField>
          <FormField label="Eligibility"><select {...register('eligibility')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Pass">Pass</option><option value="Conditional Pass">Conditional Pass</option><option value="Fail">Fail</option></select></FormField>
          <FormField label="Promotion status"><select {...register('promotionStatus')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Promoted">Promoted</option><option value="Conditional">Conditional</option><option value="Not Promoted">Not Promoted</option></select></FormField>
        </form>
      </Modal>
    </div>
  );
}
