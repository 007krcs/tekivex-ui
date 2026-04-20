'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Unified controlled/uncontrolled state management.
 * The component accepts both a controlled `value` + `onChange` pair
 * OR works standalone with internal state when they're not provided.
 *
 * This is the same pattern used by Radix UI, Mantine, and Ant Design internally.
 *
 * @example — in a custom Select component:
 * const [currentValue, setCurrentValue] = useControllable({
 *   value: props.value,       // may be undefined (uncontrolled)
 *   onChange: props.onChange, // may be undefined
 *   defaultValue: '',
 * });
 */
export function useControllable<T>({
  value,
  onChange,
  defaultValue,
}: {
  value?: T;
  onChange?: (value: T) => void;
  defaultValue: T;
}): [T, (next: T) => void] {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternalValue(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [isControlled ? value! : internalValue, setValue];
}