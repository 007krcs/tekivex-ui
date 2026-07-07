'use client';

// ── useVariableVirtualList ───────────────────────────────────────────────────
// Variable-height list virtualization with an id-keyed measurement cache,
// prefix-sum + binary-search windowing, a rAF-coalesced ResizeObserver, and
// optional scroll-anchoring (pixel-stable anchor + pin-to-bottom).
//
// Companion to `useVirtualList` (fixed height). Lives in its own module because
// the anchoring machinery is large and bug-prone; see the design spec for the
// per-decision rationale (id-keyed cache, O(N) rebuild over Fenwick, pixel
// overscan, `enabled` gate mirroring the fixed hook).
//
// SSR-safe: no layout reads at module scope or during render; scrollTop and
// viewportHeight are useState(0); ResizeObserver construction is guarded.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

// useLayoutEffect warns on the server; fall back to useEffect there. Anchoring
// is a no-op on the server anyway (guarded), so the fallback never runs layout.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface VariableVirtualListOptions {
  /** Total number of items in the list. */
  itemCount: number;
  /**
   * Stable id for row `index`. MUST survive index shifts (expand/collapse,
   * prepend) so a measured height follows a row leaving and re-entering the
   * window. TreeView → `flatItems[i].node.id`; MessageThread → `rows[i].key`.
   */
  getItemKey: (index: number) => string;
  /**
   * Fallback height for unmeasured rows. Function form lets rows guess taller
   * when they carry richer content (e.g. attachments).
   */
  estimateHeight: number | ((index: number) => number);
  /**
   * Overscan is a PIXEL budget, not a row count — a fixed count is meaningless
   * when rows range 32px..300px. Default 200.
   */
  overscanPx?: number;
  /** false ⇒ render all rows: no windowing, no observer, no anchoring. */
  enabled?: boolean;
  /** Ref to the scrolling container. */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * Correct scrollTop before paint so measurement / prepend never shifts the
   * visible content. TreeView: false. MessageThread: true. Default false.
   */
  maintainVisibleContentPosition?: boolean;
  /**
   * When maintained AND the user is within `pinThreshold` of the bottom, follow
   * new content to the bottom. MessageThread: true. Default false.
   */
  pinToBottom?: boolean;
  /** px slop for "counts as at the bottom". Default 48. */
  pinThreshold?: number;
}

export interface VariableVirtualListResult {
  /** First item index to render (inclusive). */
  startIndex: number;
  /** Last item index to render (exclusive). */
  endIndex: number;
  /** `= getItemOffset(startIndex)`; translateY the rendered slice by this. */
  offsetY: number;
  /** `= getItemOffset(itemCount)`; total scrollable height (px). */
  totalHeight: number;
  /** Attach to the container's `onScroll` (same contract as the fixed hook). */
  onScroll: () => void;
  /** Per-row measuring ref, memoized + stable per key. */
  measureRef: (key: string) => (el: HTMLElement | null) => void;
  /** Prefix-sum read: top edge (px) of row `index`. */
  getItemOffset: (index: number) => number;
  /** Scroll a row into view; `align` defaults to 'auto' (nearest edge). */
  scrollToIndex: (index: number, align?: 'auto' | 'start' | 'center' | 'end') => void;
  /** Scroll to the very bottom. */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  /** Reads a ref (not render state) so a layout effect sees pre-arrival intent. */
  isPinnedToBottom: () => boolean;
}

const NOOP_REF = (_el: HTMLElement | null): void => {};
const EPSILON = 0.5;

interface AnchorState {
  key: string;
  delta: number;
  index: number;
}

