'use client';

import { type ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TkxSegmentedProps {
  options: SegmentedOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ── Size Map ─────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: { height: 28, fontSize: 12, px: 10 },
  md: { height: 36, fontSize: 14, px: 16 },
  lg: { height: 44, fontSize: 16, px: 20 },
} as const;

// ── Component ────────────────────────────────────────────────────────────────

export function TkxSegmented({
  options = [],
  value,
  onChange,
  size = 'md',
  block = false,
  className,
  style,
}: TkxSegmentedProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const dims = SIZE_MAP[size];

  // Sync external value
  useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value, options]);

  // Sliding indicator position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const buttons = container.querySelectorAll<HTMLButtonElement>('[data-seg-btn]');
    const btn = buttons[activeIndex];
    if (!btn) return;
    setIndicatorStyle({
      left: btn.offsetLeft,
      width: btn.offsetWidth,
      height: btn.offsetHeight,
      transition: reducedMotion ? 'none' : 'left 0.2s ease, width 0.2s ease',
    });
  }, [activeIndex, options, reducedMotion]);

  const handleSelect = useCallback(
    (idx: number) => {
      const opt = options[idx];
      if (!opt || opt.disabled) return;
      setActiveIndex(idx);
      onChange?.(opt.value);
    },
    [options, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = activeIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next = (activeIndex + 1) % options.length;
        while (options[next]?.disabled && next !== activeIndex) {
          next = (next + 1) % options.length;
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        next = (activeIndex - 1 + options.length) % options.length;
        while (options[next]?.disabled && next !== activeIndex) {
          next = (next - 1 + options.length) % options.length;
        }
      }
      if (next !== activeIndex) {
        handleSelect(next);
        const container = containerRef.current;
        const buttons = container?.querySelectorAll<HTMLButtonElement>('[data-seg-btn]');
        buttons?.[next]?.focus();
      }
    },
    [activeIndex, options, handleSelect],
  );

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Segmented control"
      className={tkx('relative inline-flex items-center rounded-lg p-1', className ?? '')}
      style={{
        backgroundColor: theme.css.surfaceAlt,
        border: `1px solid ${theme.css.border}`,
        width: block ? '100%' : undefined,
        ...style,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Sliding indicator */}
      <div
        aria-hidden="true"
        className={tkx('absolute top-1 rounded-md')}
        style={{
          ...indicatorStyle,
          backgroundColor: theme.css.surface,
          boxShadow: `0 1px 3px ${theme.css.border}`,
          zIndex: 0,
        }}
      />

      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const safeLabel = sanitizeString(opt.label);
        return (
          <button
            key={opt.value}
            data-seg-btn
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-disabled={opt.disabled || undefined}
            disabled={opt.disabled}
            tabIndex={isActive ? 0 : -1}
            className={tkx(
              'relative z-10 flex items-center justify-center gap-1 rounded-md border-0 cursor-pointer',
              'font-sans whitespace-nowrap select-none',
            )}
            style={{
              height: dims.height,
              fontSize: dims.fontSize,
              padding: `0 ${dims.px}px`,
              flex: block ? 1 : undefined,
              color: isActive ? theme.css.text : theme.css.textMuted,
              backgroundColor: 'transparent',
              opacity: opt.disabled ? 0.4 : 1,
              fontWeight: isActive ? 600 : 400,
              transition: reducedMotion ? 'none' : 'color 0.15s ease',
            }}
            onClick={() => handleSelect(idx)}
          >
            {opt.icon && <span aria-hidden="true">{opt.icon}</span>}
            {safeLabel}
          </button>
        );
      })}
    </div>
  );
}