import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useResourceList } from '../hooks/useResourceHooks';
import { useQueryClient } from '@tanstack/react-query';
import { useResourceDetails, useUpdateResource } from '../hooks/useResourceHooks';
import uploadService from '../api/uploadService.js';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import FormField from '../components/forms/FormField.jsx';
import Modal from '../components/ui/Modal.jsx';

const documentTypes = [
  { key: 'ID Proof', label: 'ID Proof' },
  { key: 'Contract', label: 'Employment Contract' },
  { key: 'Offer Letter', label: 'Offer Letter' },
  { key: 'Certification', label: 'Certification / Training' },
  { key: 'Other', label: 'Other Document' },
];

const statusOptions = ['Active', 'On Leave', 'Resigned'];

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default function EmployeeProfilePage() {
  const { employeeId } = useParams();
  const queryClient = useQueryClient();
  const uploadInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingDocumentType, setPendingDocumentType] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusValue, setStatusValue] = useState('Active');
  const [documentUploads, setDocumentUploads] = useState([]);

  const employeeQuery = useResourceDetails('employees', employeeId);
  const updateEmployee = useUpdateResource('employees');
  const { data: leaveRequestsData } = useResourceList('leaveRequests', { page: 1, pageSize: 200 });
  const leaveRequests = leaveRequestsData?.items || [];
  const { data: payrollRunsData } = useResourceList('payrollRuns', { page: 1, pageSize: 200 });
  const payrollRuns = payrollRunsData?.items || [];

  const employee = employeeQuery.data;

  useEffect(() => {
    if (employee) {
      setStatusValue(employee.status || 'Active');
    }
  }, [employee]);

  useEffect(() => {
    if (!employee) {
      setDocumentUploads([]);
      return;
    }
    const uploads = uploadService.getUploads('employees');
    setDocumentUploads(uploads.filter((item) => item.employeeId === employee.id));
  }, [employee]);

  const recentDocuments = useMemo(
    () => [...documentUploads].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
    [documentUploads],
  );

  const employeeLeaveSummary = useMemo(() => {
    const employeeRequests = leaveRequests.filter((request) => request.employeeId === employee?.id || request.employeeName === employee?.name);
    return {
      approved: employeeRequests.filter((request) => request.status === 'Approved').reduce((sum, request) => sum + Number(request.days || 0), 0),
      pending: employeeRequests.filter((request) => ['Submitted', 'Manager Review', 'HR Review'].includes(request.status)).reduce((sum, request) => sum + Number(request.days || 0), 0),
      total: employeeRequests.reduce((sum, request) => sum + Number(request.days || 0), 0),
    };
  }, [leaveRequests, employee]);

  const employeePayrollSummary = useMemo(() => {
    const employeeRuns = payrollRuns.filter((run) => run.employeeId === employee?.id || run.employeeName === employee?.name);
    return {
      latestNet: employeeRuns.reduce((latest, run) => (Number(run.netSalary || 0) > Number(latest || 0) ? Number(run.netSalary || 0) : Number(latest || 0)), 0),
      processed: employeeRuns.filter((run) => run.status === 'Processed').length,
    };
  }, [payrollRuns, employee]);

  const handleDocumentUploadClick = (type) => {
    if (!employee) return;
    setPendingDocumentType(type);
    uploadInputRef.current?.click();
  };

  const handleDocumentInputChange = async (event) => {
    const file = event.target.files?.[0];
    const documentType = pendingDocumentType;
    setPendingDocumentType('');
    if (!file || !employee || !documentType) {
      if (event.target) event.target.value = '';
      return;
    }

    setIsUploading(true);
    setUploadStatus(`Uploading ${documentType}…`);

    try {
      const formData = new FormData();
      formData.append('employeeId', employee.id);
      formData.append('documentType', documentType);
      formData.append('file', file);
      await uploadService.upload('employees', formData);
      const uploads = uploadService.getUploads('employees');
      setDocumentUploads(uploads.filter((item) => item.employeeId === employee.id));
      setUploadStatus(`${documentType} uploaded successfully.`);
      queryClient.invalidateQueries(['employees']);
    } catch (error) {
      setUploadStatus(`Failed to upload ${documentType}.`);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleDownloadDocument = async (upload) => {
    try {
      const blob = await uploadService.downloadUpload('employees', upload.id);
      downloadBlob(blob, upload.filename || 'employee-document.txt');
    } catch {
      setUploadStatus('Unable to download document.');
    }
  };

  const handleRemoveDocument = (upload) => {
    if (!window.confirm(`Delete document ${upload.filename}?`)) return;
    uploadService.deleteUpload('employees', upload.id);
    setDocumentUploads((current) => current.filter((item) => item.id !== upload.id));
    setUploadStatus('Document removed.');
  };

  const handleStatusUpdate = () => {
    if (!employee) return;
    updateEmployee.mutate(
      { id: employee.id, payload: { ...employee, status: statusValue } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['employees']);
          setIsStatusModalOpen(false);
        },
      },
    );
  };

  if (employeeQuery.isLoading) {
    return <div className="p-6">Loading employee profile…</div>;
  }

  if (employeeQuery.isError || !employee) {
    return <div className="p-6 text-red-600">Employee not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Employee profile"
        subtitle={`Detailed employee lifecycle record for ${employee.name}.`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              className="rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Update status
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => uploadInputRef.current?.click()}
              className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isUploading ? 'Uploading…' : 'Upload document'}
            </button>
          </div>
        }
      />

      <input ref={uploadInputRef} type="file" accept=".pdf,.jpg,.png,.jpeg,.doc,.docx" className="hidden" onChange={handleDocumentInputChange} />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{employee.name}</h1>
                <p className="mt-2 text-sm text-slate-600">Employee ID: {employee.id}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={employee.status || 'Active'} />
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{employee.designation || 'Staff'}</div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Department</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{employee.department || 'N/A'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Joining date</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{employee.joinDate || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
              <p className="mt-3 text-sm text-slate-900">{employee.email || 'N/A'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Salary</p>
              <p className="mt-3 text-sm text-slate-900">{employee.salary || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['overview', 'personal', 'employment', 'documents', 'activity'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                activeTab === tab ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab === 'overview'
                ? 'Overview'
                : tab === 'personal'
                ? 'Personal Info'
                : tab === 'employment'
                ? 'Employment'
                : tab === 'documents'
                ? 'Documents'
                : 'Activity'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Employee overview</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Name:</span> {employee.name}</p>
                <p><span className="font-semibold text-slate-900">Email:</span> {employee.email}</p>
                <p><span className="font-semibold text-slate-900">Department:</span> {employee.department || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Designation:</span> {employee.designation || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Status:</span> {employee.status || 'N/A'}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Leave & payroll summary</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Approved leave</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">{employeeLeaveSummary.approved}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pending leave</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">{employeeLeaveSummary.pending}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Latest net salary</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">₹{employeePayrollSummary.latestNet.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Contact details</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Email:</span> {employee.email || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Phone:</span> {employee.phone || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Location:</span> {employee.location || 'N/A'}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Work details</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Department:</span> {employee.department || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Designation:</span> {employee.designation || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Shift:</span> {employee.shift || 'Day'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Employment history</h2>
              <p className="mt-4 text-sm text-slate-600">Current role and joining details are captured here. Use the status action to keep lifecycle updates aligned with HR operations.</p>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Status:</span> {employee.status || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Joined:</span> {employee.joinDate || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Employment type:</span> {employee.employmentType || 'Full time'}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Current assignment</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Department:</span> {employee.department || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Designation:</span> {employee.designation || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Manager:</span> {employee.manager || 'TBD'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Upload employee documents</h2>
              <p className="mt-3 text-sm text-slate-600">Capture onboarding and compliance documents for this employee.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {documentTypes.map((doc) => (
                  <button
                    key={doc.key}
                    type="button"
                    onClick={() => handleDocumentUploadClick(doc.key)}
                    className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-slate-400"
                  >
                    <p className="font-semibold text-slate-900">{doc.label}</p>
                    <p className="mt-1 text-xs text-slate-500">Upload or replace the document.</p>
                  </button>
                ))}
              </div>
              {uploadStatus && <p className="mt-4 text-sm text-slate-600">{uploadStatus}</p>}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Uploaded documents</h2>
              <div className="mt-4 space-y-3">
                {recentDocuments.length ? (
                  recentDocuments.map((upload) => (
                    <div key={upload.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{upload.documentType || 'Document'}</p>
                          <p className="mt-1 text-sm text-slate-600">{upload.filename}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadDocument(upload)}
                            className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-200"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(upload)}
                            className="rounded-full border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-600 transition hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Uploaded on {new Date(upload.uploadedAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Lifecycle activity</h2>
              <p className="mt-3 text-sm text-slate-600">Recent updates are tracked using HR and audit event history.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>Profile created</span>
                  <span>{employee.joinDate || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>Status</span>
                  <span>{employee.status || 'Active'}</span>
                </div>
                <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>Last document upload</span>
                  <span>{recentDocuments[0]?.uploadedAt ? new Date(recentDocuments[0].uploadedAt).toLocaleDateString() : 'No uploads'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Update employee status"
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleStatusUpdate}
            className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Save status
          </button>
        }
      >
        <form className="space-y-4">
          <FormField label="Employee status">
            <select
              value={statusValue}
              onChange={(event) => setStatusValue(event.target.value)}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-400"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
