/**
 * OTP input library shared by the custom element and the standalone IIFE.
 * Keeps visible digit inputs synchronized with one hidden Symfony field.
 */

import { createBundleLogger } from './logger';
import type { BundleLogger } from './logger';

export const TAG_NOWO_OTP_INPUT = 'nowo-otp-input';
export const ATTR_INIT = 'data-nowo-otp-init';
export const HOST_SELECTOR = `${TAG_NOWO_OTP_INPUT}, [data-nowo-otp-container="1"]`;

export type OtpContainer = HTMLElement & {
  dataset: DOMStringMap;
};

let bundleLogger: BundleLogger | null = null;

/**
 * @param logger - Bundle logger used by init helpers.
 */
export function setBundleLogger(logger: BundleLogger): void {
  bundleLogger = logger;
}

/**
 * @returns Active logger, or a silent fallback if the entry has not registered one.
 */
export function getLogger(): BundleLogger {
  if (bundleLogger !== null) {
    return bundleLogger;
  }

  return createBundleLogger('otp-input');
}

/**
 * @param value - Attribute/dataset flag.
 */
export function toBool(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

/**
 * @param value - Raw character(s) from a digit input or paste.
 * @param numericOnly - Restrict to 0-9 when true.
 * @param uppercase - Normalize letters when true.
 */
export function sanitizeChar(value: string, numericOnly: boolean, uppercase: boolean): string {
  let out = value;
  out = numericOnly ? out.replace(/[^0-9]/g, '') : out.replace(/[^a-zA-Z0-9]/g, '');
  out = uppercase ? out.toUpperCase() : out;

  return out.slice(0, 1);
}

/**
 * @param field - The named form field.
 * @returns The `<label for>` of the field, if any.
 */
function findLabel(field: HTMLInputElement): HTMLLabelElement | null {
  if (field.id === '') {
    return null;
  }

  return Array.from(field.ownerDocument.querySelectorAll('label')).find((label) => label.htmlFor === field.id) ?? null;
}

/**
 * Progressive enhancement of the no-JS markup (1.9.0+). Server side, the named field is a visible text input and the
 * digit boxes sit in a `hidden` wrapper (`data-nowo-otp-boxes`). Here the field switches to `type="hidden"` (it keeps its name and value and
 * leaves the focus order and the accessibility tree), whatever was typed before the script ran is copied into the
 * boxes, the boxes are revealed and the visible label is pointed at them. The host carries `data-nowo-otp-init="1"`
 * from this point on (stable styling hook). Markup from older or overridden themes (field already hidden, group
 * visible) passes through unchanged.
 *
 * @param field - The named form field (text fallback or hidden input).
 * @param digits - Digit boxes.
 * @param numericOnly - Restrict to 0-9 when true.
 * @param uppercase - Normalize letters when true.
 */
export function enhanceFallback(
  field: HTMLInputElement,
  digits: HTMLInputElement[],
  numericOnly: boolean,
  uppercase: boolean,
): void {
  const doc = field.ownerDocument;
  const group = digits[0].closest<HTMLElement>('[data-nowo-otp-render-target]');
  const boxes = digits[0].closest<HTMLElement>('[data-nowo-otp-boxes]');

  if (boxes !== null) {
    boxes.hidden = false;
  }
  if (group !== null) {
    group.hidden = false;
  }

  if (field.type === 'hidden') {
    return;
  }

  const active = doc.activeElement;
  const wantsFocus = active === field || (field.hasAttribute('autofocus') && (active === null || active === doc.body));
  const typed = field.value
    .split('')
    .map((c) => sanitizeChar(c, numericOnly, uppercase))
    .filter((c) => c !== '');

  if (typed.length > 0) {
    digits.forEach((digit, index) => {
      digit.value = typed[index] ?? '';
    });
  }

  field.removeAttribute('autofocus');
  field.type = 'hidden';
  // Set after the type switch: a hidden input's value is its `value` attribute (value mode "default").
  field.value = digits.map((d) => d.value).join('');

  const label = findLabel(field);
  if (label !== null) {
    if (label.id === '') {
      label.id = `${field.id}_label`;
    }
    group?.setAttribute('aria-labelledby', label.id);
    if (digits[0].id !== '') {
      label.htmlFor = digits[0].id;
    }
  }

  if (wantsFocus) {
    (digits.find((d) => d.value === '') ?? digits[digits.length - 1]).focus();
  }

  getLogger().debug('no-JS fallback enhanced', { id: field.id });
}

/**
 * Bind digit inputs on one OTP host. Idempotent (`data-nowo-otp-init`).
 *
 * @param container - Custom element or legacy wrapper.
 */
export function initOtpContainer(container: OtpContainer): void {
  if (container.getAttribute(ATTR_INIT) === '1') {
    return;
  }

  const hidden = container.querySelector('input[data-controller*="nowo-otp-input"]') as HTMLInputElement | null;
  const digits = Array.from(container.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));

  if (!hidden || digits.length === 0) {
    getLogger().warn('container skipped: hidden input or OTP digits not found');
    return;
  }

  container.setAttribute(ATTR_INIT, '1');

  const numericOnly = toBool(hidden.dataset.nowoOtpInputNumericOnlyValue);
  const uppercase = toBool(hidden.dataset.nowoOtpInputUppercaseValue);

  enhanceFallback(hidden, digits, numericOnly, uppercase);

  // Last known value of every box, so multi-character `input` events can tell "typed over" from autofill.
  let lastValues = digits.map((d) => d.value);

  const updateHidden = (): void => {
    lastValues = digits.map((d) => d.value);
    hidden.value = lastValues.join('');
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
    hidden.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const moveFocus = (index: number): void => {
    if (index >= 0 && index < digits.length) {
      digits[index].focus();
      digits[index].select();
    }
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

  digits.forEach((digit, index) => {
    digit.addEventListener('input', () => {
      const raw = digit.value.replace(/\s+/g, '');
      const chars = raw
        .split('')
        .map((c) => sanitizeChar(c, numericOnly, uppercase))
        .filter((c) => c !== '');

      if (chars.length > 1) {
        if (chars.length === 2 && chars[0] === lastValues[index]) {
          // Typed one character after the existing one: keep the new character only.
          digit.value = chars[1];
        } else {
          // SMS one-time-code autofill / IME / drag-drop: spread the whole code across the boxes.
          applyPastedCode(raw, index);
          return;
        }
      } else {
        digit.value = chars[0] ?? '';
      }
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

/**
 * Initialize every OTP host currently in the document.
 */
export function runInit(): void {
  const containers = Array.from(document.querySelectorAll<OtpContainer>(HOST_SELECTOR));
  getLogger().info('initializing OTP containers', { count: containers.length });
  containers.forEach(initOtpContainer);
}

let observer: MutationObserver | null = null;

/**
 * Initialize existing hosts and watch for nodes added later (Turbo / live forms).
 */
export function runInitAndObserve(): void {
  runInit();
  if (observer !== null || typeof MutationObserver === 'undefined' || document.body === null) {
    return;
  }

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.matches(HOST_SELECTOR)) {
          initOtpContainer(node);
        }
        node.querySelectorAll<OtpContainer>(HOST_SELECTOR).forEach(initOtpContainer);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Disconnect the document observer. Used by tests when resetting modules.
 */
export function stopObserving(): void {
  observer?.disconnect();
  observer = null;
}
