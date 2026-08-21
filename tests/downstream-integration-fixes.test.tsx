import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxSelect } from '../src/components/TkxSelect';
import { TkxCardHeader } from '../src/components/TkxCard';
import { tkx, extractAtomicCSS, resetAtomicCSS } from '../src/engine/tkx';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('downstream integration fixes', () => {
  // ── TkxSelect: empty string means "unset", not "selected" ──────────────────
  describe('TkxSelect empty-string value', () => {
    it("shows the placeholder for value='' instead of rendering blank", () => {
      render(
        <TkxSelect value="" options={OPTIONS} placeholder="Pick one" onChange={() => {}} />,
        { wrapper: W },
      );
      expect(screen.getByText('Pick one')).toBeInTheDocument();
    });

    it('falls back to the placeholder when the value matches no option', () => {
      render(
        <TkxSelect value="ghost" options={OPTIONS} placeholder="Pick one" onChange={() => {}} />,
        { wrapper: W },
      );
      expect(screen.getByText('Pick one')).toBeInTheDocument();
    });

    it('still renders a real selection normally', () => {
      render(
        <TkxSelect value="b" options={OPTIONS} placeholder="Pick one" onChange={() => {}} />,
        { wrapper: W },
      );
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.queryByText('Pick one')).toBeNull();
    });
  });

  // ── TkxCardHeader: no heading-in-heading ──────────────────────────────────
  describe('TkxCardHeader titleAs', () => {
    it('defaults to an h3', () => {
      const { container } = render(<TkxCardHeader title="Plain" />, { wrapper: W });
      expect(container.querySelector('h3')?.textContent).toBe('Plain');
    });

    it('titleAs="div" avoids nesting a caller-supplied heading inside h3', () => {
      const { container } = render(
        <TkxCardHeader titleAs="div" title={<h2>Own heading</h2>} />,
        { wrapper: W },
      );
      expect(container.querySelector('h3')).toBeNull();
      const h2 = container.querySelector('h2');
      expect(h2?.textContent).toBe('Own heading');
      // The h2 must not be inside any other heading.
      expect(h2?.closest('h1,h3,h4,h5,h6')).toBeNull();
    });

    it('honours an explicit heading level', () => {
      const { container } = render(<TkxCardHeader titleAs="h2" title="Level two" />, {
        wrapper: W,
      });
      expect(container.querySelector('h2')?.textContent).toBe('Level two');
      expect(container.querySelector('h3')).toBeNull();
    });
  });

  // ── tkx engine: display must not outrank app CSS ──────────────────────────
  describe('tkx display precedence', () => {
    beforeEach(() => resetAtomicCSS());
    it('emits display inside :where() so app selectors win without !important', () => {
      const cls = tkx('flex items-center gap-2');
      const css = extractAtomicCSS();
      // The display declaration is zero-specificity...
      expect(css).toContain(`:where(.${cls}){display:flex}`);
      // ...while the rest keeps normal class weight.
      expect(css).toMatch(new RegExp(`\.${cls}\{[^}]*align-items:center`));
      // and display never appears in the plain-class rule.
      const plainRule = css.match(new RegExp(`\.${cls}\{([^}]*)\}`))?.[1] ?? '';
      expect(plainRule).not.toContain('display:');
    });

    it('classes with no display are unaffected', () => {
      const cls = tkx('p-4 rounded');
      const css = extractAtomicCSS();
      expect(css).not.toContain(`:where(.${cls})`);
      expect(css).toContain(`.${cls}{`);
    });
  });
});
