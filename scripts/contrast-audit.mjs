// scripts/contrast-audit.mjs
//
// Dogfood meetsAAA / contrastRatio against the landing-page palette.
// Run: `npx tsx scripts/contrast-audit.mjs`
//
// Used to verify the 2026-05-31 palette tightening (HeroPro + styles.css)
// every color used as TEXT actually passes WCAG 2.1 AAA (≥ 7:1) on its
// background. Re-run after any palette change.

import { meetsAAA, contrastRatio } from '../src/engine/wcag.ts';

const PAIRS = [
  // landing/src/styles.css :root tokens on white
  ['--tk-fg',                     '#0f172a', '#ffffff'],
  ['--tk-fg-muted (new)',         '#334155', '#ffffff'],
  ['--tk-fg-faint (new)',         '#475569', '#ffffff'],
  ['--tk-accent-text (new)',      '#155e75', '#ffffff'],
  ['--tk-accent-2 (new)',         '#4338ca', '#ffffff'],
  ['--tk-accent-3 (new)',         '#6d28d9', '#ffffff'],
  ['--tk-prose-link (new)',       '#4338ca', '#ffffff'],
  ['--tk-prose-link-hover (new)', '#6d28d9', '#ffffff'],

  // HeroPro hardcoded palette on white
  ['HeroPro TEXT',         '#0a0a0f', '#ffffff'],
  ['HeroPro TEXT_BODY',    '#1f2937', '#ffffff'],
  ['HeroPro TEXT_MUTED',   '#374151', '#ffffff'],
  ['HeroPro TEXT_FAINT',   '#374151', '#ffffff'],

  // Syntax tokens on the code-card BG #fafbfc
  ['TOK.keyword (new)', '#5b21b6', '#fafbfc'],
  ['TOK.string (new)',  '#115e59', '#fafbfc'],
  ['TOK.comp (new)',    '#78350f', '#fafbfc'],
  ['TOK.attr (new)',    '#075985', '#fafbfc'],
  ['TOK.punct (new)',   '#475569', '#fafbfc'],
  ['TOK.text',          '#1f2937', '#fafbfc'],
  ['TOK.comment (new)', '#475569', '#fafbfc'],
];

const W = 32;
let failed = 0;
for (const [name, fg, bg] of PAIRS) {
  const ratio = contrastRatio(fg, bg);
  const aaa = meetsAAA(fg, bg);
  const mark = aaa ? '✓' : '✗';
  console.log(`${mark} ${name.padEnd(W)} fg=${fg} bg=${bg}  ${ratio.toFixed(2)}:1  ${aaa ? 'AAA' : 'FAIL'}`);
  if (!aaa) failed++;
}
console.log('');
if (failed === 0) {
  console.log(`All ${PAIRS.length} pairs pass WCAG 2.1 AAA (≥ 7:1 for normal text).`);
} else {
  console.error(`${failed} of ${PAIRS.length} pairs FAILED — fix before commit.`);
  process.exit(1);
}
