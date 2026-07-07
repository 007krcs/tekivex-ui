import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useVirtualList } from '../src/hooks';

// A fake scroll container with a settable clientHeight + scrollTop.
function makeContainer(clientHeight: number) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
  return el;
}

function useVL(opts: { itemCount: number; itemHeight: number; enabled?: boolean; el: HTMLElement | null }) {
  const ref = useRef<HTMLElement | null>(opts.el);
  return useVirtualList({
    itemCount: opts.itemCount,
    itemHeight: opts.itemHeight,
    enabled: opts.enabled,
    overscan: 2,
    containerRef: ref,
  });
}

describe('useVirtualList', () => {
  it('computes total height from count * itemHeight', () => {
    const el = makeContainer(300);
    const { result } = renderHook(() => useVL({ itemCount: 1000, itemHeight: 40, el }));
    expect(result.current.totalHeight).toBe(40000);
  });

  it('when disabled, renders the full range (no windowing)', () => {
    const el = makeContainer(300);
    const { result } = renderHook(() => useVL({ itemCount: 500, itemHeight: 40, enabled: false, el }));
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(500);
    expect(result.current.offsetY).toBe(0);
  });

  it('windows to a slice around the viewport and updates on scroll', () => {
    const el = makeContainer(400); // ~10 rows visible at 40px
    const { result } = renderHook(() => useVL({ itemCount: 1000, itemHeight: 40, el }));
    // Initial: viewportHeight settles via effect; slice starts at 0.
    expect(result.current.startIndex).toBe(0);
    // Scroll down 4000px = row 100.
    act(() => {
      Object.defineProperty(el, 'scrollTop', { value: 4000, configurable: true });
      result.current.onScroll();
    });
    // startIndex = floor(4000/40) - overscan(2) = 100 - 2 = 98
    expect(result.current.startIndex).toBe(98);
    expect(result.current.offsetY).toBe(98 * 40);
    // Only a small window is rendered, not all 1000.
    expect(result.current.endIndex - result.current.startIndex).toBeLessThan(60);
  });

  it('clamps endIndex to itemCount near the bottom', () => {
    const el = makeContainer(400);
    const { result } = renderHook(() => useVL({ itemCount: 20, itemHeight: 40, el }));
    act(() => {
      Object.defineProperty(el, 'scrollTop', { value: 800, configurable: true });
      result.current.onScroll();
    });
    expect(result.current.endIndex).toBeLessThanOrEqual(20);
    expect(result.current.startIndex).toBeGreaterThanOrEqual(0);
  });

  it('degrades safely with a null container', () => {
    const { result } = renderHook(() => useVL({ itemCount: 100, itemHeight: 30, el: null }));
    expect(result.current.totalHeight).toBe(3000);
    expect(() => result.current.onScroll()).not.toThrow();
  });
});
