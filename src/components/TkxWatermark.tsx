'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxWatermark v2 — anti-screenshot / anti-leak overlay.
//
// New in v2.7:
//   - `pattern="tiled" | "single" | "fingerprint"`
//       tiled       — original behaviour: repeating pattern across content
//       single      — one large diagonal stamp in the centre
//       fingerprint — adds a per-session id + timestamp to discourage screenshots
//   - `dynamic={true}` — re-renders on tab visibility change (defeats some
//       screenshot extensions that snapshot the off-screen tab)
//   - `refreshMs` — periodic rerender (default 0 = off)
//   - `intensifyOnDevtools={true}` — when DevTools open, opacity ramps up and
//       content blurs. Uses the size-discrepancy heuristic.
//   - `useDevtoolsOpen()` exported hook for consumer-driven UX.
//
// Backward-compatible: the original prop set still works unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type ReactNode,
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export type WatermarkPattern = 'tiled' | 'single' | 'fingerprint';

export interface TkxWatermarkProps {
  text: string | string[];
  children: ReactNode;
  rotate?: number;
  gap?: [number, number];
  fontSize?: number;
  color?: string;
  zIndex?: number;
  /** Layout mode. Defaults to 'tiled' (v2.6 behaviour). */
  pattern?: WatermarkPattern;
  /** Re-render the watermark whenever the tab becomes visible again. */
  dynamic?: boolean;
  /** Periodic re-render interval in ms. 0 disables. */
  refreshMs?: number;
  /** When DevTools open, increase opacity and blur the underlying content. */
  intensifyOnDevtools?: boolean;
  /** Optional fingerprint id (e.g. user id / session id). Hashed into the watermark. */
  fingerprintId?: string;
}

// ── Devtools detection (size-discrepancy heuristic) ──────────────────────────
//
// Browsers don't expose a reliable "is DevTools open" API. The most stable
// signal is the gap between window.outerWidth/Height and innerWidth/Height
// when DevTools is docked, plus a debugger statement timing trick. We use the
// size heuristic only — the timing trick is too aggressive for production.

const DEVTOOLS_THRESHOLD = 160;

function detectDevtools(): boolean {
  if (typeof window === 'undefined') return false;
  const widthGap = window.outerWidth - window.innerWidth;
  const heightGap = window.outerHeight - window.innerHeight;
  return widthGap > DEVTOOLS_THRESHOLD || heightGap > DEVTOOLS_THRESHOLD;
}

/**
 * Reactively reports whether DevTools is likely open. Heuristic only —
 * works against most users, defeated by undocked DevTools or float-window mode.
 *
 * Pass `enabled={false}` to skip the polling entirely (no `setInterval`, no
 * `resize` listener) — important so every `<TkxWatermark>` that isn't using
 * `intensifyOnDevtools` doesn't spin a 1s timer for nothing.
 */
export function useDevtoolsOpen(enabled = true): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    setOpen(detectDevtools());
    const handler = () => setOpen(detectDevtools());
    window.addEventListener('resize', handler);
    const interval = window.setInterval(handler, 1000);
    return () => {
      window.removeEventListener('resize', handler);
      window.clearInterval(interval);
    };
  }, [enabled]);

  return enabled ? open : false;
}

// ── Canvas Renderer ──────────────────────────────────────────────────────────

function renderWatermarkPattern(
  lines: string[],
  rotate: number,
  gap: [number, number],
  fontSize: number,
  fillColor: string,
  mode: WatermarkPattern,
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const lineHeight = fontSize * 1.5;
  const totalTextHeight = lines.length * lineHeight;
  const maxTextWidth = Math.max(...lines.map((l) => l.length)) * fontSize * 0.6;

  let canvasW: number;
  let canvasH: number;
  if (mode === 'single') {
    // Single big stamp — sized to comfortably hold the rotated text.
    canvasW = Math.max(800, maxTextWidth * 1.6);
    canvasH = Math.max(600, totalTextHeight * 4);
  } else {
    canvasW = gap[0] + maxTextWidth;
    canvasH = gap[1] + totalTextHeight;
  }

  const dpr = 2;
  canvas.width = canvasW * dpr;
  canvas.height = canvasH * dpr;
  ctx.scale(dpr, dpr);

  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.rotate((rotate * Math.PI) / 180);

  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = fillColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  lines.forEach((line, i) => {
    const y = (i - (lines.length - 1) / 2) * lineHeight;
    ctx.fillText(line, 0, y);
  });

  return canvas.toDataURL();
}

