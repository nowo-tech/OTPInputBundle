/**
 * OTP input entrypoint.
 * Keeps multiple visible inputs synchronized with one hidden Symfony field.
 */

import { createBundleLogger } from './logger';

declare const __OTP_INPUT_BUILD_TIME__: string;

const log = createBundleLogger('otp-input', {
  buildTime: typeof __OTP_INPUT_BUILD_TIME__ !== 'undefined' ? __OTP_INPUT_BUILD_TIME__ : undefined,
});
log.scriptLoaded();

type OtpContainer = HTMLElement & {
  dataset: DOMStringMap;
};

function toBool(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

function sanitizeChar(value: string, numericOnly: boolean, uppercase: boolean): string {
  let out = value;
  out = numericOnly ? out.replace(/[^0-9]/g, '') : out.replace(/[^a-zA-Z0-9]/g, '');
  out = uppercase ? out.toUpperCase() : out;
  return out.slice(0, 1);
}

function initOtpContainer(container: OtpContainer): void {
  const hidden = container.querySelector('input[data-controller*="nowo-otp-input"]') as HTMLInputElement | null;
  const digits = Array.from(container.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));

  if (!hidden || digits.length === 0) {
    log.warn('container skipped: hidden input or OTP digits not found');
    return;
  }

  const numericOnly = toBool(hidden.dataset.nowoOtpInputNumericOnlyValue);
  const uppercase = toBool(hidden.dataset.nowoOtpInputUppercaseValue);

  const updateHidden = (): void => {
    hidden.value = digits.map((d) => d.value).join('');
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
    hidden.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const applyPastedCode = (raw: string, startIndex: number): void => {
    const chars = raw
      .replace(/\s+/g, '')
      .split('')
      .map((c) => sanitizeChar(c, numericOnly, uppercase))
      .filter((c) => c !== '');

    if (chars.length === 0) {
      return;
    }

    for (let i = startIndex; i < digits.length; i += 1) {
      digits[i].value = chars[i - startIndex] ?? '';
    }

    updateHidden();
    const last = Math.min(startIndex + chars.length, digits.length - 1);
    moveFocus(last);
  };

  const moveFocus = (index: number): void => {
    if (index >= 0 && index < digits.length) {
      digits[index].focus();
      digits[index].select();
    }
  };

  digits.forEach((digit, index) => {
    digit.addEventListener('input', () => {
      digit.value = sanitizeChar(digit.value, numericOnly, uppercase);
      updateHidden();
      if (digit.value !== '') {
        moveFocus(index + 1);
      }
    });

    digit.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace') {
        event.preventDefault();
        if (digit.value !== '') {
          digit.value = '';
          updateHidden();
          return;
        }
        const prev = index - 1;
        if (prev >= 0) {
          digits[prev].value = '';
          updateHidden();
          moveFocus(prev);
        }
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveFocus(index - 1);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveFocus(index + 1);
      }
    });

    digit.addEventListener('paste', (event) => {
      event.preventDefault();
      const text = event.clipboardData?.getData('text') ?? '';
      applyPastedCode(text, index);
    });
  });

  // Allows pasting the whole OTP even when the wrapper/hidden field has focus.
  container.addEventListener('paste', (event) => {
    const target = event.target as HTMLElement | null;
    if (target instanceof HTMLInputElement && target.dataset.nowoOtpDigit !== undefined) {
      return;
    }
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    applyPastedCode(text, 0);
  });

  hidden.addEventListener('paste', (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    applyPastedCode(text, 0);
  });
}

function initAllOtpContainers(): void {
  const containers = Array.from(document.querySelectorAll<OtpContainer>('[data-nowo-otp-container="1"]'));
  log.info('initializing OTP containers', { count: containers.length });
  containers.forEach(initOtpContainer);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllOtpContainers);
} else {
  initAllOtpContainers();
}
