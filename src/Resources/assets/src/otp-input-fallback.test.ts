import { afterEach, describe, expect, it } from 'vitest';
import { enhanceFallback, initOtpContainer } from './otp-input-lib';

/** Markup shaped like the 1.9.0 server-rendered no-JS fallback. */
const fallbackMarkup = (opts: { value?: string; autofocus?: boolean; label?: string; numeric?: boolean } = {}): string => `
  <form>
    ${opts.label ?? '<label for="f_code">Code</label>'}
    <nowo-otp-input data-nowo-otp-container="1">
      <input type="text" id="f_code" name="f[code]" value="${opts.value ?? ''}"
        inputmode="numeric" autocomplete="one-time-code" maxlength="3" data-nowo-otp-fallback="1"
        data-controller="nowo-otp-input" data-nowo-otp-input-numeric-only-value="${opts.numeric === false ? '0' : '1'}"
        data-nowo-otp-input-uppercase-value="1" ${opts.autofocus ? 'autofocus' : ''} />
      <div data-nowo-otp-boxes="1" hidden>
        <div class="flex" data-nowo-otp-render-target="1" role="group" aria-label="Enter the OTP code">
          <input id="f_code_digit_0" data-nowo-otp-digit="0" aria-label="Character 1 of 3" />
          <input id="f_code_digit_1" data-nowo-otp-digit="1" aria-label="Character 2 of 3" />
          <input id="f_code_digit_2" data-nowo-otp-digit="2" aria-label="Character 3 of 3" />
        </div>
      </div>
    </nowo-otp-input>
  </form>
`;

const setup = (opts: Parameters<typeof fallbackMarkup>[0] = {}) => {
  document.body.innerHTML = fallbackMarkup(opts);
  const host = document.querySelector('[data-nowo-otp-container]') as HTMLElement;
  const field = host.querySelector('input[name]') as HTMLInputElement;
  const group = host.querySelector('[data-nowo-otp-render-target]') as HTMLElement;
  const boxes = host.querySelector('[data-nowo-otp-boxes]') as HTMLElement;
  const digits = Array.from(host.querySelectorAll<HTMLInputElement>('input[data-nowo-otp-digit]'));

  return { host, field, group, boxes, digits };
};

