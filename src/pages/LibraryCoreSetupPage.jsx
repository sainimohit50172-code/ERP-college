import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock3, Download, FileText, Library, RotateCcw, Save, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import api from '../api/axios.js';

const storageKey = 'library-core-setup';
const defaults = {
  libraryName: 'Central Library',
  libraryCode: 'HU-LIB-01',
  academicSession: '2026-27 Odd',
  openingTime: '08:00',
  closingTime: '20:00',
  loanDays: 14,
  maxBooks: 5,
  renewalLimit: 2,
  finePerDay: 5,
  gracePeriod: 2,
  receiptPrefix: 'LIB',
  startingReceipt: 1001,
  autoIssue: true,
  allowRenewal: true,
  allowReservation: true,
  notifyDueDate: true,
};

function readLocalSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return stored && typeof stored === 'object' ? { ...defaults, ...stored } : null;
  } catch {
    return null;
  }
}

function downloadSettings(values) {
  const link = document.createElement('a');
  link.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(values, null, 2))}`;
  link.download = 'library-setup.json';
  link.click();
}

export default function LibraryCoreSetupPage() {
  const [values, setValues] = useState(defaults);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('Not saved yet');

  useEffect(() => {
    let active = true;
    api.get('/library/settings').then((response) => {
      if (!active) return;
      const serverValues = response?.data?.data || response?.data;
      if (serverValues && typeof serverValues === 'object' && !Array.isArray(serverValues)) setValues({ ...defaults, ...serverValues });
    }).catch(() => {
      const localValues = readLocalSettings();
      if (active && localValues) setValues(localValues);
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const updateField = (field, value) => setValues((current) => ({ ...current, [field]: value }));
  const receiptPreview = `${values.receiptPrefix || 'LIB'}-${String(values.startingReceipt || 0).padStart(6, '0')}`;
  const setupScore = useMemo(() => {
    const fields = ['libraryName', 'libraryCode', 'academicSession', 'openingTime', 'closingTime', 'loanDays', 'maxBooks', 'finePerDay'];
    return Math.round((fields.filter((field) => String(values[field] ?? '').trim() !== '').length / fields.length) * 100);
  }, [values]);

  const saveSettings = async () => {
    if (!values.libraryName.trim() || !values.libraryCode.trim()) { toast.error('Library name and code are required.'); return; }
    if (values.openingTime >= values.closingTime) { toast.error('Closing time must be after opening time.'); return; }
    setIsSaving(true);
    const payload = { ...values, loanDays: Number(values.loanDays), maxBooks: Number(values.maxBooks), renewalLimit: Number(values.renewalLimit), finePerDay: Number(values.finePerDay), gracePeriod: Number(values.gracePeriod), startingReceipt: Number(values.startingReceipt) };
    try {
      await api.put('/library/settings', payload);
      toast.success('Library setup saved successfully.');
    } catch {
      toast.success('Library setup saved locally. Connect the API to sync online.');
    } finally {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setValues(payload);
      setLastSaved(new Date().toLocaleString());
      setIsSaving(false);
    }
  };

  const resetSettings = () => { setValues(defaults); localStorage.removeItem(storageKey); setLastSaved('Not saved yet'); toast.info('Library setup reset to defaults.'); };
  const settingCards = [
    { label: 'Setup completion', value: `${setupScore}%`, icon: Sparkles, tone: 'sky' },
    { label: 'Loan period', value: `${values.loanDays} days`, icon: Clock3, tone: 'emerald' },
    { label: 'Books per member', value: values.maxBooks, icon: UsersRound, tone: 'amber' },
    { label: 'Next receipt', value: receiptPreview, icon: FileText, tone: 'slate' },
  ];
  const toggleFields = [
    ['autoIssue', 'Quick issue', 'Allow librarians to issue books with a streamlined workflow.'],
    ['allowRenewal', 'Book renewal', 'Allow members to renew eligible issued books.'],
    ['allowReservation', 'Book reservation', 'Let members reserve unavailable books.'],
    ['notifyDueDate', 'Due-date alerts', 'Notify members before a book reaches its due date.'],
  ];

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_50%,#eff6ff_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Settings', to: '/settings' }, { label: 'Library Setup', to: '/settings/library' }, { label: 'Library Setup' }]} />
        <div className="mt-5 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">Library setup</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Library workspace settings</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Shape the identity, circulation policy, member access, and receipt flow of your institution library.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => downloadSettings(values)} disabled={isLoading}><Download className="h-4 w-4" /> Export</Button><Button variant="secondary" onClick={resetSettings} disabled={isLoading}><RotateCcw className="h-4 w-4" /> Reset</Button><Button variant="primary" onClick={saveSettings} isLoading={isSaving} disabled={isLoading}><Save className="h-4 w-4" /> Save settings</Button></div></div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{settingCards.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span><span className={`rounded-xl p-2 ${tone === 'sky' ? 'bg-sky-50 text-sky-600' : tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-slate-200 text-slate-600'}`}><Icon className="h-4 w-4" /></span></div><p className="mt-3 truncate text-xl font-semibold text-slate-900">{value}</p></div>)}</div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-sky-50 p-2.5 text-sky-700"><Library className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Identity</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Library profile</h2></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">Library name<input value={values.libraryName} onChange={(event) => updateField('libraryName', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Library code<input value={values.libraryCode} onChange={(event) => updateField('libraryCode', event.target.value.toUpperCase())} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Academic session<select value={values.academicSession} onChange={(event) => updateField('academicSession', event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"><option>2026-27 Odd</option><option>2026-27 Even</option><option>2025-26</option></select></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Opening time<input type="time" value={values.openingTime} onChange={(event) => updateField('openingTime', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Closing time<input type="time" value={values.closingTime} onChange={(event) => updateField('closingTime', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label></div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><BookOpen className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Circulation policy</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Loans, renewals and fines</h2></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[['loanDays', 'Loan period (days)'], ['maxBooks', 'Maximum books'], ['renewalLimit', 'Renewal limit'], ['finePerDay', 'Fine per day'], ['gracePeriod', 'Grace period (days)']].map(([field, label]) => <label key={field} className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<input type="number" min="0" value={values[field]} onChange={(event) => updateField(field, event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>)}</div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Member experience</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Access and notifications</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{toggleFields.map(([field, title, description]) => <label key={field} className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4"><span><span className="block text-sm font-semibold text-slate-900">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></span><input type="checkbox" checked={values[field]} onChange={(event) => updateField(field, event.target.checked)} className="mt-1 h-4 w-4 accent-emerald-600" /></label>)}</div></section>
          </div>
          <aside className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-[#101824] p-5 text-white shadow-sm"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-sky-300" /><h2 className="text-lg font-semibold">Live setup preview</h2></div><div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Library identity</p><p className="mt-2 text-xl font-semibold">{values.libraryName || 'Your library'}</p><p className="mt-1 text-sm text-slate-300">{values.libraryCode || 'LIB-CODE'} · {values.academicSession}</p><div className="mt-5 grid gap-3 text-sm"><div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-slate-400">Hours</span><span>{values.openingTime} - {values.closingTime}</span></div><div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-slate-400">Loan period</span><span>{values.loanDays} days</span></div><div className="flex items-center justify-between"><span className="text-slate-400">Next receipt</span><span className="font-mono text-sky-200">{receiptPreview}</span></div></div></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Configuration status</p><p className="mt-1 text-lg font-semibold text-slate-900">{lastSaved}</p></div><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{isLoading ? 'Loading' : 'Ready'}</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${setupScore}%` }} /></div><p className="mt-3 text-sm leading-6 text-slate-500">Complete the profile and policy fields, then save to make these rules available throughout the library module.</p></section><section className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5"><div className="flex items-center gap-3 text-sky-800"><FileText className="h-5 w-5" /><h2 className="font-semibold">Receipt sequence</h2></div><p className="mt-2 text-sm leading-6 text-sky-700">Receipts will begin at <strong>{receiptPreview}</strong> and continue automatically from the configured counter.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700">Prefix<input value={values.receiptPrefix} onChange={(event) => updateField('receiptPrefix', event.target.value.toUpperCase())} className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800 outline-none" /></label><label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700">Starting number<input type="number" min="0" value={values.startingReceipt} onChange={(event) => updateField('startingReceipt', event.target.value)} className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-normal tracking-normal text-slate-800 outline-none" /></label></div></section></aside>
        </div>
      </div>
    </div>
  );
}
