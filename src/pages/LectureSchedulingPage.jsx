import { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaEdit, FaPlus, FaRedo, FaTimes, FaTrash } from 'react-icons/fa';
import { useResourceList } from '../hooks/useResourceHooks';

const PAGE_SIZE = 5;
const defaultSchedules = [
  { id: 'schedule-1', name: '7 lecture with break' },
  { id: 'schedule-2', name: 'BCA B' },
];
const defaultLectureRows = [
  { id: 'lecture-1', lecture: 'Lect 1', start: '09:10', end: '10:05' },
  { id: 'lecture-2', lecture: 'Break 1', start: '10:05', end: '11:00' },
  { id: 'lecture-3', lecture: 'Lect 2', start: '11:00', end: '11:10' },
  { id: 'lecture-4', lecture: 'Break 2', start: '11:10', end: '12:05' },
  { id: 'lecture-5', lecture: 'Lect 3', start: '12:05', end: '13:00' },
  { id: 'lecture-6', lecture: 'Lect 4', start: '13:00', end: '14:00' },
  { id: 'lecture-7', lecture: 'Lect 5', start: '14:00', end: '14:55' },
  { id: 'lecture-8', lecture: 'Lect 6', start: '14:55', end: '15:50' },
  { id: 'lecture-9', lecture: 'Lect 7', start: '15:50', end: '16:45' },
];
const lectureOptions = [
  { value: 'Lect 1', label: 'Lect 1' },
  { value: 'Lect 2', label: 'Lect 2' },
  { value: 'Lect 3', label: 'Lect 3' },
  { value: 'Lect 4', label: 'Lect 4' },
  { value: 'Lect 5', label: 'Lect 5' },
  { value: 'Lect 6', label: 'Lect 6' },
  { value: 'Lect 7', label: 'Lect 7' },
  { value: 'Break 1', label: 'Break 1' },
  { value: 'Break 2', label: 'Break 2' },
];

