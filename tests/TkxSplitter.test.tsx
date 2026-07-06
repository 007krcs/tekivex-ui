import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxSplitter, TkxSplitterPane } from '../src/components/TkxSplitter';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// NOTE on coverage: actual pointer-drag resizing is NOT exercised here —
// jsdom has no layout engine, so getBoundingClientRect() on the container
// returns a zero-size rect and drag deltas cannot be converted to
// percentages. The shared resize/clamp logic (resizePair) is instead fully
// covered through the keyboard path below, which drives the exact same code.

function getPanes(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-tkx-splitter-pane]'));
}

describe('TkxSplitter', () => {
  it('survives a bare mount with no children (hard library rule)', () => {
    expect(() => render(<TkxSplitter />, { wrapper: W })).not.toThrow();
  });

  it('tolerates arbitrary non-pane children without crashing', () => {
    expect(() =>
      render(
        <TkxSplitter>
          <span>not a pane</span>
          {'plain text'}
          {null}
        </TkxSplitter>,
        { wrapper: W },
      ),
    ).not.toThrow();
    expect(screen.getByText('not a pane')).toBeTruthy();
    // No gutters when there is nothing to split.
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('renders a single pane without any gutter', () => {
    render(
      <TkxSplitter>
        <TkxSplitterPane>only</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    expect(screen.getByText('only')).toBeTruthy();
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('two panes render one separator with vertical aria-orientation (horizontal split)', () => {
    const { container } = render(
      <TkxSplitter direction="horizontal">
        <TkxSplitterPane defaultSize={30}>left</TkxSplitterPane>
        <TkxSplitterPane>right</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const sep = screen.getByRole('separator');
    expect(sep.getAttribute('aria-orientation')).toBe('vertical');
    expect(sep.getAttribute('tabindex')).toBe('0');
    expect(sep.getAttribute('aria-valuenow')).toBe('30');
    const panes = getPanes(container);
    expect(panes).toHaveLength(2);
    expect(panes[0].style.flexBasis).toBe('30%');
    expect(panes[1].style.flexBasis).toBe('70%');
    // Content must be scrollable within each pane.
    expect(panes[0].style.overflow).toBe('auto');
  });

  it('vertical split renders a horizontal-orientation separator', () => {
    render(
      <TkxSplitter direction="vertical">
        <TkxSplitterPane>top</TkxSplitterPane>
        <TkxSplitterPane>bottom</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('forwards a ref to the root div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <TkxSplitter ref={ref}>
        <TkxSplitterPane>a</TkxSplitterPane>
        <TkxSplitterPane>b</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute('data-tkx-splitter')).toBe('');
  });

  it('ArrowRight/ArrowLeft move the divider by 2% and fire onResize + onResizeEnd', () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const { container } = render(
      <TkxSplitter onResize={onResize} onResizeEnd={onResizeEnd}>
        <TkxSplitterPane defaultSize={30}>left</TkxSplitterPane>
        <TkxSplitterPane>right</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const sep = screen.getByRole('separator');
    sep.focus();
    expect(document.activeElement).toBe(sep);

    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    expect(sep.getAttribute('aria-valuenow')).toBe('32');
    expect(onResize).toHaveBeenLastCalledWith([32, 68]);
    expect(onResizeEnd).toHaveBeenLastCalledWith([32, 68]);
    expect(getPanes(container)[0].style.flexBasis).toBe('32%');

    fireEvent.keyDown(sep, { key: 'ArrowLeft' });
    expect(sep.getAttribute('aria-valuenow')).toBe('30');
    expect(onResize).toHaveBeenLastCalledWith([30, 70]);
    expect(onResizeEnd).toHaveBeenLastCalledWith([30, 70]);
  });

  it('vertical split uses ArrowDown/ArrowUp', () => {
    const onResize = vi.fn();
    render(
      <TkxSplitter direction="vertical" onResize={onResize}>
        <TkxSplitterPane defaultSize={50}>top</TkxSplitterPane>
        <TkxSplitterPane>bottom</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const sep = screen.getByRole('separator');
    fireEvent.keyDown(sep, { key: 'ArrowDown' });
    expect(sep.getAttribute('aria-valuenow')).toBe('52');
    fireEvent.keyDown(sep, { key: 'ArrowUp' });
    expect(sep.getAttribute('aria-valuenow')).toBe('50');
    // Horizontal-split keys must be ignored in a vertical split.
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    expect(sep.getAttribute('aria-valuenow')).toBe('50');
    expect(onResize).toHaveBeenCalledTimes(2);
  });

  it('Home/End snap the preceding pane to its min/max', () => {
    render(
      <TkxSplitter>
        <TkxSplitterPane defaultSize={40} minSize={20}>left</TkxSplitterPane>
        <TkxSplitterPane minSize={15}>right</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const sep = screen.getByRole('separator');
    fireEvent.keyDown(sep, { key: 'Home' });
    expect(sep.getAttribute('aria-valuenow')).toBe('20'); // own minSize
    fireEvent.keyDown(sep, { key: 'End' });
    expect(sep.getAttribute('aria-valuenow')).toBe('85'); // 100 - neighbour minSize
  });

  it('minSize/maxSize clamp keyboard resizing', () => {
    render(
      <TkxSplitter>
        <TkxSplitterPane defaultSize={12} minSize={10} maxSize={14}>left</TkxSplitterPane>
        <TkxSplitterPane>right</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const sep = screen.getByRole('separator');
    fireEvent.keyDown(sep, { key: 'ArrowLeft' });
    expect(sep.getAttribute('aria-valuenow')).toBe('10');
    fireEvent.keyDown(sep, { key: 'ArrowLeft' });
    expect(sep.getAttribute('aria-valuenow')).toBe('10'); // clamped at minSize
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    expect(sep.getAttribute('aria-valuenow')).toBe('14'); // clamped at maxSize
  });

  it('controlled: renders given flex-basis and does not self-mutate', () => {
    const onResize = vi.fn();
    const { container, rerender } = render(
      <W>
        <TkxSplitter sizes={[40, 60]} onResize={onResize}>
          <TkxSplitterPane>left</TkxSplitterPane>
          <TkxSplitterPane>right</TkxSplitterPane>
        </TkxSplitter>
      </W>,
    );
    const sep = screen.getByRole('separator');
    expect(getPanes(container)[0].style.flexBasis).toBe('40%');

    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    // Callback fires with the proposed sizes...
    expect(onResize).toHaveBeenCalledWith([42, 58]);
    // ...but the DOM does not change until the prop does.
    expect(getPanes(container)[0].style.flexBasis).toBe('40%');
    expect(sep.getAttribute('aria-valuenow')).toBe('40');

    rerender(
      <W>
        <TkxSplitter sizes={[42, 58]} onResize={onResize}>
          <TkxSplitterPane>left</TkxSplitterPane>
          <TkxSplitterPane>right</TkxSplitterPane>
        </TkxSplitter>
      </W>,
    );
    expect(getPanes(container)[0].style.flexBasis).toBe('42%');
    expect(sep.getAttribute('aria-valuenow')).toBe('42');
  });

  it('double-click resets the two adjacent panes to their initial sizes', () => {
    const onResizeEnd = vi.fn();
    const { container } = render(
      <TkxSplitter onResizeEnd={onResizeEnd}>
        <TkxSplitterPane defaultSize={30}>left</TkxSplitterPane>
        <TkxSplitterPane>right</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const sep = screen.getByRole('separator');
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    expect(sep.getAttribute('aria-valuenow')).toBe('34');

    fireEvent.dblClick(sep);
    expect(sep.getAttribute('aria-valuenow')).toBe('30');
    expect(getPanes(container)[0].style.flexBasis).toBe('30%');
    expect(onResizeEnd).toHaveBeenLastCalledWith([30, 70]);
  });

  it('disabled blocks keyboard resize and marks the separator', () => {
    const onResize = vi.fn();
    render(
      <TkxSplitter disabled onResize={onResize}>
        <TkxSplitterPane defaultSize={30}>left</TkxSplitterPane>
        <TkxSplitterPane>right</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const sep = screen.getByRole('separator');
    expect(sep.getAttribute('aria-disabled')).toBe('true');
    expect(sep.getAttribute('tabindex')).toBe('-1');
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    expect(onResize).not.toHaveBeenCalled();
    expect(sep.getAttribute('aria-valuenow')).toBe('30');
  });

  it('three panes render two gutters; each gutter resizes only its own pair', () => {
    const onResize = vi.fn();
    const { container } = render(
      <TkxSplitter onResize={onResize}>
        <TkxSplitterPane defaultSize={20}>a</TkxSplitterPane>
        <TkxSplitterPane defaultSize={30}>b</TkxSplitterPane>
        <TkxSplitterPane defaultSize={50}>c</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const seps = screen.getAllByRole('separator');
    expect(seps).toHaveLength(2);
    expect(seps[0].getAttribute('aria-valuenow')).toBe('20');
    expect(seps[1].getAttribute('aria-valuenow')).toBe('30');

    fireEvent.keyDown(seps[1], { key: 'ArrowRight' });
    // Second gutter grows pane b at pane c's expense; pane a untouched.
    expect(onResize).toHaveBeenLastCalledWith([20, 32, 48]);
    const panes = getPanes(container);
    expect(panes[0].style.flexBasis).toBe('20%');
    expect(panes[1].style.flexBasis).toBe('32%');
    expect(panes[2].style.flexBasis).toBe('48%');
  });

  it('normalizes defaultSize: unspecified panes share the remainder equally', () => {
    const { container } = render(
      <TkxSplitter>
        <TkxSplitterPane defaultSize={50}>a</TkxSplitterPane>
        <TkxSplitterPane>b</TkxSplitterPane>
        <TkxSplitterPane>c</TkxSplitterPane>
      </TkxSplitter>,
      { wrapper: W },
    );
    const panes = getPanes(container);
    expect(panes[0].style.flexBasis).toBe('50%');
    expect(panes[1].style.flexBasis).toBe('25%');
    expect(panes[2].style.flexBasis).toBe('25%');
  });
});
