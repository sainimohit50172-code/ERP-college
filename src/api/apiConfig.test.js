import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from './apiConfig.js';
import { normalizeApiUrl } from './axios.js';

test('preserves an explicit remote API base URL for non-local backends', () => {
  const baseUrl = resolveApiBaseUrl({ VITE_API_BASE_URL: 'https://api.example.com/v1' });
  assert.equal(baseUrl, 'https://api.example.com/v1');
});

test('falls back to /api/v1 when local backend origins are used', () => {
  const baseUrl = resolveApiBaseUrl({ VITE_API_BASE_URL: 'http://127.0.0.1:8001/api' });
  assert.equal(baseUrl, '/api/v1');
});

test('falls back to /api/v1 when Vite localhost origins are used', () => {
  const baseUrl = resolveApiBaseUrl({ VITE_API_BASE_URL: 'http://127.0.0.1:3000' });
  assert.equal(baseUrl, '/api/v1');
});

test('falls back to /api/v1 when no explicit env is provided', () => {
  const baseUrl = resolveApiBaseUrl({});
  assert.equal(baseUrl, '/api/v1');
});

test('uses a safe relative API fallback in production when no API base URL is provided', () => {
  const baseUrl = resolveApiBaseUrl({ NODE_ENV: 'production' });
  assert.equal(baseUrl, '/api/v1');
});

test('prefixes slash-based request paths with the configured API base URL', () => {
  const requestUrl = normalizeApiUrl({ url: '/auth/login', baseURL: '/api/v1' });
  assert.equal(requestUrl, '/api/v1/auth/login');
});