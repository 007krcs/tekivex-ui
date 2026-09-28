import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme, quantumDark, auroraLight, usePrefersColorScheme } from '../src/themes';

function ShowText() {
  const t = useTheme();
  return <div data-testid="bg">{t.bg}</div>;
}

function ShowScheme() {
  const s = usePrefersColorScheme();
  return <div data-testid="scheme">{s}</div>;
}

describe('ThemeProvider v2.7 — auto / explicit modes', () => {
  let originalMatchMedia: typeof window.matchMedia;
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.getElementById('tkx-theme')?.remove();
    document.documentElement.removeAttribute('data-tkx-scheme');
  });

  function mockPrefersDark(isDark: boolean) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark') ? isDark : !isDark,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })) as any;
  }

  it('honours explicit theme prop (backward compat)', () => {
    render(
      <ThemeProvider theme={auroraLight}>
        <ShowText />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('bg').textContent).toBe(auroraLight.bg);
  });

  it('mode="dark" pins to dark theme regardless of system', () => {
    mockPrefersDark(false);
    render(
      <ThemeProvider mode="dark">
        <ShowText />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('bg').textContent).toBe(quantumDark.bg);
  });

  it('mode="light" pins to light theme regardless of system', () => {
    mockPrefersDark(true);
    render(
      <ThemeProvider mode="light">
        <ShowText />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('bg').textContent).toBe(auroraLight.bg);
  });

  it('mode="auto" follows prefers-color-scheme: dark', () => {
    mockPrefersDark(true);
    render(
      <ThemeProvider mode="auto">
        <ShowText />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('bg').textContent).toBe(quantumDark.bg);
  });

  it('mode="auto" follows prefers-color-scheme: light', () => {
    mockPrefersDark(false);
    render(
      <ThemeProvider mode="auto">
        <ShowText />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('bg').textContent).toBe(auroraLight.bg);
  });

  it('usePrefersColorScheme reflects system', () => {
    mockPrefersDark(true);
    render(<ShowScheme />);
    expect(screen.getByTestId('scheme').textContent).toBe('dark');
  });

  describe('document-level theming', () => {
    afterEach(() => {
      document.documentElement.style.colorScheme = '';
    });

    it('sets color-scheme on <html> and :root for mode="dark"', () => {
      render(<ThemeProvider mode="dark"><ShowText /></ThemeProvider>);
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-tkx-scheme')).toBe('dark');
      const css = document.getElementById('tkx-theme')!.textContent!;
      expect(css).toContain('color-scheme: dark');
      expect(css).toContain(`--tkx-bg: ${quantumDark.bg}`);
      expect(css).not.toContain('body {');
    });

    it('sets color-scheme: light for mode="light"', () => {
      render(<ThemeProvider mode="light"><ShowText /></ThemeProvider>);
      expect(document.documentElement.style.colorScheme).toBe('light');
      expect(document.getElementById('tkx-theme')!.textContent).toContain('color-scheme: light');
    });

    it('classifies a custom palette by background luminance', () => {
      render(<ThemeProvider theme={{ ...quantumDark, bg: '#101010' }}><ShowText /></ThemeProvider>);
      expect(document.documentElement.getAttribute('data-tkx-scheme')).toBe('custom');
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('applyToDocument themes <body> from the page tokens', () => {
      render(<ThemeProvider mode="dark" applyToDocument><ShowText /></ThemeProvider>);
      const css = document.getElementById('tkx-theme')!.textContent!;
      expect(css).toContain('body { background-color: var(--tkx-bg); color: var(--tkx-text); }');
    });
  });
});
