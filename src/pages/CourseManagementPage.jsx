import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, GraduationCap, Layers3, Plus, Search, Sparkles, X } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const initialCourses = [
  {
    code: 'BCA-101',
    name: 'Bachelor of Computer Applications',
    department: 'Computer Science',
    program: 'BCA',
    duration: '3 Years',
    semesters: '6',
    eligibility: '10+2 with PCM',
    credits: '120',
    status: 'Active',
    description: 'Industry-aligned curriculum with practical labs and internship support.',
  },
  {
    code: 'MCA-201',
    name: 'Master of Computer Applications',
    department: 'Computer Science',
    program: 'MCA',
    duration: '2 Years',
    semesters: '4',
    eligibility: 'BCA/B.Sc with Mathematics',
    credits: '88',
    status: 'Active',
    description: 'Advanced application development and software engineering track.',
  },
  {
    code: 'BTECH-CSE-301',
    name: 'B.Tech Computer Science and Engineering',
    department: 'Engineering',
    program: 'B.Tech',
    duration: '4 Years',
    semesters: '8',
    eligibility: '10+2 with Physics & Mathematics',
    credits: '160',
    status: 'Active',
    description: 'Core engineering program with AI, data science and cloud modules.',
  },
  {
    code: 'BTECH-ME-401',
    name: 'B.Tech Mechanical Engineering',
    department: 'Engineering',
    program: 'B.Tech',
    duration: '4 Years',
    semesters: '8',
    eligibility: '10+2 with Physics & Mathematics',
    credits: '160',
    status: 'Active',
    description: 'Applied mechanical design and manufacturing-oriented curriculum.',
  },
  {
    code: 'BTECH-CIV-501',
    name: 'B.Tech Civil Engineering',
    department: 'Engineering',
    program: 'B.Tech',
    duration: '4 Years',
    semesters: '8',
    eligibility: '10+2 with Physics & Mathematics',
    credits: '160',
    status: 'Draft',
    description: 'Infrastructure planning and construction management focused program.',
  },
  {
    code: 'BTECH-ECE-601',
    name: 'B.Tech Electronics & Communication Engineering',
    department: 'Engineering',
    program: 'B.Tech',
    duration: '4 Years',
    semesters: '8',
    eligibility: '10+2 with Physics & Mathematics',
    credits: '160',
    status: 'Active',
    description: 'Modern electronics systems and communication design curriculum.',
  },
  {
    code: 'BBA-701',
    name: 'Bachelor of Business Administration',
    department: 'Management',
    program: 'BBA',
    duration: '3 Years',
    semesters: '6',
    eligibility: '10+2 in any stream',
    credits: '120',
    status: 'Active',
    description: 'Management and leadership training with entrepreneurship exposure.',
  },
  {
    code: 'MBA-801',
    name: 'Master of Business Administration',
    department: 'Management',
    program: 'MBA',
    duration: '2 Years',
    semesters: '4',
    eligibility: 'Graduate in any discipline',
    credits: '88',
    status: 'Active',
    description: 'Strategic business, finance and marketing management program.',
  },
  {
    code: 'BCOM-901',
    name: 'Bachelor of Commerce',
    department: 'Commerce',
    program: 'B.Com',
    duration: '3 Years',
    semesters: '6',
    eligibility: '10+2 with commerce or equivalent',
    credits: '120',
    status: 'Inactive',
    description: 'Commerce specialization covering accounting and business operations.',
  },
  {
    code: 'MCOM-1001',
    name: 'Master of Commerce',
    department: 'Commerce',
    program: 'M.Com',
    duration: '2 Years',
    semesters: '4',
    eligibility: 'B.Com or equivalent',
    credits: '88',
    status: 'Active',
    description: 'Advanced accounting, taxation and finance curriculum.',
  },
  {
    code: 'BA-1101',
    name: 'Bachelor of Arts',
    department: 'Humanities',
    program: 'BA',
    duration: '3 Years',
    semesters: '6',
    eligibility: '10+2 in any stream',
    credits: '120',
    status: 'Active',
    description: 'Broad liberal arts program with social sciences foundation.',
  },
  {
    code: 'MA-ENG-1201',
    name: 'Master of Arts in English',
    department: 'Humanities',
    program: 'MA English',
    duration: '2 Years',
    semesters: '4',
    eligibility: 'BA in English or equivalent',
    credits: '88',
    status: 'Draft',
    description: 'Literary studies and communication-focused postgraduate program.',
  },
  {
    code: 'BSC-AGR-1301',
    name: 'Bachelor of Science in Agriculture',
    department: 'Agriculture',
    program: 'B.Sc Agriculture',
    duration: '4 Years',
    semesters: '8',
    eligibility: '10+2 with Science',
    credits: '160',
    status: 'Active',
    description: 'Applied agriculture and crop science curriculum for modern farming.',
  },
  {
    code: 'MSC-AGR-1401',
    name: 'Master of Science in Agriculture',
    department: 'Agriculture',
    program: 'M.Sc Agriculture',
    duration: '2 Years',
    semesters: '4',
    eligibility: 'B.Sc Agriculture or equivalent',
    credits: '88',
    status: 'Active',
    description: 'Research and advanced agriculture disciplines for specialization.',
  },
  {
    code: 'BPHAR-1501',
    name: 'Bachelor of Pharmacy',
    department: 'Pharmacy',
    program: 'B.Pharma',
    duration: '4 Years',
    semesters: '8',
    eligibility: '10+2 with Physics, Chemistry and Biology',
    credits: '160',
    status: 'Active',
    description: 'Professional pharmacy education with practical exposure.',
  },
  {
    code: 'DPHAR-1601',
    name: 'Diploma in Pharmacy',
    department: 'Pharmacy',
    program: 'D.Pharm',
    duration: '2 Years',
    semesters: '4',
    eligibility: '10+2 with Science',
    credits: '80',
    status: 'Inactive',
    description: 'Skill-based pharmacy diploma for healthcare support roles.',
  },
  {
    code: 'LLB-1701',
    name: 'Bachelor of Laws',
    department: 'Law',
    program: 'LLB',
    duration: '3 Years',
    semesters: '6',
    eligibility: 'Graduate in any discipline',
    credits: '120',
    status: 'Active',
    description: 'Legal studies and professional practice foundation program.',
  },
  {
    code: 'BED-1801',
    name: 'Bachelor of Education',
    department: 'Education',
    program: 'B.Ed',
    duration: '2 Years',
    semesters: '4',
    eligibility: 'Graduate in relevant discipline',
    credits: '88',
    status: 'Archived',
    description: 'Teacher education curriculum for school academic leadership.',
  },
  {
    code: 'MED-1901',
    name: 'Master of Education',
    department: 'Education',
    program: 'M.Ed',
    duration: '2 Years',
    semesters: '4',
    eligibility: 'B.Ed or equivalent',
    credits: '88',
    status: 'Draft',
    description: 'Advanced education management and instructional design program.',
  },
];

