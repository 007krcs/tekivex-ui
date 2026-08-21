#!/usr/bin/env node
/**
 * Summarise an ARIA sweep report (NDJSON) into a readable triage view:
 * counts by rule, distinct defects, and the components responsible.
 */
import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2] ?? 'aria-sweep.ndjson';
if (!existsSync(file)) {
  console.log(`No report at ${file}. Run: npm run aria:sweep`);
  process.exit(0);
}

const rows = readFileSync(file, 'utf8')
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l));

if (!rows.length) {
  console.log('No violations recorded — the sweep is clean.');
  process.exit(0);
}

const shortFile = (f) => f.split(/[\\/]/).pop().replace('.test.tsx', '').replace('.test.ts', '');

const byRule = new Map();
for (const r of rows) byRule.set(r.rule, (byRule.get(r.rule) ?? 0) + 1);

console.log(`ARIA sweep — ${rows.length} finding(s)\n`);
console.log('By rule:');
for (const [rule, n] of [...byRule].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(5)}  ${rule}`);
}

const byComponent = new Map();
for (const r of rows) {
  const k = shortFile(r.file);
  if (!byComponent.has(k)) byComponent.set(k, new Set());
  byComponent.get(k).add(`${r.rule}|${r.message}`);
}
console.log('\nBy component (distinct defects):');
for (const [c, set] of [...byComponent].sort((a, b) => b[1].size - a[1].size)) {
  console.log(`  ${String(set.size).padStart(5)}  ${c}`);
}

console.log('\nDistinct defects:');
const distinct = new Map();
for (const r of rows) {
  const k = `${r.rule}|${r.message}`;
  if (!distinct.has(k)) distinct.set(k, { ...r, count: 0, components: new Set() });
  const d = distinct.get(k);
  d.count++;
  d.components.add(shortFile(r.file));
}
for (const d of [...distinct.values()].sort((a, b) => b.count - a.count)) {
  console.log(`  [${d.rule}] x${d.count}  ${[...d.components].join(', ')}`);
  console.log(`      ${d.message}`);
  console.log(`      e.g. ${d.element}`);
}
