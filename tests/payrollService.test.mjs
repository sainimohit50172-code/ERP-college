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

  assert.equal(breakdown.basic, 50000);
  assert.equal(breakdown.hra, 10000);
  assert.equal(breakdown.da, 2500);
  assert.equal(breakdown.specialAllowance, 5000);
  assert.equal(breakdown.overtime, 2000);
  assert.equal(breakdown.leaveDeduction, 1666.67);
  assert.equal(breakdown.providentFund, 6000);
  assert.equal(Number(breakdown.netSalary.toFixed(2)), 60464.58);
});