function makeFingerprintLines(
  base: string[],
  fingerprintId: string | undefined,
): string[] {
  const id = fingerprintId || (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10));
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
  return [...base, `id:${id} • ${ts}`];
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
  pattern = 'tiled',
  dynamic = false,
  refreshMs = 0,
  intensifyOnDevtools = false,
  fingerprintId,
}: TkxWatermarkProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState('');
  const [tick, setTick] = useState(0);
  // Only poll for DevTools when the consumer actually opted into the behaviour.
  const devtoolsOpen = useDevtoolsOpen(intensifyOnDevtools);

  // Sanitise + optionally augment with fingerprint
  const lines = useMemo(() => {
    const sanitised = (Array.isArray(text) ? text : [text]).map((t) => sanitizeString(t));
    return pattern === 'fingerprint' ? makeFingerprintLines(sanitised, fingerprintId) : sanitised;
    // tick intentionally re-runs the memo to refresh fingerprint timestamp
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, pattern, fingerprintId, tick]);

  // Intensify opacity when DevTools open
  const baseOpacityHex = intensifyOnDevtools && devtoolsOpen ? '66' : '22';
  const fillColor = color ?? `${theme.textMuted}${baseOpacityHex}`;

  const generatePattern = useCallback(() => {
    return renderWatermarkPattern(lines, rotate, gap, fontSize, fillColor, pattern);
  }, [lines, rotate, gap, fontSize, fillColor, pattern]);

  // Render watermark whenever inputs change.
  useEffect(() => {
    const dataUrl = generatePattern();
    if (dataUrl) setBgImage(`url(${dataUrl})`);
  }, [generatePattern]);

  // Periodic refresh (e.g. for fingerprint timestamp drift)
  useEffect(() => {
    if (!refreshMs || refreshMs <= 0) return;
    const id = window.setInterval(() => setTick((t) => t + 1), refreshMs);
    return () => window.clearInterval(id);
  }, [refreshMs]);

  // Rerender on tab visibility change
  useEffect(() => {
    if (!dynamic || typeof document === 'undefined') return;
    const handler = () => {
      if (document.visibilityState === 'visible') setTick((t) => t + 1);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [dynamic]);

  // Anti-tamper observer — re-applies the bg-image if the inline style is removed.
  useEffect(() => {
    const overlay = containerRef.current?.querySelector<HTMLElement>('[data-watermark]');
    if (!overlay) return;

    const observer = new MutationObserver(() => {
      const dataUrl = generatePattern();
      if (dataUrl) overlay.style.backgroundImage = `url(${dataUrl})`;
    });

    observer.observe(overlay, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, [generatePattern]);

  const overlayStyle: React.CSSProperties = {
    zIndex,
    backgroundImage: bgImage,
    backgroundRepeat: pattern === 'single' ? 'no-repeat' : 'repeat',
    backgroundPosition: pattern === 'single' ? 'center center' : undefined,
    animation: reducedMotion ? 'none' : 'tkxFadeIn 0.3s ease',
  };

  const contentStyle: React.CSSProperties =
    intensifyOnDevtools && devtoolsOpen ? { filter: 'blur(4px)', transition: 'filter 0.2s' } : {};

  return (
    <div
      ref={containerRef}
      className={tkx('relative')}
      style={{ overflow: 'hidden' }}
    >
      <div style={contentStyle}>{children}</div>
      <div
        data-watermark
        aria-hidden="true"
        className={tkx('absolute inset-0 pointer-events-none')}
        style={overlayStyle}
      />
      {intensifyOnDevtools && devtoolsOpen && (
        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '6px 12px',
            background: theme.danger,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 6,
            zIndex: zIndex + 1,
            pointerEvents: 'none',
          }}
        >
          Developer Tools detected — content protected
        </div>
      )}
    </div>
  );
}
