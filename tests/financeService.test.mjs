import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTrialBalance } from '../src/services/financeService.js';
import { generateVoucherNumber } from '../src/services/voucherService.js';

test('calculateTrialBalance aggregates debit and credit entries', () => {
  const balances = calculateTrialBalance(
    [
      { id: 'cash', name: 'Cash', type: 'Assets' },
      { id: 'capital', name: 'Capital', type: 'Equity' },
    ],
    [
      { accountId: 'cash', debit: 10000, credit: 0 },
      { accountId: 'capital', debit: 0, credit: 10000 },
    ],
  );

  assert.equal(balances[0].balance, 10000);
  assert.equal(balances[1].balance, -10000);
});

test('generateVoucherNumber creates a dated voucher sequence', () => {
  const voucherNumber = generateVoucherNumber('RV', '2026-06-30', 12);
  assert.equal(voucherNumber, 'RV-20260630-000012');
});
