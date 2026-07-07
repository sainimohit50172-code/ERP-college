import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardSummary } from '../src/utils/dashboardStats.js';

test('buildDashboardSummary derives key KPIs and operational summaries', () => {
  const summary = buildDashboardSummary({
    students: [{ id: 1 }, { id: 2 }],
    teachers: [{ id: 1 }],
    employees: [{ id: 1 }, { id: 2 }, { id: 3 }],
    leads: [{ id: 1, status: 'Admission Confirmed' }, { id: 2, status: 'Lead' }],
    feePayments: [{ amount: 150 }, { amount: 75, method: 'Online' }],
    attendance: [{ status: 'Present' }, { status: 'Absent' }],
    leaveRequests: [{ status: 'Submitted', days: 3 }, { status: 'Approved', days: 1 }],
    holidays: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    payrollRuns: [{ status: 'Draft', netSalary: 1000 }, { status: 'Review', netSalary: 500 }],
    financeEntries: [{ status: 'Draft', debit: 100, credit: 50 }, { status: 'Posted', debit: 200, credit: 80 }],
  });

  const studentsKpi = summary.kpis.find((item) => item.label === 'Students');
  const revenueKpi = summary.kpis.find((item) => item.label === 'Revenue');

  assert.equal(studentsKpi.value, '2');
  assert.equal(revenueKpi.value, '$225');
  assert.equal(summary.attendancePercent, '50.0');
  assert.equal(summary.leave.pendingApprovals, 1);
  assert.equal(summary.leave.upcomingHolidays, 4);
  assert.equal(summary.payroll.due, 1);
  assert.equal(summary.payroll.pendingApprovals, 1);
  assert.equal(summary.finance.pendingEntries, 1);
});
