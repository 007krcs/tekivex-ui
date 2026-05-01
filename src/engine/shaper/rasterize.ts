/**
 * Tekivex UI — engine/shaper/rasterize
 *
 * Browser-only fallback for drawing complex-script text into a PDF: render
 * the text to an offscreen canvas (which delegates to the platform's text
 * engine — Pango, CoreText, DirectWrite — that handles Indic / Arabic /
 * Hebrew shaping correctly), then export the canvas as a JPEG byte sequence
 * the PDF document can embed via /DCTDecode.
 *
 * This trades scalability for fidelity. For biodatas at 300 DPI (the
 * downloadable PDF target), users do not perceive the difference.
 */

const SSR = typeof document === 'undefined' || typeof window === 'undefined';

export interface RasterizeOptions {
  fontSize: number;
  fontFamily?: string;
  fontWeight?: number | 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  fill?: string;
  background?: string;
  /** Scale factor applied during rasterization (e.g., 4 → 4× DPI). */
  scale?: number;
  /** JPEG quality 0..1. Default 0.92. */
  quality?: number;
  /** Padding in CSS px applied before scaling. */
  padding?: number;
}

export interface RasterizedText {
  /** JPEG bytes ready to embed in a PdfDocument via addJpegImage. */
  bytes: Uint8Array;
  /** Pixel width of the rasterized image. */
  pixelWidth: number;
  /** Pixel height of the rasterized image. */
  pixelHeight: number;
  /** Layout width in PDF points (intended display width). */
  pointWidth: number;
  /** Layout height in PDF points. */
  pointHeight: number;
}

function buildFont(opts: RasterizeOptions): string {
  const style = opts.fontStyle ?? 'normal';
  const weight = opts.fontWeight ?? 'normal';
  const family = opts.fontFamily ?? '"Noto Sans", system-ui, sans-serif';
  return `${style} ${weight} ${opts.fontSize}px ${family}`;
}

/**
 * Rasterize a single line of text. Multi-line callers should pre-split and
 * stack rasterized strips themselves so the layout system can position each
 * line precisely.
 */
export async function rasterizeText(
  text: string,
  options: RasterizeOptions,
): Promise<RasterizedText> {
  if (SSR) throw new Error('engine/shaper: rasterizeText requires a browser');

  const scale = options.scale ?? 4;
  const padding = options.padding ?? 2;
  const fill = options.fill ?? '#000000';

  // First pass: measure on a throwaway 1x1 canvas.
  const measure = document.createElement('canvas');
  const mctx = measure.getContext('2d');
  if (!mctx) throw new Error('engine/shaper: 2D context unavailable');
  mctx.font = buildFont(options);
  const metrics = mctx.measureText(text);

  const ascent =
    (metrics as TextMetrics).actualBoundingBoxAscent ?? options.fontSize * 0.8;
  const descent =
    (metrics as TextMetrics).actualBoundingBoxDescent ?? options.fontSize * 0.2;

  const widthCss = Math.ceil(metrics.width + padding * 2);
  const heightCss = Math.ceil(ascent + descent + padding * 2);

  // Second pass: actual draw on a properly-sized canvas at scale × DPI.
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, widthCss * scale);
  canvas.height = Math.max(1, heightCss * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('engine/shaper: 2D context unavailable');

  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Solid white background — JPEG has no alpha. Caller composites onto the
    // PDF page so the background must match the page color (usually #fff).
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.scale(scale, scale);
  ctx.font = buildFont(options);
  ctx.fillStyle = fill;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, padding, padding + ascent);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', options.quality ?? 0.92),
  );
  if (!blob) throw new Error('engine/shaper: canvas.toBlob returned null');
  const buf = new Uint8Array(await blob.arrayBuffer());

  return {
    bytes: buf,
    pixelWidth: canvas.width,
    pixelHeight: canvas.height,
    pointWidth: widthCss,
    pointHeight: heightCss,
  };
}
