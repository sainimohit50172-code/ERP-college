import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
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

const weekdayHeaders = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const scheduleOptions = ['BCA B', 'B.Tech. Hons. CSE', 'MCA A'];
const subjectOptions = [
  'Software Engineering',
  'Operating System',
  'Operating System Practical',
  'DBMS',
  'DBMS Lab',
  'Python Programming',
  'Python Lab',
  'Artificial Intelligence',
  'Computer Networks',
  'Data Structures',
  'Java Programming',
  'Java Lab',
  'Soft Skills',
  'Environmental Studies',
];
const assignEmployeeOptions = [
  'Ravindra Kr Arya',
  'Bhuvnesh Kumar',
  'Neha Sharma',
  'Vimal Pandey',
  'Rajeev Kumar',
  'Deepak Singh',
];
const assignSubjectOptions = [
  'Software Engineering',
  'Operating System',
  'DBMS',
  'Artificial Intelligence',
  'Python Programming',
  'Computer Networks',
  'Java Programming',
  'Data Structures',
];
const teacherOptions = [
  'Prof. Amit Sharma',
  'Prof. Neha Verma',
  'Prof. Shalini Rao',
  'Prof. Vimal Pandey',
  'Prof. Rajeev Kumar',
  'Prof. Ankit Gupta',
  'Prof. Deepak Singh',
  'Prof. Priya Sharma',
  'Prof. Mohit Verma',
];
const sequenceOptions = Array.from({ length: 10 }, (_, index) => `${index + 1}`);
const roomOptions = ['A101', 'A102', 'A103', 'B201', 'B202', 'B203', 'C301', 'Lab-1', 'Lab-2', 'Lab-3'];

function createBlankSchedule(lectureCount = 7) {
  const timings = ['09:10 - 10:05', '10:05 - 11:00', '11:00 - 12:05', '12:05 - 13:00', '14:00 - 14:55', '14:55 - 15:50', '15:50 - 16:45'];
  return Array.from({ length: lectureCount }, (_, index) => ({
    sno: index + 1,
    lecture: `Lect ${index + 1}`,
    timing: timings[index] || `${9 + index}:00 - ${10 + index}:00`,
    cells: Array(7).fill(null),
  }));
}

