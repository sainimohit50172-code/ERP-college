import { useState } from 'react';
import { ArrowLeft, CalendarCog, Check, Clock3, FileDown, RotateCcw, Save, Settings2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { loadPayrollSettings, payrollSettingsDefaults, payrollSettingsStorageKey } from '../services/payrollSettings.js';

export default function PayrollSettingPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadPayrollSettings);
  const [saved, setSaved] = useState(false);

  const update = (key, value) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = (event) => {
    event.preventDefault();
    window.localStorage.setItem(payrollSettingsStorageKey, JSON.stringify(settings));
    setSaved(true);
  };

  const resetSettings = () => {
    setSettings(payrollSettingsDefaults);
    window.localStorage.removeItem(payrollSettingsStorageKey);
    setSaved(false);
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-3 lg:p-4">
      <div className="flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 border-b border-slate-200/80 pb-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] text-slate-500">
            <button type="button" onClick={() => navigate(-1)} aria-label="Go back" title="Go back" className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"><ArrowLeft className="h-3.5 w-3.5" /></button>
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'HRM Master', to: '/settings/hrm' }, { label: 'Payroll Setting' }]} />
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Payroll &amp; HRM</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">Payroll Setting</h1><p className="mt-1 text-[11px] text-slate-400">Configure pay cycles, attendance rules, deductions and payroll approvals.</p></div>
            <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><FileDown className="h-3.5 w-3.5" /> Print</button><button type="button" onClick={() => navigate('/payroll-master')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f5132] bg-white px-3 py-2 text-[10px] font-semibold text-[#0f5132] hover:bg-emerald-50"><Settings2 className="h-3.5 w-3.5" /> Payroll Master</button></div>
          </div>
        </div>

        {saved && <div className="mb-4 flex items-center gap-2 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700"><Check className="h-3.5 w-3.5" /> Payroll settings saved successfully.</div>}

        <form onSubmit={saveSettings} className="space-y-5">
          <section className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-800"><CalendarCog className="h-3.5 w-3.5" /> Pay Cycle Configuration</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-[10px] font-semibold text-slate-600">Payroll frequency<select value={settings.frequency} onChange={(event) => update('frequency', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Monthly</option><option>Bi-monthly</option><option>Weekly</option><option>Daily</option></select></label><label className="text-[10px] font-semibold text-slate-600">Period starts on<select value={settings.periodStart} onChange={(event) => update('periodStart', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400">{Array.from({ length: 28 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Salary cutoff day<select value={settings.cutoffDay} onChange={(event) => update('cutoffDay', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400">{Array.from({ length: 28 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Payment day<select value={settings.paymentDay} onChange={(event) => update('paymentDay', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Last working day</option><option>1st day of next month</option><option>5th day of next month</option><option>10th day of next month</option></select></label></div></section>
          <div className="grid gap-5 xl:grid-cols-2"><section className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-800"><Clock3 className="h-3.5 w-3.5" /> Attendance &amp; Earnings</div><div className="grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-semibold text-slate-600">Working days per cycle<input type="number" min="1" max="31" value={settings.workingDays} onChange={(event) => update('workingDays', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label><label className="text-[10px] font-semibold text-slate-600">Attendance source<select value={settings.attendanceSource} onChange={(event) => update('attendanceSource', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Attendance register</option><option>Biometric device</option><option>Manual payroll input</option></select></label></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{[['overtimeEnabled', 'Include overtime'], ['bonusEnabled', 'Include bonus and incentives']].map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-700"><input type="checkbox" checked={settings[key]} onChange={(event) => update(key, event.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" />{label}</label>)}</div></section>
          <section className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-800"><ShieldCheck className="h-3.5 w-3.5" /> Statutory Deductions</div><div className="grid gap-2 sm:grid-cols-2">{[['pfEnabled', 'Provident Fund (PF)'], ['esiEnabled', 'Employee State Insurance (ESI)'], ['professionalTaxEnabled', 'Professional Tax']].map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-700"><input type="checkbox" checked={settings[key]} onChange={(event) => update(key, event.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" />{label}</label>)}</div></section></div>
          <section className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-800"><Settings2 className="h-3.5 w-3.5" /> Approval &amp; Status</div><div className="grid gap-3 sm:grid-cols-3"><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-700"><input type="checkbox" checked={settings.approvalRequired} onChange={(event) => update('approvalRequired', event.target.checked)} className="h-3.5 w-3.5 accent-emerald-700" /> Approval required</label><label className="text-[10px] font-semibold text-slate-600">Approval level<select value={settings.approvalLevel} onChange={(event) => update('approvalLevel', event.target.value)} disabled={!settings.approvalRequired} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none disabled:bg-slate-100 focus:border-emerald-400"><option>HR and Finance</option><option>HR only</option><option>Finance only</option><option>Department and HR</option></select></label><label className="text-[10px] font-semibold text-slate-600">Configuration status<select value={settings.status} onChange={(event) => update('status', event.target.value)} className="mt-1 h-[28px] w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400"><option>Active</option><option>Inactive</option></select></label></div></section>

          <div className="flex justify-end gap-2"><button type="button" onClick={resetSettings} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><RotateCcw className="h-3.5 w-3.5" /> Reset</button><button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><Save className="h-3.5 w-3.5" /> Save Settings</button></div>
        </form>
      </div>
    </div>
  );
}
