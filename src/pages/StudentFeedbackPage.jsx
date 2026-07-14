import { useMemo, useState } from 'react';
import { Eye, Filter, Printer } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';

const feedbackRecords = [
  {
    id: 1,
    studentName: 'Aashika Jain',
    rollNumber: '25101010001',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech. Hons. CSE',
    section: 'Section-A',
    feedbackType: 'Semester Feedback',
    submittedAt: '22 Jan 2026',
    score: '4.8/5',
    status: 'Reviewed',
    admissionCategory: 'General',
    awakeStatus: 'Awake',
    feeCategory: 'Tuition',
    subjectCombination: 'PCM',
    admissionDate: '2026-01-10',
  },
  {
    id: 2,
    studentName: 'Abhayjeet Rai',
    rollNumber: '25101010004',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech. Hons. CSE',
    section: 'Section-A',
    feedbackType: 'Course Feedback',
    submittedAt: '20 Jan 2026',
    score: '4.6/5',
    status: 'Pending',
    admissionCategory: 'OBC',
    awakeStatus: 'Sleeping',
    feeCategory: 'Hostel',
    subjectCombination: 'PCM',
    admissionDate: '2026-01-08',
  },
  {
    id: 3,
    studentName: 'Aditya Panwar',
    rollNumber: '25101010014',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech. Hons. CSE',
    section: 'Section-A',
    feedbackType: 'Faculty Feedback',
    submittedAt: '18 Jan 2026',
    score: '4.7/5',
    status: 'Reviewed',
    admissionCategory: 'General',
    awakeStatus: 'Awake',
    feeCategory: 'Transport',
    subjectCombination: 'PCB',
    admissionDate: '2026-01-05',
  },
  {
    id: 4,
    studentName: 'Akanksha',
    rollNumber: '25101010017',
    college: 'Roorkee College of Smart Computing',
    course: 'MBA',
    section: 'Section-B',
    feedbackType: 'Semester Feedback',
    submittedAt: '16 Jan 2026',
    score: '4.5/5',
    status: 'Pending',
    admissionCategory: 'SC/ST',
    awakeStatus: 'Awake',
    feeCategory: 'Tuition',
    subjectCombination: 'Commerce',
    admissionDate: '2026-01-02',
  },
  {
    id: 5,
    studentName: 'Akansha',
    rollNumber: '25101010018',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Sc. Physics',
    section: 'Section-C',
    feedbackType: 'Campus Feedback',
    submittedAt: '14 Jan 2026',
    score: '4.9/5',
    status: 'Reviewed',
    admissionCategory: 'General',
    awakeStatus: 'Sleeping',
    feeCategory: 'Hostel',
    subjectCombination: 'PCB',
    admissionDate: '2026-01-01',
  },
];

const searchOptions = [
  { value: 'studentName', label: 'Student Name' },
  { value: 'rollNumber', label: 'Roll Number' },
  { value: 'feedbackType', label: 'Feedback Type' },
];

// feedback type handled via savedFilters.feedbackType (kept in DEFAULT_FILTERS)

const statusOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'Reviewed', label: 'Reviewed' },
  { value: 'Pending', label: 'Pending' },
];

const collegeOptions = [
  { value: 'ALL', label: 'All colleges' },
  { value: 'Roorkee College of Smart Computing', label: 'Roorkee College of Smart Computing' },
];

const admissionCategoryOptions = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'General', label: 'General' },
  { value: 'OBC', label: 'OBC' },
  { value: 'SC/ST', label: 'SC/ST' },
];

const awakeStatusOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'Awake', label: 'Awake' },
  { value: 'Sleeping', label: 'Sleeping' },
];

const feeCategoryOptions = [
  { value: 'ALL', label: 'All Fees' },
  { value: 'Tuition', label: 'Tuition' },
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Transport', label: 'Transport' },
];

const subjectCombinationOptions = [
  { value: 'ALL', label: 'All Combinations' },
  { value: 'PCM', label: 'PCM' },
  { value: 'PCB', label: 'PCB' },
  { value: 'Commerce', label: 'Commerce' },
];

