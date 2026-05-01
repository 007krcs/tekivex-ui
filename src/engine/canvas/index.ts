/**
 * Tekivex UI — engine/canvas
 *
 * Resolution-independent scene graph for biodata templates. The same scene
 * description drives:
 *   • DOM preview (React renderer in TkxTemplateRenderer)
 *   • Canvas image export (this module — toBlob/toDataURL for WhatsApp share)
 *   • PDF rendering (engine/pdf consumes the same scene type)
 *
 * Coordinates use the PDF convention by default: origin at top-left, units in
 * points (1pt = 1/72 inch). A4 = 595×842 pt, Letter = 612×792 pt. Renderers
 * are responsible for any axis flipping needed by their output format.
 *
 * Pure data shapes + pure measurement helpers + a Canvas2D renderer. No DOM,
 * no React. This module is SSR-safe (the renderer requires a CanvasRendering
 * Context2D, but importing the types and helpers does not).
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type Color = string;
export type FontWeight = number | 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';
export type TextAlign = 'left' | 'center' | 'right';
export type TextBaseline = 'top' | 'middle' | 'bottom' | 'alphabetic';
export type ImageFit = 'cover' | 'contain' | 'fill';

export interface BaseNode {
  id?: string;
  /** Optional opacity in [0, 1]. */
  opacity?: number;
  /** Optional rotation in degrees, applied around node origin. */
  rotate?: number;
}

export interface TextNode extends BaseNode {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  fill?: Color;
  align?: TextAlign;
  baseline?: TextBaseline;
  /** When set, text wraps at this width (split into multiple lines). */
  maxWidth?: number;
  /** Line height multiplier of fontSize (default 1.2). */
  lineHeight?: number;
  /** Letter spacing in points (default 0). */
  letterSpacing?: number;
}

export interface RectNode extends BaseNode {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: Color;
  stroke?: Color;
  strokeWidth?: number;
  /** Corner radius (uniform). */
  radius?: number;
}

export interface LineNode extends BaseNode {
  type: 'line';
  x: number;
  y: number;
  x2: number;
  y2: number;
  stroke?: Color;
  strokeWidth?: number;
  dash?: ReadonlyArray<number>;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  /** A data: or http(s): URL, or a pre-loaded image source. */
  src: string | CanvasImageSource;
  fit?: ImageFit;
  /** Corner radius for clipping (uniform). */
  radius?: number;
}

export interface GroupNode extends BaseNode {
  type: 'group';
  x: number;
  y: number;
  children: ReadonlyArray<SceneNode>;
}

export type SceneNode = TextNode | RectNode | LineNode | ImageNode | GroupNode;

export interface Scene {
  /** Page width in points. */
  width: number;
  /** Page height in points. */
  height: number;
  background?: Color;
  nodes: ReadonlyArray<SceneNode>;
  /** Optional metadata, propagated to PDF info dict where applicable. */
  meta?: { title?: string; author?: string; subject?: string; keywords?: string };
}

/* -------------------------------------------------------------------------- */
/* Page presets                                                                */
/* -------------------------------------------------------------------------- */

export const PAGE_A4 = Object.freeze({ width: 595, height: 842 });
export const PAGE_LETTER = Object.freeze({ width: 612, height: 792 });
export const PAGE_LEGAL = Object.freeze({ width: 612, height: 1008 });

/* -------------------------------------------------------------------------- */
/* Text measurement & wrapping                                                 */
/* -------------------------------------------------------------------------- */

export interface TextStyleInput {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
}

export const DEFAULT_FONT_FAMILY =
  '"Helvetica Neue", Helvetica, Arial, "Noto Sans", sans-serif';

export function buildFontShorthand(style: TextStyleInput): string {
  const fs = style.fontStyle ?? 'normal';
  const fw = style.fontWeight ?? 'normal';
  const size = style.fontSize ?? 12;
  const family = style.fontFamily ?? DEFAULT_FONT_FAMILY;
  return `${fs} ${fw} ${size}px ${family}`;
}

