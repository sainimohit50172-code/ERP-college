import { describe, expect, it } from 'vitest';
import { redactSensitiveFields } from './axios.js';

describe('axios security logging helpers', () => {
  it('redacts password-related fields before logging', () => {
    const payload = {
      email: 'user@example.com',
      password: 'super-secret',
      confirmPassword: 'super-secret',
      token: 'abc-123',
      otp: '123456',
      nested: { secret: 'hidden', password: 'nested-pass' },
    };

    const redacted = redactSensitiveFields(payload);

    expect(redacted.email).toBe('user@example.com');
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.confirmPassword).toBe('[REDACTED]');
    expect(redacted.token).toBe('[REDACTED]');
    expect(redacted.otp).toBe('[REDACTED]');
    expect(redacted.nested.secret).toBe('[REDACTED]');
    expect(redacted.nested.password).toBe('[REDACTED]');
  });
});
