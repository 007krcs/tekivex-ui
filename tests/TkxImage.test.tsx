import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxImage } from '../src/components/TkxImage';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxImage', () => {
  it('renders an img element with src', () => {
    render(<TkxImage src="https://example.com/photo.jpg" alt="Photo" />, { wrapper: Wrapper });
    const img = screen.getByRole('img', { name: 'Photo' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders alt text', () => {
    render(<TkxImage src="https://example.com/photo.jpg" alt="Landscape" />, { wrapper: Wrapper });
    expect(screen.getByAltText('Landscape')).toBeInTheDocument();
  });

  it('applies lazy loading by default', () => {
    render(<TkxImage src="https://example.com/photo.jpg" alt="Lazy" />, { wrapper: Wrapper });
    const img = screen.getByRole('img', { name: 'Lazy' });
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('disables lazy loading when lazy is false', () => {
    render(<TkxImage src="https://example.com/photo.jpg" alt="Eager" lazy={false} />, { wrapper: Wrapper });
    const img = screen.getByRole('img', { name: 'Eager' });
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });

  it('renders caption when provided', () => {
    render(<TkxImage src="https://example.com/photo.jpg" alt="Photo" caption="A scenic view" />, { wrapper: Wrapper });
    expect(screen.getByText('A scenic view')).toBeInTheDocument();
  });
});
