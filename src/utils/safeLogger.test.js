import { describe, expect, it, vi } from 'vitest';
import { redact, safeLog } from './safeLogger.js';

describe('safeLogger', () => {
  it('redacts nested sensitive fields without mutating the original object', () => {
    const payload = {
      email: 'user@example.com',
      user: {
        password: 'super-secret',
        profile: { accessToken: 'abc-123' },
      },
      items: [
        { otp: '111111' },
        { name: 'keep-me' },
      ],
    };

    const redacted = redact(payload);

    expect(redacted).not.toBe(payload);
    expect(redacted.email).toBe('user@example.com');
    expect(redacted.user.password).toBe('***REDACTED***');
    expect(redacted.user.profile.accessToken).toBe('***REDACTED***');
    expect(redacted.items[0].otp).toBe('***REDACTED***');
    expect(payload.user.password).toBe('super-secret');
  });

  it('logs only in development mode and redacts object arguments', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const originalEnv = import.meta.env.DEV;
    import.meta.env.DEV = true;

    safeLog.log('request', { password: 'secret', nested: { refreshToken: 'abc' } });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const logged = logSpy.mock.calls[0][1];
    expect(logged.password).toBe('***REDACTED***');
    expect(logged.nested.refreshToken).toBe('***REDACTED***');

    import.meta.env.DEV = originalEnv;
    logSpy.mockRestore();
  });
});
