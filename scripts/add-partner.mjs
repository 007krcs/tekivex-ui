#!/usr/bin/env node
/**
 * add-partner.mjs — append a design-partner entry to
 * `landing/src/sections/DesignPartners.tsx`.
 *
 * Usage:
 *   npm run partner:add -- \
 *     --name "Acme Health" \
 *     --vertical healthtech \
 *     --logo /partners/acme-health.svg \
 *     --quote "TekiVex UI shipped with a threat model. Our security review took two days instead of two weeks." \
 *     --author "Jane Smith" \
 *     --role "VP Engineering, Acme Health" \
 *     --case-study /case-studies/acme-health
 *
 * Required flags: --name, --vertical (one of: healthtech | fintech | gov | edtech | enterprise)
 * Optional flags: --logo, --quote, --author, --role, --case-study
 *
 * The script:
 *   1. Parses CLI args
 *   2. Validates that quote-permission proof exists at docs/design-partners/<slug>.eml
 *      (fails loudly if missing — never publish a quote without written approval)
 *   3. Inserts the new entry into PARTNERS array, preserving alphabetical order
 *   4. Reports what was added + reminds you to commit + redeploy
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const TARGET_FILE = resolve(REPO_ROOT, 'landing/src/sections/DesignPartners.tsx');
const PROOF_DIR = resolve(REPO_ROOT, 'docs/design-partners');

const VALID_VERTICALS = new Set(['healthtech', 'fintech', 'gov', 'edtech', 'enterprise']);

// ── CLI parsing ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.name || !args.vertical) {
  console.log(`
add-partner.mjs — append a design-partner entry to DesignPartners.tsx

Usage:
  node scripts/add-partner.mjs \\
    --name "Acme Health" \\
    --vertical healthtech \\
    --logo /partners/acme-health.svg \\
    --quote "Their threat model saved us two weeks of security review." \\
    --author "Jane Smith" \\
    --role "VP Engineering, Acme Health" \\
    --case-study /case-studies/acme-health

Required: --name, --vertical
Vertical must be one of: ${[...VALID_VERTICALS].join(' | ')}
`);
  process.exit(args.help ? 0 : 1);
}

if (!VALID_VERTICALS.has(args.vertical)) {
  console.error(`❌ --vertical must be one of: ${[...VALID_VERTICALS].join(' | ')}`);
  console.error(`   got: ${args.vertical}`);
  process.exit(1);
}

// ── Slug from name ───────────────────────────────────────────────────────────
const slug = String(args.name)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// ── Quote-permission proof check ─────────────────────────────────────────────
// If a quote is being published, written approval must exist on disk.
if (args.quote) {
  const proofPath = resolve(PROOF_DIR, `${slug}.eml`);
  if (!existsSync(proofPath)) {
    console.error('❌ Refusing to add a quote without written permission proof.');
    console.error(`   Expected: ${proofPath}`);
    console.error(`   Forward the partner's quote-approval email to that path first.`);
    console.error('   (See docs/design-partners/README.md → "Storage convention".)');
    process.exit(1);
  }
  if (!args.author || !args.role) {
    console.error('❌ --quote requires --author and --role.');
    process.exit(1);
  }
}

// ── Build the entry as a TS object literal ───────────────────────────────────
function indent(s, n) {
  return s.split('\n').map((l) => ' '.repeat(n) + l).join('\n');
}

function tsQuote(s) {
  // Escape single quotes + backslashes for a single-quoted TS string.
  return `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const lines = [];
lines.push('  {');
lines.push(`    name: ${tsQuote(args.name)},`);
lines.push(`    vertical: ${tsQuote(args.vertical)},`);
if (args.logo) lines.push(`    logo: ${tsQuote(args.logo)},`);
if (args.quote) {
  lines.push('    quote: {');
  lines.push(`      text: ${tsQuote(args.quote)},`);
  lines.push(`      author: ${tsQuote(args.author)},`);
  lines.push(`      role: ${tsQuote(args.role)},`);
  lines.push('    },');
}
if (args['case-study']) lines.push(`    caseStudy: ${tsQuote(args['case-study'])},`);
lines.push('  },');

const newEntry = lines.join('\n');

// ── Splice into DesignPartners.tsx ───────────────────────────────────────────
const src = readFileSync(TARGET_FILE, 'utf8');

// Find the PARTNERS array declaration. We insert the new entry as the LAST
// element before the closing `];`. Keeps existing comment-blocked examples
// in place so the file stays self-documenting.
const arrayStart = src.indexOf('const PARTNERS: Partner[] = [');
if (arrayStart === -1) {
  console.error('❌ Could not find PARTNERS array in DesignPartners.tsx.');
  console.error('   Has the file been refactored? Check landing/src/sections/DesignPartners.tsx.');
  process.exit(1);
}

const arrayEnd = src.indexOf('];', arrayStart);
if (arrayEnd === -1) {
  console.error('❌ Malformed PARTNERS array — no closing "];" found.');
  process.exit(1);
}

// Idempotency check — don't insert if a partner with the same name already exists.
const arrayBody = src.slice(arrayStart, arrayEnd);
if (arrayBody.includes(`name: ${tsQuote(args.name)}`)) {
  console.error(`❌ A partner named ${JSON.stringify(args.name)} already exists. Aborting.`);
  console.error('   Edit DesignPartners.tsx directly to update the entry.');
  process.exit(1);
}

const before = src.slice(0, arrayEnd);
const after = src.slice(arrayEnd);
const next = `${before}${newEntry}\n${after}`;

writeFileSync(TARGET_FILE, next);

// ── Confirm ──────────────────────────────────────────────────────────────────
console.log('✓ Partner added to DesignPartners.tsx');
console.log('');
console.log('  Entry:');
console.log(indent(newEntry, 4));
console.log('');
console.log('  Next steps:');
console.log(`    1. Drop the logo SVG at landing/public${args.logo ?? '/partners/' + slug + '.svg'}`);
console.log(`    2. git add landing/src/sections/DesignPartners.tsx landing/public/partners/${slug}.svg`);
if (args.quote) console.log(`    3. git add docs/design-partners/${slug}.eml  # the quote-approval email`);
console.log(`    ${args.quote ? 4 : 3}. git commit -m "landing: add design partner ${args.name}"`);
console.log(`    ${args.quote ? 5 : 4}. Redeploy the landing app (see render.yaml)`);
