'use client';

import { createContext, useContext, useLayoutEffect, useEffect, useMemo, useState, type ReactNode, createElement } from 'react';
import { cssVar } from '../engine/css';
import { meetsAA, meetsAAA } from '../engine/wcag';

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

  if (!meetsAAA(theme.text, theme.bg)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[TekiVex] Theme contrast warning: text (${theme.text}) vs bg (${theme.bg}) does not meet WCAG AAA minimum (7:1)`,
    );
  }

  return theme;
}

// ── Theme Context ────────────────────────────────────────────────────────────

/**
 * What {@link useTheme} returns.
 *
 * The twelve colour tokens keep their literal hex values, so existing code —
 * colour maths, canvas `fillStyle`, anything that parses a hex string — is
 * unaffected.
 *
 * `css` holds the same tokens as CSS custom-property references
 * (`var(--tkx-surface, #12121a)`). Components paint from these so that:
 *
 * 1. An app's own `globals.css` can be the single source of truth — redefine
 *    `--tkx-*` and the components follow, with the JS palette as fallback. No
 *    more hand-maintaining a JS palette in lockstep with CSS.
 * 2. App CSS can beat our inline styles WITHOUT `!important`. Inline styles
 *    outrank every selector, so `:hover` / `[data-active]` rules used to lose;
 *    custom properties resolve at use time, so redefining the variable inside
 *    those rules now cascades into the inline `var()` reference.
 */
export interface ResolvedTheme extends ThemeTokens {
  /** Same tokens as `var(--tkx-*, <hex>)` references. Paint with these. */
  css: ThemeTokens;
  /**
   * The literal hex palette. Identical to reading the tokens directly; kept as
   * an explicit, self-documenting handle for colour maths.
   */
  raw: ThemeTokens;
}

/**
 * Attach the `css` (CSS-variable) and `raw` (hex) projections to a palette.
 * The token values themselves stay hex, so this is backwards compatible.
 */
export function toCSSVarTheme(palette: ThemeTokens): ResolvedTheme {
  const css = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(palette)) {
    css[key] = typeof value === 'string' ? `var(--tkx-${key}, ${value})` : value;
  }
  return { ...palette, css: css as unknown as ThemeTokens, raw: palette };
}

export const ThemeContext = createContext<ResolvedTheme>(toCSSVarTheme(quantumDark));

export type ColorScheme = 'light' | 'dark' | 'auto';

export interface ThemeProviderProps {
  /** Explicit theme tokens. When provided, takes precedence over `mode`. */
  theme?: ThemeTokens;
  /**
   * Color-scheme strategy.
   * - "dark" / "light": pin to the corresponding built-in theme.
   * - "auto" (default if no `theme` provided): follow `prefers-color-scheme`,
   *   reacting live to system changes.
   * Ignored when `theme` is explicitly set.
   *
   * SSR note: when `mode="auto"`, the server cannot know the user's
   * `prefers-color-scheme`. To prevent a React 18 hydration mismatch the
   * server *and* the first client render emit `defaultMode` (see prop
   * below; defaults to "light"); the real preference is resolved inside
   * `useEffect` after mount. To avoid a flash, inject {@link themeInitScript}
   * into `<head>` so `data-tkx-scheme` is set before React hydrates.
   */
  mode?: ColorScheme;
  /** Theme used when system prefers light. Defaults to {@link auroraLight}. */
  lightTheme?: ThemeTokens;
  /** Theme used when system prefers dark. Defaults to {@link quantumDark}. */
  darkTheme?: ThemeTokens;
  /**
   * Deterministic theme used for SSR + the first client render when
   * `mode="auto"`. Defaults to `"light"` — matches the most common
   * consumer-default and `prefers-color-scheme: light` fallback.
   */
  defaultMode?: 'light' | 'dark';
  /**
   * When `true`, defer all theme resolution (and the wrapper's inline
   * CSS variables) until after the first effect tick. Server HTML and the
   * first client render emit a plain `display: contents` wrapper with
   * NO theme-specific styles, giving the strictest possible hydration
   * safety at the cost of a one-frame unstyled flash. Mirrors the pattern
   * used by `next-themes`.
   */
  suppressHydrationWarning?: boolean;
  children: ReactNode;
}

/**
 * Reads `prefers-color-scheme` and re-evaluates on system changes.
 *
 * SSR-safe: the initial value is ALWAYS `null` (unknown) on both server
 * and the first client render, so server HTML == first client HTML.
 * After mount, an effect populates the real value from `window.matchMedia`
 * and subscribes to live system changes.
 */
function usePrefersDark(enabled: boolean): boolean | null {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    // Safari < 14 only supports the deprecated addListener API.
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, [enabled]);

  return isDark;
}

