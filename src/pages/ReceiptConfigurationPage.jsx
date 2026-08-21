import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  FileText,
  Palette,
  Printer,
  RefreshCcw,
  Save,
  ShieldCheck,
  Wand2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';

const defaultValues = {
  receiptName: 'Transaction Receipt',
  receiptType: 'Academic Fee',
  prefix: 'TR',
  startingNumber: 1001,
  digits: 6,
  suffix: '',
  autoIncrement: true,
  includeDate: true,
  dateFormat: 'DD/MM/YYYY',
  paperSize: 'A4',
  orientation: 'Portrait',
  margin: 'Narrow',
  showCollegeName: true,
  showLogo: true,
  showAddress: true,
  showPaymentMode: true,
  showAmountBreakdown: true,
  showSignature: true,
  showQrCode: true,
  footerText: 'Thank you for choosing Haridwar University.',
  requiredApproval: false,
  duplicateCheck: true,
};

const presetLayouts = [
  { id: 'classic', name: 'Classic' },
  { id: 'premium', name: 'Premium' },
  { id: 'minimal', name: 'Minimal' },
];

function formatReceiptNumber(values) {
  const prefix = values.prefix?.trim() || 'TR';
  const suffix = values.suffix?.trim() || '';
  const digits = Math.max(3, Number(values.digits) || 6);
  const number = Math.max(0, Number(values.startingNumber) || 0);
  return `${prefix}${String(number).padStart(digits, '0')}${suffix}`;
}

