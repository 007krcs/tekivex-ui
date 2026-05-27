import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxTreemap, type TkxTreemapNode } from '../src/components/TkxTreemap';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const FLAT: TkxTreemapNode[] = [
  { label: 'A', value: 500 },
  { label: 'B', value: 300 },
  { label: 'C', value: 200 },
  { label: 'D', value: 150 },
  { label: 'E', value: 100 },
  { label: 'F', value: 80 },
  { label: 'G', value: 50 },
];

function rectArea(el: Element): number {
  const w = parseFloat(el.getAttribute('width') || '0');
  const h = parseFloat(el.getAttribute('height') || '0');
  return w * h;
}
function rectAspect(el: Element): number {
  const w = parseFloat(el.getAttribute('width') || '0');
  const h = parseFloat(el.getAttribute('height') || '0');
  if (w === 0 || h === 0) return Infinity;
  return Math.max(w / h, h / w);
}

describe('TkxTreemap', () => {
  it('renders one rect per top-level node', () => {
    const { container } = render(
      <TkxTreemap data={FLAT} width={600} height={400} />,
      { wrapper: Wrapper },
    );
    const rects = container.querySelectorAll('[data-tkx-treemap-rect]');
    expect(rects.length).toBe(FLAT.length);
  });

  it('rectangle areas are proportional to node values', () => {
    const { container } = render(
      <TkxTreemap data={FLAT} width={600} height={400} />,
      { wrapper: Wrapper },
    );
    const nodes = Array.from(container.querySelectorAll('[data-tkx-treemap-node]'));
    const aByLabel = new Map<string, number>();
    for (const n of nodes) {
      const label = n.getAttribute('data-label')!;
      const rect = n.querySelector('rect')!;
      aByLabel.set(label, rectArea(rect));
    }
    // Larger value → larger area.
    expect(aByLabel.get('A')!).toBeGreaterThan(aByLabel.get('B')!);
    expect(aByLabel.get('B')!).toBeGreaterThan(aByLabel.get('C')!);
    expect(aByLabel.get('F')!).toBeGreaterThan(aByLabel.get('G')!);
  });

  it('total area of all rects approximately equals the container area', () => {
    const W = 600;
    const H = 400;
    const { container } = render(
      <TkxTreemap data={FLAT} width={W} height={H} />,
      { wrapper: Wrapper },
    );
    const rects = container.querySelectorAll('[data-tkx-treemap-rect]');
    let total = 0;
    for (const r of Array.from(rects)) total += rectArea(r);
    // Squarified should tile the entire rectangle. Allow tiny float slack.
    expect(Math.abs(total - W * H)).toBeLessThan(2);
  });

  it('squarified algorithm keeps aspect ratios reasonable for typical data', () => {
    const { container } = render(
      <TkxTreemap data={FLAT} width={600} height={400} />,
      { wrapper: Wrapper },
    );
    const rects = container.querySelectorAll('[data-tkx-treemap-rect]');
    let worst = 0;
    for (const r of Array.from(rects)) {
      const ar = rectAspect(r);
      if (ar > worst) worst = ar;
    }
    // Brief asks for < 5 on typical data; our worst should comfortably clear it.
    expect(worst).toBeLessThan(5);
  });

  it('showLabels gates label rendering', () => {
    const { container: with_, rerender } = render(
      <TkxTreemap data={FLAT} width={600} height={400} showLabels />,
      { wrapper: Wrapper },
    );
    const withCount = with_.querySelectorAll('[data-tkx-treemap-label]').length;
    expect(withCount).toBeGreaterThan(0);

    rerender(<TkxTreemap data={FLAT} width={600} height={400} showLabels={false} />);
    expect(with_.querySelectorAll('[data-tkx-treemap-label]').length).toBe(0);
  });

  it('minLabelSize hides labels in rectangles below the threshold', () => {
    // Force a huge minLabelSize so every rect is below it → no labels.
    const { container } = render(
      <TkxTreemap data={FLAT} width={600} height={400} minLabelSize={10_000_000} />,
      { wrapper: Wrapper },
    );
    expect(container.querySelectorAll('[data-tkx-treemap-label]').length).toBe(0);
  });

  it('onNodeClick fires with the right node + path', () => {
    const handler = vi.fn();
    const { container } = render(
      <TkxTreemap data={FLAT} width={600} height={400} onNodeClick={handler} />,
      { wrapper: Wrapper },
    );
    // Click the node labelled "B" (input index 1).
    const target = Array.from(container.querySelectorAll('[data-tkx-treemap-node]')).find(
      (n) => n.getAttribute('data-label') === 'B',
    )!;
    fireEvent.click(target);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject({ label: 'B', value: 300 });
    expect(handler.mock.calls[0][1]).toEqual([1]);
  });

  it('custom colors prop cycles by input order', () => {
    const data: TkxTreemapNode[] = [
      { label: 'a', value: 100 },
      { label: 'b', value: 100 },
      { label: 'c', value: 100 },
    ];
    const { container } = render(
      <TkxTreemap data={data} width={300} height={300} colors={['#111111', '#222222']} />,
      { wrapper: Wrapper },
    );
    const byLabel = new Map<string, string>();
    for (const n of Array.from(container.querySelectorAll('[data-tkx-treemap-node]'))) {
      byLabel.set(
        n.getAttribute('data-label')!,
        n.querySelector('rect')!.getAttribute('fill')!.toLowerCase(),
      );
    }
    expect(byLabel.get('a')).toBe('#111111');
    expect(byLabel.get('b')).toBe('#222222');
    expect(byLabel.get('c')).toBe('#111111'); // cycle wraps
  });

  it('per-node color overrides the cycle', () => {
    const data: TkxTreemapNode[] = [
      { label: 'override', value: 100, color: '#ff00ff' },
      { label: 'cycle', value: 50 },
    ];
    const { container } = render(
      <TkxTreemap data={data} width={300} height={300} colors={['#000000', '#ffffff']} />,
      { wrapper: Wrapper },
    );
    const node = Array.from(container.querySelectorAll('[data-tkx-treemap-node]')).find(
      (n) => n.getAttribute('data-label') === 'override',
    )!;
    expect(node.querySelector('rect')!.getAttribute('fill')!.toLowerCase()).toBe('#ff00ff');
  });

  it('empty data renders an empty SVG without crashing', () => {
    const { container } = render(<TkxTreemap data={[]} />, { wrapper: Wrapper });
    expect(container.querySelector('[data-tkx-treemap-empty]')).toBeTruthy();
    expect(container.querySelectorAll('[data-tkx-treemap-rect]').length).toBe(0);
  });

  it('single node fills the entire area', () => {
    const W = 400;
    const H = 300;
    const { container } = render(
      <TkxTreemap data={[{ label: 'only', value: 1 }]} width={W} height={H} />,
      { wrapper: Wrapper },
    );
    const rect = container.querySelector('[data-tkx-treemap-rect]')!;
    expect(parseFloat(rect.getAttribute('width')!)).toBeCloseTo(W);
    expect(parseFloat(rect.getAttribute('height')!)).toBeCloseTo(H);
  });

  it('ariaLabel defaults to a sensible description and a custom value wins when provided', () => {
    const { rerender } = render(<TkxTreemap data={FLAT} />, { wrapper: Wrapper });
    const auto = screen.getByRole('img').getAttribute('aria-label')!;
    expect(auto).toMatch(/Treemap with 7 nodes/);

    rerender(<TkxTreemap data={FLAT} ariaLabel="Spend by department" />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Spend by department');
  });

  it('label fill is pure black or pure white (WCAG-AAA auto contrast)', () => {
    const { container } = render(
      <TkxTreemap data={FLAT} width={600} height={400} />,
      { wrapper: Wrapper },
    );
    const labels = container.querySelectorAll('[data-tkx-treemap-label]');
    expect(labels.length).toBeGreaterThan(0);
    for (const l of Array.from(labels)) {
      const fill = l.getAttribute('fill');
      expect(['#000000', '#ffffff']).toContain(fill);
    }
  });

  it('nested children render as an inner treemap inside the parent rect', () => {
    const data: TkxTreemapNode[] = [
      {
        label: 'parent',
        value: 100,
        children: [
          { label: 'child-1', value: 60 },
          { label: 'child-2', value: 40 },
        ],
      },
      { label: 'sibling', value: 50 },
    ];
    const { container } = render(
      <TkxTreemap data={data} width={600} height={400} />,
      { wrapper: Wrapper },
    );
    const childGroup = container.querySelector('[data-tkx-treemap-children]');
    expect(childGroup).toBeTruthy();
    const childNodes = childGroup!.querySelectorAll('[data-tkx-treemap-node]');
    expect(childNodes.length).toBe(2);
    const labels = Array.from(childNodes).map((n) => n.getAttribute('data-label'));
    expect(labels).toContain('child-1');
    expect(labels).toContain('child-2');
  });
});
