import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft,  ArrowRight, CreditCard, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import ERPFixedSwitch from '../components/ui/ERPFixedSwitch.jsx';
import { useResourceList, useCreateResource, useUpdateResource } from '../hooks/useResourceHooks.js';

const PAYMENT_MODE_OPTIONS = [
  { key: 'Cash', label: 'Cash', code: 'CASH', description: 'Allow cash payments for fee collection.' },
  { key: 'Cheque', label: 'Cheque', code: 'CHEQUE', description: 'Accept cheque payments from students.' },
  { key: 'Demand Draft', label: 'Demand Draft', code: 'DEMAND_DRAFT', description: 'Enable demand draft as a payment option.' },
  { key: 'Card/POS', label: 'Card/POS', code: 'CARD_POS', description: 'Enable card or POS based payments.' },
  { key: 'Online', label: 'Online', code: 'ONLINE', description: 'Accept payments through online channels.' },
  { key: 'Static UPI QR', label: 'Static UPI QR', code: 'STATIC_UPI_QR', description: 'Allow static UPI QR payments.' },
  { key: 'DHE Online', label: 'DHE Online', code: 'DHE_ONLINE', description: 'Allow DHE online payment gateway.' },
  { key: 'DHE Offline', label: 'DHE Offline', code: 'DHE_OFFLINE', description: 'Allow DHE offline payment options.' },
  { key: 'Adjusted', label: 'Adjusted', code: 'ADJUSTED', description: 'Allow adjusted payment entries.' },
  { key: 'Bank Transfer', label: 'Bank Transfer', code: 'BANK_TRANSFER', description: 'Accept bank transfer payments.' },
  { key: 'Bank Loan', label: 'Bank Loan', code: 'BANK_LOAN', description: 'Allow payment via bank loan facility.' },
];

const DEFAULT_MODE_OPTIONS = PAYMENT_MODE_OPTIONS.map((option) => ({ value: option.key, label: option.label }));

function parseActivatedAt(record) {
  return record?.updatedAt || record?.updated_at || record?.createdAt || record?.created_at || null;
}