describe('no-JS fallback enhancement', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('switches the named text field to hidden and reveals the boxes', () => {
    const { host, field, group, boxes, digits } = setup();
    expect(field.type).toBe('text');
    expect(boxes.hidden).toBe(true);

    initOtpContainer(host);

    expect(host.getAttribute('data-nowo-otp-init')).toBe('1');
    expect(field.type).toBe('hidden');
    expect(field.name).toBe('f[code]');
    expect(boxes.hidden).toBe(false);
    expect(boxes.hasAttribute('hidden')).toBe(false);
    expect(group.hidden).toBe(false);

    digits[0].value = '7';
    digits[0].dispatchEvent(new Event('input'));
    expect(field.value).toBe('7');
    expect(new FormData(document.querySelector('form') as HTMLFormElement).get('f[code]')).toBe('7');
  });

  it('copies what was typed before the script ran into the boxes', () => {
    const { host, field, digits } = setup({ value: '4 2x9' });
    initOtpContainer(host);
    expect(digits.map((d) => d.value)).toEqual(['4', '2', '9']);
    expect(field.value).toBe('429');
  });

  it('keeps server-rendered box values when the fallback is empty', () => {
    const { host, field, digits } = setup();
    digits[0].value = '1';
    initOtpContainer(host);
    expect(digits[0].value).toBe('1');
    expect(field.value).toBe('1');
  });

  it('labels the group with the visible label and points the label at the first box', () => {
    const { host, group } = setup();
    initOtpContainer(host);
    const label = document.querySelector('label') as HTMLLabelElement;
    expect(label.id).toBe('f_code_label');
    expect(label.htmlFor).toBe('f_code_digit_0');
    expect(group.getAttribute('aria-labelledby')).toBe('f_code_label');
  });

  it('keeps an existing label id and copes without a label', () => {
    const withId = setup({ label: '<label id="own" for="f_code">Code</label>' });
    initOtpContainer(withId.host);
    expect(withId.group.getAttribute('aria-labelledby')).toBe('own');

    const noLabel = setup({ label: '' });
    initOtpContainer(noLabel.host);
    expect(noLabel.group.hasAttribute('aria-labelledby')).toBe(false);
    expect(noLabel.field.type).toBe('hidden');
  });

  it('moves autofocus to the first empty box', () => {
    const { host, field, digits } = setup({ autofocus: true, value: '5' });
    (document.activeElement as HTMLElement | null)?.blur();
    initOtpContainer(host);
    expect(field.hasAttribute('autofocus')).toBe(false);
    expect(document.activeElement).toBe(digits[1]);
  });

  it('moves focus from the focused fallback to the last box when it is full', () => {
    const { host, field, digits } = setup({ value: '123' });
    field.focus();
    initOtpContainer(host);
    expect(document.activeElement).toBe(digits[2]);
  });

  it('does not steal focus from another control', () => {
    const { host, digits } = setup({ autofocus: true });
    const other = document.createElement('button');
    document.body.appendChild(other);
    other.focus();
    initOtpContainer(host);
    expect(document.activeElement).toBe(other);
    expect(digits.includes(document.activeElement as HTMLInputElement)).toBe(false);
  });

  it('sanitizes alphanumeric fallbacks with the field flags', () => {
    const { host, digits } = setup({ numeric: false, value: 'a-b1' });
    initOtpContainer(host);
    expect(digits.map((d) => d.value)).toEqual(['A', 'B', '1']);
  });

  it('leaves legacy markup (hidden field, visible boxes) unchanged', () => {
    document.body.innerHTML = `
      <div data-nowo-otp-container="1">
        <input type="hidden" name="f[code]" value="12" data-controller="nowo-otp-input" />
        <input data-nowo-otp-digit="0" value="1" />
        <input data-nowo-otp-digit="1" value="2" />
      </div>`;
    const host = document.querySelector('[data-nowo-otp-container]') as HTMLElement;
    const field = host.querySelector('input[name]') as HTMLInputElement;
    initOtpContainer(host);
    expect(field.type).toBe('hidden');
    expect(field.value).toBe('12');
  });

  it('enhances digits that sit outside a render target', () => {
    document.body.innerHTML = `
      <div>
        <input type="text" id="x" value="9" data-controller="nowo-otp-input" />
        <input data-nowo-otp-digit="0" />
      </div>`;
    const field = document.getElementById('x') as HTMLInputElement;
    const digit = document.querySelector('[data-nowo-otp-digit]') as HTMLInputElement;
    enhanceFallback(field, [digit], true, true);
    expect(field.type).toBe('hidden');
    expect(digit.value).toBe('9');
  });

  it('does not retarget the label when the first box has no id', () => {
    document.body.innerHTML = `
      <label for="y">Code</label>
      <input type="text" id="y" data-controller="nowo-otp-input" />
      <div data-nowo-otp-render-target="1" hidden><input data-nowo-otp-digit="0" /></div>`;
    const field = document.getElementById('y') as HTMLInputElement;
    const digit = document.querySelector('[data-nowo-otp-digit]') as HTMLInputElement;
    enhanceFallback(field, [digit], true, true);
    expect((document.querySelector('label') as HTMLLabelElement).htmlFor).toBe('y');
  });

  it('skips label lookup when the field has no id', () => {
    document.body.innerHTML = `
      <label for="">Code</label>
      <input type="text" data-controller="nowo-otp-input" />
      <div data-nowo-otp-render-target="1" hidden><input id="d0" data-nowo-otp-digit="0" /></div>`;
    const field = document.querySelector('input[data-controller]') as HTMLInputElement;
    const digit = document.querySelector('[data-nowo-otp-digit]') as HTMLInputElement;
    enhanceFallback(field, [digit], true, true);
    expect(field.type).toBe('hidden');
    expect((document.querySelector('label') as HTMLLabelElement).id).toBe('');
  });
});
