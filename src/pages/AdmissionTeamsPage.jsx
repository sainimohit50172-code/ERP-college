import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundPlus,
  UsersRound,
  X,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import { toast } from '../utils/toast.js';

const storageKey = 'erp:admission-teams';
const pageSize = 6;
const statuses = ['All', 'Active', 'Inactive', 'Draft'];
const modes = ['Round Robin', 'Manual assignment', 'Load balanced'];
const emptyForm = { name: '', code: '', lead: '', email: '', phone: '', members: '', mode: 'Round Robin', capacity: '80', assigned: '0', status: 'Active', description: '' };
const defaultTeams = [
  { id: 'team-digital', name: 'Digital Admissions', code: 'ADM-DIGITAL', lead: 'Nisha Pal', email: 'nisha.pal@haridwaruniversity.edu', phone: '9876543210', members: ['Nisha Pal', 'Amit Sharma', 'Riya Joshi'], mode: 'Round Robin', capacity: 120, assigned: 86, status: 'Active', description: 'Handles website, social and digital campaign enquiries.', updatedAt: '2026-08-21T10:00:00.000Z' },
  { id: 'team-campus', name: 'Campus Connect', code: 'ADM-CAMPUS', lead: 'Amit Sharma', email: 'amit.sharma@haridwaruniversity.edu', phone: '9876543211', members: ['Amit Sharma', 'Karan Singh'], mode: 'Load balanced', capacity: 80, assigned: 47, status: 'Active', description: 'Manages walk-ins, campus visits and school outreach.', updatedAt: '2026-08-20T10:00:00.000Z' },
  { id: 'team-premium', name: 'Priority Counselling', code: 'ADM-PRIORITY', lead: 'Neha Verma', email: 'neha.verma@haridwaruniversity.edu', phone: '9876543212', members: ['Neha Verma', 'Priya Singh'], mode: 'Manual assignment', capacity: 45, assigned: 31, status: 'Active', description: 'Dedicated response team for high-intent and referral leads.', updatedAt: '2026-08-19T10:00:00.000Z' },
  { id: 'team-international', name: 'International Desk', code: 'ADM-INTL', lead: 'Priya Singh', email: 'priya.singh@haridwaruniversity.edu', phone: '9876543213', members: ['Priya Singh'], mode: 'Manual assignment', capacity: 30, assigned: 0, status: 'Draft', description: 'International applicant support desk.', updatedAt: '2026-08-18T10:00:00.000Z' },
];

const readTeams = () => {
  if (typeof window === 'undefined') return defaultTeams;
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    return Array.isArray(stored) && stored.length ? stored : defaultTeams;
  } catch { return defaultTeams; }
};

