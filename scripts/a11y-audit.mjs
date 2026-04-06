#!/usr/bin/env node
// TekiVex UI — Accessibility Audit Script
// Verifies color contrast ratios for both built-in themes

const quantumDark = {
  bg: '#0a0a0f', text: '#e8e8f4', primary: '#00f5d4', secondary: '#7b2ff7',
  textMuted: '#8888aa', danger: '#f72585', warning: '#ffbe0b', success: '#06d6a0', info: '#3a86ff',
};

const auroraLight = {
  bg: '#f8f6f1', text: '#1a1815', primary: '#0d7c5f', secondary: '#6930c3',
  textMuted: '#6b6560', danger: '#c1121f', warning: '#d4a017', success: '#0d7c5f', info: '#1d4ed8',
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(c1, c2) {
  const l1 = luminance(c1), l2 = luminance(c2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function grade(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'FAIL';
}

const pairs = [
  ['text', 'bg'], ['primary', 'bg'], ['secondary', 'bg'],
  ['textMuted', 'bg'], ['danger', 'bg'], ['success', 'bg'], ['info', 'bg'],
];

let hasFailures = false;

for (const [themeName, theme] of [['Quantum Dark', quantumDark], ['Aurora Light', auroraLight]]) {
  console.log(`\n${themeName}`);
  console.log('─'.repeat(50));
  for (const [fg, bg] of pairs) {
    const ratio = contrast(theme[fg], theme[bg]);
    const g = grade(ratio);
    const fail = g === 'FAIL';
    if (fail) hasFailures = true;
    console.log(`  ${fail ? '✗' : '✓'} ${fg.padEnd(12)} vs ${bg.padEnd(8)} ${ratio.toFixed(1).padStart(5)}:1  ${g}`);
  }
}

if (hasFailures) {
  console.error('\n[FAIL] One or more color pairs do not meet WCAG AA minimum (4.5:1)');
  process.exit(1);
} else {
  console.log('\n[PASS] All color pairs meet WCAG contrast requirements');
}
