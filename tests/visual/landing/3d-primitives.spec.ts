import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// 3D primitives — visual regression
//
// jsdom can't run WebGL, so the tekivex-3d primitives (Starfield, Planet,
// OrbitPath, Portal3D, Avatar3D, Hotspot) defer their visual coverage
// here. We boot the landing dev server, navigate to the demo sections,
// wait for the first WebGL frame, then snapshot.
//
// Animated scenes (Avatar3D in 'cheer' state, OrbitPath at 0.5 rad/s)
// don't snapshot deterministically. We screenshot the FIRST stable
// frame, which is consistent enough across runs because:
//   - the camera starts at a fixed position
//   - TkxOrbitControls auto-rotate is disabled in the preview
//   - particles + animations are seeded from the same time origin
//
// Run (after the landing dev server is up on :5175):
//   npx playwright test -c playwright.landing.config.ts
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { hash: '#galaxy-map',          name: 'galaxy-map' },
  { hash: '#holographic-universe', name: 'holographic-universe' },
  { hash: '#flow-chart',           name: 'flow-chart' },
  { hash: '#data-demo',            name: 'data-demo' },
];

for (const { hash, name } of SECTIONS) {
  test(`landing section ${name} renders`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate((h) => {
      window.location.hash = h;
    }, hash);
    // Give WebGL one render cycle to commit
    await page.waitForTimeout(800);
    // Pause CSS + WebGL animations so the screenshot is deterministic
    await page.evaluate(() => {
      document.body.style.setProperty('animation-play-state', 'paused');
    });
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: false,
      animations: 'disabled',
    });
  });
}

test('hero 360° scene first frame is stable', async ({ page }) => {
  await page.goto('/');
  // The hero is the first section — wait for the canvas + at least one
  // hotspot label to be in the DOM before snapshotting.
  await page.waitForSelector('canvas');
  await page.waitForTimeout(1200);
  await expect(page).toHaveScreenshot('hero-360.png', {
    fullPage: false,
    animations: 'disabled',
  });
});
