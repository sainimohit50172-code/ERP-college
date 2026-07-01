import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLeaveBalanceSnapshot } from '../src/services/leaveBalanceService.js';

test('calculateLeaveBalanceSnapshot returns available and carry-forward values', () => {
  const snapshot = calculateLeaveBalanceSnapshot({
    annualAllocation: 18,
    used: 7,
    pendingApproval: 2,
    carryForward: 3,
    expiredBalance: 1,
  });

  assert.equal(snapshot.totalAllocation, 18);
  assert.equal(snapshot.used, 7);
  assert.equal(snapshot.pendingApproval, 2);
  assert.equal(snapshot.availableBalance, 9);
  assert.equal(snapshot.carryForward, 3);
  assert.equal(snapshot.expiredBalance, 1);
});
