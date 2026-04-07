import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxProgress } from '../src/components/TkxProgress';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxProgress', () => {
  it('renders a progressbar', () => {
    render(<TkxProgress value={50} />, { wrapper: Wrapper });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow to the value', () => {
    render(<TkxProgress value={75} />, { wrapper: Wrapper });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('sets aria-valuemin and aria-valuemax', () => {
    render(<TkxProgress value={30} />, { wrapper: Wrapper });
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value to 0-100 range', () => {
    render(<TkxProgress value={150} />, { wrapper: Wrapper });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders label text', () => {
    render(<TkxProgress value={50} label="Uploading" />, { wrapper: Wrapper });
    expect(screen.getByText('Uploading')).toBeInTheDocument();
  });

  it('renders circular variant', () => {
    render(<TkxProgress value={60} variant="circular" />, { wrapper: Wrapper });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders indeterminate state when no value', () => {
    render(<TkxProgress />, { wrapper: Wrapper });
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });
});
