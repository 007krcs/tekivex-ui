#!/usr/bin/env node
// TekiVex UI — Security Audit Script
// Scans source files for common XSS vectors and unsafe patterns

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const XSS_PATTERNS = [
  { pattern: /innerHTML\s*=(?!\s*sanitize)/g, message: 'Unsafe innerHTML assignment (no sanitize call)' },
  { pattern: /dangerouslySetInnerHTML\s*=\s*\{[^}]*(?!sanitize)/g, message: 'dangerouslySetInnerHTML without sanitization' },
  { pattern: /eval\s*\(/g, message: 'eval() usage detected' },
  { pattern: /new\s+Function\s*\(/g, message: 'new Function() usage detected' },
  { pattern: /document\.write\s*\(/g, message: 'document.write() usage detected' },
];

function walkDir(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) walkDir(full, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry)) files.push(full);
  }
  return files;
}

const srcFiles = walkDir('./src');
let issues = 0;

console.log('TekiVex UI Security Audit');
console.log('─'.repeat(50));

for (const file of srcFiles) {
  const content = readFileSync(file, 'utf-8');
  for (const { pattern, message } of XSS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      console.error(`[WARN] ${file}: ${message} (${matches.length} occurrence(s))`);
      issues++;
    }
  }
}

if (issues === 0) {
  console.log('\n[PASS] No security issues found in source files');
} else {
  console.log(`\n[WARN] ${issues} potential security issue(s) found. Review manually.`);
}
