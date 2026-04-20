import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxMarkdown } from '../src/components/TkxMarkdown';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxMarkdown', () => {
  it('renders headings', () => {
    const { container } = render(
      <TkxMarkdown source={'# Hello\n## World'} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('h1')?.textContent).toBe('Hello');
    expect(container.querySelector('h2')?.textContent).toBe('World');
  });

  it('renders paragraphs with bold/italic/strike/code', () => {
    const { container } = render(
      <TkxMarkdown source={'**bold** *italic* ~~strike~~ `code`'} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('em')?.textContent).toBe('italic');
    expect(container.querySelector('s')?.textContent).toBe('strike');
    expect(container.querySelector('code')?.textContent).toBe('code');
  });

  it('renders unordered + ordered lists', () => {
    const { container } = render(
      <TkxMarkdown source={'- a\n- b\n\n1. one\n2. two'} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelectorAll('ul li').length).toBe(2);
    expect(container.querySelectorAll('ol li').length).toBe(2);
  });

  it('renders task list items', () => {
    const { container } = render(
      <TkxMarkdown source={'- [x] done\n- [ ] todo'} />,
      { wrapper: Wrapper },
    );
    const boxes = container.querySelectorAll('input[type="checkbox"]');
    expect(boxes.length).toBe(2);
  });

  it('renders fenced code blocks', () => {
    const { container } = render(
      <TkxMarkdown source={'```ts\nconst x = 1;\n```'} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('pre code')?.textContent).toContain('const x = 1;');
  });

  it('renders blockquotes', () => {
    const { container } = render(
      <TkxMarkdown source={'> quoted'} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('blockquote')?.textContent?.trim()).toBe('quoted');
  });

  it('renders horizontal rules', () => {
    const { container } = render(
      <TkxMarkdown source={'foo\n\n---\n\nbar'} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('renders safe links with proper rel/target', () => {
    render(
      <TkxMarkdown source={'[TekiVex](https://tekivex.com)'} />,
      { wrapper: Wrapper },
    );
    const link = screen.getByRole('link', { name: 'TekiVex' }) as HTMLAnchorElement;
    expect(link.href).toContain('tekivex.com');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });

  it('blocks javascript: URLs (no link rendered)', () => {
    const { container } = render(
      <TkxMarkdown source={'[evil](javascript:void0)'} />,
      { wrapper: Wrapper },
    );
    // sanitizer returns null → falls back to plain span, no anchor element
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('evil');
  });

  it('renders images with alt text', () => {
    const { container } = render(
      <TkxMarkdown source={'![logo](https://example.com/logo.png)'} />,
      { wrapper: Wrapper },
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.alt).toBe('logo');
  });

  it('blocks javascript: in image src', () => {
    const { container } = render(
      <TkxMarkdown source={'![x](javascript:alert(1))'} />,
      { wrapper: Wrapper },
    );
    const img = container.querySelector('img') as HTMLImageElement | null;
    // sanitized href becomes '#' — image either unrendered or uses '#'
    if (img) expect(img.src).not.toContain('javascript');
  });

  it('renders GFM tables', () => {
    const src = '| a | b |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |';
    const { container } = render(<TkxMarkdown source={src} />, { wrapper: Wrapper });
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelectorAll('thead th').length).toBe(2);
    expect(container.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('renders empty source without crashing', () => {
    const { container } = render(<TkxMarkdown source="" />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('accepts custom maxWidth + className', () => {
    const { container } = render(
      <TkxMarkdown source="hi" maxWidth={600} className="my-md" />,
      { wrapper: Wrapper },
    );
    const root = container.querySelector('.my-md') as HTMLElement;
    expect(root).toBeInTheDocument();
  });

  it('renders autolinks', () => {
    render(
      <TkxMarkdown source="Visit <https://tekivex.com> for more." />,
      { wrapper: Wrapper },
    );
    const link = screen.getByRole('link', { name: 'https://tekivex.com' }) as HTMLAnchorElement;
    expect(link.href).toContain('tekivex.com');
  });
});
