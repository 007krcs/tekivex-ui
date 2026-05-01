'use client';

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  type CSSProperties,
  type PointerEvent,
} from 'react';

export interface TkxSignaturePadHandle {
  /** Clear the canvas. */
  clear: () => void;
  /** Undo the last stroke. */
  undo: () => void;
  /** Whether the pad currently has any strokes. */
  isEmpty: () => boolean;
  /** Export the signature as a PNG Blob with transparent background. */
  toBlob: (options?: { mimeType?: string; quality?: number }) => Promise<Blob>;
  /** Export as data URL (e.g., for inline preview). */
  toDataURL: (options?: { mimeType?: string; quality?: number }) => string | undefined;
}

export interface TkxSignaturePadProps {
  width?: number;
  height?: number;
  /** Stroke colour. Default #1f2937. */
  color?: string;
  /** Min and max stroke width (variable-width strokes feel more natural). */
  minWidth?: number;
  maxWidth?: number;
  /** Background colour for export only — display is always transparent. */
  exportBackground?: string;
  className?: string;
  style?: CSSProperties;
  onChange?: (isEmpty: boolean) => void;
}

interface Point {
  x: number;
  y: number;
  /** Pressure-derived width for this segment. */
  w: number;
}

/**
 * Canvas-based signature capture. Smooth strokes via quadratic-curve
 * interpolation between mid-points; variable width based on velocity (slow =
 * thick, fast = thin) so the signature looks natural rather than uniform.
 */
export const TkxSignaturePad = forwardRef<TkxSignaturePadHandle, TkxSignaturePadProps>(
  function TkxSignaturePad(
    {
      width = 480,
      height = 200,
      color = '#1f2937',
      minWidth = 1.2,
      maxWidth = 3.2,
      exportBackground,
      className,
      style,
      onChange,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [strokes, setStrokes] = useState<Point[][]>([]);
    const currentStroke = useRef<Point[]>([]);
    const lastPoint = useRef<Point | null>(null);

    // Notify parent when emptiness changes
    useEffect(() => {
      onChange?.(strokes.length === 0);
    }, [strokes.length, onChange]);

    const repaint = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const stroke of strokes) drawStroke(ctx, stroke);
    }, [strokes, color]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      repaint();
    }, [width, height, repaint]);

    useEffect(() => {
      repaint();
    }, [repaint]);

    const pointFrom = useCallback(
      (e: PointerEvent<HTMLCanvasElement>): Point => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const last = lastPoint.current;
        let w = (minWidth + maxWidth) / 2;
        if (last) {
          const dx = x - last.x;
          const dy = y - last.y;
          const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 30);
          // Faster movement → thinner stroke
          w = maxWidth - (speed / 30) * (maxWidth - minWidth);
        }
        return { x, y, w };
      },
      [minWidth, maxWidth],
    );

    const onPointerDown = (e: PointerEvent<HTMLCanvasElement>): void => {
      const t = e.target as HTMLElement & { setPointerCapture?: (id: number) => void };
      if (typeof t.setPointerCapture === 'function') t.setPointerCapture(e.pointerId);
      const pt = pointFrom(e);
      currentStroke.current = [pt];
      lastPoint.current = pt;
      drawIncremental(canvasRef.current, color, [pt], pt);
    };

    const onPointerMove = (e: PointerEvent<HTMLCanvasElement>): void => {
      if (currentStroke.current.length === 0) return;
      const pt = pointFrom(e);
      currentStroke.current.push(pt);
      drawIncremental(canvasRef.current, color, currentStroke.current, pt);
      lastPoint.current = pt;
    };

    const onPointerUp = (e: PointerEvent<HTMLCanvasElement>): void => {
      if (currentStroke.current.length === 0) return;
      const finished = currentStroke.current.slice();
      currentStroke.current = [];
      lastPoint.current = null;
      setStrokes((s) => [...s, finished]);
      e.preventDefault();
    };

    useImperativeHandle(
      ref,
      () => ({
        clear() {
          setStrokes([]);
          currentStroke.current = [];
          lastPoint.current = null;
        },
        undo() {
          setStrokes((s) => s.slice(0, -1));
        },
        isEmpty() {
          return strokes.length === 0;
        },
        async toBlob(options) {
          const canvas = canvasRef.current;
          if (!canvas) throw new Error('TkxSignaturePad: canvas not mounted');
          // Compose a fresh canvas at logical size with optional bg fill.
          const out = document.createElement('canvas');
          out.width = width;
          out.height = height;
          const ctx = out.getContext('2d');
          if (!ctx) throw new Error('TkxSignaturePad: 2D context unavailable');
          if (exportBackground) {
            ctx.fillStyle = exportBackground;
            ctx.fillRect(0, 0, width, height);
          }
          ctx.strokeStyle = color;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          for (const s of strokes) drawStroke(ctx, s);
          return new Promise<Blob>((resolve, reject) =>
            out.toBlob(
              (b) => (b ? resolve(b) : reject(new Error('TkxSignaturePad: toBlob null'))),
              options?.mimeType ?? 'image/png',
              options?.quality ?? 0.92,
            ),
          );
        },
        toDataURL(options) {
          const canvas = canvasRef.current;
          if (!canvas) return undefined;
          return canvas.toDataURL(options?.mimeType ?? 'image/png', options?.quality);
        },
      }),
      [strokes, width, height, color, exportBackground],
    );

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          touchAction: 'none',
          background: 'transparent',
          borderRadius: 8,
          border: '1px dashed rgba(0,0,0,0.2)',
          ...style,
        }}
        data-tkx-signature-pad="armed"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    );
  },
);

TkxSignaturePad.displayName = 'TkxSignaturePad';

function drawStroke(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pts: Point[],
): void {
  if (pts.length < 2) {
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, pts[0].w / 2, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }
    return;
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    ctx.lineWidth = (p0.w + p1.w) / 2;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    const cpX = (p0.x + p1.x) / 2;
    const cpY = (p0.y + p1.y) / 2;
    ctx.quadraticCurveTo(p0.x, p0.y, cpX, cpY);
    ctx.stroke();
  }
}

function drawIncremental(
  canvas: HTMLCanvasElement | null,
  color: string,
  pts: Point[],
  current: Point,
): void {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (pts.length < 2) return;
  const prev = pts[pts.length - 2];
  ctx.lineWidth = (prev.w + current.w) / 2;
  ctx.beginPath();
  ctx.moveTo(prev.x, prev.y);
  const cpX = (prev.x + current.x) / 2;
  const cpY = (prev.y + current.y) / 2;
  ctx.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
  ctx.stroke();
}
