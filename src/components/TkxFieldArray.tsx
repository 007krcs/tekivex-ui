'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface TkxFieldArrayHelpers<T> {
  items: T[];
  /** Append a new item. */
  add: (item: T) => void;
  /** Remove by index. */
  remove: (index: number) => void;
  /** Replace one item by index. */
  update: (index: number, item: T) => void;
  /** Move an item from `from` to `to`. */
  move: (from: number, to: number) => void;
  /** Reset to the initial value (or to []). */
  reset: () => void;
  /** Stable id keyed to the item index — useful for React `key`. */
  keyOf: (index: number) => string;
}

export interface TkxFieldArrayProps<T> {
  /** Controlled list. When provided, the component is fully controlled. */
  value?: T[];
  /** Initial list when uncontrolled. Default []. */
  defaultValue?: T[];
  /** Called whenever the list changes. */
  onChange?: (next: T[]) => void;
  /** Maximum item count. Adding beyond this is a no-op. */
  max?: number;
  /** Minimum item count. Removing below this is a no-op. */
  min?: number;
  /** Render-prop receiving helpers. */
  children: (helpers: TkxFieldArrayHelpers<T>) => ReactNode;
}

/**
 * Headless array-of-items helper for biodata forms — siblings, education
 * records, languages known, references, anything repeatable. Pure logic; the
 * caller owns the visual layout via the children render-prop.
 *
 * Stable keys: `keyOf(index)` returns a string keyed off a per-mount counter
 * so React identity is preserved even when items are objects without ids.
 */
export function TkxFieldArray<T>({
  value,
  defaultValue,
  onChange,
  max,
  min = 0,
  children,
}: TkxFieldArrayProps<T>) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T[]>(defaultValue ?? []);
  const items = isControlled ? (value as T[]) : internal;
  const initialRef = useRef<T[]>(defaultValue ?? []);

  // Stable keys via a per-instance counter that grows but never shrinks.
  const keyMapRef = useRef<string[]>([]);
  const counterRef = useRef(0);
  // Ensure the key map stays the same length as items.
  useMemo(() => {
    while (keyMapRef.current.length < items.length) {
      counterRef.current += 1;
      keyMapRef.current.push(`fa_${counterRef.current}`);
    }
    if (keyMapRef.current.length > items.length) {
      keyMapRef.current = keyMapRef.current.slice(0, items.length);
    }
  }, [items.length]);

  const commit = useCallback(
    (next: T[]) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const add = useCallback(
    (item: T) => {
      if (max != null && items.length >= max) return;
      counterRef.current += 1;
      keyMapRef.current.push(`fa_${counterRef.current}`);
      commit([...items, item]);
    },
    [items, max, commit],
  );

  const remove = useCallback(
    (index: number) => {
      if (items.length <= min) return;
      const next = items.slice(0, index).concat(items.slice(index + 1));
      keyMapRef.current = keyMapRef.current
        .slice(0, index)
        .concat(keyMapRef.current.slice(index + 1));
      commit(next);
    },
    [items, min, commit],
  );

  const update = useCallback(
    (index: number, item: T) => {
      if (index < 0 || index >= items.length) return;
      const next = items.slice();
      next[index] = item;
      commit(next);
    },
    [items, commit],
  );

  const move = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length)
        return;
      const next = items.slice();
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      const [k] = keyMapRef.current.splice(from, 1);
      keyMapRef.current.splice(to, 0, k);
      commit(next);
    },
    [items, commit],
  );

  const reset = useCallback(() => {
    keyMapRef.current = [];
    counterRef.current = 0;
    commit(initialRef.current.slice());
  }, [commit]);

  const keyOf = useCallback(
    (index: number) =>
      keyMapRef.current[index] ?? `fa_${index}`,
    [],
  );

  return <>{children({ items, add, remove, update, move, reset, keyOf })}</>;
}

TkxFieldArray.displayName = 'TkxFieldArray';