function sanitizeSavedData(raw) {
  if (!raw || typeof raw !== 'object') return { ...defaultValues };
  return {
    ...defaultValues,
    ...raw,
    receiptName: raw.receiptName ?? defaultValues.receiptName,
    receiptType: raw.receiptType ?? defaultValues.receiptType,
    prefix: raw.prefix ?? defaultValues.prefix,
    startingNumber: Number(raw.startingNumber ?? raw.receiptNumber ?? defaultValues.startingNumber),
    digits: Number(raw.digits ?? defaultValues.digits),
    suffix: raw.suffix ?? defaultValues.suffix,
    autoIncrement: raw.autoIncrement ?? defaultValues.autoIncrement,
    includeDate: raw.includeDate ?? defaultValues.includeDate,
    dateFormat: raw.dateFormat ?? defaultValues.dateFormat,
    paperSize: raw.paperSize ?? defaultValues.paperSize,
    orientation: raw.orientation ?? defaultValues.orientation,
    showCollegeName: raw.showCollegeName ?? defaultValues.showCollegeName,
    showLogo: raw.showLogo ?? defaultValues.showLogo,
    showAddress: raw.showAddress ?? defaultValues.showAddress,
    showPaymentMode: raw.showPaymentMode ?? defaultValues.showPaymentMode,
    showAmountBreakdown: raw.showAmountBreakdown ?? defaultValues.showAmountBreakdown,
    showSignature: raw.showSignature ?? defaultValues.showSignature,
    showQrCode: raw.showQrCode ?? defaultValues.showQrCode,
    footerText: raw.footerText ?? defaultValues.footerText,
    requiredApproval: raw.requiredApproval ?? defaultValues.requiredApproval,
    duplicateCheck: raw.duplicateCheck ?? defaultValues.duplicateCheck,
  };
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReceiptConfigurationPage() {
  const [configurationId, setConfigurationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePreset, setActivePreset] = useState('premium');
  const [values, setValues] = useState(defaultValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadFromStorage = () => {
      try {
        const stored = localStorage.getItem('receipt-configuration');
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        return sanitizeSavedData(parsed);
      } catch {
        return null;
      }
    };

    api.get('/coe/receipt-configuration')
      .then((response) => {
        if (!active) return;
        const serverData = response?.data?.data || response?.data || null;
        if (serverData) {
          setValues(sanitizeSavedData(serverData));
          setConfigurationId(serverData.id || serverData._id || null);
        } else {
          const stored = loadFromStorage();
          if (stored) setValues(stored);
        }
      })
      .catch(() => {
        if (!active) return;
        const stored = loadFromStorage();
        if (stored) {
          setValues(stored);
          setConfigurationId(stored.id || 'local-demo');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const previewNumber = useMemo(() => formatReceiptNumber(values), [values]);

  const updateField = (field, nextValue) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
  };

  const saveConfiguration = async () => {
    if (!values.prefix.trim()) {
      toast.error('Add a receipt prefix before saving.');
      return;
    }
    if (values.digits < 3 || values.digits > 12) {
      toast.error('Receipt digits must be between 3 and 12.');
      return;
    }

    setIsSaving(true);
    const payload = {
      ...values,
      startingNumber: Number(values.startingNumber || 0),
      digits: Number(values.digits || 6),
      receiptNumber: Number(values.startingNumber || 0),
      status: 'Active',
      lastUpdated: new Date().toISOString(),
    };

    try {
      const response = configurationId && String(configurationId).toLowerCase() !== 'local-demo'
        ? await api.put(`/coe/receipt-configuration/${configurationId}`, payload)
        : await api.post('/coe/receipt-configuration', payload);
      const resultId = response?.data?.data?.id || response?.data?.id || configurationId || 'local-demo';
      setConfigurationId(resultId);
      localStorage.setItem('receipt-configuration', JSON.stringify(payload));
      toast.success('Transaction receipt settings saved successfully.');
    } catch {
      localStorage.setItem('receipt-configuration', JSON.stringify(payload));
      setConfigurationId((current) => current || 'local-demo');
      toast.success('Settings saved locally. Connect the API to sync online.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setValues(defaultValues);
    setConfigurationId(null);
    localStorage.removeItem('receipt-configuration');
    toast.info('Receipt setup reset to defaults.');
  };

  const exportConfiguration = () => {
    downloadFile(JSON.stringify({ ...values, previewNumber }, null, 2), 'transaction-receipt-configuration.json', 'application/json');
    toast.success('Receipt configuration exported.');
  };

  const duplicateTemplate = () => {
    setValues((current) => ({ ...current, receiptName: `${current.receiptName} Copy` }));
    toast.info('Template duplicated. Update the name before saving.');
  };

  const printTestSheet = () => {
    window.print();
  };

  const openValidationRules = () => {
    setValues((current) => ({ ...current, requiredApproval: !current.requiredApproval }));
    toast.info(`Payment approval ${values.requiredApproval ? 'disabled' : 'enabled'}.`);
  };

  const stats = [
    { label: 'Status', value: values.autoIncrement ? 'Live' : 'Manual', tone: 'emerald' },
    { label: 'Current No.', value: previewNumber, tone: 'blue' },
    { label: 'Print Mode', value: `${values.paperSize} • ${values.orientation}`, tone: 'sky' },
    { label: 'Approval', value: values.requiredApproval ? 'Required' : 'Auto', tone: 'amber' },
  ];

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f4f8f7_0%,#ffffff_48%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'Transaction Receipt Setup' }]} />

        <div className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-600">Admission Setup</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Transaction Receipt Setup</h1>
            <p className="mt-1 text-sm text-slate-500">Premium receipt configuration with numbering, branding, print rules and live approval controls.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="!h-[28px] !rounded-lg !px-3 !py-2 !text-[10px] !font-semibold !leading-none !shadow-none" onClick={exportConfiguration} disabled={isLoading}><Download className="h-3.5 w-3.5" />Export</Button>
            <Button variant="secondary" className="!h-[28px] !rounded-lg !px-3 !py-2 !text-[10px] !font-semibold !shadow-none" onClick={resetSettings} disabled={isLoading}><RefreshCcw className="h-3.5 w-3.5" />Reset</Button>
            <Button variant="primary" className="!h-[28px] !rounded-lg !bg-[#0f5132] !px-3 !py-2 !text-[10px] !font-semibold !leading-none !text-white !shadow-none hover:!bg-[#0d432b]" onClick={saveConfiguration} isLoading={isSaving} disabled={isLoading}><Save className="h-3.5 w-3.5" />Save Settings</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                <span>{stat.label}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${stat.tone === 'emerald' ? 'bg-emerald-500' : stat.tone === 'blue' ? 'bg-blue-500' : stat.tone === 'sky' ? 'bg-sky-500' : 'bg-amber-500'}`} />
              </div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Receipt identity</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">Core configuration</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure format
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Receipt name</span>
                  <input
                    id="receipt-name"
                    name="receiptName"
                    type="text"
                    value={values.receiptName ?? ''}
                    onChange={(event) => updateField('receiptName', event.target.value)}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Receipt type</span>
                  <select
                    id="receipt-type"
                    name="receiptType"
                    value={values.receiptType ?? ''}
                    onChange={(event) => updateField('receiptType', event.target.value)}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  >
                    <option>Academic Fee</option>
                    <option>Hostel Fee</option>
                    <option>Transport Fee</option>
                    <option>Admission Fee</option>
                    <option>Miscellaneous</option>
                  </select>
                </label>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Layout presets</span>
                  <span className="text-xs text-slate-400">Choose style</span>
                </div>
                <div className="grid items-start gap-3 md:grid-cols-3">
                  {presetLayouts.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActivePreset(preset.id)}
                      className={`self-start rounded-lg border px-3 py-2 text-left text-[10px] transition ${activePreset === preset.id ? 'min-h-[44px] scale-[1.03] border-transparent bg-[#0f5132] font-bold text-white shadow-[0_10px_20px_rgba(15,81,50,0.2)]' : 'h-[28px] border-slate-200 bg-slate-50 font-semibold text-slate-700 hover:border-[#0f5132] hover:text-[#0f5132]'}`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em]">
                        <span>{preset.name}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Numbering</p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">Sequence &amp; rules</h2>
                </div>
                <div className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">Auto increment</div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Prefix</span>
                  <input
                    id="receipt-prefix"
                    name="prefix"
                    type="text"
                    value={values.prefix ?? ''}
                    onChange={(event) => updateField('prefix', event.target.value.toUpperCase())}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Starting no.</span>
                  <input
                    id="receipt-starting-number"
                    name="startingNumber"
                    type="number"
                    min="0"
                    value={values.startingNumber ?? ''}
                    onChange={(event) => updateField('startingNumber', Number(event.target.value))}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Digits</span>
                  <input
                    id="receipt-digits"
                    name="digits"
                    type="number"
                    min="3"
                    max="12"
                    value={values.digits ?? ''}
                    onChange={(event) => updateField('digits', Number(event.target.value))}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Suffix</span>
                  <input
                    id="receipt-suffix"
                    name="suffix"
                    type="text"
                    value={values.suffix ?? ''}
                    onChange={(event) => updateField('suffix', event.target.value)}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Date format</span>
                  <select
                    id="receipt-date-format"
                    name="dateFormat"
                    value={values.dateFormat ?? ''}
                    onChange={(event) => updateField('dateFormat', event.target.value)}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['autoIncrement', 'Auto increment'],
                  ['includeDate', 'Include date'],
                  ['duplicateCheck', 'Duplicate check'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField(key, !values[key])}
                    className={`flex h-[28px] items-center justify-between rounded-lg border px-3 py-2 text-[10px] font-semibold transition ${values[key] ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    <span>{label}</span>
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${values[key] ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {values[key] ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Branding</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">Print design and compliance</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <Palette className="h-3.5 w-3.5" />
                  Premium styling
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Paper size</span>
                  <select
                    id="receipt-paper-size"
                    name="paperSize"
                    value={values.paperSize ?? ''}
                    onChange={(event) => updateField('paperSize', event.target.value)}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  >
                    <option>A4</option>
                    <option>A5</option>
                    <option>Legal</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold text-slate-600">Orientation</span>
                  <select
                    id="receipt-orientation"
                    name="orientation"
                    value={values.orientation ?? ''}
                    onChange={(event) => updateField('orientation', event.target.value)}
                    className="mt-1 h-[28px] w-full rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  >
                    <option>Portrait</option>
                    <option>Landscape</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ['showCollegeName', 'College name'],
                  ['showLogo', 'College logo'],
                  ['showAddress', 'Address'],
                  ['showPaymentMode', 'Payment mode'],
                  ['showAmountBreakdown', 'Amount breakdown'],
                  ['showSignature', 'Signature line'],
                  ['showQrCode', 'QR code'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField(key, !values[key])}
                    className={`flex h-[28px] items-center justify-between rounded-lg border px-3 py-2 text-[10px] font-semibold transition ${values[key] ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    <span>{label}</span>
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${values[key] ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {values[key] ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-[10px] font-semibold text-slate-600">Footer message</span>
                <textarea
                  id="receipt-footer-message"
                  name="footerText"
                  value={values.footerText ?? ''}
                  onChange={(event) => updateField('footerText', event.target.value)}
                  rows={3}
                  className="mt-1 h-[56px] w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-2 text-[10px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </label>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(145deg,#102c24_0%,#174d39_100%)] p-5 text-white shadow-[0_18px_40px_rgba(15,81,50,0.2)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">Live preview</p>
                  <h2 className="mt-2 text-xl font-semibold">Receipt mock-up</h2>
                </div>
                <div className="rounded-full bg-white/10 p-2">
                  <FileText className="h-5 w-5 text-emerald-300" />
                </div>
              </div>

              <div className="mt-5 rounded-[18px] bg-white p-4 text-slate-900 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Haridwar University</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">{values.receiptName}</div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">{values.receiptType}</div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-500">Receipt ID</span><span className="font-semibold">{previewNumber}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Issue Date</span><span className="font-semibold">{new Date().toLocaleDateString('en-GB')}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Student</span><span className="font-semibold">Aarav Sharma</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Program</span><span className="font-semibold">B.Tech CSE</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Amount</span><span className="font-semibold">₹ 24,500</span></div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between"><span>Payment mode</span><span className="font-semibold text-slate-900">UPI / Card</span></div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-600">
                  {values.footerText}
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Advanced actions</h3>
                <Wand2 className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="mt-4 space-y-3">
                <button type="button" onClick={duplicateTemplate} className="flex h-[28px] w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[10px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <span className="inline-flex items-center gap-2"><Copy className="h-4 w-4" />Duplicate receipt template</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button type="button" onClick={printTestSheet} className="flex h-[28px] w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[10px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <span className="inline-flex items-center gap-2"><Printer className="h-4 w-4" />Print test sheet</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button type="button" onClick={openValidationRules} className="flex h-[28px] w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[10px] font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">
                  <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" />Payment validation rules</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
