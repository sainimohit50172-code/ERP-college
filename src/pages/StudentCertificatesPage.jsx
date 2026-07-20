import { useEffect, useMemo, useState } from 'react';
import { Filter, Printer } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import CircleAvatar from '../components/ui/CircleAvatar.jsx';

const studentRecords = [
  {
    id: '1',
    name: 'Abhishek Pandey',
    photoUrl: 'https://i.pravatar.cc/40?img=32',
    rollNumber: '230101006',
    universityRollNumber: '230101006',
    fatherName: 'Pramod Pandey',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '2',
    name: 'Abhishek Singh',
    photoUrl: 'https://i.pravatar.cc/40?img=33',
    rollNumber: '230101007',
    universityRollNumber: '230101007',
    fatherName: 'Pramod Singh',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '3',
    name: 'Anshika Joshi',
    photoUrl: 'https://i.pravatar.cc/40?img=12',
    rollNumber: '230101018',
    universityRollNumber: '230101018',
    fatherName: 'Harish Chandra Joshi',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '4',
    name: 'Anukul Anand',
    photoUrl: 'https://i.pravatar.cc/40?img=28',
    rollNumber: '230101021',
    universityRollNumber: '230101021',
    fatherName: 'Durgakant Jha',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '5',
    name: 'Arjun Yadav',
    photoUrl: 'https://i.pravatar.cc/40?img=22',
    rollNumber: '230101024',
    universityRollNumber: '230101024',
    fatherName: 'Pradeep Yadav',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '6',
    name: 'Chiranjeev Vatsa',
    photoUrl: 'https://i.pravatar.cc/40?img=35',
    rollNumber: '230101042',
    universityRollNumber: '230101042',
    fatherName: 'Rajeshwar Thakur',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '7',
    name: 'Deepika Sharma',
    photoUrl: 'https://i.pravatar.cc/40?img=40',
    rollNumber: '230101046',
    universityRollNumber: '230101046',
    fatherName: 'Mainpal Singh',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '8',
    name: 'Harsh Vardhan Singh',
    photoUrl: 'https://i.pravatar.cc/40?img=18',
    rollNumber: '230101053',
    universityRollNumber: '230101053',
    fatherName: 'Kalau Singh',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '9',
    name: 'Shwet Purwar',
    photoUrl: 'https://i.pravatar.cc/40?img=48',
    rollNumber: '230101125',
    universityRollNumber: '230101125',
    fatherName: 'Subhash Purwar',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '10',
    name: 'Ananya Reddy',
    photoUrl: 'https://i.pravatar.cc/40?img=44',
    rollNumber: '230101131',
    universityRollNumber: '230101131',
    fatherName: 'Ramesh Reddy',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '11',
    name: 'Karan Verma',
    photoUrl: 'https://i.pravatar.cc/40?img=20',
    rollNumber: '230101154',
    universityRollNumber: '230101154',
    fatherName: 'Ravi Verma',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
  {
    id: '12',
    name: 'Sanya Chopra',
    photoUrl: 'https://i.pravatar.cc/40?img=23',
    rollNumber: '230101162',
    universityRollNumber: '230101162',
    fatherName: 'Mohit Chopra',
    college: 'Roorkee College of Smart Computing',
    courseSection: 'B.Tech. Hons. CSE | Section-A',
    semester: 'Sem 7',
  },
];

const searchOptions = [
  { value: 'name', label: 'Name' },
  { value: 'rollNumber', label: 'Admission No.' },
  { value: 'universityRollNo', label: 'University Roll No.' },
];

const rollOptions = [
  { value: '230101006', label: '230101006' },
  { value: '230101007', label: '230101007' },
  { value: '230101018', label: '230101018' },
  { value: '230101021', label: '230101021' },
  { value: '230101024', label: '230101024' },
  { value: '230101042', label: '230101042' },
  { value: '230101046', label: '230101046' },
  { value: '230101053', label: '230101053' },
  { value: '230101125', label: '230101125' },
  { value: '230101131', label: '230101131' },
  { value: '230101154', label: '230101154' },
  { value: '230101162', label: '230101162' },
];

const filterTypeOptions = [
  { value: 'courseWise', label: 'Course Wise' },
  { value: 'collegeWise', label: 'College Wise' },
  { value: 'semesterWise', label: 'Semester Wise' },
];

const collegeOptions = [
  { value: 'ALL', label: 'ALL' },
  { value: 'ROORKEE COLLEGE OF SMART COMPUTING', label: 'ROORKEE COLLEGE OF SMART COMPUTING' },
  { value: 'ROORKEE COLLEGE OF ENGINEERING', label: 'ROORKEE COLLEGE OF ENGINEERING' },
  { value: 'ROORKEE COLLEGE OF BUSINESS STUDIES', label: 'ROORKEE COLLEGE OF BUSINESS STUDIES' },
  { value: 'ROORKEE COLLEGE OF AGRICULTURAL SCIENCES', label: 'ROORKEE COLLEGE OF AGRICULTURAL SCIENCES' },
  { value: 'ROORKEE COLLEGE OF ALLIED HEALTH SCIENCES', label: 'ROORKEE COLLEGE OF ALLIED HEALTH SCIENCES' },
];

const semesterOptions = [
  { value: 'Sem 1', label: 'Sem 1' },
  { value: 'Sem 3', label: 'Sem 3' },
  { value: 'Sem 5', label: 'Sem 5' },
  { value: 'Sem 7', label: 'Sem 7' },
];

const feeCategoryOptions = [
  { value: 'ALL', label: 'ALL' },
  { value: 'GENERAL', label: 'GENERAL' },
  { value: 'FEES PKG', label: 'FEES PKG' },
  { value: 'ACADEMIC', label: 'ACADEMIC' },
  { value: 'TRANSPORT', label: 'TRANSPORT' },
  { value: 'HOSTEL', label: 'HOSTEL' },
  { value: 'MISCELLANEOUS', label: 'MISCELLANEOUS' },
];

const statusOptions = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const courseOptions = [
  { value: 'B.Tech. Hons. CSE, B.Tech', label: 'B.Tech. Hons. CSE, B.Tech' },
  { value: 'B.Sc. Physics', label: 'B.Sc. Physics' },
];

const sectionOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
];