const helpers = [
  {
    title: 'Current courses',
    description: 'Review active academic offerings and the departments they belong to.',
    icon: BookOpen,
    content: {
      heading: 'Current courses',
      summary: 'The current course list reflects the active learning programs that are open for registration and academic delivery.',
      bullets: ['Active programs remain visible for admissions and scheduling.', 'Inactive and archived programs can be reviewed separately.', 'Departments can monitor course health from one workspace.'],
    },
  },
  {
    title: 'Program guidelines',
    description: 'Keep programs aligned with curriculum standards and intake planning.',
    icon: GraduationCap,
    content: {
      heading: 'Program guidelines',
      summary: 'Use these standards to ensure every academic program follows the approved curriculum structure and compliance requirements.',
      bullets: ['Each program should follow the approved duration and semester pattern.', 'Admissions intake should align with faculty and infrastructure capacity.', 'Curriculum changes should be reviewed before publication.'],
    },
  },
  {
    title: 'Course configuration',
    description: 'Set duration, semesters, credit structure, and delivery format.',
    icon: Layers3,
    content: {
      heading: 'Course configuration',
      summary: 'Configure course setup with accurate semester count, credits and eligibility so the catalog remains consistent.',
      bullets: ['Set duration and semesters before activation.', 'Define eligibility and credits for each program level.', 'Use the same configuration pattern for all academic batches.'],
    },
  },
  {
    title: 'Academic credits',
    description: 'Track credit hours and academic load across each course structure.',
    icon: Sparkles,
    content: {
      heading: 'Academic credits',
      summary: 'Credit tracking keeps the academic workload balanced across semesters and supports internal evaluation planning.',
      bullets: ['Credit values should match the prescribed scheme.', 'Higher credits usually indicate greater instructional workload.', 'Review credits before publishing the final academic calendar.'],
    },
  },
];

