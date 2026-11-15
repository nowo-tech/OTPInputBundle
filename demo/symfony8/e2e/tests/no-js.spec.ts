import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Owner decision 2026-11-16: OtpType must keep working without JavaScript (1.9.0 no-JS fallback).
test.use({ javaScriptEnabled: false });

test.describe('OtpInput demo (JavaScript disabled)', () => {
  test('renders one visible, named, labelled text field and no boxes', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    const host = page.locator('nowo-otp-input').first();
    await expect(host).not.toHaveAttribute('data-nowo-otp-init', '1');

    const field = page.getByRole('textbox', { name: 'OTP code' });
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute('type', 'text');
    await expect(field).toHaveAttribute('inputmode', 'numeric');
    await expect(field).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(field).toHaveAttribute('maxlength', '6');
    await expect(field).toHaveAccessibleDescription(/6-digit code/);

    await expect(host.locator('[data-nowo-otp-render-target]')).toBeHidden();
    await expect(host.locator('[data-nowo-otp-digit]').first()).toBeHidden();
    await expect(page.getByTestId('demo-case').getByRole('textbox')).toHaveCount(1);
  });

  test('submits the code through the plain field', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    await page.getByRole('textbox', { name: 'OTP code' }).fill('654321');
    await page.getByRole('button', { name: 'Submit OTP' }).click();
    await expect(page.getByRole('alert')).toContainText('654321');
  });

  test('normalizes an alphanumeric code server-side', async ({ page }) => {
    await page.goto('/demo/otp/alphanumeric-8');
    await page.getByRole('textbox', { name: 'OTP code' }).fill('ab12cd34');
    await page.getByRole('button', { name: 'Submit OTP' }).click();
    await expect(page.getByRole('alert')).toContainText('AB12CD34');
  });

});

// Same server markup when the script fails to load (blocked, CSP, network). axe needs JavaScript in the page, so the
// a11y scan of the fallback runs here, with only otp-input.js blocked.
test.describe('OtpInput demo (otp-input.js blocked)', () => {
  test.use({ javaScriptEnabled: true });

  test.beforeEach(async ({ page }) => {
    await page.route('**/otp-input.js', (route) => route.abort());
  });

  test('keeps the fallback field usable', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    await expect(page.locator('nowo-otp-input').first()).not.toHaveAttribute('data-nowo-otp-init', '1');
    await expect(page.locator('[data-nowo-otp-digit]').first()).toBeHidden();
    await page.getByRole('textbox', { name: 'OTP code' }).fill('112233');
    await page.getByRole('button', { name: 'Submit OTP' }).click();
    await expect(page.getByRole('alert')).toContainText('112233');
  });

  test('has no WCAG 2 A/AA violations in the fallback form', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    const results = await new AxeBuilder({ page })
      .include('[data-testid="demo-case"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
