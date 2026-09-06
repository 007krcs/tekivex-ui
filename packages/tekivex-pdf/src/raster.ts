// ─────────────────────────────────────────────────────────────────────────────
// tekivex-pdf/raster — PNG/JPEG output via Sharp.
//
// Why a separate sub-export: Sharp ships ~20-30MB of native binaries per
// platform. Most consumers only want PDF output, so we keep it out of the
// main bundle and ship as an optional peer dep.
//
// Usage:
//   npm install sharp
//   import { renderToImage } from 'tekivex-pdf/raster';
//
//   const png = await renderToImage(<MyDoc />, { format: 'png', dpi: 144 });
//
// Sharp lazily-imports — if it isn't installed, the function throws a clear
// error pointing to the install step.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
type DocEl = ReactElement<DocumentProps>;
import { renderToBuffer } from '@react-pdf/renderer';

export type ImageFormat = 'png' | 'jpeg' | 'webp';

export interface RenderToImageOptions {
  /** Output format. Default: 'png'. */
  format?: ImageFormat;
  /** Page index to rasterise (0-based). Default: 0. */
  page?: number;
  /** Output DPI. Default 144 (2× of standard 72). */
  dpi?: number;
  /** JPEG / WebP quality 1-100. Default: 92. */
  quality?: number;
  /**
   * Optional output max width in pixels. Image is downscaled to fit.
   * Aspect ratio is preserved.
   */
  maxWidth?: number;
  /** Background colour for transparent areas (JPEG/WebP). Default: white. */
  background?: string;
}

// `sharp` is an optional peer dep; skip the typed import so consumers
// without sharp installed don't fail TS compilation of this package.
async function loadSharp(): Promise<any> {
  try {
    // dynamic import keeps Sharp out of the main bundle path
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m: any = await import(/* @vite-ignore */ ('sharp' as string));
    return m.default ?? m;
  } catch {
    throw new Error(
      "tekivex-pdf/raster requires the 'sharp' package. Install it with " +
        "`npm install sharp`. See https://www.tekivex.com/ui/pdf/render-to-png/.",
    );
  }
}

/**
 * Render a PDF document tree to a raster image (PNG / JPEG / WebP).
 * Uses Sharp under the hood — Sharp must be installed by the consumer.
 *
 * @example
 * import { renderToImage } from 'tekivex-pdf/raster';
 * const png = await renderToImage(
 *   <BiodataTemplate data={…} />,
 *   { format: 'png', dpi: 200, maxWidth: 1600 }
 * );
 * await fs.writeFile('biodata.png', png);
 */
export async function renderToImage(
  element: DocEl,
  options: RenderToImageOptions = {},
): Promise<Buffer> {
  const {
    format = 'png',
    page = 0,
    dpi = 144,
    quality = 92,
    maxWidth,
    background = '#ffffff',
  } = options;

  const Sharp = await loadSharp();
  const pdfBuffer = await renderToBuffer(element);

  // Sharp's PDF input requires the PDF page parameter and accepts density.
  let pipeline = (Sharp as any)(pdfBuffer, { density: dpi, page });

  if (maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  if (format === 'png') {
    return pipeline.flatten({ background }).png({ quality }).toBuffer();
  }
  if (format === 'jpeg') {
    return pipeline.flatten({ background }).jpeg({ quality }).toBuffer();
  }
  return pipeline.flatten({ background }).webp({ quality }).toBuffer();
}

/**
 * Render every page of a document as separate raster buffers.
 * Returns one Buffer per page, in document order.
 */
export async function renderToImages(
  element: DocEl,
  options: Omit<RenderToImageOptions, 'page'> = {},
): Promise<Buffer[]> {
  const {
    format = 'png',
    dpi = 144,
    quality = 92,
    maxWidth,
    background = '#ffffff',
  } = options;

  const Sharp = await loadSharp();
  const pdfBuffer = await renderToBuffer(element);

  // Probe the PDF to determine page count via Sharp's metadata.
  const probe = (Sharp as any)(pdfBuffer, { density: dpi });
  const meta = await probe.metadata();
  const pages = (meta.pages as number | undefined) ?? 1;

  const out: Buffer[] = [];
  for (let i = 0; i < pages; i++) {
    let pipeline = (Sharp as any)(pdfBuffer, { density: dpi, page: i });
    if (maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }
    pipeline = pipeline.flatten({ background });
    if (format === 'png') pipeline = pipeline.png({ quality });
    else if (format === 'jpeg') pipeline = pipeline.jpeg({ quality });
    else pipeline = pipeline.webp({ quality });
    out.push(await pipeline.toBuffer());
  }
  return out;
}
