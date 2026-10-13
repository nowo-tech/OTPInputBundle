import { beforeEach, describe, expect, it, vi } from 'vitest';

type ClipboardCarrier = Event & {
  clipboardData: {
    getData: (type: string) => string;
  };
};

function createPasteEvent(text: string): ClipboardCarrier {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardCarrier;
  Object.defineProperty(event, 'clipboardData', {
    value: { getData: () => text },
    configurable: true,
  });
  return event;
}

function setReadyState(value: DocumentReadyState): void {
  Object.defineProperty(document, 'readyState', {
    value,
    configurable: true,
  });
}

describe('otp-input entrypoint', () => {
  beforeEach(async () => {
    const { stopObserving } = await import('./otp-input-lib');
    stopObserving();
    vi.resetModules();
    document.body.innerHTML = '';
    setReadyState('complete');
  });

  it('syncs digits into hidden input and supports keyboard navigation', async () => {
    document.body.innerHTML = `
      <div data-nowo-otp-container="1">
        <input data-controller="nowo-otp-input"
          data-nowo-otp-input-numeric-only-value="1"
          data-nowo-otp-input-uppercase-value="1" />
        <input data-nowo-otp-digit="0" />
        <input data-nowo-otp-digit="1" />
        <input data-nowo-otp-digit="2" />
      </div>
    `;

    await import('./otp-input');

    const hidden = document.querySelector('input[data-controller*="nowo-otp-input"]') as HTMLInputElement;
    const digits = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));
    const host = document.querySelector('[data-nowo-otp-container="1"]') as HTMLElement;

    expect(host.getAttribute('data-nowo-otp-init')).toBe('1');

    digits[0].value = 'a1';
    digits[0].dispatchEvent(new Event('input', { bubbles: true }));
    expect(digits[0].value).toBe('1');
    expect(hidden.value).toBe('1');
    expect(document.activeElement).toBe(digits[1]);

    digits[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(digits[2]);

    digits[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(digits[1]);

    digits[0].focus();
    digits[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(digits[0]);

    digits[2].focus();
    digits[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(digits[2]);

    digits[1].value = '9';
    digits[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(digits[1].value).toBe('');

    digits[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(digits[0].value).toBe('');
    expect(document.activeElement).toBe(digits[0]);
  });

  it('spreads an SMS one-time-code autofill written into the first box across all boxes', async () => {
    document.body.innerHTML = `
      <div data-nowo-otp-container="1">
        <input data-controller="nowo-otp-input"
          data-nowo-otp-input-numeric-only-value="1"
          data-nowo-otp-input-uppercase-value="1" />
        <input data-nowo-otp-digit="0" autocomplete="one-time-code" />
        <input data-nowo-otp-digit="1" maxlength="1" />
        <input data-nowo-otp-digit="2" maxlength="1" />
        <input data-nowo-otp-digit="3" maxlength="1" />
        <input data-nowo-otp-digit="4" maxlength="1" />
        <input data-nowo-otp-digit="5" maxlength="1" />
      </div>
    `;

    await import('./otp-input');

    const hidden = document.querySelector('input[data-controller*="nowo-otp-input"]') as HTMLInputElement;
    const digits = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));

    // iOS / Android autofill sets the whole code on the one-time-code input and fires a single input event.
    digits[0].value = '123 456';
    digits[0].dispatchEvent(new Event('input', { bubbles: true }));

    expect(digits.map((d) => d.value)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(hidden.value).toBe('123456');
    expect(document.activeElement).toBe(digits[5]);
  });

  it('keeps the newly typed character when typing after an existing one', async () => {
    document.body.innerHTML = `
      <div data-nowo-otp-container="1">
        <input data-controller="nowo-otp-input"
          data-nowo-otp-input-numeric-only-value="1"
          data-nowo-otp-input-uppercase-value="1" />
        <input data-nowo-otp-digit="0" value="1" />
        <input data-nowo-otp-digit="1" value="2" />
        <input data-nowo-otp-digit="2" value="3" />
      </div>
    `;

    await import('./otp-input');

    const hidden = document.querySelector('input[data-controller*="nowo-otp-input"]') as HTMLInputElement;
    const digits = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));

    digits[0].value = '17';
    digits[0].dispatchEvent(new Event('input', { bubbles: true }));

    expect(digits.map((d) => d.value)).toEqual(['7', '2', '3']);
    expect(hidden.value).toBe('723');
    expect(document.activeElement).toBe(digits[1]);

    // Two new characters that do not extend the previous value are treated as a code fragment.
    digits[1].value = '89';
    digits[1].dispatchEvent(new Event('input', { bubbles: true }));
    expect(digits.map((d) => d.value)).toEqual(['7', '8', '9']);

    // Clearing a box keeps working.
    digits[2].value = '';
    digits[2].dispatchEvent(new Event('input', { bubbles: true }));
    expect(hidden.value).toBe('78');
  });

  it('handles paste on digit, container and hidden input', async () => {
    document.body.innerHTML = `
      <div data-nowo-otp-container="1" id="otp-wrap">
        <input data-controller="nowo-otp-input"
          data-nowo-otp-input-numeric-only-value="0"
          data-nowo-otp-input-uppercase-value="1" />
        <input data-nowo-otp-digit="0" />
        <input data-nowo-otp-digit="1" />
        <input data-nowo-otp-digit="2" />
      </div>
    `;

    await import('./otp-input');

    const wrap = document.getElementById('otp-wrap') as HTMLDivElement;
    const hidden = wrap.querySelector('input[data-controller*="nowo-otp-input"]') as HTMLInputElement;
    const digits = Array.from(wrap.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));

    digits[1].dispatchEvent(createPasteEvent('ab9'));
    expect(digits.map((d) => d.value)).toEqual(['', 'A', 'B']);

    hidden.dispatchEvent(createPasteEvent('zz1'));
    expect(digits.map((d) => d.value)).toEqual(['Z', 'Z', '1']);
    expect(hidden.value).toBe('ZZ1');

    wrap.dispatchEvent(createPasteEvent('q2w'));
    expect(digits.map((d) => d.value)).toEqual(['Q', '2', 'W']);
    expect(hidden.value).toBe('Q2W');

    digits[0].dispatchEvent(createPasteEvent('***'));
    expect(hidden.value).toBe('Q2W');

  });

  it('skips containers missing hidden input or digits', async () => {
    document.body.innerHTML = `<div data-nowo-otp-container="1"></div>`;

    await import('./otp-input');
    expect(document.querySelectorAll('[data-nowo-otp-container="1"]').length).toBe(1);
  });

  it('initializes on DOMContentLoaded when document is loading', async () => {
    setReadyState('loading');
    document.body.innerHTML = `
      <div data-nowo-otp-container="1">
        <input data-controller="nowo-otp-input"
          data-nowo-otp-input-numeric-only-value="1"
          data-nowo-otp-input-uppercase-value="0" />
        <input data-nowo-otp-digit="0" />
      </div>
    `;

    await import('./otp-input');

    const digit = document.querySelector('input[data-nowo-otp-digit="0"]') as HTMLInputElement;
    const hidden = document.querySelector('input[data-controller*="nowo-otp-input"]') as HTMLInputElement;

    digit.value = '7';
    digit.dispatchEvent(new Event('input', { bubbles: true }));
    expect(hidden.value).toBe('');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    digit.dispatchEvent(new Event('input', { bubbles: true }));
    expect(hidden.value).toBe('7');
  });

  it('covers fallback branches for build time and clipboardData', async () => {
    (globalThis as { __OTP_INPUT_BUILD_TIME__?: string }).__OTP_INPUT_BUILD_TIME__ = 'test-build-time';
    document.body.innerHTML = `
      <div data-nowo-otp-container="1" id="otp-wrap-2">
        <input data-controller="nowo-otp-input"
          data-nowo-otp-input-numeric-only-value="0"
          data-nowo-otp-input-uppercase-value="1" />
        <input data-nowo-otp-digit="0" />
        <input data-nowo-otp-digit="1" />
        <input data-nowo-otp-digit="2" />
      </div>
    `;

    await import('./otp-input');

    const wrap = document.getElementById('otp-wrap-2') as HTMLDivElement;
    const hidden = wrap.querySelector('input[data-controller*="nowo-otp-input"]') as HTMLInputElement;
    const digits = Array.from(wrap.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));

    digits[0].dispatchEvent(createPasteEvent('A'));
    expect(digits.map((d) => d.value)).toEqual(['A', '', '']);

    // clipboardData missing -> fallback to empty string branch on digit paste
    digits[0].dispatchEvent(new Event('paste', { bubbles: true, cancelable: true }));
    expect(hidden.value).toBe('A');

    // clipboardData missing -> fallback on container paste
    wrap.dispatchEvent(new Event('paste', { bubbles: true, cancelable: true }));
    expect(hidden.value).toBe('A');

    // clipboardData missing -> fallback on hidden paste
    hidden.dispatchEvent(new Event('paste', { bubbles: true, cancelable: true }));
    expect(hidden.value).toBe('A');

    delete (globalThis as { __OTP_INPUT_BUILD_TIME__?: string }).__OTP_INPUT_BUILD_TIME__;
  });
});
