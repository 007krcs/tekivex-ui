import { createContext, useContext, useEffect, type ReactNode, createElement } from 'react';
import { cssVar } from '../engine/css';
import { meetsAA } from '../engine/wcag';

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
  useEffect(() => {
    const vars = (Object.entries(theme) as [keyof ThemeTokens, string][])
      .map(([key, value]) => cssVar(key, value))
      .join(' ');
    let styleEl = document.getElementById('tkx-theme') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'tkx-theme';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `:root { ${vars} }`;
  }, [theme]);

  return createElement(ThemeContext.Provider, { value: theme }, children);
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}
