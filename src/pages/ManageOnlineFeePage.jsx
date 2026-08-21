import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,  Save, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks';

const emptyCollegeForm = {
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
  status: 'Active',
};

const emptyFeeForm = {
  collegeId: '',
  message: '',
};

export default function ManageOnlineFeePage() {
  const navigate = useNavigate();
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [editCollege, setEditCollege] = useState(null);
  const [collegeFormValues, setCollegeFormValues] = useState(emptyCollegeForm);
  const [feeFormValues, setFeeFormValues] = useState(emptyFeeForm);

  const { data: collegesData, isLoading: collegesLoading, refetch: refetchColleges } = useResourceList('colleges', { page: 1, pageSize: 100 });
  const createCollege = useCreateResource('colleges');
  const updateCollege = useUpdateResource('colleges');
  const deleteCollege = useDeleteResource('colleges');
  const createFeeMessage = useCreateResource('online-fee-messages');

  const colleges = collegesData?.items || [];

  const openCreateCollege = () => {
    setEditCollege(null);
    setCollegeFormValues(emptyCollegeForm);
    setShowCollegeForm(true);
  };

  const openEditCollege = (college) => {
    setEditCollege(college);
    setCollegeFormValues({
      name: college.name || '',
      code: college.code || '',
      address: college.address || '',
      phone: college.phone || '',
      email: college.email || '',
      status: college.status || 'Active',
    });
    setShowCollegeForm(true);
  };

  const closeCollegeForm = () => {
    setShowCollegeForm(false);
    setEditCollege(null);
    setCollegeFormValues(emptyCollegeForm);
  };

  const handleCollegeSubmit = async (event) => {
    event.preventDefault();

    if (!collegeFormValues.name.trim() || !collegeFormValues.code.trim()) {
      toast.error('College name and code are required.');
      return;
    }

    const payload = {
      name: collegeFormValues.name.trim(),
      code: collegeFormValues.code.trim(),
      address: collegeFormValues.address.trim(),
      phone: collegeFormValues.phone.trim(),
      email: collegeFormValues.email.trim(),
      status: collegeFormValues.status,
    };

    try {
      if (editCollege) {
        await updateCollege.mutateAsync({ id: editCollege.id, payload });
        toast.success('College updated successfully.');
      } else {
        const response = await createCollege.mutateAsync(payload);
        console.log('College created response:', response);
        toast.success('College created successfully.');
      }
      closeCollegeForm();
    } catch (error) {
      console.error('College save error:', error);
      toast.error(error?.message || 'Could not save college.');
    }
  };

  const handleDeleteCollege = async (college) => {
    if (!window.confirm(`Delete ${college.name}?`)) return;

    try {
      await deleteCollege.mutateAsync(college.id);
      toast.success('College deleted successfully.');
      refetchColleges();
    } catch (error) {
      toast.error(error?.message || 'Could not delete college.');
    }
  };

  const handleFeeSubmit = async (event) => {
    event.preventDefault();

    if (!feeFormValues.collegeId) {
      toast.error('Please select a college.');
      return;
    }

    if (!feeFormValues.message.trim()) {
      toast.error('Please enter a message.');
      return;
    }

    try {
      await createFeeMessage.mutateAsync({
        collegeId: feeFormValues.collegeId,
        message: feeFormValues.message.trim(),
      });
      toast.success('Online fee message saved successfully.');
      setFeeFormValues(emptyFeeForm);
    } catch (error) {
      toast.error(error?.message || 'Could not save online fee message.');
    }
  };

  return (
    <div className="space-y-6 px-4 pb-6 sm:px-0">
      {/* Online Fee Message Section */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Breadcrumb items={[
              { label: 'Dashboard', to: '/' },
              { label: 'Fee Structure', to: '/settings/fee-structure' },
              { label: 'Manage Online Fee' },
            ]} />
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Manage Online Fee</h1>
            <p className="mt-2 text-sm text-slate-600">Configure online fee collection messages</p>
          </div>
          <button
            type="button"
            onClick={openCreateCollege}
            disabled={showCollegeForm}
            className="inline-flex items-center gap-2 rounded-md bg-[#05331e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#042d1a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add College
          </button>
        </div>
      </div>

      {/* Colleges Section */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm sm:p-6">

        {showCollegeForm && (
          <form onSubmit={handleCollegeSubmit} className="mb-6 space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4 relative">
            <button
              type="button"
              onClick={closeCollegeForm}
              className="absolute top-3 right-3 p-1 text-slate-500 hover:text-slate-700 transition"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="pr-8"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="college-name" className="text-sm font-semibold text-slate-700">
                  College Name *
                </label>
                <input
                  id="college-name"
                  type="text"
                  value={collegeFormValues.name}
                  onChange={(e) => setCollegeFormValues((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter college name"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="college-code" className="text-sm font-semibold text-slate-700">
                  College Code *
                </label>
                <input
                  id="college-code"
                  type="text"
                  value={collegeFormValues.code}
                  onChange={(e) => setCollegeFormValues((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter college code"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="college-address" className="text-sm font-semibold text-slate-700">
                  Address
                </label>
                <input
                  id="college-address"
                  type="text"
                  value={collegeFormValues.address}
                  onChange={(e) => setCollegeFormValues((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter college address"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="college-phone" className="text-sm font-semibold text-slate-700">
                  Phone
                </label>
                <input
                  id="college-phone"
                  type="text"
                  value={collegeFormValues.phone}
                  onChange={(e) => setCollegeFormValues((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="college-email" className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="college-email"
                  type="email"
                  value={collegeFormValues.email}
                  onChange={(e) => setCollegeFormValues((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="college-status" className="text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  id="college-status"
                  value={collegeFormValues.status}
                  onChange={(e) => setCollegeFormValues((prev) => ({ ...prev, status: e.target.value }))}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeCollegeForm}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-[#0d2348] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c1d3f]"
              >
                <Save className="h-4 w-4" />
                {editCollege ? 'Update' : 'Save'} College
              </button>
            </div>
          </form>
        )}

        {collegesLoading ? (
          <div className="text-sm text-slate-600">Loading colleges...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#05331e]">
                  <th className="border-r-2 border-white px-6 py-4 text-xs font-bold uppercase tracking-wide text-white">Name</th>
                  <th className="border-r-2 border-white px-6 py-4 text-xs font-bold uppercase tracking-wide text-white">Code</th>
                  <th className="border-r-2 border-white px-6 py-4 text-xs font-bold uppercase tracking-wide text-white">Phone</th>
                  <th className="border-r-2 border-white px-6 py-4 text-xs font-bold uppercase tracking-wide text-white">Email</th>
                  <th className="border-r-2 border-white px-6 py-4 text-xs font-bold uppercase tracking-wide text-white">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {colleges.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm font-medium text-slate-600">
                      No colleges found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  colleges.map((college) => (
                    <tr key={college.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border-r-2 border-white px-6 py-4 text-center font-medium text-slate-900">{college.name}</td>
                      <td className="border-r-2 border-white px-6 py-4 text-center text-slate-700">{college.code}</td>
                      <td className="border-r-2 border-white px-6 py-4 text-center text-slate-700">{college.phone || '-'}</td>
                      <td className="border-r-2 border-white px-6 py-4 text-center text-slate-700">{college.email || '-'}</td>
                      <td className="border-r-2 border-white px-6 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            college.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {college.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditCollege(college)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#183452] hover:underline"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCollege(college)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
