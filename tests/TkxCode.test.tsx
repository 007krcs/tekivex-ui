import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxCode } from '../src/components/TkxCode';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TkxCode', () => {
  it('survives a bare mount (no props at all)', () => {
    expect(() => render(<TkxCode />, { wrapper: W })).not.toThrow();
  });

  it('renders the code text content', () => {
    const { container } = render(
      <TkxCode code="hello world" language="text" />,
      { wrapper: W },
    );
    expect(container.querySelector('pre code')?.textContent).toContain('hello world');
  });

  it("language='ts' produces keyword token spans", () => {
    render(<TkxCode code="const x = 1;" language="ts" />, { wrapper: W });
    const kw = screen.getByText('const');
    expect(kw.tagName).toBe('SPAN');
    expect(kw.getAttribute('data-token')).toBe('keyword');
    expect(kw.style.color).toBeTruthy();
  });

  it('a keyword inside a string stays string-coloured (comment > string > rest)', () => {
    const { container } = render(
      <TkxCode code={`const s = "const is a keyword";`} language="ts" />,
      { wrapper: W },
    );
    // The whole literal — including the inner 'const' — is one string token.
    const str = screen.getByText('"const is a keyword"');
    expect(str.getAttribute('data-token')).toBe('string');
    // Exactly one keyword token: the real `const`, not the one in the string.
    const keywords = container.querySelectorAll('[data-token="keyword"]');
    expect(keywords.length).toBe(1);
    expect(keywords[0].textContent).toBe('const');
  });

  it('tokenizes comments (muted + italic)', () => {
    render(<TkxCode code="// a comment" language="ts" />, { wrapper: W });
    const c = screen.getByText('// a comment');
    expect(c.getAttribute('data-token')).toBe('comment');
    expect(c.style.fontStyle).toBe('italic');
  });

  it('carries multi-line block comments across lines', () => {
    const { container } = render(
      <TkxCode code={'/* first\nconst second */\nconst x = 1;'} language="ts" />,
      { wrapper: W },
    );
    // 'const' on line 2 is inside the block comment → not a keyword token.
    const keywords = container.querySelectorAll('[data-token="keyword"]');
    expect(keywords.length).toBe(1);
    expect(container.querySelectorAll('[data-token="comment"]').length).toBe(2);
  });

  it('showLineNumbers renders an aria-hidden gutter', () => {
    const { container } = render(
      <TkxCode code={'a\nb\nc'} language="text" showLineNumbers />,
      { wrapper: W },
    );
    const gutters = Array.from(
      container.querySelectorAll('code [aria-hidden="true"]'),
    ).map((el) => el.textContent);
    expect(gutters).toEqual(['1', '2', '3']);
  });

  it('does not render line numbers by default', () => {
    render(<TkxCode code={'a\nb'} language="text" />, { wrapper: W });
    expect(screen.queryByText('1')).toBeNull();
  });

  it('highlightLines marks the requested rows', () => {
    const { container } = render(
      <TkxCode code={'one\ntwo\nthree'} language="text" highlightLines={[2]} />,
      { wrapper: W },
    );
    const marked = container.querySelectorAll('[data-highlighted]');
    expect(marked.length).toBe(1);
    expect(marked[0].getAttribute('data-line')).toBe('2');
    expect(marked[0].textContent).toContain('two');
  });

  it('shows a copy button by default and hides it when copyable={false}', () => {
    const { unmount } = render(<TkxCode code="x" />, { wrapper: W });
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
    unmount();
    render(<TkxCode code="x" copyable={false} />, { wrapper: W });
    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
  });

  it('clicking copy writes the code to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(<TkxCode code="const x = 1;" language="ts" />, { wrapper: W });
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(writeText).toHaveBeenCalledWith('const x = 1;');
    expect(await screen.findByText('Copied')).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it('does not throw when the clipboard API is missing', () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    render(<TkxCode code="x" />, { wrapper: W });
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Copy code' })),
    ).not.toThrow();
    vi.unstubAllGlobals();
  });

  it('renders a filename header bar', () => {
    render(<TkxCode code="x" filename="src/app.ts" />, { wrapper: W });
    expect(screen.getByText('src/app.ts')).toBeTruthy();
    // The copy button lives in the header alongside the filename.
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
  });

  it("language='text' renders plain content with no token spans", () => {
    const { container } = render(
      <TkxCode code="const x = 'if';" language="text" />,
      { wrapper: W },
    );
    expect(container.querySelectorAll('[data-token]').length).toBe(0);
    expect(container.querySelector('pre code')?.textContent).toContain("const x = 'if';");
  });

  it('forwards a ref to the root element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<TkxCode code="x" ref={ref} />, { wrapper: W });
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('sets an accessible label on the code element', () => {
    const { container, unmount } = render(
      <TkxCode code="x" language="python" />,
      { wrapper: W },
    );
    expect(container.querySelector('code')?.getAttribute('aria-label')).toBe(
      'python code snippet',
    );
    unmount();
    const { container: c2 } = render(
      <TkxCode code="x" filename="main.py" />,
      { wrapper: W },
    );
    expect(c2.querySelector('code')?.getAttribute('aria-label')).toBe('Code: main.py');
  });
});
