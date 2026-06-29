import { useMemo, useState } from 'react';
import { FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import { useResourceList } from '../hooks/useResourceHooks';

// workloads migrated to API-backed `teacherWorkloads` resource

export default function TeacherWorkloadManagementPage() {
  const [search, setSearch] = useState('');
  const [page, _setPage] = useState(1);
  const pageSize = 5;

  const { data: workloadsData } = useResourceList('teacherWorkloads', { page: 1, pageSize: 200 });
  const workloads = workloadsData?.items || [];
  const filteredWorkloads = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return workloads.filter((workload) => [workload.teacher, workload.department].some((value) => (value || '').toLowerCase().includes(searchTerm)));
  }, [workloads, search]);

  const _pageCount = Math.max(1, Math.ceil(filteredWorkloads.length / pageSize));
  const displayedWorkloads = filteredWorkloads.slice((page - 1) * pageSize, page * pageSize);

  const avgTeacherHours = workloads.length ? (workloads.reduce((acc, w) => acc + parseInt(w.totalHours || 0), 0) / workloads.length).toFixed(1) : '0';
  const overloadedTeachers = workloads.filter((w) => w.workloadStatus === 'High').length;
  const avgPerWeek = workloads.length ? (workloads.reduce((acc, w) => acc + parseInt(w.avgPerWeek || 0), 0) / workloads.length).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      <SectionHeader title="Teacher workload management" subtitle="Monitor and balance teaching workload across faculty to ensure optimal distribution." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Avg total hours</p>
          <p className="mt-4 text-3xl font-semibold text-white">{avgTeacherHours}</p>
          <p className="mt-2 text-xs text-slate-400">per semester per teacher</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Avg per week</p>
          <p className="mt-4 text-3xl font-semibold text-white">{avgPerWeek}</p>
          <p className="mt-2 text-xs text-slate-400">recommended 30-35 hours</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Overloaded teachers</p>
          <p className="mt-4 text-3xl font-semibold text-rose-400">{overloadedTeachers}</p>
          <p className="mt-2 text-xs text-slate-400">requiring redistribution</p>
        </div>
      </div>

      {/* Workload Distribution Chart */}
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-6">Workload Distribution</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-400 mb-3">Light Load (&lt; 110 hrs)</p>
            <div className="space-y-2">
              {workloads
                .filter((w) => parseInt(w.totalHours || 0) < 110)
                .map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-2xl bg-emerald-400/10 px-3 py-2 border border-emerald-400/20">
                    <span className="text-sm font-medium text-white">{(w.teacher || '').split(' ')[1]}</span>
                    <span className="text-xs text-emerald-300">{w.totalHours} hrs</span>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-3">Optimal Load (110-150 hrs)</p>
            <div className="space-y-2">
              {workloads
                .filter((w) => {
                  const t = parseInt(w.totalHours || 0);
                  return t >= 110 && t <= 150;
                })
                .map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-2xl bg-blue-400/10 px-3 py-2 border border-blue-400/20">
                    <span className="text-sm font-medium text-white">{(w.teacher || '').split(' ')[1]}</span>
                    <span className="text-xs text-blue-300">{w.totalHours} hrs</span>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-3">High Load (&gt; 150 hrs)</p>
            <div className="space-y-2">
              {workloads
                .filter((w) => parseInt(w.totalHours || 0) > 150)
                .map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-2xl bg-rose-400/10 px-3 py-2 border border-rose-400/20">
                    <span className="text-sm font-medium text-white">{(w.teacher || '').split(' ')[1]}</span>
                    <span className="text-xs text-rose-300">{w.totalHours} hrs</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warnings and Recommendations */}
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FaExclamationTriangle className="text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Workload Alerts</h3>
        </div>
        <div className="space-y-3">
          {workloads
            .filter((w) => w.workloadStatus === 'High')
            .map((w) => (
              <div key={w.id} className="rounded-2xl bg-rose-400/10 border border-rose-400/20 p-4">
                <p className="text-sm font-medium text-white">{w.teacher} - Workload Exceeds Recommended Limit</p>
                <p className="text-xs text-slate-400 mt-1">Current: {w.avgPerWeek} hrs/week (Recommended: 30-35 hrs/week)</p>
                <p className="text-xs text-rose-300 mt-2">Action: Consider reducing course/subject load or redistributing to other faculty</p>
              </div>
            ))}
          {workloads.filter((w) => w.workloadStatus === 'Light').length > 0 && (
            <div className="rounded-2xl bg-amber-400/10 border border-amber-400/20 p-4">
              <p className="text-sm font-medium text-white">Underutilized Faculty Available</p>
              <p className="text-xs text-slate-400 mt-1">
                {workloads.filter((w) => w.workloadStatus === 'Light').map((w) => w.teacher).join(', ')} have lighter workloads
              </p>
              <p className="text-xs text-amber-300 mt-2">Action: Consider redistributing courses from overloaded teachers</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Workload Table */}
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Detailed workload summary</h2>
            <p className="text-sm text-slate-400">Individual teacher workload metrics and distribution breakdown.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
            <FaDownload /> Export
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by teacher or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
          />
        </div>

        <div className="overflow-x-auto">
          <DataTable
            columns={['Teacher', 'Department', 'Semesters', 'Courses', 'Subjects', 'Theory Hrs', 'Practical Hrs', 'Total', 'Per Week', 'Status']}
            rows={displayedWorkloads.map((workload) => [
              <div key={workload.id} className="font-semibold text-white">{workload.teacher}</div>,
              workload.department,
              workload.semesters,
              workload.courses,
              workload.subjects,
              workload.theoryHours,
              workload.practicalHours,
              <div key={`${workload.id}-total`} className="font-semibold text-sky-300">{workload.totalHours}</div>,
              workload.avgPerWeek,
              <div key={`${workload.id}-status`} className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${workload.workloadStatus === 'Optimal' ? 'bg-emerald-400/10 text-emerald-300' : workload.workloadStatus === 'Light' ? 'bg-blue-400/10 text-blue-300' : 'bg-rose-400/10 text-rose-300'}`}>
                {workload.workloadStatus}
              </div>,
            ])}
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Workload Guidelines</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-emerald-400/10 px-4 py-3 border border-emerald-400/20">
            <p className="text-sm text-slate-400 mb-1">Light Load</p>
            <p className="text-white font-semibold">Less than 110 hours/semester</p>
            <p className="text-xs text-emerald-300 mt-1">&lt; 28 hours/week</p>
          </div>
          <div className="rounded-2xl bg-blue-400/10 px-4 py-3 border border-blue-400/20">
            <p className="text-sm text-slate-400 mb-1">Optimal Load</p>
            <p className="text-white font-semibold">110-150 hours/semester</p>
            <p className="text-xs text-blue-300 mt-1">28-37.5 hours/week</p>
          </div>
          <div className="rounded-2xl bg-rose-400/10 px-4 py-3 border border-rose-400/20">
            <p className="text-sm text-slate-400 mb-1">High Load</p>
            <p className="text-white font-semibold">More than 150 hours/semester</p>
            <p className="text-xs text-rose-300 mt-1">&gt; 37.5 hours/week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
