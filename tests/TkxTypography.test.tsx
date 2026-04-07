import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxTitle, TkxText, TkxParagraph } from '../src/components/TkxTypography';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxTitle', () => {
  it('renders as h1 by default', () => {
    render(<TkxTitle>Main Heading</TkxTitle>, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Heading');
  });

  it('renders as specified heading level', () => {
    render(<TkxTitle level={3}>Sub Heading</TkxTitle>, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Sub Heading');
  });

  it('renders with different type styles', () => {
    render(<TkxTitle type="danger">Warning Title</TkxTitle>, { wrapper: Wrapper });
    expect(screen.getByText('Warning Title')).toBeInTheDocument();
  });
});

describe('TkxText', () => {
  it('renders inline text', () => {
    render(<TkxText>Inline content</TkxText>, { wrapper: Wrapper });
    expect(screen.getByText('Inline content')).toBeInTheDocument();
  });

  it('renders strong text', () => {
    render(<TkxText strong>Bold text</TkxText>, { wrapper: Wrapper });
    const el = screen.getByText('Bold text');
    expect(el.tagName.toLowerCase()).toBe('strong');
  });

  it('renders code text', () => {
    render(<TkxText code>const x = 1</TkxText>, { wrapper: Wrapper });
    const el = screen.getByText('const x = 1');
    expect(el.tagName.toLowerCase()).toBe('code');
  });
});

describe('TkxParagraph', () => {
  it('renders a paragraph element', () => {
    render(<TkxParagraph>Body text here</TkxParagraph>, { wrapper: Wrapper });
    expect(screen.getByText('Body text here')).toBeInTheDocument();
  });
});
