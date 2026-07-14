import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStudentProfile } from '../services/studentProfileService.js';
import { getWorkflowHistory, getWorkflowStatuses, addWorkflowEvent, getLatestStatus } from '../services/admissionWorkflowService.js';
import { getTimeline, addTimelineEvent } from '../services/timelineService.js';
import WorkflowStepper from '../components/ui/WorkflowStepper.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import MemberLibraryTab from '../components/library/MemberLibraryTab.jsx';
import StudentHostelTab from '../components/hostel/StudentHostelTab.jsx';

const tabDefinitions = [
  { key: 'overview', label: 'Overview' },
  { key: 'personal', label: 'Personal Info' },
  { key: 'parents', label: 'Parents & Guardian' },
  { key: 'academic', label: 'Academic Details' },
  { key: 'documents', label: 'Documents' },
  { key: 'timeline', label: 'Activity Timeline' },
  { key: 'workflow', label: 'Admission Workflow' },
  { key: 'library', label: 'Library' },
  { key: 'hostel', label: 'Hostel' },
];

function renderTabContent(student, activeTab, workflowHistory, timeline) {
  switch (activeTab) {
    case 'personal':
      return (
        <div className="responsive-card-grid gap-4">
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <p className="mt-2 text-sm text-slate-600">Email: {student.email || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Phone: {student.phone || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Address: {student.address || 'N/A'}</p>
          </div>
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Personal Details</h3>
            <p className="mt-2 text-sm text-slate-600">Date of Birth: {student.dob || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Gender: {student.gender || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Nationality: {student.nationality || 'N/A'}</p>
          </div>
        </div>
      );
    case 'parents':
      return (
        <div className="responsive-card-grid gap-4">
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Father</h3>
            <p className="mt-2 text-sm text-slate-600">Name: {student.fatherName || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Occupation: {student.fatherOccupation || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Phone: {student.fatherPhone || 'N/A'}</p>
          </div>
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Mother</h3>
            <p className="mt-2 text-sm text-slate-600">Name: {student.motherName || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Occupation: {student.motherOccupation || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Phone: {student.motherPhone || 'N/A'}</p>
          </div>
        </div>
      );
    case 'academic':
      return (
        <div className="space-y-4">
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Program</h3>
            <p className="mt-2 text-sm text-slate-600">Course: {student.course || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Department: {student.department || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Batch: {student.batch || 'N/A'}</p>
          </div>
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Academic Summary</h3>
            <p className="mt-2 text-sm text-slate-600">Admission Year: {student.admissionYear || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">GPA: {student.gpa || 'N/A'}</p>
            <p className="mt-1 text-sm text-slate-600">Scholarship: {student.scholarship || 'N/A'}</p>
          </div>
        </div>
      );
    case 'documents':
      return (
        <div className="space-y-4">
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Enrollment Documents</h3>
            <p className="mt-2 text-sm text-slate-600">Passport / ID: {student.documentPassport ? 'Received' : 'Pending'}</p>
            <p className="mt-1 text-sm text-slate-600">Transcripts: {student.documentTranscript ? 'Received' : 'Pending'}</p>
            <p className="mt-1 text-sm text-slate-600">Photo: {student.documentPhoto ? 'Received' : 'Pending'}</p>
          </div>
        </div>
      );
    case 'timeline':
      return (
        <div className="space-y-3">
          {timeline.length ? (
            timeline.map((event) => (
              <div key={event.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{event.category}</span>
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <h4 className="mt-2 text-base font-semibold text-slate-900">{event.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{event.description}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No timeline events have been recorded yet.
            </div>
          )}
        </div>
      );
    case 'workflow':
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Workflow History</h3>
            <div className="mt-4 space-y-3">
              {workflowHistory.length ? (
                workflowHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                      <span>{entry.status}</span>
                      <span>{new Date(entry.changedAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{entry.remarks || 'No remarks'}</p>
                    <p className="mt-1 text-xs text-slate-500">By {entry.changedBy}</p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No workflow history available.</div>
              )}
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="responsive-card-grid gap-4">
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Profile Summary</h3>
            <p className="mt-2 text-sm text-slate-600">Name: {student.name}</p>
            <p className="mt-1 text-sm text-slate-600">Student ID: {student.id}</p>
            <p className="mt-1 text-sm text-slate-600">Course: {student.course || 'N/A'}</p>
          </div>
          <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Status</h3>
            <div className="mt-2">
              <StatusBadge status={getLatestStatus(student.id)} />
            </div>
          </div>
        </div>
      );
  }
}

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [workflowRemarks, setWorkflowRemarks] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('Submitted');
  const queryClient = useQueryClient();

  const studentQuery = useQuery({
    queryKey: ['studentProfile', studentId],
    queryFn: () => getStudentProfile(studentId),
    enabled: Boolean(studentId),
  });

  const workflowHistory = useMemo(() => getWorkflowHistory(studentId), [studentId, studentQuery.data]);
  const timeline = useMemo(() => getTimeline(studentId), [studentId, studentQuery.data]);
  const statuses = useMemo(() => getWorkflowStatuses(), []);
  const currentStatus = useMemo(() => getLatestStatus(studentId), [studentId, studentQuery.data]);

  if (studentQuery.isLoading) {
    return <div className="p-6">Loading student profile...</div>;
  }

  if (studentQuery.isError || !studentQuery.data) {
    return <div className="p-6 text-red-600">Student not found.</div>;
  }

  const student = studentQuery.data;

  const handleStatusUpdate = async () => {
    addWorkflowEvent(studentId, {
      status: workflowStatus,
      remarks: workflowRemarks,
      changedBy: 'Admin',
    });
    addTimelineEvent(studentId, {
      title: `Status changed to ${workflowStatus}`,
      description: workflowRemarks || 'Updated admission workflow status.',
      category: 'Workflow',
    });
    queryClient.invalidateQueries(['studentProfile', studentId]);
  };

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Student Profile</h1>
            <p className="mt-2 text-sm text-slate-600">Manage admissions, documents, timeline, and workflow for {student.name}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={currentStatus} />
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">ID: {student.id}</div>
          </div>
        </div>

        <div className="mt-6">
          <WorkflowStepper statuses={statuses} currentStatus={currentStatus} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap gap-2">
          {tabDefinitions.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${activeTab === tab.key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        {activeTab === 'library' ? (
          <MemberLibraryTab memberId={student.id} memberType="student" />
        ) : activeTab === 'hostel' ? (
          <StudentHostelTab studentId={student.id} />
        ) : (
          renderTabContent(student, activeTab, workflowHistory, timeline)
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Update Admission Workflow</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr,260px]">
          <div>
            <label className="block text-sm font-medium text-slate-700">Next status</label>
            <select
              value={workflowStatus}
              onChange={(event) => setWorkflowStatus(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
            >
              {statuses.map((status) => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Remarks</label>
            <textarea
              value={workflowRemarks}
              onChange={(event) => setWorkflowRemarks(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
              placeholder="Add a note for this transition"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleStatusUpdate}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
          >
            Save Workflow Update
          </button>
        </div>
      </div>
    </div>
  );
}
