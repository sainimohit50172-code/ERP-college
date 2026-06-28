import React, { useMemo } from 'react';
import { useResourceList } from '../hooks/useResourceHooks';
import { usePermissions } from '../services/permissionHelpers.js';

function ExaminationReportsPage() {
  const perms = usePermissions();
  const { data: reportsData = {}, isLoading } = useResourceList('examinationReports', { page: 1, pageSize: 1000 });
  const { data: examinationsData = {} } = useResourceList('examinations', { page: 1, pageSize: 1000 });
  const { data: studentsData = {} } = useResourceList('students', { page: 1, pageSize: 1000 });
  const reports = reportsData.items || [];
  const examinations = examinationsData.items || [];
  const students = studentsData.items || [];

  const groupedReports = useMemo(() => {
    return reports.reduce((acc, report) => {
      const exam = examinations.find((e) => e.id === report.examId) || { name: report.examId };
      const key = exam.name || report.examId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(report);
      return acc;
    }, {});
  }, [reports, examinations]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Examination Reports</h1>
          <p className="text-sm text-slate-500">Review exam report entries, export summaries, and see report status across exam cycles.</p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Report Entries</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{reports.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Exams Covered</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{Object.keys(groupedReports).length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Review</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600">{reports.filter((report) => report.status === 'pending').length}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Exam Reports</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Exam</th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Score</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-sm text-slate-500">Loading reports…</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-sm text-slate-500">No examination reports available.</td>
                </tr>
              ) : (
                reports.map((report) => {
                  const exam = examinations.find((e) => e.id === report.examId) || {};
                  const student = students.find((s) => s.id === report.studentId) || {};
                  return (
                    <tr key={report.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{exam.name || report.examId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{student.name || report.studentId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{report.score ?? 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{report.status || 'draft'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{new Date(report.updatedAt || report.createdAt || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ExaminationReportsPage;
