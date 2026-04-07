import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxDivider } from '../src/components/TkxDivider';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxDivider', () => {
  it('renders a separator', () => {
    render(<TkxDivider />, { wrapper: Wrapper });
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('has role="separator"', () => {
    render(<TkxDivider />, { wrapper: Wrapper });
    expect(screen.getByRole('separator')).toHaveAttribute('role', 'separator');
  });

  it('renders horizontal orientation by default', () => {
    render(<TkxDivider />, { wrapper: Wrapper });
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders vertical orientation', () => {
    render(<TkxDivider orientation="vertical" />, { wrapper: Wrapper });
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('renders label text when provided', () => {
    render(<TkxDivider label="OR" />, { wrapper: Wrapper });
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('renders with dashed variant', () => {
    render(<TkxDivider variant="dashed" />, { wrapper: Wrapper });
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
