#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// tekivex-audit
// Static-analysis CLI for React security + accessibility regressions.
// Usage:
//   npx tekivex-audit [dir]
//   npx tekivex audit [dir] --format json|md|console
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve, extname } from 'node:path';
import { runChecks, formatConsole, formatMarkdown, formatJSON } from '../src/checks.mjs';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
};

function parseArgs(argv) {
  const args = { dir: '.', format: 'console', out: null, failOn: 'error' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format' || a === '-f') args.format = argv[++i];
    else if (a === '--out' || a === '-o') args.out = argv[++i];
    else if (a === '--fail-on') args.failOn = argv[++i];
    else if (a === '--help' || a === '-h') { help(); process.exit(0); }
    else if (a === 'audit') continue; // allow `tekivex audit ...`
    else if (!a.startsWith('-')) args.dir = a;
  }
  return args;
}

function help() {
  console.log(`tekivex-audit \u2014 scan a React project for security + a11y issues

Usage:
  npx tekivex audit [dir] [options]

Options:
  --format, -f   console | json | md    (default: console)
  --out, -o      Write report to a file instead of stdout
  --fail-on      error | warn | never   (default: error)
  --help, -h     Show this help

Checks:
  SEC-001  dangerouslySetInnerHTML without DOMPurify/sanitize
  SEC-002  href starting with javascript:
  SEC-003  eval() / new Function() usage
  SEC-004  Hardcoded API keys / tokens
  SEC-005  localStorage for auth tokens
  SEC-006  target="_blank" without rel="noopener"
  SEC-007  Missing CSP meta tag in index.html
  SEC-008  No sanitizeHref / @tekivex/security-core in secure-sensitive files

  A11Y-001  <img> without alt
  A11Y-002  <button> with no accessible text
  A11Y-003  onClick on non-interactive element
  A11Y-004  Empty <a> link
  A11Y-005  <input> without <label>
  A11Y-006  Color with insufficient contrast (literal #hex check)
  A11Y-007  autoFocus on page load (disorients screen readers)
`);
}

async function collectFiles(dir, files = []) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return files; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'build', '.git', '.next', '.vite', 'coverage'].includes(entry.name)) continue;
      await collectFiles(full, files);
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (['.tsx', '.ts', '.jsx', '.js', '.html'].includes(ext)) files.push(full);
    }
  }
  return files;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = resolve(process.cwd(), args.dir);

  console.log(`${C.cyan}${C.bold}tekivex-audit${C.reset} scanning ${C.dim}${rootDir}${C.reset}`);

  const files = await collectFiles(rootDir);
  const fileContents = [];
  for (const f of files) {
    try { fileContents.push({ path: f, rel: relative(rootDir, f), content: await readFile(f, 'utf8') }); }
    catch { /* ignore */ }
  }

  const findings = await runChecks(fileContents, rootDir);

  let output;
  if (args.format === 'json') output = formatJSON(findings, rootDir);
  else if (args.format === 'md') output = formatMarkdown(findings, rootDir);
  else output = formatConsole(findings, rootDir, C);

  if (args.out) {
    await writeFile(args.out, output);
    console.log(`${C.green}\u2713${C.reset} Report written to ${args.out}`);
  } else {
    console.log(output);
  }

  const severityRank = { never: -1, warn: 0, error: 1 };
  const threshold = severityRank[args.failOn] ?? 1;
  const hasBlocker = findings.some((f) => (f.severity === 'error' && threshold <= 1) || (f.severity === 'warn' && threshold <= 0));
  if (hasBlocker) process.exit(1);
}

main().catch((err) => {
  console.error(`${C.red}\u2717 ${err?.message || err}${C.reset}`);
  process.exit(1);
});
