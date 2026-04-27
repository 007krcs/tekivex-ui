#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const file = join(process.cwd(), 'coverage', 'coverage-summary.json');
const data = JSON.parse(await readFile(file, 'utf8'));

const entries = Object.entries(data)
  .filter(([k]) => /[\\/]components[\\/]Tkx.*\.tsx$/.test(k))
  .map(([k, v]) => ({
    file: k.replace(/^.*?[\\/]src[\\/]components[\\/]/, ''),
    lines: v.lines.pct,
    functions: v.functions.pct,
    branches: v.branches.pct,
    statements: v.statements.pct,
  }))
  .sort((a, b) => a.lines - b.lines);

console.log('LOWEST-COVERAGE COMPONENTS\n');
console.log('FILE'.padEnd(40), 'LINES'.padStart(7), 'FUNCS'.padStart(7), 'BRANCH'.padStart(7));
console.log('-'.repeat(64));
for (const e of entries) {
  console.log(
    e.file.padEnd(40),
    `${String(e.lines).padStart(6)}%`,
    `${String(e.functions).padStart(6)}%`,
    `${String(e.branches).padStart(6)}%`,
  );
}

const total = data.total;
console.log('\nTOTAL\n');
console.log('Lines:     ', total.lines.pct + '%');
console.log('Functions: ', total.functions.pct + '%');
console.log('Branches:  ', total.branches.pct + '%');
console.log('Statements:', total.statements.pct + '%');
