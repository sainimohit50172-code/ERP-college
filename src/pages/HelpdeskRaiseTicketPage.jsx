import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Ticket, Briefcase, ShieldCheck, Layers, FileText, CalendarDays } from 'lucide-react';
import api from '../api/axios.js';

const moduleOptions = [
  'Academic',
  'Attendance',
  'Employee Payroll',
  'Leaves & Permissions',
  'Library',
  'Finance',
  'Hostel',
  'Inventory',
  'ERP Access',
  'Other',
];

const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
const requirementTypeOptions = ['New Requirement', 'Data Correction', 'Access Request', 'Bug / Issue', 'Integration', 'Other'];
const departmentOptions = ['Administration', 'HR', 'Finance', 'Academics', 'Library', 'Hostel', 'Transport', 'IT Support'];
const environmentOptions = ['Production', 'Staging', 'Testing', 'Development'];

export default function HelpdeskRaiseTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: '',
    module: 'Academic',
    requirementType: 'New Requirement',
    priority: 'Medium',
    department: 'Administration',
    impact: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    environment: 'Production',
    affectedUsers: '',
    preferredEta: '',
    steps: '',
    attachmentName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.subject.trim()) {
      toast.error('Subject is required for ERP ticket submission.');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please describe the ERP requirement or issue.');
      return;
    }

    const payload = {
      category: `${form.requirementType} / ${form.module}`,
      priority: form.priority,
      impact: form.impact.trim() || 'ERP operation affected',
      subject: form.subject.trim(),
      description: `Department: ${form.department}\nModule: ${form.module}\nRequirement Type: ${form.requirementType}\nEnvironment: ${form.environment}\nPreferred ETA: ${form.preferredEta || 'Not specified'}\nAffected Users: ${form.affectedUsers || 'Not specified'}\nAttachment: ${form.attachmentName || 'None'}\nContact Email: ${form.contactEmail.trim() || 'Not provided'}\nContact Phone: ${form.contactPhone.trim() || 'Not provided'}\n\nSteps / Details:\n${form.steps.trim() || ''}\n\nDescription:\n${form.description.trim()}`,
      meta: {
        environment: form.environment,
        preferredEta: form.preferredEta || null,
        affectedUsers: form.affectedUsers ? Number(form.affectedUsers) : null,
        attachmentName: form.attachmentName || null,
      },
    };

    try {
      setIsSubmitting(true);
      await api.post('/api/v1/helpdesk/tickets/', payload);
      toast.success('ERP ticket raised successfully.');
      setForm({
        subject: '',
        module: 'Academic',
        requirementType: 'New Requirement',
        priority: 'Medium',
        department: 'Administration',
        impact: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
      });
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Unable to raise the ticket right now. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="overflow-hidden rounded-[32px] border border-orange-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8 text-white sm:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-100">Haridwar University ERP</p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Raise a Helpdesk Ticket</h1>
                <p className="mt-4 max-w-2xl text-sm text-orange-100/90">
                  Submit your ERP requirement, issue request, or support need for Finance, HR, Attendance, Library, Hostel, and other university systems.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-white/20 bg-white/10 px-4 py-3">
                <Ticket className="h-5 w-5 text-white" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-orange-100/90">Support</p>
                  <p className="text-sm font-semibold text-white">ERP Ticket Desk</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
            <div className="erp-card rounded-[24px] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">ERP Requirement Ticket</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Fill in the details below so our support team can address your ERP request accurately.
                  </p>
                </div>
                <div className="rounded-3xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  <span className="text-slate-400">Ticket priority</span>
                  <p className="mt-1 text-base text-slate-900">{form.priority}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Subject</span>
                  <input
                    value={form.subject}
                    onChange={(event) => handleChange('subject', event.target.value)}
                    placeholder="Summarize your ERP requirement"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    required
                  />
                </label>

                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Related ERP Module</span>
                  <select
                    value={form.module}
                    onChange={(event) => handleChange('module', event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  >
                    {moduleOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Requirement Type</span>
                  <select
                    value={form.requirementType}
                    onChange={(event) => handleChange('requirementType', event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  >
                    {requirementTypeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Priority</span>
                  <select
                    value={form.priority}
                    onChange={(event) => handleChange('priority', event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Department</span>
                  <select
                    value={form.department}
                    onChange={(event) => handleChange('department', event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  >
                    {departmentOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block erp-card-action hover-gradient-border p-3">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Business Impact</span>
                <input
                  value={form.impact}
                  onChange={(event) => handleChange('impact', event.target.value)}
                  placeholder="Example: Payroll not processing for staff"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </label>

              <label className="block erp-card-action hover-gradient-border p-3">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  rows={7}
                  placeholder="Describe the ERP requirement or issue in detail"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  required
                />
              </label>
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Contact Email</span>
                  <input
                    value={form.contactEmail}
                    onChange={(event) => handleChange('contactEmail', event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </label>
                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Contact Phone</span>
                  <input
                    value={form.contactPhone}
                    onChange={(event) => handleChange('contactPhone', event.target.value)}
                    placeholder="98765 43210"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </label>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Environment</span>
                  <select
                    value={form.environment}
                    onChange={(event) => handleChange('environment', event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  >
                    {environmentOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </label>

                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Affected Users</span>
                  <input
                    type="number"
                    min={0}
                    value={form.affectedUsers || ''}
                    onChange={(event) => handleChange('affectedUsers', event.target.value)}
                    placeholder="Number of users impacted"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </label>

                <label className="block erp-card-action hover-gradient-border p-3">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Preferred ETA</span>
                  <input
                    type="date"
                    value={form.preferredEta || ''}
                    onChange={(event) => handleChange('preferredEta', event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </label>
              </div>

              <label className="block erp-card-action hover-gradient-border p-3">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Steps to Reproduce / Additional Notes</span>
                <textarea
                  value={form.steps}
                  onChange={(event) => handleChange('steps', event.target.value)}
                  rows={4}
                  placeholder="Optional: steps to reproduce, sample data, or other notes"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </label>

              <label className="block erp-card-action hover-gradient-border p-3">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Attachments (optional)</span>
                <input
                  type="file"
                  onChange={(event) => handleChange('attachmentName', event.target.files?.[0]?.name || '')}
                  className="w-full text-sm text-slate-700"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-3xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-400"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit ERP Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar theme="colored" />
    </div>
  );
}
