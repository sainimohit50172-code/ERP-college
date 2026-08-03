import test from 'node:test';
import assert from 'node:assert/strict';
import { getRetryDelay, shouldSuppressStartupToast, setBackendHealthState, waitForBackendHealth, resetStartupGate } from './startupReadiness.js';

test('suppresses startup toasts while the backend is still warming up', () => {
  setBackendHealthState({ ready: false, startupWindow: true });
  const error = { response: { status: 502 } };
  assert.equal(shouldSuppressStartupToast(error, { _suppressStartupErrors: true }), true);
  assert.equal(shouldSuppressStartupToast(error, { _suppressStartupErrors: false }), false);
});

test('does not suppress later errors after the backend becomes ready', () => {
  setBackendHealthState({ ready: true, startupWindow: false });
  const error = { response: { status: 500 } };
  assert.equal(shouldSuppressStartupToast(error, { _suppressStartupErrors: false }), false);
});

test('uses a fixed one-second delay for health retries', () => {
  assert.equal(getRetryDelay(0), 1000);
  assert.equal(getRetryDelay(1), 1000);
  assert.equal(getRetryDelay(2), 1000);
});

test('stops polling after a 404 health check response', async () => {
  resetStartupGate();
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    return { ok: false, status: 404 };
  };

  const result = await waitForBackendHealth({ endpoint: '/api/health', timeoutMs: 10000, retryDelayMs: 1, maxAttempts: 5 });
  assert.equal(result, false);
  assert.equal(calls, 1);

  delete global.fetch;
});

test('uses a single development health probe before giving up', async () => {
  resetStartupGate();
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    throw new Error('ECONNREFUSED');
  };

  const result = await waitForBackendHealth({ endpoint: '/api/health', timeoutMs: 10000, retryDelayMs: 1, maxAttempts: 5 });
  assert.equal(result, false);
  assert.equal(calls, 1);

  delete global.fetch;
});
