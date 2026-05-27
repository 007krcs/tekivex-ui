'use client';

import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { cx, tkx } from '../engine/tkx';

export type GaugeVariant = 'arc' | 'speedometer';

export interface GaugeThreshold {
  at: number;
  color: string;
}

export interface TkxGaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  variant?: GaugeVariant;
  thresholds?: GaugeThreshold[];
  label?: string;
  showValue?: boolean;
  showTicks?: boolean;
  formatValue?: (v: number) => string;
  ariaLabel?: string;
}

// Sweep configuration per variant. Angles are in degrees, measured clockwise
// from 12 o'clock (top). We render with a rotation so the START sits where the
// arc visually begins.
//
//   arc          → 270° sweep, gap at the bottom
//   speedometer  → 180° sweep across the top half
const SWEEP: Record<GaugeVariant, { start: number; end: number; sweep: number }> = {
  arc: { start: -135, end: 135, sweep: 270 },
  speedometer: { start: -90, end: 90, sweep: 180 },
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  // angleDeg measured clockwise from "12 o'clock" (negative Y in SVG)
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  if (Math.abs(endAngle - startAngle) < 0.0001) return '';
  const s = polar(cx, cy, r, startAngle);
  const e = polar(cx, cy, r, endAngle);
  const sweep = endAngle - startAngle;
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;
  return `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${r.toFixed(2)},${r.toFixed(2)} 0 ${largeArc} ${sweepFlag} ${e.x.toFixed(2)},${e.y.toFixed(2)}`;
}

