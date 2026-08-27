import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Layers, ClipboardList, ClipboardCheck, BarChart3, SlidersHorizontal } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const phaseGroups = [
  {
    title: 'PHASE 1: SUBJECT MANAGEMENT',
    items: [
      {
        title: 'Subject Management',
        description: 'Create and maintain subjects, assessment models, credits, and modes.',
        route: '/subjects',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'PHASE 2: FACULTY & ACADEMIC ASSIGNMENT',
    items: [
      {
        title: 'Faculty Mapping',
        description: 'Map class teachers and coordinators to course combinations with active students.',
        route: '/settings/institute/academics/faculty-mapping',
        icon: Users,
      },
      {
        title: 'Subject Course Mapping',
        description: 'Assign subjects and teachers to class sections with sequence and display names.',
        route: '/settings/institute/academics/subject-college-mapping',
        icon: Layers,
      },
      {
        title: 'Allocate Subjects',
        description: 'Allocate compulsory and optional subjects to students for the active session.',
        route: '/students/allocate-subject',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'PHASE 3: ASSESSMENT & EXAMINATION SETUP',
    items: [
      {
        title: 'Assessment Master',
        description: 'Define assessment structures and master configuration for the academic session.',
        route: '/settings/institute/academics/assessment-master',
        icon: ClipboardCheck,
      },
      {
        title: 'Assessment Grade Setup',
        description: 'Configure grade definitions, scoring criteria, and grade scale mappings.',
        route: '/settings/institute/academics/assessment-grade-setup',
        icon: BarChart3,
      },
      {
        title: 'Assessment Config',
        description: 'Configure academic assessment settings and evaluation rules for the institute.',
        route: '/settings/institute/academics/assessment-config',
        icon: SlidersHorizontal,
      },
    ],
  },
];

export default function AcademicsManagementPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Academics Setup';
  }, []);

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-5 shadow-inner sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: 'Academic', to: '/settings/institute/academics' },
            { label: 'Academics Setup' },
          ]}
        />

        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-600">Academic</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Academics Setup</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600 sm:text-base">
            Access the full academic management sequence from subject setup to assessment configuration in a structured workflow.
          </p>
        </div>

        <div className="grid gap-4 xl:items-start">
          <div className="relative space-y-10 px-[5px]">
            <div className="absolute left-[44px] top-0 bottom-0 w-px bg-slate-200 -z-10" />
            {phaseGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="w-full space-y-6 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 shadow-sm sm:p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {group.title}
                  </p>
                </div>
                <div className="space-y-6">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.title}
                        type="button"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: groupIndex * 0.04 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        onClick={() => navigate(item.route)}
                        className="group flex min-h-[190px] w-full flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-2 focus:ring-sky-300"
                      >
                        <div className="mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sky-700 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-200 group-hover:bg-sky-50">
                          <Icon className="h-7 w-7" />
                        </div>
                        <h2 className="text-lg font-semibold leading-tight text-slate-900 transition-colors group-hover:text-sky-700">{item.title}</h2>
                        <p className="mt-2 max-w-[220px] text-sm leading-5 text-slate-500">{item.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
