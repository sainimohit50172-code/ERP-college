import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from './apiConfig.js';

test('preserves an explicit remote API base URL for non-local backends', () => {
  const baseUrl = resolveApiBaseUrl({ VITE_API_BASE_URL: 'https://api.example.com/v1' });
  assert.equal(baseUrl, 'https://api.example.com/v1');
});

test('falls back to /api when local backend origins are used', () => {
  const baseUrl = resolveApiBaseUrl({ VITE_API_BASE_URL: 'http://127.0.0.1:8001/api' });
  assert.equal(baseUrl, '/api');
});

test('falls back to /api when Vite localhost origins are used', () => {
  const baseUrl = resolveApiBaseUrl({ VITE_API_BASE_URL: 'http://127.0.0.1:3000' });
  assert.equal(baseUrl, '/api');
});

test('falls back to /api when no explicit env is provided', () => {
  const baseUrl = resolveApiBaseUrl({});
  assert.equal(baseUrl, '/api');
});
