'use client';

// ── Shared chart utilities ───────────────────────────────────────────────────

import type { ResolvedTheme } from '../themes';

/** Default palette: uses theme tokens then falls back to categorical colors */
export function getDefaultColors(theme: ResolvedTheme): string[] {
  return [
    theme.css.primary,
    theme.css.secondary,
    theme.css.info,
    theme.css.success,
    theme.css.warning,
    theme.css.danger,
    theme.css.primary + 'aa',   // primary at 67% opacity
    theme.css.secondary + 'aa', // secondary at 67% opacity
    theme.css.info + 'aa',      // info at 67% opacity
    theme.css.success + 'aa',   // success at 67% opacity
  ];
}

export interface ChartMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export const DEFAULT_MARGIN: ChartMargin = { top: 10, right: 30, bottom: 10, left: 0 };

/** Common recharts tooltip style that matches TekiVex theme */
export function tooltipStyle(theme: ResolvedTheme) {
  return {
    contentStyle: {
      backgroundColor: theme.css.surface,
      border: `1px solid ${theme.css.border}`,
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      color: theme.css.text,
      fontSize: 13,
    },
    labelStyle: { color: theme.css.textMuted, fontWeight: 600, marginBottom: 4 },
    itemStyle: { color: theme.css.text },
    cursor: { fill: `${theme.css.primary}15` },
  };
}