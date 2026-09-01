/**
 * Theme tokens as bare CSS custom-property references — no React, no context,
 * no hook.
 *
 * `useTheme()` reads React context, which forces any component using it to be a
 * Client Component. But since 4.1.0 components paint with
 * `var(--tkx-<token>, <fallback>)` rather than a resolved hex value, and
 * `ThemeProvider` defines those variables on the DOM. So a purely
 * presentational component does not need the context at all: it can emit the
 * variable reference directly and let CSS resolve it at use time.
 *
 * The practical effect is that such components can drop `'use client'` and
 * render as React Server Components — zero JavaScript shipped for them — while
 * still theming correctly, including live theme switches, because resolution
 * happens in CSS rather than in JS.
 *
 * IMPORTANT: this module must not import anything that touches React. In
 * particular it must not import `./index`, which calls `createContext` —
 * evaluating that inside a Server Component is an error. That is why the
 * fallback values are written out literally here instead of being read from
 * `quantumDark`. `tests/rsc-safety.test.ts` asserts the two stay identical, so
 * the duplication cannot silently drift.
 */
import type { ThemeTokens } from './index';

/**
 * Context-free equivalent of `useTheme().css`. Safe in Server Components.
 *
 * Fallbacks mirror `quantumDark` and apply only when no ThemeProvider has
 * defined the variables; with a provider mounted, the provider always wins.
 */
export const cssTokens: ThemeTokens = {
  bg: 'var(--tkx-bg, #0a0a0f)',
  surface: 'var(--tkx-surface, #12121a)',
  surfaceAlt: 'var(--tkx-surfaceAlt, #1a1a2e)',
  border: 'var(--tkx-border, #2a2a3e)',
  text: 'var(--tkx-text, #e8e8f4)',
  textMuted: 'var(--tkx-textMuted, #8888aa)',
  primary: 'var(--tkx-primary, #00f5d4)',
  secondary: 'var(--tkx-secondary, #7b2ff7)',
  danger: 'var(--tkx-danger, #f72585)',
  warning: 'var(--tkx-warning, #ffbe0b)',
  success: 'var(--tkx-success, #06d6a0)',
  info: 'var(--tkx-info, #3a86ff)',
};
