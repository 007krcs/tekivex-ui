'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useTheme } from '../themes';
import { cx, tkx } from '../engine/tkx';

export interface TkxAIConfidenceBarProps {
  /** 0–100 confidence value */
  value: number;
  /** Optional label for the metric being shown */
  label?: string;
  /** Show numeric percentage text */
  showLabel?: boolean;
  /** Size of the bar */
  size?: 'sm' | 'md' | 'lg';
  /** Animate on mount */
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}

const HEIGHT: Record<NonNullable<TkxAIConfidenceBarProps['size']>, number> = {
  sm: 4, md: 8, lg: 12,
};

function confidenceColor(
  value: number,
  theme: { primary: string; success: string; warning: string; danger: string },
): string {
  if (value >= 80) return theme.success;  // green
  if (value >= 55) return theme.primary;  // brand
  if (value >= 30) return theme.warning;  // amber
  return theme.danger;                    // red
}

export function TkxAIConfidenceBar({
  value,
  label,
  showLabel = true,
  size = 'md',
  animate = true,
  className,
  style,
}: TkxAIConfidenceBarProps) {
  const theme = useTheme();
  const fillRef = useRef<HTMLDivElement>(null);
  const clamped = Math.max(0, Math.min(100, value));
  const color = confidenceColor(clamped, theme);
  const h = HEIGHT[size];

  useEffect(() => {
    if (!animate || !fillRef.current) return;
    const el = fillRef.current;
    el.style.width = '0%';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.width = `${clamped}%`;
    });
    return () => cancelAnimationFrame(raf);
  }, [clamped, animate]);

  const label_ = typeof clamped === 'number'
    ? `${clamped.toFixed(0)}% AI confidence${label ? ` for ${label}` : ''}`
    : label;

  return (
    <div
      className={cx(tkx('flex flex-col gap-1'), className)}
      style={style}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label_}
    >
      {(label || showLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          {label && (
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span style={{ fontSize: 12, fontWeight: 700, color, marginLeft: 'auto' }}>
              {clamped.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div style={{
        height: h,
        borderRadius: h,
        background: `${theme.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Shimmer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: 'tkx-ai-shimmer 2s linear infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
        {/* Fill */}
        <div
          ref={fillRef}
          style={{
            height: '100%',
            width: animate ? '0%' : `${clamped}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            borderRadius: h,
            boxShadow: `0 0 8px ${color}66`,
            transition: animate ? undefined : 'width 0.3s ease',
          }}
        />
      </div>

      {/* Confidence label */}
      <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
        {clamped >= 80 ? 'High confidence' : clamped >= 55 ? 'Moderate confidence' : clamped >= 30 ? 'Low confidence' : 'Very low — review manually'}
      </div>

      <style>{`
        @keyframes tkx-ai-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}