function mapPaymentModeRecords(items) {
  return PAYMENT_MODE_OPTIONS.map((option) => {
    const existing = items?.find(
      (item) =>
        String(item.modeName || '').toLowerCase() === option.key.toLowerCase() ||
        String(item.code || '').toUpperCase() === option.code,
    );

    const existingStatus = String(existing?.status || '').trim().toLowerCase();
    const isActive = existingStatus === 'active';

    return {
      ...option,
      id: existing?.id ?? null,
      enabled: existing ? isActive : false,
      description: existing?.description || option.description,
      activatedAt: parseActivatedAt(existing),
    };
  });
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

const PAYMENT_MODE_QUERY_PARAMS = { page: 1, pageSize: 50 };
const PAYMENT_MODE_QUERY_KEY = ['payment-modes', JSON.stringify(PAYMENT_MODE_QUERY_PARAMS)];

export default function PaymentModePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useResourceList('payment-modes', PAYMENT_MODE_QUERY_PARAMS);
  const createPaymentMode = useCreateResource('payment-modes');
  const updatePaymentMode = useUpdateResource('payment-modes');
  const [paymentModes, setPaymentModes] = useState(() => mapPaymentModeRecords([]));
  const [defaultMode, setDefaultMode] = useState('Cash');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const recordModes = mapPaymentModeRecords(data?.items || []);
      setPaymentModes(recordModes);

      const firstEnabled = recordModes.find((item) => item.enabled)?.key;
      setDefaultMode(firstEnabled || 'Cash');
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (paymentModes.some((item) => item.key === defaultMode && item.enabled)) {
      return;
    }

    const firstEnabled = paymentModes.find((item) => item.enabled)?.key;
    if (firstEnabled) {
      setDefaultMode(firstEnabled);
    }
  }, [defaultMode, paymentModes]);

  const enabledCount = useMemo(() => paymentModes.filter((item) => item.enabled).length, [paymentModes]);
  const activePaymentModes = useMemo(() => paymentModes.filter((item) => item.enabled), [paymentModes]);

  const handleToggle = (key, value) => {
    setPaymentModes((current) => current.map((item) => (item.key === key ? { ...item, enabled: value } : item)));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const saveTasks = paymentModes.map(async (mode) => {
        const payload = {
          modeName: mode.label,
          code: mode.code,
          status: mode.enabled ? 'Active' : 'Inactive',
          description: mode.description,
        };

        if (mode.id) {
          const updatedRecord = await updatePaymentMode.mutateAsync({ id: mode.id, payload });
          return { key: mode.key, record: updatedRecord };
        }

        if (!mode.enabled) {
          return { key: mode.key, record: null };
        }

        const createdRecord = await createPaymentMode.mutateAsync(payload);
        return { key: mode.key, record: createdRecord };
      });

      const savedResults = await Promise.all(saveTasks);
      setPaymentModes((current) => current.map((mode) => {
        const saved = savedResults.find((item) => item.key === mode.key);
        if (!saved) return mode;
        if (!saved.record) return { ...mode, enabled: false };

        const updatedStatus = String(saved.record.status || '').trim().toLowerCase();
        return {
          ...mode,
          id: saved.record.id ?? mode.id,
          enabled: updatedStatus === 'active',
          activatedAt: parseActivatedAt(saved.record),
        };
      }));

      await queryClient.invalidateQueries({ queryKey: PAYMENT_MODE_QUERY_KEY, exact: true });
      await queryClient.refetchQueries({ queryKey: PAYMENT_MODE_QUERY_KEY, exact: true });
      toast.success('Payment mode settings saved successfully.');
    } catch (error) {
      toast.error(error?.message || 'Unable to save payment mode settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => navigate('/settings/fee-structure/liability-heads');

  return (
    <div className="space-y-6 px-4 pb-6 sm:px-0">
      <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </div></button>
          <Breadcrumb items=items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Settings', to: '/settings' },
          { label: 'Fee Structure', to: '/settings/fee-structure' },
          { label: 'Payment Mode' },
        ]}
      />

      <div className="rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-600">Payment Mode</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Payment modes & activation</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Enable the payment channels your institution accepts and review the currently active methods with activation dates.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl bg-[#0a2e1a] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10">
            <span>{enabledCount}</span>
            <span className="text-slate-200">Active payment methods</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-[28px] bg-slate-950/5 p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Payment method toggles</h2>
              <p className="mt-2 text-sm text-slate-600">
                Slide on the methods you want available in the fee collection workflow.
              </p>
            </div>
            <div className="rounded-3xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
              {isLoading ? 'Loading modes…' : `${enabledCount} enabled`}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paymentModes.map((mode) => (
              <div key={mode.key} className="rounded-[24px] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-950">{mode.label}</p>
                    <p className="mt-2 text-sm text-slate-500">{mode.description}</p>
                  </div>
                  <ERPFixedSwitch checked={mode.enabled} onChange={(checked) => handleToggle(mode.key, checked)} label={mode.label} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5 rounded-[28px] bg-white p-6 shadow-sm">
          <div className="rounded-[24px] bg-[#0a2e1a] p-5 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#0a2e1a]/15 text-emerald-300">
                <CreditCard size={24} />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-200">Default mode</p>
                <h3 className="mt-2 text-2xl font-semibold">Choose default payment method</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-200">
              The selected default is used when receipts are created without an explicit payment channel.
            </p>
          </div>

          <div className="space-y-4 rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
            <div>
              <label htmlFor="default-payment-mode" className="mb-3 block text-sm font-semibold text-slate-900">
                Select default mode
              </label>
              <select
                id="default-payment-mode"
                value={defaultMode}
                onChange={(event) => setDefaultMode(event.target.value)}
                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0a2e1a] focus:ring-2 focus:ring-[#0a2e1a]/20"
              >
                {DEFAULT_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-[20px] bg-slate-50 p-4 shadow-sm border border-slate-200">
              <p className="text-sm font-semibold text-slate-900">Why this matters</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                A default mode keeps your payment collection flow consistent and helps reduce manual selection when recording receipts.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-white px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">Active payment modes</p>
              <p className="mt-1 text-xs text-slate-500">Currently enabled modes and their activation dates.</p>
            </div>
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-800">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold uppercase tracking-[0.24em]">Mode</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-[0.24em]">Code</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-[0.24em]">Activated</th>
                  </tr>
                </thead>
                <tbody>
                  {activePaymentModes.length > 0 ? (
                    activePaymentModes.map((mode) => (
                      <tr key={mode.key} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-5 py-4 font-medium text-slate-900">{mode.label}</td>
                        <td className="px-5 py-4 text-slate-600">{mode.code}</td>
                        <td className="px-5 py-4 text-slate-600">{mode.activatedAt ? formatDate(mode.activatedAt) : 'Pending save'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-6 text-center text-sm text-slate-500">
                        No active payment modes selected yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-[28px] bg-slate-950/5 p-6 text-center text-slate-700 shadow-sm sm:flex-row sm:justify-center sm:px-8">
        <p className="max-w-2xl text-sm leading-6 sm:text-left">
          Save your payment mode configuration to keep the active channels in sync with fee collection processes.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Save
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