const getNextId = () => `admission-team-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
const statusClass = (status) => status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : status === 'Draft' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-600 ring-slate-200';
const loadPercent = (team) => team.capacity ? Math.min(100, Math.round((Number(team.assigned || 0) / Number(team.capacity)) * 100)) : 0;

export default function AdmissionTeamsPage() {
  const [teams, setTeams] = useState(readTeams);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');

  const persist = (nextTeams) => { setTeams(nextTeams); window.localStorage.setItem(storageKey, JSON.stringify(nextTeams)); };
  const filteredTeams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return teams.filter((team) => (!query || [team.name, team.code, team.lead, team.email, ...(team.members || [])].join(' ').toLowerCase().includes(query)) && (statusFilter === 'All' || team.status === statusFilter));
  }, [teams, searchTerm, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / pageSize));
  const visibleTeams = filteredTeams.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeTeams = teams.filter((team) => team.status === 'Active').length;
  const totalCapacity = teams.reduce((sum, team) => sum + Number(team.capacity || 0), 0);
  const totalAssigned = teams.reduce((sum, team) => sum + Number(team.assigned || 0), 0);
  const totalMembers = new Set(teams.flatMap((team) => team.members || [])).size;

  const closeForm = () => { setIsFormOpen(false); setFormMode('create'); setSelectedTeam(null); setForm(emptyForm); };
  const openCreate = () => { setFormMode('create'); setForm({ ...emptyForm }); setIsFormOpen(true); };
  const openEdit = (team) => { setFormMode('edit'); setSelectedTeam(team); setForm({ ...emptyForm, ...team, members: (team.members || []).join(', ') }); setIsFormOpen(true); };
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const lead = form.lead.trim();
    const email = form.email.trim();
    const capacity = Number(form.capacity);
    const assigned = Number(form.assigned || 0);
    const members = form.members.split(',').map((member) => member.trim()).filter(Boolean);
    const duplicate = teams.some((team) => team.code === code && team.id !== selectedTeam?.id);
    if (!name || code.length < 3 || !lead || !email || !members.length || !Number.isInteger(capacity) || capacity < 1 || !Number.isInteger(assigned) || assigned < 0 || assigned > capacity) { toast.error('Enter valid team, lead, member and capacity details.'); return; }
    if (duplicate) { toast.error('This team code already exists. Use a unique code.'); return; }
    const payload = { ...form, name, code, lead, email, members, capacity, assigned, updatedAt: new Date().toISOString() };
    const nextTeams = formMode === 'edit' && selectedTeam ? teams.map((team) => team.id === selectedTeam.id ? { ...team, ...payload } : team) : [...teams, { id: getNextId(), ...payload }];
    persist(nextTeams); setCurrentPage(1); toast.success(formMode === 'edit' ? 'Admission team updated.' : 'Admission team created.'); closeForm();
  };

  const deleteTeam = (team) => { if (!window.confirm(`Delete admission team "${team.name}"?`)) return; persist(teams.filter((item) => item.id !== team.id)); setIsViewOpen(false); toast.success('Admission team deleted.'); };
  const duplicateTeam = (team) => { persist([...teams, { ...team, id: getNextId(), name: `${team.name} Copy`, code: `${team.code}-COPY`, members: [...(team.members || [])], assigned: 0, status: 'Draft', updatedAt: new Date().toISOString() }]); toast.success('Team duplicated as draft.'); };
  const resetFilters = () => { setSearchTerm(''); setStatusFilter('All'); setCurrentPage(1); };
  const exportTeams = () => { const csv = [['Team', 'Code', 'Team lead', 'Email', 'Members', 'Mode', 'Capacity', 'Assigned', 'Status'], ...teams.map((team) => [team.name, team.code, team.lead, team.email, (team.members || []).join('; '), team.mode, team.capacity, team.assigned, team.status])].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'admission-teams.csv'; link.click(); URL.revokeObjectURL(url); toast.success('Admission teams exported.'); };
  const start = filteredTeams.length ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, filteredTeams.length);

  return (
    <div className="no-hover-border min-h-[calc(100vh-7rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f3f8f5_0%,#ffffff_48%,#f8fafc_100%)] p-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] sm:p-3 lg:p-4">
      <div className="no-hover-border flex h-full flex-col rounded-[22px] border border-slate-200/70 bg-white/95 p-3 shadow-inner sm:p-4 lg:p-5">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div><Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Admission Setup', to: '/admission/setup' }, { label: 'Admission Master', to: '/admission/admissionMaster' }, { label: 'Admission Teams' }]} /><div className="mt-3 flex items-center gap-3"><div className="rounded-2xl bg-[#0f5132] p-3 text-white shadow-lg shadow-emerald-100"><UserRoundPlus className="h-6 w-6" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Admission Setup</p><h1 className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[24px]">Admission Teams</h1><p className="mt-1 text-[11px] text-slate-400">Build focused admission squads, balance ownership and keep every lead moving.</p></div></div></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Download className="h-3.5 w-3.5" />Print</button><button type="button" onClick={exportTeams} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"><Download className="h-3.5 w-3.5" />Export</button><button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]"><Plus className="h-3.5 w-3.5" />Create Team</button></div>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Active teams" value={`${activeTeams} / ${teams.length}`} detail="Ready for lead assignment" icon={CheckCircle2} tone="emerald" /><Stat label="Team members" value={totalMembers} detail="Unique operators across teams" icon={UsersRound} /><Stat label="Lead capacity" value={totalCapacity} detail={`${totalAssigned} assignments in queue`} icon={ShieldCheck} /><Stat label="Utilization" value={`${totalCapacity ? Math.round((totalAssigned / totalCapacity) * 100) : 0}%`} detail="Across all admission teams" icon={ListIcon} /></section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-[#101824] p-4 text-white shadow-[0_16px_35px_rgba(16,24,36,0.12)] sm:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Team command centre</p><h2 className="mt-1 text-lg font-semibold">Find the right team at a glance</h2></div><div className="flex flex-wrap items-center gap-2"><label htmlFor="admission-team-search" className="relative"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input id="admission-team-search" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Search team, lead or member..." className="h-9 w-full rounded-lg border border-white/15 bg-white/10 pl-8 pr-3 text-xs text-white outline-none placeholder:text-slate-400 focus:border-emerald-300 sm:w-64" /></label><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="h-9 rounded-lg border border-white/15 bg-white/10 px-2 text-xs text-white outline-none [&>option]:text-slate-900">{statuses.map((status) => <option key={status}>{status}</option>)}</select><button type="button" onClick={resetFilters} className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/15 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10"><X className="h-3.5 w-3.5" />Reset</button></div></div></section>

        <section className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleTeams.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">No admission teams found.</div> : visibleTeams.map((team) => <TeamCard key={team.id} team={team} onView={() => { setSelectedTeam(team); setIsViewOpen(true); }} onEdit={() => openEdit(team)} onDuplicate={() => duplicateTeam(team)} onDelete={() => deleteTeam(team)} />)}</section>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500"><span>Showing {start} to {end} of {filteredTeams.length} teams</span><div className="flex items-center gap-1"><button type="button" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" className="rounded border border-emerald-600 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{currentPage}</button><button type="button" onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages} className="rounded border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={formMode === 'edit' ? 'Edit Admission Team' : 'Create Admission Team'} footer={<div className="flex justify-end gap-2"><button type="button" onClick={closeForm} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">Cancel</button><button type="submit" form="admission-team-form" className="rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#0d432b]">{formMode === 'edit' ? 'Update team' : 'Create team'}</button></div>}><form id="admission-team-form" onSubmit={handleSubmit} className="space-y-4"><div className="grid gap-3 md:grid-cols-2"><Field label="Team name" value={form.name} onChange={(value) => updateForm('name', value)} placeholder="e.g. Digital Admissions" required /><Field label="Team code" value={form.code} onChange={(value) => updateForm('code', value.toUpperCase())} placeholder="e.g. ADM-DIGITAL" required /><Field label="Team lead" value={form.lead} onChange={(value) => updateForm('lead', value)} placeholder="Lead operator" required /><Field label="Team email" type="email" value={form.email} onChange={(value) => updateForm('email', value)} placeholder="team@example.com" required /><Field label="Contact number" value={form.phone} onChange={(value) => updateForm('phone', value)} placeholder="10 digit mobile number" /><Field label="Team members" value={form.members} onChange={(value) => updateForm('members', value)} placeholder="Nisha Pal, Amit Sharma" required /></div><div className="grid gap-3 sm:grid-cols-4"><Field label="Capacity" type="number" value={form.capacity} onChange={(value) => updateForm('capacity', value)} min="1" required /><Field label="Assigned" type="number" value={form.assigned} onChange={(value) => updateForm('assigned', value)} min="0" /><label className="text-[10px] font-semibold text-slate-600">Assignment mode<select value={form.mode} onChange={(event) => updateForm('mode', event.target.value)} className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400">{modes.map((mode) => <option key={mode}>{mode}</option>)}</select></label><label className="text-[10px] font-semibold text-slate-600">Status<select value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400">{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label></div><label className="block text-[10px] font-semibold text-slate-600">Description<textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={3} className="mt-1 w-full resize-none rounded-md border border-slate-200 px-2 py-2 text-[10px] outline-none focus:border-emerald-400" /></label></form></Modal>
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Admission Team Details" footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">Close</button>{selectedTeam && <button type="button" onClick={() => { setIsViewOpen(false); openEdit(selectedTeam); }} className="rounded-lg bg-[#0f5132] px-3 py-2 text-[10px] font-semibold text-white">Edit team</button>}</div>}>{selectedTeam && <div className="grid gap-3 text-xs text-slate-700 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Team</span><p className="mt-1 font-semibold text-slate-900">{selectedTeam.name}</p><p className="mt-1 font-mono text-[10px] text-emerald-700">{selectedTeam.code}</p><p className="mt-2"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${statusClass(selectedTeam.status)}`}>{selectedTeam.status}</span></p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Team lead</span><p className="mt-1 font-semibold text-slate-900">{selectedTeam.lead}</p><p className="mt-1 text-slate-500">{selectedTeam.email}</p><p className="mt-1 text-slate-500">{selectedTeam.phone || 'No phone added'}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Roster</span><p className="mt-1 font-semibold text-slate-900">{(selectedTeam.members || []).length} members</p><p className="mt-1 leading-5 text-slate-500">{(selectedTeam.members || []).join(', ')}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Capacity</span><p className="mt-1 font-semibold text-slate-900">{selectedTeam.assigned} of {selectedTeam.capacity} assigned</p><p className="mt-1 text-emerald-700">{Math.max(0, selectedTeam.capacity - selectedTeam.assigned)} slots available</p><p className="mt-1 text-slate-500">{selectedTeam.mode}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Description</span><p className="mt-1">{selectedTeam.description || 'No description added.'}</p><p className="mt-2 text-[10px] text-slate-400">Updated {formatDate(selectedTeam.updatedAt)}</p></div></div>}</Modal>
    </div>
  );
}

