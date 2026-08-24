/**
 * Autonomous custom element `<nowo-otp-input>` used by the default form theme.
 */

import { initOtpContainer, TAG_NOWO_OTP_INPUT } from './otp-input-lib';

export class NowoOtpInputElement extends HTMLElement {
  constructor() {
    super();
    if (!this.style.display) {
      this.style.display = 'block';
    }
  }

  connectedCallback(): void {
    initOtpContainer(this);
  }
}

let definitionRequested = false;

/**
 * Defines {@link TAG_NOWO_OTP_INPUT} once. Safe to call multiple times.
 */
export function ensureNowoOtpInputDefined(): void {
  if (typeof customElements === 'undefined') {
    return;
  }
  if (customElements.get(TAG_NOWO_OTP_INPUT) !== undefined) {
    return;
  }
  if (definitionRequested) {
    return;
  }
  definitionRequested = true;
  customElements.define(TAG_NOWO_OTP_INPUT, NowoOtpInputElement);
}
