import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Layers, ClipboardList, ClipboardCheck, BarChart3, SlidersHorizontal } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';

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
                      <div key={item.title} className="grid gap-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 shadow-lg">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-end sm:justify-center">
                          <Button
                            variant="primary"
                            className="rounded-2xl px-4 py-2 text-sm font-semibold"
                            onClick={() => navigate(item.route)}
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
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
