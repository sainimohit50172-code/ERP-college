import { useMemo, useState } from 'react';
import { Download, Printer, Search } from 'lucide-react';
import { useResourceList } from '../hooks/useResourceHooks.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function SubjectCombinationReportPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: subjectsData, isLoading: isLoadingSubjects, error: subjectsError } = useResourceList('subjects', {
    page,
    page_size: pageSize,
  });

  const { data: coursesData } = useResourceList('courses', {
    page: 1,
    page_size: 200,
  });

  const subjects = subjectsData?.items || [];
  const courses = coursesData?.items || [];
  const total = subjectsData?.total || 0;
  const pages = subjectsData?.pages || 1;

  const subjectCourseMap = useMemo(() => {
    return courses.reduce((map, course) => {
      map[course.id] = course;
      return map;
    }, {});
  }, [courses]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const normalizedSearch = searchText.trim().toLowerCase();
      const courseName = subjectCourseMap[subject.course_id]?.name || '';
      const courseCode = subjectCourseMap[subject.course_id]?.code || '';
      const matchesSearch =
        !normalizedSearch ||
        [subject.name, subject.code, courseName, courseCode]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(normalizedSearch));

      const matchesCourse = !selectedCourse || String(subject.course_id) === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [subjects, searchText, selectedCourse, subjectCourseMap]);

  const courseOptions = courses.map((course) => ({
    id: course.id,
    label: `${course.name}${course.code ? ` (${course.code})` : ''}`,
  }));

  const pageFrom = subjects.length > 0 ? (pageSize * (page - 1)) + 1 : 0;
  const pageTo = subjects.length > 0 ? pageFrom + subjects.length - 1 : 0;

  const downloadCsv = (rows) => {
    const header = ['S.No', 'Subject Code', 'Subject Name', 'Course Name', 'Course Code'];
    const csvRows = [header.join(',')];

    rows.forEach((row, index) => {
      const course = subjectCourseMap[row.course_id] || {};
      const values = [
        index + 1,
        row.code || '',
        row.name || '',
        course.name || '',
        course.code || '',
      ];
      csvRows.push(values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'subject-combination-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/' },
              { label: 'Admission Reports', to: '/admissions/reports/summary' },
              { label: 'Subject Combination Report' },
            ]}
          />
          <h1 className="mt-3 text-3xl font-semibold text-primary-navy">Subject Combination Report</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Explore subject combinations using live backend data. Filter by course, search by subject, and export or print the current report.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => downloadCsv(filteredSubjects)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-navy px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-navy-dark"
          >
            <Download size={16} /> Export
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={16} className="text-slate-500" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search by subject code, name or course"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Course</label>
              <select
                value={selectedCourse}
                onChange={(event) => {
                  setSelectedCourse(event.target.value);
                  setPage(1);
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/10"
              >
                <option value="">All Courses</option>
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>{course.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Page size</label>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/10"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-end">
              <div className="text-right text-sm text-slate-600">
                <div>Total subjects: <span className="font-semibold text-slate-900">{total}</span></div>
                <div>Current rows: <span className="font-semibold text-slate-900">{filteredSubjects.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm text-slate-700">
            <thead className="bg-primary-navy text-white">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">S.No</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Subject Code</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Subject Name</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Course Name</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold uppercase tracking-[0.12em]">Course Code</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingSubjects ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center text-slate-500">Loading subject combinations...</td>
                </tr>
              ) : subjectsError ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center text-red-600">Failed to load subject data. Please refresh the page.</td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center text-slate-500">No subject combinations found.</td>
                </tr>
              ) : (
                filteredSubjects.map((subject, index) => (
                  <tr key={subject.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-900">{pageFrom + index}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-900">{subject.code || '—'}</td>
                    <td className="px-4 py-4 text-slate-900">{subject.name || '—'}</td>
                    <td className="px-4 py-4 text-slate-700">{subjectCourseMap[subject.course_id]?.name || '—'}</td>
                    <td className="px-4 py-4 text-slate-700">{subjectCourseMap[subject.course_id]?.code || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Showing {pageFrom} to {pageTo} of {total} subjects.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-700">Page {page} of {pages}</span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
