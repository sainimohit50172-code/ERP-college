import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  BookText,
  BrainCircuit,
  Building2,
  ChartColumnIncreasing,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  Layers3,
  PencilRuler,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  SquareStack,
  Users,
  WandSparkles,
} from 'lucide-react';

const initialCourses = [
  {
    id: 1,
    code: 'BCA-101',
    name: 'Bachelor of Computer Applications',
    program: 'BCA',
    department: 'Computer Science',
    type: 'UG',
    duration: '3 Years',
    semester: '6',
    intake: '120',
    status: 'Active',
    createdBy: 'Admin Team',
    updatedOn: '12 Jul 2026',
  },
  {
    id: 2,
    code: 'MBA-201',
    name: 'Master of Business Administration',
    program: 'MBA',
    department: 'Management',
    type: 'PG',
    duration: '2 Years',
    semester: '4',
    intake: '80',
    status: 'Active',
    createdBy: 'Academic Office',
    updatedOn: '08 Jul 2026',
  },
  {
    id: 3,
    code: 'DIP-301',
    name: 'Diploma in Mechanical Engineering',
    program: 'Diploma',
    department: 'Engineering',
    type: 'Diploma',
    duration: '3 Years',
    semester: '6',
    intake: '60',
    status: 'Inactive',
    createdBy: 'Admin Team',
    updatedOn: '02 Jul 2026',
  },
  {
    id: 4,
    code: 'CRT-401',
    name: 'Certificate in Digital Marketing',
    program: 'Certificate',
    department: 'Commerce',
    type: 'Certificate',
    duration: '6 Months',
    semester: '2',
    intake: '50',
    status: 'Active',
    createdBy: 'Admissions',
    updatedOn: '11 Jul 2026',
  },
];

const tabs = ['All Courses', 'Programs', 'Streams', 'Specializations', 'Course Categories'];

const summaryCards = [
  { title: 'Total Courses', value: '128', subtitle: 'Across all programs', icon: BookOpen, accent: 'text-emerald-600' },
  { title: 'Active Courses', value: '104', subtitle: 'Currently running', icon: Sparkles, accent: 'text-sky-600' },
  { title: 'Inactive Courses', value: '24', subtitle: 'Archived or paused', icon: Layers3, accent: 'text-amber-600' },
  { title: 'UG Courses', value: '62', subtitle: 'Undergraduate programs', icon: GraduationCap, accent: 'text-violet-600' },
  { title: 'PG Courses', value: '41', subtitle: 'Postgraduate studies', icon: BookText, accent: 'text-rose-600' },
  { title: 'Diploma Courses', value: '18', subtitle: 'Skill-based tracks', icon: ClipboardList, accent: 'text-cyan-600' },
  { title: 'Certificate Courses', value: '7', subtitle: 'Short-term offerings', icon: SquareStack, accent: 'text-fuchsia-600' },
];

const configCards = [
  { title: 'Program Types', description: 'UG, PG, diploma and certificate structures.', icon: GraduationCap },
  { title: 'Course Categories', description: 'Academic, professional, and skill-based clusters.', icon: Layers3 },
  { title: 'Streams', description: 'Science, commerce, engineering, humanities and more.', icon: BookText },
  { title: 'Specializations', description: 'Domain-focused tracks for modern curricula.', icon: BrainCircuit },
  { title: 'Semester Structure', description: 'Six, eight and ten-semester planning layouts.', icon: ClipboardList },
  { title: 'Credit System', description: 'Semester-wise credits and assessments workflow.', icon: CreditCard },
  { title: 'Examination Pattern', description: 'Internal, practical and final assessment rules.', icon: PencilRuler },
  { title: 'Attendance Rules', description: 'Eligibility, threshold and attendance compliance.', icon: Users },
];

const quickActions = [
  { title: 'Create Course', description: 'Launch a new academic offering.', icon: Plus },
  { title: 'Duplicate Course', description: 'Clone existing structure and update details.', icon: CopyIcon },
  { title: 'Import CSV', description: 'Bulk-import course schedules from spreadsheet.', icon: FileSpreadsheet },
  { title: 'Export Excel', description: 'Download catalog and planning snapshots.', icon: FileSpreadsheet },
  { title: 'Print', description: 'Share a printable course summary.', icon: BookOpen },
  { title: 'Archive', description: 'Move inactive programs into archive view.', icon: Layers3 },
];

const analyticsCards = [
  { title: 'Course Growth', value: '+18.6%', subtitle: 'New offerings this academic session', icon: ChartColumnIncreasing },
  { title: 'Department-wise Courses', value: '12', subtitle: 'Departments currently mapped', icon: Building2 },
  { title: 'Program Distribution', value: 'BCA • MBA • BBA', subtitle: 'Top growing programs', icon: Sparkles },
  { title: 'UG vs PG', value: '62 / 41', subtitle: 'Undergraduate vs postgraduate mix', icon: GraduationCap },
  { title: 'Active vs Inactive', value: '104 / 24', subtitle: 'Health of course catalog', icon: RefreshCw },
];

function CopyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className}>
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All Courses');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    courseName: 'Bachelor of Computer Applications',
    courseCode: 'BCA-101',
    department: 'Computer Science',
    program: 'BCA',
    courseType: 'UG',
    duration: '3 Years',
    semesters: '6',
    credits: '120',
    eligibility: '10+2 with PCM',
    medium: 'English',
    status: 'Active',
    description: 'Industry-aligned curriculum with practical labs and internship support.',
  });

  const filteredCourses = useMemo(() => {
    const term = search.toLowerCase();
    return initialCourses.filter((course) => {
      const matchesSearch = [course.name, course.code, course.department, course.program].some((value) => value.toLowerCase().includes(term));
      const matchesTab = activeTab === 'All Courses' || course.type === activeTab.replace(' Courses', '') || activeTab === 'Programs' || activeTab === 'Streams' || activeTab === 'Specializations' || activeTab === 'Course Categories';
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab]);

  return (
    <div className="mx-[10px] min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-3 shadow-inner sm:p-4 lg:p-5">
        <header className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Course Management</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-[15px]">
              Manage academic courses, programs, streams, duration, and course settings from one centralized workspace.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            128 Courses Available
          </div>
        </header>

        <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.03 }}
                whileHover={{ y: -4, scale: 1.01, boxShadow: '0 16px 30px rgba(15, 23, 42, 0.08)' }}
                className="hover-gradient-border rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{card.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                  <div className={`rounded-2xl bg-slate-50 p-2.5 ${card.accent}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">{card.subtitle}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-5 flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-slate-50/70 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover-gradient-border">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search course"
                className="w-36 bg-transparent outline-none sm:w-48"
              />
            </label>
            <select className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              <option>Course Type</option>
              <option>UG</option>
              <option>PG</option>
              <option>Diploma</option>
              <option>Certificate</option>
            </select>
            <select className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              <option>Department</option>
              <option>Computer Science</option>
              <option>Management</option>
              <option>Engineering</option>
              <option>Commerce</option>
            </select>
            <select className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              <option>Duration</option>
              <option>6 Months</option>
              <option>2 Years</option>
              <option>3 Years</option>
            </select>
            <select className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              <option>Academic Session</option>
              <option>2025-26</option>
              <option>2026-27</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setIsDrawerOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
              <Plus className="h-4 w-4" /> Add Course
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <FileSpreadsheet className="h-4 w-4" /> Import
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <FileSpreadsheet className="h-4 w-4" /> Export
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </section>

        <section className="mt-5 flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${activeTab === tab ? 'bg-emerald-600 text-white shadow-sm hover-gradient-border' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover-gradient-border'}`}
            >
              {tab}
            </button>
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50/80">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-white/80 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Course Code</th>
                    <th className="px-4 py-3 font-semibold">Course Name</th>
                    <th className="px-4 py-3 font-semibold">Program</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                    <th className="px-4 py-3 font-semibold">Semester</th>
                    <th className="px-4 py-3 font-semibold">Intake</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Updated On</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white/80 text-slate-700">
                  {filteredCourses.map((course, index) => (
                    <tr key={course.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{course.code}</td>
                      <td className="px-4 py-3">{course.name}</td>
                      <td className="px-4 py-3">{course.program}</td>
                      <td className="px-4 py-3">{course.department}</td>
                      <td className="px-4 py-3">{course.type}</td>
                      <td className="px-4 py-3">{course.duration}</td>
                      <td className="px-4 py-3">{course.semester}</td>
                      <td className="px-4 py-3">{course.intake}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${course.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{course.updatedOn}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setIsDrawerOpen(true)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover-gradient-border">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-600">Course workspace</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{isDrawerOpen ? 'Add / Edit Course' : 'Course Details'}</h2>
              </div>
              <button type="button" onClick={() => setIsDrawerOpen((value) => !value)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 hover-gradient-border">
                {isDrawerOpen ? 'Close' : 'Open'}
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="text-sm font-medium text-slate-700">
                Course Name
                <input value={form.courseName} onChange={(event) => setForm({ ...form, courseName: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Course Code
                <input value={form.courseCode} onChange={(event) => setForm({ ...form, courseCode: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Department
                <select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option>Computer Science</option>
                  <option>Management</option>
                  <option>Engineering</option>
                  <option>Commerce</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Program
                <input value={form.program} onChange={(event) => setForm({ ...form, program: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Course Type
                <select value={form.courseType} onChange={(event) => setForm({ ...form, courseType: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option>UG</option>
                  <option>PG</option>
                  <option>Diploma</option>
                  <option>Certificate</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Duration
                <input value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                No. of Semesters
                <input value={form.semesters} onChange={(event) => setForm({ ...form, semesters: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Credits
                <input value={form.credits} onChange={(event) => setForm({ ...form, credits: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Eligibility
                <input value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Medium
                <input value={form.medium} onChange={(event) => setForm({ ...form, medium: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Status
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Description
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>
              <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                Save Course
              </button>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {configCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.03 }}
                whileHover={{ y: -4, scale: 1.01, boxShadow: '0 16px 30px rgba(15, 23, 42, 0.08)' }}
                className="hover-gradient-border rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-500">{card.description}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-6 grid gap-3 lg:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.03 }}
                whileHover={{ y: -4, scale: 1.01, boxShadow: '0 16px 30px rgba(15, 23, 42, 0.08)' }}
                className="hover-gradient-border flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
              >
                <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                </div>
              </motion.button>
            );
          })}
        </section>

        <section className="mt-6 grid gap-3 xl:grid-cols-2">
          {analyticsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.03 }}
                whileHover={{ y: -4, scale: 1.01, boxShadow: '0 16px 30px rgba(15, 23, 42, 0.08)' }}
                className="hover-gradient-border rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{card.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">{card.subtitle}</p>
              </motion.article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
