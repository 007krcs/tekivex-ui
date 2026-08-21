import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import {
  ThemeProvider,
  useTheme,
  quantumDark,
  auroraLight,
  themeInitScript,
} from '../src/themes';
import { createElement, type ReactNode } from 'react';

function ShowBg() {
  const t = useTheme();
  return <div data-testid="bg">{t.bg}</div>;
}

/**
 * Renders the tree exactly ONCE without flushing effects. Mirrors what
 * happens during React 18 hydration: the markup that has to match the
 * server-rendered HTML byte-for-byte is whatever React produces BEFORE
 * any useEffect runs.
 *
 * We simulate this by using `react-dom/server`'s `renderToString` against
 * the same component tree — it explicitly skips all effects.
 */
function renderSSR(node: ReactNode): string {
  return renderToString(createElement('div', null, node));
}

describe('ThemeProvider SSR / hydration safety', () => {
  let originalMatchMedia: typeof window.matchMedia;
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.getElementById('tkx-theme')?.remove();
    document.documentElement.removeAttribute('data-tkx-scheme');
    document.documentElement.removeAttribute('data-theme');
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

  // ── 1. Explicit modes always render their theme on first paint ───────

  it('mode="dark" emits dark tokens on the first render (no flash)', () => {
    // System claims light — explicit dark must win immediately.
    mockPrefersDark(false);
    const html = renderSSR(
      <ThemeProvider mode="dark">
        <ShowBg />
      </ThemeProvider>,
    );
    expect(html).toContain(quantumDark.bg);
    expect(html).not.toContain(auroraLight.bg);
  });

  it('mode="light" emits light tokens on the first render (no flash)', () => {
    mockPrefersDark(true);
    const html = renderSSR(
      <ThemeProvider mode="light">
        <ShowBg />
      </ThemeProvider>,
    );
    expect(html).toContain(auroraLight.bg);
    expect(html).not.toContain(quantumDark.bg);
  });

  // ── 2. mode="auto" must NOT read prefers-color-scheme synchronously ──

  it('mode="auto" first render uses the deterministic default — NOT prefers-color-scheme', () => {
    // System prefers dark. SSR + first client render must STILL be light
    // (the deterministic default) so server HTML == client first paint.
    mockPrefersDark(true);
    const html = renderSSR(
      <ThemeProvider mode="auto">
        <ShowBg />
      </ThemeProvider>,
    );
    expect(html).toContain(auroraLight.bg);
    expect(html).not.toContain(quantumDark.bg);
  });

  it('mode="auto" + defaultMode="dark" first render uses dark fallback', () => {
    mockPrefersDark(false); // system prefers light
    const html = renderSSR(
      <ThemeProvider mode="auto" defaultMode="dark">
        <ShowBg />
      </ThemeProvider>,
    );
    // SSR fallback must be the explicit defaultMode, not matchMedia.
    expect(html).toContain(quantumDark.bg);
  });

  // ── 3. After mount, mode="auto" resolves to the real preference ──────

  it('mode="auto" resolves to prefers-color-scheme after mount', () => {
    mockPrefersDark(true);
    render(
      <ThemeProvider mode="auto">
        <ShowBg />
      </ThemeProvider>,
    );
    // render() flushes effects → usePrefersDark's useEffect ran → dark.
    expect(screen.getByTestId('bg').textContent).toBe(quantumDark.bg);
  });

  it('mode="auto" resolves to light when system prefers light after mount', () => {
    mockPrefersDark(false);
    render(
      <ThemeProvider mode="auto">
        <ShowBg />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('bg').textContent).toBe(auroraLight.bg);
  });

  // ── 4. suppressHydrationWarning gates all theme styles pre-mount ─────

  it('suppressHydrationWarning emits no theme-specific CSS variables on first render', () => {
    mockPrefersDark(true);
    const html = renderSSR(
      <ThemeProvider mode="dark" suppressHydrationWarning>
        <ShowBg />
      </ThemeProvider>,
    );
    // Wrapper should NOT *define* any --tkx-* inline custom properties before
    // mount. Note the distinction: children legitimately *reference* the
    // variables (`var(--tkx-bg, #hex)`), which is theme-agnostic markup and
    // identical on server and client — what must not appear is a definition
    // (`--tkx-bg:#hex`) that would couple first paint to a resolved scheme.
    expect(html).not.toContain('--tkx-bg:');
    expect(html).not.toContain('--tkx-primary:');
    // The theme context still serves a value so children render — but the
    // PROVIDER wrapper itself emits no theme-coupled markup.
    expect(html).toContain('display:contents');
  });

  it('suppressHydrationWarning applies theme styles after mount', () => {
    mockPrefersDark(true);
    let container: HTMLElement;
    act(() => {
      const result = render(
        <ThemeProvider mode="dark" suppressHydrationWarning>
          <ShowBg />
        </ThemeProvider>,
      );
      container = result.container;
    });
    // After effects flush, the wrapper carries the inline vars again.
    const wrapper = container!.querySelector('div[style]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.getPropertyValue('--tkx-bg')).toBe(quantumDark.bg);
  });

  // ── 5. themeInitScript shape & options ───────────────────────────────

  it('themeInitScript() returns a self-contained IIFE that queries prefers-color-scheme', () => {
    const script = themeInitScript();
    // IIFE shape — starts and ends with the standard pattern.
    expect(script.startsWith('(function(){')).toBe(true);
    expect(script.trim().endsWith('})();')).toBe(true);
    // Reads the media query.
    expect(script).toContain('prefers-color-scheme: dark');
    // Default storage key embedded.
    expect(script).toContain('"tkx-theme"');
    // Sets the documentElement dataset so CSS can react before hydration.
    expect(script).toContain('dataset.theme');
    expect(script).toContain('data-tkx-scheme');
  });

  it('themeInitScript({ storageKey }) embeds the custom storage key', () => {
    const script = themeInitScript({ storageKey: 'my-app-theme' });
    expect(script).toContain('"my-app-theme"');
    expect(script).not.toContain('"tkx-theme"');
  });

  it('themeInitScript({ defaultMode: "dark" }) embeds the custom default', () => {
    const script = themeInitScript({ defaultMode: 'dark' });
    expect(script).toContain('"dark"');
  });

  it('themeInitScript safely JSON-encodes hostile storage keys (no script injection)', () => {
    const script = themeInitScript({ storageKey: '"; alert(1); //' });
    // The hostile string must appear as a JSON string literal, not bare code.
    expect(script).toContain('"\\"; alert(1); //"');
    // And the script must still be a syntactically valid JS expression —
    // if injection broke quoting we'd get a SyntaxError at parse time.
    expect(() => new Function(script)).not.toThrow();
  });
});
