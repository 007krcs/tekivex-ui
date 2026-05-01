/**
 * Tekivex UI — engine/pdf/page
 *
 * A page builds a content stream from typed graphics ops. Coordinates are
 * native PDF (origin BOTTOM-LEFT, Y-up). The Scene renderer (engine/pdf/scene)
 * converts from the top-left scene convention before calling these methods.
 */

import {
  bytes,
  concatBytes,
  encodeWinAnsi,
  escapePdfLiteral,
  fmtNum,
  pdfName,
} from './encoding';
import type {
  PdfDocument,
  PdfFontResource,
  PdfImageResource,
} from './document';

export interface RgbColor {
  r: number; // 0..1
  g: number; // 0..1
  b: number; // 0..1
}

function rgb(c: string | RgbColor | undefined): RgbColor | undefined {
  if (!c) return undefined;
  if (typeof c !== 'string') return clampRgb(c);
  return parseHexColor(c);
}

function clampRgb(c: RgbColor): RgbColor {
  const cl = (v: number): number => Math.max(0, Math.min(1, v));
  return { r: cl(c.r), g: cl(c.g), b: cl(c.b) };
}

function parseHexColor(input: string): RgbColor | undefined {
  let s = input.trim();
  if (s.startsWith('#')) s = s.slice(1);
  if (s.length === 3) {
    s = s
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (s.length !== 6) return undefined;
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return undefined;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

export interface DrawTextOptions {
  font: PdfFontResource;
  size: number;
  x: number;
  y: number;
  fill?: string | RgbColor;
}

export interface DrawRectOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string | RgbColor;
  stroke?: string | RgbColor;
  strokeWidth?: number;
  /** Uniform corner radius. */
  radius?: number;
}

export interface DrawLineOptions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string | RgbColor;
  strokeWidth?: number;
  dash?: ReadonlyArray<number>;
}

export interface DrawImageOptions {
  image: PdfImageResource;
  x: number;
  y: number;
  /** Drawn width on the page. */
  width: number;
  /** Drawn height on the page. */
  height: number;
}

/**
 * PdfPage builds a content stream incrementally. Each draw* method appends
 * graphics operators that the document serializer will wrap as a stream
 * object referenced by the page's /Contents entry.
 */
export class PdfPage {
  private parts: string[] = [];
  private fonts: PdfFontResource[] = [];
  private images: PdfImageResource[] = [];

  constructor(
    private readonly doc: PdfDocument,
    public readonly width: number,
    public readonly height: number,
  ) {}

  /** Used by document serializer to fill the page's /Resources dict. */
  get usedFonts(): ReadonlyArray<PdfFontResource> {
    return this.fonts;
  }
  get usedImages(): ReadonlyArray<PdfImageResource> {
    return this.images;
  }

  private trackFont(font: PdfFontResource): void {
    if (!this.fonts.find((f) => f.resourceName === font.resourceName))
      this.fonts.push(font);
  }
  private trackImage(image: PdfImageResource): void {
    if (!this.images.find((i) => i.resourceName === image.resourceName))
      this.images.push(image);
  }

  /* ----- Graphics state -------------------------------------------------- */

  saveState(): this {
    this.parts.push('q');
    return this;
  }
  restoreState(): this {
    this.parts.push('Q');
    return this;
  }

  setFillColor(c: string | RgbColor): this {
    const col = rgb(c);
    if (col) this.parts.push(`${fmtNum(col.r)} ${fmtNum(col.g)} ${fmtNum(col.b)} rg`);
    return this;
  }

  setStrokeColor(c: string | RgbColor): this {
    const col = rgb(c);
    if (col) this.parts.push(`${fmtNum(col.r)} ${fmtNum(col.g)} ${fmtNum(col.b)} RG`);
    return this;
  }

  setLineWidth(w: number): this {
    this.parts.push(`${fmtNum(w)} w`);
    return this;
  }

  setLineDash(pattern: ReadonlyArray<number>, phase = 0): this {
    const arr = pattern.map(fmtNum).join(' ');
    this.parts.push(`[${arr}] ${fmtNum(phase)} d`);
    return this;
  }

