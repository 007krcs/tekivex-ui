import { describe, it, expect } from 'vitest';
import {
  PdfDocument,
  STANDARD_FONT_NAMES,
  isStandardFont,
  pickStandardFont,
  estimateAdvance,
  encodeWinAnsi,
  escapePdfLiteral,
  fmtNum,
  pdfName,
  pdfString,
  unicodeToWinAnsi,
  parseJpeg,
  renderSceneToPdfDocument,
  sceneToPdfBytes,
} from '../src/engine/pdf';
import type { Scene } from '../src/engine/canvas';

const td = new TextDecoder('latin1');
const asString = (b: Uint8Array): string => td.decode(b);

/* -------------------------------------------------------------------------- */
/* encoding                                                                    */
/* -------------------------------------------------------------------------- */

describe('engine/pdf — encoding', () => {
  it('escapes parens and backslashes', () => {
    expect(escapePdfLiteral('a(b)c')).toBe('a\\(b\\)c');
    expect(escapePdfLiteral('a\\b')).toBe('a\\\\b');
  });

  it('escapes newlines, tabs, returns', () => {
    expect(escapePdfLiteral('a\nb\tc\rd')).toBe('a\\nb\\tc\\rd');
  });

  it('pdfString wraps in parens', () => {
    expect(pdfString('Hello')).toBe('(Hello)');
  });

  it('pdfName escapes special bytes', () => {
    expect(pdfName('Hello')).toBe('/Hello');
    expect(pdfName('a/b')).toBe('/a#2Fb');
    expect(pdfName('a b')).toContain('#20');
  });

  it('fmtNum strips trailing zeros and never uses exponential', () => {
    expect(fmtNum(1)).toBe('1');
    expect(fmtNum(1.5)).toBe('1.5');
    expect(fmtNum(1e-7)).not.toContain('e');
    expect(fmtNum(NaN)).toBe('0');
  });

  it('unicodeToWinAnsi maps ASCII identity', () => {
    expect(unicodeToWinAnsi(0x41)).toBe(0x41);
    expect(unicodeToWinAnsi(0x7e)).toBe(0x7e);
  });

  it('unicodeToWinAnsi maps euro sign', () => {
    expect(unicodeToWinAnsi(0x20ac)).toBe(0x80);
  });

  it('unicodeToWinAnsi returns 0 for unmappable codepoints (Devanagari etc.)', () => {
    expect(unicodeToWinAnsi(0x0905)).toBe(0); // Devanagari A
  });

  it('encodeWinAnsi replaces unmappable with ?', () => {
    const out = encodeWinAnsi('A अ B');
    // Devanagari अ (0x0905) -> ? (0x3F)
    expect(Array.from(out).includes(0x3f)).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* standard fonts                                                              */
/* -------------------------------------------------------------------------- */

describe('engine/pdf — standard fonts', () => {
  it('lists all 14 standard fonts', () => {
    expect(STANDARD_FONT_NAMES.length).toBe(14);
  });

  it('isStandardFont accepts and rejects', () => {
    expect(isStandardFont('Helvetica')).toBe(true);
    expect(isStandardFont('Arial')).toBe(false);
  });

  it('pickStandardFont defaults to Helvetica family', () => {
    expect(pickStandardFont({})).toBe('Helvetica');
    expect(pickStandardFont({ bold: true })).toBe('Helvetica-Bold');
    expect(pickStandardFont({ bold: true, italic: true })).toBe('Helvetica-BoldOblique');
  });

  it('pickStandardFont chooses Times for serif', () => {
    expect(pickStandardFont({ family: 'Times New Roman' })).toBe('Times-Roman');
    expect(pickStandardFont({ family: 'serif', bold: true, italic: true })).toBe(
      'Times-BoldItalic',
    );
  });

  it('pickStandardFont chooses Courier for monospace', () => {
    expect(pickStandardFont({ family: 'Menlo, monospace' })).toBe('Courier');
    expect(pickStandardFont({ family: 'mono', bold: true })).toBe('Courier-Bold');
  });

  it('estimateAdvance is monospace for Courier', () => {
    expect(estimateAdvance('Courier', 'abc')).toBeCloseTo(1.8);
    expect(estimateAdvance('Helvetica', 'abc')).toBeCloseTo(1.5);
  });
});

/* -------------------------------------------------------------------------- */
/* JPEG parser                                                                 */
/* -------------------------------------------------------------------------- */

describe('engine/pdf — parseJpeg', () => {
  /** Minimal synthetic JPEG containing only SOI + SOF0 + EOI. */
  const fakeJpeg = (width: number, height: number, components = 3): Uint8Array => {
    const sof = new Uint8Array(2 + 2 + 1 + 2 + 2 + 1); // marker + length + bits + h + w + comps
    sof[0] = 0xff;
    sof[1] = 0xc0;
    sof[2] = 0; // length high byte
    sof[3] = sof.length - 2; // length excluding marker
    sof[4] = 8; // bits
    sof[5] = (height >> 8) & 0xff;
    sof[6] = height & 0xff;
    sof[7] = (width >> 8) & 0xff;
    sof[8] = width & 0xff;
    sof[9] = components;
    const out = new Uint8Array(2 + sof.length + 2);
    out.set([0xff, 0xd8], 0);
    out.set(sof, 2);
    out.set([0xff, 0xd9], 2 + sof.length);
    return out;
  };

  it('extracts width/height/components', () => {
    const info = parseJpeg(fakeJpeg(640, 480, 3));
    expect(info.width).toBe(640);
    expect(info.height).toBe(480);
    expect(info.components).toBe(3);
    expect(info.bitsPerComponent).toBe(8);
  });

  it('throws on missing SOI', () => {
    expect(() => parseJpeg(new Uint8Array([0, 0, 0, 0]))).toThrow();
  });

  it('throws on truncated input', () => {
    expect(() => parseJpeg(new Uint8Array([0xff, 0xd8]))).toThrow();
  });
});

/* -------------------------------------------------------------------------- */
/* PdfDocument structure                                                       */
/* -------------------------------------------------------------------------- */

describe('engine/pdf — PdfDocument structure', () => {
  it('emits %PDF-1.7 header and %%EOF trailer', () => {
    const doc = new PdfDocument({ title: 'Test' });
    doc.addPage(595, 842);
    const bytes = doc.serialize();
    const s = asString(bytes);
    expect(s.startsWith('%PDF-1.7')).toBe(true);
    expect(s.trim().endsWith('%%EOF')).toBe(true);
  });

  it('contains a binary marker comment after header', () => {
    const doc = new PdfDocument();
    doc.addPage(100, 100);
    const bytes = doc.serialize();
    // After "%PDF-1.7\n%" there should be 4 bytes >= 0x80
    const offset = '%PDF-1.7\n%'.length;
    expect(bytes[offset]).toBeGreaterThanOrEqual(0x80);
    expect(bytes[offset + 3]).toBeGreaterThanOrEqual(0x80);
  });

  it('produces a valid xref table with the correct number of entries', () => {
    const doc = new PdfDocument();
    doc.addPage(595, 842);
    const s = asString(doc.serialize());
    const xrefMatch = s.match(/xref\n0 (\d+)\n/);
    expect(xrefMatch).not.toBeNull();
    if (xrefMatch) {
      const total = parseInt(xrefMatch[1], 10);
      // Catalog + Info + Pages + Page + Content = 5 (entry 0 is free-list head)
      // Plus any fonts/images added by the (empty) page = 0.
      expect(total).toBeGreaterThanOrEqual(5);
    }
  });

  it('xref offsets are byte-accurate (n entries point to "N 0 obj")', () => {
    const doc = new PdfDocument({ title: 'Offsets' });
    doc.addPage(595, 842);
    const bytes = doc.serialize();
    const s = asString(bytes);
    const xrefStart = s.indexOf('xref\n');
    const lines = s.slice(xrefStart).split('\n');
    // header line: "xref", then "0 N"
    const total = parseInt(lines[1].split(' ')[1], 10);
    // Verify entry 1 (the first allocated object: catalog, ref id 1)
    const entry1 = lines[3]; // 0=xref, 1=0 N, 2=free entry, 3=entry 1
    const off1 = parseInt(entry1.slice(0, 10), 10);
    const slice = s.slice(off1, off1 + 8);
    expect(slice.startsWith('1 0 obj')).toBe(true);
    expect(total).toBeGreaterThan(1);
  });

  it('startxref points at the byte where xref starts', () => {
    const doc = new PdfDocument();
    doc.addPage(595, 842);
    const bytes = doc.serialize();
    const s = asString(bytes);
    const xrefStart = s.indexOf('xref\n');
    const m = s.match(/startxref\n(\d+)\n%%EOF$/);
    expect(m).not.toBeNull();
    if (m) expect(parseInt(m[1], 10)).toBe(xrefStart);
  });

  it('serializes /Title in the Info dict when provided', () => {
    const doc = new PdfDocument({ title: 'ShubhBio Sample' });
    doc.addPage(100, 100);
    const s = asString(doc.serialize());
    expect(s).toContain('/Title (ShubhBio Sample)');
  });

  it('de-duplicates standard font dicts across pages', () => {
    const doc = new PdfDocument();
    const a = doc.ensureStandardFont('Helvetica');
    const b = doc.ensureStandardFont('Helvetica');
    expect(a).toBe(b);
  });

  it('toBlob returns application/pdf', () => {
    const doc = new PdfDocument();
    doc.addPage(100, 100);
    const blob = doc.toBlob();
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Page content stream operators                                              */
/* -------------------------------------------------------------------------- */

describe('engine/pdf — PdfPage content operators', () => {
  it('drawText emits BT/Tf/Tm/Tj/ET sequence', () => {
    const doc = new PdfDocument();
    const page = doc.addPage(595, 842);
    const font = doc.ensureStandardFont('Helvetica');
    page.drawText('Hello', { font, size: 14, x: 50, y: 700 });
    const stream = asString(page.buildContentStream());
    expect(stream).toContain('BT');
    expect(stream).toContain(`${pdfName(font.resourceName)} 14 Tf`);
    expect(stream).toMatch(/1 0 0 1 50 700 Tm/);
    expect(stream).toContain('(Hello) Tj');
    expect(stream).toContain('ET');
  });

  it('drawText escapes parens in the source text', () => {
    const doc = new PdfDocument();
    const page = doc.addPage(595, 842);
    const font = doc.ensureStandardFont('Helvetica');
    page.drawText('a(b)c', { font, size: 12, x: 0, y: 0 });
    const stream = asString(page.buildContentStream());
    expect(stream).toContain('(a\\(b\\)c) Tj');
  });

  it('drawRect fill emits "re f"', () => {
    const doc = new PdfDocument();
    const page = doc.addPage(595, 842);
    page.drawRect({ x: 10, y: 20, width: 100, height: 50, fill: '#ff0000' });
    const stream = asString(page.buildContentStream());
    expect(stream).toContain('1 0 0 rg');
    expect(stream).toContain('10 20 100 50 re');
    expect(stream).toContain('f');
  });

  it('drawRect with stroke only emits "S"', () => {
    const doc = new PdfDocument();
    const page = doc.addPage(595, 842);
    page.drawRect({ x: 10, y: 20, width: 50, height: 50, stroke: '#000000', strokeWidth: 2 });
    const stream = asString(page.buildContentStream());
    expect(stream).toContain('0 0 0 RG');
    expect(stream).toContain('2 w');
    expect(stream.trim().endsWith('Q')).toBe(true);
    expect(stream).toContain('\nS\n');
  });

  it('drawRect with both fill and stroke emits "B"', () => {
    const doc = new PdfDocument();
    const page = doc.addPage(595, 842);
    page.drawRect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      fill: '#fff',
      stroke: '#000',
    });
    const stream = asString(page.buildContentStream());
    expect(stream).toContain('\nB\n');
  });

  it('drawRect with radius emits Bezier path commands', () => {
    const doc = new PdfDocument();
    const page = doc.addPage(595, 842);
    page.drawRect({ x: 0, y: 0, width: 50, height: 50, fill: '#abc', radius: 8 });
    const stream = asString(page.buildContentStream());
    expect(stream).toMatch(/\bc\b/); // cubic bezier
    expect(stream).toContain('h'); // close path
  });

  it('drawLine emits m/l/S', () => {
    const doc = new PdfDocument();
    const page = doc.addPage(595, 842);
    page.drawLine({ x1: 0, y1: 0, x2: 100, y2: 100, stroke: '#000', strokeWidth: 1 });
    const stream = asString(page.buildContentStream());
    expect(stream).toMatch(/0 0 m/);
    expect(stream).toMatch(/100 100 l/);
    expect(stream).toContain('S');
  });

  it('tracks fonts referenced by drawText so the page resources include them', () => {
    const doc = new PdfDocument();
    const page = doc.addPage(595, 842);
    const helvetica = doc.ensureStandardFont('Helvetica');
    const times = doc.ensureStandardFont('Times-Roman');
    page.drawText('A', { font: helvetica, size: 12, x: 0, y: 0 });
    page.drawText('B', { font: times, size: 12, x: 0, y: 20 });
    expect(page.usedFonts.length).toBe(2);
    const s = asString(doc.serialize());
    expect(s).toContain('/Font << ');
    expect(s).toContain(`${pdfName(helvetica.resourceName)} `);
    expect(s).toContain(`${pdfName(times.resourceName)} `);
  });
});

/* -------------------------------------------------------------------------- */
/* Scene → PDF round trip                                                      */
/* -------------------------------------------------------------------------- */

describe('engine/pdf — Scene → PDF', () => {
  const baseScene = (): Scene => ({
    width: 595,
    height: 842,
    background: '#ffffff',
    nodes: [
      { type: 'rect', x: 50, y: 50, width: 495, height: 60, fill: '#fbbf24' },
      {
        type: 'text',
        x: 60,
        y: 70,
        text: 'Marriage Biodata',
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#1f2937',
      },
      {
        type: 'line',
        x: 50,
        y: 130,
        x2: 545,
        y2: 130,
        stroke: '#9ca3af',
        strokeWidth: 1,
      },
      {
        type: 'group',
        x: 60,
        y: 160,
        children: [
          { type: 'text', x: 0, y: 0, text: 'Name: Krishna', fontSize: 12 },
          { type: 'text', x: 0, y: 18, text: 'DOB: 1990-01-01', fontSize: 12 },
        ],
      },
    ],
  });

  it('renders a parseable PDF with header, xref, and trailer', () => {
    const bytes = sceneToPdfBytes(baseScene(), { info: { title: 'Sample' } });
    const s = asString(bytes);
    expect(s.startsWith('%PDF-1.7')).toBe(true);
    expect(s).toContain('xref\n0 ');
    expect(s).toContain('trailer\n');
    expect(s).toContain('startxref\n');
    expect(s.trim().endsWith('%%EOF')).toBe(true);
    expect(s).toContain('/Title (Sample)');
  });

  it('embeds the rendered text strings (escaped) into the content stream', () => {
    const bytes = sceneToPdfBytes(baseScene());
    const s = asString(bytes);
    expect(s).toContain('(Marriage Biodata) Tj');
    expect(s).toContain('(Name: Krishna) Tj');
    expect(s).toContain('(DOB: 1990-01-01) Tj');
  });

  it('translates scene-y to PDF-y (top-left → bottom-left)', () => {
    // A rect at y=50 height=60 in a 842-tall scene should be drawn at PDF-y
    // = 842 - 50 - 60 = 732
    const bytes = sceneToPdfBytes(baseScene());
    const s = asString(bytes);
    expect(s).toContain('50 732 495 60 re');
  });

  it('chooses Helvetica-Bold for fontWeight=bold', () => {
    const bytes = sceneToPdfBytes(baseScene());
    const s = asString(bytes);
    expect(s).toContain('/BaseFont /Helvetica-Bold');
  });

  it('handles empty scenes', () => {
    const bytes = sceneToPdfBytes({ width: 100, height: 100, nodes: [] });
    const s = asString(bytes);
    expect(s.startsWith('%PDF-1.7')).toBe(true);
    expect(s.trim().endsWith('%%EOF')).toBe(true);
  });

  it('renderSceneToPdfDocument returns the new page', () => {
    const doc = new PdfDocument();
    const page = renderSceneToPdfDocument(baseScene(), doc);
    expect(page.width).toBe(595);
    expect(page.height).toBe(842);
  });

  it('right-aligned text places baseline x to the left of the anchor', () => {
    const scene: Scene = {
      width: 100,
      height: 100,
      nodes: [
        { type: 'text', x: 80, y: 10, text: 'X', fontSize: 12, align: 'right' },
      ],
    };
    const s = asString(sceneToPdfBytes(scene));
    // anchor is x=80, the rendered Tm should have x < 80
    const m = s.match(/1 0 0 1 (-?[\d.]+) [\d.]+ Tm/);
    expect(m).not.toBeNull();
    if (m) expect(parseFloat(m[1])).toBeLessThan(80);
  });
});
