import { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { ArrowRight, CalendarClock, Funnel, HelpCircle, Plus, RefreshCcw, Sparkles, X } from 'lucide-react';

const initialRows = [
  {
    college: 'North Campus',
    config: 'Semester Assessment Pattern',
    status: 'Active',
    created: '12 Jul 2026',
    updated: '22 Jul 2026',
  },
  {
    college: 'South Campus',
    config: 'Annual Assessment Cycle',
    status: 'Inactive',
    created: '08 Jun 2026',
    updated: '18 Jun 2026',
  },
  {
    college: 'City Institute',
    config: 'College-specific Grading',
    status: 'Active',
    created: '02 May 2026',
    updated: '15 May 2026',
  },
];

const initialGroupRows = [
  {
    id: 1,
    college: 'Roorkee College of Smart Education',
    assessmentName: 'Assessment Group A',
    assessmentModel: 'Scholastic',
    displayName: 'Group A Display',
    sequence: '1',
    resultDeclared: true,
    includeInTotal: true,
    displayValue: true,
    showGraph: false,
  },
];

const courseSubjects = {
  'B.Tech. Hons. CSE': [
    { id: 1, subject: 'Data Structures', totalMarks: 100, passingMarks: 35, weightage: '50%', include: true },
    { id: 2, subject: 'Algorithms', totalMarks: 100, passingMarks: 35, weightage: '50%', include: true },
  ],
  BBA: [
    { id: 1, subject: 'Business Economics', totalMarks: 100, passingMarks: 35, weightage: '50%', include: true },
    { id: 2, subject: 'Accounting', totalMarks: 100, passingMarks: 35, weightage: '50%', include: true },
  ],
};

export default function AcademicPlaceholderPage({ title, description }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [rows, setRows] = useState(initialRows);
  const [groupRows, setGroupRows] = useState(initialGroupRows);
  const [collegeFilter, setCollegeFilter] = useState('All Colleges');
  const [pendingCollegeFilter, setPendingCollegeFilter] = useState('All Colleges');
  const [assessmentFilter, setAssessmentFilter] = useState('All Assessments');
  const [lockMarksFilter, setLockMarksFilter] = useState('Any');

  const [assessmentModel, setAssessmentModel] = useState('scholastic');
  const [assessmentName, setAssessmentName] = useState('');
  const [bulkCollege, setBulkCollege] = useState('Roorkee College of Smart Education');
  const [course, setCourse] = useState('B.Tech. Hons. CSE');
  const [semester, setSemester] = useState('1st Semester');
  const [section, setSection] = useState('A');
  const [gradeSetup, setGradeSetup] = useState('B.TECH');
  const [lockMarksEntry, setLockMarksEntry] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFormulaForm, setShowFormulaForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupCollege, setGroupCollege] = useState('Roorkee College of Smart Education');
  const [groupCourse, setGroupCourse] = useState('B.Tech. Hons. CSE');
  const [groupBatch, setGroupBatch] = useState('2026');
  const [formulaName, setFormulaName] = useState('');
  const [formulaDisplayName, setFormulaDisplayName] = useState('');
  const [formulaAsstModel, setFormulaAsstModel] = useState('scholastic');
  const [formulaAssessment, setFormulaAssessment] = useState('Unit Test 1');
  const [formulaType, setFormulaType] = useState('Type A');
  const [formulaSequence, setFormulaSequence] = useState('1');
  const [includeInTotal, setIncludeInTotal] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [displayValue, setDisplayValue] = useState(false);
  const [weightage, setWeightage] = useState('');
  const [editResult, setEditResult] = useState(false);
  const [resultDeclared, setResultDeclared] = useState(false);

  const isFormValid = useMemo(
    () => groupName.trim().length > 0 && weightage.trim().length > 0 && !Number.isNaN(Number(weightage)) && Number(weightage) > 0,
    [groupName, weightage]
  );

  const filteredRows = rows.filter((row) => {
    const matchesCollege = collegeFilter === 'All Colleges' || row.college === collegeFilter;
    const matchesAssessment = assessmentFilter === 'All Assessments' || row.config === assessmentFilter;
    const matchesLock =
      lockMarksFilter === 'Any' ||
      (lockMarksFilter === 'Enabled' && row.status === 'Active') ||
      (lockMarksFilter === 'Disabled' && row.status === 'Inactive');

    return matchesCollege && matchesAssessment && matchesLock;
  });

  const filteredGroupRows = groupRows.filter((row) => {
    const matchesCollege = collegeFilter === 'All Colleges' || row.college === collegeFilter;
    const matchesAssessment = assessmentFilter === 'All Assessments' || row.assessmentName === assessmentFilter;
    const matchesLock =
      lockMarksFilter === 'Any' ||
      (lockMarksFilter === 'Enabled' && row.status === 'Active') ||
      (lockMarksFilter === 'Disabled' && row.status === 'Inactive');

    return matchesCollege && matchesAssessment && matchesLock;
  });

  const handleGetSubjects = () => {
    setSubjects(courseSubjects[course] ?? []);
  };

  const handleSaveAssessmentConfig = () => {
    if (!assessmentName) {
      window.alert('Please select an assessment name before saving.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newRow = {
      college: bulkCollege,
      config: assessmentName,
      status: lockMarksEntry ? 'Inactive' : 'Active',
      created: formattedDate,
      updated: formattedDate,
    };

    setRows((prev) => [newRow, ...prev]);
    setIsModalOpen(false);
    setSubjects([]);
  };

  const handleSaveGroup = () => {
    if (!groupName || !weightage) {
      window.alert('Enter a valid name and weightage to save the group.');
      return;
    }

    const newGroup = {
      id: groupRows.length + 1,
      college: groupCollege,
      assessmentName: groupName,
      assessmentModel: gradeSetup === 'B.TECH' ? 'Scholastic' : 'Co-Scholastic',
      displayName: formulaDisplayName || groupName,
      sequence: formulaSequence,
      resultDeclared,
      includeInTotal,
      displayValue,
      showGraph,
    };

    setGroupRows((prev) => [newGroup, ...prev]);
    setShowAddForm(false);
    setShowFormulaForm(false);
    setGroupName('');
    setGroupCollege('Roorkee College of Smart Education');
    setGroupCourse('B.Tech. Hons. CSE');
    setGroupBatch('2026');
    setGradeSetup('B.TECH');
    setWeightage('');
    setFormulaName('');
    setFormulaDisplayName('');
    setFormulaAsstModel('scholastic');
    setFormulaAssessment('Unit Test 1');
    setFormulaType('Type A');
    setFormulaSequence('1');
    setIncludeInTotal(false);
    setDisplayValue(false);
    setShowGraph(false);
    setEditResult(false);
    setResultDeclared(false);
  };

  const handleSaveFormula = () => {
    if (!formulaName.trim()) {
      window.alert('Enter a formula name before saving.');
      return;
    }

    if (!formulaDisplayName.trim()) {
      setFormulaDisplayName(formulaName);
    }

    setShowFormulaForm(false);
  };

  const handleResetFilters = () => {
    setCollegeFilter('All Colleges');
    setAssessmentFilter('All Assessments');
    setLockMarksFilter('Any');
  };

  const handleToggleLockMarks = () => {
    setLockMarksEntry((prev) => !prev);
  };

  useEffect(() => {
    document.title = `${title} - Institute Setup - Academics`;
  }, [title]);

  if (title === 'Assessment Group College Wise') {
    return (
      <div className="min-h-[calc(100vh-7rem)] w-full bg-white text-slate-900">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/' },
              { label: 'Academics Setup', to: '/settings/institute/academics' },
              { label: 'AssessmentGroup College Wise' },
            ]}
          />

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Academics Setup</div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">AssessmentGroup College Wise</h1>
                <p className="text-sm text-slate-500">AssessmentGroup College Wise</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm((open) => !open)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add New AssessmentGroup College Wise
            </button>
          </div>

          <div className="w-full rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select College</label>
                <select
                  value={pendingCollegeFilter}
                  onChange={(event) => setPendingCollegeFilter(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option>All Colleges</option>
                  <option>Roorkee College of Smart Education</option>
                  <option>North Campus</option>
                  <option>South Campus</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCollegeFilter(pendingCollegeFilter)}
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Go
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 ${
              showAddForm ? 'max-h-[1800px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-5">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGroupName('');
                    setGroupCollege('Roorkee College of Smart Education');
                    setGroupCourse('B.Tech. Hons. CSE');
                    setGroupBatch('2026');
                    setGradeSetup('B.TECH');
                    setWeightage('');
                    setEditResult(false);
                    setResultDeclared(false);
                    setIncludeInTotal(false);
                    setDisplayValue(false);
                    setShowGraph(false);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Enter Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="Enter Name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">College</label>
                  <select
                    value={groupCollege}
                    onChange={(event) => setGroupCollege(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option>Roorkee College of Smart Education</option>
                    <option>North Campus</option>
                    <option>South Campus</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select Course</label>
                  <select
                    value={groupCourse}
                    onChange={(event) => setGroupCourse(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option>B.Tech. Hons. CSE</option>
                    <option>BBA</option>
                    <option>BCA</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Batch</label>
                  <select
                    value={groupBatch}
                    onChange={(event) => setGroupBatch(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option>2026</option>
                    <option>2025</option>
                    <option>2024</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select Grade Setup</label>
                  <select
                    value={gradeSetup}
                    onChange={(event) => setGradeSetup(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option>B.TECH</option>
                    <option>MCA</option>
                    <option>External exams</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Enter Weightage</label>
                  <input
                    type="number"
                    value={weightage}
                    onChange={(event) => setWeightage(event.target.value)}
                    placeholder="Enter Weightage"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div className="xl:col-span-2 flex items-end justify-start">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Edit Result</span>
                    <button
                      type="button"
                      onClick={() => setEditResult((value) => !value)}
                      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                        editResult ? 'bg-sky-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          editResult ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Result Declared</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResultDeclared((value) => !value)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      resultDeclared ? 'bg-sky-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        resultDeclared ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Include In Total</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeInTotal((value) => !value)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      includeInTotal ? 'bg-sky-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        includeInTotal ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Display Value</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDisplayValue((value) => !value)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      displayValue ? 'bg-sky-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        displayValue ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Show Graph</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGraph((value) => !value)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      showGraph ? 'bg-sky-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        showGraph ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-950 text-white">
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-200">
                  <th className="whitespace-nowrap px-5 py-4"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 bg-slate-900 text-white" /></th>
                  <th className="whitespace-nowrap px-5 py-4">SNo</th>
                  <th className="whitespace-nowrap px-5 py-4">Assessment Name</th>
                  <th className="whitespace-nowrap px-5 py-4">Assessment Model</th>
                  <th className="whitespace-nowrap px-5 py-4">Display Name</th>
                  <th className="whitespace-nowrap px-5 py-4">Sequence No.</th>
                  <th className="whitespace-nowrap px-5 py-4">Result Declared</th>
                  <th className="whitespace-nowrap px-5 py-4">Include in Total</th>
                  <th className="whitespace-nowrap px-5 py-4">Display Value</th>
                  <th className="whitespace-nowrap px-5 py-4">Show Graph</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroupRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-sm text-slate-500">
                      No Records found !
                    </td>
                  </tr>
                ) : (
                  filteredGroupRows.map((row, index) => (
                    <tr key={row.id} className="border-b border-slate-200 last:border-none">
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900" />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{index + 1}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.assessmentName}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.assessmentModel}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.displayName}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.sequence}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.resultDeclared ? 'Yes' : 'No'}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.includeInTotal ? 'Yes' : 'No'}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.displayValue ? 'Yes' : 'No'}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-900">{row.showGraph ? 'Yes' : 'No'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => setShowFormulaForm((value) => !value)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              ADD FORMULAE
            </button>
            <button
              type="button"
              onClick={handleSaveGroup}
              disabled={!isFormValid}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              Add
            </button>
          </div>

          {showFormulaForm && (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1 min-w-0">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Formula Name
                  </label>
                  <input
                    type="text"
                    value={formulaName}
                    onChange={(e) => setFormulaName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                    placeholder="Enter formula name"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formulaDisplayName}
                    onChange={(e) => setFormulaDisplayName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                    placeholder="Enter display name"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Assessment Model
                  </label>
                  <select
                    value={formulaAsstModel}
                    onChange={(e) => setFormulaAsstModel(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option value="scholastic">Scholastic</option>
                    <option value="co-scholastic">Co-Scholastic</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Assessment
                  </label>
                  <select
                    value={formulaAssessment}
                    onChange={(e) => setFormulaAssessment(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option>Unit Test 1</option>
                    <option>Unit Test 2</option>
                    <option>Mid Term</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Type
                  </label>
                  <select
                    value={formulaType}
                    onChange={(e) => setFormulaType(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option>Type A</option>
                    <option>Type B</option>
                    <option>Type C</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Sequence No.
                  </label>
                  <input
                    type="text"
                    value={formulaSequence}
                    onChange={(e) => setFormulaSequence(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <input
                    id="include-in-total"
                    type="checkbox"
                    checked={includeInTotal}
                    onChange={(e) => setIncludeInTotal(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="include-in-total" className="text-sm font-medium text-slate-700">
                    Include in Total
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFormulaForm(false)}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFormula}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Save Formula
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (title === 'Assessment Config College Wise') {
    return (
      <div className="min-h-[calc(100vh-7rem)] w-full bg-white text-slate-900">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/' },
              { label: 'Academics Setup', to: '/settings/institute/academics' },
              { label: 'Assessment Config College Wise' },
            ]}
          />

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Academics Setup</div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Assessment Config College Wise</h1>
                </div>
                <p className="max-w-2xl text-sm text-slate-500">Assessment Config College Wise</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFilterOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Funnel className="h-4 w-4" />
                Filter
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Add New Assessment Config College Wise
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <HelpCircle className="h-4 w-4" />
                Need Help
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-[180px] flex-1">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Select College</label>
                    <select
                      value={collegeFilter}
                      onChange={(event) => setCollegeFilter(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                    >
                      <option>All Colleges</option>
                      <option>ROORKEE COLLEGE OF SCIENCE</option>
                      <option>North Campus</option>
                      <option>South Campus</option>
                    </select>
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Select Assessment</label>
                    <select
                      value={assessmentFilter}
                      onChange={(event) => setAssessmentFilter(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                    >
                      <option>All Assessments</option>
                      <option>Unit Test 1</option>
                      <option>Term Exam</option>
                    </select>
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Lock Marks Entry</label>
                    <select
                      value={lockMarksFilter}
                      onChange={(event) => setLockMarksFilter(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                    >
                      <option>Any</option>
                      <option>Enabled</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Go
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto w-full rounded-[24px] border border-slate-200/70 bg-white shadow-sm">
            <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-800" style={{ borderCollapse: 'separate', borderSpacing: '0 0' }}>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-4 py-4">College</th>
                  <th className="px-4 py-4">Assessment Config</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Created On</th>
                  <th className="px-4 py-4">Updated On</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <tr key={`${row.college}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border-b border-slate-200 px-4 py-4 text-slate-900">{row.college}</td>
                      <td className="border-b border-slate-200 px-4 py-4 text-slate-900">{row.config}</td>
                      <td className="border-b border-slate-200 px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 px-4 py-4 text-slate-600">{row.created}</td>
                      <td className="border-b border-slate-200 px-4 py-4 text-slate-600">{row.updated}</td>
                      <td className="border-b border-slate-200 px-4 py-4">
                        <button
                          type="button"
                          className="inline-flex rounded-full border border-emerald-600 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                      No assessment configs match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Modal
            title="Add New Assessment Config College Wise"
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            footer={
              <>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssessmentConfig}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Save Assessment Config
                </button>
              </>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select Assessment Model</label>
                <select
                  value={assessmentModel}
                  onChange={(event) => setAssessmentModel(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                >
                  <option value="scholastic">scholastic</option>
                  <option value="co-scholastic">co-scholastic</option>
                  <option value="skill">skill</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select Assessment Name</label>
                <select
                  value={assessmentName}
                  onChange={(event) => setAssessmentName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                >
                  <option value="">Select Assessment Name</option>
                  <option value="Unit Test 1">Unit Test 1</option>
                  <option value="Mid Term">Mid Term</option>
                </select>
              </div>
              <div className="xl:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">College</label>
                    <select
                      value={bulkCollege}
                      onChange={(event) => setBulkCollege(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                    >
                      <option value="Roorkee College of Smart Education">Roorkee College of Smart Education</option>
                      <option value="North Campus">North Campus</option>
                      <option value="South Campus">South Campus</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select Course</label>
                    <select
                      value={course}
                      onChange={(event) => setCourse(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                    >
                      <option value="B.Tech. Hons. CSE">B.Tech. Hons. CSE</option>
                      <option value="BBA">BBA</option>
                      <option value="BCA">BCA</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Semester</label>
                <select
                  value={semester}
                  onChange={(event) => setSemester(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select Section</label>
                <select
                  value={section}
                  onChange={(event) => setSection(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Select Grade Setup</label>
                <select
                  value={gradeSetup}
                  onChange={(event) => setGradeSetup(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white"
                >
                  <option value="B.TECH">B.TECH</option>
                  <option value="MCA">MCA</option>
                  <option value="External exams">External exams</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lock Marks Entry</p>
                  <p className="text-sm text-slate-600">{lockMarksEntry ? 'Enabled' : 'Disabled'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleLockMarks}
                  className={`h-10 w-20 rounded-full transition ${lockMarksEntry ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <span
                    className={`mx-auto block h-8 w-8 rounded-full bg-white shadow transition ${lockMarksEntry ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={handleGetSubjects}
                  className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Get Subjects
                </button>
              </div>
            </div>
            <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200 bg-white text-slate-900 shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">S No.</th>
                    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">Subject</th>
                    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">Total Marks</th>
                    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">Passing Marks</th>
                    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">Weightage</th>
                    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">Include in Total</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length > 0 ? (
                    subjects.map((subject, index) => (
                      <tr key={subject.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="whitespace-nowrap px-5 py-3 text-left text-sm text-slate-900">{index + 1}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-left text-sm text-slate-900">{subject.subject}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-left text-sm text-slate-900">{subject.totalMarks}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-left text-sm text-slate-900">{subject.passingMarks}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-left text-sm text-slate-900">{subject.weightage}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-left text-sm text-slate-900">{subject.include ? 'Yes' : 'No'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">
                        No subjects selected. Click Get Subjects to load subjects for the selected course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveAssessmentConfig}
                className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Add
              </button>
            </div>
          </Modal>
        </div>
      </div>
    );
  }

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Institute Setup', to: '/settings/institute' },
            { label: 'Academics', to: '/settings/institute/academics' },
            { label: title },
          ]}
        />

        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-2xl rounded-[24px] border border-slate-200 bg-slate-50/80 p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-600">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-[15px]">{description}</p>

            <div className="mt-6 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-left">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CalendarClock className="h-4 w-4" />
                Coming Soon
              </div>
              <p className="mt-2 text-sm text-emerald-800/90">
                This academic module is in active development and will be available in the ERP workflow soon.
              </p>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Continue with the Academics setup flow
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
