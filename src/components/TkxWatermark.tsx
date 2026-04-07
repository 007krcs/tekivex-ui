import { type ReactNode, useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TkxWatermarkProps {
  text: string | string[];
  children: ReactNode;
  rotate?: number;
  gap?: [number, number];
  fontSize?: number;
  color?: string;
  zIndex?: number;
}

// ── Canvas Renderer ──────────────────────────────────────────────────────────

function renderWatermarkPattern(
  lines: string[],
  rotate: number,
  gap: [number, number],
  fontSize: number,
  fillColor: string,
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const lineHeight = fontSize * 1.5;
  const totalTextHeight = lines.length * lineHeight;

  // Calculate canvas dimensions based on text length and gap
  const maxTextWidth = Math.max(...lines.map((l) => l.length)) * fontSize * 0.6;
  const canvasW = gap[0] + maxTextWidth;
  const canvasH = gap[1] + totalTextHeight;

  // High-DPI rendering
  const dpr = 2;
  canvas.width = canvasW * dpr;
  canvas.height = canvasH * dpr;
  ctx.scale(dpr, dpr);

  // Move origin to center for rotation
  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.rotate((rotate * Math.PI) / 180);

  // Text styling
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = fillColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw each line centered
  lines.forEach((line, i) => {
    const y = (i - (lines.length - 1) / 2) * lineHeight;
    ctx.fillText(line, 0, y);
  });

  return canvas.toDataURL();
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxWatermark({
  text,
  children,
  rotate = -22,
  gap = [100, 100],
  fontSize = 14,
  color,
  zIndex = 10,
}: TkxWatermarkProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState('');

  // Sanitize text lines
  const lines = useMemo(
    () => (Array.isArray(text) ? text : [text]).map((t) => sanitizeString(t)),
    [text],
  );

  const fillColor = color ?? `${theme.textMuted}22`;

  // Memoize the render function
  const generatePattern = useCallback(() => {
    return renderWatermarkPattern(lines, rotate, gap, fontSize, fillColor);
  }, [lines, rotate, gap, fontSize, fillColor]);

  // Generate the watermark canvas pattern
  useEffect(() => {
    const dataUrl = generatePattern();
    if (dataUrl) {
      setBgImage(`url(${dataUrl})`);
    }
  }, [generatePattern]);

  // Prevent tampering via MutationObserver
  useEffect(() => {
    const overlay = containerRef.current?.querySelector<HTMLElement>('[data-watermark]');
    if (!overlay) return;

    const observer = new MutationObserver(() => {
      // Re-apply watermark if someone modifies it
      const dataUrl = generatePattern();
      if (dataUrl) {
        overlay.style.backgroundImage = `url(${dataUrl})`;
      }
    });

    observer.observe(overlay, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, [generatePattern]);

  return (
    <div
      ref={containerRef}
      className={tkx('relative')}
      style={{ overflow: 'hidden' }}
    >
      {children}
      <div
        data-watermark
        aria-hidden="true"
        className={tkx('absolute inset-0 pointer-events-none')}
        style={{
          zIndex,
          backgroundImage: bgImage,
          backgroundRepeat: 'repeat',
          animation: reducedMotion ? 'none' : 'tkxFadeIn 0.3s ease',
        }}
      />
    </div>
  );
}
