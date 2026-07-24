import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileCog,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const defaultPreferences = {
  instituteTimeZone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24 Hours',
  language: 'English',
  currency: 'INR',
  country: 'India',
  state: 'Uttarakhand',
  city: 'Haridwar',
  academicYearStart: 'July',
  defaultSession: '2026-27',
  semesterSystem: 'CBCS',
  creditSystem: 'Choice Based Credit System',
  passingPercentage: '40%',
  attendanceRequirement: '75%',
  defaultCourseDuration: '3 Years',
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: false,
  studentAlerts: true,
  facultyAlerts: true,
  parentNotifications: true,
  defaultTheme: 'Light',
  defaultDashboard: 'Admin Dashboard',
  defaultLandingModule: 'Dashboard',
  autoLogoutTime: '30 Minutes',
  defaultUserRole: 'Admin',
  timezoneSync: true,
  passwordPolicy: 'Strong (8+ chars)',
  otpVerification: true,
  twoFactorAuthentication: true,
  sessionTimeout: '20 Minutes',
  loginAttempts: '5 Attempts',
  deviceVerification: false,
};

const sections = [
  {
    id: 'general',
    title: 'General Preferences',
    description: 'Core institution identity and operating defaults.',
    icon: SlidersHorizontal,
    fields: [
      { key: 'instituteTimeZone', label: 'Institute Time Zone', type: 'select', options: ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'] },
      { key: 'dateFormat', label: 'Date Format', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
      { key: 'timeFormat', label: 'Time Format', type: 'select', options: ['24 Hours', '12 Hours'] },
      { key: 'language', label: 'Language', type: 'select', options: ['English', 'Hindi', 'Bengali', 'Tamil'] },
      { key: 'currency', label: 'Currency', type: 'select', options: ['INR', 'USD', 'EUR', 'AED'] },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
    ],
  },
  {
    id: 'academic',
    title: 'Academic Preferences',
    description: 'Academic year, session, and attainment defaults.',
    icon: BookOpen,
    fields: [
      { key: 'academicYearStart', label: 'Academic Year Start', type: 'select', options: ['July', 'January', 'April', 'September'] },
      { key: 'defaultSession', label: 'Default Session', type: 'text' },
      { key: 'semesterSystem', label: 'Semester System', type: 'text' },
      { key: 'creditSystem', label: 'Credit System', type: 'text' },
      { key: 'passingPercentage', label: 'Passing Percentage', type: 'text' },
      { key: 'attendanceRequirement', label: 'Attendance Requirement', type: 'text' },
      { key: 'defaultCourseDuration', label: 'Default Course Duration', type: 'text' },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Notifications and engagement defaults.',
    icon: Bell,
    fields: [
      { key: 'emailNotifications', label: 'Email Notifications', type: 'toggle' },
      { key: 'smsNotifications', label: 'SMS Notifications', type: 'toggle' },
      { key: 'whatsappNotifications', label: 'WhatsApp Notifications', type: 'toggle' },
      { key: 'studentAlerts', label: 'Student Alerts', type: 'toggle' },
      { key: 'facultyAlerts', label: 'Faculty Alerts', type: 'toggle' },
      { key: 'parentNotifications', label: 'Parent Notifications', type: 'toggle' },
    ],
  },
  {
    id: 'system',
    title: 'System Defaults',
    description: 'Theme, landing experience, and session defaults.',
    icon: FileCog,
    fields: [
      { key: 'defaultTheme', label: 'Default Theme', type: 'select', options: ['Light', 'Dark', 'System'] },
      { key: 'defaultDashboard', label: 'Default Dashboard', type: 'select', options: ['Admin Dashboard', 'Student Dashboard', 'Faculty Dashboard'] },
      { key: 'defaultLandingModule', label: 'Default Landing Module', type: 'select', options: ['Dashboard', 'Admissions', 'Attendance', 'Finance'] },
      { key: 'autoLogoutTime', label: 'Auto Logout Time', type: 'select', options: ['15 Minutes', '30 Minutes', '45 Minutes', '60 Minutes'] },
      { key: 'defaultUserRole', label: 'Default User Role', type: 'select', options: ['Admin', 'Faculty', 'Student', 'Parent'] },
      { key: 'timezoneSync', label: 'Timezone Sync', type: 'toggle' },
    ],
  },
  {
    id: 'security',
    title: 'Security Preferences',
    description: 'Authentication and access controls.',
    icon: ShieldCheck,
    fields: [
      { key: 'passwordPolicy', label: 'Password Policy', type: 'select', options: ['Strong (8+ chars)', 'Very Strong (10+ chars)', 'Complex (Uppercase + Number)'] },
      { key: 'otpVerification', label: 'OTP Verification', type: 'toggle' },
      { key: 'twoFactorAuthentication', label: 'Two Factor Authentication', type: 'toggle' },
      { key: 'sessionTimeout', label: 'Session Timeout', type: 'select', options: ['10 Minutes', '20 Minutes', '30 Minutes', '60 Minutes'] },
      { key: 'loginAttempts', label: 'Login Attempts', type: 'select', options: ['3 Attempts', '5 Attempts', '8 Attempts'] },
      { key: 'deviceVerification', label: 'Device Verification', type: 'toggle' },
    ],
  },
];

const summaryCards = [
  { id: 'general', label: 'General Preferences', description: 'Institution identity and core defaults', count: '8 Active', icon: Building2, accent: 'from-emerald-500/15 to-emerald-600/5' },
  { id: 'academic', label: 'Academic Preferences', description: 'Session, grading and course defaults', count: '7 Configs', icon: BookOpen, accent: 'from-sky-500/15 to-sky-600/5' },
  { id: 'communication', label: 'Communication Settings', description: 'Notifications and alerts controls', count: '6 Rules', icon: Bell, accent: 'from-violet-500/15 to-violet-600/5' },
  { id: 'system', label: 'System Defaults', description: 'Theme and landing experience', count: '6 Defaults', icon: FileCog, accent: 'from-amber-500/15 to-amber-600/5' },
  { id: 'security', label: 'Security Preferences', description: 'Authentication and access policies', count: '6 Controls', icon: ShieldCheck, accent: 'from-rose-500/15 to-rose-600/5' },
  { id: 'overview', label: 'Notification Rules', description: 'Unified maintenance and governance setup', count: 'All Synced', icon: Sparkles, accent: 'from-slate-500/15 to-slate-600/5' },
];

export default function InstitutePreferencePage() {
  const _navigate = useNavigate();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [toast, setToast] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});

  const filteredSections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sections;

    return sections
      .map((section) => ({
        ...section,
        fields: section.fields.filter((field) => {
          const haystack = `${section.title} ${field.label} ${String(preferences[field.key] ?? '')}`.toLowerCase();
          return haystack.includes(term);
        }),
      }))
      .filter((section) => section.fields.length > 0);
  }, [preferences, searchTerm]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const validatePreferences = () => {
    const nextErrors = {};
    const requiredTextFields = [
      'instituteTimeZone',
      'dateFormat',
      'timeFormat',
      'language',
      'currency',
      'country',
      'state',
      'city',
      'academicYearStart',
      'defaultSession',
      'semesterSystem',
      'creditSystem',
      'passingPercentage',
      'attendanceRequirement',
      'defaultCourseDuration',
    ];

    requiredTextFields.forEach((key) => {
      const value = preferences[key];
      if (!value || !String(value).trim()) {
        nextErrors[key] = 'This field is required.';
      }
    });

    return nextErrors;
  };

  const handleFieldChange = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setHasChanges(true);
    setStatusMessage('');
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    const nextErrors = validatePreferences();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatusMessage('Please complete the required fields before saving.');
      setToast('');
      return;
    }

    setErrors({});
    setHasChanges(false);
    setStatusMessage('Preferences saved successfully.');
    setToast('Preferences saved successfully.');
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    setSearchTerm('');
    setHasChanges(false);
    setStatusMessage('Defaults restored.');
    setErrors({});
    setToast('Defaults restored.');
  };

  const handleCancel = () => {
    setPreferences(defaultPreferences);
    setHasChanges(false);
    setStatusMessage('Changes discarded.');
    setErrors({});
    setToast('Changes discarded.');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mx-[10px] space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mt-3">
              <Breadcrumb
                items={[
                  { label: 'Settings', to: '/settings' },
                  { label: 'Institute Setup', to: '/settings/institute' },
                  { label: 'Institute Preference' },
                ]}
              />
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Institute Preferences</h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-[15px]">Configure institution-wide preferences, academic defaults, communication settings and operational defaults from one centralized workspace.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Premium configuration center
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.03 }}
              onClick={() => scrollToSection(card.id)}
              className={`group hover-gradient-border rounded-[22px] border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-[0_16px_35px_rgba(15,23,42,0.08)]`}
            >
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-emerald-600`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
              <div className="mt-2 text-xl font-semibold text-slate-900">{card.count}</div>
              <p className="mt-2 text-sm text-slate-500">{card.description}</p>
              <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                Open section <ChevronRight className="h-4 w-4" />
              </div>
            </motion.button>
          );
        })}
      </div>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Institute Preference Configuration</h2>
            <p className="mt-1 text-sm text-slate-600">Manage core setup values and policy defaults with polished controls and real-time validation.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover-gradient-border">
              <CheckCircle2 className="h-4 w-4" /> Save Preferences
            </button>
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              <SlidersHorizontal className="h-4 w-4" /> Reset Defaults
            </button>
            <button type="button" onClick={handleCancel} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
              Cancel
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 hover-gradient-border">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search Preference..."
              className="w-full border-none bg-transparent outline-none"
            />
          </label>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {hasChanges ? 'Unsaved changes pending' : 'All settings synced'}
          </div>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {statusMessage}
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <div id={section.id} key={section.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="rounded-2xl border border-emerald-200 bg-white p-2 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                    <p className="text-sm text-slate-500">{section.description}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.fields.map((field) => (
                    <label key={field.key} className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                        {field.type === 'toggle' ? (
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {preferences[field.key] ? 'On' : 'Off'}
                          </div>
                        ) : null}
                      </div>

                      {field.type === 'select' ? (
                        <>
                          <select
                            value={preferences[field.key] ?? ''}
                            onChange={(event) => handleFieldChange(field.key, event.target.value)}
                            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border"
                          >
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {errors[field.key] ? <p className="mt-2 text-xs font-medium text-rose-600">{errors[field.key]}</p> : null}
                        </>
                      ) : field.type === 'toggle' ? (
                        <button
                          type="button"
                          onClick={() => handleFieldChange(field.key, !preferences[field.key])}
                          className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover-gradient-border"
                        >
                          {preferences[field.key] ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                          {preferences[field.key] ? 'Enabled' : 'Disabled'}
                        </button>
                      ) : (
                        <>
                          <input
                            type={field.key.includes('Date') ? 'date' : field.key.includes('Time') ? 'time' : 'text'}
                            value={preferences[field.key] ?? ''}
                            onChange={(event) => handleFieldChange(field.key, event.target.value)}
                            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover-gradient-border"
                          />
                          {errors[field.key] ? <p className="mt-2 text-xs font-medium text-rose-600">{errors[field.key]}</p> : null}
                        </>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredSections.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No matching preferences found for your search. Try a broader term.
            </div>
          ) : null}
        </div>
      </section>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
