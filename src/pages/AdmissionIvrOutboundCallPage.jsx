import { useMemo, useState } from 'react';
import {
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Headphones,
  Info,
  KeyRound,
  ListChecks,
  PhoneCall,
  Play,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const storageKey = 'erp:admission-ivr-outbound-call';
const activityKey = `${storageKey}:activity`;

const defaultConfig = {
  campaignName: 'Admission Follow-up Campaign',
  provider: 'Exotel',
  accountId: 'ERP-ADMISSION',
  apiKey: '',
  callerId: '+91 1800 123 4567',
  voiceLanguage: 'Hindi + English',
  greeting: 'Namaste, this is a call from the Admissions Desk.',
  audience: 'New Enquiries',
  stage: 'New Enquiry',
  session: '2026-27 Odd',
  scheduleStart: '09:00',
  scheduleEnd: '18:00',
  timezone: 'Asia/Kolkata (IST)',
  maxAttempts: 3,
  retryAfter: '4 hours',
  ringDuration: 30,
  callRecording: true,
  consentRequired: true,
  voicemailDetection: true,
  skipAnswered: true,
  notifyOperator: true,
  notifyEmail: true,
  status: 'Ready',
};

const audiences = ['New Enquiries', 'Application Started', 'Application Submitted', 'Overdue Follow-ups', 'All Admission Leads'];
const stages = ['New Enquiry', 'Counselling', 'Application Started', 'Application Submitted'];
const languages = ['Hindi + English', 'English', 'Hindi'];
const providers = ['Exotel', 'Knowlarity', 'Twilio', 'Custom SIP'];
const fieldClass = 'mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/70';

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || 'null');
    return value || fallback;
  } catch {
    return fallback;
  }
};