  /* ----- Text ------------------------------------------------------------ */

  drawText(text: string, options: DrawTextOptions): this {
    this.trackFont(options.font);
    const fill = rgb(options.fill);
    this.parts.push('q');
    if (fill) this.parts.push(`${fmtNum(fill.r)} ${fmtNum(fill.g)} ${fmtNum(fill.b)} rg`);
    this.parts.push('BT');
    this.parts.push(`${pdfName(options.font.resourceName)} ${fmtNum(options.size)} Tf`);
    this.parts.push(`1 0 0 1 ${fmtNum(options.x)} ${fmtNum(options.y)} Tm`);
    // Encode text via WinAnsi for standard 14 fonts. Unsupported codepoints
    // become '?' — Indic scripts use the path renderer in a future commit.
    const encoded = encodeWinAnsi(text);
    let s = '';
    for (let i = 0; i < encoded.length; i++) s += String.fromCharCode(encoded[i]);
    this.parts.push(`(${escapePdfLiteral(s)}) Tj`);
    this.parts.push('ET');
    this.parts.push('Q');
    return this;
  }

  /* ----- Rectangles ------------------------------------------------------ */

  drawRect(opts: DrawRectOptions): this {
    const fill = rgb(opts.fill);
    const stroke = rgb(opts.stroke);
    if (!fill && !stroke) return this;

    this.parts.push('q');
    if (fill) this.parts.push(`${fmtNum(fill.r)} ${fmtNum(fill.g)} ${fmtNum(fill.b)} rg`);
    if (stroke) this.parts.push(`${fmtNum(stroke.r)} ${fmtNum(stroke.g)} ${fmtNum(stroke.b)} RG`);
    if (opts.strokeWidth != null) this.parts.push(`${fmtNum(opts.strokeWidth)} w`);

    const r = opts.radius && opts.radius > 0 ? Math.min(opts.radius, opts.width / 2, opts.height / 2) : 0;
    if (r === 0) {
      this.parts.push(`${fmtNum(opts.x)} ${fmtNum(opts.y)} ${fmtNum(opts.width)} ${fmtNum(opts.height)} re`);
    } else {
      // Rounded rectangle path using cubic Beziers (kappa = 0.5523)
      const k = 0.5522847498 * r;
      const x = opts.x;
      const y = opts.y;
      const w = opts.width;
      const h = opts.height;
      this.parts.push(`${fmtNum(x + r)} ${fmtNum(y)} m`);
      this.parts.push(`${fmtNum(x + w - r)} ${fmtNum(y)} l`);
      this.parts.push(
        `${fmtNum(x + w - r + k)} ${fmtNum(y)} ${fmtNum(x + w)} ${fmtNum(y + r - k)} ${fmtNum(x + w)} ${fmtNum(y + r)} c`,
      );
      this.parts.push(`${fmtNum(x + w)} ${fmtNum(y + h - r)} l`);
      this.parts.push(
        `${fmtNum(x + w)} ${fmtNum(y + h - r + k)} ${fmtNum(x + w - r + k)} ${fmtNum(y + h)} ${fmtNum(x + w - r)} ${fmtNum(y + h)} c`,
      );
      this.parts.push(`${fmtNum(x + r)} ${fmtNum(y + h)} l`);
      this.parts.push(
        `${fmtNum(x + r - k)} ${fmtNum(y + h)} ${fmtNum(x)} ${fmtNum(y + h - r + k)} ${fmtNum(x)} ${fmtNum(y + h - r)} c`,
      );
      this.parts.push(`${fmtNum(x)} ${fmtNum(y + r)} l`);
      this.parts.push(
        `${fmtNum(x)} ${fmtNum(y + r - k)} ${fmtNum(x + r - k)} ${fmtNum(y)} ${fmtNum(x + r)} ${fmtNum(y)} c`,
      );
      this.parts.push('h');
    }

    if (fill && stroke) this.parts.push('B');
    else if (fill) this.parts.push('f');
    else this.parts.push('S');
    this.parts.push('Q');
    return this;
  }

  /* ----- Lines ----------------------------------------------------------- */

