import { afterEach, describe, expect, it } from 'vitest';
import { initOtpContainer, runInitAndObserve, stopObserving } from './otp-input-lib';

const markup = (attrs = 'data-nowo-otp-input-numeric-only-value="1"'): string => `
  <div data-nowo-otp-container="1">
    <input type="hidden" data-controller="nowo-otp-input" ${attrs} />
    <input data-nowo-otp-digit="0" />
    <input data-nowo-otp-digit="1" />
    <input data-nowo-otp-digit="2" />
  </div>
`;

const setup = (attrs?: string) => {
  document.body.innerHTML = markup(attrs);
  const host = document.querySelector('[data-nowo-otp-container]') as HTMLElement;
  initOtpContainer(host);
  const hidden = host.querySelector('input[type="hidden"]') as HTMLInputElement;
  const digits = Array.from(host.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));

  return { host, hidden, digits };
};

const key = (target: HTMLElement, name: string): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key: name, cancelable: true });
  target.dispatchEvent(event);

  return event;
};

const typeInto = (input: HTMLInputElement, value: string): void => {
  input.value = value;
  input.dispatchEvent(new Event('input'));
};

describe('otp-input-lib branches', () => {
  afterEach(() => {
    stopObserving();
    document.body.innerHTML = '';
  });

  it('is idempotent and ignores unrelated keys', () => {
    const { host, digits } = setup();
    initOtpContainer(host);
    expect(host.getAttribute('data-nowo-otp-init')).toBe('1');
    expect(key(digits[0], 'Enter').defaultPrevented).toBe(false);
  });

  it('backspace on the first empty box does nothing and arrows clamp at the edges', () => {
    const { hidden, digits } = setup();
    expect(key(digits[0], 'Backspace').defaultPrevented).toBe(true);
    expect(hidden.value).toBe('');
    expect(key(digits[0], 'ArrowLeft').defaultPrevented).toBe(true);
    expect(key(digits[2], 'ArrowRight').defaultPrevented).toBe(true);
  });

  it('drops invalid characters, keeps the last box focused and ignores empty pastes', () => {
    const { hidden, digits } = setup();
    typeInto(digits[0], 'x');
    expect(digits[0].value).toBe('');
    typeInto(digits[2], '9');
    expect(hidden.value).toBe('9');

    const empty = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(empty, 'clipboardData', { value: { getData: () => ' -- ' } });
    digits[0].dispatchEvent(empty);
    expect(hidden.value).toBe('9');
  });

  it('accepts letters and uppercases them when configured', () => {
    const { hidden, digits } = setup('data-nowo-otp-input-uppercase-value="true"');
    typeInto(digits[0], 'a');
    expect(hidden.value).toBe('A');
  });

  it('initializes hosts added after runInitAndObserve, nested or direct', async () => {
    runInitAndObserve();
    runInitAndObserve();

    const direct = document.createElement('div');
    direct.innerHTML = markup();
    const host = direct.firstElementChild as HTMLElement;
    document.body.appendChild(host);

    const wrapper = document.createElement('section');
    wrapper.innerHTML = markup();
    document.body.appendChild(wrapper);
    document.body.appendChild(document.createTextNode('text'));

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(host.getAttribute('data-nowo-otp-init')).toBe('1');
    expect(wrapper.querySelector('[data-nowo-otp-container]')?.getAttribute('data-nowo-otp-init')).toBe('1');
  });
});
