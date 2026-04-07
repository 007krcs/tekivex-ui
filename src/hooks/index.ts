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
    const trap = createFocusTrap(ref.current);
    trap.activate();
    return () => trap.deactivate();
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
