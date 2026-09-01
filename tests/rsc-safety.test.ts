import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { quantumDark } from '../src/themes';
import { cssTokens } from '../src/themes/cssTokens';

const COMPONENT_DIR = join(process.cwd(), 'src/components');

/**
 * Components documented as React Server Component safe. Adding a name here
 * without actually making the component context-free will fail the checks
 * below — which is the point: docs/rsc.mdx previously advertised 16 components
 * as RSC-compatible while every one of them shipped 'use client'.
 */
const RSC_SAFE = ['TkxBadge', 'TkxDivider', 'TkxEmpty', 'TkxIcon', 'TkxSparkline'];

function source(name: string): string {
  return readFileSync(join(COMPONENT_DIR, `${name}.tsx`), 'utf8');
}

describe('React Server Component safety', () => {
  it('cssTokens fallbacks stay in sync with quantumDark', () => {
    // cssTokens duplicates the palette literally so it can avoid importing the
    // provider module (which calls createContext). This guards the duplication.
    for (const [token, hex] of Object.entries(quantumDark)) {
      expect(cssTokens[token as keyof typeof cssTokens]).toBe(`var(--tkx-${token}, ${hex})`);
    }
  });

  it('cssTokens module imports nothing that touches React', () => {
    const src = readFileSync(join(process.cwd(), 'src/themes/cssTokens.ts'), 'utf8');
    const valueImports = [...src.matchAll(/^import (?!type )[^;]+from '([^']+)'/gm)].map((m) => m[1]);
    expect(valueImports).toEqual([]);
  });

  describe.each(RSC_SAFE)('%s', (name) => {
    it('carries no "use client" directive', () => {
      expect(source(name)).not.toContain("'use client'");
    });

    it('calls no React hook', () => {
      const hooks = [...source(name).matchAll(/\buse[A-Z][a-zA-Z]*\(/g)].map((m) => m[0]);
      expect(hooks).toEqual([]);
    });

    it('does not import the theme context', () => {
      expect(source(name)).not.toMatch(/import \{[^}]*\buseTheme\b/);
    });
  });

  it('every other component still declares "use client"', () => {
    // A component that drops the directive without being verified RSC-safe
    // would break Next.js App Router consumers at runtime.
    const missing = readdirSync(COMPONENT_DIR)
      .filter((f) => f.startsWith('Tkx') && f.endsWith('.tsx'))
      .map((f) => f.replace('.tsx', ''))
      .filter((n) => !RSC_SAFE.includes(n))
      .filter((n) => !source(n).includes("'use client'"));
    expect(missing).toEqual([]);
  });
});
