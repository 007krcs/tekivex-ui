import { createContext, useContext, useLayoutEffect, useEffect, type ReactNode, createElement } from 'react';
import { cssVar } from '../engine/css';
import { meetsAA } from '../engine/wcag';

// useLayoutEffect on client, useEffect on server (avoids SSR warning)
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// ── Theme Token Type ─────────────────────────────────────────────────────────

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  secondary: string;
  danger: string;
  warning: string;
  success: string;
  info: string;
}

// ── Built-in Themes ──────────────────────────────────────────────────────────

export const quantumDark: ThemeTokens = {
  bg: '#0a0a0f',
  surface: '#12121a',
  surfaceAlt: '#1a1a2e',
  border: '#2a2a3e',
  text: '#e8e8f4',
  textMuted: '#8888aa',
  primary: '#00f5d4',
  secondary: '#7b2ff7',
  danger: '#f72585',
  warning: '#ffbe0b',
  success: '#06d6a0',
  info: '#3a86ff',
};

export const auroraLight: ThemeTokens = {
  bg: '#f8f6f1',
  surface: '#ffffff',
  surfaceAlt: '#f0ede6',
  border: '#ddd8cc',
  text: '#1a1815',
  textMuted: '#6b6560',
  primary: '#0d7c5f',
  secondary: '#6930c3',
  danger: '#c1121f',
  warning: '#d4a017',
  success: '#0d7c5f',
  info: '#1d4ed8',
};

// ── Theme Factory ────────────────────────────────────────────────────────────

const HEX_PATTERN = /^#[0-9a-fA-F]{3,8}$/;

export function createTheme(base: ThemeTokens, overrides?: Partial<ThemeTokens>): ThemeTokens {
  const theme = { ...base, ...overrides };

  for (const [key, value] of Object.entries(theme)) {
    if (!HEX_PATTERN.test(value)) {
      throw new Error(`Invalid hex color for theme token '${key}': ${value}`);
    }
  }

  if (!meetsAA(theme.text, theme.bg)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[TekiVex] Theme contrast warning: text (${theme.text}) vs bg (${theme.bg}) does not meet WCAG AA minimum (4.5:1)`,
    );
  }
  if (!meetsAA(theme.primary, theme.bg)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[TekiVex] Theme contrast warning: primary (${theme.primary}) vs bg (${theme.bg}) does not meet WCAG AA minimum`,
    );
  }

  return theme;
}

// ── Theme Context ────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeTokens>(quantumDark);

export interface ThemeProviderProps {
  theme?: ThemeTokens;
  children: ReactNode;
}

export function ThemeProvider({ theme = quantumDark, children }: ThemeProviderProps) {
  // useLayoutEffect fires synchronously after DOM mutations and before paint,
  // eliminating the flash-of-unstyled-content that useEffect causes.
  // The isomorphic alias silently falls back to useEffect during SSR.
  useIsomorphicLayoutEffect(() => {
    const vars = (Object.entries(theme) as [keyof ThemeTokens, string][])
      .map(([key, value]) => cssVar(key, value))
      .join(' ');
    let styleEl = document.getElementById('tkx-theme') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'tkx-theme';
      // Insert as the very first style element so it has the lowest specificity
      // and component-level overrides always win.
      const firstStyle = document.head.querySelector('style');
      if (firstStyle) {
        document.head.insertBefore(styleEl, firstStyle);
      } else {
        document.head.appendChild(styleEl);
      }
    }
    styleEl.textContent = `:root { ${vars} }`;
  }, [theme]);

  // Also set CSS variables as inline style on the provider wrapper so that
  // SSR-rendered HTML already contains the correct values without a round-trip.
  const inlineVars = Object.fromEntries(
    (Object.entries(theme) as [keyof ThemeTokens, string][]).map(([key, value]) => [
      `--tkx-${key}`,
      value,
    ]),
  ) as Record<string, string>;

  return createElement(
    ThemeContext.Provider,
    { value: theme },
    createElement('div', { style: { display: 'contents', ...inlineVars } }, children),
  );
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}

// ── Color Palette Generator ─────────────────────────────────────────────────
// Generates 50-900 shades from a single hex color

function hexToHSL(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export function generatePalette(hex: string): ColorPalette {
  const [h, s] = hexToHSL(hex);
  return {
    50:  hslToHex(h, Math.min(s, 30), 96),
    100: hslToHex(h, Math.min(s, 40), 90),
    200: hslToHex(h, Math.min(s, 50), 80),
    300: hslToHex(h, s, 70),
    400: hslToHex(h, s, 60),
    500: hex,
    600: hslToHex(h, s, 45),
    700: hslToHex(h, s, 35),
    800: hslToHex(h, s, 25),
    900: hslToHex(h, s, 15),
  };
}

// ── Typography Scale ────────────────────────────────────────────────────────

export const typography = {
  xs:   { fontSize: '0.75rem',  lineHeight: '1rem' },
  sm:   { fontSize: '0.875rem', lineHeight: '1.25rem' },
  base: { fontSize: '1rem',     lineHeight: '1.5rem' },
  lg:   { fontSize: '1.125rem', lineHeight: '1.75rem' },
  xl:   { fontSize: '1.25rem',  lineHeight: '1.75rem' },
  '2xl': { fontSize: '1.5rem',  lineHeight: '2rem' },
  '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
  '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },
  '5xl': { fontSize: '3rem',    lineHeight: '1.15' },
} as const;

// ── Spacing Scale ───────────────────────────────────────────────────────────

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ── Breakpoints ─────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
  sm: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
} as const;

// ── Z-Index Scale ───────────────────────────────────────────────────────────

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
  max: 9999,
} as const;

// ── Radius ──────────────────────────────────────────────────────────────────

export const radii = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const;
