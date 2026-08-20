export const payrollSettingsDefaults = {
  frequency: 'Monthly',
  periodStart: '1',
  cutoffDay: '25',
  paymentDay: 'Last working day',
  workingDays: '26',
  attendanceSource: 'Attendance register',
  overtimeEnabled: true,
  bonusEnabled: true,
  pfEnabled: true,
  esiEnabled: true,
  professionalTaxEnabled: true,
  approvalRequired: true,
  approvalLevel: 'HR and Finance',
  status: 'Active',
};

export const payrollSettingsStorageKey = 'erp:payroll-settings';

export function loadPayrollSettings() {
  if (typeof window === 'undefined') return { ...payrollSettingsDefaults };
  try {
    return { ...payrollSettingsDefaults, ...JSON.parse(window.localStorage.getItem(payrollSettingsStorageKey) || '{}') };
  } catch {
    return { ...payrollSettingsDefaults };
  }
}