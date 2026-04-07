import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxRating } from '../src/components/TkxRating';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxRating', () => {
  it('renders 5 star items by default', () => {
    render(<TkxRating />, { wrapper: Wrapper });
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('renders custom number of stars', () => {
    render(<TkxRating max={10} />, { wrapper: Wrapper });
    expect(screen.getAllByRole('radio')).toHaveLength(10);
  });

  it('renders radiogroup role', () => {
    render(<TkxRating />, { wrapper: Wrapper });
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('has aria-label on the group', () => {
    render(<TkxRating label="Product rating" />, { wrapper: Wrapper });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Product rating');
  });

  it('renders as readonly', () => {
    render(<TkxRating value={3} isReadOnly />, { wrapper: Wrapper });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true');
  });

  it('renders as disabled', () => {
    render(<TkxRating isDisabled />, { wrapper: Wrapper });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows value text when showValue is true', () => {
    render(<TkxRating value={4} showValue />, { wrapper: Wrapper });
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
  });
});
