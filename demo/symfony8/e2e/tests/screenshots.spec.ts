import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** REQ-DEMO-013 — demo use-case card (title + OTP widget). */
const outDir = process.env.SCREENSHOT_DIR
  ? resolve(process.env.SCREENSHOT_DIR)
  : resolve(__dirname, '../../../../docs/images/demo');

function useCasePanel(page: import('@playwright/test').Page) {
  return page.locator('.otp-demo-card').first();
}

test.beforeAll(() => {
  mkdirSync(outDir, { recursive: true });
});

test.describe('OtpInput screenshots (use-case context)', () => {
  test('overview — empty 6-digit cells in demo card', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    const panel = useCasePanel(page);
    await expect(panel).toBeVisible();
    await expect(panel.locator('nowo-otp-input [data-nowo-otp-digit]')).toHaveCount(6);
    await panel.screenshot({ path: resolve(outDir, 'overview.png') });
  });

  test('interaction — code entered in demo card', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    const panel = useCasePanel(page);
    await expect(panel).toBeVisible();
    const host = panel.locator('nowo-otp-input').first();
    for (let i = 0; i < 6; i++) {
      await host.locator(`[data-nowo-otp-digit="${i}"]`).fill(String(i + 1));
    }
    await expect(host.locator('input[data-controller*="nowo-otp-input"]').first()).toHaveValue('123456', {
      timeout: 5000,
    });
    await panel.screenshot({ path: resolve(outDir, 'interaction.png') });
  });
});
