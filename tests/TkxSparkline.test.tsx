import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxSparkline } from '../src/components/TkxSparkline';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxSparkline', () => {
  it('renders an SVG with a polyline path containing one segment per gap', () => {
    const { container } = render(
      <TkxSparkline data={[1, 2, 3, 4, 5]} variant="line" />,
      { wrapper: Wrapper },
    );
    const path = container.querySelector('path[stroke]');
    expect(path).toBeTruthy();
    // 5 data points → 4 L commands after the initial M.
    const d = path!.getAttribute('d') || '';
    const lCount = (d.match(/L/g) || []).length;
    expect(lCount).toBe(4);
  });

  it('line, area, and bar variants emit distinct SVG primitives', () => {
    const { container: lineC } = render(
      <TkxSparkline data={[1, 2, 3]} variant="line" />,
      { wrapper: Wrapper },
    );
    const { container: areaC } = render(
      <TkxSparkline data={[1, 2, 3]} variant="area" />,
      { wrapper: Wrapper },
    );
    const { container: barC } = render(
      <TkxSparkline data={[1, 2, 3]} variant="bar" />,
      { wrapper: Wrapper },
    );

    // Line: no rects, no filled path with Z closure.
    expect(lineC.querySelectorAll('rect').length).toBe(0);
    expect(lineC.querySelectorAll('path').length).toBe(1);

    // Area: has a Z-closed filled path AND the stroke path.
    const areaPaths = areaC.querySelectorAll('path');
    expect(areaPaths.length).toBe(2);
    const hasClosure = Array.from(areaPaths).some((p) => /Z/.test(p.getAttribute('d') || ''));
    expect(hasClosure).toBe(true);

    // Bar: rects instead of paths.
    expect(barC.querySelectorAll('rect').length).toBe(3);
    expect(barC.querySelectorAll('path').length).toBe(0);
  });

  it('renders empty data without crashing and exposes an empty marker', () => {
    const { container } = render(<TkxSparkline data={[]} />, { wrapper: Wrapper });
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('[data-tkx-sparkline-empty]')).toBeTruthy();
    expect(container.querySelectorAll('path').length).toBe(0);
    expect(container.querySelectorAll('circle').length).toBe(0);
  });

  it('showPoints renders a circle at every datapoint', () => {
    const { container } = render(
      <TkxSparkline data={[1, 2, 3, 4]} showPoints />,
      { wrapper: Wrapper },
    );
    expect(container.querySelectorAll('[data-tkx-sparkline-point]').length).toBe(4);
  });

  it('showLastPoint highlights only the final point', () => {
    const { container } = render(
      <TkxSparkline data={[1, 2, 3, 4]} showLastPoint showPoints={false} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelectorAll('[data-tkx-sparkline-last]').length).toBe(1);
    expect(container.querySelectorAll('[data-tkx-sparkline-point]').length).toBe(0);
  });

  it('smooth changes the path command from L (linear) to C (cubic)', () => {
    const { container: linear } = render(
      <TkxSparkline data={[1, 5, 2, 6, 3]} smooth={false} />,
      { wrapper: Wrapper },
    );
    const { container: smooth } = render(
      <TkxSparkline data={[1, 5, 2, 6, 3]} smooth />,
      { wrapper: Wrapper },
    );
    const linD = linear.querySelector('path[stroke]')!.getAttribute('d') || '';
    const smD = smooth.querySelector('path[stroke]')!.getAttribute('d') || '';
    expect(/L/.test(linD)).toBe(true);
    expect(/C/.test(linD)).toBe(false);
    expect(/C/.test(smD)).toBe(true);
  });

  it('applies a custom aria-label when provided', () => {
    render(
      <TkxSparkline data={[1, 2, 3]} ariaLabel="Revenue last 3 days, climbing" />,
      { wrapper: Wrapper },
    );
    expect(
      screen.getByRole('img', { name: /revenue last 3 days, climbing/i }),
    ).toBeInTheDocument();
  });

  it('default aria-label describes count and trend direction', () => {
    render(<TkxSparkline data={[1, 2, 3, 5]} />, { wrapper: Wrapper });
    const el = screen.getByRole('img');
    const label = el.getAttribute('aria-label') || '';
    expect(label).toMatch(/4 values/);
    expect(label).toMatch(/trending up/);
  });

  it('renders a single-point dataset without throwing', () => {
    const { container } = render(<TkxSparkline data={[42]} />, { wrapper: Wrapper });
    // The stroke path still renders (it's just a degenerate M).
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('path')).toBeTruthy();
  });

  it('honours a custom color override', () => {
    const { container } = render(
      <TkxSparkline data={[1, 2, 3]} color="#ff00ff" />,
      { wrapper: Wrapper },
    );
    const path = container.querySelector('path[stroke]');
    expect(path?.getAttribute('stroke')?.toLowerCase()).toBe('#ff00ff');
  });

  it('renders the last value as text when showValue is set', () => {
    render(
      <TkxSparkline data={[10, 20, 73]} showValue />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('73')).toBeInTheDocument();
  });
});