export default function TimetableManagementPage() {
  const { data: timetablesData } = useResourceList('timetables', { page: 1, pageSize: 200 });
  const dataItems = Array.isArray(timetablesData?.items) && timetablesData.items.length > 0 ? timetablesData.items : defaultRows;
  const [rows, setRows] = useState(dataItems);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [addMode, setAddMode] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [assignedTill, setAssignedTill] = useState('2026-07-31');
  const [showToStudents, setShowToStudents] = useState(true);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [replaceRowId, setReplaceRowId] = useState(dataItems[0]?.id || '');
  const [replaceTeacher, setReplaceTeacher] = useState('');
  const [viewTtOpen, setViewTtOpen] = useState(false);
  const [viewTtItem, setViewTtItem] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [popupSubject, setPopupSubject] = useState('');
  const [popupTeacher, setPopupTeacher] = useState('');
  const [popupSequence, setPopupSequence] = useState('1');
  const [popupRoom, setPopupRoom] = useState('');
  const [popupIsBreak, setPopupIsBreak] = useState(false);
  const [isCellPopupOpen, setIsCellPopupOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [assignStartDate, setAssignStartDate] = useState('2026-07-01');
  const [assignEndDate, setAssignEndDate] = useState('2026-07-31');
  const [assignEmployee, setAssignEmployee] = useState(assignEmployeeOptions[0]);
  const [assignSubject, setAssignSubject] = useState(assignSubjectOptions[0]);
  const [overrideStartDate, setOverrideStartDate] = useState('2026-07-01');
  const [overrideEndDate, setOverrideEndDate] = useState('2026-07-31');
  const [overrideEmployee, setOverrideEmployee] = useState(assignEmployeeOptions[0]);
  const [overrideSubject, setOverrideSubject] = useState(assignSubjectOptions[0]);

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

  const generateScheduleCsv = () => {
    const header = ['S.No', 'Lecture Name', 'Lecture Timing', ...weekdayHeaders].join(',');
    const rowsCsv = viewSchedule.map((row) => [
      row.sno,
      `"${row.lecture}"`,
      `"${row.timing}"`,
      ...row.cells.map((cell) => (cell ? `"${cell.subject} - ${cell.teacher}"` : '""')),
    ].join(','));
    return [header, ...rowsCsv].join('\n');
  };

  const handleExportSchedule = () => {
    const csv = generateScheduleCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `timetable-${selectedSchedule || 'schedule'}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  const handleAddNew = () => {
    setAddMode(true);
    setSelectedCollege('');
    setSelectedSchedule('');
    setViewSchedule([]);
    setActiveCell(null);
    setIsCellPopupOpen(false);
  };

  const handleCollegeSelect = (value) => {
    setSelectedCollege(value);
    setSelectedSchedule('');
    setViewSchedule([]);
    setActiveCell(null);
    setIsCellPopupOpen(false);
  };

  const handleScheduleSelect = (value) => {
    setSelectedSchedule(value);
    setViewSchedule(value ? createBlankSchedule() : []);
    setActiveCell(null);
    setIsCellPopupOpen(false);
  };

  const toggleShowToStudents = () => {
    setShowToStudents((current) => !current);
  };

  const filteredSubjectOptions = subjectOptions;

  const getTeacherOptions = () => teacherOptions;

  const handleCellClick = (rowIndex, dayIndex) => {
    const cell = viewSchedule?.[rowIndex]?.cells?.[dayIndex] || null;
    setActiveCell({ rowIndex, dayIndex });
    setPopupSubject(cell?.subject || '');
    setPopupTeacher(cell?.teacher || '');
    setPopupSequence(cell?.sequence?.toString() || `${viewSchedule[rowIndex]?.sno || 1}`);
    setPopupRoom(cell?.room || '');
    setPopupIsBreak(!!cell?.isBreak);
    setIsCellPopupOpen(true);
  };

  const closeCellPopup = () => {
    setIsCellPopupOpen(false);
    setActiveCell(null);
  };

  const modalRef = useRef(null);
  const assignModalRef = useRef(null);
  const overrideModalRef = useRef(null);

  function closeAssignModal() {
    setIsAssignOpen(false);
    setSelectedActionItem(null);
  }

  function closeOverrideModal() {
    setIsOverrideOpen(false);
    setSelectedActionItem(null);
  }

  function handleAssignNew() {
    if (!selectedActionItem) return;
    setRows((current) => current.map((item) => (item.id === selectedActionItem.id ? {
      ...item,
      meta: `(${assignSubject})`,
      teacher: assignEmployee,
      status: 'Assigned',
      endDate: assignEndDate,
    } : item)));
    closeAssignModal();
  }

  function handleOverrideSchedule() {
    if (!selectedActionItem) return;
    setRows((current) => current.map((item) => (item.id === selectedActionItem.id ? {
      ...item,
      meta: `(${overrideSubject})`,
      teacher: overrideEmployee,
      status: 'Assigned',
      endDate: overrideEndDate,
    } : item)));
    closeOverrideModal();
  }

  function CenteredCellModal() {
    if (!isCellPopupOpen || !activeCell) return null;

    const lectureNumber = viewSchedule[activeCell.rowIndex]?.sno;
    const weekday = weekdayHeaders[activeCell.dayIndex];
    const teacherOptions = getTeacherOptions();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <div
          className="absolute inset-0 bg-black/35 transition-opacity"
          onClick={closeCellPopup}
          aria-hidden="true"
        />
        <div
          role="dialog"
          aria-modal="true"
          ref={modalRef}
          className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
          style={{ maxHeight: '80vh' }}
          onClick={(event) => event.stopPropagation()}
        >
                <div className="flex items-start justify-between gap-4 px-6 py-5">
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight text-slate-950">Select Subject for {weekday}</h2>
              <p className="mt-1 text-[13px] text-slate-500">Lecture {lectureNumber}</p>
            </div>
            <button
              type="button"
              onClick={closeCellPopup}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              aria-label="Close subject selector"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          <div className="border-t border-slate-200 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-3">
                <label className="flex flex-col gap-1 text-[13px] font-medium text-slate-700">
                  Select Subject
                  <select
                    value={popupSubject}
                    onChange={(event) => setPopupSubject(event.target.value)}
                    className="h-9 w-full rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">Select Subject</option>
                    {filteredSubjectOptions.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-[13px] font-medium text-slate-700">
                  Sequence Number
                  <select
                    value={popupSequence}
                    onChange={(event) => setPopupSequence(event.target.value)}
                    className="h-9 w-full rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">Select Sequence</option>
                    {sequenceOptions.map((seq) => (
                      <option key={seq} value={seq}>{seq}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-[13px] font-medium text-slate-700">
                  Enter Room Number
                  <select
                    value={popupRoom}
                    onChange={(event) => setPopupRoom(event.target.value)}
                    className="h-9 w-full rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">Select Room</option>
                    {roomOptions.map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-3">
                <label className="flex flex-col gap-1 text-[13px] font-medium text-slate-700">
                  Select Employees / Faculty
                  <select
                    value={popupTeacher}
                    onChange={(event) => setPopupTeacher(event.target.value)}
                    className="h-9 w-full rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">Select Teacher</option>
                    {teacherOptions.map((teacher) => (
                      <option key={teacher} value={teacher}>{teacher}</option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center justify-between gap-3 text-[13px] font-medium text-slate-700">
                  <span>Is Break</span>
                  <button
                    type="button"
                    onClick={() => setPopupIsBreak((current) => !current)}
                    className={`relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${popupIsBreak ? 'bg-emerald-400' : 'bg-slate-300'}`}
                    aria-pressed={popupIsBreak}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${popupIsBreak ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={closeCellPopup}
              className="inline-flex h-9 items-center justify-center rounded-[6px] border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDeleteCell}
              className="inline-flex h-9 items-center justify-center rounded-[6px] border border-rose-200 bg-rose-50 px-4 text-[13px] font-medium text-rose-700 transition hover:bg-rose-100"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={handleSaveCell}
              className="inline-flex h-9 items-center justify-center rounded-[6px] bg-[#1e3a5f] px-4 text-[13px] font-medium text-white transition hover:bg-slate-800"
            >
              Push
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveCell = () => {
    if (!activeCell || !popupSubject || !popupTeacher) return;
    setViewSchedule((current) => current.map((row, rIndex) => {
      if (rIndex !== activeCell.rowIndex) return row;
      return {
        ...row,
        cells: row.cells.map((cell, cIndex) => {
          if (cIndex !== activeCell.dayIndex) return cell;
          return {
            subject: popupSubject,
            teacher: popupTeacher,
            sequence: popupSequence,
            room: popupRoom,
            isBreak: popupIsBreak,
          };
        }),
      };
    }));
    closeCellPopup();
  };

  const handleDeleteCell = () => {
    if (!activeCell) return;
    setViewSchedule((current) => current.map((row, rIndex) => {
      if (rIndex !== activeCell.rowIndex) return row;
      return {
        ...row,
        cells: row.cells.map((cell, cIndex) => (cIndex === activeCell.dayIndex ? null : cell)),
      };
    }));
    closeCellPopup();
  };


  const handleAssignedTillChange = (value) => setAssignedTill(value);

  const handleCancelAddMode = () => {
    setAddMode(false);
    setSelectedCollege('');
    setSelectedSchedule('');
    setViewSchedule([]);
    setActiveCell(null);
    setIsCellPopupOpen(false);
  };

  const handleSaveTimetable = () => {
    if (!selectedCollege || !selectedSchedule) return;
    setRows((current) => [
      ...current,
      {
        id: `row-${Date.now()}`,
        college: selectedCollege,
        meta: '(7 lecture with break)',
        course: selectedSchedule,
        semester: 'Sem 3',
        section: 'A',
        endDate: assignedTill,
        status: 'Assigned',
        teacher: popupTeacher || teacherOptions[0] || 'TBD',
      },
    ]);
    handleCancelAddMode();
  };

  const handleSaveAndAssignTimetable = () => {
    handleSaveTimetable();
    setShowToStudents(true);
  };

  const handleReplaceTeacher = () => setIsReplaceOpen(true);

  const dropdownRef = useRef(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({ left: 0, top: 0, openUp: false });
  const [editLogsOpen, setEditLogsOpen] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState(null);

  useEffect(() => {
    function handleDocumentClick(e) {
      const btn = e.target.closest('[data-action-button]');
      if (btn) return; // clicked on a settings button - let its onClick handle toggle
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      if (modalRef.current && modalRef.current.contains(e.target)) return;
      if (assignModalRef.current && assignModalRef.current.contains(e.target)) return;
      if (overrideModalRef.current && overrideModalRef.current.contains(e.target)) return;
      setOpenDropdownId(null);
      setIsCellPopupOpen(false);
      setActiveCell(null);
      setIsAssignOpen(false);
      setIsOverrideOpen(false);
      setSelectedActionItem(null);
    }

    function handleKeydown(e) {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
        setIsCellPopupOpen(false);
        setActiveCell(null);
        setIsAssignOpen(false);
        setIsOverrideOpen(false);
        setSelectedActionItem(null);
      }
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

  // sample schedule generator (UI-only, does not modify backend data)
  function makeSampleSchedule(item) {
    const subjects = [
      { name: 'Discrete Mathematics', teacher: 'Dr. Ravindra Kr Arya' },
      { name: 'Operating System', teacher: 'Dr. Narayan Jee' },
      { name: 'Operating System Practical', teacher: 'Dr. Bina Singh' },
      { name: 'Python Programming', teacher: 'Dr. Upendra Kumar' },
      { name: 'Python Lab', teacher: 'Prof. Meera Sharma' },
      { name: 'Java Programming', teacher: 'Dr. Bhuvnesh Kumar' },
      { name: 'Object Oriented Programming', teacher: 'Prof. Sandeep Mishra' },
      { name: 'Artificial Intelligence', teacher: 'Dr. Rajiv Rajan Patel' },
      { name: 'Introduction to AI', teacher: 'Dr. Neha Verma' },
      { name: 'DBMS', teacher: 'Prof. Shalini Rao' },
      { name: 'DBMS Lab', teacher: 'Dr. Ashok Tiwari' },
      { name: 'Computer Networks', teacher: 'Dr. Priya Menon' },
      { name: 'Software Engineering', teacher: 'Prof. Amit Sharma' },
      { name: 'Soft Skills', teacher: 'Dr. Vimal Panday' },
      { name: 'Environmental Studies', teacher: 'Prof. Richa Gupta' },
    ];

    const lectureRows = [];
    for (let i = 0; i < 7; i++) {
      const row = {
        type: 'lecture',
        sno: i + 1,
        lecture: `Lecture ${i + 1}`,
        timing: i === 0 ? '09:00 AM - 10:00 AM' : i === 1 ? '10:00 AM - 11:00 AM' : i === 2 ? '11:10 AM - 12:10 PM' : i === 3 ? '12:10 PM - 01:00 PM' : i === 4 ? '02:00 PM - 03:00 PM' : i === 5 ? '03:00 PM - 04:00 PM' : '04:00 PM - 05:00 PM',
        cells: [],
      };

      for (let d = 0; d < 7; d++) {
        if (d === 6) {
          row.cells.push(null);
          continue;
        }

        const subjectIndex = (i * 2 + d + (i % 2 === 0 ? 0 : 1)) % subjects.length;
        const subject = subjects[subjectIndex];
        row.cells.push({ subject: subject.name, teacher: subject.teacher });
      }

      lectureRows.push(row);
    }

    return [
      lectureRows[0],
      lectureRows[1],
      { type: 'break', sno: 3, lecture: 'BREAK 1', timing: '11:00 AM - 11:10 AM', label: 'BREAK 1', note: '10 Minutes' },
      lectureRows[2],
      lectureRows[3],
      { type: 'break', sno: 6, lecture: 'BREAK 2', timing: '01:00 PM - 02:00 PM', label: 'BREAK 2', note: '60 Minutes' },
      lectureRows[4],
      lectureRows[5],
      lectureRows[6],
    ];
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
    <div className="min-h-screen w-full bg-slate-50 px-2 pb-8 pt-2 sm:px-3 lg:px-4">
      <div className="w-full">
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
              onClick={handleExportSchedule}
              className="inline-flex h-11 items-center gap-2 rounded-[20px] bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <FaFileExport className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              onClick={handlePrintSchedule}
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

        {addMode && (
          <div className="relative mt-5 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <button
              type="button"
              onClick={handleCancelAddMode}
              aria-label="Close add timetable panel"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <FaTimes className="h-4 w-4" />
            </button>
            <div className="grid min-h-[98px] items-end gap-3 grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,220px)_minmax(150px,180px)_minmax(150px,180px)]">
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                Select College
                <select
                  value={selectedCollege}
                  onChange={(event) => handleCollegeSelect(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">Select College</option>
                  {filterOptions.college.filter((option) => option !== 'All').map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                Select Schedule
                <select
                  value={selectedSchedule}
                  onChange={(event) => handleScheduleSelect(event.target.value)}
                  disabled={!selectedCollege}
                  className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Schedule</option>
                  {scheduleOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                Assigned Till
                <input
                  type="date"
                  value={assignedTill}
                  onChange={(event) => handleAssignedTillChange(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                Show to Students
                <button
                  type="button"
                  onClick={toggleShowToStudents}
                  className={`inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 transition ${showToStudents ? 'bg-emerald-400' : 'bg-slate-50'}`}
                >
                  <span className={`relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${showToStudents ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${showToStudents ? 'translate-x-6' : 'translate-x-1'}`} />
                  </span>
                </button>
              </label>

              <div className="flex min-w-0 items-end">
                <button type="button" onClick={handleExportSchedule} className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#1e3a5f] px-4 text-[15px] font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  <FaFileExport className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

              <div className="flex min-w-0 items-end">
                <button type="button" onClick={handlePrintSchedule} className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#1e3a5f] px-4 text-[15px] font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  <FaPrint className="h-4 w-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {selectedCollege && selectedSchedule ? (
              <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50" style={{ minHeight: 500 }}>
                <div className="h-full overflow-hidden">
                  <div className="h-full overflow-x-auto overflow-y-hidden px-2 py-3">
                    <div className="min-w-[1180px]">
                      <div className="grid min-w-full grid-cols-[64px_minmax(140px,180px)_minmax(120px,160px)_repeat(7,minmax(140px,1fr))] text-[12px] uppercase tracking-[0.12em] text-white">
                        <div className="flex h-12 items-center justify-center bg-[#1e3a5f] border border-slate-200 px-3">S.No</div>
                        <div className="flex h-12 items-center bg-[#1e3a5f] border border-slate-200 px-3">Lecture Name</div>
                        <div className="flex h-12 items-center bg-[#1e3a5f] border border-slate-200 px-3">Lecture Timing</div>
                        {weekdayHeaders.map((day) => (
                          <div key={day} className="flex h-12 items-center justify-center bg-[#1e3a5f] border border-slate-200 px-3">{day}</div>
                        ))}
                      </div>
                      <div className="grid min-w-full grid-cols-[64px_minmax(140px,180px)_minmax(120px,160px)_repeat(7,minmax(140px,1fr))]">
                        {viewSchedule.map((row, rIndex) => (
                          <Fragment key={row.sno}>
                            <div className={`flex h-[70px] items-center justify-center border border-slate-200 bg-white px-3 text-slate-700`}>{row.sno}</div>
                            <div className="flex min-h-[70px] items-center border border-slate-200 bg-white px-3 text-slate-900 whitespace-normal break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {row.lecture}
                            </div>
                            <div className="flex min-h-[70px] items-center border border-slate-200 bg-white px-3 text-slate-900 whitespace-normal break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {row.timing}
                            </div>
                            {row.cells.map((cell, cIndex) => (
                              <div key={`${rIndex}-${cIndex}`} className="flex min-h-[70px] items-start justify-center border border-slate-200 bg-white p-2">
                                {cell ? (
                                  <button
                                    type="button"
                                    onClick={(event) => handleCellClick(rIndex, cIndex, event)}
                                    className="flex min-h-[70px] w-full flex-col items-start justify-center rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-slate-400 overflow-hidden"
                                  >
                                    <div className="w-full whitespace-normal text-[13px] font-semibold text-slate-900" style={{ overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                      {cell.subject}
                                    </div>
                                    <div className="mt-1 w-full whitespace-normal text-[11px] text-slate-600" style={{ overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                      {cell.teacher}
                                    </div>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(event) => handleCellClick(rIndex, cIndex, event)}
                                    className="inline-flex h-full w-full items-center justify-center rounded-[12px] border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
                                  >
                                    <FaPlus className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => setViewSchedule((current) => [...current, { sno: current.length + 1, lecture: `Lect ${current.length + 1}`, timing: '16:00 - 16:55', cells: Array(7).fill(null) }])} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">Add Lecture Number</button>
                    <button type="button" onClick={() => setViewSchedule((current) => (current.length > 0 ? current.slice(0, -1) : current))} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Delete Last Row</button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveTimetable}
                      disabled={!selectedCollege || !selectedSchedule}
                      className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndAssignTimetable}
                      disabled={!selectedCollege || !selectedSchedule}
                      className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save & Assign
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAddMode}
                      className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-[6px] text-center text-sm text-slate-500">
                Select a college and schedule to generate a blank timetable.
              </p>
            )}

            <CenteredCellModal />
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
          <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
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
                  <button type="button" onClick={handlePrintSchedule} className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#1e3a5f] px-4 text-sm font-semibold text-white shadow-sm">
                    <FaPrint className="h-4 w-4" />
                    Print
                  </button>
                </div>

                <button type="button" onClick={closeViewTimetable} aria-label="Close timetable" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 shadow-sm">
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white p-3 shadow-sm">
              <div className="overflow-x-auto">
                <div
                  className="w-full min-w-[860px] border-collapse text-sm text-slate-900"
                  style={{ display: 'grid', gridTemplateColumns: '72px minmax(160px,190px) minmax(120px,160px) repeat(7, minmax(120px, 1fr))' }}
                >
                  <div className="flex h-12 items-center justify-center border-b border-slate-200 bg-[#1e3a5f] px-3 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
                    S.No
                  </div>
                  <div className="flex h-12 items-center border-b border-slate-200 bg-[#1e3a5f] px-3 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
                    Lecture Name
                  </div>
                  <div className="flex h-12 items-center border-b border-slate-200 bg-[#1e3a5f] px-3 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
                    Lecture Timing
                  </div>
                  {weekdayHeaders.map((day) => (
                    <div key={day} className="flex h-12 items-center justify-center border-b border-slate-200 bg-[#1e3a5f] px-3 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
                      {day}
                    </div>
                  ))}

                  {viewSchedule.map((row, rIndex) => (
                    <Fragment key={`row-${rIndex}`}>
                      {row.type === 'break' ? (
                        <>
                          <div className={`flex h-[112px] items-center justify-center border-b border-r border-slate-200 px-3 py-2 text-center text-slate-700 ${rIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            {row.sno}
                          </div>
                          <div className={`flex h-[112px] items-start justify-start border-b border-r border-slate-200 px-3 py-2 ${rIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <div className="w-full whitespace-normal break-words font-semibold leading-snug text-slate-900" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {row.lecture}
                            </div>
                          </div>
                          <div className={`flex h-[112px] items-start justify-start border-b border-r border-slate-200 px-3 py-2 ${rIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <div className="w-full whitespace-normal break-words font-medium leading-snug text-slate-900" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {row.timing}
                            </div>
                          </div>
                          <div
                            className={`col-span-7 flex h-[112px] items-center justify-center border-b border-r border-slate-200 bg-slate-100 px-3 py-2 text-center ${rIndex % 2 === 0 ? 'bg-slate-100' : 'bg-slate-50'}`}
                            style={{ gridColumn: 'span 7 / span 7' }}
                          >
                            <div>
                              <div className="font-semibold uppercase tracking-[0.08em] text-slate-800">{row.label}</div>
                              <div className="mt-1 text-sm text-slate-600">{row.note}</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`flex h-[112px] items-center justify-center border-b border-r border-slate-200 px-3 py-2 text-center text-slate-700 ${rIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            {row.sno}
                          </div>
                          <div className={`flex h-[112px] items-start justify-start border-b border-r border-slate-200 px-3 py-2 ${rIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <div className="w-full whitespace-normal break-words font-medium leading-snug text-slate-900" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {row.lecture}
                            </div>
                          </div>
                          <div className={`flex h-[112px] items-start justify-start border-b border-r border-slate-200 px-3 py-2 ${rIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <div className="w-full whitespace-normal break-words font-medium leading-snug text-slate-900" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {row.timing}
                            </div>
                          </div>
                          {row.cells.map((c, cIndex) => (
                            <div key={`${rIndex}-${cIndex}`} className={`flex min-h-[112px] items-stretch justify-stretch border-b border-r border-slate-200 px-2 py-2 ${rIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                              {c ? (
                                <button
                                  type="button"
                                  onClick={(event) => handleCellClick(rIndex, cIndex, event)}
                                  className="flex min-h-[112px] w-full flex-col items-start justify-start rounded-[10px] border border-slate-200 bg-slate-50 p-2 text-left shadow-sm transition hover:border-slate-400 overflow-hidden"
                                >
                                  <div className="w-full whitespace-normal text-[13px] font-semibold leading-tight text-slate-900" style={{ overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                    {c.subject}
                                  </div>
                                  <div className="mt-1 w-full whitespace-normal text-[11px] leading-tight text-slate-600" style={{ overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                    {c.teacher}
                                  </div>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(event) => handleCellClick(rIndex, cIndex, event)}
                                  className="flex h-full w-full items-center justify-center rounded-[10px] border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
                                >
                                  <FaPlus className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </Fragment>
                  ))}
                </div>
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
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setSelectedActionItem(item);
                                  setIsAssignOpen(true);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100 cursor-pointer"
                              >
                                Assign Time Table
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setSelectedActionItem(item);
                                  setIsOverrideOpen(true);
                                }}
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

          {isAssignOpen && selectedActionItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={closeAssignModal} aria-hidden="true" />
              <div
                ref={assignModalRef}
                role="dialog"
                aria-modal="true"
                className="relative z-10 w-full max-w-[700px] overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
                style={{ maxHeight: '75vh' }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                  <div>
                    <h2 className="text-[16px] font-semibold text-slate-950">Assign Time Table</h2>
                    <p className="mt-1 text-sm text-slate-500">Assign a timetable for selected class rows.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                    aria-label="Close assign timetable"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>

                <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(75vh - 142px)' }}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-[13px] font-medium text-slate-700">
                      Enter Start Date
                      <input
                        type="date"
                        value={assignStartDate}
                        onChange={(event) => setAssignStartDate(event.target.value)}
                        className="h-9 rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-[13px] font-medium text-slate-700">
                      Enter End Date
                      <input
                        type="date"
                        value={assignEndDate}
                        onChange={(event) => setAssignEndDate(event.target.value)}
                        className="h-9 rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-[13px] font-medium text-slate-700">
                      Select Employees
                      <select
                        value={assignEmployee}
                        onChange={(event) => setAssignEmployee(event.target.value)}
                        className="h-9 rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                      >
                        {assignEmployeeOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-2 text-[13px] font-medium text-slate-700">
                      Select Subject
                      <select
                        value={assignSubject}
                        onChange={(event) => setAssignSubject(event.target.value)}
                        className="h-9 rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                      >
                        {assignSubjectOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <p className="mt-4 text-[12px] text-slate-500">
                    Assigning a timetable will update the selected schedule with the chosen subject and employee while preserving existing time table structure.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="inline-flex h-10 items-center justify-center rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignNew}
                    className="inline-flex h-10 items-center justify-center rounded-[10px] bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Assign New
                  </button>
                </div>
              </div>
            </div>
          )}
          {isOverrideOpen && selectedActionItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={closeOverrideModal} aria-hidden="true" />
              <div
                ref={overrideModalRef}
                role="dialog"
                aria-modal="true"
                className="relative z-10 w-full max-w-[700px] overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
                style={{ maxHeight: '75vh' }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                  <div>
                    <h2 className="text-[16px] font-semibold text-slate-950">Override Time Table</h2>
                    <p className="mt-1 text-sm text-slate-500">Override a timetable for the selected class row.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeOverrideModal}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                    aria-label="Close override timetable"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>

                <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(75vh - 142px)' }}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-[13px] font-medium text-slate-700">
                      Enter Start Date
                      <input
                        type="date"
                        value={overrideStartDate}
                        onChange={(event) => setOverrideStartDate(event.target.value)}
                        className="h-9 rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-[13px] font-medium text-slate-700">
                      Enter End Date
                      <input
                        type="date"
                        value={overrideEndDate}
                        onChange={(event) => setOverrideEndDate(event.target.value)}
                        className="h-9 rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-[13px] font-medium text-slate-700">
                      Select Employees
                      <select
                        value={overrideEmployee}
                        onChange={(event) => setOverrideEmployee(event.target.value)}
                        className="h-9 rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                      >
                        {assignEmployeeOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-2 text-[13px] font-medium text-slate-700">
                      Select Subject
                      <select
                        value={overrideSubject}
                        onChange={(event) => setOverrideSubject(event.target.value)}
                        className="h-9 rounded-[6px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                      >
                        {assignSubjectOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <p className="mt-4 text-[12px] text-slate-500">
                    Overriding a timetable will update the selected schedule with the chosen subject and employee while preserving the current time table layout.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                  <button
                    type="button"
                    onClick={closeOverrideModal}
                    className="inline-flex h-10 items-center justify-center rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleOverrideSchedule}
                    className="inline-flex h-10 items-center justify-center rounded-[10px] bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Override Schedule
                  </button>
                </div>
              </div>
            </div>
          )}
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
