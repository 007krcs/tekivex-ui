'use client';

import { useState, useCallback, useMemo } from 'react';

export interface UseListSelectionOptions {
  items: string[];
  initialSelected?: string[];
  /** Allow selecting multiple items. Default: true */
  multiple?: boolean;
}

export interface UseListSelectionReturn {
  selected: Set<string>;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  selectedCount: number;
  selectedArray: string[];
}

/**
 * Manages selection state for lists, tables, and grids.
 * Supports single and multi-select modes.
 *
 * @example
 * const { isSelected, toggle, selectedArray } = useListSelection({ items: rows.map(r => r.id) });
 */
export function useListSelection({
  items,
  initialSelected = [],
  multiple = true,
}: UseListSelectionOptions): UseListSelectionReturn {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelected));

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }, [multiple]);

  const select = useCallback((id: string) => {
    setSelected(prev => {
      if (prev.has(id)) return prev;
      const next = multiple ? new Set(prev) : new Set<string>();
      next.add(id);
      return next;
    });
  }, [multiple]);

  const deselect = useCallback((id: string) => {
    setSelected(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (multiple) setSelected(new Set(items));
  }, [items, multiple]);

  const deselectAll = useCallback(() => setSelected(new Set()), []);

  const toggleAll = useCallback(() => {
    setSelected(prev => {
      const allSel = items.every(id => prev.has(id));
      return allSel ? new Set() : new Set(items);
    });
  }, [items]);

  const allSelected = items.length > 0 && items.every(id => selected.has(id));
  const someSelected = items.some(id => selected.has(id));
  const selectedArray = useMemo(() => Array.from(selected), [selected]);

  return {
    selected,
    isSelected: useCallback((id: string) => selected.has(id), [selected]),
    toggle,
    select,
    deselect,
    selectAll,
    deselectAll,
    toggleAll,
    allSelected,
    someSelected,
    selectedCount: selected.size,
    selectedArray,
  };
}