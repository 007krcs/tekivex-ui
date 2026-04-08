// ── Shared chart utilities ───────────────────────────────────────────────────

import type { ThemeTokens } from '../themes';

/** Default palette: uses theme tokens then falls back to categorical colors */
export function getDefaultColors(theme: ThemeTokens): string[] {
  return [
    theme.primary,
    theme.secondary,
    theme.info,
    theme.success,
    theme.warning,
    theme.danger,
    theme.primary + 'aa',   // primary at 67% opacity
    theme.secondary + 'aa', // secondary at 67% opacity
    theme.info + 'aa',      // info at 67% opacity
    theme.success + 'aa',   // success at 67% opacity
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
export function tooltipStyle(theme: ThemeTokens) {
  return {
    contentStyle: {
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      color: theme.text,
      fontSize: 13,
    },
    labelStyle: { color: theme.textMuted, fontWeight: 600, marginBottom: 4 },
    itemStyle: { color: theme.text },
    cursor: { fill: `${theme.primary}15` },
  };
}
