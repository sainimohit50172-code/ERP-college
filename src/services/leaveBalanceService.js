const calculateLeaveBalanceSnapshot = ({ annualAllocation = 0, used = 0, pendingApproval = 0, carryForward = 0, expiredBalance = 0 }) => ({
  totalAllocation: Number(annualAllocation) || 0,
  used: Number(used) || 0,
  pendingApproval: Number(pendingApproval) || 0,
  availableBalance: Math.max(0, (Number(annualAllocation) || 0) + (Number(carryForward) || 0) - (Number(used) || 0) - (Number(pendingApproval) || 0)),
  carryForward: Number(carryForward) || 0,
  expiredBalance: Number(expiredBalance) || 0,
});

export function calculateLeaveBalanceSnapshotForEmployee(employeeLeaveState = {}) {
  return calculateLeaveBalanceSnapshot(employeeLeaveState);
}

export function buildLeaveBalanceSummary(balances = []) {
  return balances.reduce((acc, balance) => {
    acc.totalAllocation += Number(balance.totalAllocation || 0);
    acc.used += Number(balance.used || 0);
    acc.pendingApproval += Number(balance.pendingApproval || 0);
    acc.availableBalance += Number(balance.availableBalance || 0);
    acc.carryForward += Number(balance.carryForward || 0);
    acc.expiredBalance += Number(balance.expiredBalance || 0);
    return acc;
  }, {
    totalAllocation: 0,
    used: 0,
    pendingApproval: 0,
    availableBalance: 0,
    carryForward: 0,
    expiredBalance: 0,
  });
}

export { calculateLeaveBalanceSnapshot };
export default calculateLeaveBalanceSnapshot;
