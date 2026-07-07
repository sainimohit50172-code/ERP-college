export function buildDashboardSummary(payload = {}) {
  const students = Array.isArray(payload.students) ? payload.students : [];
  const teachers = Array.isArray(payload.teachers) ? payload.teachers : [];
  const employees = Array.isArray(payload.employees) ? payload.employees : [];
  const leads = Array.isArray(payload.leads) ? payload.leads : [];
  const feePayments = Array.isArray(payload.feePayments) ? payload.feePayments : [];
  const attendance = Array.isArray(payload.attendance) ? payload.attendance : [];
  const leaveRequests = Array.isArray(payload.leaveRequests) ? payload.leaveRequests : [];
  const holidays = Array.isArray(payload.holidays) ? payload.holidays : [];
  const payrollRuns = Array.isArray(payload.payrollRuns) ? payload.payrollRuns : [];
  const financeEntries = Array.isArray(payload.financeEntries) ? payload.financeEntries : [];

  const attendancePercent = attendance.length
    ? ((attendance.filter((entry) => entry.status === 'Present').length / attendance.length) * 100).toFixed(1)
    : '0.0';

  const collectionAmount = feePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const kpis = [
    { label: 'Students', value: students.length.toLocaleString(), icon: 'Users', delta: '+6.8%' },
    { label: 'Teachers', value: teachers.length.toLocaleString(), icon: 'BookOpen', delta: '+3.1%' },
    { label: 'Employees', value: employees.length.toLocaleString(), icon: 'Briefcase', delta: '+4.2%' },
    { label: 'Admissions', value: leads.filter((lead) => lead.status === 'Admission Confirmed').length.toLocaleString(), icon: 'GraduationCap', delta: '+8.9%' },
    { label: 'Revenue', value: `$${collectionAmount.toLocaleString()}`, icon: 'DollarSign', delta: '+12.4%' },
    { label: 'Attendance', value: `${attendancePercent}%`, icon: 'Gauge', delta: '+1.6%' },
  ];

  const kpiHighlights = [
    { title: 'Lead funnel', value: leads.length.toLocaleString(), accent: 'bg-emerald-50 text-emerald-700' },
    { title: 'Fee collection', value: `$${collectionAmount.toLocaleString()}`, accent: 'bg-slate-50 text-slate-900' },
    { title: 'Online payments', value: `${feePayments.filter((payment) => payment.method === 'Online').length}`, accent: 'bg-cyan-50 text-cyan-700' },
  ];

  const leave = {
    pendingApprovals: leaveRequests.filter((request) => ['Submitted', 'Manager Review', 'HR Review'].includes(request.status)).length,
    upcomingHolidays: holidays.length,
    lowBalanceAlerts: leaveRequests.filter((request) => Number(request.days || 0) >= 3).length,
  };

  const payroll = {
    due: payrollRuns.filter((item) => item.status === 'Draft').length,
    pendingApprovals: payrollRuns.filter((item) => ['Review', 'HR Approval', 'Finance Approval'].includes(item.status)).length,
    salaryExpense: payrollRuns.reduce((sum, item) => sum + Number(item.netSalary || 0), 0),
  };

  const finance = {
    pendingEntries: financeEntries.filter((entry) => entry.status !== 'Posted').length,
    totalDebit: financeEntries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0),
    totalCredit: financeEntries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0),
  };

  return {
    attendancePercent,
    collectionAmount,
    kpis,
    kpiHighlights,
    leave,
    payroll,
    finance,
  };
}
