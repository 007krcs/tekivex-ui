import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxHeatmap, type TkxHeatmapCell } from '../src/components/TkxHeatmap';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// ── Tiny luminance helper (mirrors the wcag.ts maths) for test assertions on
// "is this fill darker than that one?" without leaking implementation details.
function lum(hex: string): number {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const [r, g, b] = [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const SIMPLE: TkxHeatmapCell[] = [
  { x: 'A', y: '1', value: 1 },
  { x: 'B', y: '1', value: 5 },
  { x: 'A', y: '2', value: 9 },
  { x: 'B', y: '2', value: 3 },
];

describe('TkxHeatmap', () => {
  it('renders an SVG with one rect per (x, y) pair', () => {
    const { container } = render(<TkxHeatmap data={SIMPLE} />, { wrapper: Wrapper });
    const cells = container.querySelectorAll('[data-tkx-heatmap-cell]');
    expect(cells.length).toBe(4); // 2 x's × 2 y's
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('derives x/y labels from data when not provided (sorted unique)', () => {
    const data: TkxHeatmapCell[] = [
      { x: 'C', y: 'beta', value: 1 },
      { x: 'A', y: 'alpha', value: 2 },
      { x: 'B', y: 'beta', value: 3 },
      // duplicates should collapse
      { x: 'A', y: 'alpha', value: 4 },
    ];
    const { container } = render(<TkxHeatmap data={data} />, { wrapper: Wrapper });
    const xLabels = Array.from(container.querySelectorAll('[data-tkx-heatmap-xlabel]')).map(
      (n) => n.textContent,
    );
    const yLabels = Array.from(container.querySelectorAll('[data-tkx-heatmap-ylabel]')).map(
      (n) => n.textContent,
    );
    expect(xLabels).toEqual(['A', 'B', 'C']);
    expect(yLabels).toEqual(['alpha', 'beta']);
  });

  it('respects explicit xLabels / yLabels (labels with no data render as empty cells)', () => {
    const data: TkxHeatmapCell[] = [{ x: 'A', y: '1', value: 5 }];
    const { container } = render(
      <TkxHeatmap data={data} xLabels={['A', 'B']} yLabels={['1', '2']} />,
      { wrapper: Wrapper },
    );
    const cells = container.querySelectorAll('[data-tkx-heatmap-cell]');
    expect(cells.length).toBe(4); // 2×2 grid
    const empty = container.querySelectorAll('[data-tkx-heatmap-cell][data-empty]');
    expect(empty.length).toBe(3); // only (A,1) has data
  });

  it('sequential color scale: higher values get a darker fill', () => {
    const { container } = render(
      <TkxHeatmap data={SIMPLE} colorScale="sequential" />,
      { wrapper: Wrapper },
    );
    const cells = Array.from(container.querySelectorAll('[data-tkx-heatmap-cell]'));
    const cellByXY = (x: string, y: string) =>
      cells.find((c) => c.getAttribute('data-x') === x && c.getAttribute('data-y') === y)!;
    const lowFill = cellByXY('A', '1').querySelector('rect')!.getAttribute('fill')!;
    const highFill = cellByXY('A', '2').querySelector('rect')!.getAttribute('fill')!;
    // value 1 → light, value 9 → dark, so luminance(low) > luminance(high).
    expect(lum(lowFill)).toBeGreaterThan(lum(highFill));
  });

  it('diverging color scale: midpoint domain value lands near the mid (white) stop', () => {
    const data: TkxHeatmapCell[] = [
      { x: 'a', y: 'r', value: -1 },
      { x: 'b', y: 'r', value: 0 },
      { x: 'c', y: 'r', value: 1 },
    ];
    const { container } = render(
      <TkxHeatmap data={data} colorScale="diverging" domain={[-1, 1]} />,
      { wrapper: Wrapper },
    );
    const cells = Array.from(container.querySelectorAll('[data-tkx-heatmap-cell]'));
    const mid = cells.find((c) => c.getAttribute('data-x') === 'b')!;
    const midFill = mid.querySelector('rect')!.getAttribute('fill')!.toLowerCase();
    // The mid stop of the built-in diverging scale is #ffffff.
    expect(midFill).toBe('#ffffff');
  });

  it('custom string[] colorScale interpolates between the supplied stops', () => {
    const data: TkxHeatmapCell[] = [
      { x: 'a', y: 'r', value: 0 },
      { x: 'b', y: 'r', value: 100 },
    ];
    const { container } = render(
      <TkxHeatmap data={data} colorScale={['#000000', '#ffffff']} domain={[0, 100]} />,
      { wrapper: Wrapper },
    );
    const cells = Array.from(container.querySelectorAll('[data-tkx-heatmap-cell]'));
    const lo = cells.find((c) => c.getAttribute('data-x') === 'a')!;
    const hi = cells.find((c) => c.getAttribute('data-x') === 'b')!;
    expect(lo.querySelector('rect')!.getAttribute('fill')!.toLowerCase()).toBe('#000000');
    expect(hi.querySelector('rect')!.getAttribute('fill')!.toLowerCase()).toBe('#ffffff');
  });

  it('showValues renders a <text> per cell with a contrast-appropriate color', () => {
    const { container } = render(
      <TkxHeatmap data={SIMPLE} showValues colorScale="sequential" />,
      { wrapper: Wrapper },
    );
    const valueTexts = container.querySelectorAll('[data-tkx-heatmap-value]');
    expect(valueTexts.length).toBe(4);
    // Every text fill should be either pure black or pure white (auto-contrast).
    for (const t of Array.from(valueTexts)) {
      const fill = t.getAttribute('fill');
      expect(['#000000', '#ffffff']).toContain(fill);
    }
  });

  it('formatValue is used for displayed labels and tooltip titles', () => {
    const { container } = render(
      <TkxHeatmap
        data={[{ x: 'A', y: '1', value: 0.42 }]}
        showValues
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('[data-tkx-heatmap-value]')!.textContent).toBe('42%');
    const title = container.querySelector('title')!.textContent!;
    expect(title).toContain('42%');
  });

  it('legend renders min and max labels matching the domain', () => {
    const { container } = render(
      <TkxHeatmap data={SIMPLE} domain={[0, 10]} />,
      { wrapper: Wrapper },
    );
    const min = container.querySelector('[data-tkx-heatmap-legend-min]')!.textContent;
    const max = container.querySelector('[data-tkx-heatmap-legend-max]')!.textContent;
    expect(min).toBe('0');
    expect(max).toBe('10');
  });

  it('legend can be hidden', () => {
    const { container } = render(
      <TkxHeatmap data={SIMPLE} showLegend={false} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('[data-tkx-heatmap-legend-min]')).toBeNull();
    expect(container.querySelector('[data-tkx-heatmap-legend-max]')).toBeNull();
  });

  it('onCellClick fires with the correct cell when a cell is clicked', () => {
    const handler = vi.fn();
    const { container } = render(
      <TkxHeatmap data={SIMPLE} onCellClick={handler} />,
      { wrapper: Wrapper },
    );
    const target = Array.from(container.querySelectorAll('[data-tkx-heatmap-cell]')).find(
      (c) => c.getAttribute('data-x') === 'B' && c.getAttribute('data-y') === '2',
    )!;
    fireEvent.click(target);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject({ x: 'B', y: '2', value: 3 });
  });

  it('empty data array does not crash and exposes an empty marker', () => {
    const { container } = render(<TkxHeatmap data={[]} />, { wrapper: Wrapper });
    expect(container.querySelector('[data-tkx-heatmap-empty]')).toBeTruthy();
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('ariaLabel defaults to a sensible description and a custom value wins when provided', () => {
    const { rerender } = render(<TkxHeatmap data={SIMPLE} />, { wrapper: Wrapper });
    const auto = screen.getByRole('img').getAttribute('aria-label')!;
    expect(auto).toMatch(/2.{1,3}2/); // "2×2" with the multiplication sign in between
    expect(auto).toMatch(/values from/);

    rerender(<TkxHeatmap data={SIMPLE} ariaLabel="Q3 retention by cohort" />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Q3 retention by cohort');
  });

  it('degenerate domain (all identical values) renders without errors', () => {
    const data: TkxHeatmapCell[] = [
      { x: 'a', y: '1', value: 5 },
      { x: 'b', y: '1', value: 5 },
    ];
    const { container } = render(<TkxHeatmap data={data} />, { wrapper: Wrapper });
    expect(container.querySelectorAll('[data-tkx-heatmap-cell]').length).toBe(2);
  });
});
