import { useState, useCallback } from 'react';

/**
 * Persists state to localStorage. Falls back to in-memory on parse errors or
 * SSR (where localStorage is unavailable).
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(next));
          } catch {
            // Quota exceeded or private browsing — silently ignore
          }
        }
        return next;
      });
    },
    [key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(key); } catch { /* ignore */ }
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
