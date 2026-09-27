import { test, expect } from '@playwright/test';

test.describe('OtpInput demo', () => {
  test('6-digit OTP widget renders digit cells', async ({ page }) => {
    const response = await page.goto('/demo/otp/numeric-6');
    expect(response?.ok()).toBeTruthy();
    const host = page.locator('nowo-otp-input').first();
    await expect(host).toBeVisible();
    await expect(host.locator('[data-nowo-otp-digit]')).toHaveCount(6);
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
  });
});
