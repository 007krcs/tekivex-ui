import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxWatermark } from '../src/components/TkxWatermark';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxWatermark', () => {
  it('renders children', () => {
    render(
      <TkxWatermark text="confidential">
        <p>Inner content</p>
      </TkxWatermark>,
      { wrapper: W },
    );
    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it('renders a watermark overlay div', () => {
    const { container } = render(
      <TkxWatermark text="confidential">
        <p>x</p>
      </TkxWatermark>,
      { wrapper: W },
    );
    const overlay = container.querySelector('[data-watermark]');
    expect(overlay).toBeTruthy();
    expect(overlay?.getAttribute('aria-hidden')).toBe('true');
  });

  it('accepts array of text lines', () => {
    render(
      <TkxWatermark text={['LINE 1', 'LINE 2']}>
        <p>x</p>
      </TkxWatermark>,
      { wrapper: W },
    );
    // Just verifies no crash with multi-line input.
    expect(screen.getByText('x')).toBeInTheDocument();
  });

  it('supports pattern="single"', () => {
    const { container } = render(
      <TkxWatermark text="watermark" pattern="single">
        <p>x</p>
      </TkxWatermark>,
      { wrapper: W },
    );
    const overlay = container.querySelector('[data-watermark]') as HTMLElement;
    expect(overlay.style.backgroundRepeat).toBe('no-repeat');
  });

  it('supports pattern="fingerprint"', () => {
    render(
      <TkxWatermark text="leaked" pattern="fingerprint">
        <p>x</p>
      </TkxWatermark>,
      { wrapper: W },
    );
    expect(screen.getByText('x')).toBeInTheDocument();
  });

  it('accepts custom rotate angle', () => {
    render(
      <TkxWatermark text="t" rotate={-45}>
        <p>x</p>
      </TkxWatermark>,
      { wrapper: W },
    );
    expect(screen.getByText('x')).toBeInTheDocument();
  });

  it('accepts custom color', () => {
    render(
      <TkxWatermark text="t" color="rgba(255,0,0,0.1)">
        <p>x</p>
      </TkxWatermark>,
      { wrapper: W },
    );
    expect(screen.getByText('x')).toBeInTheDocument();
  });
});
