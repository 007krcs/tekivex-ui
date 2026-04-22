#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Export tekivex-ui theme tokens to Figma Tokens JSON format.
// Output: dist/tokens.figma.json — import via the "Figma Tokens" plugin
//         (or Tokens Studio). Uses the W3C Design Tokens Community Group draft
//         format, which Figma Tokens / Tokens Studio / Style Dictionary all
//         consume.
// Source: src/themes/index.ts — single source of truth, never diverges.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const THEMES_PATH = join(ROOT, 'src/themes/index.ts');
const OUT_DIR = join(__dirname, '../dist');
const OUT_FILE = join(OUT_DIR, 'tokens.figma.json');

// ── Token scales (mirror packages/ui defaults) ──────────────────────────────
const SPACING = { '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '6': 24, '8': 32, '12': 48, '16': 64, '24': 96 };
const RADIUS  = { sm: 4, md: 8, lg: 12, xl: 20, full: 9999 };
const FONT_SIZE = { xs: 12, sm: 13, base: 14, md: 15, lg: 17, xl: 20, '2xl': 24, '3xl': 32, '4xl': 48 };
const FONT_WEIGHT = { regular: 400, medium: 500, semibold: 600, bold: 700, black: 900 };
const SHADOW = {
  sm: '0 1px 2px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.10)',
  lg: '0 12px 32px rgba(0,0,0,0.14)',
  xl: '0 24px 60px rgba(0,0,0,0.18)',
};

// ── Parse themes from src/themes/index.ts ───────────────────────────────────
async function parseThemes() {
  const src = await readFile(THEMES_PATH, 'utf8');
  const themes = {};
  // Capture each `export const <name>: ThemeTokens = { ... };` block.
  const re = /export const (\w+):\s*ThemeTokens\s*=\s*\{([\s\S]*?)\};/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, name, body] = m;
    const tokens = {};
    const pairRe = /(\w+)\s*:\s*['"`]([#0-9a-fA-F]+)['"`]/g;
    let p;
    while ((p = pairRe.exec(body)) !== null) {
      tokens[p[1]] = p[2];
    }
    themes[name] = tokens;
  }
  return themes;
}

// ── Format as W3C Design Tokens ─────────────────────────────────────────────
function wrapColor(value) { return { $type: 'color', $value: value }; }
function wrapDim(value, unit = 'px') { return { $type: 'dimension', $value: `${value}${unit}` }; }
function wrapShadow(value) { return { $type: 'shadow', $value: value }; }
function wrapNumber(value) { return { $type: 'number', $value: value }; }

function buildPayload(themes) {
  const payload = {
    $description: 'tekivex-ui design tokens — exported from src/themes/index.ts',
    $version: '2.6.0',
    color: {},
    spacing: {},
    radius: {},
    fontSize: {},
    fontWeight: {},
    shadow: {},
  };

  // One color group per theme.
  for (const [themeName, tokens] of Object.entries(themes)) {
    payload.color[themeName] = {};
    for (const [k, v] of Object.entries(tokens)) {
      payload.color[themeName][k] = wrapColor(v);
    }
  }

  for (const [k, v] of Object.entries(SPACING))     payload.spacing[k]    = wrapDim(v);
  for (const [k, v] of Object.entries(RADIUS))      payload.radius[k]     = wrapDim(v);
  for (const [k, v] of Object.entries(FONT_SIZE))   payload.fontSize[k]   = wrapDim(v);
  for (const [k, v] of Object.entries(FONT_WEIGHT)) payload.fontWeight[k] = wrapNumber(v);
  for (const [k, v] of Object.entries(SHADOW))      payload.shadow[k]     = wrapShadow(v);

  return payload;
}

async function main() {
  const themes = await parseThemes();
  const themeCount = Object.keys(themes).length;
  if (themeCount === 0) {
    console.error('✗ No themes found in', THEMES_PATH);
    process.exit(1);
  }
  const payload = buildPayload(themes);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2));
  const tokenTotal =
    Object.values(themes).reduce((n, t) => n + Object.keys(t).length, 0) +
    Object.keys(SPACING).length +
    Object.keys(RADIUS).length +
    Object.keys(FONT_SIZE).length +
    Object.keys(FONT_WEIGHT).length +
    Object.keys(SHADOW).length;
  console.log(`✓ Exported ${tokenTotal} tokens across ${themeCount} themes → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('✗', err?.message || err);
  process.exit(1);
});
