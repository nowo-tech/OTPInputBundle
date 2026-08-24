import { describe, expect, it } from 'vitest';
import {
  getLogger,
  HOST_SELECTOR,
  initOtpContainer,
  sanitizeChar,
  toBool,
} from './otp-input-lib';

describe('otp-input-lib', () => {
  it('sanitizes and parses flags', () => {
    expect(toBool('1')).toBe(true);
    expect(toBool('true')).toBe(true);
    expect(toBool('0')).toBe(false);
    expect(sanitizeChar('a1', true, true)).toBe('1');
    expect(sanitizeChar('ab', false, true)).toBe('A');
  });

  it('returns a fallback logger before the entry registers one', () => {
    expect(() => getLogger().warn('no-op')).not.toThrow();
  });

  it('does not mark incomplete hosts as initialized', () => {
    const host = document.createElement('div');
    host.setAttribute('data-nowo-otp-container', '1');
    initOtpContainer(host);
    expect(host.getAttribute('data-nowo-otp-init')).toBeNull();
    expect(HOST_SELECTOR).toContain('nowo-otp-input');
  });
});
