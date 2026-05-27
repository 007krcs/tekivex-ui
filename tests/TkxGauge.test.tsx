import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxGauge } from '../src/components/TkxGauge';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// Many tests want the foreground arc rendered at the *final* value, not
// mid-animation. The useReducedMotion path in TkxGauge bypasses the rAF
// stepper, so by default we mock matchMedia to report reduced-motion = true.
function mockReducedMotion(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reduce : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('TkxGauge', () => {
  beforeEach(() => {
    mockReducedMotion(true);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with role="meter" and correct aria-value* attributes', () => {
    render(<TkxGauge value={42} min={0} max={100} />, { wrapper: Wrapper });
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '42');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps a value below min up to min', () => {
    render(<TkxGauge value={-50} min={0} max={100} />, { wrapper: Wrapper });
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps a value above max down to max', () => {
    render(<TkxGauge value={9999} min={0} max={100} />, { wrapper: Wrapper });
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });

  it('arc and speedometer variants render different sweep arcs', () => {
    const { container: arcC } = render(<TkxGauge value={100} variant="arc" />, {
      wrapper: Wrapper,
    });
    const { container: spdC } = render(
      <TkxGauge value={100} variant="speedometer" />,
      { wrapper: Wrapper },
    );
    const arcTrack = arcC.querySelector('[data-tkx-gauge-track]')!.getAttribute('d') || '';
    const spdTrack = spdC.querySelector('[data-tkx-gauge-track]')!.getAttribute('d') || '';
    expect(arcTrack).not.toBe(spdTrack);
    // 270° sweep is a large-arc; 180° is not → large-arc flag differs.
    // Path syntax: A rx,ry x-axis-rot large-arc-flag sweep-flag x,y
    // The two single-digit flags appear AFTER the x-axis-rotation "0".
    const parseFlags = (d: string) => {
      const m = d.match(/A[\d.,]+\s0\s(\d)\s(\d)\s/);
      return m ? { large: m[1], sweep: m[2] } : null;
    };
    expect(parseFlags(arcTrack)?.large).toBe('1');
    expect(parseFlags(spdTrack)?.large).toBe('0');
    // Variant marker on the wrapper as well.
    expect(arcC.querySelector('[data-tkx-gauge-variant="arc"]')).toBeTruthy();
    expect(spdC.querySelector('[data-tkx-gauge-variant="speedometer"]')).toBeTruthy();
  });

  it('thresholds split the foreground arc into multiple segment paths', () => {
    const { container } = render(
      <TkxGauge
        value={100}
        thresholds={[
          { at: 0, color: '#22c55e' },
          { at: 50, color: '#f59e0b' },
          { at: 80, color: '#ef4444' },
        ]}
      />,
      { wrapper: Wrapper },
    );
    const segments = container.querySelectorAll('[data-tkx-gauge-segment]');
    // 3 boundary thresholds inside (min,max] produce 3 segments.
    expect(segments.length).toBe(3);
  });

  it('calls formatValue when rendering the centre label', () => {
    const fmt = vi.fn((v: number) => `${v}%`);
    render(<TkxGauge value={75} formatValue={fmt} />, { wrapper: Wrapper });
    expect(fmt).toHaveBeenCalled();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders ticks when showTicks is true', () => {
    const { container } = render(
      <TkxGauge value={50} showTicks />,
      { wrapper: Wrapper },
    );
    const ticks = container.querySelectorAll('[data-tkx-gauge-tick]');
    // Total subdivisions = 10 major segments * 5 minor steps = 50, plus 1 closing tick.
    expect(ticks.length).toBe(51);
    const majors = container.querySelectorAll('[data-tkx-gauge-tick="major"]');
    expect(majors.length).toBe(11);
  });

  it('renders the label below the value when provided', () => {
    render(<TkxGauge value={50} label="CPU Load" />, { wrapper: Wrapper });
    expect(screen.getByText('CPU Load')).toBeInTheDocument();
  });

  it('aria-valuetext echoes the formatted value', () => {
    render(
      <TkxGauge value={3.14} formatValue={(v) => v.toFixed(2)} min={0} max={10} />,
      { wrapper: Wrapper },
    );
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuetext', '3.14');
  });

  it("colour reflects the threshold the current value falls into", () => {
    const { container } = render(
      <TkxGauge
        value={90}
        thresholds={[
          { at: 0, color: '#22c55e' },
          { at: 50, color: '#f59e0b' },
          { at: 80, color: '#ef4444' },
        ]}
      />,
      { wrapper: Wrapper },
    );
    const valueText = container.querySelector('[data-tkx-gauge-value]') as SVGTextElement | null;
    expect(valueText?.getAttribute('fill')?.toLowerCase()).toBe('#ef4444');
  });

  it('with reduced motion preference, marks reduced-motion=true on the wrapper', () => {
    mockReducedMotion(true);
    render(<TkxGauge value={50} />, { wrapper: Wrapper });
    expect(screen.getByRole('meter')).toHaveAttribute('data-tkx-reduced-motion', 'true');
  });
});
