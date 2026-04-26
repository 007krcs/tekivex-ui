import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Visual regression — every component page snapshotted across 4 device/theme
// combinations. Baselines live in tests/visual/__screenshots__/, committed.
//
// Curated routes only (key components + templates) — running all 78 component
// pages across 4 projects = 312 snapshots, too slow for every CI run. Add
// routes to KEY_ROUTES as components get hand-authored.
// ─────────────────────────────────────────────────────────────────────────────

const KEY_ROUTES = [
  '/',
  '/getting-started',
  '/bundlers',
  '/components/button',
  '/components/card',
  '/components/input',
  '/components/modal',
  '/components/form',
  '/components/table',
  '/components/alert',
  '/components/badge',
  '/components/tabs',
  '/components/tooltip',
  '/components/drawer',
  '/components/file-upload',
  '/components/select',
  '/components/pagination',
  '/components/avatar',
  '/components/skeleton',
  '/components/progress',
  '/components/accordion',
  '/components/autocomplete',
  '/components/stepper',
  '/components/slider',
  '/components/date-picker',
  '/components/carousel',
  '/templates/dashboard',
  '/templates/landing-page',
];

for (const route of KEY_ROUTES) {
  test(`route ${route}`, async ({ page }) => {
    await page.goto(`/#${route}`);
    // Wait for the SPA to mount and any client-side hydration to finish.
    await page.waitForLoadState('networkidle');
    // Disable any animation that could cause flake.
    await page.addStyleTag({
      content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
    });
    await expect(page).toHaveScreenshot(`${route.replace(/\W+/g, '-')}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });
}
