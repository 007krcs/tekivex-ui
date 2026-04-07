import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxSkeleton } from '../src/components/TkxSkeleton';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxSkeleton', () => {
  it('renders a skeleton element', () => {
    render(<TkxSkeleton />, { wrapper: Wrapper });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has aria-busy="true"', () => {
    render(<TkxSkeleton />, { wrapper: Wrapper });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-busy', 'true');
  });

  it('has aria-label for accessibility', () => {
    render(<TkxSkeleton />, { wrapper: Wrapper });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Loading...');
  });

  it('renders rectangular variant by default', () => {
    const { container } = render(<TkxSkeleton />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders circular variant', () => {
    const { container } = render(<TkxSkeleton variant="circular" width={40} />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders multiple text lines', () => {
    render(<TkxSkeleton variant="text" lines={3} />, { wrapper: Wrapper });
    const skeleton = screen.getByRole('progressbar');
    expect(skeleton.children).toHaveLength(3);
  });

  it('accepts custom width and height', () => {
    const { container } = render(<TkxSkeleton width={200} height={100} />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });
});