function getStatusClasses(status) {
  if (status === 'Active') {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (status === 'Inactive') {
    return 'bg-slate-100 text-slate-700';
  }
  if (status === 'Archived') {
    return 'bg-rose-100 text-rose-700';
  }
  return 'bg-amber-100 text-amber-700';
}

const emptyForm = {
  name: '',
  code: '',
  department: 'Computer Science',
  program: '',
  duration: '',
  semesters: '',
  eligibility: '',
  credits: '',
  status: 'Active',
  description: '',
};

export default function CourseManagementPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isHelperOpen, setIsHelperOpen] = useState(false);
  const [helperContent, setHelperContent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  const filteredCourses = useMemo(() => {
    const query = search.toLowerCase();
    return courses.filter((course) => {
      const matchesSearch = [course.code, course.name, course.department, course.program].some((value) => value.toLowerCase().includes(query));
      const matchesDepartment = departmentFilter === 'All Departments' || course.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [courses, search, departmentFilter]);

  const openCreateModal = () => {
    setForm(emptyForm);
    setFormErrors({});
    setIsEditMode(false);
    setSelectedCourse(null);
    setIsCreateOpen(true);
  };

  const openViewModal = (course) => {
    setSelectedCourse(course);
    setIsEditMode(false);
    setFormErrors({});
  };

  const openHelperModal = (item) => {
    setHelperContent(item);
    setIsHelperOpen(true);
  };

  const handleCreateSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    ['name', 'code', 'department', 'program', 'duration', 'semesters', 'eligibility', 'credits', 'status', 'description'].forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    const newCourse = {
      ...form,
      code: form.code.toUpperCase(),
      name: form.name,
      department: form.department,
      program: form.program,
      duration: form.duration,
      semesters: form.semesters,
      eligibility: form.eligibility,
      credits: form.credits,
      status: form.status,
      description: form.description,
    };

    setCourses((current) => [newCourse, ...current]);
    setIsCreateOpen(false);
    setForm(emptyForm);
    setFormErrors({});
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    ['name', 'code', 'department', 'program', 'duration', 'semesters', 'eligibility', 'credits', 'status', 'description'].forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setCourses((current) => current.map((course) => (course.code === selectedCourse.code ? { ...course, ...form, code: form.code.toUpperCase() } : course)));
    setSelectedCourse(null);
    setIsEditMode(false);
    setForm(emptyForm);
    setFormErrors({});
  };

  const startEdit = () => {
    if (!selectedCourse) {
      return;
    }
    setForm({
      name: selectedCourse.name,
      code: selectedCourse.code,
      department: selectedCourse.department,
      program: selectedCourse.program,
      duration: selectedCourse.duration,
      semesters: selectedCourse.semesters,
      eligibility: selectedCourse.eligibility,
      credits: selectedCourse.credits,
      status: selectedCourse.status,
      description: selectedCourse.description,
    });
    setIsEditMode(true);
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mt-3">
              <Breadcrumb
                items={[
                  { label: 'Settings', to: '/settings' },
                  { label: 'Institute Setup', to: '/settings/institute' },
                  { label: 'Courses' },
                ]}
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Course Management</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Manage courses, programs, departments, duration and academic structure from one centralized workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold">Course helpers</h3>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            {helpers.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => openHelperModal(item)}
                  className="flex h-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover-gradient-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  <ChevronLeft className="ml-3 h-4 w-4 rotate-180 text-slate-400" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Course overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Available Courses</h2>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border"
            >
              <Plus className="h-4 w-4" /> Add Course
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover-gradient-border">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search course"
                className="w-full bg-transparent outline-none sm:w-48"
              />
            </label>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border"
            >
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>Management</option>
              <option>Engineering</option>
              <option>Commerce</option>
              <option>Humanities</option>
              <option>Agriculture</option>
              <option>Pharmacy</option>
              <option>Law</option>
              <option>Education</option>
            </select>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead>
                <tr className="bg-emerald-600 text-left uppercase tracking-[0.12em] text-white">
                  <th className="px-4 py-4">Course Code</th>
                  <th className="px-4 py-4">Course Name</th>
                  <th className="px-4 py-4">Department</th>
                  <th className="px-4 py-4">Program</th>
                  <th className="px-4 py-4">Duration</th>
                  <th className="px-4 py-4">Semesters</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm">
                {filteredCourses.map((course, index) => (
                  <tr key={`${course.code}-${index}`} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{course.code}</td>
                    <td className="px-4 py-4 text-slate-700">{course.name}</td>
                    <td className="whitespace-nowrap px-4 py-4">{course.department}</td>
                    <td className="whitespace-nowrap px-4 py-4">{course.program}</td>
                    <td className="whitespace-nowrap px-4 py-4">{course.duration}</td>
                    <td className="whitespace-nowrap px-4 py-4">{course.semesters}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                      <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getStatusClasses(course.status)}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openViewModal(course)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Course setup</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Add course</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setForm(emptyForm);
                  setFormErrors({});
                }}
                className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateSubmit}>
              {[
                ['name', 'Course Name'],
                ['code', 'Course Code'],
                ['department', 'Department'],
                ['program', 'Program'],
                ['duration', 'Duration'],
                ['semesters', 'Semesters'],
                ['eligibility', 'Eligibility'],
                ['credits', 'Credits'],
              ].map(([field, label]) => (
                <label key={field} className="text-sm font-medium text-slate-700">
                  {label}
                  <input
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border"
                  />
                  {formErrors[field] ? <p className="mt-1 text-xs text-rose-500">{formErrors[field]}</p> : null}
                </label>
              ))}

              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
                {formErrors.status ? <p className="mt-1 text-xs text-rose-500">{formErrors.status}</p> : null}
              </label>

              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows="3"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border"
                />
                {formErrors.description ? <p className="mt-1 text-xs text-rose-500">{formErrors.description}</p> : null}
              </label>

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                  <Plus className="h-4 w-4" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setForm(emptyForm);
                    setFormErrors({});
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCourse && !isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Course profile</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedCourse.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Course code</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCourse.code}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Department</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCourse.department}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Program</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCourse.program}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Duration</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCourse.duration}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Semesters</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCourse.semesters}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Eligibility</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCourse.eligibility}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Credits</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCourse.credits}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedCourse.status}</p>
              </div>
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Description</p>
                <p className="mt-2 text-sm text-slate-700">{selectedCourse.description}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={startEdit} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                Edit
              </button>
              <button type="button" onClick={() => setSelectedCourse(null)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCourse && isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Course edit</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Edit course</h3>
              </div>
              <button type="button" onClick={() => setIsEditMode(false)} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
              {[
                ['name', 'Course Name'],
                ['code', 'Course Code'],
                ['department', 'Department'],
                ['program', 'Program'],
                ['duration', 'Duration'],
                ['semesters', 'Semesters'],
                ['eligibility', 'Eligibility'],
                ['credits', 'Credits'],
              ].map(([field, label]) => (
                <label key={field} className="text-sm font-medium text-slate-700">
                  {label}
                  <input
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border"
                  />
                  {formErrors[field] ? <p className="mt-1 text-xs text-rose-500">{formErrors[field]}</p> : null}
                </label>
              ))}

              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
                {formErrors.status ? <p className="mt-1 text-xs text-rose-500">{formErrors.status}</p> : null}
              </label>

              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows="3"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border"
                />
                {formErrors.description ? <p className="mt-1 text-xs text-rose-500">{formErrors.description}</p> : null}
              </label>

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                  Save changes
                </button>
                <button type="button" onClick={() => setIsEditMode(false)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {helperContent && isHelperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  {(() => {
                    const HelperIcon = helperContent.icon;
                    return <HelperIcon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Course help</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{helperContent.content.heading}</h3>
                </div>
              </div>
              <button type="button" onClick={() => setIsHelperOpen(false)} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm text-slate-700">{helperContent.content.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {helperContent.content.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setIsHelperOpen(false)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}