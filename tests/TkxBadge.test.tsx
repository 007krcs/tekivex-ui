import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxBadge } from '../src/components/TkxBadge';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxBadge', () => {
  it('renders children text', () => {
    render(<TkxBadge>New</TkxBadge>, { wrapper: Wrapper });
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<TkxBadge variant="primary">Primary</TkxBadge>, { wrapper: Wrapper });
    expect(screen.getByText('Primary')).toBeInTheDocument();

    rerender(<ThemeProvider theme={quantumDark}><TkxBadge variant="danger">Danger</TkxBadge></ThemeProvider>);
    expect(screen.getByText('Danger')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { container } = render(<TkxBadge size="lg">Large</TkxBadge>, { wrapper: Wrapper });
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('renders as dot variant', () => {
    const { container } = render(<TkxBadge dot>Status</TkxBadge>, { wrapper: Wrapper });
    const dot = container.querySelector('span');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute('aria-label', 'Status');
  });

  it('renders outlined style', () => {
    render(<TkxBadge outlined>Outlined</TkxBadge>, { wrapper: Wrapper });
    const badge = screen.getByText('Outlined');
    expect(badge).toHaveStyle({ backgroundColor: 'transparent' });
  });

  it('applies pulse animation class', () => {
    const { container } = render(<TkxBadge pulse>Pulsing</TkxBadge>, { wrapper: Wrapper });
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