function clamp(v: number, lo: number, hi: number): number {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

function colorForValue(value: number, thresholds: GaugeThreshold[] | undefined, fallback: string): string {
  if (!thresholds || thresholds.length === 0) return fallback;
  // Sort ascending by `at`. The threshold whose `at` is the largest value <= v wins.
  const sorted = [...thresholds].sort((a, b) => a.at - b.at);
  let chosen = sorted[0].color;
  for (const t of sorted) {
    if (value >= t.at) chosen = t.color;
  }
  return chosen;
}

export const TkxGauge = forwardRef<HTMLDivElement, TkxGaugeProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      size = 200,
      thickness = 16,
      variant = 'arc',
      thresholds,
      label,
      showValue = true,
      showTicks = false,
      formatValue,
      ariaLabel,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    const clamped = clamp(value, safeMin, safeMax);
    const range = safeMax - safeMin || 1;
    const pct = (clamped - safeMin) / range;

    const { start, end, sweep } = SWEEP[variant];
    const valueAngle = start + sweep * pct;

    const cxv = size / 2;
    const cyv = size / 2;
    const r = (size - thickness) / 2;

    // Animated sweep: when value changes, animate the foreground arc length
    // from its previous value to its new value. We do this by tracking the
    // displayed pct in state and easing it toward `pct` over ~400ms.
    const [displayPct, setDisplayPct] = useState(pct);
    const rafRef = useRef<number | null>(null);
    const fromRef = useRef<number>(pct);
    const toRef = useRef<number>(pct);
    const startRef = useRef<number>(0);

    useEffect(() => {
      if (reducedMotion) {
        setDisplayPct(pct);
        return;
      }
      fromRef.current = displayPct;
      toRef.current = pct;
      startRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const duration = 400;
      const tick = (now: number) => {
        const t = Math.min(1, (now - startRef.current) / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const v = fromRef.current + (toRef.current - fromRef.current) * eased;
        setDisplayPct(v);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      if (typeof requestAnimationFrame !== 'undefined') {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayPct(pct);
      }
      return () => {
        if (rafRef.current != null && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(rafRef.current);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pct, reducedMotion]);

    const liveAngle = start + sweep * displayPct;

    const trackD = arcPath(cxv, cyv, r, start, end);

    // Foreground: either a single arc or per-threshold segments. Each segment
    // is clipped to the current value angle so the gauge "fills up" cleanly.
    const segments: { d: string; color: string }[] = [];
    if (thresholds && thresholds.length > 0) {
      const sorted = [...thresholds].sort((a, b) => a.at - b.at);
      // Build boundaries: [min, ...thresholds.at filtered to (min,max], max]
      const boundaries: number[] = [safeMin];
      for (const t of sorted) {
        if (t.at > safeMin && t.at < safeMax) boundaries.push(t.at);
      }
      boundaries.push(safeMax);
      for (let i = 0; i < boundaries.length - 1; i++) {
        const segStartV = boundaries[i];
        const segEndV = boundaries[i + 1];
        const segStartAngle = start + sweep * ((segStartV - safeMin) / range);
        const segEndAngle = start + sweep * ((segEndV - safeMin) / range);
        const clippedEnd = Math.min(segEndAngle, liveAngle);
        if (clippedEnd <= segStartAngle) continue;
        // Find color for this segment: use the threshold matching segStartV
        const segColor = colorForValue(segStartV + 0.0001, thresholds, theme.primary);
        segments.push({ d: arcPath(cxv, cyv, r, segStartAngle, clippedEnd), color: segColor });
      }
    } else {
      segments.push({ d: arcPath(cxv, cyv, r, start, liveAngle), color: theme.primary });
    }

    const activeColor = colorForValue(clamped, thresholds, theme.primary);

    // Tick marks: 11 major (every 10%), 4 minors between each pair.
    const ticks: React.ReactNode[] = [];
    if (showTicks) {
      const MAJOR = 10; // segments → 11 major ticks
      const MINOR_PER = 5; // total subdivisions per major segment (1 major + 4 minor each side handled below)
      const tickOuter = r + thickness / 2 + 1;
      const tickMajorInner = r + thickness / 2 - 4;
      const tickMinorInner = r + thickness / 2 - 2;
      const total = MAJOR * MINOR_PER;
      for (let i = 0; i <= total; i++) {
        const isMajor = i % MINOR_PER === 0;
        const angle = start + (sweep * i) / total;
        const outer = polar(cxv, cyv, tickOuter, angle);
        const inner = polar(cxv, cyv, isMajor ? tickMajorInner : tickMinorInner, angle);
        ticks.push(
          <line
            key={i}
            x1={outer.x.toFixed(2)}
            y1={outer.y.toFixed(2)}
            x2={inner.x.toFixed(2)}
            y2={inner.y.toFixed(2)}
            stroke={theme.textMuted}
            strokeWidth={isMajor ? 1.5 : 0.75}
            strokeLinecap="round"
            data-tkx-gauge-tick={isMajor ? 'major' : 'minor'}
          />,
        );
      }
    }

    const formatted = formatValue ? formatValue(clamped) : String(clamped);

    return (
      <div
        ref={ref}
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={safeMin}
        aria-valuemax={safeMax}
        aria-valuetext={formatted}
        aria-label={ariaLabel ?? label ?? 'Gauge'}
        className={cx(tkx('inline-flex flex-col items-center'), className)}
        style={style}
        data-tkx-gauge-variant={variant}
        data-tkx-reduced-motion={reducedMotion ? 'true' : 'false'}
        {...rest}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Track */}
          <path
            d={trackD}
            fill="none"
            stroke={theme.border}
            strokeWidth={thickness}
            strokeLinecap="round"
            data-tkx-gauge-track=""
          />
          {/* Value arc(s) */}
          {segments.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              data-tkx-gauge-segment=""
            />
          ))}
          {/* Ticks */}
          {showTicks && <g data-tkx-gauge-ticks="">{ticks}</g>}
          {/* Center value */}
          {showValue && (
            <text
              x={cxv}
              y={cyv + (variant === 'speedometer' ? 4 : 6)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={activeColor}
              style={{
                fontSize: `${size * 0.18}px`,
                fontWeight: 700,
                fontFamily: 'inherit',
                fontVariantNumeric: 'tabular-nums',
              }}
              data-tkx-gauge-value=""
            >
              {formatted}
            </text>
          )}
        </svg>
        {label && (
          <span
            className={tkx('text-sm')}
            style={{ color: theme.textMuted, marginTop: '-8px' }}
            data-tkx-gauge-label=""
          >
            {label}
          </span>
        )}
        {/* Avoid an unused-variable lint when valueAngle isn't referenced
            (it's documented above as the "logical" target angle; liveAngle drives the render). */}
        <span hidden data-tkx-gauge-target-angle={valueAngle.toFixed(2)} />
      </div>
    );
  },
);

TkxGauge.displayName = 'TkxGauge';
