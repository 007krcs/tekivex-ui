#!/usr/bin/env node
/**
 * build-all-entries.mjs
 *
 * Drives `vite build` once per public entry, with ENTRY=<name> set so
 * vite.config.ts emits a single self-contained bundle per invocation.
 *
 * Why one build per entry?
 *
 *   Vite's multi-entry lib mode hoists shared code into Rollup
 *   `chunk-*.js` files whose runtime registration format is incompatible
 *   with webpack's RSC module factory map. Consumers got:
 *
 *     TypeError: Cannot read properties of undefined (reading 'call')
 *       at mountLazyComponent in react-server-dom-webpack-client
 *
 *   when importing tekivex-ui from a Next.js app. `inlineDynamicImports`
 *   eliminates chunk emission, but rollup only honours it in single-entry
 *   mode. So we loop the build instead.
 *
 * Order matters: `index` runs first with `emptyOutDir: true` to clear
 * `dist/`; every other entry leaves existing files alone so the previous
 * builds survive.
 */

import { execSync } from 'node:child_process';

const ENTRIES = [
  'index',
  'themes',
  'charts',
  'headless',
  'i18n',
  'quantum',
  'realtime',
  'agent',
  'experimental',
  'a11y-aria',
  'mcp',
];

const start = Date.now();

for (const entry of ENTRIES) {
  const label = `[${ENTRIES.indexOf(entry) + 1}/${ENTRIES.length}] ${entry}`;
  console.log(`\n▶ building entry: ${label}`);
  execSync('npx vite build', {
    stdio: 'inherit',
    env: { ...process.env, ENTRY: entry },
  });
}

const seconds = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\n✓ all ${ENTRIES.length} entries built in ${seconds}s`);