/**
 * Greedy word-wrap by canvas measurement. Long single tokens that exceed
 * maxWidth are kept on their own line (we don't break mid-word — biodata
 * fields like names should never split).
 */
export function wrapText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  if (!text) return [''];
  const paragraphs = text.split(/\r?\n/);
  const out: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(/(\s+)/).filter((w) => w.length > 0);
    let line = '';
    for (const w of words) {
      const candidate = line + w;
      const widthOk = ctx.measureText(candidate.trim()).width <= maxWidth;
      if (widthOk || line === '') {
        line = candidate;
      } else {
        out.push(line.trimEnd());
        line = w.trimStart();
      }
    }
    out.push(line.trimEnd());
  }
  return out;
}

export function measureBlock(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  options: TextStyleInput & { maxWidth?: number; lineHeight?: number } = {},
): { width: number; height: number; lines: string[] } {
  const prev = ctx.font;
  ctx.font = buildFontShorthand(options);
  const size = options.fontSize ?? 12;
  const lh = (options.lineHeight ?? 1.2) * size;
  const maxWidth = options.maxWidth ?? Number.POSITIVE_INFINITY;
  const lines = Number.isFinite(maxWidth)
    ? wrapText(ctx, text, maxWidth)
    : text.split(/\r?\n/);
  let width = 0;
  for (const ln of lines) {
    const w = ctx.measureText(ln).width;
    if (w > width) width = w;
  }
  ctx.font = prev;
  return { width, height: lh * Math.max(1, lines.length), lines };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

export interface ValidationIssue {
  path: string;
  message: string;
}

const NUMBER_FIELDS: Record<SceneNode['type'], readonly string[]> = {
  text: ['x', 'y'],
  rect: ['x', 'y', 'width', 'height'],
  line: ['x', 'y', 'x2', 'y2'],
  image: ['x', 'y', 'width', 'height'],
  group: ['x', 'y'],
};

export function validateScene(scene: Scene): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(scene.width) || scene.width <= 0)
    issues.push({ path: 'width', message: 'must be a positive number' });
  if (!Number.isFinite(scene.height) || scene.height <= 0)
    issues.push({ path: 'height', message: 'must be a positive number' });

  const walk = (nodes: ReadonlyArray<SceneNode>, prefix: string): void => {
    nodes.forEach((node, i) => {
      const path = `${prefix}[${i}]`;
      const fields = NUMBER_FIELDS[node.type];
      if (!fields) {
        issues.push({ path, message: `unknown node type: ${(node as { type: string }).type}` });
        return;
      }
      const rec = node as unknown as Record<string, unknown>;
      for (const f of fields) {
        const v = rec[f];
        if (typeof v !== 'number' || !Number.isFinite(v)) {
          issues.push({ path: `${path}.${f}`, message: 'must be a finite number' });
        }
      }
      if (node.type === 'text' && typeof node.text !== 'string') {
        issues.push({ path: `${path}.text`, message: 'text must be a string' });
      }
      if (node.type === 'image' && !node.src) {
        issues.push({ path: `${path}.src`, message: 'image src is required' });
      }
      if (node.type === 'group') {
        walk(node.children, `${path}.children`);
      }
    });
  };
  walk(scene.nodes, 'nodes');
  return issues;
}

/* -------------------------------------------------------------------------- */
/* Image loading                                                               */
/* -------------------------------------------------------------------------- */

const SSR = typeof window === 'undefined' || typeof document === 'undefined';

export async function loadImage(src: string): Promise<HTMLImageElement> {
  if (SSR) throw new Error('engine/canvas: loadImage requires a browser environment');
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`engine/canvas: failed to load image ${src}`));
    img.src = src;
  });
}

/* -------------------------------------------------------------------------- */
/* Canvas 2D renderer                                                          */
/* -------------------------------------------------------------------------- */

type AnyCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function applyTransform(ctx: AnyCtx, x: number, y: number, rotate?: number): void {
  ctx.translate(x, y);
  if (rotate) ctx.rotate((rotate * Math.PI) / 180);
}

function pathRoundRect(
  ctx: AnyCtx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawRect(ctx: AnyCtx, n: RectNode): void {
  ctx.save();
  applyTransform(ctx, n.x, n.y, n.rotate);
  if (n.opacity != null) ctx.globalAlpha *= n.opacity;
  if (n.radius && n.radius > 0) {
    pathRoundRect(ctx, 0, 0, n.width, n.height, n.radius);
    if (n.fill) {
      ctx.fillStyle = n.fill;
      ctx.fill();
    }
    if (n.stroke) {
      ctx.strokeStyle = n.stroke;
      ctx.lineWidth = n.strokeWidth ?? 1;
      ctx.stroke();
    }
  } else {
    if (n.fill) {
      ctx.fillStyle = n.fill;
      ctx.fillRect(0, 0, n.width, n.height);
    }
    if (n.stroke) {
      ctx.strokeStyle = n.stroke;
      ctx.lineWidth = n.strokeWidth ?? 1;
      ctx.strokeRect(0, 0, n.width, n.height);
    }
  }
  ctx.restore();
}

function drawLine(ctx: AnyCtx, n: LineNode): void {
  ctx.save();
  if (n.opacity != null) ctx.globalAlpha *= n.opacity;
  ctx.strokeStyle = n.stroke ?? '#000000';
  ctx.lineWidth = n.strokeWidth ?? 1;
  if (n.dash) ctx.setLineDash(n.dash as number[]);
  ctx.beginPath();
  ctx.moveTo(n.x, n.y);
  ctx.lineTo(n.x2, n.y2);
  ctx.stroke();
  ctx.restore();
}

function drawText(ctx: AnyCtx, n: TextNode): void {
  ctx.save();
  applyTransform(ctx, n.x, n.y, n.rotate);
  if (n.opacity != null) ctx.globalAlpha *= n.opacity;
  ctx.font = buildFontShorthand(n);
  ctx.fillStyle = n.fill ?? '#000000';
  ctx.textAlign = n.align ?? 'left';
  ctx.textBaseline = n.baseline ?? 'alphabetic';

  const size = n.fontSize ?? 12;
  const lh = (n.lineHeight ?? 1.2) * size;
  const lines = n.maxWidth ? wrapText(ctx, n.text, n.maxWidth) : n.text.split(/\r?\n/);

  // letterSpacing — fall back to manual char placement when supported API absent
  if (n.letterSpacing && Math.abs(n.letterSpacing) > 0.001) {
    let yOffset = 0;
    for (const ln of lines) {
      let xOffset = 0;
      for (const ch of ln) {
        ctx.fillText(ch, xOffset, yOffset);
        xOffset += ctx.measureText(ch).width + n.letterSpacing;
      }
      yOffset += lh;
    }
  } else {
    let yOffset = 0;
    for (const ln of lines) {
      ctx.fillText(ln, 0, yOffset);
      yOffset += lh;
    }
  }
  ctx.restore();
}

function drawImage(ctx: AnyCtx, n: ImageNode, resolved: CanvasImageSource): void {
  ctx.save();
  applyTransform(ctx, n.x, n.y, n.rotate);
  if (n.opacity != null) ctx.globalAlpha *= n.opacity;
  if (n.radius && n.radius > 0) {
    pathRoundRect(ctx, 0, 0, n.width, n.height, n.radius);
    ctx.clip();
  }
  const fit = n.fit ?? 'cover';
  const w = n.width;
  const h = n.height;
  const imgW = (resolved as HTMLImageElement).width || w;
  const imgH = (resolved as HTMLImageElement).height || h;
  if (fit === 'fill' || imgW === 0 || imgH === 0) {
    ctx.drawImage(resolved, 0, 0, w, h);
  } else {
    const scale =
      fit === 'cover' ? Math.max(w / imgW, h / imgH) : Math.min(w / imgW, h / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(resolved, dx, dy, dw, dh);
  }
  ctx.restore();
}

function drawGroup(
  ctx: AnyCtx,
  n: GroupNode,
  imageMap: Map<string, CanvasImageSource>,
): void {
  ctx.save();
  applyTransform(ctx, n.x, n.y, n.rotate);
  if (n.opacity != null) ctx.globalAlpha *= n.opacity;
  for (const child of n.children) drawNode(ctx, child, imageMap);
  ctx.restore();
}

function drawNode(
  ctx: AnyCtx,
  node: SceneNode,
  imageMap: Map<string, CanvasImageSource>,
): void {
  switch (node.type) {
    case 'rect':
      drawRect(ctx, node);
      break;
    case 'line':
      drawLine(ctx, node);
      break;
    case 'text':
      drawText(ctx, node);
      break;
    case 'image': {
      const src = typeof node.src === 'string' ? imageMap.get(node.src) : node.src;
      if (src) drawImage(ctx, node, src);
      break;
    }
    case 'group':
      drawGroup(ctx, node, imageMap);
      break;
  }
}

export interface RenderOptions {
  /** Pre-loaded image map keyed by string src (for re-use across renders). */
  images?: Map<string, CanvasImageSource>;
}

/** Collect all unique string image srcs in the scene. */
export function collectImageSources(scene: Scene): string[] {
  const out = new Set<string>();
  const walk = (nodes: ReadonlyArray<SceneNode>): void => {
    for (const n of nodes) {
      if (n.type === 'image' && typeof n.src === 'string') out.add(n.src);
      else if (n.type === 'group') walk(n.children);
    }
  };
  walk(scene.nodes);
  return [...out];
}

export async function preloadImages(
  scene: Scene,
  existing?: Map<string, CanvasImageSource>,
): Promise<Map<string, CanvasImageSource>> {
  const map = existing ?? new Map<string, CanvasImageSource>();
  const srcs = collectImageSources(scene).filter((s) => !map.has(s));
  await Promise.all(
    srcs.map(async (s) => {
      try {
        const img = await loadImage(s);
        map.set(s, img);
      } catch {
        /* render will simply skip missing images */
      }
    }),
  );
  return map;
}

export function renderScene(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  scene: Scene,
  options: RenderOptions = {},
): void {
  const imageMap = options.images ?? new Map<string, CanvasImageSource>();
  ctx.save();
  if (scene.background) {
    ctx.fillStyle = scene.background;
    ctx.fillRect(0, 0, scene.width, scene.height);
  } else {
    ctx.clearRect(0, 0, scene.width, scene.height);
  }
  for (const node of scene.nodes) drawNode(ctx, node, imageMap);
  ctx.restore();
}

/* -------------------------------------------------------------------------- */
/* Convenience: render to Blob                                                 */
/* -------------------------------------------------------------------------- */

export interface RenderToBlobOptions {
  /** Render multiplier — 2 means 2× DPI (good for print). Default 2. */
  scale?: number;
  /** Output MIME type. Default image/png. */
  mimeType?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** JPEG/WebP quality 0..1. Default 0.92. */
  quality?: number;
}

export async function renderToBlob(
  scene: Scene,
  options: RenderToBlobOptions = {},
): Promise<Blob> {
  if (SSR) throw new Error('engine/canvas: renderToBlob requires a browser environment');
  const scale = options.scale ?? 2;
  const mimeType = options.mimeType ?? 'image/png';
  const quality = options.quality ?? 0.92;

  const w = Math.ceil(scene.width * scale);
  const h = Math.ceil(scene.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('engine/canvas: 2D context unavailable');
  ctx.scale(scale, scale);

  const images = await preloadImages(scene);
  renderScene(ctx, scene, { images });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('engine/canvas: canvas.toBlob returned null'));
      },
      mimeType,
      quality,
    );
  });
}