const admissionCategoryOptions = [
  { value: 'ALL', label: 'ALL' },
  { value: 'STANDARD', label: 'STANDARD' },
  { value: 'LATERAL', label: 'LATERAL' },
];

const awakeStatusOptions = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const DEFAULT_FILTERS = {
  college: 'ALL, ROORKEE COLLEGE ...',
  semester: ['Sem 1'],
  feeCategory: 'ALL',
  status: 'ACTIVE',
  startDate: '',
  filterType: 'courseWise',
  course: 'B.Tech. Hons. CSE, B.Tech',
  section: 'A',
  admissionCategory: 'ALL',
  awakeStatus: 'ACTIVE',
  endDate: '',
};

export default function StudentCertificatesPage() {
  const [searchType, setSearchType] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [rollFilter, setRollFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const [draftFilters, setDraftFilters] = useState(() => ({ ...DEFAULT_FILTERS }));

  const filteredRecords = useMemo(() => {
    return studentRecords.filter((record) => {
      const searchValue = searchTerm.trim().toLowerCase();
      const rollValue = rollFilter.trim();

      const matchesSearch = !searchValue ||
        (searchType === 'name' && record.name.toLowerCase().includes(searchValue)) ||
        (searchType === 'rollNumber' && record.rollNumber.includes(searchValue)) ||
        (searchType === 'universityRollNo' && record.universityRollNumber.includes(searchValue));

      const matchesRoll = !rollValue || record.rollNumber === rollValue;
      return matchesSearch && matchesRoll;
    });
  }, [searchType, searchTerm, rollFilter]);

  useEffect(() => {
    if (selectAll) {
      setSelectedIds(filteredRecords.map((record) => record.id));
    } else {
      setSelectedIds([]);
    }
  }, [selectAll, filteredRecords]);

  const toggleRow = (recordId) => {
    setSelectedIds((current) =>
      current.includes(recordId)
        ? current.filter((id) => id !== recordId)
        : [...current, recordId]
    );
  };

  const openFilterModal = () => {
    setDraftFilters(savedFilters);
    setFilterModalOpen(true);
  };

  const handleCancelFilter = () => {
    setDraftFilters(savedFilters);
    setFilterModalOpen(false);
  };

  const handleApplyFilter = () => {
    setSavedFilters(draftFilters);
    setFilterModalOpen(false);
    console.log('Applied student certificates filters:', draftFilters);
  };

  const handleSemesterChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setDraftFilters((current) => ({ ...current, semester: selected }));
  };

  const handleDraftChange = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const handlePrint = () => window.print();
  const handleResetFilters = () => {
    setSearchType('name');
    setSearchTerm('');
    setRollFilter('');
    setSelectAll(false);
    setSelectedIds([]);
  };

  const selectedAllChecked = filteredRecords.length > 0 && selectedIds.length === filteredRecords.length;

  return (
    <div className="min-h-screen bg-[#F5F7FB] py-6 text-slate-900">
      <div className="space-y-6 w-full max-w-full">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Breadcrumb items={[{ to: '/', label: 'Dashboard' }, { label: 'Student Certificates' }]} />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-950">Student Certificates</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl px-4 py-2 hover-gradient-border"
              onClick={openFilterModal}
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl px-4 py-2 hover-gradient-border"
              onClick={handlePrint}
            >
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
                placeholder="Search by Name, Admission No. or University Roll No."
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Roll Number</label>
              <select
                value={rollFilter}
                onChange={(event) => setRollFilter(event.target.value)}
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Roll Number</option>
                {rollOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" className="rounded-2xl px-4 py-2 hover-gradient-border" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <p className="text-sm text-slate-600">{filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'} found</p>
          </div>
        </div>

        <Modal
          title="Filter"
          isOpen={filterModalOpen}
          onClose={handleCancelFilter}
          footer={
            <>
              <Button type="button" variant="secondary" className="rounded-2xl px-4 py-2 hover-gradient-border" onClick={handleCancelFilter}>
                Cancel
              </Button>
              <Button type="button" variant="primary" className="rounded-2xl px-4 py-2 hover-gradient-border" onClick={handleApplyFilter}>
                Go →
              </Button>
            </>
          }
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select College</label>
                <select
                  value={draftFilters.college}
                  onChange={(event) => handleDraftChange('college', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {collegeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Semester</label>
                <select
                  multiple
                  size={4}
                  value={draftFilters.semester}
                  onChange={handleSemesterChange}
                  className="w-full min-h-[150px] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 hover-gradient-border"
                >
                  {semesterOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Fee Category</label>
                <select
                  value={draftFilters.feeCategory}
                  onChange={(event) => handleDraftChange('feeCategory', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {feeCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Status</label>
                <select
                  value={draftFilters.status}
                  onChange={(event) => handleDraftChange('status', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Choose Start Date for Admissions</label>
                <input
                  type="date"
                  value={draftFilters.startDate}
                  onChange={(event) => handleDraftChange('startDate', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Filter Type</label>
                <select
                  value={draftFilters.filterType}
                  onChange={(event) => handleDraftChange('filterType', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {filterTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Course</label>
                <select
                  value={draftFilters.course}
                  onChange={(event) => handleDraftChange('course', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {courseOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Section</label>
                <select
                  value={draftFilters.section}
                  onChange={(event) => handleDraftChange('section', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {sectionOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Admission Category</label>
                <select
                  value={draftFilters.admissionCategory}
                  onChange={(event) => handleDraftChange('admissionCategory', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {admissionCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Awake Status</label>
                <select
                  value={draftFilters.awakeStatus}
                  onChange={(event) => handleDraftChange('awakeStatus', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  {awakeStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Choose End Date for Admission</label>
                <input
                  type="date"
                  value={draftFilters.endDate}
                  onChange={(event) => handleDraftChange('endDate', event.target.value)}
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </div>
        </Modal>

        <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-[#1F3A68] text-white">
                <tr>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAllChecked}
                        onChange={(event) => setSelectAll(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                    </label>
                  </th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">S.No</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Name</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Roll Number</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">University Roll No.</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Father Name</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">College</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Course-Section</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Semester</th>
                  <th className="sticky top-0 px-4 py-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={index % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 hover:bg-slate-100'}
                  >
                    <td className="px-4 py-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={() => toggleRow(record.id)}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900"
                        />
                      </label>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <CircleAvatar src={record.photoUrl} alt={record.name} name={record.name} sizeClass="h-10 w-10" />
                        <span className="font-medium text-slate-900">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{record.rollNumber}</td>
                    <td className="px-4 py-4 text-slate-700">{record.universityRollNumber}</td>
                    <td className="px-4 py-4 text-slate-700">{record.fatherName}</td>
                    <td className="px-4 py-4 text-slate-700">{record.college}</td>
                    <td className="px-4 py-4 text-slate-700">{record.courseSection}</td>
                    <td className="px-4 py-4 text-slate-700">{record.semester}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 hover-gradient-border"
                        aria-label={`Print certificate for ${record.name}`}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
