'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type RefObject,
} from 'react';
import {
  prefersReducedMotion,
  prefersHighContrast,
  createFocusTrap,
  createAnnouncer,
  type Announcer,
} from '../engine/wcag';

// ── useReducedMotion ─────────────────────────────────────────────────────────

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return prefersReducedMotion();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

// ── useHighContrast ──────────────────────────────────────────────────────────

export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    return prefersHighContrast();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(forced-colors: active)');
    const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return highContrast;
}

// ── useFocusTrap ─────────────────────────────────────────────────────────────

export function useFocusTrap(active: boolean): RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    // WAI-ARIA dialog pattern: remember the element focused before the trap
    // activated and return focus to it on teardown. Without this, closing a
    // Modal/Drawer dropped focus to <body> — an a11y defect caught by live
    // keyboard testing.
    const previouslyFocused =
      typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const trap = createFocusTrap(ref.current);
    trap.activate();
    return () => {
      trap.deactivate();
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [active]);

  return ref;
}

// ── useAnnounce ──────────────────────────────────────────────────────────────

export function useAnnounce(): (message: string, politeness?: 'polite' | 'assertive') => void {
  const announcerRef = useRef<Announcer | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    announcerRef.current = createAnnouncer();
    return () => {
      announcerRef.current?.destroy();
    };
  }, []);

  return useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    announcerRef.current?.announce(message, politeness);
  }, []);
}

// ── useEscapeKey ─────────────────────────────────────────────────────────────

export function useEscapeKey(handler: () => void, active = true): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handlerRef.current();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [active]);
}

// ── useClickOutside ──────────────────────────────────────────────────────────

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (e: PointerEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handlerRef.current();
    };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [ref]);
}

// ── useVirtualList ───────────────────────────────────────────────────────────

export interface VirtualListOptions {
  /** Total number of items in the list. */
  itemCount: number;
  /** Fixed pixel height of every item (uniform-height windowing). */
  itemHeight: number;
  /** Extra items rendered above/below the viewport to avoid blank flashes. */
  overscan?: number;
  /**
   * When false, all items render (no windowing). Callers should disable
   * virtualization for small lists where the overhead isn't worth it.
   */
  enabled?: boolean;
  /** Ref to the scrolling container. */
  containerRef: RefObject<HTMLElement | null>;
}

export interface VirtualListResult {
  /** First item index to render (inclusive). */
  startIndex: number;
  /** Last item index to render (exclusive). */
  endIndex: number;
  /** Height of the top spacer (px) that offsets the rendered slice. */
  offsetY: number;
  /** Total scrollable height (px) of the full list. */
  totalHeight: number;
  /** Attach to the container's `onScroll`. */
  onScroll: () => void;
}

/**
 * Fixed-height list virtualization. Renders only the items visible in the
 * container (plus overscan), so a 100k-row list stays cheap. Uniform item
 * height only — for variable heights, measure-and-cache is a separate concern.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const v = useVirtualList({ itemCount: rows.length, itemHeight: 40, containerRef: ref, enabled: rows.length > 50 });
 * <div ref={ref} onScroll={v.onScroll} style={{ overflowY: 'auto' }}>
 *   <div style={{ height: v.totalHeight, position: 'relative' }}>
 *     <div style={{ transform: `translateY(${v.offsetY}px)` }}>
 *       {rows.slice(v.startIndex, v.endIndex).map(...)}
 *     </div>
 *   </div>
 * </div>
 */
export function useVirtualList(opts: VirtualListOptions): VirtualListResult {
  const { itemCount, itemHeight, overscan = 6, enabled = true, containerRef } = opts;
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) setScrollTop(el.scrollTop);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!enabled || !el) return;
    setViewportHeight(el.clientHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setViewportHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, containerRef, itemCount]);

  const totalHeight = itemCount * itemHeight;

  if (!enabled || itemHeight <= 0) {
    return { startIndex: 0, endIndex: itemCount, offsetY: 0, totalHeight, onScroll };
  }

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil((viewportHeight || 0) / itemHeight) + overscan * 2;
  const endIndex = Math.min(itemCount, startIndex + Math.max(visibleCount, overscan));
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY, totalHeight, onScroll };
}

// ── useVariableVirtualList ───────────────────────────────────────────────────
// Variable-height sibling of useVirtualList. Large + anchoring-heavy, so it
// lives in its own module; re-exported here so the import site stays `../hooks`.
export {
  useVariableVirtualList,
  type VariableVirtualListOptions,
  type VariableVirtualListResult,
} from './useVariableVirtualList';