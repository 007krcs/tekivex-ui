'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  createElement,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MetricItem {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  previousValue?: number;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  color?: string;
  sparkline?: number[];
  status?: 'normal' | 'warning' | 'critical';
}

export interface TkxLiveMetricsProps {
  metrics: MetricItem[];
  columns?: number;
  animate?: boolean;
  refreshInterval?: number;
  onMetricClick?: (metric: MetricItem) => void;
}

// ── CSS injection ────────────────────────────────────────────────────────────

let metricsStylesInjected = false;
function injectMetricsStyles() {
  if (metricsStylesInjected || typeof document === 'undefined') return;
  metricsStylesInjected = true;
  const el = document.createElement('style');
  el.id = 'tkx-live-metrics-styles';
  el.textContent = `
@keyframes tkx-metric-pulse {
  0%   { opacity: 1; }
  40%  { opacity: 0.4; }
  100% { opacity: 1; }
}
@keyframes tkx-metric-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.tkx-metric-shimmer {
  animation: tkx-metric-shimmer 0.6s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .tkx-metric-shimmer { animation: none; }
  .tkx-metric-pulse   { animation: none; }
}
  `.trim();
  document.head.appendChild(el);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(val: number | string, unit?: string): string {
  if (typeof val === 'string') return val;
  const formatted = val >= 1_000_000
    ? `${(val / 1_000_000).toFixed(1)}M`
    : val >= 1_000
    ? `${(val / 1_000).toFixed(1)}k`
    : String(Number.isInteger(val) ? val : val.toFixed(2));
  return unit ? `${formatted}${unit}` : formatted;
}

function getStatusColor(status: MetricItem['status'], theme: ReturnType<typeof useTheme>): string {
  switch (status) {
    case 'warning':  return theme.warning;
    case 'critical': return theme.danger;
    default:         return theme.primary;
  }
}

// ── useCountUp ───────────────────────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useCountUp(target: number, duration: number, enabled: boolean): number {
  const [displayed, setDisplayed] = useState(target);
  const startRef = useRef(target);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion) {
      setDisplayed(target);
      startRef.current = target;
      return;
    }
    const from = startRef.current;
    if (from === target) return;
    startTimeRef.current = null;

    const step = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (target - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        startRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled, reducedMotion]);

  return displayed;
}

// ── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const W = 80;
  const H = 24;
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - minV) / range) * (H - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return createElement(
    'svg',
    { width: W, height: H, viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' },
    createElement('polyline', {
      points: points.join(' '),
      fill: 'none',
      stroke: color,
      strokeWidth: 1.5,
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
    }),
  );
}

// ── TrendIcon ────────────────────────────────────────────────────────────────

function TrendIcon({ trend, theme }: { trend: MetricItem['trend']; theme: ReturnType<typeof useTheme> }) {
  if (trend === 'up')   return createElement('span', { style: { color: theme.success, fontSize: 14, fontWeight: 700 } }, '▲');
  if (trend === 'down') return createElement('span', { style: { color: theme.danger,  fontSize: 14, fontWeight: 700 } }, '▼');
  return createElement('span', { style: { color: theme.textMuted, fontSize: 14 } }, '→');
}

// ── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  metric: MetricItem;
  animate: boolean;
  onMetricClick?: (metric: MetricItem) => void;
  theme: ReturnType<typeof useTheme>;
}

function MetricCard({ metric, animate, onMetricClick, theme }: MetricCardProps) {
  const accentColor = metric.color ?? getStatusColor(metric.status, theme);
  const numericValue = typeof metric.value === 'number' ? metric.value : NaN;
  const animatedValue = useCountUp(isNaN(numericValue) ? 0 : numericValue, 600, animate && !isNaN(numericValue));

  const [shimmer, setShimmer] = useState(false);
  const prevValueRef = useRef(metric.value);

  useEffect(() => {
    if (prevValueRef.current !== metric.value) {
      prevValueRef.current = metric.value;
      setShimmer(true);
      const t = window.setTimeout(() => setShimmer(false), 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [metric.value]);

  const hasPrev = metric.previousValue !== undefined && metric.previousValue !== numericValue;

  const cardStyle: CSSProperties = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderLeft: `4px solid ${accentColor}`,
    borderRadius: 8,
    padding: '14px 16px',
    cursor: onMetricClick ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const shimmerOverlay: CSSProperties = shimmer
    ? {
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(90deg, transparent 0%, ${accentColor}22 50%, transparent 100%)`,
        backgroundSize: '200% 100%',
        animation: 'tkx-metric-shimmer 0.6s ease-in-out',
        pointerEvents: 'none',
      }
    : {};

  const displayedText = isNaN(numericValue)
    ? sanitizeString(String(metric.value))
    : formatValue(animatedValue, metric.unit);

  return createElement(
    'div',
    {
      style: cardStyle,
      className: shimmer ? 'tkx-metric-shimmer' : undefined,
      onClick: onMetricClick ? () => onMetricClick(metric) : undefined,
      role: onMetricClick ? 'button' : undefined,
      tabIndex: onMetricClick ? 0 : undefined,
    },
    // Shimmer overlay
    shimmer && createElement('div', { style: shimmerOverlay }),
    // Label
    createElement('div', { style: { fontSize: 12, color: theme.textMuted, marginBottom: 6, fontWeight: 500, letterSpacing: '0.03em' } }, sanitizeString(metric.label)),
    // Value row
    createElement(
      'div',
      { style: { display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 } },
      createElement('span', { style: { fontSize: 28, fontWeight: 700, color: theme.text, lineHeight: 1 } }, displayedText),
      metric.unit && isNaN(numericValue) && createElement('span', { style: { fontSize: 14, color: theme.textMuted, marginBottom: 2 } }, sanitizeString(metric.unit)),
    ),
    // Trend row
    (metric.trend || metric.trendValue) && createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: metric.sparkline ? 8 : 0 } },
      metric.trend && createElement(TrendIcon, { trend: metric.trend, theme }),
      metric.trendValue && createElement('span', { style: { fontSize: 12, color: theme.textMuted } }, sanitizeString(metric.trendValue)),
    ),
    // Previous value
    hasPrev && createElement(
      'div',
      { style: { fontSize: 11, color: theme.textMuted, marginTop: 2 } },
      `was ${formatValue(metric.previousValue as number)}`,
    ),
    // Sparkline
    metric.sparkline && metric.sparkline.length >= 2 && createElement(
      'div',
      { style: { marginTop: 8 } },
      createElement(Sparkline, { data: metric.sparkline, color: accentColor }),
    ),
  );
}

// ── TkxLiveMetrics ───────────────────────────────────────────────────────────

export function TkxLiveMetrics({
  metrics,
  columns = 3,
  animate = true,
  onMetricClick,
}: TkxLiveMetricsProps) {
  const theme = useTheme();
  injectMetricsStyles();

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 16,
  };

  return createElement(
    'div',
    { style: gridStyle },
    ...metrics.map((metric) =>
      createElement(MetricCard, {
        key: metric.id,
        metric,
        animate,
        onMetricClick,
        theme,
      }),
    ),
  );
}

// Satisfy import requirement
void tkx;