import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // Playwright spec — runs under @playwright/test, not Vitest.
      'tests/visual/**',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // Exclude pure type files + the playground/builder shells that don't run
      // in unit tests. Their coverage comes from Playwright visual regression.
      exclude: [
        'src/**/*.d.ts',
        'src/components/TkxPlayground.tsx',
        'src/components/TkxThemeBuilder.tsx',
        'src/components/TkxQuantumForm.tsx',
      ],
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: {
        // ── Coverage policy ──────────────────────────────────────────────
        // These are RATCHET thresholds — set at the current real number, not
        // aspirational. A failing gate that engineers disable is worse than
        // a realistic gate that holds the line.
        //
        // Path to 90% documented in docs/test-coverage-roadmap.md. Each
        // release bumps these numbers up; they never come down.
        //
        // Critical-path components (security primitives, KYC validators,
        // payments, form validation) are individually at 80%+. The drag-down
        // is large-surface components where jsdom genuinely limits what unit
        // tests can cover (canvas, timer-driven real-time, complex DnD).
        //
        // Snapshot taken 2026-04-27 against 794 passing tests.
        lines: 55,
        functions: 40,
        branches: 45,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@themes': resolve(__dirname, 'src/themes'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@a11y': resolve(__dirname, 'src/a11y'),
    },
  },
});
