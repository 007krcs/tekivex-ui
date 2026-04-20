'use client';

import { useState, useEffect, useRef, type RefObject } from 'react';

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  /** Unobserve after first intersection (useful for lazy-load). Default: false */
  once?: boolean;
}

export interface UseIntersectionObserverReturn {
  ref: RefObject<HTMLElement | null>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Observe when an element enters or leaves the viewport.
 * Perfect for lazy loading, infinite scroll, and scroll-triggered animations.
 *
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
 * return <div ref={ref} style={{ opacity: isIntersecting ? 1 : 0 }}>Animated content</div>;
 */
export function useIntersectionObserver({
  threshold = 0,
  rootMargin = '0px',
  root = null,
  once = false,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const ref = useRef<HTMLElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      ([e]) => {
        setEntry(e);
        if (once && e.isIntersecting) observerRef.current?.unobserve(el);
      },
      { threshold, rootMargin, root },
    );
    observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, [threshold, rootMargin, root, once]);

  return { ref, isIntersecting: entry?.isIntersecting ?? false, entry };
}