function TeamCard({ team, onView, onEdit, onDuplicate, onDelete }) {
  const percentage = loadPercent(team);
  return <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_35px_rgba(15,23,42,0.1)] sm:p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><UsersRound className="h-5 w-5" /></div><div className="min-w-0"><h2 className="truncate text-sm font-bold text-slate-900">{team.name}</h2><p className="mt-1 font-mono text-[10px] text-emerald-700">{team.code}</p></div></div><span className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-semibold ring-1 ${statusClass(team.status)}`}>{team.status}</span></div><div className="mt-5 flex items-center gap-2"><div className="flex -space-x-2">{(team.members || []).slice(0, 4).map((member) => <span key={member} title={member} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#0f5132] text-[10px] font-bold text-white">{member.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>)}{team.members.length > 4 && <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600">+{team.members.length - 4}</span>}</div><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-700">{team.lead}</p><p className="text-[10px] text-slate-400">Team lead · {team.members.length} members</p></div></div><div className="mt-5"><div className="flex items-center justify-between text-[10px] text-slate-500"><span>Assignment load</span><strong className={percentage >= 85 ? 'text-rose-600' : 'text-emerald-700'}>{team.assigned}/{team.capacity} · {percentage}%</strong></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${percentage >= 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }} /></div></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="inline-flex items-center gap-1 text-[10px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />{team.mode}</span><div className="flex gap-1"><button type="button" onClick={onView} title="View team" aria-label={`View ${team.name}`} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="h-3.5 w-3.5" /></button><button type="button" onClick={onEdit} title="Edit team" aria-label={`Edit ${team.name}`} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={onDuplicate} title="Duplicate team" aria-label={`Duplicate ${team.name}`} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700"><Copy className="h-3.5 w-3.5" /></button><button type="button" onClick={onDelete} title="Delete team" aria-label={`Delete ${team.name}`} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></div></article>;
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false, min }) {
  return <label className="text-[10px] font-semibold text-slate-600">{label}<input required={required} type={type} min={min} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[10px] outline-none focus:border-emerald-400" /></label>;
}

function Stat({ label, value, detail, icon: Icon, tone = 'slate' }) {
  return <div className={`rounded-2xl border p-4 ${tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}><div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] ${tone === 'emerald' ? 'text-emerald-700' : 'text-slate-500'}`}>{label}<Icon className={`h-4 w-4 ${tone === 'emerald' ? 'text-emerald-600' : 'text-sky-600'}`} /></div><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-500">{detail}</p></div>;
}

function ListIcon() {
  return <Check className="h-4 w-4 text-emerald-600" />;
}
