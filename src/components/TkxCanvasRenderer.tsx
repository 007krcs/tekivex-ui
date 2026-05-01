'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  preloadImages,
  renderScene,
  validateScene,
  type Scene,
} from '../engine/canvas';

export interface TkxCanvasRendererProps {
  scene: Scene;
  /** Display scale relative to the scene's logical units. The internal canvas
   *  bitmap is sized at logical × scale × devicePixelRatio for crisp rendering. */
  scale?: number;
  /** Optional aria-label applied to the canvas element. */
  ariaLabel?: string;
  /** Called when validation fails so the host can surface the issue. */
  onValidationError?: (issues: ReadonlyArray<{ path: string; message: string }>) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders a Scene to a `<canvas>` element. Used as the on-screen biodata
 * preview so what the user sees matches the PDF output byte-for-byte.
 *
 * The canvas is automatically resized to the scene dimensions and rendered at
 * device pixel ratio for sharpness on high-DPI screens.
 */
export function TkxCanvasRenderer({
  scene,
  scale = 1,
  ariaLabel,
  onValidationError,
  className,
  style,
}: TkxCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const issues = validateScene(scene);
    if (issues.length > 0) {
      onValidationError?.(issues);
      setError(`Invalid scene: ${issues[0].path} ${issues[0].message}`);
      return;
    }
    setError(null);

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const totalScale = scale * dpr;
    const cssW = scene.width * scale;
    const cssH = scene.height * scale;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.ceil(scene.width * totalScale);
    canvas.height = Math.ceil(scene.height * totalScale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    void preloadImages(scene).then((images) => {
      if (cancelled) return;
      ctx.setTransform(totalScale, 0, 0, totalScale, 0, 0);
      renderScene(ctx, scene, { images });
    });
    return () => {
      cancelled = true;
    };
  }, [scene, scale, onValidationError]);

  return (
    <div className={className} style={style}>
      {error ? (
        <div role="alert" style={{ color: 'crimson', fontFamily: 'sans-serif' }}>
          {error}
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          aria-label={ariaLabel ?? 'Biodata preview'}
          role="img"
          data-tkx-canvas-renderer="armed"
        />
      )}
    </div>
  );
}

TkxCanvasRenderer.displayName = 'TkxCanvasRenderer';
