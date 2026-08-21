import { useMemo, useState } from 'react';
import {
  Check,
  ClipboardCopy,
  FileDown,
  Hash,
  History,
  Info,
  LockKeyhole,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const storageKey = 'erp:admission-application-number-policy';
const defaultSettings = {
  prefix: 'APP',
  separator: '/',
  includeYear: true,
  yearFormat: 'YY',
  digits: 5,
  nextNumber: 10001,
  resetCycle: 'Academic Session',
  session: '2026-27 Odd',
  status: 'Active',
  duplicateGuard: true,
  allowManualOverride: false,
};

const readSettings = () => {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(window.localStorage.getItem(storageKey) || '{}') };
  } catch {
    return defaultSettings;
  }
};

const formatYear = (format) => {
  const year = new Date().getFullYear();
  return format === 'YYYY' ? String(year) : String(year).slice(-2);
};

const buildApplicationNumber = (settings, sequence = settings.nextNumber) => {
  const prefix = String(settings.prefix || 'APP').trim().toUpperCase();
  const number = String(Math.max(1, Number(sequence) || 1)).padStart(Number(settings.digits) || 5, '0');
  const parts = [prefix];
  if (settings.includeYear) parts.push(formatYear(settings.yearFormat));
  parts.push(number);
  return parts.join(settings.separator || '');
};

const fieldClass = 'mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/70';

