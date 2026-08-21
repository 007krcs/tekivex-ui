import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark, auroraLight, useTheme, toCSSVarTheme } from '../src/themes';
import { TkxCard } from '../src/components/TkxCard';

function Probe() {
  const t = useTheme();
  return (
    <>
      <div data-testid="painted">{t.css.surface}</div>
      <div data-testid="raw">{t.surface}</div>
    </>
  );
}

describe('theme paints from CSS custom properties', () => {
  it('exposes tokens as var() references with the palette hex as fallback', () => {
    render(
      <ThemeProvider theme={quantumDark}>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('painted').textContent).toBe(
      `var(--tkx-surface, ${quantumDark.surface})`,
    );
    // Backwards compatible: reading the token directly still yields the hex,
    // so consumer colour maths / canvas fillStyle keep working.
    expect(screen.getByTestId('raw').textContent).toBe(quantumDark.surface);
  });

  it('components paint via var(), so app CSS can override without !important', () => {
    const { container } = render(
      <ThemeProvider theme={quantumDark}>
        <TkxCard>content</TkxCard>
      </ThemeProvider>,
    );
    const card = container.querySelector('[class*="tkx-"]') as HTMLElement;
    // Inline styles reference the variable rather than baking in a hex value,
    // so redefining --tkx-* in a :hover/[data-active] rule cascades in.
    const inline = card.getAttribute('style') ?? '';
    expect(inline).toContain('var(--tkx-');
  });

  it('the provider still defines the variables so var() resolves', () => {
    const { container } = render(
      <ThemeProvider theme={auroraLight}>
        <span>x</span>
      </ThemeProvider>,
    );
    const wrapper = container.querySelector('div[style*="display"]') as HTMLElement;
    expect(wrapper.style.getPropertyValue('--tkx-surface')).toBe(auroraLight.surface);
  });

  it('toCSSVarTheme is a pure projection that preserves the palette', () => {
    const painted = toCSSVarTheme(auroraLight);
    expect(painted.css.primary).toBe(`var(--tkx-primary, ${auroraLight.primary})`);
    expect(painted.primary).toBe(auroraLight.primary);
    expect(painted.raw).toEqual(auroraLight);
    // Original palette object is untouched.
    expect(auroraLight.primary.startsWith('#')).toBe(true);
  });
});
