import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxFunnelChart, type TkxFunnelStage } from '../src/components/TkxFunnelChart';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const STAGES: TkxFunnelStage[] = [
  { label: 'Visits', value: 1000 },
  { label: 'Signups', value: 600 },
  { label: 'Activated', value: 400 },
  { label: 'Paid', value: 120 },
];

describe('TkxFunnelChart', () => {
  it('renders an SVG with one shape per stage', () => {
    const { container } = render(<TkxFunnelChart data={STAGES} />, { wrapper: Wrapper });
    const shapes = container.querySelectorAll('[data-tkx-funnel-shape]');
    expect(shapes.length).toBe(STAGES.length);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('vertical vs horizontal orientation produce different path geometries', () => {
    const { container: vert } = render(
      <TkxFunnelChart data={STAGES} orientation="vertical" />,
      { wrapper: Wrapper },
    );
    const { container: horiz } = render(
      <TkxFunnelChart data={STAGES} orientation="horizontal" />,
      { wrapper: Wrapper },
    );
    const vertD = vert.querySelector('[data-tkx-funnel-shape]')!.getAttribute('d');
    const horizD = horiz.querySelector('[data-tkx-funnel-shape]')!.getAttribute('d');
    expect(vertD).not.toBe(horizD);
    expect(vert.querySelector('[data-tkx-funnel][data-orientation="vertical"]')).toBeTruthy();
    expect(horiz.querySelector('[data-tkx-funnel][data-orientation="horizontal"]')).toBeTruthy();
  });

  it('showPercentages renders one drop-off label between each adjacent pair of stages', () => {
    const { container } = render(
      <TkxFunnelChart data={STAGES} showPercentages />,
      { wrapper: Wrapper },
    );
    const pcts = container.querySelectorAll('[data-tkx-funnel-pct]');
    expect(pcts.length).toBe(STAGES.length - 1);
    // Visits→Signups: 1000→600 = 40% drop.
    expect(pcts[0].textContent).toBe('−40%');
  });

  it('showPercentages={false} hides the drop-off labels', () => {
    const { container } = render(
      <TkxFunnelChart data={STAGES} showPercentages={false} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelectorAll('[data-tkx-funnel-pct]').length).toBe(0);
  });

  it('showValues renders a value text per stage', () => {
    const { container } = render(
      <TkxFunnelChart data={STAGES} showValues />,
      { wrapper: Wrapper },
    );
    const values = container.querySelectorAll('[data-tkx-funnel-value]');
    expect(values.length).toBe(STAGES.length);
  });

  it('formatValue is applied to value labels', () => {
    const { container } = render(
      <TkxFunnelChart
        data={STAGES}
        showValues
        formatValue={(v) => `${(v / 1000).toFixed(1)}k`}
      />,
      { wrapper: Wrapper },
    );
    const values = Array.from(container.querySelectorAll('[data-tkx-funnel-value]'));
    expect(values[0].textContent).toBe('1.0k');
    expect(values[3].textContent).toBe('0.1k');
  });

  it('per-stage color overrides the cycle', () => {
    const stages: TkxFunnelStage[] = [
      { label: 'A', value: 100, color: '#ff00ff' },
      { label: 'B', value: 50, color: '#00ff00' },
    ];
    const { container } = render(<TkxFunnelChart data={stages} />, { wrapper: Wrapper });
    const shapes = Array.from(container.querySelectorAll('[data-tkx-funnel-shape]'));
    expect(shapes[0].getAttribute('fill')!.toLowerCase()).toBe('#ff00ff');
    expect(shapes[1].getAttribute('fill')!.toLowerCase()).toBe('#00ff00');
  });

  it('custom colors prop cycles when stages have no explicit color', () => {
    const { container } = render(
      <TkxFunnelChart data={STAGES} colors={['#aaaaaa', '#bbbbbb']} />,
      { wrapper: Wrapper },
    );
    const shapes = Array.from(container.querySelectorAll('[data-tkx-funnel-shape]'));
    expect(shapes[0].getAttribute('fill')!.toLowerCase()).toBe('#aaaaaa');
    expect(shapes[1].getAttribute('fill')!.toLowerCase()).toBe('#bbbbbb');
    // Cycle wraps:
    expect(shapes[2].getAttribute('fill')!.toLowerCase()).toBe('#aaaaaa');
  });

  it('onStageClick fires with the right stage + index', () => {
    const handler = vi.fn();
    const { container } = render(
      <TkxFunnelChart data={STAGES} onStageClick={handler} />,
      { wrapper: Wrapper },
    );
    const groups = container.querySelectorAll('[data-tkx-funnel-stage]');
    fireEvent.click(groups[2]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject({ label: 'Activated', value: 400 });
    expect(handler.mock.calls[0][1]).toBe(2);
  });

  it('empty data renders an empty SVG without crashing', () => {
    const { container } = render(<TkxFunnelChart data={[]} />, { wrapper: Wrapper });
    expect(container.querySelector('[data-tkx-funnel-empty]')).toBeTruthy();
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('[data-tkx-funnel-shape]').length).toBe(0);
  });

  it('single stage renders one shape with no drop-off labels', () => {
    const { container } = render(
      <TkxFunnelChart data={[{ label: 'Only', value: 42 }]} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelectorAll('[data-tkx-funnel-shape]').length).toBe(1);
    expect(container.querySelectorAll('[data-tkx-funnel-pct]').length).toBe(0);
  });

  it('ariaLabel defaults to a sensible description and a custom value wins when provided', () => {
    const { rerender } = render(<TkxFunnelChart data={STAGES} />, { wrapper: Wrapper });
    const auto = screen.getByRole('img').getAttribute('aria-label')!;
    expect(auto).toMatch(/4 stages/);
    expect(auto).toMatch(/drop-off/);

    rerender(<TkxFunnelChart data={STAGES} ariaLabel="Sales funnel Q3" />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Sales funnel Q3');
  });

  it('value text fill is pure black or pure white (WCAG-AAA auto contrast)', () => {
    const { container } = render(
      <TkxFunnelChart data={STAGES} showValues />,
      { wrapper: Wrapper },
    );
    const values = container.querySelectorAll('[data-tkx-funnel-value]');
    for (const v of Array.from(values)) {
      const fill = v.getAttribute('fill');
      expect(['#000000', '#ffffff']).toContain(fill);
    }
  });

  it('zero-value stage does not collapse to invisible width', () => {
    const stages: TkxFunnelStage[] = [
      { label: 'top', value: 100 },
      { label: 'zero', value: 0 },
    ];
    const { container } = render(<TkxFunnelChart data={stages} />, { wrapper: Wrapper });
    const shapes = container.querySelectorAll('[data-tkx-funnel-shape]');
    expect(shapes.length).toBe(2);
    // The second shape should still have a non-trivial path (clamped to MIN_FRAC).
    const d = shapes[1].getAttribute('d')!;
    expect(d.length).toBeGreaterThan(20);
  });
});
