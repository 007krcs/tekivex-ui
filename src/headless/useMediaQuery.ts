'use client';

import { useState, useEffect } from 'react';

/**
 * Reactive media query hook. Returns true while the query matches.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 * const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Preset breakpoint hooks matching TekiVex's breakpoint scale. */
export function useBreakpoint() {
  const sm = useMediaQuery('(min-width: 640px)');
  const md = useMediaQuery('(min-width: 768px)');
  const lg = useMediaQuery('(min-width: 1024px)');
  const xl = useMediaQuery('(min-width: 1280px)');
  const xxl = useMediaQuery('(min-width: 1536px)');
  return { sm, md, lg, xl, xxl, isMobile: !sm, isTablet: sm && !lg, isDesktop: lg };
}