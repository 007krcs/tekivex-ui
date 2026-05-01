/**
 * Tekivex UI — engine/pdf/standard-fonts
 *
 * The 14 base fonts every conforming PDF reader is required to ship. Using
 * these means we don't have to embed font program data — the document just
 * names them. Latin only; for Indic scripts an embedded TrueType (added in a
 * follow-up commit) is required.
 */

export type StandardFontName =
  | 'Helvetica'
  | 'Helvetica-Bold'
  | 'Helvetica-Oblique'
  | 'Helvetica-BoldOblique'
  | 'Times-Roman'
  | 'Times-Bold'
  | 'Times-Italic'
  | 'Times-BoldItalic'
  | 'Courier'
  | 'Courier-Bold'
  | 'Courier-Oblique'
  | 'Courier-BoldOblique'
  | 'Symbol'
  | 'ZapfDingbats';

export const STANDARD_FONT_NAMES: ReadonlyArray<StandardFontName> = [
  'Helvetica',
  'Helvetica-Bold',
  'Helvetica-Oblique',
  'Helvetica-BoldOblique',
  'Times-Roman',
  'Times-Bold',
  'Times-Italic',
  'Times-BoldItalic',
  'Courier',
  'Courier-Bold',
  'Courier-Oblique',
  'Courier-BoldOblique',
  'Symbol',
  'ZapfDingbats',
];

/** Whether the given name is one of the 14 standard fonts. */
export function isStandardFont(name: string): name is StandardFontName {
  return (STANDARD_FONT_NAMES as ReadonlyArray<string>).includes(name);
}

/**
 * Pick a standard font by family + weight + style. Defaults to Helvetica.
 * Used by the scene renderer to translate a TextNode's `fontFamily` /
 * `fontWeight` / `fontStyle` into a PDF base font name.
 */
export function pickStandardFont(options: {
  family?: string;
  bold?: boolean;
  italic?: boolean;
}): StandardFontName {
  const family = (options.family ?? '').toLowerCase();
  const isTimes = /times|serif/.test(family);
  const isCourier = /courier|mono/.test(family);
  const bold = !!options.bold;
  const italic = !!options.italic;

  if (isCourier) {
    if (bold && italic) return 'Courier-BoldOblique';
    if (bold) return 'Courier-Bold';
    if (italic) return 'Courier-Oblique';
    return 'Courier';
  }
  if (isTimes) {
    if (bold && italic) return 'Times-BoldItalic';
    if (bold) return 'Times-Bold';
    if (italic) return 'Times-Italic';
    return 'Times-Roman';
  }
  // Helvetica family (default sans-serif)
  if (bold && italic) return 'Helvetica-BoldOblique';
  if (bold) return 'Helvetica-Bold';
  if (italic) return 'Helvetica-Oblique';
  return 'Helvetica';
}

/**
 * Coarse advance-width estimate for standard-14 fonts at 1000 unit em. Real
 * AFM tables would give per-glyph widths; for biodata sizing we only need
 * approximate "is this string under the column width?" measurements during
 * Scene → PDF rendering. A 0.5 average proportional width is a defensible
 * approximation for Helvetica/Times; Courier is monospace at 0.6.
 */
export function estimateAdvance(font: StandardFontName, text: string): number {
  const isMono = font.startsWith('Courier');
  const avg = isMono ? 0.6 : 0.5; // em
  return text.length * avg;
}
