import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Returns a throttled version of the value — updates at most once per interval.
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const remaining = interval - (now - lastUpdated.current);
    if (remaining <= 0) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Returns a throttled callback — executes at most once per interval.
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  interval: number,
): (...args: Parameters<T>) => void {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const lastCalledRef = useRef(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCalledRef.current >= interval) {
      lastCalledRef.current = now;
      fnRef.current(...args);
    }
  }, [interval]);
}
