import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCog, FaCopy, FaFileExport, FaPlus, FaPrint, FaRedo, FaUserTie, FaTimes } from 'react-icons/fa';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useResourceList } from '../hooks/useResourceHooks';

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const defaultFilters = {
  college: 'All',
  course: 'All',
  semester: 'All',
  section: 'All',
  status: 'All',
};

const filterOptions = {
  college: ['All', 'Roorkee College of Smart Computing'],
  course: ['All', 'B.Tech. Hons. CSE', 'BCA', 'BCA AI-ML', 'MCA'],
  semester: ['All', 'Sem 3', 'Sem 5'],
  section: ['All', 'A', 'B', 'C'],
  status: ['All', 'Assigned', 'Expired'],
};

const defaultRows = [
  {
    id: 'row-1',
    college: 'Roorkee College of Smart Computing',
    meta: '(7 lecture with break)',
    course: 'B.Tech. Hons. CSE',
    semester: 'Sem 3',
    section: 'A',
    endDate: '31/07/2026',
    status: 'Assigned',
    teacher: 'Dr. Anjali Sharma',
  },
  {
    id: 'row-2',
    college: 'Roorkee College of Smart Computing',
    meta: '(7 lecture with break)',
    course: 'B.Tech. Hons. CSE',
    semester: 'Sem 3',
    section: 'B',
    endDate: '31/07/2026',
    status: 'Assigned',
    teacher: 'Dr. Anjali Sharma',
  },
  {
    id: 'row-3',
    college: 'Roorkee College of Smart Computing',
    meta: '(7 lecture with break)',
    course: 'B.Tech. Hons. CSE',
    semester: 'Sem 3',
    section: 'C',
    endDate: '31/07/2026',
    status: 'Assigned',
    teacher: 'Dr. Anjali Sharma',
  },
  {
    id: 'row-4',
    college: 'Roorkee College of Smart Computing',
    meta: '(7 lecture with break)',
    course: 'BCA',
    semester: 'Sem 3',
    section: 'A',
    endDate: '19/07/2026',
    status: 'Expired',
    teacher: 'Prof. Nikhil Verma',
  },
  {
    id: 'row-5',
    college: 'Roorkee College of Smart Computing',
    meta: '(7 lecture with break)',
    course: 'BCA',
    semester: 'Sem 5',
    section: 'A',
    endDate: '19/07/2026',
    status: 'Expired',
    teacher: 'Prof. Nikhil Verma',
  },
  {
    id: 'row-6',
    college: 'Roorkee College of Smart Computing',
    meta: '(BCA AI-ML)',
    course: 'BCA AI-ML',
    semester: 'Sem 3',
    section: 'B',
    endDate: '19/07/2026',
    status: 'Expired',
    teacher: 'Prof. Nikhil Verma',
  },
  {
    id: 'row-7',
    college: 'Roorkee College of Smart Computing',
    meta: '(7 lecture with break)',
    course: 'MCA',
    semester: 'Sem 3',
    section: 'A',
    endDate: '19/07/2026',
    status: 'Expired',
    teacher: 'Prof. Nikhil Verma',
  },
];

const statusClasses = {
  Assigned: 'bg-emerald-500/15 text-emerald-700',
  Expired: 'bg-rose-500/15 text-rose-700',
};

