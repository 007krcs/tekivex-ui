'use client';

import { useState, useEffect, useRef, type ReactNode, type CSSProperties, createElement } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface TkxStatisticProps {
  title: string; value: number | string; prefix?: ReactNode; suffix?: ReactNode;
  precision?: number; groupSeparator?: string; valueStyle?: CSSProperties;
  loading?: boolean; trend?: 'up' | 'down'; trendValue?: string; style?: CSSProperties;
}

export interface TkxCountdownProps {
  title: string; value: number; format?: string; onFinish?: () => void;
  prefix?: ReactNode; suffix?: ReactNode; style?: CSSProperties;
}

// ── Number Formatting ───────────────────────────────────────────────────────

function formatNumber(value: number | string, precision?: number, separator = ','): string {
  if (typeof value === 'string') return value;

  const fixed = precision !== undefined ? value.toFixed(precision) : String(value);
  const [intPart, decPart] = fixed.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
}

// ── Countdown Formatting ────────────────────────────────────────────────────

function formatCountdown(ms: number, fmt: string): string {
  if (ms <= 0) return fmt.replace(/DD?/g, '0').replace(/HH?/g, '00').replace(/mm?/g, '00').replace(/ss?/g, '00');
  const t = Math.floor(ms / 1000);
  const d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600);
  const min = Math.floor((t % 3600) / 60), s = t % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return fmt.replace(/DD/g, pad(d)).replace(/D/g, String(d))
    .replace(/HH/g, pad(h)).replace(/H/g, String(h))
    .replace(/mm/g, pad(min)).replace(/m/g, String(min))
    .replace(/ss/g, pad(s)).replace(/s/g, String(s));
}

// ── Trend Arrow ─────────────────────────────────────────────────────────────

function TrendArrow({ direction, color }: { direction: 'up' | 'down'; color: string }) {
  const d = direction === 'up' ? 'M6 10 L10 4 L14 10' : 'M6 4 L10 10 L14 4';
  return createElement('svg', {
    width: 16, height: 14, viewBox: '0 0 20 14', fill: 'none',
    'aria-hidden': 'true', style: { display: 'inline-block', verticalAlign: 'middle' },
  }, createElement('path', {
    d, stroke: color, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none',
  }));
}

// ── Loading Skeleton ────────────────────────────────────────────────────────

let skeletonInjected = false;
function injectSkeletonStyles() {
  if (skeletonInjected || typeof document === 'undefined') return;
  skeletonInjected = true;
  const el = document.createElement('style');
  el.id = 'tkx-statistic-skeleton';
  el.textContent = '@keyframes tkx-stat-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}';
  document.head.appendChild(el);
}

function Skeleton({ w, h, alt, bdr, rm }: { w: string; h: string; alt: string; bdr: string; rm: boolean }) {
  if (!rm) injectSkeletonStyles();
  return createElement('div', { 'aria-hidden': 'true', style: {
    width: w, height: h, borderRadius: '4px',
    background: rm ? alt : `linear-gradient(90deg, ${alt} 25%, ${bdr} 50%, ${alt} 75%)`,
    backgroundSize: '200% 100%', animation: rm ? 'none' : 'tkx-stat-shimmer 1.5s ease-in-out infinite',
  }});
}

// ── TkxStatistic ────────────────────────────────────────────────────────────

export function TkxStatistic({
  title,
  value,
  prefix,
  suffix,
  precision,
  groupSeparator = ',',
  valueStyle,
  loading = false,
  trend,
  trendValue,
  style,
}: TkxStatisticProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const safeTitle = sanitizeString(title);
  const safeTrendValue = trendValue ? sanitizeString(trendValue) : undefined;

  const trendColor = trend === 'up' ? theme.css.success : trend === 'down' ? theme.css.danger : undefined;

  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        ...style,
      },
    },
    // Title
    createElement(
      'div',
      {
        style: {
          color: theme.css.textMuted,
          fontSize: '0.875rem',
          lineHeight: '1.4',
        },
      },
      safeTitle,
    ),
    // Value row
    loading
      ? createElement(Skeleton, { w: '120px', h: '32px', alt: theme.css.surfaceAlt, bdr: theme.css.border, rm: reducedMotion })
      : createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px',
              fontSize: '1.75rem',
              fontWeight: 700,
              lineHeight: '1.2',
              color: theme.css.text,
              fontVariantNumeric: 'tabular-nums',
              ...valueStyle,
            },
          },
          prefix &&
            createElement(
              'span',
              { style: { fontSize: '0.75em', fontWeight: 400 } },
              prefix,
            ),
          createElement('span', null, formatNumber(value, precision, groupSeparator)),
          suffix &&
            createElement(
              'span',
              { style: { fontSize: '0.6em', fontWeight: 400, color: theme.css.textMuted } },
              suffix,
            ),
        ),
    // Trend line
    trend &&
      createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8125rem',
            color: trendColor,
            marginTop: '2px',
          },
        },
        createElement(TrendArrow, { direction: trend, color: trendColor! }),
        safeTrendValue &&
          createElement('span', null, safeTrendValue),
      ),
  );
}

// ── TkxCountdown ────────────────────────────────────────────────────────────

export function TkxCountdown({
  title,
  value,
  format = 'HH:mm:ss',
  onFinish,
  prefix,
  suffix,
  style,
}: TkxCountdownProps) {
  const theme = useTheme();
  const safeTitle = sanitizeString(title);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const finishedRef = useRef(false);

  const [remaining, setRemaining] = useState(() => Math.max(0, value - Date.now()));

  useEffect(() => {
    finishedRef.current = false;
    const tick = () => {
      const diff = Math.max(0, value - Date.now());
      setRemaining(diff);
      if (diff <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        onFinishRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [value]);

  const display = formatCountdown(remaining, format);

  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        ...style,
      },
    },
    createElement(
      'div',
      {
        style: {
          color: theme.css.textMuted,
          fontSize: '0.875rem',
          lineHeight: '1.4',
        },
      },
      safeTitle,
    ),
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          fontSize: '1.75rem',
          fontWeight: 700,
          lineHeight: '1.2',
          color: remaining <= 0 ? theme.css.danger : theme.css.text,
          fontVariantNumeric: 'tabular-nums',
        },
      },
      prefix &&
        createElement(
          'span',
          { style: { fontSize: '0.75em', fontWeight: 400 } },
          prefix,
        ),
      createElement('span', null, display),
      suffix &&
        createElement(
          'span',
          { style: { fontSize: '0.6em', fontWeight: 400, color: theme.css.textMuted } },
          suffix,
        ),
    ),
  );
}