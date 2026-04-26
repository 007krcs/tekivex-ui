import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TkxFontProvider, scriptsForLanguage, loadFontScript, unloadFontScript } from '../src/components/TkxFontProvider';

describe('TkxFontProvider', () => {
  beforeEach(() => {
    // Clear any tkx-font-* links between tests
    document
      .querySelectorAll('link[id^="tkx-font-"]')
      .forEach((el) => el.remove());
  });

  it('injects a Latin font link by default', () => {
    render(<TkxFontProvider />);
    expect(document.getElementById('tkx-font-latin')).toBeInTheDocument();
  });

  it('injects only the requested scripts', () => {
    render(<TkxFontProvider scripts={['devanagari', 'tamil']} />);
    expect(document.getElementById('tkx-font-devanagari')).toBeInTheDocument();
    expect(document.getElementById('tkx-font-tamil')).toBeInTheDocument();
    expect(document.getElementById('tkx-font-jp')).not.toBeInTheDocument();
  });

  it('resolves Hindi → devanagari', () => {
    expect(scriptsForLanguage('hi')).toEqual(['devanagari']);
  });

  it('resolves zh-TW → tc, zh-CN → sc', () => {
    expect(scriptsForLanguage('zh-TW')).toEqual(['tc']);
    expect(scriptsForLanguage('zh-CN')).toEqual(['sc']);
  });

  it('falls back to latin for unknown languages', () => {
    expect(scriptsForLanguage('xx-YY')).toEqual(['latin']);
  });

  it('does not duplicate <link> tags on re-render', () => {
    const { rerender } = render(<TkxFontProvider scripts={['arabic']} />);
    rerender(<TkxFontProvider scripts={['arabic']} />);
    rerender(<TkxFontProvider scripts={['arabic']} />);
    const links = document.querySelectorAll('link[id="tkx-font-arabic"]');
    expect(links.length).toBe(1);
  });

  it('imperative load/unload works', () => {
    loadFontScript('hebrew');
    expect(document.getElementById('tkx-font-hebrew')).toBeInTheDocument();
    unloadFontScript('hebrew');
    expect(document.getElementById('tkx-font-hebrew')).not.toBeInTheDocument();
  });
});