export default function TimetableManagementPage() {
  const { data: timetablesData } = useResourceList('timetables', { page: 1, pageSize: 200 });
  const dataItems = Array.isArray(timetablesData?.items) && timetablesData.items.length > 0 ? timetablesData.items : defaultRows;
  const [rows, setRows] = useState(dataItems);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showToStudents, setShowToStudents] = useState(true);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [replaceRowId, setReplaceRowId] = useState(dataItems[0]?.id || '');
  const [replaceTeacher, setReplaceTeacher] = useState('');

  useEffect(() => {
    if (Array.isArray(timetablesData?.items) && timetablesData.items.length > 0) {
      setRows(timetablesData.items);
      setReplaceRowId(timetablesData.items[0]?.id || '');
    }
  }, [timetablesData]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((item) => {
      if (filters.college !== 'All' && item.college !== filters.college) return false;
      if (filters.course !== 'All' && item.course !== filters.course) return false;
      if (filters.semester !== 'All' && item.semester !== filters.semester) return false;
      if (filters.section !== 'All' && item.section !== filters.section) return false;
      if (filters.status !== 'All' && item.status !== filters.status) return false;
      if (!normalizedSearch) return true;
      return [item.college, item.meta, item.course, item.semester, item.section, item.endDate, item.status, item.teacher]
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [rows, filters, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const displayedRows = filteredRows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearch('');
    setPage(1);
  };

  const handleCopy = async () => {
    const payload = displayedRows.map((item, index) => `${(page - 1) * pageSize + index + 1}. ${item.college} | ${item.course} | ${item.semester} | ${item.section} | ${item.endDate} | ${item.status}`);
    try {
      await navigator.clipboard.writeText(payload.join('\n'));
    } catch {
      // ignore clipboard failure in older browsers
    }
  };

  const handleAddNew = () => setShowAddPanel(true);
  const handleReplaceTeacher = () => setIsReplaceOpen(true);

  const handleAddSave = () => {
    const nextRow = {
      id: `row-${Date.now()}`,
      college: 'Roorkee College of Smart Computing',
      meta: '(7 lecture with break)',
      course: 'B.Tech. Hons. CSE',
      semester: 'Sem 3',
      section: 'A',
      endDate: '31/07/2026',
      status: 'Assigned',
      teacher: replaceTeacher || 'Dr. Anjali Sharma',
    };
    setRows((current) => [nextRow, ...current]);
    setShowAddPanel(false);
    setReplaceTeacher('');
  };

  const dropdownRef = useRef(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({ left: 0, top: 0, openUp: false });

  useEffect(() => {
    function handleDocumentClick(e) {
      const btn = e.target.closest('[data-action-button]');
      if (btn) return; // clicked on a settings button - let its onClick handle toggle
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    }

    function handleKeydown(e) {
      if (e.key === 'Escape') setOpenDropdownId(null);
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  function handleToggleDropdown(e, id) {
    e.stopPropagation();
    const btn = e.currentTarget;
    if (!btn) return setOpenDropdownId(null);
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      return;
    }

    const rect = btn.getBoundingClientRect();
    const menuWidth = 208; // px
    const menuHeight = 44 * 4; // approx
    const gap = 6;

    let left = rect.right - menuWidth; // align right edge of menu with button
    let top = rect.bottom + gap;
    // keep inside viewport horizontally
    const minMargin = 8;
    if (left < minMargin) left = minMargin;
    if (left + menuWidth > window.innerWidth - minMargin) left = window.innerWidth - minMargin - menuWidth;
    // open upward if it would overflow bottom
    if (top + menuHeight > window.innerHeight - minMargin) {
      top = rect.top - menuHeight - gap;
    }
    if (top < minMargin) top = minMargin;

    setDropdownStyle({ left, top, openUp: top < rect.top });
    setOpenDropdownId(id);
  }

  const handleReplaceSave = () => {
    if (!replaceRowId) return;
    setRows((current) => current.map((item) =>
      item.id === replaceRowId ? { ...item, teacher: replaceTeacher || item.teacher } : item
    ));
    setIsReplaceOpen(false);
    setReplaceTeacher('');
  };

  // View Time Table overlay state (UI-only)
  const [viewTtOpen, setViewTtOpen] = useState(false);
  const [viewTtItem, setViewTtItem] = useState(null);

  // sample schedule generator (UI-only, does not modify backend data)
  function makeSampleSchedule(item) {
    const subjects = [
      { name: 'Discrete Mathematics', teacher: 'Ravindra Kr Arya' },
      { name: 'Object Oriented Programming using Java', teacher: 'Bhuvnesh Kumar' },
      { name: 'Operating System', teacher: 'Narayan Jee' },
      { name: 'Python Programming', teacher: 'Upendra Kumar' },
      { name: 'Introduction to Artificial Intelligence', teacher: 'Rajiv Rajan Patel' },
      { name: 'Soft Skills and Verbal Communication-II', teacher: 'Vimal Panday' },
      { name: 'Object Oriented Programming using Java', teacher: 'Bhuvnesh Kumar' },
    ];

    const grid = [];
    for (let i = 0; i < 7; i++) {
      const row = { lecture: `Lect ${i + 1}`, timing: `${9 + i}:00 - ${9 + i + 1}:00`, cells: [] };
      for (let d = 0; d < 7; d++) {
        if ((i + d) % 2 === 0) {
          const s = subjects[(i + d) % subjects.length];
          row.cells.push({ subject: s.name, teacher: s.teacher });
        } else {
          row.cells.push(null);
        }
      }
      grid.push(row);
    }
    return grid;
  }

  const [viewSchedule, setViewSchedule] = useState(makeSampleSchedule(defaultRows[0]));

  function openViewTimetable(item) {
    setViewTtItem(item);
    setViewSchedule(makeSampleSchedule(item || defaultRows[0]));
    setOpenDropdownId(null);
    setViewTtOpen(true);
  }

  function closeViewTimetable() {
    setViewTtOpen(false);
    setViewTtItem(null);
  }

  function addLectureRow() {
    setViewSchedule((cur) => {
      const nextIndex = cur.length + 1;
      const next = { lecture: `Lect ${nextIndex}`, timing: `16:00 - 16:55`, cells: Array(7).fill(null) };
      return [...cur, next];
    });
  }

  function deleteLastLectureRow() {
    setViewSchedule((cur) => (cur.length > 0 ? cur.slice(0, -1) : cur));
  }

  return (
    <div className="min-h-screen bg-white px-0 pb-8 pt-1">
      <div className="mx-[-5px] px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Breadcrumb
              items={[
                { label: 'Dashboard', to: '/' },
                { label: 'Academics Setup', to: '/settings/institute' },
                { label: 'Time Table' },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Time Table</h1>
              <span className="text-sm text-slate-500">Time Table</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowToStudents((current) => !current)}
              className="inline-flex h-11 items-center gap-4 rounded-[20px] bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <span>Show to Students on App</span>
              <span className={`relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${showToStudents ? 'bg-emerald-400' : 'bg-slate-400'}`}>
                <span className={`inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow transition duration-200 ${showToStudents ? 'translate-x-6' : 'translate-x-1'}`} />
              </span>
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <FaFileExport className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <FaPrint className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <FaPlus className="h-4 w-4" />
              Add New Time Table
            </button>
          </div>
        </div>

        {showAddPanel && (
          <div className="mt-5 w-full relative overflow-hidden rounded-[20px] bg-slate-100 px-4 py-4 shadow-sm" style={{ height: '100px' }}>
            <button
              type="button"
              onClick={() => setShowAddPanel(false)}
              aria-label="Close add panel"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FaTimes className="h-4 w-4" />
            </button>
            <div className="flex h-full items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <span>College</span>
                  <select
                    value={filters.college}
                    onChange={(event) => handleFilterChange('college', event.target.value)}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  >
                    {filterOptions.college.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-3" style={{ transform: 'translateX(-30px)' }}>
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <FaFileExport className="h-4 w-4" />
                  Export
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <FaPrint className="h-4 w-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <button
            type="button"
            onClick={handleResetFilters}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Refresh filters"
          >
            <FaRedo className="h-4 w-4" />
          </button>

          <div className="grid gap-3 md:grid-cols-6">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              College
              <select
                value={filters.college}
                onChange={(event) => handleFilterChange('college', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              >
                {filterOptions.college.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Course
              <select
                value={filters.course}
                onChange={(event) => handleFilterChange('course', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              >
                {filterOptions.course.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Semester
              <select
                value={filters.semester}
                onChange={(event) => handleFilterChange('semester', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              >
                {filterOptions.semester.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Section
              <select
                value={filters.section}
                onChange={(event) => handleFilterChange('section', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              >
                {filterOptions.section.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Status
              <select
                value={filters.status}
                onChange={(event) => handleFilterChange('status', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              >
                {filterOptions.status.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Search
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              />
            </label>
          </div>
        </div>

        {/* View Time Table overlay (full content area) */}
        {viewTtOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-950">{viewTtItem?.college || 'Roorkee College of Smart Computing'}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>{viewTtItem?.course || 'B.Tech. Hons. CSE'}</span>
                  <span>•</span>
                  <span>{viewTtItem?.semester || 'Sem 3'}</span>
                  <span>•</span>
                  <span>{viewTtItem?.section || 'A'}</span>
                  <span className="mx-2">|</span>
                  <span className="font-medium text-slate-700">{viewTtItem?.meta || 'SCHEDULE: 7 LECTURE WITH BREAK'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowToStudents((c) => !c)}
                    className="inline-flex h-11 items-center gap-3 rounded-[20px] bg-white px-4 text-sm font-medium text-slate-700 border border-slate-200 shadow-sm"
                  >
                    <span>Show to Students on App</span>
                    <span className={`relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${showToStudents ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${showToStudents ? 'translate-x-6' : 'translate-x-1'}`} />
                    </span>
                  </button>
                  <button type="button" onClick={handleCopy} className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#1e3a5f] px-4 text-sm font-semibold text-white shadow-sm">
                    <FaFileExport className="h-4 w-4" />
                    Export
                  </button>
                  <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#1e3a5f] px-4 text-sm font-semibold text-white shadow-sm">
                    <FaPrint className="h-4 w-4" />
                    Print
                  </button>
                </div>

                <button type="button" onClick={closeViewTimetable} aria-label="Close timetable" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 shadow-sm">
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="overflow-hidden">
                <table className="w-full border-collapse text-sm text-slate-900" style={{ tableLayout: 'fixed', borderSpacing: 0 }}>
                  <colgroup>
                    <col style={{ width: '70px' }} />
                    <col style={{ width: '180px' }} />
                    <col style={{ width: '170px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '150px' }} />
                  </colgroup>
                  <thead>
                    <tr className="text-left text-[12px] uppercase tracking-[0.12em] text-white">
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 text-center font-semibold">S.No</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 font-semibold">Lecture Name</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 font-semibold">Lecture Timing</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 text-center font-semibold">Monday</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 text-center font-semibold">Tuesday</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 text-center font-semibold">Wednesday</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 text-center font-semibold">Thursday</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 text-center font-semibold">Friday</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 text-center font-semibold">Saturday</th>
                      <th className="h-12 bg-[#1e3a5f] px-3 py-3 text-center font-semibold">Sunday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewSchedule.map((row, rIndex) => (
                      <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="h-[84px] whitespace-nowrap px-3 py-2 text-center text-slate-700">{rIndex + 1}</td>
                        <td className="h-[84px] px-3 py-2 align-middle text-slate-900">
                          <div className="break-words font-medium">{row.lecture}</div>
                        </td>
                        <td className="h-[84px] px-3 py-2 align-middle text-slate-900">
                          <div className="break-words font-medium">{row.timing}</div>
                        </td>
                        {row.cells.map((c, cIndex) => (
                          <td key={`${rIndex}-${cIndex}`} className="h-[84px] px-2 py-2 align-middle">
                            {c ? (
                              <div className="flex h-full min-h-[60px] w-full flex-col items-center justify-center rounded-md border border-slate-200 bg-slate-100 p-2 text-center text-[11px] text-slate-800">
                                <div className="w-full font-semibold leading-tight">{c.subject}</div>
                                <div className="mt-1 w-full text-[10px] leading-tight text-slate-600">{c.teacher}</div>
                              </div>
                            ) : (
                              <div className="h-full min-h-[60px] w-full rounded-md border border-dashed border-slate-200 bg-transparent" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button type="button" onClick={addLectureRow} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white">Add Lecture Number</button>
                <button type="button" onClick={deleteLastLectureRow} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Delete Last Row</button>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleReplaceTeacher} className="inline-flex items-center gap-2 rounded-[10px] bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white">Edit</button>
                <button type="button" onClick={handleReplaceTeacher} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Edit & Assign</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm text-slate-900" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '7%' }} />
              </colgroup>
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-[0.18em] text-white">
                  <th className="sticky top-0 bg-[#1e3a5f] px-4 py-4 font-semibold">S.No</th>
                  <th className="sticky top-0 bg-[#1e3a5f] px-4 py-4 font-semibold">College</th>
                  <th className="sticky top-0 bg-[#1e3a5f] px-4 py-4 font-semibold">Course</th>
                  <th className="sticky top-0 bg-[#1e3a5f] px-4 py-4 font-semibold">Semester</th>
                  <th className="sticky top-0 bg-[#1e3a5f] px-4 py-4 font-semibold">Section</th>
                  <th className="sticky top-0 bg-[#1e3a5f] px-4 py-4 font-semibold">End Date</th>
                  <th className="sticky top-0 bg-[#1e3a5f] px-4 py-4 font-semibold">Status</th>
                  <th className="sticky top-0 bg-[#1e3a5f] px-4 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-700">{(page - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{item.college}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.meta}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-900">{item.course}</td>
                    <td className="px-4 py-4 text-slate-900">{item.semester}</td>
                    <td className="px-4 py-4 text-slate-900">{item.section}</td>
                    <td className="px-4 py-4 text-slate-900">{item.endDate}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] ${statusClasses[item.status] || 'bg-slate-200/80 text-slate-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center relative">
                      <button
                        type="button"
                        data-action-button
                        onClick={(e) => handleToggleDropdown(e, item.id)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                        aria-label="Action"
                      >
                        <FaCog className="h-4 w-4" />
                      </button>

                      {openDropdownId === item.id && (
                        <div
                          ref={dropdownRef}
                          role="menu"
                          aria-label="Action menu"
                          style={{ position: 'fixed', left: dropdownStyle.left, top: dropdownStyle.top, width: 208 }}
                          className="z-50 rounded-md border border-slate-200 bg-white shadow-md"
                        >
                          <ul className="divide-y divide-slate-100">
                            <li>
                              <button
                                type="button"
                                onClick={() => openViewTimetable(item)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100 cursor-pointer"
                              >
                                View Time Table
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => setOpenDropdownId(null)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100 cursor-pointer"
                              >
                                Assign Time Table
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => setOpenDropdownId(null)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100 cursor-pointer"
                              >
                                Override Schedule
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => setOpenDropdownId(null)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100 cursor-pointer"
                              >
                                View Edit Logs
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>Items Per Page</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 sm:justify-end">
              <span>{`${(page - 1) * pageSize + 1} - ${Math.min(page * pageSize, filteredRows.length)} of ${filteredRows.length}`}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
                  disabled={page === pageCount}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>


        {isReplaceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center background-slate-950/40 p-4">
            <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Replace Teacher</h2>
                  <p className="mt-1 text-sm text-slate-500">Update teacher for a selected timetable entry.</p>
                </div>
                <button type="button" onClick={() => setIsReplaceOpen(false)} className="text-slate-500 transition hover:text-slate-900">Close</button>
              </div>
              <div className="grid gap-4">
                <label className="text-sm font-medium text-slate-700">Select entry</label>
                <select
                  value={replaceRowId}
                  onChange={(event) => setReplaceRowId(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                >
                  {rows.map((item) => (
                    <option key={item.id} value={item.id}>{`${item.college} • ${item.course} • ${item.section}`}</option>
                  ))}
                </select>
                <label className="text-sm font-medium text-slate-700">New teacher</label>
                <input
                  type="text"
                  value={replaceTeacher}
                  onChange={(event) => setReplaceTeacher(event.target.value)}
                  placeholder="New teacher name"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsReplaceOpen(false)} className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={handleReplaceSave} className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#1e3a5f] px-5 text-sm font-semibold text-white transition hover:bg-slate-800">Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
