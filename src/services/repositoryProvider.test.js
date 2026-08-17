import test from 'node:test';
import assert from 'node:assert/strict';

const storage = {};
globalThis.localStorage = {
  getItem: (key) => (key in storage ? storage[key] : null),
  setItem: (key, value) => {
    storage[key] = String(value);
  },
  removeItem: (key) => {
    delete storage[key];
  },
};

const { getRepository } = await import('./repositoryProvider.js');
const mockRepos = (await import('./repositories/mock/index.js')).default;

test('payroll resources use the mock repository fallback when the backend is set to fastapi', async () => {
  storage.REPO_BACKEND = 'fastapi';

  assert.ok(mockRepos.salaryStructures, 'salaryStructures mock repo should exist');
  assert.equal(getRepository('salaryStructures'), mockRepos.salaryStructures);
  assert.equal(getRepository('payrollRuns'), mockRepos.payrollRuns);
  assert.equal(getRepository('payslips'), mockRepos.payslips);
  assert.equal(getRepository('taxComponents'), mockRepos.taxComponents);
  assert.equal(getRepository('salaryRevisions'), mockRepos.salaryRevisions);

  const created = await mockRepos.payrollRuns.create({
    employeeName: 'Demo Employee',
    employeeId: 'EMP-DEMO-001',
    period: '2026-09',
    status: 'Draft',
    grossSalary: 50000,
    netSalary: 42000,
  });

  const updated = await mockRepos.payrollRuns.update(created.id, {
    ...created,
    status: 'Processed',
    netSalary: 43000,
  });

  const listResult = await mockRepos.payrollRuns.list({ page: 1, pageSize: 20 });

  assert.equal(created.employeeName, 'Demo Employee');
  assert.equal(updated.status, 'Processed');
  assert.ok(listResult.items.some((item) => String(item.id) === String(created.id)));
});
