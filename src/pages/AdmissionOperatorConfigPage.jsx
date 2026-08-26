import { useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  UserRound,
  UsersRound,
  Workflow,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const storageKey = 'erp:admission-operator-config';
const activityKey = `${storageKey}:activity`;

const defaultConfig = {
  operatorName: 'Admissions Desk',
  operatorCode: 'ADM-001',
  email: 'admissions@institute.edu',
  mobile: '+91 98765 43210',
  role: 'Admission Counsellor',
  status: 'Active',
  defaultStage: 'New Enquiry',
  defaultSource: 'Website',
  defaultSession: '2026-27 Odd',
  assignmentMode: 'Self assigned',
  dailyTarget: 25,
  followUpWindow: '24 hours',
  canCreateApplication: true,
  canCollectFee: true,
  canEditApplication: true,
  canDeleteApplication: false,
  canViewReports: true,
  receiveEmail: true,
  receiveSms: false,
  receiveBrowser: true,
  twoFactor: true,
  sessionLock: true,
  loginAlerts: true,
};

const stages = ['New Enquiry', 'Counselling', 'Application Started', 'Application Submitted'];
const sources = ['Website', 'Walk-in', 'Phone Call', 'Campaign', 'Referral'];
const sessions = ['2026-27 Odd', '2026-27 Even', '2025-26'];
const roles = ['Admission Counsellor', 'Admission Manager', 'Admission Operator', 'Front Desk Executive'];
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

export default function AdmissionOperatorConfigPage() {
  const [config, setConfig] = useState(() => ({ ...defaultConfig, ...readStorage(storageKey, {}) }));
  const [activity, setActivity] = useState(() => readStorage(activityKey, []));
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const enabledAccess = useMemo(() => [config.canCreateApplication, config.canCollectFee, config.canEditApplication, config.canViewReports].filter(Boolean).length, [config]);
  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  const saveConfig = (event) => {
    event.preventDefault();
    if (!config.operatorName.trim() || !config.operatorCode.trim() || !config.email.trim()) {
      toast.error('Operator name, code and email are required.');
      setActiveTab('profile');
      return;
    }
    setIsSaving(true);
    const entry = { id: Date.now(), action: 'Configuration saved', detail: `${config.operatorName} · ${config.status}`, timestamp: new Date().toISOString() };
    const nextActivity = [entry, ...activity].slice(0, 6);
    window.localStorage.setItem(storageKey, JSON.stringify(config));
    window.localStorage.setItem(activityKey, JSON.stringify(nextActivity));
    setActivity(nextActivity);
    setIsSaving(false);
    toast.success('Operator configuration saved successfully.');
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    window.localStorage.removeItem(storageKey);
    toast.success('Operator configuration reset.');
  };

  const exportConfig = () => {
    const csv = [['Setting', 'Value'], ...Object.entries(config)].map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-operator-config.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Operator configuration exported.');
  };

  const sendTestAlert = () => toast.success('Test notification sent to the configured channels.');

  const tabs = [
    { id: 'profile', label: 'Operator profile', icon: UserRound },
    { id: 'workflow', label: 'Admission workflow', icon: Workflow },
    { id: 'access', label: 'Access & alerts', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f3f8f5_0%,#ffffff_48%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-5 lg:p-6">
        <div className="mb-6 border-b border-slate-200/80 pb-5">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'My Operator Config' }]} />
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-600"><Settings2 className="h-3.5 w-3.5" /> Personal workspace</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">My Operator Config</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Shape your admission desk experience, daily workflow and permissions from one place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportConfig} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"><Download className="h-4 w-4" /> Export</button>
              <button type="button" onClick={resetConfig} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Reset</button>
              <button type="submit" form="operator-config-form" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-[#0f5132] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(15,81,50,0.2)] transition hover:bg-[#0d432b] disabled:opacity-60"><Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Operator status <CheckCircle2 className="h-4 w-4" /></div><p className="mt-3 text-xl font-bold text-emerald-950">{config.status}</p><p className="mt-1 text-[11px] text-emerald-700">Ready for admission desk</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Access modules <LayoutDashboard className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-2xl font-bold text-slate-950">{enabledAccess}<span className="text-sm font-medium text-slate-400"> / 5</span></p><p className="mt-1 text-[11px] text-slate-500">Permissions enabled</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Daily target <ClipboardCheck className="h-4 w-4 text-sky-600" /></div><p className="mt-3 text-2xl font-bold text-slate-950">{config.dailyTarget}</p><p className="mt-1 text-[11px] text-slate-500">Follow-ups per working day</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Security <LockKeyhole className="h-4 w-4 text-emerald-600" /></div><p className="mt-3 text-xl font-bold text-emerald-700">{config.twoFactor ? 'Protected' : 'Basic'}</p><p className="mt-1 text-[11px] text-slate-500">Two-step verification</p></div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
          <form id="operator-config-form" onSubmit={saveConfig} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex gap-1 overflow-x-auto border-b border-slate-100 pb-1">
              {tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-3 py-3 text-xs font-semibold transition ${activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}
            </div>

            {activeTab === 'profile' && <div className="mt-5"><div><h2 className="text-lg font-semibold text-slate-900">Operator identity</h2><p className="mt-1 text-xs text-slate-500">These details appear in admission activity and follow-up ownership.</p></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Operator name<input value={config.operatorName} onChange={(event) => update('operatorName', event.target.value)} className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">Operator code<input value={config.operatorCode} onChange={(event) => update('operatorCode', event.target.value.toUpperCase())} className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">Work email<div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input type="email" value={config.email} onChange={(event) => update('email', event.target.value)} className={`${fieldClass} pl-9`} /></div></label><label className="text-xs font-semibold text-slate-600">Mobile number<div className="relative"><Smartphone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={config.mobile} onChange={(event) => update('mobile', event.target.value)} className={`${fieldClass} pl-9`} /></div></label><label className="text-xs font-semibold text-slate-600">Role<select value={config.role} onChange={(event) => update('role', event.target.value)} className={fieldClass}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Account status<select value={config.status} onChange={(event) => update('status', event.target.value)} className={fieldClass}><option>Active</option><option>Inactive</option><option>On leave</option></select></label></div></div>}

            {activeTab === 'workflow' && <div className="mt-5"><div><h2 className="text-lg font-semibold text-slate-900">Workflow defaults</h2><p className="mt-1 text-xs text-slate-500">New enquiries open with these defaults for faster, consistent handling.</p></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Default admission stage<select value={config.defaultStage} onChange={(event) => update('defaultStage', event.target.value)} className={fieldClass}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Default lead source<select value={config.defaultSource} onChange={(event) => update('defaultSource', event.target.value)} className={fieldClass}>{sources.map((source) => <option key={source}>{source}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Academic session<select value={config.defaultSession} onChange={(event) => update('defaultSession', event.target.value)} className={fieldClass}>{sessions.map((session) => <option key={session}>{session}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Lead assignment<select value={config.assignmentMode} onChange={(event) => update('assignmentMode', event.target.value)} className={fieldClass}><option>Self assigned</option><option>Round robin</option><option>Manager assigned</option></select></label><label className="text-xs font-semibold text-slate-600">Daily follow-up target<input type="number" min="1" max="500" value={config.dailyTarget} onChange={(event) => update('dailyTarget', Number(event.target.value))} className={fieldClass} /></label><label className="text-xs font-semibold text-slate-600">Follow-up reminder window<select value={config.followUpWindow} onChange={(event) => update('followUpWindow', event.target.value)} className={fieldClass}><option>2 hours</option><option>24 hours</option><option>48 hours</option><option>1 week</option></select></label></div><div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="flex items-start gap-3"><Workflow className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><div><p className="text-sm font-semibold text-emerald-950">Your default flow</p><p className="mt-1 text-xs leading-5 text-emerald-800">{config.defaultStage} leads from {config.defaultSource} will open for {config.assignmentMode.toLowerCase()} with a {config.followUpWindow} reminder.</p></div></div></div></div>}

            {activeTab === 'access' && <div className="mt-5"><div><h2 className="text-lg font-semibold text-slate-900">Access and alerts</h2><p className="mt-1 text-xs text-slate-500">Keep everyday controls convenient while protecting sensitive admission data.</p></div><div className="mt-5 grid gap-3 md:grid-cols-2"><Toggle label="Create applications" description="Start and submit new admission applications." checked={config.canCreateApplication} onChange={(value) => update('canCreateApplication', value)} icon={FileText} /><Toggle label="Collect admission fee" description="Record payment against an application." checked={config.canCollectFee} onChange={(value) => update('canCollectFee', value)} icon={ClipboardCheck} /><Toggle label="Edit application details" description="Update applicant details before approval." checked={config.canEditApplication} onChange={(value) => update('canEditApplication', value)} icon={SlidersHorizontal} /><Toggle label="Delete applications" description="Remove records permanently from the workflow." checked={config.canDeleteApplication} onChange={(value) => update('canDeleteApplication', value)} icon={X} /><Toggle label="View admission reports" description="Access performance and collection reports." checked={config.canViewReports} onChange={(value) => update('canViewReports', value)} icon={Eye} /><Toggle label="Two-step verification" description="Ask for an extra verification code at login." checked={config.twoFactor} onChange={(value) => update('twoFactor', value)} icon={KeyRound} /></div><div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-sm font-semibold text-slate-900">Notification channels</h3><div className="mt-3 space-y-3"><Toggle label="Email alerts" description="New assignments and overdue follow-ups." checked={config.receiveEmail} onChange={(value) => update('receiveEmail', value)} icon={Mail} /><Toggle label="Browser alerts" description="Instant updates while the ERP is open." checked={config.receiveBrowser} onChange={(value) => update('receiveBrowser', value)} icon={Bell} /><Toggle label="SMS alerts" description="Important reminders on your mobile." checked={config.receiveSms} onChange={(value) => update('receiveSms', value)} icon={Smartphone} /></div></div></div>}
          </form>

          <aside className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-[linear-gradient(145deg,#102c24_0%,#174d39_100%)] p-5 text-white shadow-[0_18px_40px_rgba(15,81,50,0.2)] sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">Operator preview</p><h2 className="mt-2 text-xl font-semibold">{config.operatorName || 'Unnamed operator'}</h2></div><div className="rounded-xl bg-white/10 p-2.5"><UserRound className="h-5 w-5 text-emerald-100" /></div></div><p className="mt-1 text-xs text-emerald-100/75">{config.role} · {config.operatorCode || 'No code'}</p><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/10 bg-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.16em] text-emerald-200">Session</p><p className="mt-1 text-sm font-semibold">{config.defaultSession}</p></div><div className="rounded-xl border border-white/10 bg-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.16em] text-emerald-200">Target</p><p className="mt-1 text-sm font-semibold">{config.dailyTarget} / day</p></div></div><button type="button" onClick={sendTestAlert} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-50"><Bell className="h-4 w-4" /> Send test notification</button></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-emerald-600" /><h2 className="text-sm font-semibold text-slate-900">Quick access summary</h2></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{enabledAccess} enabled</span></div><div className="mt-4 space-y-2"><SummaryRow label="Create applications" enabled={config.canCreateApplication} /><SummaryRow label="Collect fee" enabled={config.canCollectFee} /><SummaryRow label="Edit applications" enabled={config.canEditApplication} /><SummaryRow label="View reports" enabled={config.canViewReports} /><SummaryRow label="Two-step verification" enabled={config.twoFactor} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><h2 className="text-sm font-semibold text-slate-900">Recent activity</h2></div>{activity.length ? <div className="mt-4 space-y-3">{activity.slice(0, 3).map((item) => <div key={item.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div className="mt-0.5 rounded-full bg-emerald-50 p-1.5 text-emerald-600"><Check className="h-3 w-3" /></div><div><p className="text-xs font-semibold text-slate-700">{item.action}</p><p className="mt-1 text-[11px] text-slate-500">{item.detail}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(item.timestamp)}</p></div></div>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">No changes recorded yet.</div>}</section></aside>
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
