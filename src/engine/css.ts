// ── TKX-CSS Engine ───────────────────────────────────────────────────────────
// Content-hashed class names, responsive helpers, keyframes, CSS variables, SSR

import { fnv1aHash } from './quantum';

// ── Internal style sheet registry ────────────────────────────────────────────

const styleSheet = new Map<string, string>();

function kebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function generateClassName(styles: string): string {
  return 'tkx-' + fnv1aHash(styles);
}

function register(styles: string): string {
  const className = generateClassName(styles);
  if (!styleSheet.has(className)) {
    styleSheet.set(className, styles);
  }
  return className;
}

// ── Template Literal CSS ─────────────────────────────────────────────────────

export interface ProcessedCSS {
  className: string;
  styles: string;
}

export function css(strings: TemplateStringsArray, ...values: unknown[]): ProcessedCSS {
  const styles = strings.reduce<string>((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? String(values[i]) : '');
  }, '');
  const className = register(styles.trim());
  return { className, styles: styles.trim() };
}

// ── From Style Object ────────────────────────────────────────────────────────

export function fromObject(styleObject: Record<string, unknown>): ProcessedCSS {
  const styles = Object.entries(styleObject)
    .map(([key, value]) => `${kebabCase(key)}: ${value};`)
    .join(' ');
  const className = register(styles);
  return { className, styles };
}

// ── Responsive Breakpoints ───────────────────────────────────────────────────

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const BREAKPOINTS: Record<Breakpoint, string> = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export function responsive(breakpoint: Breakpoint, styles: string): string {
  return `@media (min-width: ${BREAKPOINTS[breakpoint]}) { ${styles} }`;
}

// ── Keyframes ────────────────────────────────────────────────────────────────

export function keyframes(
  name: string,
  frames: Record<string, Record<string, unknown>>,
): string {
  const stops = Object.entries(frames)
    .map(([stop, styles]) => {
      const declarations = Object.entries(styles)
        .map(([k, v]) => `${kebabCase(k)}: ${v};`)
        .join(' ');
      return `${stop} { ${declarations} }`;
    })
    .join(' ');
  return `@keyframes ${name} { ${stops} }`;
}

// ── CSS Variables ────────────────────────────────────────────────────────────

export function cssVar(name: string, value?: string): string {
  if (value !== undefined) {
    return `--tkx-${name}: ${value};`;
  }
  return `var(--tkx-${name})`;
}

// ── SSR Extraction and Client Injection ──────────────────────────────────────

export function extractCSS(): string {
  return Array.from(styleSheet.entries())
    .map(([className, styles]) => `.${className} { ${styles} }`)
    .join('\n');
}

export function resetStyles(): void {
  styleSheet.clear();
}

export function injectStyles(): void {
  if (typeof document === 'undefined') return;
  let styleEl = document.getElementById('tkx-styles') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'tkx-styles';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = extractCSS();
}

export const TKX = {
  css,
  fromObject,
  responsive,
  keyframes,
  cssVar,
  extractCSS,
  injectStyles,
  resetStyles,
};