export default function AdmissionApplicationNumberSetupPage() {
  const [settings, setSettings] = useState(readSettings);
  const [draft, setDraft] = useState(readSettings);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem(`${storageKey}:history`) || '[]'); } catch { return []; }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [testSequence, setTestSequence] = useState(String(readSettings().nextNumber));

  const preview = useMemo(() => buildApplicationNumber(draft), [draft]);
  const testPreview = useMemo(() => buildApplicationNumber(draft, testSequence), [draft, testSequence]);
  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const saveSettings = (event) => {
    event.preventDefault();
    const prefix = String(draft.prefix || '').trim().replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase();
    const digits = Math.min(10, Math.max(3, Number(draft.digits) || 5));
    const nextNumber = Math.max(1, Number(draft.nextNumber) || 1);
    if (!prefix) {
      toast.error('Application prefix is required.');
      return;
    }
    setIsSaving(true);
    const next = { ...draft, prefix, digits, nextNumber };
    const eventItem = { id: Date.now(), action: 'Policy saved', preview: buildApplicationNumber(next), session: next.session, timestamp: new Date().toISOString() };
    const nextHistory = [eventItem, ...history].slice(0, 8);
    setSettings(next);
    setDraft(next);
    setHistory(nextHistory);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    window.localStorage.setItem(`${storageKey}:history`, JSON.stringify(nextHistory));
    setIsSaving(false);
    toast.success('Application number policy saved successfully.');
  };

  const resetSettings = () => {
    setDraft(defaultSettings);
    setSettings(defaultSettings);
    setTestSequence(String(defaultSettings.nextNumber));
    window.localStorage.removeItem(storageKey);
    toast.success('Application number policy reset.');
  };

  const generateTestNumber = () => {
    const sequence = Math.max(1, Number(testSequence) || settings.nextNumber);
    setTestSequence(String(sequence + 1));
    toast.success(`Preview generated: ${buildApplicationNumber(draft, sequence)}`);
  };

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      toast.success('Application number copied.');
    } catch {
      toast.error('Unable to copy application number.');
    }
  };

  const exportPolicy = () => {
    const csv = [['Setting', 'Value'], ...Object.entries(settings)].map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admission-application-number-policy.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Policy exported.');
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f4f8f7_0%,#ffffff_48%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-5 lg:p-6">
        <div className="mb-6 border-b border-slate-200/80 pb-5">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'Application Number Setup' }]} />
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-600"><Sparkles className="h-3.5 w-3.5" /> Admission Master</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Application Number Setup</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Design a consistent application identity for every admission enquiry and keep numbering predictable across sessions.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportPolicy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"><FileDown className="h-4 w-4" /> Export Policy</button>
              <button type="button" onClick={resetSettings} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Reset</button>
              <button type="submit" form="application-number-form" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-[#0f5132] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(15,81,50,0.2)] transition hover:bg-[#0d432b] disabled:opacity-60"><Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Policy'}</button>
            </div>
          </div>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Live format <Hash className="h-4 w-4" /></div><p className="mt-3 font-mono text-xl font-bold text-emerald-950">{preview}</p><p className="mt-1 text-[11px] text-emerald-700">Next number preview</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Next sequence <Plus className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-2xl font-bold text-slate-950">{Number(settings.nextNumber).toLocaleString()}</p><p className="mt-1 text-[11px] text-slate-500">Reserved for {settings.session}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Reset cycle <RefreshCw className="h-4 w-4 text-sky-600" /></div><p className="mt-3 text-lg font-bold text-slate-950">{settings.resetCycle}</p><p className="mt-1 text-[11px] text-slate-500">Counter lifecycle</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Policy status <ShieldCheck className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-lg font-bold text-emerald-700">{settings.status}</p><p className="mt-1 text-[11px] text-slate-500">Ready for admission flow</p></div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <form id="application-number-form" onSubmit={saveSettings} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><h2 className="text-lg font-semibold text-slate-900">Numbering policy</h2><p className="mt-1 text-xs text-slate-500">Configure how new applications receive their identity.</p></div><div className="rounded-xl bg-slate-50 p-2.5 text-slate-500"><LockKeyhole className="h-4 w-4" /></div></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">Prefix<input value={draft.prefix} onChange={(event) => updateDraft('prefix', event.target.value)} maxLength={8} className={fieldClass} placeholder="APP" /></label>
              <label className="text-xs font-semibold text-slate-600">Separator<select value={draft.separator} onChange={(event) => updateDraft('separator', event.target.value)} className={fieldClass}><option value="/">Slash (/)</option><option value="-">Hyphen (-)</option><option value="">No separator</option></select></label>
              <label className="text-xs font-semibold text-slate-600">Number of digits<input type="number" min="3" max="10" value={draft.digits} onChange={(event) => updateDraft('digits', event.target.value)} className={fieldClass} /></label>
              <label className="text-xs font-semibold text-slate-600">Next sequence<input type="number" min="1" value={draft.nextNumber} onChange={(event) => { updateDraft('nextNumber', event.target.value); setTestSequence(event.target.value); }} className={fieldClass} /></label>
              <label className="text-xs font-semibold text-slate-600">Academic session<select value={draft.session} onChange={(event) => updateDraft('session', event.target.value)} className={fieldClass}><option>2026-27 Odd</option><option>2026-27 Even</option><option>2025-26</option></select></label>
              <label className="text-xs font-semibold text-slate-600">Reset cycle<select value={draft.resetCycle} onChange={(event) => updateDraft('resetCycle', event.target.value)} className={fieldClass}><option>Academic Session</option><option>Calendar Year</option><option>Never</option></select></label>
              <label className="text-xs font-semibold text-slate-600">Year format<select value={draft.yearFormat} onChange={(event) => updateDraft('yearFormat', event.target.value)} className={fieldClass}><option value="YY">Short year (26)</option><option value="YYYY">Full year (2026)</option></select></label>
              <label className="text-xs font-semibold text-slate-600">Status<select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)} className={fieldClass}><option>Active</option><option>Inactive</option><option>Draft</option></select></label>
            </div>
            <div className="mt-5 space-y-3">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"><span><span className="block">Include year in number</span><span className="mt-1 block text-xs font-normal text-slate-500">Adds the selected year between prefix and sequence.</span></span><input type="checkbox" checked={draft.includeYear} onChange={(event) => updateDraft('includeYear', event.target.checked)} className="h-5 w-5 accent-emerald-700" /></label>
              <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"><span><span className="block">Duplicate application guard</span><span className="mt-1 block text-xs font-normal text-slate-500">Prevent duplicate numbers during concurrent admissions.</span></span><input type="checkbox" checked={draft.duplicateGuard} onChange={(event) => updateDraft('duplicateGuard', event.target.checked)} className="h-5 w-5 accent-emerald-700" /></label>
              <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"><span><span className="block">Allow manual override</span><span className="mt-1 block text-xs font-normal text-slate-500">Keep disabled unless an authorized admin needs a correction.</span></span><input type="checkbox" checked={draft.allowManualOverride} onChange={(event) => updateDraft('allowManualOverride', event.target.checked)} className="h-5 w-5 accent-emerald-700" /></label>
            </div>
          </form>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-[linear-gradient(145deg,#102c24_0%,#174d39_100%)] p-5 text-white shadow-[0_18px_40px_rgba(15,81,50,0.2)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">Format studio</p><h2 className="mt-2 text-xl font-semibold">Test a number</h2></div><WandSparkles className="h-5 w-5 text-emerald-200" /></div><p className="mt-2 text-xs leading-5 text-emerald-100/80">Preview any sequence before publishing this policy.</p><label className="mt-5 block text-xs font-semibold text-emerald-100">Test sequence<input type="number" min="1" value={testSequence} onChange={(event) => setTestSequence(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-white/20 bg-white/10 px-3 font-mono text-sm text-white outline-none focus:border-emerald-200" /></label><div className="mt-4 rounded-xl border border-white/15 bg-black/10 p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">Generated preview</p><p className="mt-2 break-all font-mono text-2xl font-bold tracking-wide">{testPreview}</p></div><div className="mt-4 flex gap-2"><button type="button" onClick={generateTestNumber} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-50"><Check className="h-4 w-4" /> Generate next</button><button type="button" onClick={copyPreview} title="Copy preview" className="inline-flex items-center justify-center rounded-xl border border-white/25 px-3 py-2.5 text-white transition hover:bg-white/10"><ClipboardCopy className="h-4 w-4" /></button></div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><History className="h-4 w-4 text-emerald-600" /><h2 className="text-sm font-semibold text-slate-900">Recent policy activity</h2></div>{history.length ? <div className="mt-4 space-y-3">{history.slice(0, 4).map((item) => <div key={item.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div className="mt-0.5 rounded-full bg-emerald-50 p-1.5 text-emerald-600"><Check className="h-3 w-3" /></div><div className="min-w-0"><p className="text-xs font-semibold text-slate-700">{item.action}</p><p className="mt-1 font-mono text-[11px] text-emerald-700">{item.preview}</p><p className="mt-1 text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleString()}</p></div></div>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">No policy changes recorded yet.</div>}</section>
            <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs leading-5 text-sky-800"><Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /><span>Application numbers are generated only after the policy is saved. The current counter is session-scoped and can be audited from the activity panel.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