const DEFAULT_FILTERS = {
  college: 'ALL',
  admissionCategory: 'ALL',
  awakeStatus: 'ALL',
  feeCategory: 'ALL',
  subjectCombination: 'ALL',
  feedbackType: 'ALL',
  status: 'ALL',
  startDate: null,
  endDate: null,
};

const STATUS_CLASSNAME = {
  Reviewed: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
};

export default function StudentFeedbackPage() {
  const [searchType, setSearchType] = useState('studentName');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const [draftFilters, setDraftFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return feedbackRecords.filter((record) => {
      const matchesSearch = !query ||
        (searchType === 'studentName' && record.studentName.toLowerCase().includes(query)) ||
        (searchType === 'rollNumber' && record.rollNumber.includes(query)) ||
        (searchType === 'feedbackType' && record.feedbackType.toLowerCase().includes(query));

      const matchesCollege = savedFilters.college === 'ALL' || record.college === savedFilters.college;
      const matchesAdmissionCategory = savedFilters.admissionCategory === 'ALL' || record.admissionCategory === savedFilters.admissionCategory;
      const matchesAwakeStatus = savedFilters.awakeStatus === 'ALL' || record.awakeStatus === savedFilters.awakeStatus;
      const matchesFeeCategory = savedFilters.feeCategory === 'ALL' || record.feeCategory === savedFilters.feeCategory;
      const matchesSubjectCombination = savedFilters.subjectCombination === 'ALL' || record.subjectCombination === savedFilters.subjectCombination;
      const matchesFeedbackType = savedFilters.feedbackType === 'ALL' || record.feedbackType === savedFilters.feedbackType;
      const matchesStatus = savedFilters.status === 'ALL' || record.status === savedFilters.status;

      // date filters (admissionDate field on records)
      let matchesStart = true;
      let matchesEnd = true;
      if (savedFilters.startDate) {
        const start = new Date(savedFilters.startDate).setHours(0, 0, 0, 0);
        const rec = record.admissionDate ? new Date(record.admissionDate).setHours(0, 0, 0, 0) : null;
        matchesStart = rec !== null && rec >= start;
      }
      if (savedFilters.endDate) {
        const end = new Date(savedFilters.endDate).setHours(23, 59, 59, 999);
        const rec = record.admissionDate ? new Date(record.admissionDate).getTime() : null;
        matchesEnd = rec !== null && rec <= end;
      }

      return (
        matchesSearch && matchesCollege && matchesAdmissionCategory && matchesAwakeStatus && matchesFeeCategory && matchesSubjectCombination && matchesFeedbackType && matchesStatus && matchesStart && matchesEnd
      );
    });
  }, [savedFilters, searchTerm, searchType]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  // derive pageCount from filteredRecords; pagination handled by TablePagination

  // legacy handler removed; use handleCancelFilterModal which reverts draft changes

  const handleApplyFilter = () => {
    setSavedFilters(draftFilters);
    setPage(1);
    setFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchType('studentName');
    setSavedFilters({ ...DEFAULT_FILTERS });
    setPage(1);
  };

  const handleDraftChange = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const handleCancelFilterModal = () => {
    // revert any changes and close
    setDraftFilters(savedFilters);
    setFilterModalOpen(false);
  };

  // helper: simple local searchable dropdown used only inside this modal
  function SearchableSelect({ options, value, onChange, placeholder }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      return options.filter((o) => !q || o.label.toLowerCase().includes(q));
    }, [options, query]);

    return (
      <div className="relative">
        <input
          type="text"
          value={value === 'ALL' ? '' : value || ''}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        />
        {open && (
          <div className="absolute z-10 mt-2 max-h-40 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {opt.label}
              </button>
            ))}
            {filtered.length === 0 && <div className="p-3 text-sm text-slate-500">No matches</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] -mx-3 sm:-mx-4 lg:-mx-6 px-[10px] py-6 text-slate-900">
      <div className="space-y-6 w-full max-w-full">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Breadcrumb items={[{ to: '/', label: 'Dashboard' }, { label: 'Student Feedback' }]} />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-950">Student Feedback Report</h1>
              <span className="text-sm text-slate-600">Student Feedbacks</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" className="rounded-2xl px-4 py-2" onClick={() => { setDraftFilters(savedFilters); setFilterModalOpen(true); }}>
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button type="button" variant="secondary" className="rounded-2xl px-4 py-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr_220px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Search By</label>
              <select
                value={searchType}
                onChange={(event) => setSearchType(event.target.value)}
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                {searchOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Search</label>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by Name, Roll Number, Father Name, Course, Semester, College, Section"
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
              <select
                value={savedFilters.status}
                onChange={(event) => handleDraftChange('status', event.target.value)}
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" className="rounded-2xl px-4 py-2" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <p className="text-sm text-slate-600">{filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'} found</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-[#1F3A68] text-white">
                <tr>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">
                    <label className="inline-flex items-center">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900" />
                    </label>
                  </th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">S.No</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Name</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Roll Number</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Father Name</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">College</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Course-Section</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Semester</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Feedback Status</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Submitted Date</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 hover:bg-slate-100'}>
                    <td className="px-4 py-4">
                      <label className="inline-flex items-center">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900" />
                      </label>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100">
                          {/* placeholder avatar */}
                          <div className="h-full w-full bg-center bg-cover" style={{ backgroundImage: `url('https://i.pravatar.cc/40?img=${(index % 70) + 1}')` }} />
                        </div>
                        <span className="font-medium text-slate-900">{record.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{record.rollNumber}</td>
                    <td className="px-4 py-4 text-slate-700">{record.fatherName || '-'}</td>
                    <td className="px-4 py-4 text-slate-700">{record.college}</td>
                    <td className="px-4 py-4 text-slate-700">{record.course}</td>
                    <td className="px-4 py-4 text-slate-700">{record.section}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSNAME[record.status] || 'bg-slate-100 text-slate-700'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{record.submittedAt}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" title="View Feedback" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" title="Print Feedback" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200" onClick={() => window.print()}>
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      <Modal
        title="Filter"
        isOpen={filterModalOpen}
        onClose={handleCancelFilterModal}
        footer={
          <>
            <Button type="button" variant="secondary" className="rounded-2xl px-4 py-2" onClick={handleCancelFilterModal}>
              Cancel
            </Button>
            <Button type="button" variant="primary" className="rounded-2xl px-4 py-2" onClick={handleApplyFilter}>
              Go →
            </Button>
          </>
        }
      >
        <div className="mx-auto w-full max-w-[700px] rounded-[16px] bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select College</label>
                <SearchableSelect
                  options={collegeOptions}
                  value={draftFilters.college}
                  onChange={(v) => handleDraftChange('college', v)}
                  placeholder="Search college"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Admission Category</label>
                <SearchableSelect
                  options={admissionCategoryOptions}
                  value={draftFilters.admissionCategory}
                  onChange={(v) => handleDraftChange('admissionCategory', v)}
                  placeholder="Search admission category"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Awake Status</label>
                <select
                  value={draftFilters.awakeStatus}
                  onChange={(e) => handleDraftChange('awakeStatus', e.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {awakeStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Start Date for Admissions</label>
                <input
                  type="date"
                  value={draftFilters.startDate || ''}
                  onChange={(e) => handleDraftChange('startDate', e.target.value || null)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Fee Category</label>
                <SearchableSelect
                  options={feeCategoryOptions}
                  value={draftFilters.feeCategory}
                  onChange={(v) => handleDraftChange('feeCategory', v)}
                  placeholder="Search fee category"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Status</label>
                <select
                  value={draftFilters.status}
                  onChange={(e) => handleDraftChange('status', e.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Subject Combination</label>
                <SearchableSelect
                  options={subjectCombinationOptions}
                  value={draftFilters.subjectCombination}
                  onChange={(v) => handleDraftChange('subjectCombination', v)}
                  placeholder="Search subject combination"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">End Date for Admission</label>
                <input
                  type="date"
                  value={draftFilters.endDate || ''}
                  onChange={(e) => handleDraftChange('endDate', e.target.value || null)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
