// ─────────────────────────────────────────────────────────────────────────────
// renderToPDF / renderToPNG — server-side renderers.
//
// Both run on Vercel/Cloudflare Workers/Lambda without a Chromium binary —
// total dep weight is @react-pdf/renderer (~1MB) instead of Puppeteer (~200MB).
//
// renderToPNG uses the same component tree → renders one PDF page → converts
// the first page to PNG via the embedded raster pipeline. For multi-page or
// vector-perfect output, prefer renderToPDF.
// ─────────────────────────────────────────────────────────────────────────────

import { renderToBuffer, renderToStream, pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
type DocEl = ReactElement<DocumentProps>;

export interface RenderToPDFOptions {
  /** Optional override of the document filename for HTTP responses. */
  filename?: string;
}

/**
 * Render a PDF document tree to a Buffer.
 * Works in Node 18+, Bun, and edge runtimes that support TypedArray streams.
 *
 * @example
 * const buffer = await renderToPDF(
 *   <TkxPDFDocument><TkxPDFPage>…</TkxPDFPage></TkxPDFDocument>
 * );
 * await fs.writeFile('biodata.pdf', buffer);
 */
export async function renderToPDF(
  element: DocEl,
  _options: RenderToPDFOptions = {},
): Promise<Buffer> {
  return renderToBuffer(element);
}

/**
 * Render a PDF document tree to a streaming Buffer source — preferred for
 * large documents where you want to start sending bytes before the whole
 * document is ready.
 */
export function renderToPDFStream(element: DocEl): NodeJS.ReadableStream {
  return renderToStream(element) as unknown as NodeJS.ReadableStream;
}

/**
 * Render the first page of a PDF document tree to a PNG Buffer.
 *
 * **Now implemented in v0.2** via the optional `tekivex-pdf/raster`
 * sub-export. This wrapper keeps the import path simple but requires
 * `sharp` to be installed by the consumer.
 *
 * For full control (multi-page, JPEG/WebP, custom DPI/resize), import
 * directly from `tekivex-pdf/raster`:
 *
 * @example
 * import { renderToImage } from 'tekivex-pdf/raster';
 * const png = await renderToImage(<Doc/>, { format: 'png', dpi: 200 });
 */
export async function renderToPNG(element: DocEl): Promise<Buffer> {
  // Lazy-load to keep Sharp out of the main bundle path.
  const mod: any = await import('./raster.js').catch(() => import('./raster'));
  return mod.renderToImage(element, { format: 'png' });
}

/**
 * Imperative blob factory — useful in browser contexts where you want to
 * trigger a download.
 *
 * @example
 * const blob = await pdfToBlob(<MyDoc />);
 * const url = URL.createObjectURL(blob);
 * window.location.href = url;
 */
export async function pdfToBlob(element: DocEl): Promise<Blob> {
  const instance = pdf(element);
  return await instance.toBlob();
}
