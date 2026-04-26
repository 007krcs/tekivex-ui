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
});
