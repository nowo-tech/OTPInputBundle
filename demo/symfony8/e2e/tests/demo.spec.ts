import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('OtpInput demo (JavaScript enabled)', () => {
  test('6-digit OTP widget renders digit cells', async ({ page }) => {
    const response = await page.goto('/demo/otp/numeric-6');
    expect(response?.ok()).toBeTruthy();
    const host = page.locator('nowo-otp-input').first();
    await expect(host).toBeVisible();
    await expect(host.locator('[data-nowo-otp-digit]')).toHaveCount(6);
  });

  test('enhances the no-JS fallback: field hidden, boxes shown, one focusable control per character', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    const host = page.locator('nowo-otp-input').first();
    await expect(host).toHaveAttribute('data-nowo-otp-init', '1');

    const field = host.locator('input[name]');
    await expect(field).toHaveCount(1);
    await expect(field).toHaveAttribute('type', 'hidden');
    await expect(host.locator('[data-nowo-otp-render-target]')).toBeVisible();
    await expect(host.locator('[data-nowo-otp-digit]').first()).toBeVisible();

    // The visible label now names the group and focuses the first box.
    const group = page.getByRole('group', { name: 'OTP code' });
    await expect(group).toBeVisible();
    await expect(page.getByTestId('demo-case').getByRole('textbox')).toHaveCount(6);
    await page.locator('label', { hasText: 'OTP code' }).click();
    await expect(host.locator('[data-nowo-otp-digit="0"]')).toBeFocused();
  });

  test('typing fills digits and hidden value', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    const host = page.locator('nowo-otp-input').first();
    await expect(host).toBeVisible();
    await host.locator('[data-nowo-otp-digit="0"]').fill('1');
    await host.locator('[data-nowo-otp-digit="1"]').fill('2');
    await host.locator('[data-nowo-otp-digit="2"]').fill('3');
    await host.locator('[data-nowo-otp-digit="3"]').fill('4');
    await host.locator('[data-nowo-otp-digit="4"]').fill('5');
    await host.locator('[data-nowo-otp-digit="5"]').fill('6');
    const hidden = host.locator('input[data-controller*="nowo-otp-input"]').first();
    await expect(hidden).toHaveValue('123456', { timeout: 5000 });

    await page.getByRole('button', { name: 'Submit OTP' }).click();
    await expect(page.getByRole('alert')).toContainText('123456');
  });

  test('has no WCAG 2 A/AA violations in the form', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    await expect(page.locator('nowo-otp-input').first()).toHaveAttribute('data-nowo-otp-init', '1');
    const results = await new AxeBuilder({ page })
      .include('[data-testid="demo-case"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
