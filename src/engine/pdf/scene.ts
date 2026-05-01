/**
 * Tekivex UI — engine/pdf/scene
 *
 * Render a Scene (engine/canvas data shape) to a PdfDocument page.
 *
 * Coordinate translation: Scene uses top-left origin with Y down; PDF uses
 * bottom-left origin with Y up. This module converts.
 *
 * v1 limitations:
 *   - Text uses standard 14 fonts (WinAnsi). Non-Latin scripts are deferred to
 *     engine/shaper, which will produce path-based glyphs that the page can
 *     still draw.
 *   - Word wrap uses an em-based advance estimate (standard-fonts.estimateAdvance).
 *   - Rotation on individual text/image nodes uses the cm transform.
 */

import type {
  GroupNode,
  ImageNode,
  LineNode,
  RectNode,
  Scene,
  SceneNode,
  TextNode,
} from '../canvas';
import { wrapText as canvasWrapText } from '../canvas';
import { pickStandardFont } from './standard-fonts';
import { PdfDocument } from './document';
import type { PdfPage } from './page';
import { fmtNum, pdfName } from './encoding';

export interface RenderSceneToPdfOptions {
  /** Image source resolver — given an image src string, return its JPEG bytes
   *  (no decoding necessary; bytes are passed straight to PDF /DCTDecode).
   *  When undefined, image nodes are skipped. */
  resolveImage?: (src: string) => Uint8Array | undefined;
}

interface Transform {
  /** Cumulative offset from scene origin. */
  x: number;
  y: number;
}

const compose = (a: Transform, dx: number, dy: number): Transform => ({
  x: a.x + dx,
  y: a.y + dy,
});

/** Convert from scene-y (top-left, down) to PDF-y (bottom-left, up). */
const toPdfY = (sceneY: number, sceneHeight: number, pageHeight: number): number =>
  pageHeight - sceneY - sceneHeight;

/**
 * Render a complete Scene into a single PDF page on the provided document and
 * return the new page.
 */
export function renderSceneToPdfDocument(
  scene: Scene,
  doc: PdfDocument,
  options: RenderSceneToPdfOptions = {},
): PdfPage {
  const page = doc.addPage(scene.width, scene.height);

  if (scene.background) {
    page.drawRect({
      x: 0,
      y: 0,
      width: scene.width,
      height: scene.height,
      fill: scene.background,
    });
  }

  const root: Transform = { x: 0, y: 0 };
  for (const node of scene.nodes) drawNode(node, root, scene, page, doc, options);
  return page;
}

function drawNode(
  node: SceneNode,
  parent: Transform,
  scene: Scene,
  page: PdfPage,
  doc: PdfDocument,
  options: RenderSceneToPdfOptions,
): void {
  switch (node.type) {
    case 'rect':
      drawRectNode(node, parent, scene, page);
      break;
    case 'line':
      drawLineNode(node, parent, scene, page);
      break;
    case 'text':
      drawTextNode(node, parent, scene, page, doc);
      break;
    case 'image':
      drawImageNode(node, parent, scene, page, doc, options);
      break;
    case 'group':
      drawGroupNode(node, parent, scene, page, doc, options);
      break;
  }
}

function drawRectNode(
  n: RectNode,
  parent: Transform,
  scene: Scene,
  page: PdfPage,
): void {
  const sx = parent.x + n.x;
  const sy = parent.y + n.y;
  const py = toPdfY(sy, n.height, scene.height);
  page.drawRect({
    x: sx,
    y: py,
    width: n.width,
    height: n.height,
    fill: n.fill,
    stroke: n.stroke,
    strokeWidth: n.strokeWidth,
    radius: n.radius,
  });
}

function drawLineNode(
  n: LineNode,
  parent: Transform,
  scene: Scene,
  page: PdfPage,
): void {
  const x1 = parent.x + n.x;
  const x2 = parent.x + n.x2;
  const y1 = scene.height - (parent.y + n.y);
  const y2 = scene.height - (parent.y + n.y2);
  page.drawLine({
    x1,
    y1,
    x2,
    y2,
    stroke: n.stroke,
    strokeWidth: n.strokeWidth,
    dash: n.dash,
  });
}

