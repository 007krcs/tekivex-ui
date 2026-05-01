/**
 * Tekivex UI — engine/pdf
 *
 * Native PDF 1.7 producer. Zero external dependencies; ASCII byte writer,
 * standard 14 fonts, JPEG image embedding via /DCTDecode (no decode needed),
 * cross-reference table, trailer, and %%EOF. Rounded-rect clipping for photo
 * frames is supported via cubic Beziers.
 *
 * Out of scope for v1 (planned follow-ups):
 *  - TrueType font embedding for Indic / Arabic scripts (will arrive with
 *    engine/shaper which supplies pre-shaped glyph paths).
 *  - DEFLATE-compressed content streams. We emit uncompressed streams; the
 *    output is larger but byte-equivalent in fidelity. Adding /FlateDecode
 *    via CompressionStream is a localized change in document.ts.
 *  - Encryption. Not relevant for our threat model — biodata downloads are
 *    one-time signed and the watermark is the deterrent.
 */

export { PdfDocument, refToken } from './document';
export type {
  PdfDocumentInfo,
  PdfFontResource,
  PdfImageResource,
  PdfRef,
} from './document';

export { PdfPage } from './page';
export type {
  DrawImageOptions,
  DrawLineOptions,
  DrawRectOptions,
  DrawTextOptions,
  RgbColor,
} from './page';

export {
  STANDARD_FONT_NAMES,
  isStandardFont,
  pickStandardFont,
  estimateAdvance,
} from './standard-fonts';
export type { StandardFontName } from './standard-fonts';

export { parseJpeg } from './jpeg';
export type { JpegInfo } from './jpeg';

export {
  bytes,
  concatBytes,
  encodeWinAnsi,
  escapePdfLiteral,
  fmtNum,
  pdfHexString,
  pdfName,
  pdfString,
  unicodeToWinAnsi,
} from './encoding';

export {
  renderSceneToPdfDocument,
} from './scene';
export type { RenderSceneToPdfOptions } from './scene';

import type { Scene } from '../canvas';
import { PdfDocument as PdfDocumentClass } from './document';
import { renderSceneToPdfDocument as renderImpl } from './scene';
import type { RenderSceneToPdfOptions } from './scene';

/**
 * Convenience: render a Scene to a Blob ready for download.
 */
export function sceneToPdfBlob(
  scene: Scene,
  options: RenderSceneToPdfOptions & { info?: import('./document').PdfDocumentInfo } = {},
): Blob {
  const doc = new PdfDocumentClass(options.info ?? {});
  renderImpl(scene, doc, options);
  return doc.toBlob();
}

/**
 * Convenience: render a Scene to raw bytes (Uint8Array). Useful in non-browser
 * contexts (Node test runners, edge functions) where Blob isn't ideal.
 */
export function sceneToPdfBytes(
  scene: Scene,
  options: RenderSceneToPdfOptions & { info?: import('./document').PdfDocumentInfo } = {},
): Uint8Array {
  const doc = new PdfDocumentClass(options.info ?? {});
  renderImpl(scene, doc, options);
  return doc.serialize();
}
