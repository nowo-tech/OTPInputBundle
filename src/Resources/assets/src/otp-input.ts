/**
 * OTP input standalone entry.
 * Defines the `nowo-otp-input` custom element and auto-inits hosts on DOM ready.
 */

import { createBundleLogger } from './logger';
import { ensureNowoOtpInputDefined } from './nowo-otp-input-element';
import {
  getLogger,
  initOtpContainer,
  runInit,
  runInitAndObserve,
  setBundleLogger,
  stopObserving,
} from './otp-input-lib';

ensureNowoOtpInputDefined();

declare const __OTP_INPUT_BUILD_TIME__: string;

const log = createBundleLogger('otp-input', {
  buildTime: typeof __OTP_INPUT_BUILD_TIME__ !== 'undefined' ? __OTP_INPUT_BUILD_TIME__ : undefined,
});
log.scriptLoaded();
setBundleLogger(log);

if (typeof window !== 'undefined') {
  getLogger().debug('standalone entry: exposing NowoOtpInput on window');
  (window as unknown as {
    NowoOtpInput?: {
      initOtpContainer: typeof initOtpContainer;
      runInit: typeof runInit;
      runInitAndObserve: typeof runInitAndObserve;
      stopObserving: typeof stopObserving;
    };
  }).NowoOtpInput = {
    initOtpContainer,
    runInit,
    runInitAndObserve,
    stopObserving,
  };
}

if (document.readyState === 'loading') {
  getLogger().debug('standalone entry: DOM loading, scheduling runInitAndObserve on DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    runInitAndObserve();
  });
} else {
  getLogger().debug('standalone entry: DOM ready, running runInitAndObserve now');
  runInitAndObserve();
}
