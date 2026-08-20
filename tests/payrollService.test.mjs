import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePayrollBreakdown } from '../src/services/payrollService.js';

test('calculatePayrollBreakdown computes gross and net salary from structure and deductions', () => {
  const breakdown = calculatePayrollBreakdown({
    salaryStructure: {
      basicSalary: 50000,
      hraPercent: 20,
      daPercent: 5,
      specialAllowancePercent: 10,
      overtimeRate: 1000,
      providentFundPercent: 12,
      esiPercent: 0.75,
      professionalTaxAmount: 200,
      incomeTaxPercent: 5,
    },
    attendanceDays: 30,
    approvedLeaveDays: 1,
    overtimeHours: 2,
    bonusAmount: 2000,
    incentiveAmount: 1000,
    frequency: 'Monthly',
  });

  assert.equal(breakdown.basic, 48333.33);
  assert.equal(breakdown.hra, 9666.67);
  assert.equal(breakdown.da, 2416.67);
  assert.equal(breakdown.specialAllowance, 4833.33);
  assert.equal(breakdown.overtime, 2000);
  assert.equal(breakdown.leaveDeduction, 1666.67);
  assert.equal(breakdown.providentFund, 5800);
  assert.equal(Number(breakdown.netSalary.toFixed(2)), 58543.95);
});

test('calculatePayrollBreakdown applies payroll settings to configured working days and deductions', () => {
  const breakdown = calculatePayrollBreakdown({
    salaryStructure: { basicSalary: 26000, providentFundPercent: 12, esiPercent: 0.75, professionalTaxAmount: 200, incomeTaxPercent: 0 },
    attendanceDays: 26,
    frequency: 'Monthly',
    payrollSettings: { workingDays: '26', overtimeEnabled: false, bonusEnabled: false, pfEnabled: false, esiEnabled: false, professionalTaxEnabled: false },
    overtimeHours: 10,
    bonusAmount: 5000,
  });

  assert.equal(breakdown.payableDays, 26);
  assert.equal(breakdown.grossEarnings, 26000);
  assert.equal(breakdown.totalDeductions, 0);
  assert.equal(breakdown.netSalary, 26000);
});
