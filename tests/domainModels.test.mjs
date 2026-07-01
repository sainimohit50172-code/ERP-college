import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAcademicContext, normalizeEntityPayload } from '../src/utils/domainModels.js';

test('normalizeAcademicContext uses explicit academic context values', () => {
  const result = normalizeAcademicContext(
    { academicYear: '2024-25', campus: 'North Campus', departmentId: 'DEPT-ME', courseId: 'COURSE-ME', semesterId: 'SEM-ME-1' },
    { academicYear: '2025-26', campus: 'Main Campus', departmentId: 'DEPT-CS', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1' },
  );

  assert.equal(result.academicYear, '2024-25');
  assert.equal(result.campus, 'North Campus');
  assert.equal(result.departmentId, 'DEPT-ME');
  assert.equal(result.courseId, 'COURSE-ME');
  assert.equal(result.semesterId, 'SEM-ME-1');
});

test('normalizeEntityPayload stamps deterministic metadata for new records', () => {
  const result = normalizeEntityPayload({ name: 'Scholarship', metadata: { source: 'fees' } }, { fallbackId: 'record-1' });

  assert.equal(result.id, 'record-1');
  assert.ok(result.createdAt);
  assert.ok(result.updatedAt);
  assert.deepEqual(result.metadata, { source: 'fees' });
});
