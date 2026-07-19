import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Edit2, FileText, Hash, Mail, MapPin, Phone, Ticket } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api/axios.js';
import Modal from '../../components/ui/Modal.jsx';
import { useAuth } from '../../services/AuthContext.jsx';

const tabs = ['personal', 'work', 'documents'];
const skillTags = ['Management', 'Communication', 'Leadership', 'MS Office', 'Excel'];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'AD';
}

function formatValue(value, fallback = 'Not provided') {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
}

function normalizeContactValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized || normalized.toLowerCase() === 'not provided') {
    return null;
  }
  return normalized;
}

export default function ProfilePage() {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [leaveStats, setLeaveStats] = useState({ approved: 0, pending: 0, total: 0 });
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', email: '', location: '', bloodGroup: '' });
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'General', priority: 'Medium', impact: '', description: '' });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const employeeId = auth?.user?.employeeId || auth?.user?.employee_id || auth?.user?.id;

        const [profileResult, leaveResult] = await Promise.allSettled([
          (async () => {
            try {
              const meResponse = await api.get('/api/v1/employees/me/');
              const payload = meResponse?.data?.data || meResponse?.data?.item || meResponse?.data?.employee || meResponse?.data;
              if (payload) return payload;
            } catch {
              // fall through to explicit employee lookup
            }

            if (!employeeId) {
              throw new Error('No employee id');
            }

            const detailResponse = await api.get(`/api/v1/employees/${employeeId}`);
            return detailResponse?.data?.data || detailResponse?.data?.item || detailResponse?.data?.employee || detailResponse?.data;
          })(),
          api.get('/api/v1/leave-requests/').catch(() => ({ data: [] })),
        ]);

        const profilePayload = profileResult.status === 'fulfilled' ? profileResult.value : null;
        const leavePayload = leaveResult.status === 'fulfilled' ? leaveResult.value : { data: [] };

        const normalizedProfile = {
          id: profilePayload?.id || profilePayload?.employee_id || employeeId || auth?.user?.id || 'EMP-001',
          name: formatValue(profilePayload?.name || auth?.user?.name, 'Admin'),
          email: formatValue(profilePayload?.email || auth?.user?.email, 'admin@example.com'),
          phone: formatValue(profilePayload?.phone || profilePayload?.mobile, 'Not provided'),
          location: formatValue(profilePayload?.location || profilePayload?.city || profilePayload?.address, 'Mumbai'),
          designation: formatValue(profilePayload?.designation || profilePayload?.job_title, 'System Administrator'),
          department: formatValue(profilePayload?.department, 'Administration'),
          joinDate: formatValue(profilePayload?.join_date || profilePayload?.joinDate || profilePayload?.created_at, 'Jan 2024'),
          employeeCode: formatValue(profilePayload?.employee_code || profilePayload?.employeeCode || profilePayload?.code || `EMP-${String(profilePayload?.id || employeeId || 1).padStart(3, '0')}`, 'EMP-001'),
          bloodGroup: formatValue(profilePayload?.blood_group || profilePayload?.bloodGroup, 'O+'),
          gender: formatValue(profilePayload?.gender, 'Male'),
          dateOfBirth: formatValue(profilePayload?.date_of_birth || profilePayload?.dateOfBirth, 'Not provided'),
          emergencyContact: formatValue(profilePayload?.emergency_contact || profilePayload?.emergencyContact, 'Not provided'),
          employmentType: formatValue(profilePayload?.employment_type || profilePayload?.employmentType, 'Full Time'),
          reportingManager: formatValue(profilePayload?.reporting_manager || profilePayload?.reportingManager, 'N/A'),
          workLocation: formatValue(profilePayload?.work_location || profilePayload?.workLocation || profilePayload?.location, 'Head Office'),
          shiftTiming: formatValue(profilePayload?.shift_timing || profilePayload?.shiftTiming, '09:00 - 18:00'),
          employeeStatus: formatValue(profilePayload?.status || profilePayload?.employee_status, 'Active'),
          experienceYears: profilePayload?.experience_years || profilePayload?.experienceYears || 5,
          rating: profilePayload?.rating || 'A+',
        };

        const leaveItems = Array.isArray(leavePayload?.data)
          ? leavePayload.data
          : Array.isArray(leavePayload?.items)
            ? leavePayload.items
            : Array.isArray(leavePayload)
              ? leavePayload
              : [];

        const currentUserIdentifier = String(employeeId || auth?.user?.id || '').toLowerCase();
        const relevantLeaves = leaveItems.filter((item) => {
          const requestEmployeeId = String(item.employeeId || item.employee_id || item.employee?.id || '').toLowerCase();
          const requestEmployeeName = String(item.employeeName || item.employee_name || item.employee?.name || '').toLowerCase();
          const currentName = String(normalizedProfile.name || '').toLowerCase();
          return !requestEmployeeId || !currentUserIdentifier || requestEmployeeId === currentUserIdentifier || requestEmployeeName === currentName;
        });

        const approved = relevantLeaves.filter((item) => String(item.status || '').toLowerCase() === 'approved').length;
        const pending = relevantLeaves.filter((item) => ['submitted', 'pending', 'manager review', 'hr review'].includes(String(item.status || '').toLowerCase())).length;

        if (!isMounted) return;
        const [firstName = '', ...lastNameParts] = String(normalizedProfile.name).trim().split(' ');
        const lastName = lastNameParts.join(' ');
        setProfile(normalizedProfile);
        setLeaveStats({ approved, pending, total: relevantLeaves.length });
        setEditForm({
          firstName,
          lastName,
          phone: normalizedProfile.phone,
          email: normalizedProfile.email,
          location: normalizedProfile.location,
          bloodGroup: normalizedProfile.bloodGroup,
        });
      } catch {
        if (!isMounted) return;
        const fallbackProfile = {
          id: auth?.user?.id || 'EMP-001',
          name: auth?.user?.name || 'Admin',
          email: auth?.user?.email || 'admin@example.com',
          phone: 'Not provided',
          location: 'Mumbai',
          designation: 'System Administrator',
          department: 'Administration',
          joinDate: 'Jan 2024',
          employeeCode: 'EMP-001',
          bloodGroup: 'O+',
          gender: 'Male',
          dateOfBirth: 'Not provided',
          emergencyContact: 'Not provided',
          employmentType: 'Full Time',
          reportingManager: 'N/A',
          workLocation: 'Head Office',
          shiftTiming: '09:00 - 18:00',
          employeeStatus: 'Active',
          experienceYears: 5,
          rating: 'A+',
        };
        const [firstName = '', ...lastNameParts] = String(fallbackProfile.name).trim().split(' ');
        const lastName = lastNameParts.join(' ');
        setProfile(fallbackProfile);
        setEditForm({
          firstName,
          lastName,
          phone: fallbackProfile.phone,
          email: fallbackProfile.email,
          location: fallbackProfile.location,
          bloodGroup: fallbackProfile.bloodGroup,
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [auth]);

  const quickStats = useMemo(() => [
    { value: leaveStats.approved || 12, label: 'Leaves Taken', color: '#3b82f6' },
    { value: leaveStats.pending || 3, label: 'Pending', color: '#f59e0b' },
    { value: `${profile?.experienceYears || 5}yr`, label: 'Experience', color: '#10b981' },
    { value: profile?.rating || 'A+', label: 'Rating', color: '#8b5cf6' },
  ], [leaveStats.approved, leaveStats.pending, profile?.experienceYears, profile?.rating]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!profile?.id) {
      toast.error('Profile id is unavailable.');
      return;
    }

    const first_name = editForm.firstName?.trim() || profile.name?.split(' ')[0] || 'Employee';
    const last_name = editForm.lastName?.trim() || profile.name?.split(' ').slice(1).join(' ') || null;

    try {
      const payload = {
        employee_code: profile.employeeCode || profile.employee_code || `EMP-${String(profile.id).padStart(3, '0')}`,
        first_name,
        last_name,
        designation: profile.designation,
        department: profile.department,
        status: profile.employeeStatus || 'Active',
      };

      // Convert empty strings to null so Pydantic Optional fields validate correctly
      payload.email = editForm.email?.trim() ? editForm.email.trim() : null;
      payload.phone = editForm.phone?.trim() ? editForm.phone.trim() : null;

      await api.put(`/api/v1/employees/${profile.id}`, payload);
      setProfile((current) => {
        const updatedName = [first_name, last_name].filter(Boolean).join(' ');
        return current ? { ...current, name: updatedName || current.name, email: editForm.email, phone: editForm.phone, location: editForm.location, bloodGroup: editForm.bloodGroup } : current;
      });
      toast.success('Profile updated successfully');
      setIsEditOpen(false);
    } catch (err) {
      // Prefer server-provided message and validation details when available
      const serverMsg = err?.response?.data?.message;
      const validation = err?.response?.data?.data;
      if (serverMsg) {
        const details = Array.isArray(validation) ? validation.map((e) => e.msg || JSON.stringify(e)).join('; ') : (validation ? JSON.stringify(validation) : '');
        toast.error(details ? `${serverMsg}: ${details}` : serverMsg);
      } else {
        toast.error(err?.message || 'Unable to update profile. Please try again.');
      }
      // keep full error in console for debugging
      // eslint-disable-next-line no-console
      console.error('Profile update error:', err);
    }
  };

  const handleTicketSubmit = async (event) => {
    event.preventDefault();
    if (!ticketForm.subject.trim()) {
      toast.error('Please provide a ticket subject.');
      return;
    }

    const lodgedById = auth?.user?.employeeId || auth?.user?.employee_id || auth?.user?.id || 0;
    const ticketPayload = {
      lodged_by_type: 'Employee',
      lodged_by_id: Number(lodgedById),
      requester_email: normalizeContactValue(profile?.email),
      requester_phone: normalizeContactValue(profile?.phone),
      category: ticketForm.category?.trim() || 'General',
      priority: ticketForm.priority || 'Medium',
      impact: ticketForm.impact?.trim() || null,
      subject: ticketForm.subject.trim(),
      description: ticketForm.description.trim() || null,
      status: 'Open',
    };

    try {
      await api.post('/api/v1/helpdesk/tickets/', ticketPayload);
      toast.success('Ticket raised successfully');
      setTicketForm({ subject: '', category: 'General', priority: 'Medium', impact: '', description: '' });
      setIsTicketOpen(false);
    } catch {
      toast.error('Unable to raise ticket. Please try again.');
    }
  };

  const documentCards = [
    { title: 'Aadhar Card', status: 'Uploaded' },
    { title: 'PAN Card', status: 'Uploaded' },
    { title: 'Degree Certificate', status: 'Pending' },
    { title: 'Experience Letter', status: 'Pending' },
  ];

  if (loading || !profile) {
    return (
      <div className="flex h-[calc(100vh-88px)] items-center justify-center overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="mx-[10px] min-h-[calc(100vh-88px)] w-auto max-w-none overflow-x-hidden overflow-y-auto bg-white px-[10px] py-4 sm:px-[10px] lg:px-[10px]">
      <ToastContainer position="top-right" autoClose={2500} />
<div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">My Profile</span>
            <span className="text-slate-400">/</span>
            <span className="text-[13px] font-semibold text-slate-600">Profile</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTicketOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
            >
              <Ticket size={14} />
              Raise Ticket
            </button>
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[linear-gradient(135deg,_#1e3a5f,_#0d3b2e)] px-4 py-2 text-[13px] font-semibold text-white transition duration-200 hover:brightness-110"
            >
              <Edit2 size={14} />
              Edit Profile
            </button>
          </div>
      </div>

      <div className="responsive-profile-shell min-h-0">
        <aside className="mobile-safe-panel flex h-full flex-col items-center gap-3 rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white bg-[linear-gradient(135deg,_#1e3a5f,_#059669)] text-[26px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            {getInitials(profile.name)}
          </div>
          <div className="text-center">
            <h1 className="text-[18px] font-bold text-slate-900">{profile.name}</h1>
            <p className="mt-1 text-[12px] text-slate-500">{profile.designation}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Active
          </div>
          <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            {profile.department}
          </div>

          <div className="my-1 h-px w-full bg-slate-100" />

          <div className="flex w-full flex-col gap-2">
            {[
              { icon: Mail, label: 'Email', value: profile.email, color: '#3b82f6' },
              { icon: Phone, label: 'Phone', value: profile.phone, color: '#10b981' },
              { icon: MapPin, label: 'Location', value: profile.location, color: '#f59e0b' },
              { icon: CalendarDays, label: 'Joined', value: `Joined: ${profile.joinDate}`, color: '#8b5cf6' },
              { icon: Hash, label: 'Employee Code', value: profile.employeeCode, color: '#64748b' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400">{label}</div>
                  <div className="truncate text-[12px] font-medium text-slate-700">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto h-px w-full bg-slate-100" />

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {quickStats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center transition duration-200 hover:border-slate-300 hover:shadow-sm">
                <div className="text-[16px] font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </aside>

        <section className="mobile-safe-panel flex h-full flex-col rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-2 text-[12px] font-semibold transition duration-200 ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
              >
                {tab === 'personal' ? 'Personal Info' : tab === 'work' ? 'Work Details' : 'Documents'}
              </button>
            ))}
          </div>

          <div className="mt-4 flex-1 overflow-hidden">
            {activeTab === 'personal' && (
              <div className="responsive-card-grid h-full gap-3">
                {[
                  { label: 'Full Name', value: profile.name },
                  { label: 'Employee Code', value: profile.employeeCode },
                  { label: 'Email Address', value: profile.email },
                  { label: 'Phone Number', value: profile.phone },
                  { label: 'Date of Birth', value: profile.dateOfBirth },
                  { label: 'Gender', value: profile.gender },
                  { label: 'Blood Group', value: profile.bloodGroup },
                  { label: 'Emergency Contact', value: profile.emergencyContact },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] bg-transparent p-px transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-gradient-to-r hover:from-cyan-400 hover:via-violet-500 hover:to-pink-500">
                    <div className="rounded-[17px] border border-slate-200 bg-white p-3 transition duration-300 hover:border-b-4 hover:border-slate-300">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-400">{item.label}</div>
                      <div className="mt-2 text-[13px] font-semibold text-slate-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'work' && (
              <div className="responsive-card-grid h-full gap-3">
                {[
                  { label: 'Department', value: profile.department },
                  { label: 'Designation', value: profile.designation },
                  { label: 'Employment Type', value: profile.employmentType },
                  { label: 'Join Date', value: profile.joinDate },
                  { label: 'Reporting Manager', value: profile.reportingManager },
                  { label: 'Work Location', value: profile.workLocation },
                  { label: 'Shift Timing', value: profile.shiftTiming },
                  { label: 'Employee Status', value: profile.employeeStatus },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] bg-transparent p-px transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-gradient-to-r hover:from-cyan-400 hover:via-violet-500 hover:to-pink-500">
                    <div className="rounded-[17px] border border-slate-200 bg-white p-3 transition duration-300 hover:border-b-4 hover:border-slate-300">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-400">{item.label}</div>
                      <div className="mt-2 text-[13px] font-semibold text-slate-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="responsive-card-grid h-full gap-3">
                {documentCards.map((doc) => (
                  <div key={doc.title} className="rounded-[18px] bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 p-[1px] transition duration-300 hover:shadow-lg">
                    <div className="rounded-[17px] border border-dashed border-slate-300 bg-slate-50 p-3 hover:border-transparent">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-slate-400" />
                        <div className="text-[12px] font-semibold text-slate-700">{doc.title}</div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{doc.status}</span>
                        <button type="button" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100">
                          {doc.status === 'Uploaded' ? 'View' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="mobile-safe-panel flex h-full flex-col gap-[12px]">
          <div className="flex-none rounded-[12px] border border-slate-200 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-slate-800">Attendance</div>
              <div className="text-[11px] text-slate-400">This Month</div>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <svg width="72" height="72" viewBox="0 0 120 120" className="-rotate-90">
                <circle cx="60" cy="60" r="44" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                <circle cx="60" cy="60" r="44" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44} />
              </svg>
              <div className="mt-2 text-[14px] font-bold text-slate-900">0%</div>
              <div className="text-[11px] text-slate-400">0/0 days present</div>
            </div>
            <div className="mt-4 flex justify-between text-center">
              <div>
                <div className="text-[14px] font-bold text-emerald-600">0</div>
                <div className="text-[10px] text-slate-400">Present</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-red-500">0</div>
                <div className="text-[10px] text-slate-400">Absent</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-amber-500">0</div>
                <div className="text-[10px] text-slate-400">Leave</div>
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-[12px] border border-slate-200 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="text-[13px] font-semibold text-slate-800">Skills & Expertise</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {skillTags.map((skill) => (
                <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  {skill}
                </span>
              ))}
              <span className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-400">+ Add Skill</span>
            </div>
          </div>

          <div className="flex-none rounded-[12px] border border-slate-200 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="text-[13px] font-semibold text-slate-800">Recent Activity</div>
            <div className="mt-2 space-y-2">
              {[
                { icon: CalendarDays, text: 'Leave Approved', meta: '2 days ago', color: '#10b981' },
                { icon: FileText, text: 'Profile Updated', meta: '1 week ago', color: '#3b82f6' },
                { icon: Clock3, text: 'Late Arrival', meta: 'Yesterday', color: '#f59e0b' },
              ].map(({ icon: Icon, text, meta, color }) => (
                <div key={text} className="flex items-center gap-2 border-b border-slate-100 py-2 last:border-b-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium text-slate-700">{text}</div>
                    <div className="text-[11px] text-slate-400">{meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Modal
        title="Edit Profile"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" form="profile-edit-form" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Save Changes
            </button>
          </>
        }
      >
        <form id="profile-edit-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">First Name</span>
              <input value={editForm.firstName} onChange={(event) => setEditForm((current) => ({ ...current, firstName: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Last Name</span>
              <input value={editForm.lastName} onChange={(event) => setEditForm((current) => ({ ...current, lastName: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Phone</span>
              <input value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Email</span>
              <input value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Location</span>
              <input value={editForm.location} onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Blood Group</span>
              <input value={editForm.bloodGroup} onChange={(event) => setEditForm((current) => ({ ...current, bloodGroup: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0" />
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        title="Raise Ticket"
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setIsTicketOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" form="ticket-form" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Submit Ticket
            </button>
          </>
        }
      >
        <form id="ticket-form" onSubmit={handleTicketSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Subject</span>
              <input
                value={ticketForm.subject}
                onChange={(event) => setTicketForm((current) => ({ ...current, subject: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0"
                placeholder="Issue subject"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Category</span>
              <input
                value={ticketForm.category}
                onChange={(event) => setTicketForm((current) => ({ ...current, category: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0"
                placeholder="General"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Priority</span>
              <select
                value={ticketForm.priority}
                onChange={(event) => setTicketForm((current) => ({ ...current, priority: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Impact</span>
              <input
                value={ticketForm.impact}
                onChange={(event) => setTicketForm((current) => ({ ...current, impact: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0"
                placeholder="Impact summary"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Description</span>
              <textarea
                value={ticketForm.description}
                onChange={(event) => setTicketForm((current) => ({ ...current, description: event.target.value }))}
                rows={5}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
                placeholder="Describe the issue in detail"
              />
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
