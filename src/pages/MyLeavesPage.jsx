import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../services/AuthContext.jsx';
import api from '../api/axios.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CheckCircle,
  ChevronDown,
  Clock3,
  Clock,
  Plus,
  Sparkles,
  UploadCloud,
  X,
  XCircle,
} from 'lucide-react';

const cycleOptions = ['2024-25', '2025-26', '2026-27'];
const leaveTypeAccent = {
  casual: { label: 'Casual', color: 'bg-blue-500', text: 'text-blue-600' },
  medical: { label: 'Medical', color: 'bg-emerald-500', text: 'text-emerald-600' },
  earned: { label: 'Earned', color: 'bg-amber-500', text: 'text-amber-600' },
  compensatory: { label: 'Compensatory', color: 'bg-violet-500', text: 'text-violet-600' },
};

const holidaySeed = [
  { id: 1, title: 'Independence Day', type: 'National', date: '2026-08-15' },
  { id: 2, title: 'Diwali', type: 'Festival', date: '2026-10-20' },
  { id: 3, title: 'Regional Day', type: 'Regional', date: '2026-11-01' },
  { id: 4, title: 'Christmas', type: 'Festival', date: '2026-12-25' },
];

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '-';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMonth(value) {
  const date = parseDate(value);
  if (!date) return '-';
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function normalizeStatus(value) {
  const status = String(value || '').trim().toLowerCase();
  if (['approved', 'complete', 'completed'].includes(status)) return 'approved';
  if (['submitted', 'pending', 'manager review', 'hr review', 'review'].includes(status)) return 'submitted';
  if (['draft', 'in progress', 'inprogress'].includes(status)) return 'draft';
  if (['rejected', 'declined'].includes(status)) return 'rejected';
  return status || 'submitted';
}

function normalizeItems(response) {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
}

function getLeaveTypeMeta(type) {
  const raw = `${type?.code || ''} ${type?.name || ''}`.toLowerCase();
  if (raw.includes('casual')) return { ...leaveTypeAccent.casual, name: type?.name || 'Casual Leave' };
  if (raw.includes('sick') || raw.includes('medical')) return { ...leaveTypeAccent.medical, name: type?.name || 'Medical Leave' };
  if (raw.includes('annual') || raw.includes('earned')) return { ...leaveTypeAccent.earned, name: type?.name || 'Earned Leave' };
  if (raw.includes('comp') || raw.includes('maternity')) return { ...leaveTypeAccent.compensatory, name: type?.name || 'Compensatory Leave' };
  return { ...leaveTypeAccent.casual, name: type?.name || 'Leave' };
}

export default function MyLeavesPage() {
  const { auth } = useAuth();
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(cycleOptions[1]);
  const [activeHolidayTab, setActiveHolidayTab] = useState('Upcoming');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [formState, setFormState] = useState({
    startDate: '',
    endDate: '',
    leavePeriod: 'Full Day',
    reason: '',
  });
  const snapshotRef = useRef(null);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const loadData = async () => {
    try {
      const [requestsResponse, leaveTypesResponse] = await Promise.all([
        api.get('/leave-requests/'),
        api.get('/leave-types/'),
      ]);
      const nextRequests = normalizeItems(requestsResponse);
      const nextLeaveTypes = normalizeItems(leaveTypesResponse);
      setRequests(nextRequests);
      setLeaveTypes(nextLeaveTypes);
      if (nextLeaveTypes.length && !selectedLeaveTypeId) {
        setSelectedLeaveTypeId(nextLeaveTypes[0].id);
      }
    } catch (error) {
      console.error('Unable to load leave data', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedLeaveTypeId && leaveTypes.length) {
      setSelectedLeaveTypeId(leaveTypes[0].id);
    }
  }, [selectedLeaveTypeId, leaveTypes]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (snapshotRef.current && !snapshotRef.current.contains(event.target)) {
        setIsSnapshotOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const userId = String(auth?.user?.id || '').trim();
  const userName = String(auth?.user?.name || '').trim().toLowerCase();

  const myRequests = useMemo(() => {
    if (!auth?.user) return requests;
    return requests.filter((request) => {
      const requestEmployeeId = String(request.employeeId || '').trim();
      const requestEmployeeName = String(request.employeeName || '').trim().toLowerCase();
      return (userId && requestEmployeeId && requestEmployeeId === userId)
        || (userName && requestEmployeeName && requestEmployeeName === userName);
    });
  }, [auth?.user, requests, userId, userName]);

  const summary = useMemo(() => {
    const total = myRequests.length;
    const approved = myRequests.filter((request) => normalizeStatus(request.status) === 'approved').length;
    const submitted = myRequests.filter((request) => normalizeStatus(request.status) === 'submitted').length;
    const draft = myRequests.filter((request) => normalizeStatus(request.status) === 'draft').length;
    const rejected = myRequests.filter((request) => normalizeStatus(request.status) === 'rejected').length;
    return { total, approved, submitted, draft, rejected };
  }, [myRequests]);

  const leaveBalanceRows = useMemo(() => {
    if (!leaveTypes.length) return [];
    return leaveTypes.map((type) => {
      const meta = getLeaveTypeMeta(type);
      const used = myRequests
        .filter((request) => normalizeStatus(request.status) === 'approved' && String(request.leaveTypeId || request.leaveType || '').toLowerCase() === String(type.id || type.code || '').toLowerCase())
        .reduce((sum, request) => sum + Number(request.days || 0), 0);
      const allocated = [7, 10, 15, 5][leaveTypes.indexOf(type)] ?? 10;
      const remaining = Math.max(allocated - used, 0);
      return {
        id: type.id || type.code,
        name: meta.name,
        allocated,
        used,
        remaining,
        accent: meta,
      };
    });
  }, [leaveTypes, myRequests]);

  const holidayList = useMemo(() => {
    const list = [...holidaySeed]
      .filter((holiday) => activeHolidayTab === 'History' ? holiday.id % 2 === 0 : holiday.id % 2 === 1)
      .sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }, [activeHolidayTab]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormState({ startDate: '', endDate: '', leavePeriod: 'Full Day', reason: '' });
    setSelectedFileName('');
    setSelectedLeaveTypeId(leaveTypes[0]?.id || '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.startDate || !formState.endDate || !formState.leavePeriod) {
      toast.error('Please fill in the required leave fields.');
      return;
    }
    if (formState.endDate < formState.startDate) {
      toast.error('End date must be on or after the start date.');
      return;
    }

    try {
      await api.post('/leave-requests/', {
        start_date: formState.startDate,
        end_date: formState.endDate,
        leave_period: formState.leavePeriod,
        leave_type_id: selectedLeaveTypeId || leaveTypes[0]?.id || 1,
        reason: formState.reason,
        status: 'pending',
      });
      toast.success('Leave request submitted!');
      setIsDrawerOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      const message = error?.response?.data?.detail || error?.message || 'Unable to submit leave request.';
      toast.error(message);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 p-4 text-slate-900">
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Employee leave hub</p>
            <h1 className="mt-1 text-[28px] font-semibold text-slate-950">My Leaves</h1>
            <p className="mt-1 text-[13px] text-slate-600">Personalized leave analytics and approvals</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Request Leave
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover-gradient-border">
              <BookOpen className="h-4 w-4 text-slate-500" /> Leave Policy
            </button>
            <div className="relative" ref={snapshotRef}>
              <button
                type="button"
                onClick={() => setIsSnapshotOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Status Snapshot <ChevronDown className="h-4 w-4" />
              </button>
              {isSnapshotOpen && (
                <div className="absolute right-0 top-[44px] z-50 w-[240px] rounded-[10px] border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900">Live insights</p>
                    </div>
                    <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">Updated</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 py-2">
                      <div>
                        <p className="font-medium text-slate-700">Approved</p>
                        <p className="text-[11px] text-slate-500">Approved requests</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[12px] font-semibold text-emerald-700">{summary.approved}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-2">
                      <div>
                        <p className="font-medium text-slate-700">Submitted</p>
                        <p className="text-[11px] text-slate-500">Awaiting action</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[12px] font-semibold text-amber-700">{summary.submitted}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-2">
                      <div>
                        <p className="font-medium text-slate-700">Draft</p>
                        <p className="text-[11px] text-slate-500">Not yet submitted</p>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-900">{summary.draft}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-slate-700">Rejected</p>
                        <p className="text-[11px] text-slate-500">Needs follow-up</p>
                      </div>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[12px] font-semibold text-rose-700">{summary.rejected}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Requests', value: summary.total, detail: 'All time', icon: CalendarDays, iconWrap: 'bg-slate-900 text-white', border: 'border-slate-200', text: 'text-slate-900' },
            { label: 'Approved', value: summary.approved, detail: 'Ready to go', icon: CheckCircle2, iconWrap: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100', text: 'text-emerald-600' },
            { label: 'Pending', value: summary.submitted, detail: 'Awaiting review', icon: Clock3, iconWrap: 'bg-amber-100 text-amber-600', border: 'border-amber-100', text: 'text-amber-600' },
            { label: 'Rejected', value: summary.rejected, detail: 'Needs attention', icon: XCircle, iconWrap: 'bg-rose-100 text-rose-600', border: 'border-rose-100', text: 'text-rose-600' },
          ].map((card) => (
            <div key={card.label} className={`flex h-[80px] max-h-[80px] items-center gap-3 rounded-[10px] border bg-white p-3 shadow-sm ${card.border}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${card.iconWrap}`}>
                <card.icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                <p className={`mt-1 text-[20px] font-semibold ${card.text}`}>{card.value}</p>
                <p className="text-[11px] text-slate-500">{card.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid flex-1 gap-3 overflow-hidden lg:grid-cols-2">
          <section className="flex min-h-0 flex-col rounded-[12px] border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Balance overview</p>
                <h2 className="mt-1 text-[16px] font-semibold text-slate-900">Leave allocation</h2>
              </div>
              <button type="button" className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-600 hover-gradient-border">Personal</button>
            </div>

            <select
              value={selectedCycle}
              onChange={(event) => setSelectedCycle(event.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            >
              {cycleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <div className="flex-1 space-y-2 overflow-auto">
              {leaveBalanceRows.length ? leaveBalanceRows.map((row) => (
                <div key={row.id} className="flex items-center justify-between border-b border-slate-100 px-1 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.accent.color}`} />
                    <span className="text-[13px] font-medium text-slate-700">{row.name}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-slate-900">{row.remaining} / {row.allocated} days</div>
                </div>
              )) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                  No leave policies found yet.
                </div>
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-col rounded-[12px] border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h2 className="text-[16px] font-semibold text-slate-900">Holidays</h2>
              <div className="flex rounded-md bg-slate-100 p-1">
                {['Upcoming', 'History'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveHolidayTab(tab)}
                    className={`rounded px-3 py-1 text-[12px] font-medium ${activeHolidayTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-auto">
              {holidayList.length ? holidayList.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between border-b border-slate-100 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 flex-col items-center justify-center rounded-full text-[11px] font-semibold text-white ${holiday.type === 'National' ? 'bg-red-600' : holiday.type === 'Festival' ? 'bg-amber-500' : 'bg-cyan-600'}`}>
                      <span>{new Date(holiday.date).getDate()}</span>
                      <span className="text-[9px] uppercase">{formatMonth(holiday.date)}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">{holiday.title}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${holiday.type === 'National' ? 'bg-red-50 text-red-600' : holiday.type === 'Festival' ? 'bg-amber-50 text-amber-600' : 'bg-cyan-50 text-cyan-600'}`}>
                        {holiday.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-[12px] text-slate-500">{new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                </div>
              )) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                  No upcoming holidays
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-3 grid flex-1 gap-3 overflow-hidden lg:grid-cols-[1.6fr_0.9fr]">
          <section className="rounded-[12px] border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Overview</p>
                <h2 className="text-[16px] font-semibold text-slate-900">Recent requests</h2>
              </div>
              <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover-gradient-border">Export report</button>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-[11px] uppercase tracking-[0.2em]">Type</th>
                    <th className="px-3 py-2 text-[11px] uppercase tracking-[0.2em]">Dates</th>
                    <th className="px-3 py-2 text-[11px] uppercase tracking-[0.2em]">Days</th>
                    <th className="px-3 py-2 text-[11px] uppercase tracking-[0.2em]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.slice(0, 6).map((request) => (
                    <tr key={request.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-900">{request.leaveType || 'Leave'}</td>
                      <td className="px-3 py-2 text-slate-600">{formatDate(request.startDate)} - {formatDate(request.endDate)}</td>
                      <td className="px-3 py-2 text-slate-900">{request.days ?? '-'}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${normalizeStatus(request.status) === 'approved' ? 'bg-emerald-100 text-emerald-700' : normalizeStatus(request.status) === 'submitted' ? 'bg-amber-100 text-amber-700' : normalizeStatus(request.status) === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                          {request.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!myRequests.length && (
                    <tr>
                      <td colSpan="4" className="px-3 py-6 text-center text-sm text-slate-500">No leave requests found for your account.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[12px] border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status summary</p>
                <h2 className="text-[16px] font-semibold text-slate-900">Quick stats</h2>
              </div>
            </div>
            <div className="grid gap-2">
              {[
                { label: 'Total Requests', value: summary.total, icon: CalendarDays, accent: 'bg-slate-900 text-white' },
                { label: 'Approved', value: summary.approved, icon: CheckCircle, accent: 'bg-emerald-100 text-emerald-700' },
                { label: 'Pending', value: summary.submitted, icon: Clock, accent: 'bg-amber-100 text-amber-700' },
                { label: 'Rejected', value: summary.rejected, icon: XCircle, accent: 'bg-rose-100 text-rose-700' },
              ].map((card) => (
                <div key={card.label} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${card.accent}`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                      <p className="text-[20px] font-semibold text-slate-900">{card.value}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500">{card.label === 'Total Requests' ? 'All time' : 'Updated'}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40" onClick={() => setIsDrawerOpen(false)} />
      )}
      <div className={`fixed right-0 top-14 z-50 h-[calc(100vh-56px)] w-full max-w-[480px] transform bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-[20px] font-semibold text-slate-900">Apply Leave</p>
          </div>
          <button type="button" onClick={() => setIsDrawerOpen(false)} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex h-[calc(100%-72px)] flex-col overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Leave Start Date</label>
              <input type="date" name="startDate" min={today} value={formState.startDate} onChange={handleFieldChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 hover-gradient-border" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Leave End Date</label>
              <input type="date" name="endDate" min={formState.startDate || today} value={formState.endDate} onChange={handleFieldChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 hover-gradient-border" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Select Leave Period</label>
              <select name="leavePeriod" value={formState.leavePeriod} onChange={handleFieldChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 hover-gradient-border">
                <option value="Full Day">Full Day</option>
                <option value="First Half">First Half</option>
                <option value="Second Half">Second Half</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reason</label>
              <textarea name="reason" value={formState.reason} onChange={handleFieldChange} rows={4} placeholder="Enter Your Reason" className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 hover-gradient-border" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Document Upload</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                <UploadCloud className="mb-2 h-10 w-10 text-slate-400" />
                <p className="text-[13px] text-slate-500">Click to upload</p>
                <p className="mt-1 text-[11px] text-slate-400">.pdf, .jpg, .png</p>
                <input type="file" accept=".pdf,.jpg,.png" className="hidden hover-gradient-border" onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name || '')} />
              </label>
              {selectedFileName ? <p className="mt-2 text-sm text-emerald-600">Selected: {selectedFileName}</p> : null}
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reporting Managers</span>
                <span className="text-sm font-medium text-slate-700">Admin</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Approval Status</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[12px] font-semibold text-amber-700">Pending</span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">Close</button>
            <button type="submit" className="rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] px-5 py-2.5 text-sm font-semibold text-white hover-gradient-border">Apply Leave</button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-right" theme="light" />
    </div>
  );
}
