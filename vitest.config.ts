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
      // tekivex-3d is a separate workspace package with its own test
      // runner. Its component tests import `three` (a heavy peer dep) that
      // we don't install at the root to keep the dev install lean. Run them
      // from packages/tekivex-3d/ instead: `cd packages/tekivex-3d && npx vitest run`
      'packages/tekivex-3d/**',
      'tests/TkxAvatar3D.test.tsx',
      'tests/TkxOrbitPath.test.tsx',
      'tests/TkxPlanet.test.tsx',
      'tests/TkxPortal3D.test.tsx',
      'tests/TkxStarfield.test.tsx',
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
        // Snapshot taken 2026-04-27 against 1034 passing tests (v3.0.0).
        // Up from 55/40/45/50 in v2.9 — each release ratchets up.
        lines: 64,
        functions: 50,
        branches: 56,
        statements: 60,
      },
    },
  },
  resolve: {
    // Force every import of react / react-dom to root node_modules so
    // tests that reach into packages/tekivex-3d/src don't end up with
    // two React copies (the "useRef of null" crash). Same trick the
    // landing app uses in landing/vite.config.ts.
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@themes': resolve(__dirname, 'src/themes'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@a11y': resolve(__dirname, 'src/a11y'),
      // Pin React to the root copies for tekivex-3d source files.
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
      // tekivex-3d ships three as a peer-dep; tests resolve to its bundled copy.
      three: resolve(__dirname, 'packages/tekivex-3d/node_modules/three'),
    },
  },
});
