import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * REQ-DEMO-013 — full demo frame: demo masthead + the OTP widget in a useful state + Symfony WebProfiler toolbar.
 * Playwright clips to the viewport, so the viewport is enlarged before capture.
 */
const outDir = process.env.SCREENSHOT_DIR
  ? resolve(process.env.SCREENSHOT_DIR)
  : resolve(__dirname, '../../../../docs/images/demo');

type Box = { x: number; y: number; width: number; height: number };
type Page = import('@playwright/test').Page;

async function boxOf(page: Page, selector: string): Promise<Box | null> {
  const loc = page.locator(selector).first();
  if ((await loc.count()) === 0) {
    return null;
  }
  return loc.boundingBox();
}

/** Navbar → main → profiler (union), padded. */
async function clipDemoFrame(page: Page): Promise<Box> {
  const masthead = await boxOf(page, '[data-testid="demo-masthead"]');
  const main = await boxOf(page, 'main');
  const profiler = (await boxOf(page, '.sf-toolbar')) ?? (await boxOf(page, '.sf-minitoolbar'));
  if (!masthead || !main) {
    throw new Error('Missing demo navbar or main for the OTP Input screenshot clip');
  }
  const boxes = [masthead, main, profiler].filter(Boolean) as Box[];
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const right = Math.max(...boxes.map((b) => b.x + b.width));
  const bottom = Math.max(...boxes.map((b) => b.y + b.height));
  const pad = 8;
  return {
    x: Math.max(0, x - pad),
    y: Math.max(0, y - pad),
    width: right - x + pad * 2,
    height: bottom - y + pad * 2,
  };
}

async function waitProfiler(page: Page) {
  await page
    .locator('.sf-toolbar .sf-toolbar-block, .sf-toolbar-status, .sf-minitoolbar')
    .first()
    .waitFor({ state: 'visible', timeout: 10000 })
    .catch(() => {});
}

async function capture(page: Page, file: string) {
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await waitProfiler(page);
  // Fit the viewport to the content (the demo body is min-height: 100vh) so the profiler toolbar sits under it.
  await page.setViewportSize({ width: 1280, height: 720 });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: 1280, height: Math.min(Math.max(height, 720), 1800) });
  await waitProfiler(page);
  await page.screenshot({ path: resolve(outDir, file), clip: await clipDemoFrame(page) });
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
