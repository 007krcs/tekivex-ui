'use client';

import { useState, useCallback, useRef, type KeyboardEvent } from 'react';

export interface UseRovingTabIndexOptions {
  count: number;
  initialIndex?: number;
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Wrap around at boundaries. Default: true */
  loop?: boolean;
}

export interface UseRovingTabIndexReturn {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  getItemProps: (index: number) => {
    tabIndex: number;
    onKeyDown: (e: KeyboardEvent) => void;
    onFocus: () => void;
    'data-focused': boolean;
  };
}

/**
 * Implements the WAI-ARIA roving tabIndex pattern for composite widgets
 * (toolbars, tab lists, radio groups, menu items, etc.)
 *
 * Only one item in the group is in the tab sequence at a time.
 * Arrow keys move focus within the group.
 *
 * @example
 * const { getItemProps } = useRovingTabIndex({ count: tabs.length });
 * return tabs.map((tab, i) => (
 *   <button key={tab.id} {...getItemProps(i)}>{tab.label}</button>
 * ));
 */
export function useRovingTabIndex({
  count,
  initialIndex = 0,
  orientation = 'horizontal',
  loop = true,
}: UseRovingTabIndexOptions): UseRovingTabIndexReturn {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const moveFocus = useCallback(
    (delta: number) => {
      setFocusedIndex(prev => {
        let next = prev + delta;
        if (loop) {
          next = ((next % count) + count) % count;
        } else {
          next = Math.max(0, Math.min(count - 1, next));
        }
        // Focus the element after state update
        requestAnimationFrame(() => {
          itemRefs.current[next]?.focus();
        });
        return next;
      });
    },
    [count, loop],
  );

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      'data-focused': index === focusedIndex,
      onFocus: () => setFocusedIndex(index),
      onKeyDown: (e: KeyboardEvent) => {
        const isHorizontal = orientation === 'horizontal' || orientation === 'both';
        const isVertical = orientation === 'vertical' || orientation === 'both';

        if (isHorizontal && e.key === 'ArrowRight') { e.preventDefault(); moveFocus(1); }
        if (isHorizontal && e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(-1); }
        if (isVertical && e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
        if (isVertical && e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1); }
        if (e.key === 'Home') { e.preventDefault(); setFocusedIndex(0); requestAnimationFrame(() => itemRefs.current[0]?.focus()); }
        if (e.key === 'End') { e.preventDefault(); setFocusedIndex(count - 1); requestAnimationFrame(() => itemRefs.current[count - 1]?.focus()); }
      },
    }),
    [focusedIndex, moveFocus, orientation, count],
  );

  return { focusedIndex, setFocusedIndex, getItemProps };
}