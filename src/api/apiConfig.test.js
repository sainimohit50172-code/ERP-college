import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from './apiConfig.js';

test('prefers Vite API base URL from env when provided', () => {
  const baseUrl = resolveApiBaseUrl({ VITE_API_BASE_URL: 'http://127.0.0.1:8000/api' });
  assert.equal(baseUrl, 'http://127.0.0.1:8000/api');
});

test('falls back to /api when no explicit env is provided', () => {
  const baseUrl = resolveApiBaseUrl({});
  assert.equal(baseUrl, '/api');
});
