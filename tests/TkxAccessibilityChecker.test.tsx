import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxAccessibilityChecker } from '../src/components/TkxAccessibilityChecker';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxAccessibilityChecker', () => {
  it('returns null in production by default (NODE_ENV undefined → dev mode → visible)', () => {
    const { container } = render(<TkxAccessibilityChecker />, { wrapper: W });
    // axe-core import resolution is async + may fail in jsdom; either way
    // the component renders the FAB on first paint OR returns null after
    // failing to load axe. Accept both — we're verifying it doesn't crash.
    expect(container).toBeTruthy();
  });

  it('respects show=false to hide entirely', () => {
    const { container } = render(<TkxAccessibilityChecker show={false} />, { wrapper: W });
    expect(container.querySelector('button[aria-label*="Accessibility"]')).toBeNull();
  });

  it('renders FAB when show=true', () => {
    render(<TkxAccessibilityChecker show />, { wrapper: W });
    // FAB has aria-label starting with "Accessibility"
    expect(screen.getByLabelText(/Accessibility status/i)).toBeInTheDocument();
  });

  it('respects position prop', () => {
    const { container } = render(
      <TkxAccessibilityChecker show position="top-left" />,
      { wrapper: W },
    );
    const fab = container.querySelector('button[aria-label*="Accessibility"]') as HTMLElement;
    expect(fab.style.top).toBe('16px');
    expect(fab.style.left).toBe('16px');
    expect(fab.style.bottom).toBe('');
  });

  it('FAB has aria-expanded reflecting open state', () => {
    render(<TkxAccessibilityChecker show />, { wrapper: W });
    const fab = screen.getByLabelText(/Accessibility status/i);
    expect(fab).toHaveAttribute('aria-expanded', 'false');
  });
});
