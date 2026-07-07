import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useVariableVirtualList } from '../src/hooks';

// ── Controllable ResizeObserver ──────────────────────────────────────────────
// setup.ts installs a no-op ResizeObserver that never fires its callback. To
// exercise the measure-and-cache path we swap in a mock that records instances
// and lets a test fire a resize entry for a specific element.
type ROCallback = (entries: any[]) => void;
const roInstances: MockResizeObserver[] = [];

class MockResizeObserver {
  cb: ROCallback;
  elements = new Set<Element>();
  constructor(cb: ROCallback) {
    this.cb = cb;
    roInstances.push(this);
  }
  observe(el: Element) {
    this.elements.add(el);
  }
  unobserve(el: Element) {
    this.elements.delete(el);
  }
  disconnect() {
    this.elements.clear();
    const i = roInstances.indexOf(this);
    if (i >= 0) roInstances.splice(i, 1);
  }
}

/** Fire a border-box resize for `el` on whichever observer is watching it. */
function fireResize(el: HTMLElement, blockSize: number) {
  for (const ro of roInstances) {
    if (ro.elements.has(el)) {
      ro.cb([{ target: el, borderBoxSize: [{ blockSize }], contentRect: { height: blockSize } }]);
    }
  }
}

let origRO: unknown;
let origRAF: unknown;
let origCAF: unknown;

beforeEach(() => {
  origRO = (globalThis as any).ResizeObserver;
  origRAF = (globalThis as any).requestAnimationFrame;
  origCAF = (globalThis as any).cancelAnimationFrame;
  (globalThis as any).ResizeObserver = MockResizeObserver;
  // Run rAF callbacks synchronously so the coalesced flush happens inside act().
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  };
  (globalThis as any).cancelAnimationFrame = () => {};
});

afterEach(() => {
  (globalThis as any).ResizeObserver = origRO;
  (globalThis as any).requestAnimationFrame = origRAF;
  (globalThis as any).cancelAnimationFrame = origCAF;
  roInstances.length = 0;
  vi.restoreAllMocks();
});

// A fake scroll container with settable clientHeight + scrollTop.
function makeContainer(clientHeight: number) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
  Object.defineProperty(el, 'scrollTop', { value: 0, writable: true, configurable: true });
  return el;
}

interface VVLArgs {
  itemCount: number;
  estimateHeight: number | ((i: number) => number);
  enabled?: boolean;
  overscanPx?: number;
  el: HTMLElement | null;
  getItemKey?: (i: number) => string;
}

function useVVL(opts: VVLArgs) {
  const ref = useRef<HTMLElement | null>(opts.el);
  return useVariableVirtualList({
    itemCount: opts.itemCount,
    getItemKey: opts.getItemKey ?? ((i) => `k${i}`),
    estimateHeight: opts.estimateHeight,
    enabled: opts.enabled,
    overscanPx: opts.overscanPx,
    containerRef: ref,
  });
}

describe('useVariableVirtualList', () => {
  it('computes total height from summed estimated heights (scalar estimate)', () => {
    const el = makeContainer(300);
    const { result } = renderHook(() =>
      useVVL({ itemCount: 1000, estimateHeight: 40, el }),
    );
    expect(result.current.totalHeight).toBe(40000);
    // Prefix-sum reads: top edge of row i = 40*i.
    expect(result.current.getItemOffset(0)).toBe(0);
    expect(result.current.getItemOffset(10)).toBe(400);
    expect(result.current.getItemOffset(1000)).toBe(40000);
  });

  it('computes total height from a per-row estimate function', () => {
    const el = makeContainer(300);
    // rows alternate 20 / 60 → 4 rows sum to 160.
    const estimate = (i: number) => (i % 2 === 0 ? 20 : 60);
    const { result } = renderHook(() =>
      useVVL({ itemCount: 4, estimateHeight: estimate, el }),
    );
    expect(result.current.totalHeight).toBe(20 + 60 + 20 + 60);
    expect(result.current.getItemOffset(1)).toBe(20);
    expect(result.current.getItemOffset(2)).toBe(80);
  });

  it('windows to a slice around the viewport and updates on scroll', () => {
    const el = makeContainer(400); // 10 rows visible at 40px
    const { result } = renderHook(() =>
      useVVL({ itemCount: 1000, estimateHeight: 40, overscanPx: 0, el }),
    );
    // Viewport height settles via the container observer effect; slice starts at 0.
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBeGreaterThan(0);

    act(() => {
      (el as any).scrollTop = 4000; // row 100
      result.current.onScroll();
    });

    // overscanPx 0 → startIndex = findIndex(4000) = 100.
    expect(result.current.startIndex).toBe(100);
    expect(result.current.offsetY).toBe(4000);
    // Only a small window is rendered, not all 1000.
    expect(result.current.endIndex - result.current.startIndex).toBeLessThan(60);
    expect(result.current.endIndex).toBeLessThanOrEqual(1000);
  });

  it('measure-and-cache updates offsets keyed by stable id', () => {
    const el = makeContainer(400);
    const { result } = renderHook(() =>
      useVVL({ itemCount: 100, estimateHeight: 40, overscanPx: 0, el }),
    );

    // Before measurement every row is the 40px estimate.
    expect(result.current.getItemOffset(1)).toBe(40);
    expect(result.current.totalHeight).toBe(4000);

    // Attach the measuring ref for row 0's key, then report a real height of 100.
    const node = document.createElement('div');
    act(() => {
      result.current.measureRef('k0')(node);
    });
    act(() => {
      fireResize(node, 100); // rAF flush runs synchronously (stubbed)
    });

    // Row 0 now measures 100 → every offset past it shifts by +60.
    expect(result.current.getItemOffset(1)).toBe(100);
    expect(result.current.totalHeight).toBe(4000 + 60);
    // Sub-epsilon jitter must NOT trigger a rebuild (would loop the RO).
    const before = result.current.totalHeight;
    act(() => {
      fireResize(node, 100.2);
    });
    expect(result.current.totalHeight).toBe(before);
  });

  it('measureRef returns a stable callback per key', () => {
    const el = makeContainer(400);
    const { result } = renderHook(() =>
      useVVL({ itemCount: 10, estimateHeight: 40, el }),
    );
    const a = result.current.measureRef('k3');
    const b = result.current.measureRef('k3');
    expect(a).toBe(b); // same identity → no observe/unobserve thrash
  });

  it('when disabled, renders the full range with estimate-summed height', () => {
    const el = makeContainer(300);
    const { result } = renderHook(() =>
      useVVL({ itemCount: 500, estimateHeight: 40, enabled: false, el }),
    );
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(500);
    expect(result.current.offsetY).toBe(0);
    // totalHeight is the sum of estimates (not 0) so spacer-keeping consumers work.
    expect(result.current.totalHeight).toBe(20000);
    // measureRef is a stable no-op; installs no observer.
    const noop = result.current.measureRef('k0');
    expect(() => noop(document.createElement('div'))).not.toThrow();
    expect(result.current.isPinnedToBottom()).toBe(false);
  });

  it('degrades safely with a null container', () => {
    const { result } = renderHook(() =>
      useVVL({ itemCount: 100, estimateHeight: 30, el: null }),
    );
    expect(result.current.totalHeight).toBe(3000);
    expect(() => result.current.onScroll()).not.toThrow();
    expect(() => result.current.scrollToIndex(50)).not.toThrow();
    expect(() => result.current.scrollToBottom()).not.toThrow();
    expect(result.current.startIndex).toBe(0);
  });
});