/**
 * Tracks whether the component has mounted on the client. Always returns
 * `false` during SSR + the first client render; `true` after the first
 * effect tick. Identical pattern to `next-themes`.
 */
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function ThemeProvider({
  theme,
  mode,
  lightTheme = auroraLight,
  darkTheme = quantumDark,
  defaultMode = 'light',
  suppressHydrationWarning = false,
  children,
}: ThemeProviderProps) {
  // Resolution rules:
  //  1. If `theme` is explicitly provided, honour it (pre-2.7 behaviour).
  //  2. Else if `mode` is "light"/"dark", pin to that built-in theme.
  //  3. Else (mode === "auto" or unset), use `defaultMode` for SSR + first
  //     client render, then switch to prefers-color-scheme after mount.
  const explicit = theme !== undefined;
  const followSystem = !explicit && (mode === 'auto' || mode === undefined);
  const prefersDark = usePrefersDark(followSystem);
  const mounted = useMounted();

  const autoFallback = defaultMode === 'dark' ? darkTheme : lightTheme;

  let resolved: ThemeTokens;
  if (explicit) {
    resolved = theme!;
  } else if (mode === 'light') {
    resolved = lightTheme;
  } else if (mode === 'dark') {
    resolved = darkTheme;
  } else if (prefersDark === null) {
    // Pre-mount (SSR + first client render): deterministic default.
    resolved = autoFallback;
  } else {
    resolved = prefersDark ? darkTheme : lightTheme;
  }

  // When `suppressHydrationWarning` is set, gate DOM-mutating effects AND
  // the inline CSS variables on `mounted`. The first render emits no
  // theme-specific markup, so server HTML matches the first client render
  // byte-for-byte (the next-themes pattern).
  const gated = suppressHydrationWarning && !mounted;

  // useLayoutEffect fires synchronously after DOM mutations and before paint,
  // eliminating the flash-of-unstyled-content that useEffect causes.
  // The isomorphic alias silently falls back to useEffect during SSR.
  useIsomorphicLayoutEffect(() => {
    if (gated) return;
    const vars = (Object.entries(resolved) as [keyof ThemeTokens, string][])
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
    // Also expose the active scheme on <html> for consumers who want to
    // hook off it via [data-tkx-scheme] selectors.
    document.documentElement.setAttribute(
      'data-tkx-scheme',
      resolved === darkTheme ? 'dark' : resolved === lightTheme ? 'light' : 'custom',
    );
  }, [resolved, darkTheme, lightTheme, gated]);

  // Also set CSS variables as inline style on the provider wrapper so that
  // SSR-rendered HTML already contains the correct values without a round-trip.
  // Skip when gated — wrapper stays plain so SSR == first client render.
  const inlineVars: Record<string, string> = gated
    ? {}
    : (Object.fromEntries(
        (Object.entries(resolved) as [keyof ThemeTokens, string][]).map(([key, value]) => [
          `--tkx-${key}`,
          value,
        ]),
      ) as Record<string, string>);

  // Components paint from `var(--tkx-*)` rather than raw hex — see ResolvedTheme.
  const painted = useMemo(() => toCSSVarTheme(resolved), [resolved]);

  return createElement(
    ThemeContext.Provider,
    { value: painted },
    createElement('div', { style: { display: 'contents', ...inlineVars } }, children),
  );
}

/**
 * Returns an HTML `<script>` body (an IIFE) to inject into the document
 * head BEFORE the React app loads. Reads `prefers-color-scheme` and an
 * optional `localStorage` key, then sets `document.documentElement.dataset.theme`
 * (`"light"` or `"dark"`) so the page renders correctly on first paint
 * with no FOUC.
 *
 * The returned string is the SCRIPT BODY only — wrap it in a `<script>`
 * tag yourself. Safe to inline via `dangerouslySetInnerHTML`: it is a
 * self-contained IIFE with no closures over outer variables and no
 * user-controllable interpolation (only the JSON-encoded options).
 *
 * @example Next.js (`app/layout.tsx`):
 * ```tsx
 * <head>
 *   <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
 * </head>
 * ```
 */
export function themeInitScript(opts?: {
  /** localStorage key checked first; falls back to `prefers-color-scheme`. Default: `'tkx-theme'`. */
  storageKey?: string;
  /** Fallback when neither localStorage nor `prefers-color-scheme` yields a value. Default: `'light'`. */
  defaultMode?: 'light' | 'dark';
}): string {
  const storageKey = opts?.storageKey ?? 'tkx-theme';
  const defaultMode = opts?.defaultMode === 'dark' ? 'dark' : 'light';
  // JSON.stringify guarantees the values are safely embedded with no XSS
  // surface even if a future caller passes a hostile string.
  const k = JSON.stringify(storageKey);
  const d = JSON.stringify(defaultMode);
  return `(function(){try{var k=${k};var d=${d};var s=null;try{s=window.localStorage.getItem(k);}catch(e){}var m=s;if(m!=="light"&&m!=="dark"){m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":d);}var r=document.documentElement;r.dataset.theme=m;r.setAttribute("data-tkx-scheme",m);}catch(e){}})();`;
}

export function useTheme(): ResolvedTheme {
  return useContext(ThemeContext);
}

/**
 * Map the active theme onto the legacy `--tkx-*` CSS custom properties that
 * several editor/grid components (FlowChart, FormBuilder, Gantt, MindMap,
 * PivotTable, Spreadsheet, FormulaBar) reference via `var(--tkx-bg, #fallback)`.
 *
 * The library's theme system never *defined* these variables, so those
 * components always fell back to their hardcoded dark hex and ignored light
 * themes. Spreading the result of this helper onto a component's root element
 * binds every `var(--tkx-*)` reference in its subtree to the live theme — one
 * edit instead of rewriting dozens of color literals.
 *
 * @example
 * const theme = useTheme();
 * <div style={{ ...tkxThemeVars(theme), ...rest }}>…</div>
 */
export function tkxThemeVars(theme: ThemeTokens): Record<string, string> {
  return {
    '--tkx-bg': theme.bg,
    '--tkx-bg-subtle': theme.surface,
    '--tkx-fg': theme.text,
    '--tkx-fg-muted': theme.textMuted,
    '--tkx-accent': theme.primary,
    '--tkx-border': theme.border,
    '--tkx-border-soft': theme.surfaceAlt,
  };
}

/**
 * Returns the user's OS-level color-scheme preference, reactively.
 * Useful for consumers managing their own theme switching.
 *
 * @example
 * const scheme = usePrefersColorScheme();
 * // => "dark" | "light"
 */
export function usePrefersColorScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setScheme(e.matches ? 'dark' : 'light');
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, []);
  return scheme;
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
