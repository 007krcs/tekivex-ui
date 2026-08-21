#!/usr/bin/env node
/**
 * Cross-platform runner for the WAI-ARIA conformance sweep.
 *
 *   node scripts/aria.mjs check    → gate mode: fails on any violation (SOP)
 *   node scripts/aria.mjs sweep    → report mode: writes aria-sweep.ndjson
 *
 * Exists so the npm scripts work identically on Windows and POSIX without
 * pulling in cross-env.
 */
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';

const mode = process.argv[2] ?? 'check';
const env = { ...process.env };

if (mode === 'check') {
  env.TKX_ARIA_STRICT = '1';
} else if (mode === 'sweep') {
  env.TKX_ARIA_SWEEP = '1';
  env.TKX_ARIA_REPORT = env.TKX_ARIA_REPORT || 'aria-sweep.ndjson';
  try {
    rmSync(env.TKX_ARIA_REPORT, { force: true });
  } catch {
    /* nothing to clear */
  }
} else {
  console.error(`unknown mode "${mode}" — expected "check" or "sweep"`);
  process.exit(2);
}

// Forward any extra args (e.g. a specific test file) to vitest.
const extra = process.argv.slice(3);
const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vitest', 'run', ...extra],
  { stdio: 'inherit', env, shell: process.platform === 'win32' },
);
child.on('exit', (code) => {
  if (mode === 'sweep') {
    console.log(`\nARIA sweep report: ${env.TKX_ARIA_REPORT}`);
    console.log('Summarise with: node scripts/aria-report.mjs');
  }
  process.exit(code ?? 0);
});
