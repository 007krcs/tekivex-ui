import { defineConfig, devices } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Playwright config — visual regression for the LANDING page (and the 3D
// primitives that live there). Separate from playwright.config.ts which
// targets the demo SPA on :5173.
//
// Why two configs?
//   - The demo SPA covers ~100 component pages with deterministic light/
//     dark light-DOM components, snapshot-friendly, runs in CI today.
//   - The landing page hosts the 3D demos (Galaxy Map, Mission Control,
//     Avatar3D state toggle, Flow Chart, Spreadsheet→Chart). Snapshotting
//     animated WebGL scenes needs careful timing and a real GPU; the
//     visuals settle differently than the static component pages.
//
// Run:
//   npm run dev:landing        # in one terminal (boots :5175)
//   npx playwright test -c playwright.landing.config.ts
//
// Update baselines:
//   npx playwright test -c playwright.landing.config.ts --update-snapshots
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  testDir: './tests/visual/landing',
  outputDir: './playwright-report/landing/results',
  reporter: [['html', { outputFolder: 'playwright-report/landing/html', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5175',
    trace: 'retain-on-failure',
    expect: {
      // 1% pixel diff allowed — WebGL animations render slightly different
      // every frame, so we wait for the first frame and accept a wider
      // threshold than for static DOM (0.2% there).
      threshold: 0.01,
    },
  },
  webServer: {
    // Repo isn't an npm-workspaces setup; cd into landing/ directly.
    command: 'npm run dev -- --port 5175',
    cwd: 'landing',
    port: 5175,
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
  projects: [
    {
      name: 'desktop-dark',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-dark',
      use: {
        ...devices['iPhone 14'],
        colorScheme: 'dark',
      },
    },
  ],
});
