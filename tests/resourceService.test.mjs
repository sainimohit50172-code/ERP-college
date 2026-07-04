import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiListResponse, mapStudentPayload, mapStudentRecord } from '../src/api/resourceService.js';

test('normalizes paginated student responses into the UI shape', () => {
  const normalized = normalizeApiListResponse(
    {
      success: true,
      data: {
        items: [{ id: 1, admission_number: 'ADM-001', first_name: 'Jane', last_name: 'Doe', status: 'Active', contact: { email: 'jane@example.com' } }],
        total: 1,
        page: 1,
        page_size: 10,
        pages: 1,
      },
    },
    { page: 1, pageSize: 10 },
  );

  assert.equal(normalized.total, 1);
  assert.equal(normalized.items[0].name, 'Jane Doe');
  assert.equal(normalized.items[0].admissionNo, 'ADM-001');
  assert.equal(normalized.items[0].email, 'jane@example.com');
});

test('maps frontend student payloads to the backend student schema', () => {
  const payload = mapStudentPayload({ name: 'Jane Doe', email: 'jane@example.com', admissionNo: 'ADM-001', status: 'Active' });

  assert.deepEqual(payload, {
    admission_number: 'ADM-001',
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    phone: null,
    date_of_birth: null,
    gender: null,
    status: 'Active',
  });
});

test('normalizes wrapped list responses for non-student resources', () => {
  const normalized = normalizeApiListResponse({
    success: true,
    data: {
      items: [{ id: 7, name: 'Finance', status: 'Active' }],
      total: 1,
      page: 1,
      page_size: 10,
      pages: 1,
    },
  }, { page: 1, pageSize: 10 });

  assert.equal(normalized.total, 1);
  assert.equal(normalized.items[0].name, 'Finance');
  assert.equal(normalized.page, 1);
  assert.equal(normalized.pages, 1);
});

test('maps backend student records back to the UI shape', () => {
  const record = mapStudentRecord({ id: 2, admission_number: 'ADM-002', first_name: 'John', last_name: 'Smith', contact: { email: 'john@example.com', phone: '999' }, status: 'Pending' });

  assert.equal(record.name, 'John Smith');
  assert.equal(record.admissionNo, 'ADM-002');
  assert.equal(record.email, 'john@example.com');
  assert.equal(record.phone, '999');
});