export function useVariableVirtualList(
  opts: VariableVirtualListOptions,
): VariableVirtualListResult {
  const {
    itemCount,
    getItemKey,
    estimateHeight,
    overscanPx = 200,
    enabled = true,
    containerRef,
    maintainVisibleContentPosition = false,
    pinToBottom = false,
    pinThreshold = 48,
  } = opts;

  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  // Bumped once per rAF flush after staged measurements are applied.
  const [measuredVersion, setMeasuredVersion] = useState(0);

  // ── Refs that outlive renders ──────────────────────────────────────────────
  const heightCache = useRef<Map<string, number>>(new Map());
  const staged = useRef<Map<string, number>>(new Map());
  const rafId = useRef<number | null>(null);
  const rowObserver = useRef<ResizeObserver | null>(null);
  const measureCallbacks = useRef<Map<string, (el: HTMLElement | null) => void>>(
    new Map(),
  );
  const programmaticScroll = useRef(false);
  const anchorRef = useRef<AnchorState | null>(null);
  const pinnedRef = useRef(false);

  // Keep the latest estimate/getItemKey reachable from stable callbacks without
  // re-subscribing observers on every render.
  const estimateFn = useCallback(
    (index: number): number =>
      typeof estimateHeight === 'function' ? estimateHeight(index) : estimateHeight,
    [estimateHeight],
  );

  const height = useCallback(
    (index: number): number => {
      const cached = heightCache.current.get(getItemKey(index));
      return cached ?? estimateFn(index);
    },
    [getItemKey, estimateFn],
  );

  // ── keysSignature: ordered id list drives prefix-array rebuild ─────────────
  const keysSignature = useMemo(() => {
    const keys: string[] = new Array(itemCount);
    for (let i = 0; i < itemCount; i++) keys[i] = getItemKey(i);
    return keys;
    // itemCount + getItemKey identity define the ordered id list. Consumers pass
    // a getItemKey that changes identity when the order changes (memo on data).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount, getItemKey]);

  // Fast id → index lookup for anchor restore.
  const indexOfKey = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < keysSignature.length; i++) m.set(keysSignature[i], i);
    return m;
  }, [keysSignature]);

  // ── Prefix-sum: offsets[i] = top edge of row i; offsets[itemCount]=total ───
  const offsets = useMemo(() => {
    const arr = new Array(itemCount + 1);
    arr[0] = 0;
    for (let i = 0; i < itemCount; i++) {
      const cached = heightCache.current.get(keysSignature[i]);
      arr[i + 1] = arr[i] + (cached ?? estimateFn(i));
    }
    return arr as number[];
    // measuredVersion invalidates when the cache mutates; keysSignature when the
    // ordered id list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount, keysSignature, measuredVersion, estimateFn]);

  const totalHeight = offsets[itemCount];

  const getItemOffset = useCallback(
    (index: number): number => {
      if (index <= 0) return 0;
      if (index >= itemCount) return offsets[itemCount];
      return offsets[index];
    },
    [offsets, itemCount],
  );

  // Largest i with offsets[i] <= px (clamped to [0, itemCount]).
  const findIndex = useCallback(
    (px: number): number => {
      let lo = 0;
      let hi = itemCount; // search offsets[0..itemCount]
      const target = px;
      // binary search for the rightmost offset <= target
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (offsets[mid] <= target) lo = mid;
        else hi = mid - 1;
      }
      return lo;
    },
    [offsets, itemCount],
  );

  // ── onScroll ───────────────────────────────────────────────────────────────
  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // Programmatic writes must not clobber anchor/pin intent.
    if (programmaticScroll.current) return;
    const st = el.scrollTop;
    setScrollTop(st);

    if (maintainVisibleContentPosition) {
      const clientHeight = el.clientHeight;
      // Record the topmost visible row as the anchor.
      const a = findIndex(st);
      anchorRef.current = {
        key: keysSignature[a] ?? '',
        delta: st - offsets[a],
        index: a,
      };
      pinnedRef.current = totalHeight - st - clientHeight <= pinThreshold;
    }
  }, [
    containerRef,
    maintainVisibleContentPosition,
    findIndex,
    keysSignature,
    offsets,
    totalHeight,
    pinThreshold,
  ]);

  // ── setScroll: every programmatic write flips the gate for one rAF ─────────
  const setScroll = useCallback(
    (x: number) => {
      const el = containerRef.current;
      if (!el) return;
      programmaticScroll.current = true;
      el.scrollTop = x;
      setScrollTop(x < 0 ? 0 : x);
      if (typeof requestAnimationFrame === 'undefined') {
        programmaticScroll.current = false;
      } else {
        requestAnimationFrame(() => {
          programmaticScroll.current = false;
        });
      }
    },
    [containerRef],
  );

  // ── measureRef: stable-per-key callback ref installing the row observer ────
  const measureRef = useCallback(
    (key: string): ((el: HTMLElement | null) => void) => {
      if (!enabled) return NOOP_REF;
      const existing = measureCallbacks.current.get(key);
      if (existing) return existing;
      const cb = (el: HTMLElement | null): void => {
        const ro = rowObserver.current;
        if (el) {
          el.dataset.vkey = key;
          ro?.observe(el);
        } else {
          // Detach: stop observing and drop the cached callback so a future
          // mount re-creates a fresh one.
          measureCallbacks.current.delete(key);
        }
      };
      measureCallbacks.current.set(key, cb);
      return cb;
    },
    [enabled],
  );

  // ── Row ResizeObserver: stage diffs > epsilon, flush once per rAF ──────────
  useEffect(() => {
    if (!enabled) return;
    if (typeof ResizeObserver === 'undefined') return;

    const flush = () => {
      rafId.current = null;
      if (staged.current.size === 0) return;
      let changed = false;
      staged.current.forEach((h, k) => {
        heightCache.current.set(k, h);
        changed = true;
      });
      staged.current.clear();
      if (changed) setMeasuredVersion((v) => v + 1);
    };

    const scheduleFlush = () => {
      if (rafId.current != null) return;
      if (typeof requestAnimationFrame === 'undefined') {
        flush();
        return;
      }
      rafId.current = requestAnimationFrame(flush);
    };

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const key = target.dataset.vkey;
        if (key == null) continue;
        const measured =
          entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        const prev = heightCache.current.get(key);
        // Epsilon breaks the measure → setState → re-render → measure loop.
        if (prev == null || Math.abs(prev - measured) > EPSILON) {
          staged.current.set(key, measured);
        }
      }
      if (staged.current.size > 0) scheduleFlush();
    });
    rowObserver.current = ro;

    return () => {
      ro.disconnect();
      rowObserver.current = null;
      if (rafId.current != null && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(rafId.current);
      }
      rafId.current = null;
      staged.current.clear();
      measureCallbacks.current.clear();
    };
  }, [enabled]);

  // ── Container ResizeObserver for viewportHeight (mirrors the fixed hook) ────
  useEffect(() => {
    const el = containerRef.current;
    if (!enabled || !el) return;
    setViewportHeight(el.clientHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setViewportHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, containerRef, itemCount]);

  // ── Scroll-anchoring: runs before paint after a prefix-array-changing commit
  useIsomorphicLayoutEffect(() => {
    if (!enabled || !maintainVisibleContentPosition) return;
    const el = containerRef.current;
    if (!el) return;
    const clientHeight = el.clientHeight;

    // Branch 1: pinned → stick to bottom.
    if (pinToBottom && pinnedRef.current) {
      setScroll(Math.max(0, totalHeight - clientHeight));
      return;
    }

    // Branch 2: anchor key still present → hold it pixel-stable.
    const anchor = anchorRef.current;
    if (anchor && anchor.key) {
      const aPrime = indexOfKey.get(anchor.key);
      if (aPrime != null) {
        setScroll(offsets[aPrime] + anchor.delta);
        return;
      }
      // Branch 3: anchor vanished (deleted row) → nearest surviving neighbour by
      // last-known index, else fall through.
      const fallbackIndex = Math.min(anchor.index, Math.max(0, itemCount - 1));
      setScroll(offsets[fallbackIndex] ?? 0);
    }
    // measuredVersion + itemCount are the "prefix array changed" trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measuredVersion, itemCount, enabled, maintainVisibleContentPosition]);

  // ── scrollToIndex / scrollToBottom / isPinnedToBottom ──────────────────────
  const scrollToIndex = useCallback(
    (index: number, align: 'auto' | 'start' | 'center' | 'end' = 'auto') => {
      const el = containerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(index, itemCount));
      const top = offsets[clamped];
      const rowHeight = height(clamped);
      const clientHeight = el.clientHeight;
      let target = top;
      if (align === 'center') target = top - clientHeight / 2 + rowHeight / 2;
      else if (align === 'end') target = top - clientHeight + rowHeight;
      else if (align === 'auto') {
        const current = el.scrollTop;
        if (top < current) target = top; // above viewport → align start
        else if (top + rowHeight > current + clientHeight)
          target = top - clientHeight + rowHeight; // below → align end
        else return; // already visible
      }
      setScroll(Math.max(0, Math.min(target, Math.max(0, totalHeight - clientHeight))));
    },
    [containerRef, itemCount, offsets, height, totalHeight, setScroll],
  );

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const el = containerRef.current;
      if (!el) return;
      const target = Math.max(0, totalHeight - el.clientHeight);
      if (behavior === 'smooth' && typeof el.scrollTo === 'function') {
        programmaticScroll.current = true;
        el.scrollTo({ top: target, behavior });
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            programmaticScroll.current = false;
          });
        } else {
          programmaticScroll.current = false;
        }
        setScrollTop(target);
        return;
      }
      setScroll(target);
    },
    [containerRef, totalHeight, setScroll],
  );

  const isPinnedToBottom = useCallback(() => pinnedRef.current, []);

  // ── enabled gate: hard early return (mirrors useVirtualList) ───────────────
  if (!enabled) {
    // totalHeight = sum of estimates (already computed via offsets, which use
    // estimates when the cache is empty). Not 0, so a consumer that keeps the
    // spacer wrappers still gets a sane scroll height.
    return {
      startIndex: 0,
      endIndex: itemCount,
      offsetY: 0,
      totalHeight,
      onScroll,
      measureRef: () => NOOP_REF,
      getItemOffset,
      scrollToIndex: () => {},
      scrollToBottom: () => {},
      isPinnedToBottom: () => false,
    };
  }

  // ── Windowing ──────────────────────────────────────────────────────────────
  const startIndex = findIndex(Math.max(0, scrollTop - overscanPx));
  const endIndex = Math.min(
    itemCount,
    findIndex(scrollTop + (viewportHeight || 0) + overscanPx) + 1,
  );
  const offsetY = offsets[startIndex];

  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    onScroll,
    measureRef,
    getItemOffset,
    scrollToIndex,
    scrollToBottom,
    isPinnedToBottom,
  };
}
