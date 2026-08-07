import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, HelpCircle, Upload } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useERP } from '../services/ERPContext.jsx';

const subjectOptions = [
  'Mathematics-I',
  'Physics',
  'Programming in C',
  'Python Programming',
  'Java Programming',
  'Data Structures',
  'Algorithms',
  'Operating System',
  'Database Management System',
  'Computer Networks',
  'Artificial Intelligence',
  'Machine Learning',
  'Software Engineering',
  'Web Development',
  'Discrete Mathematics',
  'Object Oriented Programming',
  'Cloud Computing',
  'Cyber Security',
  'Computer Graphics',
  'Compiler Design',
];

const employeeOptions = [
  'Dr. Amit Sharma',
  'Prof. Rahul Verma',
  'Dr. Neha Gupta',
  'Prof. Ankit Singh',
  'Dr. Priya Joshi',
  'Prof. Mohit Kumar',
  'Dr. Shalini Agarwal',
  'Prof. Vivek Chauhan',
  'Dr. Pooja Sharma',
  'Prof. Deepak Kumar',
];

function Dropdown({ label, selected, options, onSelect, renderOption }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 text-left text-sm text-slate-900 shadow-sm transition hover:border-slate-400 focus:outline-none"
      >
        <span className="min-w-0 truncate">
          {selected ? (renderOption ? renderOption(selected, true) : selected.label) : 'Select...'}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
          <ul className="divide-y divide-slate-200">
            {options.map((option) => (
              <li key={option.value ?? option.id ?? option}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50"
                >
                  {renderOption ? renderOption(option, false) : option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SubjectAssignmentPage() {
  const { colleges = [] } = useERP();
  const collegeOptions = useMemo(() => {
    const source = Array.isArray(colleges) ? colleges : [];

    return source.map((college, index) => {
      const title = typeof college === 'string'
        ? college
        : college.name || college.collegeName || college.label || `College ${college.id ?? index + 1}`;
      return {
        id: String(college.id ?? `college-${index + 1}`),
        title,
        subtitle: typeof college === 'string' ? 'College' : college.subtitle || 'College',
        extra: typeof college === 'string' ? '' : college.extra || '',
      };
    });
  }, [colleges]);

  const [selectedCollege, setSelectedCollege] = useState(collegeOptions[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjectOptions[0]);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeOptions[0]);
  const [showSubjectsColumn, setShowSubjectsColumn] = useState(false);
  const [activeCollege, setActiveCollege] = useState(collegeOptions[0]);
  const [selectedUploadFileName, setSelectedUploadFileName] = useState('');

  useEffect(() => {
    if (!collegeOptions.length) return;

    const hasSelectedCollege = selectedCollege && collegeOptions.some((option) => option.id === selectedCollege.id);
    const hasActiveCollege = activeCollege && collegeOptions.some((option) => option.id === activeCollege.id);

    if (!hasSelectedCollege) {
      setSelectedCollege(collegeOptions[0]);
    }
    if (!hasActiveCollege) {
      setActiveCollege(collegeOptions[0]);
    }
  }, [collegeOptions, selectedCollege, activeCollege]);

  const uploadInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Assign Subject - Academics Setup';
  }, []);

  return (
    <main className="min-h-screen w-full bg-slate-50 text-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Academics Setup', to: '/settings/institute/academics' },
            { label: 'Assign Subject' },
          ]}
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Academics Setup</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Assign Subject</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage subject assignments across college programs with clean dropdown selection and quick actions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => uploadInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
              <Upload className="h-4 w-4" />
              Upload Excel
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <HelpCircle className="h-4 w-4" />
              Need Help
            </button>
          </div>
          <input
            ref={uploadInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setSelectedUploadFileName(file.name);
              event.target.value = '';
            }}
          />
          {selectedUploadFileName ? (
            <p className="mt-2 text-sm text-slate-600">Selected file: {selectedUploadFileName}</p>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Select college</p>
                  <Dropdown
                    label="College"
                    selected={selectedCollege}
                    options={collegeOptions}
                    onSelect={setSelectedCollege}
                    renderOption={(option, isSelected) => (
                      <div className="space-y-0.5">
                        <p className="truncate text-sm font-semibold text-slate-950">{option.title}</p>
                        <p className="text-xs text-slate-500">{option.subtitle} · {option.extra}</p>
                      </div>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Action</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">Switch college view</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCollege(selectedCollege)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Go
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Dropdown
                  label="Select subject"
                  selected={selectedSubject}
                  options={subjectOptions}
                  onSelect={setSelectedSubject}
                  renderOption={(option) => <span className="text-sm text-slate-900">{option}</span>}
                />
                <Dropdown
                  label="Select employee"
                  selected={selectedEmployee}
                  options={employeeOptions}
                  onSelect={setSelectedEmployee}
                  renderOption={(option) => <span className="text-sm text-slate-900">{option}</span>}
                />
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Display setting</p>
                  <p className="mt-2 text-sm text-slate-700">Show Subjects Column</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubjectsColumn((prev) => !prev)}
                  className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors ${showSubjectsColumn ? 'bg-slate-950' : 'bg-slate-300'}`}
                >
                  <span className={`absolute left-0.5 h-8 w-8 rounded-full bg-white shadow transition-transform ${showSubjectsColumn ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Active selection</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{activeCollege.title}</p>
                <p className="mt-1 text-sm text-slate-600">{activeCollege.subtitle} · {activeCollege.extra}</p>
              </div>

              <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Selected subject</p>
                  <p className="text-sm font-semibold text-slate-950">{selectedSubject}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Assigned employee</p>
                  <p className="text-sm font-semibold text-slate-950">{selectedEmployee}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-900">Subjects column</p>
                <p className="mt-2">{showSubjectsColumn ? 'Visible in the subject assignment table.' : 'Hidden from the subject assignment table.'}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
