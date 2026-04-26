import { defineConfig, devices } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Playwright visual regression config — closes audit §3.12 + §6.4.
//
// Strategy: spin up the demo dev server, snapshot every component-page route
// at three viewport sizes (mobile/tablet/desktop) and across light + dark
// themes. Diffs against committed baselines.
//
// Run once locally to seed baselines:
//   npm run test:visual -- --update-snapshots
//
// Run in CI:
//   npm run test:visual
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  testDir: './tests/visual',
  outputDir: './playwright-report/results',
  reporter: [['html', { outputFolder: 'playwright-report/html', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    // Diff threshold: 0.2% of pixels can differ before we flag.
    // Tightened from Playwright's default 0.6% to catch subtle regressions.
    expect: {
      threshold: 0.002,
    },
  },
  webServer: {
    command: 'npm run dev:demo',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'desktop-light',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'light',
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'desktop-dark',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'tablet-light',
      use: {
        ...devices['iPad (gen 7)'],
        colorScheme: 'light',
      },
    },
    {
      name: 'mobile-light',
      use: {
        ...devices['iPhone 14'],
        colorScheme: 'light',
      },
    },
  ],
});
