#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Build a variant catalog for the Figma kit.
//
// Walks src/components/Tkx*.tsx, extracts the top-level props interface, and
// for each union-literal prop (size, variant, etc.) records the values.
// Output: dist/variants.json — fed into the Figma plugin that stamps one
// component frame per combination.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const COMPONENT_DIR = join(ROOT, 'src/components');
const OUT_FILE = join(__dirname, '../dist/variants.json');

// Extract `export interface <ComponentName>Props { ... }` body.
function extractPropsBlock(src, componentName) {
  const re = new RegExp(
    `export\\s+interface\\s+${componentName}Props[^{]*\\{([\\s\\S]*?)\\n\\}`,
    'm',
  );
  const m = re.exec(src);
  return m ? m[1] : null;
}

// For each prop in the interface, capture its name + union-literal values if any.
function parseProps(body) {
  const props = [];
  // Match: name?: 'a' | 'b' | 'c';   or   name: boolean;   or   name?: string;
  const lineRe = /^\s*(\w+)(\?)?\s*:\s*([^;]+);/gm;
  let m;
  while ((m = lineRe.exec(body)) !== null) {
    const [, name, optional, typeStr] = m;
    const entry = { name, optional: !!optional, type: typeStr.trim() };
    const literalRe = /'([^']+)'/g;
    const literals = [];
    let lm;
    while ((lm = literalRe.exec(typeStr)) !== null) literals.push(lm[1]);
    if (literals.length >= 2) entry.values = literals;
    if (/\bboolean\b/.test(typeStr)) entry.values = [true, false];
    props.push(entry);
  }
  return props;
}

async function main() {
  const files = (await readdir(COMPONENT_DIR)).filter((f) => /^Tkx.+\.tsx$/.test(f));
  const catalog = {
    $description: 'tekivex-ui component variant catalog — generated from src/components',
    $version: '2.6.0',
    generatedAt: new Date().toISOString(),
    components: {},
  };

  for (const file of files) {
    const componentName = file.replace(/\.tsx$/, '');
    const src = await readFile(join(COMPONENT_DIR, file), 'utf8');
    const body = extractPropsBlock(src, componentName);
    if (!body) continue;
    const props = parseProps(body);
    const variantProps = props.filter((p) => p.values);
    if (variantProps.length === 0) continue;
    const combinations = variantProps.reduce((n, p) => n * p.values.length, 1);
    catalog.components[componentName] = { props, variantCount: combinations };
  }

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(catalog, null, 2));

  const compCount = Object.keys(catalog.components).length;
  const totalVariants = Object.values(catalog.components).reduce((n, c) => n + c.variantCount, 0);
  console.log(`✓ ${compCount} components, ${totalVariants} variant combinations → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('✗', err?.message || err);
  process.exit(1);
});
