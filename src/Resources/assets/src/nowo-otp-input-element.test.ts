import { afterEach, describe, expect, it, vi } from 'vitest';
import { ensureNowoOtpInputDefined } from './nowo-otp-input-element';
import { ATTR_INIT, TAG_NOWO_OTP_INPUT } from './otp-input-lib';

describe('nowo-otp-input-element', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('defines the custom element once', () => {
    ensureNowoOtpInputDefined();
    const defined = customElements.get(TAG_NOWO_OTP_INPUT);
    expect(defined).toBeDefined();
    ensureNowoOtpInputDefined();
    expect(customElements.get(TAG_NOWO_OTP_INPUT)).toBe(defined);
  });

  it('initializes on connectedCallback', () => {
    ensureNowoOtpInputDefined();
    const el = document.createElement(TAG_NOWO_OTP_INPUT) as HTMLElement;
    el.innerHTML = `
      <input data-controller="nowo-otp-input" data-nowo-otp-input-numeric-only-value="1" />
      <input data-nowo-otp-digit="0" />
    `;
    document.body.appendChild(el);
    expect(el.getAttribute(ATTR_INIT)).toBe('1');
    expect(el.style.display).toBe('block');
  });

  it('no-ops when customElements is unavailable', () => {
    const original = globalThis.customElements;
    Object.defineProperty(globalThis, 'customElements', { configurable: true, value: undefined });
    expect(() => ensureNowoOtpInputDefined()).not.toThrow();
    Object.defineProperty(globalThis, 'customElements', { configurable: true, value: original });
  });
});
