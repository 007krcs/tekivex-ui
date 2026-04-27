// ─────────────────────────────────────────────────────────────────────────────
// tekivex-pdf — end-to-end smoke test
//
// Proves the public API actually produces a real PDF buffer that any reader
// (Acrobat, Chrome, mac Preview) can open. If this script exits 0 with
// "✓ All smoke tests passed", the package is adoptable as a Puppeteer
// replacement.
//
// Usage: node smoke-test.mjs   (from packages/tekivex-pdf/)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  renderToPDF,
  TkxPDFDocument,
  TkxPDFPage,
  TkxPDFText,
  TkxPDFView,
  TkxPDFRow,
  TkxPDFColumn,
  TkxPDFWatermark,
  BiodataTemplate,
  InvoiceTemplate,
} from './dist/index.js';

let failed = 0;
const tests = [];

function test(name, fn) {
  tests.push([name, fn]);
}

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

// ── Test 1 — bare-minimum document compiles to a valid PDF ──────────────
test('renderToPDF produces a buffer starting with %PDF- magic', async () => {
  const doc = React.createElement(
    TkxPDFDocument,
    null,
    React.createElement(
      TkxPDFPage,
      { size: 'A4' },
      React.createElement(TkxPDFText, null, 'Hello tekivex-pdf'),
    ),
  );
  const buffer = await renderToPDF(doc);
  ok(Buffer.isBuffer(buffer), `renderToPDF should return a Buffer, got ${typeof buffer}`);
  const magic = buffer.subarray(0, 5).toString('utf8');
  ok(magic === '%PDF-', `PDF magic mismatch: got "${magic}"`);
  ok(buffer.length > 500, `PDF too small (${buffer.length} bytes), likely empty`);
  console.log(`  ✓ PDF buffer: ${buffer.length} bytes, magic="${magic}"`);
});

// ── Test 2 — multi-component composition (Row + Column + nested Text) ───
test('Row/Column/View/Text compose without error', async () => {
  const doc = React.createElement(
    TkxPDFDocument,
    null,
    React.createElement(
      TkxPDFPage,
      { size: 'A4', margin: 40 },
      React.createElement(
        TkxPDFRow,
        null,
        React.createElement(
          TkxPDFColumn,
          { flex: 2 },
          React.createElement(TkxPDFText, { size: 24, weight: 'bold' }, 'Aisha Verma'),
          React.createElement(TkxPDFText, { color: 'muted' }, 'Mumbai, India'),
        ),
        React.createElement(
          TkxPDFColumn,
          { flex: 1 },
          React.createElement(TkxPDFView, null, React.createElement(TkxPDFText, null, 'Photo')),
        ),
      ),
    ),
  );
  const buffer = await renderToPDF(doc);
  ok(buffer.length > 1000, `Composed doc too small (${buffer.length} bytes)`);
  console.log(`  ✓ Composed Row/Column doc: ${buffer.length} bytes`);
});

// ── Test 3 — TkxPDFWatermark renders without error ──────────────────────
test('TkxPDFWatermark adds tiled overlay', async () => {
  const doc = React.createElement(
    TkxPDFDocument,
    null,
    React.createElement(
      TkxPDFPage,
      { size: 'A4' },
      React.createElement(TkxPDFWatermark, {
        text: 'PREVIEW · NOT FOR DISTRIBUTION',
        pattern: 'tiled',
        opacity: 0.08,
      }),
      React.createElement(TkxPDFText, null, 'Body content under watermark'),
    ),
  );
  const buffer = await renderToPDF(doc);
  ok(buffer.length > 500, 'Watermarked doc empty');
  console.log(`  ✓ Watermarked PDF: ${buffer.length} bytes`);
});

// ── Test 4 — BiodataTemplate (real-world template) renders end-to-end ──
test('BiodataTemplate renders to a valid PDF', async () => {
  const data = {
    name: 'Aisha Verma',
    subtitle: ['Mumbai, India', 'aisha@example.com'],
    personal: [
      { label: 'Date of Birth', value: '14 March 2002' },
      { label: 'Height',        value: "5'4\"" },
      { label: 'Complexion',    value: 'Fair' },
    ],
    education: [
      { label: 'Degree',     value: 'B.Tech Computer Science' },
      { label: 'University', value: 'IIT Mumbai' },
      { label: 'Profession', value: 'Software Engineer' },
    ],
    family: [
      { label: 'Father', value: 'Govt Service' },
      { label: 'Mother', value: 'Homemaker' },
    ],
  };
  const doc = React.createElement(BiodataTemplate, { data, blessing: '|| Shri ||' });
  const buffer = await renderToPDF(doc);
  ok(buffer.length > 2000, `Biodata too small (${buffer.length} bytes)`);
  const magic = buffer.subarray(0, 5).toString('utf8');
  ok(magic === '%PDF-', `BiodataTemplate did not produce a PDF (magic="${magic}")`);
  console.log(`  ✓ BiodataTemplate: ${buffer.length} bytes`);
});

// ── Test 5 — InvoiceTemplate (real-world template) renders ─────────────
test('InvoiceTemplate renders to a valid PDF', async () => {
  const data = {
    number:   'INV-2026-001',
    date:     '2026-04-27',
    dueDate:  '2026-05-27',
    currency: 'INR',
    from:  { name: 'TekiVex Inc.', lines: ['123 Tech Park', 'Pune 411014'], email: 'billing@tekivex.com' },
    to:    { name: 'Acme Corp',    lines: ['456 Business St',   'Mumbai 400001'], email: 'ap@acme.com' },
    items: [
      { description: 'Component licensing — Q1 2026', quantity: 1, unitPrice: 50000 },
      { description: 'Support package',                quantity: 1, unitPrice: 10000 },
    ],
    taxRate: 0.18,
    notes: 'Payment due within 30 days.',
  };
  const doc = React.createElement(InvoiceTemplate, { data });
  const buffer = await renderToPDF(doc);
  ok(buffer.length > 2000, `Invoice too small (${buffer.length} bytes)`);
  console.log(`  ✓ InvoiceTemplate: ${buffer.length} bytes`);
});

// ── Run ────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('tekivex-pdf — end-to-end smoke test');
console.log('══════════════════════════════════════════════════════════\n');

for (const [name, fn] of tests) {
  process.stdout.write(`Running: ${name}\n`);
  try {
    await fn();
  } catch (err) {
    console.error(`  ✗ FAILED: ${err.message}`);
    failed++;
  }
}

console.log('\n══════════════════════════════════════════════════════════');
if (failed === 0) {
  console.log(`✓ All ${tests.length} smoke tests passed.`);
  console.log('  tekivex-pdf is adoptable as a Puppeteer replacement.');
} else {
  console.error(`✗ ${failed} of ${tests.length} smoke tests FAILED.`);
}
console.log('══════════════════════════════════════════════════════════\n');

process.exit(failed === 0 ? 0 : 1);