export default function LectureSchedulingPage() {
  const { data: schedulesData } = useResourceList('lectureSchedules', { page: 1, pageSize: 200 });
  const fetchedSchedules = schedulesData?.items || [];
  const [schedules, setSchedules] = useState(defaultSchedules);
  const [scheduleLectures, setScheduleLectures] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [copyFromId, setCopyFromId] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && Array.isArray(fetchedSchedules) && fetchedSchedules.length > 0) {
      const mapped = fetchedSchedules.map((item, index) => ({
        id: item.id || `schedule-${index + 1}`,
        name: item.scheduleName || item.title || item.name || `Schedule ${index + 1}`,
      }));
      setSchedules(mapped);
      setInitialized(true);
    }
  }, [fetchedSchedules, initialized]);

  const filteredSchedules = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return schedules;
    return schedules.filter((schedule) => schedule.name.toLowerCase().includes(normalizedSearch));
  }, [schedules, search]);

  const pageCount = Math.max(1, Math.ceil(filteredSchedules.length / PAGE_SIZE));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const displayedSchedules = filteredSchedules.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE);

  const getLectureRows = (scheduleId) => scheduleLectures[scheduleId] || defaultLectureRows;

  const openEditor = (schedule) => {
    setCopyFromId('');
    setEditingData({
      ...schedule,
      lectures: getLectureRows(schedule.id),
    });
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingData(null);
    setCopyFromId('');
  };

  const handleCopyFromChange = (event) => {
    const selectedId = event.target.value;
    setCopyFromId(selectedId);
    if (!editingData) return;
    if (!selectedId) {
      setEditingData((current) => ({ ...current, lectures: getLectureRows(current.id) }));
      return;
    }
    const copiedLectures = getLectureRows(selectedId);
    setEditingData((current) => ({ ...current, lectures: copiedLectures }));
  };

  const handleRefreshEditor = () => {
    if (!editingData) return;
    setEditingData((current) => ({
      ...current,
      lectures: getLectureRows(current.id),
    }));
  };

  const handleAddSchedule = () => {
    const nextSchedule = { id: `schedule-${Date.now()}`, name: 'New schedule' };
    setSchedules((current) => [nextSchedule, ...current]);
    setPage(1);
    setEditingData({ ...nextSchedule, lectures: defaultLectureRows });
    setEditorOpen(true);
  };

  const handleDeleteSchedule = (scheduleId) => {
    setSchedules((current) => current.filter((schedule) => schedule.id !== scheduleId));
    setScheduleLectures((current) => {
      const next = { ...current };
      delete next[scheduleId];
      return next;
    });
    if (editingData?.id === scheduleId) {
      handleCloseEditor();
    }
  };

  const handleSaveSchedule = () => {
    if (!editingData) return;
    setSchedules((current) => current.map((schedule) =>
      schedule.id === editingData.id ? { ...schedule, name: editingData.name } : schedule
    ));
    setScheduleLectures((current) => ({
      ...current,
      [editingData.id]: editingData.lectures,
    }));
    handleCloseEditor();
  };

  const handleLectureChange = (index, value) => {
    setEditingData((current) => {
      if (!current) return current;
      const nextRows = [...current.lectures];
      nextRows[index] = { ...nextRows[index], lecture: value };
      return { ...current, lectures: nextRows };
    });
  };

  const handleTimeChange = (index, key, value) => {
    setEditingData((current) => {
      if (!current) return current;
      const nextRows = [...current.lectures];
      nextRows[index] = { ...nextRows[index], [key]: value };
      return { ...current, lectures: nextRows };
    });
  };

  const handleDeleteLecture = (index) => {
    setEditingData((current) => {
      if (!current) return current;
      const nextRows = current.lectures.filter((_, rowIndex) => rowIndex !== index);
      return { ...current, lectures: nextRows };
    });
  };

  const handleAddLecture = () => {
    if (!editingData) return;
    const nextIndex = editingData.lectures.length + 1;
    const nextLecture = {
      id: `lecture-${Date.now()}`,
      lecture: `Lect ${nextIndex}`,
      start: '',
      end: '',
    };
    setEditingData((current) => ({
      ...current,
      lectures: [...current.lectures, nextLecture],
    }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="w-full max-w-full px-[5px] py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-sm text-slate-500">Dashboard &gt; Academics Setup &gt; Lecture Schedule</div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-950">Lecture Schedule</h1>
              <span className="text-sm text-slate-500">Lecture Schedule</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddSchedule}
            className="inline-flex items-center gap-2 rounded-[20px] bg-[#1e3a5f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <FaPlus className="h-4 w-4" />
            Add Schedule
          </button>
        </div>

        {editorOpen && editingData && (
          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Schedule Name</label>
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(event) => setEditingData((current) => ({ ...current, name: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Copy From Existing Schedule</label>
                  <select
                    value={copyFromId}
                    onChange={handleCopyFromChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">Select schedule</option>
                    {schedules
                      .filter((schedule) => schedule.id !== editingData.id)
                      .map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshEditor}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                  title="Refresh"
                >
                  <FaRedo className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseEditor}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                  title="Close"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto px-0 py-4">
              <table className="w-full table-fixed border-collapse text-sm text-slate-900" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '72px' }} />
                  <col style={{ width: '46%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '92px' }} />
                </colgroup>
                <thead>
                <tr className="bg-[#1e3a5f] text-left text-[12px] uppercase tracking-[0.18em] text-white">
                  <th className="px-4 py-4 rounded-tl-[24px]">S.No</th>
                  <th className="px-4 py-4">Lecture</th>
                  <th className="px-4 py-4">Start Time</th>
                  <th className="px-4 py-4">End Time</th>
                  <th className="px-4 py-4 pr-10 rounded-tr-[24px] text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                  {editingData.lectures.map((lecture, index) => (
                    <tr key={lecture.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{index + 1}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lecture.lecture}
                          onChange={(event) => handleLectureChange(index, event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                        >
                          {lectureOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="time"
                          value={lecture.start}
                          onChange={(event) => handleTimeChange(index, 'start', event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="time"
                          value={lecture.end}
                          onChange={(event) => handleTimeChange(index, 'end', event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                        />
                      </td>
                      <td className="px-4 py-3 pr-10 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteLecture(index)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 transition hover:bg-slate-50"
                          title="Delete lecture"
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleAddLecture}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <FaPlus className="h-4 w-4" />
                Add Lecture
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="inline-flex items-center justify-center rounded-2xl bg-[#1e3a5f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Save Schedule
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm font-semibold text-slate-700">Search</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div className="text-sm text-slate-500">Showing {displayedSchedules.length} of {filteredSchedules.length} schedules</div>
          </div>

          <div className="overflow-x-auto px-0 py-0">
            <table className="w-full table-fixed border-collapse text-sm text-slate-900" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '72px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '92px' }} />
              </colgroup>
              <thead>
                <tr className="bg-[#1e3a5f] text-left text-[12px] uppercase tracking-[0.18em] text-white">
                  <th className="px-4 py-4 rounded-tl-[24px]">S.No</th>
                  <th className="px-4 py-4">Schedule Name</th>
                  <th className="px-4 py-4 pr-10 rounded-tr-[24px] text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedSchedules.map((schedule, index) => (
                  <tr key={schedule.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-4 py-3 text-slate-900">{schedule.name}</td>
                    <td className="px-4 py-3 pr-10 text-center">
                      <div className="inline-flex items-center justify-center gap-2" style={{ transform: 'translateX(-10px)' }}>
                        <button
                          type="button"
                          onClick={() => openEditor(schedule)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 transition hover:bg-slate-50"
                          title="Edit schedule"
                        >
                          <FaEdit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 transition hover:bg-slate-50"
                          title="Delete schedule"
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">Page {page} of {pageCount}</div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaChevronLeft className="h-4 w-4" /> Prev
              </button>
              {Array.from({ length: pageCount }, (_, idx) => idx + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`rounded-2xl px-4 py-3 text-sm transition ${pageNumber === page ? 'bg-[#1e3a5f] text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