function drawTextNode(
  n: TextNode,
  parent: Transform,
  scene: Scene,
  page: PdfPage,
  doc: PdfDocument,
): void {
  const fontSize = n.fontSize ?? 12;
  const lineHeight = (n.lineHeight ?? 1.2) * fontSize;
  const isBold =
    n.fontWeight === 'bold' ||
    (typeof n.fontWeight === 'number' && n.fontWeight >= 600);
  const isItalic = n.fontStyle === 'italic';
  const baseFontName = pickStandardFont({
    family: n.fontFamily,
    bold: isBold,
    italic: isItalic,
  });
  const font = doc.ensureStandardFont(baseFontName);

  const lines = n.maxWidth
    ? wrapTextEmEstimate(n.text, n.maxWidth, fontSize, baseFontName)
    : n.text.split(/\r?\n/);

  // Text in PDF is positioned by the baseline. Approximate the cap-to-baseline
  // distance as 0.8 * fontSize, which matches Helvetica ascender ratio closely.
  const baselineFromTop = fontSize * 0.8;
  const baseX = parent.x + n.x;
  const baseSceneY = parent.y + n.y;

  for (let i = 0; i < lines.length; i++) {
    const sceneLineTop = baseSceneY + i * lineHeight;
    const baselineSceneY = sceneLineTop + baselineFromTop;
    const pdfY = scene.height - baselineSceneY;

    let x = baseX;
    if (n.align === 'center' || n.align === 'right') {
      const w = estimateLineWidth(lines[i], fontSize, baseFontName);
      if (n.align === 'center') x = baseX - w / 2;
      else x = baseX - w;
    }

    page.drawText(lines[i], {
      font,
      size: fontSize,
      x,
      y: pdfY,
      fill: n.fill,
    });
  }
}

function drawImageNode(
  n: ImageNode,
  parent: Transform,
  scene: Scene,
  page: PdfPage,
  doc: PdfDocument,
  options: RenderSceneToPdfOptions,
): void {
  if (typeof n.src !== 'string') return; // only string srcs route through here
  const bytes = options.resolveImage?.(n.src);
  if (!bytes) return;

  const image = doc.addJpegImage(bytes);
  const sx = parent.x + n.x;
  const sy = parent.y + n.y;
  const pdfY = toPdfY(sy, n.height, scene.height);

  // Compute crop/scale per `fit`
  const fit = n.fit ?? 'cover';
  let dw = n.width;
  let dh = n.height;
  let dx = sx;
  let dy = pdfY;
  if (image.width && image.height && fit !== 'fill') {
    const scale =
      fit === 'cover'
        ? Math.max(n.width / image.width, n.height / image.height)
        : Math.min(n.width / image.width, n.height / image.height);
    dw = image.width * scale;
    dh = image.height * scale;
    dx = sx + (n.width - dw) / 2;
    dy = pdfY + (n.height - dh) / 2;
  }

  if (n.radius && n.radius > 0) {
    page.pushClipRoundedRect(sx, pdfY, n.width, n.height, n.radius);
    page.drawImage({ image, x: dx, y: dy, width: dw, height: dh });
    page.popClip();
  } else {
    page.drawImage({ image, x: dx, y: dy, width: dw, height: dh });
  }
}

function drawGroupNode(
  n: GroupNode,
  parent: Transform,
  scene: Scene,
  page: PdfPage,
  doc: PdfDocument,
  options: RenderSceneToPdfOptions,
): void {
  const next = compose(parent, n.x, n.y);
  for (const child of n.children) drawNode(child, next, scene, page, doc, options);
}

/* -------------------------------------------------------------------------- */
/* Text helpers (em-based estimate when no canvas ctx is available)            */
/* -------------------------------------------------------------------------- */

import type { StandardFontName } from './standard-fonts';
import { estimateAdvance } from './standard-fonts';

function estimateLineWidth(
  text: string,
  fontSize: number,
  font: StandardFontName,
): number {
  return estimateAdvance(font, text) * fontSize;
}

function wrapTextEmEstimate(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: StandardFontName,
): string[] {
  if (!text) return [''];
  const out: string[] = [];
  for (const para of text.split(/\r?\n/)) {
    const words = para.split(/(\s+)/).filter((w) => w.length > 0);
    let line = '';
    for (const w of words) {
      const candidate = line + w;
      const widthOk = estimateLineWidth(candidate.trim(), fontSize, font) <= maxWidth;
      if (widthOk || line === '') line = candidate;
      else {
        out.push(line.trimEnd());
        line = w.trimStart();
      }
    }
    out.push(line.trimEnd());
  }
  return out;
}

/* canvasWrapText is exported here so test files can reach it through the same
 * surface; the renderer itself uses the em-estimate version because it must
 * work in environments without canvas. */
export { canvasWrapText };

// Suppress unused-warning for fmt helpers re-exported by index.
void fmtNum;
void pdfName;
