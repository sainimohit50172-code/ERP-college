import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, GraduationCap, Printer, Filter, X, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllocationsByCollege } from '../services/allocateSubjectService.js';
import { useERP } from '../services/ERPContext.jsx';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function StudentAllocatedSubjectReportPage() {
  const { colleges = [] } = useERP();
  const navigate = useNavigate();
  const { college } = useParams();
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('subject');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);

  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const selectedCollege = college ? decodeURIComponent(college) : '';
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    document.title = 'Allocated Subject Report - Students';
  }, []);

  const loadAllocations = useCallback(async () => {
    if (!selectedCollege) {
      setAllocations([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getAllocationsByCollege(selectedCollege);
      setAllocations(data || []);
      if (!data || data.length === 0) {
        toast.info('No allocations found for this college');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load allocations');
      setAllocations([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollege]);

  // Load allocations when college is selected
  useEffect(() => {
    void Promise.resolve().then(loadAllocations);
  }, [loadAllocations]);

  // Extract unique values for filters
  const uniqueCourses = useMemo(() => {
    const courses = new Set();
    allocations.forEach((item) => {
      if (item.course) courses.add(item.course);
    });
    return Array.from(courses).sort();
  }, [allocations]);

  const uniqueSemesters = useMemo(() => {
    const semesters = new Set();
    allocations.forEach((item) => {
      if (item.semester) semesters.add(item.semester);
    });
    return Array.from(semesters).sort();
  }, [allocations]);

  const uniqueSections = useMemo(() => {
    const sections = new Set();
    allocations.forEach((item) => {
      if (item.section) sections.add(item.section);
    });
    return Array.from(sections).sort();
  }, [allocations]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...allocations];

    // Text search
    if (searchText.trim()) {
      const normalizedSearch = searchText.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const searchFields = [
          item.subject,
          item.subjectCode,
          item.faculty,
          item.course,
          item.section,
          item.college,
        ].filter(Boolean);

        return searchFields.some((field) =>
          field.toString().toLowerCase().includes(normalizedSearch)
        );
      });
    }

    // Advanced filters
    if (selectedCourse) {
      filtered = filtered.filter((item) => item.course === selectedCourse);
    }
    if (selectedSemester) {
      filtered = filtered.filter((item) => item.semester === selectedSemester);
    }
    if (selectedSection) {
      filtered = filtered.filter((item) => item.section === selectedSection);
    }
    if (selectedStatus) {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'subject':
          aValue = (a.subject || '').toLowerCase();
          bValue = (b.subject || '').toLowerCase();
          break;
        case 'faculty':
          aValue = (a.faculty || '').toLowerCase();
          bValue = (b.faculty || '').toLowerCase();
          break;
        case 'course':
          aValue = (a.course || '').toLowerCase();
          bValue = (b.course || '').toLowerCase();
          break;
        case 'semester':
          aValue = (a.semester || '').toLowerCase();
          bValue = (b.semester || '').toLowerCase();
          break;
        case 'section':
          aValue = (a.section || '').toLowerCase();
          bValue = (b.section || '').toLowerCase();
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    allocations,
    searchText,
    selectedCourse,
    selectedSemester,
    selectedSection,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  // Statistics
  const stats = useMemo(() => {
    return {
      totalRecords: filteredData.length,
      allocatedSubjects: filteredData.filter((item) => item.status === 'Allocated').length,
      uniqueCourses: new Set(filteredData.map((item) => item.course)).size,
      uniqueFaculty: new Set(filteredData.map((item) => item.faculty)).size,
    };
  }, [filteredData]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'S.No',
      'College',
      'Course',
      'Semester',
      'Section',
      'Subject',
      'Subject Code',
      'Faculty',
      'Status',
      'Academic Year',
      'Created Date',
      'Updated Date',
    ];

    const csvRows = [headers.join(',')];

    filteredData.forEach((item, index) => {
      const values = [
        index + 1,
        item.college || '',
        item.course || '',
        item.semester || '',
        item.section || '',
        item.subject || '',
        item.subjectCode || '',
        item.faculty || '',
        item.status || 'Allocated',
        item.academicYear || '',
        item.createdDate || '',
        item.updatedDate || '',
      ];

      csvRows.push(
        values.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
      );
    });

    const blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `allocated-subject-report-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  // Print
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Allocated Subject Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            h1 { font-size: 24px; margin-bottom: 5px; }
            .print-date { font-size: 12px; color: #666; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th {
              background-color: #1e3a5f;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
              border: 1px solid #ccc;
            }
            td {
              padding: 10px;
              border: 1px solid #ddd;
              font-size: 12px;
            }
            tr:nth-child(even) { background-color: #f9fafb; }
            .no-data { text-align: center; padding: 20px; color: #999; }
            @media print {
              body { margin: 0; padding: 10px; }
              table { font-size: 11px; }
              th, td { padding: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Allocated Subject Report</h1>
            <p class="print-date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">S.No</th>
                <th style="width: 12%;">College</th>
                <th style="width: 10%;">Course</th>
                <th style="width: 8%;">Semester</th>
                <th style="width: 8%;">Section</th>
                <th style="width: 15%;">Subject</th>
                <th style="width: 10%;">Subject Code</th>
                <th style="width: 12%;">Faculty</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 10%;">Academic Year</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredData.length === 0
                  ? '<tr><td colspan="10" class="no-data">No records found</td></tr>'
                  : filteredData
                      .map(
                        (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.college || '-'}</td>
                      <td>${item.course || '-'}</td>
                      <td>${item.semester || '-'}</td>
                      <td>${item.section || '-'}</td>
                      <td>${item.subject || '-'}</td>
                      <td>${item.subjectCode || '-'}</td>
                      <td>${item.faculty || '-'}</td>
                      <td>${item.status || 'Allocated'}</td>
                      <td>${item.academicYear || '-'}</td>
                    </tr>
                  `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCourse('');
    setSelectedSemester('');
    setSelectedSection('');
    setSelectedStatus('');
    setPage(1);
  };

  const hasActiveFilters =
    searchText ||
    selectedCourse ||
    selectedSemester ||
    selectedSection ||
    selectedStatus;

  const collegeList = useMemo(() => {
    const collegesToShow = Array.isArray(colleges) ? colleges : [];
    return collegesToShow.map((c) =>
      typeof c === 'string' ? c : c.name || c.label || String(c.id)
    );
  }, [colleges]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-2 sm:px-3 lg:px-4">
        <Breadcrumb
          items={[
            { label: 'Students', href: '/students' },
            { label: 'Reports' },
            { label: 'Allocated Subject Report' },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Allocated Subject Report
          </h1>
          <p className="mt-2 text-slate-600">
            View and manage all subject allocations to courses and semesters
          </p>
        </div>

        {/* College Selection */}
        {!selectedCollege && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-sky-50 p-2.5 text-sky-700">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Choose a college to open the report</h2>
                <p className="mt-1 text-xs text-slate-500">Subject allocations are calculated from the selected college&apos;s records.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collegeList.length ? collegeList.map((college) => (
                <button
                  key={college}
                  type="button"
                  onClick={() => navigate(`/students/reports/allocated-subjects/${encodeURIComponent(college)}`)}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{college}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Open subject allocations</p>
                </button>
              )) : (
                <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No colleges available.</p>
              )}
            </div>
          </section>
        )}

        {/* Statistics */}
        {selectedCollege && (
          <>
            <div className="mb-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">
                  Total Allocations
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.totalRecords}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">
                  Allocated Status
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {stats.allocatedSubjects}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">
                  Unique Courses
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.uniqueCourses}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">Unique Faculty</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stats.uniqueFaculty}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* Search Bar */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    id="allocation-search"
                    name="allocation-search"
                    type="text"
                    placeholder="Search by subject, faculty, course..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4" />
                  Advanced
                </button>
                <button
                  onClick={() => {
                    handleResetFilters();
                    navigate('/students/reports/allocated-subjects');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Change College
                </button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mb-4 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Course
                    </label>
                    <select
                      id="course-filter"
                      name="course-filter"
                      value={selectedCourse}
                      onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                    >
                      <option value="">All Courses</option>
                      {uniqueCourses.map((course, idx) => (
                        <option key={idx} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Semester
                    </label>
                    <select
                      id="semester-filter"
                      name="semester-filter"
                      value={selectedSemester}
                      onChange={(e) => {
                        setSelectedSemester(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                    >
                      <option value="">All Semesters</option>
                      {uniqueSemesters.map((sem, idx) => (
                        <option key={idx} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Section
                    </label>
                    <select
                      id="section-filter"
                      name="section-filter"
                      value={selectedSection}
                      onChange={(e) => {
                        setSelectedSection(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                    >
                      <option value="">All Sections</option>
                      {uniqueSections.map((sec, idx) => (
                        <option key={idx} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status-filter"
                      name="status-filter"
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                    >
                      <option value="">All Status</option>
                      <option value="Allocated">Allocated</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <div className="flex items-end">
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <X className="h-4 w-4" />
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Show:</span>
                  <select
                    id="page-size"
                    name="page-size"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} records
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportCsv}
                    disabled={filteredData.length === 0 || isLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={filteredData.length === 0 || isLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <Printer className="h-4 w-4" />
                    Print Report
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-12">S.No</th>
                    <th
                      className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setSortBy('college');
                        setSortOrder(
                          sortOrder === 'asc' ? 'desc' : 'asc'
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        College
                        {sortBy === 'college' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setSortBy('course');
                        setSortOrder(
                          sortOrder === 'asc' ? 'desc' : 'asc'
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        Course
                        {sortBy === 'course' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Semester</th>
                    <th className="px-6 py-4 font-semibold">Section</th>
                    <th
                      className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setSortBy('subject');
                        setSortOrder(
                          sortOrder === 'asc' ? 'desc' : 'asc'
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        Subject
                        {sortBy === 'subject' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Subject Code</th>
                    <th
                      className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setSortBy('faculty');
                        setSortOrder(
                          sortOrder === 'asc' ? 'desc' : 'asc'
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        Faculty
                        {sortBy === 'faculty' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Academic Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <div className="flex items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#1e3a5f]" />
                          <span className="ml-2">Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <p>No records found matching your filters.</p>
                        {hasActiveFilters && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-3 text-[#1e3a5f] hover:underline text-sm font-semibold"
                          >
                            Clear filters and try again
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {item.college || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {item.course || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {item.semester || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                            {item.section || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {item.subject || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-xs font-mono">
                          {item.subjectCode || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {item.faculty || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              item.status === 'Allocated'
                                ? 'bg-green-50 text-green-700'
                                : item.status === 'Pending'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.status || 'Allocated'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {item.academicYear || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
                <p className="text-sm text-slate-600">
                  Showing{' '}
                  <span className="font-semibold">
                    {(page - 1) * pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold">
                    {Math.min(page * pageSize, filteredData.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold">{filteredData.length}</span>{' '}
                  records
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                              page === pageNum
                                ? 'bg-[#1e3a5f] text-white'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
