import { useMemo } from 'react';
import { useResourceList } from '../hooks/useResourceHooks';
import { getMarkEntrySummary } from '../services/markEntryService.js';
import { getResultSummary } from '../services/resultService.js';
function ExaminationDashboardPage() {
  const { data: examinationsData = {} } = useResourceList('examinations', { page: 1, pageSize: 1000 });
  const { data: attendanceData = {} } = useResourceList('examinationAttendance', { page: 1, pageSize: 1000 });
  const { data: seatingPlansData = {} } = useResourceList('seatingPlans', { page: 1, pageSize: 1000 });
  const { data: assignmentsData = {} } = useResourceList('invigilatorAssignments', { page: 1, pageSize: 1000 });
  const { data: reportsData = {} } = useResourceList('examinationReports', { page: 1, pageSize: 1000 });
  const examinations = examinationsData.items || [];
  const attendanceList = attendanceData.items || [];
  const markSummary = getMarkEntrySummary();
  const resultSummary = getResultSummary();
  const seatingPlans = seatingPlansData.items || [];
  const assignments = assignmentsData.items || [];
  const reports = reportsData.items || [];
  const examCount = examinations.length;
  const presentCount = attendanceList.filter((record) => record.status === 'present').length;
  const absentCount = attendanceList.filter((record) => record.status === 'absent').length;
  const seatingCount = seatingPlans.length;
  const invigilatorCount = assignments.length;
  const reportCount = reports.length;
  const examsByStatus = useMemo(() => {
    return examinations.reduce((acc, exam) => {
      acc[exam.status || 'scheduled'] = (acc[exam.status || 'scheduled'] || 0) + 1;
      return acc;
    }, {});
  }, [examinations]);
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Examination Dashboard</h1>
          <p className="text-sm text-slate-500">At-a-glance exam status, attendance health, seating readiness, and reporting progress.</p>
        </div>
      </div>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Exams Scheduled</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{examCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Mark Entries</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{markSummary.totalEntries}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Published Results</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{resultSummary.publishedResults}</p>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Attendance Records</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{attendanceList.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Invigilator Assignments</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{invigilatorCount}</p>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Present Students</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{presentCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Absent Students</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600">{absentCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Seating Plans</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{seatingCount}</p>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Exam Status Breakdown</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(examsByStatus).map(([status, count]) => (
            <div key={status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm uppercase tracking-wide text-slate-500">{status}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{count}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Reports and Readiness</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Exam Reports</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{reportCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Assigned Rooms</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{new Set(seatingPlans.map((plan) => plan.roomId)).size}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Assigned Invigilators</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{new Set(assignments.map((assignment) => assignment.teacherId)).size}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
export default ExaminationDashboardPage;