  drawLine(opts: DrawLineOptions): this {
    const stroke = rgb(opts.stroke ?? { r: 0, g: 0, b: 0 });
    if (!stroke) return this;
    this.parts.push('q');
    this.parts.push(`${fmtNum(stroke.r)} ${fmtNum(stroke.g)} ${fmtNum(stroke.b)} RG`);
    if (opts.strokeWidth != null) this.parts.push(`${fmtNum(opts.strokeWidth)} w`);
    if (opts.dash && opts.dash.length > 0) {
      this.parts.push(`[${opts.dash.map(fmtNum).join(' ')}] 0 d`);
    }
    this.parts.push(`${fmtNum(opts.x1)} ${fmtNum(opts.y1)} m`);
    this.parts.push(`${fmtNum(opts.x2)} ${fmtNum(opts.y2)} l`);
    this.parts.push('S');
    this.parts.push('Q');
    return this;
  }

  /* ----- Images ---------------------------------------------------------- */

  drawImage(opts: DrawImageOptions): this {
    this.trackImage(opts.image);
    this.parts.push('q');
    // PDF images are drawn from a 1x1 unit square; scale to width/height and
    // translate to (x, y) in one cm operator.
    this.parts.push(
      `${fmtNum(opts.width)} 0 0 ${fmtNum(opts.height)} ${fmtNum(opts.x)} ${fmtNum(opts.y)} cm`,
    );
    this.parts.push(`${pdfName(opts.image.resourceName)} Do`);
    this.parts.push('Q');
    return this;
  }

  /* ----- Clipping (rounded rect, used for photo frames) ------------------ */

  pushClipRoundedRect(x: number, y: number, w: number, h: number, r: number): this {
    const radius = Math.min(r, w / 2, h / 2);
    if (radius <= 0) {
      this.parts.push('q');
      this.parts.push(`${fmtNum(x)} ${fmtNum(y)} ${fmtNum(w)} ${fmtNum(h)} re`);
      this.parts.push('W n');
      return this;
    }
    const k = 0.5522847498 * radius;
    this.parts.push('q');
    this.parts.push(`${fmtNum(x + radius)} ${fmtNum(y)} m`);
    this.parts.push(`${fmtNum(x + w - radius)} ${fmtNum(y)} l`);
    this.parts.push(
      `${fmtNum(x + w - radius + k)} ${fmtNum(y)} ${fmtNum(x + w)} ${fmtNum(y + radius - k)} ${fmtNum(x + w)} ${fmtNum(y + radius)} c`,
    );
    this.parts.push(`${fmtNum(x + w)} ${fmtNum(y + h - radius)} l`);
    this.parts.push(
      `${fmtNum(x + w)} ${fmtNum(y + h - radius + k)} ${fmtNum(x + w - radius + k)} ${fmtNum(y + h)} ${fmtNum(x + w - radius)} ${fmtNum(y + h)} c`,
    );
    this.parts.push(`${fmtNum(x + radius)} ${fmtNum(y + h)} l`);
    this.parts.push(
      `${fmtNum(x + radius - k)} ${fmtNum(y + h)} ${fmtNum(x)} ${fmtNum(y + h - radius + k)} ${fmtNum(x)} ${fmtNum(y + h - radius)} c`,
    );
    this.parts.push(`${fmtNum(x)} ${fmtNum(y + radius)} l`);
    this.parts.push(
      `${fmtNum(x)} ${fmtNum(y + radius - k)} ${fmtNum(x + radius - k)} ${fmtNum(y)} ${fmtNum(x + radius)} ${fmtNum(y)} c`,
    );
    this.parts.push('h W n');
    return this;
  }

  popClip(): this {
    this.parts.push('Q');
    return this;
  }

  /* ----- Serialization --------------------------------------------------- */

  /** Serialize the content stream to bytes (newline-separated operators). */
  buildContentStream(): Uint8Array {
    const text = this.parts.join('\n');
    return concatBytes([bytes(text)]);
  }
}

// Avoid unused-import warning when PdfDocument type is only used for typing.
void (null as PdfDocument | null);
