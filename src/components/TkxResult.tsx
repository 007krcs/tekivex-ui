'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export type ResultStatus = 'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500';

export interface TkxResultProps {
  status: ResultStatus;
  title: string;
  subTitle?: string;
  icon?: ReactNode;
  extra?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ── Status Icons (SVG) ──────────────────────────────────────────────────────

const STATUS_ICONS: Record<ResultStatus, (color: string) => ReactNode> = {
  success: (c) => (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="34" stroke={c} strokeWidth="3" fill={`${c}18`} />
      <path d="M22 37l9 9 19-19" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (c) => (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="34" stroke={c} strokeWidth="3" fill={`${c}18`} />
      <path d="M26 26l20 20M46 26L26 46" stroke={c} strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  warning: (c) => (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path d="M36 6L4 64h64L36 6z" stroke={c} strokeWidth="3" fill={`${c}18`} />
      <path d="M36 30v16" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="54" r="2.5" fill={c} />
    </svg>
  ),
  info: (c) => (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="34" stroke={c} strokeWidth="3" fill={`${c}18`} />
      <path d="M36 32v18" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="22" r="2.5" fill={c} />
    </svg>
  ),
  '404': (c) => (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="34" stroke={c} strokeWidth="3" fill={`${c}18`} />
      <text x="36" y="44" textAnchor="middle" fontSize="22" fontWeight="bold" fill={c}>404</text>
    </svg>
  ),
  '403': (c) => (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="34" stroke={c} strokeWidth="3" fill={`${c}18`} />
      <path d="M28 30h16v16H28z" stroke={c} strokeWidth="3" fill="none" />
      <path d="M32 30v-4a4 4 0 018 0v4" stroke={c} strokeWidth="3" fill="none" />
    </svg>
  ),
  '500': (c) => (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle cx="36" cy="36" r="34" stroke={c} strokeWidth="3" fill={`${c}18`} />
      <text x="36" y="44" textAnchor="middle" fontSize="22" fontWeight="bold" fill={c}>500</text>
    </svg>
  ),
};

// ── Color Mapping ────────────────────────────────────────────────────────────

function getStatusColor(status: ResultStatus, theme: ReturnType<typeof useTheme>): string {
  switch (status) {
    case 'success': return theme.success;
    case 'error':
    case '500': return theme.danger;
    case 'warning': return theme.warning;
    case 'info': return theme.info;
    case '404':
    case '403': return theme.textMuted;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxResult({ status, title, subTitle, icon, extra, className, style }: TkxResultProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const accentColor = getStatusColor(status, theme);
  const safeTitle = sanitizeString(title);
  const safeSubTitle = subTitle ? sanitizeString(subTitle) : undefined;

  return (
    <div
      role="status"
      aria-live="polite"
      className={tkx('flex flex-col items-center text-center px-6 py-12 font-sans', className ?? '')}
      style={{
        animation: reducedMotion ? 'none' : 'tkxFadeIn 0.3s ease',
        ...style,
      }}
    >
      <div className={tkx('mb-6')}>
        {icon ?? STATUS_ICONS[status](accentColor)}
      </div>

      <h2
        className={tkx('text-xl font-semibold m-0 mb-2')}
        style={{ color: theme.text }}
      >
        {safeTitle}
      </h2>

      {safeSubTitle && (
        <p
          className={tkx('text-sm m-0 mb-6 max-w-md leading-relaxed')}
          style={{ color: theme.textMuted }}
        >
          {safeSubTitle}
        </p>
      )}

      {extra && (
        <div className={tkx('flex items-center gap-3 mt-4')}>
          {extra}
        </div>
      )}
    </div>
  );
}