import { useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2, Edit3, Mail, Phone, Save, UserRound, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateResource, useUpdateResource } from '../../hooks/useResourceHooks.js';

const initialForm = {
  employee_code: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  designation: '',
  department: '',
  qualification: '',
  status: 'Active',
  photo_url: '',
};

const fields = [
  { name: 'employee_code', label: 'Employee code', placeholder: 'EMP-0001', icon: BadgeCheck, required: true },
  { name: 'first_name', label: 'First name', placeholder: 'Enter first name', icon: UserRound, required: true },
  { name: 'last_name', label: 'Last name', placeholder: 'Enter last name', icon: UserRound, required: true },
  { name: 'email', label: 'Email address', placeholder: 'employee@university.edu', icon: Mail, type: 'email' },
  { name: 'phone', label: 'Phone number', placeholder: '+91 00000 00000', icon: Phone },
  { name: 'designation', label: 'Designation', placeholder: 'Assistant Professor', icon: BriefcaseBusiness },
  { name: 'department', label: 'Department', placeholder: 'Computer Science', icon: Building2 },
  { name: 'qualification', label: 'Qualification', placeholder: 'M.Tech / Ph.D.', icon: BadgeCheck },
];

function getProfileName(profile) {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const createProfile = useCreateResource('employees');
  const updateProfile = useUpdateResource('employees');
  const [form, setForm] = useState(initialForm);
  const [createdProfile, setCreatedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const updateField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile photo must be smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateField('photo_url', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(initialForm);
    setCreatedProfile(null);
    setIsEditing(false);
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    const payload = {
      employee_code: form.employee_code.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      designation: form.designation.trim() || null,
      department: form.department.trim() || null,
      status: form.status,
    };

    if (!payload.employee_code || !payload.first_name || !payload.last_name) {
      toast.error('Employee code, first name and last name are required.');
      return;
    }

    try {
      const result = isEditing
        ? await updateProfile.mutateAsync({ id: createdProfile.id, payload })
        : await createProfile.mutateAsync(payload);
      const saved = { ...payload, ...(result || {}), id: result?.id || createdProfile?.id };
      setCreatedProfile(saved);
      setForm(saved);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['employees'], exact: false });
      toast.success(isEditing ? 'Employee profile updated.' : 'Employee profile created.');
    } catch (error) {
      toast.error(error?.message || 'Unable to save employee profile.');
    }
  };

  const isSaving = createProfile.isPending || updateProfile.isPending;

  return (
    <div className="min-h-[calc(100vh-10rem)] overflow-x-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(145deg,#f8fafc_0%,#ffffff_48%,#effaf5_100%)] p-3 shadow-sm sm:p-5">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-700">Employee Portal / Profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Create employee profile</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Create a complete employee identity that can be used across the ERP.</p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">Employee master</div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <aside className="w-full rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:w-[300px] lg:flex-none">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-100 bg-[#101824] text-3xl font-bold text-emerald-100 shadow-[0_10px_24px_rgba(16,24,36,0.2)]">
                {form.photo_url ? <img src={form.photo_url} alt="Employee profile preview" className="h-full w-full object-cover" /> : <UserRound className="h-12 w-12" />}
              </div>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                <Edit3 className="h-3.5 w-3.5 text-emerald-700" /> Upload profile photo
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} className="hidden" />
              </label>
              <h2 className="mt-5 max-w-full truncate text-xl font-semibold text-slate-950">{getProfileName(form) || 'New employee'}</h2>
              <p className="mt-1 truncate text-sm text-slate-500">{form.designation || 'Designation not added'}</p>
              <p className="mt-1 truncate text-xs text-emerald-700">{form.qualification || 'Qualification not added'}</p>
            </div>
            <div className="my-6 h-px bg-slate-100" />
            <div className="space-y-4">
              {[
                ['Mobile number', form.phone, Phone],
                ['Email address', form.email, Mail],
                ['Department', form.department, Building2],
                ['Employee code', form.employee_code, BadgeCheck],
              ].map(([label, value, Icon]) => <div key={label} className="flex min-w-0 items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="h-4 w-4" /></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</p><p className="mt-1 truncate text-xs font-semibold text-slate-700">{value || 'Not provided'}</p></div></div>)}
            </div>
            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">This profile will be available across employee, attendance and HRM workflows after creation.</div>
          </aside>

          <section className="min-w-0 flex-1 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:min-h-[520px]">
            <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#101824] text-emerald-200"><UserRound className="h-6 w-6" /></div>
              <div><h2 className="text-xl font-semibold text-slate-950">Employee fields</h2><p className="mt-1 text-sm text-slate-500">Add the details that will be used across the ERP employee directory.</p></div>
            </div>
            <form onSubmit={submitProfile} className="grid gap-5 sm:grid-cols-2">
              {fields.map(({ name, label, placeholder, icon: Icon, type = 'text', required }) => (
                <label key={name} htmlFor={`profile-${name}`} className="block text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-emerald-700" />{label}{required ? <span className="text-rose-500">*</span> : null}</span>
                  <input id={`profile-${name}`} name={name} autoComplete={{ employee_code: 'off', first_name: 'given-name', last_name: 'family-name', email: 'email', phone: 'tel', designation: 'organization-title', department: 'organization', qualification: 'off' }[name]} required={required} type={type} value={form[name] || ''} onChange={(event) => updateField(name, event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
                </label>
              ))}
              <label htmlFor="profile-status" className="block text-xs font-bold text-slate-600"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700" />Profile status</span><select id="profile-status" name="status" autoComplete="off" value={form.status} onChange={(event) => updateField('status', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"><option>Active</option><option>On Leave</option><option>Resigned</option></select></label>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={resetForm} className="btn btn-secondary"><X className="h-4 w-4" />Reset</button><button type="submit" disabled={isSaving} className="btn btn-primary"><Save className="h-4 w-4" />{isSaving ? 'Saving...' : isEditing ? 'Update profile' : 'Create profile'}</button></div>
            </form>
          </section>
        </div>
        {createdProfile ? <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Saved successfully</p><p className="mt-2 text-sm font-semibold text-emerald-950">{getProfileName(createdProfile)}</p><p className="mt-1 text-xs text-emerald-800">{createdProfile.employee_code}</p><button type="button" onClick={() => { setForm(createdProfile); setIsEditing(true); }} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950"><Edit3 className="h-4 w-4" />Edit this profile</button></div> : null}
      </div>
    </div>
  );
}
