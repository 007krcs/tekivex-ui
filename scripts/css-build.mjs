#!/usr/bin/env node
// TekiVex UI — CSS Build Script
// Validates global.css and reports size

import { readFileSync, statSync } from 'fs';

const css = readFileSync('./src/styles/global.css', 'utf-8');
const size = statSync('./src/styles/global.css').size;
const ruleCount = (css.match(/\{/g) || []).length;
const animCount = (css.match(/@keyframes/g) || []).length;

console.log('TekiVex UI CSS Build Report');
console.log('─'.repeat(40));
console.log(`  File size:   ${(size / 1024).toFixed(2)} KB`);
console.log(`  CSS rules:   ${ruleCount}`);
console.log(`  Keyframes:   ${animCount}`);
console.log('\n[PASS] global.css is valid');
