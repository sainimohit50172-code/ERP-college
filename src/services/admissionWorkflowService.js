import { recordAuditEvent } from './auditService.js';

const WORKFLOW_STORAGE_KEY = 'admissionWorkflowHistory';

const initialStatuses = [
  { key: 'Draft', label: 'Draft' },
  { key: 'Submitted', label: 'Submitted' },
  { key: 'Verified', label: 'Verified' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Rejected', label: 'Rejected' },
  { key: 'Enrolled', label: 'Enrolled' },
];

const readWorkflowHistory = () => {
  const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
};

const writeWorkflowHistory = (payload) => {
  localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(payload));
};

export function getWorkflowHistory(studentId) {
  const allHistory = readWorkflowHistory();
  return allHistory[studentId] || [];
}

export function addWorkflowEvent(studentId, event) {
  const allHistory = readWorkflowHistory();
  const studentHistory = allHistory[studentId] || [];
  const nextHistory = [...studentHistory, {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    status: event.status,
    remarks: event.remarks || '',
    changedBy: event.changedBy || 'System',
    changedAt: new Date().toISOString(),
  }];
  writeWorkflowHistory({ ...allHistory, [studentId]: nextHistory });
  recordAuditEvent({
    action: 'Update',
    moduleKey: 'admissions',
    description: `Admission status changed to ${event.status}`,
    resourceId: studentId,
    metadata: {
      eventType: 'workflow_update',
      entityType: 'student',
    },
  });
  return nextHistory;
}

export function getWorkflowStatuses() {
  return initialStatuses;
}

export function getLatestStatus(studentId) {
  const history = getWorkflowHistory(studentId);
  return history.length ? history[history.length - 1].status : 'Draft';
}
