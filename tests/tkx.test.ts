import { describe, it, expect, beforeEach } from 'vitest';
import { tkx, tx, cx, extractAtomicCSS, resetAtomicCSS } from '../src/engine/tkx';

beforeEach(() => resetAtomicCSS());

describe('tkx — utility resolution', () => {
  it('resolves display utilities', () => {
    expect(extractAtomicCSS()).toBe('');
    tkx('flex');
    expect(extractAtomicCSS()).toContain('display:flex');
  });

  it('resolves spacing utilities', () => {
    tkx('p-4');
    expect(extractAtomicCSS()).toContain('padding:16px');
  });

  it('resolves px and py independently', () => {
    tkx('px-4 py-2');
    const css = extractAtomicCSS();
    expect(css).toContain('padding-left:16px');
    expect(css).toContain('padding-right:16px');
    expect(css).toContain('padding-top:8px');
    expect(css).toContain('padding-bottom:8px');
  });

  it('TRUE conflict resolution — p-4 p-8 → padding:32px only', () => {
    tkx('p-4 p-8');
    const css = extractAtomicCSS();
    // The final merged class should have padding:32px (p-8 wins)
    expect(css).toContain('padding:32px');
    expect(css).not.toMatch(/padding:16px[^-]/); // p-4 should be overridden
  });

  it('resolves text color with theme token', () => {
    tkx('text-primary');
    expect(extractAtomicCSS()).toContain('color:var(--tkx-primary)');
  });

  it('resolves bg with theme token', () => {
    tkx('bg-surface');
    expect(extractAtomicCSS()).toContain('background-color:var(--tkx-surface)');
  });

  it('resolves border radius', () => {
    tkx('rounded-lg');
    expect(extractAtomicCSS()).toContain('border-radius:8px');
  });

  it('resolves font size + line height together', () => {
    tkx('text-sm');
    const css = extractAtomicCSS();
    expect(css).toContain('font-size:0.875rem');
    expect(css).toContain('line-height:1.25rem');
  });

  it('resolves sr-only utility', () => {
    tkx('sr-only');
    expect(extractAtomicCSS()).toContain('position:absolute');
    expect(extractAtomicCSS()).toContain('clip:rect(0,0,0,0)');
  });

  it('resolves arbitrary value [42px]', () => {
    tkx('w-[42px]');
    expect(extractAtomicCSS()).toContain('width:42px');
  });

  // Tailwind-style arbitrary CSS-property syntax is a known gap in the TKX
  // engine — the parser currently treats `[--my-var:red]` as an attribute
  // selector rather than emitting a custom-property declaration. Tracked
  // for v3.0 of the engine. Marked todo so the gate stays honest.
  it.todo('resolves arbitrary CSS property [--my-var:red]');
});

describe('tkx — variants', () => {
  it('generates hover pseudo-class variant', () => {
    tkx('hover:bg-surface');
    expect(extractAtomicCSS()).toContain(':hover');
    expect(extractAtomicCSS()).toContain('background-color:var(--tkx-surface)');
  });

  it('generates responsive @md variant', () => {
    tkx('@md:p-8');
    expect(extractAtomicCSS()).toContain('@media(min-width:768px)');
    expect(extractAtomicCSS()).toContain('padding:32px');
  });

  it('generates motion-safe variant', () => {
    tkx('motion-safe:transition-all');
    expect(extractAtomicCSS()).toContain('prefers-reduced-motion:no-preference');
  });

  it('generates motion-reduce variant', () => {
    tkx('motion-reduce:animate-none');
    expect(extractAtomicCSS()).toContain('prefers-reduced-motion:reduce');
  });

  it('generates focus-visible pseudo', () => {
    tkx('focus-visible:focus-ring');
    expect(extractAtomicCSS()).toContain(':focus-visible');
    expect(extractAtomicCSS()).toContain('var(--tkx-primary)');
  });
});

describe('tkx — composition', () => {
  it('accepts array input', () => {
    tkx(['flex', 'items-center']);
    const css = extractAtomicCSS();
    expect(css).toContain('display:flex');
    expect(css).toContain('align-items:center');
  });

  it('accepts object conditional input', () => {
    tkx({ 'opacity-50': true, 'opacity-100': false });
    const css = extractAtomicCSS();
    expect(css).toContain('opacity:0.5');
    expect(css).not.toContain('opacity:1');
  });

  it('filters falsy values', () => {
    tkx('flex', false, null, undefined, 'items-center');
    const css = extractAtomicCSS();
    expect(css).toContain('display:flex');
    expect(css).toContain('align-items:center');
  });

  it('returns same hash for same input (deterministic)', () => {
    const a = tkx('flex items-center p-4');
    resetAtomicCSS();
    const b = tkx('flex items-center p-4');
    expect(a).toBe(b);
  });

  it('tx is an alias for tkx', () => {
    const a = tkx('flex');
    resetAtomicCSS();
    const b = tx('flex');
    expect(a).toBe(b);
  });
});

describe('cx — className merge', () => {
  it('joins class strings', () => {
    expect(cx('foo', 'bar')).toBe('foo bar');
  });

  it('filters falsy values', () => {
    expect(cx('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('returns empty string for all falsy', () => {
    expect(cx(false, null, undefined)).toBe('');
  });
});
