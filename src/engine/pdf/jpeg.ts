/**
 * Tekivex UI — engine/pdf/jpeg
 *
 * Read width/height/colorspace from a JPEG without decoding pixels. JPEG bytes
 * embed directly into a PDF as a /DCTDecode XObject — the reader handles
 * decompression — so all we need is the SOF marker.
 */

export interface JpegInfo {
  width: number;
  height: number;
  /** Number of color components: 1 (grey), 3 (RGB), 4 (CMYK). */
  components: 1 | 3 | 4;
  /** Bit depth per component (typically 8). */
  bitsPerComponent: number;
}

const SOI = 0xffd8;
const EOI = 0xffd9;
// Start-Of-Frame markers carrying dimensions
const SOF_MARKERS = new Set([
  0xffc0, 0xffc1, 0xffc2, 0xffc3, 0xffc5, 0xffc6, 0xffc7, 0xffc9, 0xffca, 0xffcb,
  0xffcd, 0xffce, 0xffcf,
]);

export function parseJpeg(bytes: Uint8Array): JpegInfo {
  if (bytes.length < 4) throw new Error('engine/pdf: jpeg too short');
  const u16 = (off: number): number => (bytes[off] << 8) | bytes[off + 1];
  if (u16(0) !== SOI) throw new Error('engine/pdf: not a JPEG (missing SOI)');

  let off = 2;
  while (off < bytes.length) {
    if (bytes[off] !== 0xff) throw new Error('engine/pdf: jpeg marker out of sync');
    // Skip any fill bytes (0xff)
    while (off < bytes.length && bytes[off] === 0xff) off++;
    const marker = 0xff00 | bytes[off];
    off++;
    if (marker === EOI) break;
    // Standalone markers (no length): RSTn (0xFFD0..0xFFD7), SOI/EOI, TEM (0xFF01)
    const isStandalone =
      (marker >= 0xffd0 && marker <= 0xffd7) || marker === 0xff01;
    if (isStandalone) continue;
    const segLen = u16(off);
    if (segLen < 2) throw new Error('engine/pdf: jpeg invalid segment length');
    if (SOF_MARKERS.has(marker)) {
      // SOF segment: [length:2][bits:1][height:2][width:2][components:1]...
      const bits = bytes[off + 2];
      const height = u16(off + 3);
      const width = u16(off + 5);
      const components = bytes[off + 7] as 1 | 3 | 4;
      if (components !== 1 && components !== 3 && components !== 4) {
        throw new Error(`engine/pdf: jpeg unsupported components: ${components}`);
      }
      return { width, height, components, bitsPerComponent: bits };
    }
    off += segLen;
  }
  throw new Error('engine/pdf: jpeg has no SOF marker');
}
