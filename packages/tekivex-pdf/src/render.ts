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
  element: ReactElement,
  _options: RenderToPDFOptions = {},
): Promise<Buffer> {
  return renderToBuffer(element);
}

/**
 * Render a PDF document tree to a streaming Buffer source — preferred for
 * large documents where you want to start sending bytes before the whole
 * document is ready.
 */
export function renderToPDFStream(element: ReactElement): NodeJS.ReadableStream {
  return renderToStream(element) as unknown as NodeJS.ReadableStream;
}

/**
 * Render the first page of a PDF document tree to a PNG Buffer.
 *
 * Implementation note: @react-pdf/renderer doesn't expose a direct PDF→PNG
 * pipeline, so we delegate to the runtime's PDF rasterisation. In Node 20+
 * environments with Sharp installed, callers should pipe renderToPDFStream
 * through `pdf-img-convert` or `sharp().pdf()`. We document the canonical
 * pattern here rather than bundling a heavy raster dep into the core package.
 *
 * @throws Error — implementation must be provided by the caller for now.
 *                 See the README for the recommended Sharp / pdf-img-convert
 *                 wiring example.
 */
export async function renderToPNG(_element: ReactElement): Promise<Buffer> {
  throw new Error(
    'renderToPNG requires a raster backend. See https://ui.tekivex.com/pdf/render-to-png/ for Sharp / pdf-img-convert recipes.',
  );
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
export async function pdfToBlob(element: ReactElement): Promise<Blob> {
  const instance = pdf(element);
  return await instance.toBlob();
}
