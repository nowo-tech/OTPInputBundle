import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { frameShot } from './frame';

/**
 * REQ-DEMO-013 — full demo frame: demo platform shell + the OTP widget in a useful state, without the Symfony WebProfiler toolbar.
 */
const outDir = process.env.SCREENSHOT_DIR
  ? resolve(process.env.SCREENSHOT_DIR)
  : resolve(__dirname, '../../../../docs/images/demo');

type Page = import('@playwright/test').Page;

async function capture(page: Page, file: string) {
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await frameShot(page, resolve(outDir, file));
}

test.beforeAll(() => {
  mkdirSync(outDir, { recursive: true });
});

test.describe('OtpInput screenshots (full demo frame)', () => {
  test('overview — empty 6-digit cells in demo card', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    const panel = page.locator('[data-testid="demo-case"]').first();
    await expect(panel).toBeVisible();
    await expect(panel.locator('nowo-otp-input [data-nowo-otp-digit]')).toHaveCount(6);
    await capture(page, 'overview.png');
  });

  test('interaction — code entered in demo card', async ({ page }) => {
    await page.goto('/demo/otp/numeric-6');
    const panel = page.locator('[data-testid="demo-case"]').first();
    await expect(panel).toBeVisible();
    const host = panel.locator('nowo-otp-input').first();
    for (let i = 0; i < 6; i++) {
      await host.locator(`[data-nowo-otp-digit="${i}"]`).fill(String(i + 1));
    }
    await expect(host.locator('input[data-controller*="nowo-otp-input"]').first()).toHaveValue('123456', {
      timeout: 5000,
    });
    await capture(page, 'interaction.png');
  });
});
