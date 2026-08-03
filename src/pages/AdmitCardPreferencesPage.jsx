import { useEffect, useState } from 'react';
import { BookOpenCheck, CheckCircle2, Library, MessageSquare, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ERPFixedSwitch from '../components/ui/ERPFixedSwitch.jsx';

const defaults = { feeCheck: false, attendanceCheck: false, libraryCheck: false, feedbackCheck: false };
const cards = [
  { key: 'feeCheck', title: 'Fee Check', description: 'Verify fee clearance before allowing Admit Card generation.', icon: CheckCircle2 },
  { key: 'attendanceCheck', title: 'Attendance Check', description: 'Verify minimum attendance percentage before Admit Card generation.', icon: BookOpenCheck },
  { key: 'libraryCheck', title: 'Library Check', description: 'Verify pending library books and fines before Admit Card generation.', icon: Library },
  { key: 'feedbackCheck', title: 'Feedback Check', description: 'Verify student feedback submission before Admit Card generation.', icon: MessageSquare },
];

const toBoolean = (value) => value === true || value === 1 || value === 'true' || value === 'True';
const normalizePreferences = (values = {}) => ({
  feeCheck: toBoolean(values?.feeCheck ?? values?.fee_check),
  attendanceCheck: toBoolean(values?.attendanceCheck ?? values?.attendance_check),
  libraryCheck: toBoolean(values?.libraryCheck ?? values?.library_check),
  feedbackCheck: toBoolean(values?.feedbackCheck ?? values?.feedback_check),
});
const buildExpandedState = (values) => ({
  feeCheck: Boolean(values?.feeCheck),
  attendanceCheck: Boolean(values?.attendanceCheck),
  libraryCheck: Boolean(values?.libraryCheck),
  feedbackCheck: Boolean(values?.feedbackCheck),
});

export default function AdmitCardPreferencesPage() {
  const [preferences, setPreferences] = useState(() => normalizePreferences(defaults));
  const [expandedCards, setExpandedCards] = useState(() => buildExpandedState(defaults));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/coe/admit-card-preferences').then((response) => {
      const nextPreferences = normalizePreferences(response.data?.data || defaults);
      if (active) {
        setPreferences(nextPreferences);
        setExpandedCards(buildExpandedState(nextPreferences));
      }
    }).catch((error) => {
      if (active) toast.error(error?.response?.data?.detail || 'Unable to load Admit Card Preferences.');
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const togglePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setExpandedCards((current) => ({ ...current, [key]: value }));
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/coe/admit-card-preferences', preferences);
      const nextPreferences = normalizePreferences(response.data?.data || preferences);
      setPreferences(nextPreferences);
      setExpandedCards(buildExpandedState(nextPreferences));
      toast.success('Admit Card Preferences Saved Successfully');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to save Admit Card Preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5"><div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
    <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Admit Card Preferences' }]} />
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Admit Card Preferences</h1></div><Button onClick={savePreferences} isLoading={isSaving} disabled={isLoading}><Save className="mr-2 inline h-4 w-4" />Save</Button></div>
    <section className="mt-6 grid gap-4 md:grid-cols-2">
      {cards.map(({ key, title, description, icon: Icon }) => (
        <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md sm:p-6">
          <div className="flex items-center justify-between gap-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600"><Icon className="h-6 w-6" /></div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
              </div>
            </div>
            <ERPFixedSwitch checked={Boolean(preferences[key])} onChange={(value) => togglePreference(key, value)} label={title} />
          </div>
          {expandedCards[key] ? (
            <div className="mt-4 opacity-100 overflow-visible transition-opacity duration-200">
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {key === 'feeCheck' ? (
                    <>
                      <label className="text-sm text-slate-600">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Allowed Due Percentage (%)</span>
                        <input type="number" min="0" max="100" defaultValue="0" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                      </label>
                      <label className="text-sm text-slate-600">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Session Dropdown</span>
                        <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500">
                          <option>Current Session</option>
                          <option>Previous Session</option>
                        </select>
                      </label>
                      <label className="text-sm text-slate-600">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Installments Dropdown</span>
                        <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500">
                          <option>Installment 1</option>
                          <option>Installment 2</option>
                        </select>
                      </label>
                    </>
                  ) : null}
                  {key === 'attendanceCheck' ? (
                    <label className="text-sm text-slate-600">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Minimum Attendance Percentage (%)</span>
                      <input type="number" min="0" max="100" defaultValue="75" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                    </label>
                  ) : null}
                  {key === 'libraryCheck' ? (
                    <label className="text-sm text-slate-600">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Allowed Issued Books Count</span>
                      <input type="number" min="0" defaultValue="3" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                    </label>
                  ) : null}
                  {key === 'feedbackCheck' ? (
                    <>
                      <label className="text-sm text-slate-600">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Type Dropdown</span>
                        <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500">
                          <option>Student</option>
                          <option>Faculty</option>
                        </select>
                      </label>
                      <label className="text-sm text-slate-600">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category Dropdown</span>
                        <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500">
                          <option>Academic</option>
                          <option>General</option>
                        </select>
                      </label>
                      <label className="text-sm text-slate-600">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Allowed Student Feedback Count</span>
                        <input type="number" min="0" defaultValue="1" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                      </label>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </section>
  </div></div>;
}
