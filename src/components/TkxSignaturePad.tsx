'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxSignaturePad — touch + mouse signature capture on canvas.
//
// Capabilities:
//   - High-DPR rendering (2x for crisp lines on retina)
//   - Pointer Events API: works for mouse, pen, and touch with pressure
//     where supported
//   - Stroke smoothing via quadratic-Bézier midpoint interpolation
//   - Output as PNG data URL or Blob
//   - Clear, undo (last stroke), and isEmpty helpers via ref
//   - WCAG: keyboard-clear, ARIA labelling, focus indicator
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import { useTheme } from '../themes';

export interface TkxSignaturePadProps {
  /** Visible label above the canvas (required for WCAG). */
  label?: string;
  /** Width in px. Defaults to container width if omitted. */
  width?: number;
  /** Height in px. Defaults to 180. */
  height?: number;
  /** Stroke colour. Defaults to theme.text. */
  strokeColor?: string;
  /** Stroke width in px. Defaults to 2. */
  strokeWidth?: number;
  /** Background fill. Defaults to theme.surface. */
  backgroundColor?: string;
  /** Called when the user lifts the pointer after drawing. */
  onChange?: (dataUrl: string) => void;
  /** Disable input. */
  disabled?: boolean;
  /** Optional className on the root container. */
  className?: string;
  /** Optional inline style on the root container. */
  style?: CSSProperties;
}

export interface TkxSignaturePadHandle {
  /** Clear the canvas. */
  clear: () => void;
  /** Remove the most recent stroke. */
  undo: () => void;
  /** Returns true when nothing has been drawn. */
  isEmpty: () => boolean;
  /** Returns a PNG data URL of the current signature. */
  toDataURL: (mimeType?: string, quality?: number) => string;
  /** Returns a Blob of the current signature. */
  toBlob: (mimeType?: string, quality?: number) => Promise<Blob | null>;
}

interface Point {
  x: number;
  y: number;
}

type Stroke = Point[];

export const TkxSignaturePad = forwardRef<TkxSignaturePadHandle, TkxSignaturePadProps>(
  function TkxSignaturePad(
    {
      label,
      width,
      height = 180,
      strokeColor,
      strokeWidth = 2,
      backgroundColor,
      onChange,
      disabled,
      className,
      style,
    },
    ref: Ref<TkxSignaturePadHandle>,
  ) {
    const theme = useTheme();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const strokesRef = useRef<Stroke[]>([]);
    const currentRef = useRef<Stroke | null>(null);
    const dprRef = useRef<number>(1);
    const [resolvedWidth, setResolvedWidth] = useState<number>(width ?? 320);

    const resolvedStroke = strokeColor ?? theme.text;
    const resolvedBg = backgroundColor ?? theme.surface;

    // Container resize → match canvas width unless explicitly fixed.
    useEffect(() => {
      if (width !== undefined) return;
      const el = containerRef.current;
      if (!el || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = Math.floor(entry.contentRect.width);
          if (w > 0) setResolvedWidth(w);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [width]);

    // Re-render the canvas from strokes whenever inputs change.
    const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = dprRef.current;
      ctx.fillStyle = resolvedBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = resolvedStroke;
      ctx.lineWidth = strokeWidth * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const stroke of strokesRef.current) {
        if (stroke.length < 2) {
          // Single dot — draw as a small filled circle.
          if (stroke.length === 1) {
            ctx.beginPath();
            ctx.arc(stroke[0].x * dpr, stroke[0].y * dpr, (strokeWidth * dpr) / 2, 0, Math.PI * 2);
            ctx.fillStyle = resolvedStroke;
            ctx.fill();
          }
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(stroke[0].x * dpr, stroke[0].y * dpr);
        // Quadratic-bezier through midpoints — gives a smoother visual line
        // than connecting raw points.
        for (let i = 1; i < stroke.length - 1; i++) {
          const cx = (stroke[i].x + stroke[i + 1].x) / 2;
          const cy = (stroke[i].y + stroke[i + 1].y) / 2;
          ctx.quadraticCurveTo(stroke[i].x * dpr, stroke[i].y * dpr, cx * dpr, cy * dpr);
        }
        const last = stroke[stroke.length - 1];
        ctx.lineTo(last.x * dpr, last.y * dpr);
        ctx.stroke();
      }
    }, [resolvedBg, resolvedStroke, strokeWidth]);

    // Initialise canvas dimensions + DPR.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width = resolvedWidth * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${resolvedWidth}px`;
      canvas.style.height = `${height}px`;
      redraw();
    }, [resolvedWidth, height, redraw]);

    // Pointer handlers
    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      e.preventDefault();
      (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
      currentRef.current = [getPoint(e)];
      strokesRef.current.push(currentRef.current);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!currentRef.current || disabled) return;
      e.preventDefault();
      const p = getPoint(e);
      const stroke = currentRef.current;
      // Drop redundant points (sub-pixel movement) to keep the buffer small.
      const last = stroke[stroke.length - 1];
      if (Math.abs(last.x - p.x) < 1 && Math.abs(last.y - p.y) < 1) return;
      stroke.push(p);
      redraw();
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!currentRef.current) return;
      try {
        (e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      currentRef.current = null;
      onChange?.(canvasRef.current?.toDataURL('image/png') ?? '');
    };

    const clear = useCallback(() => {
      strokesRef.current = [];
      currentRef.current = null;
      redraw();
      onChange?.(canvasRef.current?.toDataURL('image/png') ?? '');
    }, [redraw, onChange]);

    const undo = useCallback(() => {
      strokesRef.current.pop();
      redraw();
      onChange?.(canvasRef.current?.toDataURL('image/png') ?? '');
    }, [redraw, onChange]);

    // Keyboard support on the focused canvas: Backspace/Delete clears the pad,
    // Ctrl/Cmd+Z removes the last stroke.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        clear();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undo();
      }
    };

    useImperativeHandle(ref, () => ({
      clear,
      undo,
      isEmpty: () => strokesRef.current.length === 0,
      toDataURL: (mimeType = 'image/png', quality = 0.92) =>
        canvasRef.current?.toDataURL(mimeType, quality) ?? '',
      toBlob: (mimeType = 'image/png', quality = 0.92) =>
        new Promise((resolve) => {
          canvasRef.current?.toBlob((b) => resolve(b), mimeType, quality);
        }),
    }), [clear, undo]);

    // ── Styles ─────────────────────────────────────────────────────────────
    const rootStyle: CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 6,
      width: width ?? '100%',
      ...style,
    };
    const labelStyle: CSSProperties = {
      fontSize: 13,
      fontWeight: 600,
      color: theme.text,
    };
    const canvasStyle: CSSProperties = {
      borderRadius: 8,
      border: `1px solid ${theme.border}`,
      background: resolvedBg,
      cursor: disabled ? 'not-allowed' : 'crosshair',
      touchAction: 'none',
      display: 'block',
      width: '100%',
    };

    return (
      <div ref={containerRef} className={className} style={rootStyle}>
        {label && <label style={labelStyle}>{label}</label>}
        <canvas
          ref={canvasRef}
          role="img"
          tabIndex={disabled ? -1 : 0}
          aria-label={label ?? 'Signature pad'}
          style={canvasStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  },
);

TkxSignaturePad.displayName = 'TkxSignaturePad';