const formatDate = (value) => new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdmissionIvrOutboundCallPage() {
  const [config, setConfig] = useState(() => ({ ...defaultConfig, ...readStorage(storageKey, {}) }));
  const [activity, setActivity] = useState(() => readStorage(activityKey, []));
  const [activeTab, setActiveTab] = useState('campaign');
  const [isSaving, setIsSaving] = useState(false);

  const enabledGuards = useMemo(() => [config.consentRequired, config.voicemailDetection, config.skipAnswered].filter(Boolean).length, [config]);
  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  const saveConfig = (event) => {
    event.preventDefault();
    if (!config.campaignName.trim() || !config.accountId.trim() || !config.callerId.trim()) {
      toast.error('Campaign name, account ID and caller ID are required.');
      setActiveTab('campaign');
      return;
    }
    setIsSaving(true);
    const entry = { id: Date.now(), action: 'IVR configuration saved', detail: `${config.campaignName} · ${config.status}`, timestamp: new Date().toISOString() };
    const nextActivity = [entry, ...activity].slice(0, 6);
    window.localStorage.setItem(storageKey, JSON.stringify(config));
    window.localStorage.setItem(activityKey, JSON.stringify(nextActivity));
    setActivity(nextActivity);
    setIsSaving(false);
    toast.success('IVR outbound call configuration saved.');
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    window.localStorage.removeItem(storageKey);
    toast.success('IVR configuration reset.');
  };

  const exportConfig = () => {
    const safeConfig = { ...config, apiKey: config.apiKey ? 'Configured' : 'Not configured' };
    const csv = [['Setting', 'Value'], ...Object.entries(safeConfig)].map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admission-ivr-outbound-call-config.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('IVR configuration exported.');
  };

  const testCall = () => {
    if (!config.callerId.trim()) {
      toast.error('Add a caller ID before testing the call.');
      setActiveTab('provider');
      return;
    }
    toast.success(`Test call queued from ${config.callerId}.`);
  };

  const tabs = [
    { id: 'campaign', label: 'Campaign', icon: ListChecks },
    { id: 'provider', label: 'Provider & voice', icon: Headphones },
    { id: 'rules', label: 'Call rules', icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f3f8f5_0%,#ffffff_48%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-5 lg:p-6">
        <div className="mb-6 border-b border-slate-200/80 pb-5">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'IVR Outbound Call Config' }]} />
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-600"><PhoneCall className="h-3.5 w-3.5" /> Admission communication</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">IVR Outbound Call Config</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create a thoughtful calling workflow for admission follow-ups, with clear guardrails for every conversation.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportConfig} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"><Download className="h-4 w-4" /> Export</button>
              <button type="button" onClick={resetConfig} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Reset</button>
              <button type="submit" form="ivr-config-form" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-[#0f5132] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(15,81,50,0.2)] transition hover:bg-[#0d432b] disabled:opacity-60"><Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save configuration'}</button>
            </div>
          </div>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Campaign status <CheckCircle2 className="h-4 w-4" /></div><p className="mt-3 text-xl font-bold text-emerald-950">{config.status}</p><p className="mt-1 text-[11px] text-emerald-700">Ready for controlled calling</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Audience <ListChecks className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 truncate text-lg font-bold text-slate-950">{config.audience}</p><p className="mt-1 text-[11px] text-slate-500">Lead segment selected</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Attempts <PhoneCall className="h-4 w-4 text-sky-600" /></div><p className="mt-3 text-2xl font-bold text-slate-950">{config.maxAttempts}</p><p className="mt-1 text-[11px] text-slate-500">Maximum per lead</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Consent guards <ShieldCheck className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-2xl font-bold text-emerald-700">{enabledGuards}<span className="text-sm font-medium text-slate-400"> / 3</span></p><p className="mt-1 text-[11px] text-slate-500">Protection checks enabled</p></div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
          <form id="ivr-config-form" onSubmit={saveConfig} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex gap-1 overflow-x-auto border-b border-slate-100 pb-1">
              {tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-3 py-3 text-xs font-semibold transition ${activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}
            </div>

            {activeTab === 'campaign' && <div className="mt-5"><div><h2 className="text-lg font-semibold text-slate-900">Campaign setup</h2><p className="mt-1 text-xs text-slate-500">Choose who should be called and how the admission desk should recognize the campaign.</p></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold text-slate-600 md:col-span-2">Campaign name<input value={config.campaignName} onChange={(event) => update('campaignName', event.target.value)} className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">Lead audience<select value={config.audience} onChange={(event) => update('audience', event.target.value)} className={fieldClass}>{audiences.map((audience) => <option key={audience}>{audience}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Admission stage<select value={config.stage} onChange={(event) => update('stage', event.target.value)} className={fieldClass}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Academic session<select value={config.session} onChange={(event) => update('session', event.target.value)} className={fieldClass}><option>2026-27 Odd</option><option>2026-27 Even</option><option>2025-26</option></select></label><label className="text-xs font-semibold text-slate-600">Campaign status<select value={config.status} onChange={(event) => update('status', event.target.value)} className={fieldClass}><option>Ready</option><option>Paused</option><option>Draft</option></select></label></div><div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/70 p-4"><div className="flex items-start gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" /><p className="text-xs leading-5 text-sky-800">Only leads matching <strong>{config.audience}</strong> at the <strong>{config.stage}</strong> stage will be eligible for this campaign.</p></div></div></div>}

            {activeTab === 'provider' && <div className="mt-5"><div><h2 className="text-lg font-semibold text-slate-900">Provider and voice</h2><p className="mt-1 text-xs text-slate-500">Connect the approved calling provider and define the voice experience for applicants.</p></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Calling provider<select value={config.provider} onChange={(event) => update('provider', event.target.value)} className={fieldClass}>{providers.map((provider) => <option key={provider}>{provider}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Account ID<input value={config.accountId} onChange={(event) => update('accountId', event.target.value.toUpperCase())} className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">API key<input type="password" value={config.apiKey} onChange={(event) => update('apiKey', event.target.value)} placeholder="Enter provider key" className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">Caller ID<input value={config.callerId} onChange={(event) => update('callerId', event.target.value)} className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">Voice language<select value={config.voiceLanguage} onChange={(event) => update('voiceLanguage', event.target.value)} className={fieldClass}>{languages.map((language) => <option key={language}>{language}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Ring duration<select value={config.ringDuration} onChange={(event) => update('ringDuration', Number(event.target.value))} className={fieldClass}><option value="20">20 seconds</option><option value="30">30 seconds</option><option value="45">45 seconds</option></select></label><label className="text-xs font-semibold text-slate-600 md:col-span-2">Opening greeting<textarea value={config.greeting} onChange={(event) => update('greeting', event.target.value)} rows="3" className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/70" /></label></div><div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800"><KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>API keys are masked in exports. Connect a provider only after credentials and calling consent have been approved by your institute.</span></div></div>}

            {activeTab === 'rules' && <div className="mt-5"><div><h2 className="text-lg font-semibold text-slate-900">Call rules and schedule</h2><p className="mt-1 text-xs text-slate-500">Respect applicant preferences and keep calls inside your institute&apos;s working window.</p></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Calling starts<input type="time" value={config.scheduleStart} onChange={(event) => update('scheduleStart', event.target.value)} className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">Calling ends<input type="time" value={config.scheduleEnd} onChange={(event) => update('scheduleEnd', event.target.value)} className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">Timezone<select value={config.timezone} onChange={(event) => update('timezone', event.target.value)} className={fieldClass}><option>Asia/Kolkata (IST)</option><option>UTC</option><option>Asia/Dubai (GST)</option></select></label><label className="text-xs font-semibold text-slate-600">Retry after<select value={config.retryAfter} onChange={(event) => update('retryAfter', event.target.value)} className={fieldClass}><option>2 hours</option><option>4 hours</option><option>24 hours</option><option>Next working day</option></select></label><label className="text-xs font-semibold text-slate-600">Maximum attempts<input type="number" min="1" max="10" value={config.maxAttempts} onChange={(event) => update('maxAttempts', Number(event.target.value))} className={fieldClass} /></label></div><div className="mt-5 grid gap-3"><Toggle label="Consent required" description="Skip contacts without recorded calling consent." checked={config.consentRequired} onChange={(value) => update('consentRequired', value)} icon={ShieldCheck} /><Toggle label="Voicemail detection" description="End or route calls when voicemail is detected." checked={config.voicemailDetection} onChange={(value) => update('voicemailDetection', value)} icon={Volume2} /><Toggle label="Skip answered leads" description="Do not call a lead again after a successful connection." checked={config.skipAnswered} onChange={(value) => update('skipAnswered', value)} icon={CheckCircle2} /><Toggle label="Call recording" description="Record calls where policy and consent allow it." checked={config.callRecording} onChange={(value) => update('callRecording', value)} icon={Headphones} /><Toggle label="Notify operator" description="Show a follow-up task after each call attempt." checked={config.notifyOperator} onChange={(value) => update('notifyOperator', value)} icon={Bell} /><Toggle label="Email campaign summary" description="Send a daily delivery and outcome summary." checked={config.notifyEmail} onChange={(value) => update('notifyEmail', value)} icon={FileText} /></div></div>}
          </form>

          <aside className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-[linear-gradient(145deg,#102c24_0%,#174d39_100%)] p-5 text-white shadow-[0_18px_40px_rgba(15,81,50,0.2)] sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">Campaign preview</p><h2 className="mt-2 text-xl font-semibold">{config.campaignName || 'Unnamed campaign'}</h2></div><div className="rounded-xl bg-white/10 p-2.5"><PhoneCall className="h-5 w-5 text-emerald-100" /></div></div><p className="mt-1 text-xs text-emerald-100/75">{config.provider} · {config.voiceLanguage}</p><div className="mt-5 space-y-2"><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5 text-xs"><CalendarClock className="h-4 w-4 text-emerald-200" /><span>{config.scheduleStart} - {config.scheduleEnd} {config.timezone}</span></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5 text-xs"><ListChecks className="h-4 w-4 text-emerald-200" /><span>{config.maxAttempts} attempts · retry in {config.retryAfter}</span></div></div><button type="button" onClick={testCall} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-50"><Play className="h-4 w-4" /> Send test call</button></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><h2 className="text-sm font-semibold text-slate-900">Safety checklist</h2></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{enabledGuards} / 3</span></div><div className="mt-4 space-y-2"><SummaryRow label="Consent check" enabled={config.consentRequired} /><SummaryRow label="Voicemail handling" enabled={config.voicemailDetection} /><SummaryRow label="Duplicate call guard" enabled={config.skipAnswered} /><SummaryRow label="Call recording" enabled={config.callRecording} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-600" /><h2 className="text-sm font-semibold text-slate-900">Recent activity</h2></div>{activity.length ? <div className="mt-4 space-y-3">{activity.slice(0, 3).map((item) => <div key={item.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div className="mt-0.5 rounded-full bg-emerald-50 p-1.5 text-emerald-600"><Check className="h-3 w-3" /></div><div><p className="text-xs font-semibold text-slate-700">{item.action}</p><p className="mt-1 text-[11px] text-slate-500">{item.detail}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(item.timestamp)}</p></div></div>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">No changes recorded yet.</div>}</section></aside>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange, icon: Icon }) {
  return <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"><span className="flex min-w-0 gap-3"><span className="mt-0.5 rounded-lg bg-white p-2 text-emerald-600 shadow-sm"><Icon className="h-4 w-4" /></span><span><span className="block text-sm font-semibold text-slate-700">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-emerald-700" /></label>;
}

function SummaryRow({ label, enabled }) {
  return <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-xs"><span className="text-slate-600">{label}</span><span className={`font-semibold ${enabled ? 'text-emerald-700' : 'text-slate-400'}`}>{enabled ? 'Enabled' : 'Off'}</span></div>;
}
