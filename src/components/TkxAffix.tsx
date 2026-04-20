'use client';

import { type ReactNode, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TkxAffixProps {
  children: ReactNode;
  offsetTop?: number;
  offsetBottom?: number;
  onChange?: (affixed: boolean) => void;
  target?: () => HTMLElement | Window;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getScrollTarget(target?: () => HTMLElement | Window): HTMLElement | Window {
  if (target) {
    try {
      return target();
    } catch {
      return window;
    }
  }
  return window;
}

function getTargetRect(el: HTMLElement | Window): { top: number; bottom: number } {
  if (el instanceof Window) {
    return { top: 0, bottom: el.innerHeight };
  }
  const rect = el.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom };
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxAffix({
  children,
  offsetTop,
  offsetBottom,
  onChange,
  target,
}: TkxAffixProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const placeholderRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const [affixed, setAffixed] = useState(false);
  const [placeholderSize, setPlaceholderSize] = useState({ width: 0, height: 0 });
  const prevAffixed = useRef(false);

  // Sanitize any debug info strings for security
  const _labelSafe = useMemo(() => sanitizeString('Sticky content'), []);

  const checkPosition = useCallback(() => {
    const el = placeholderRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const targetRect = getTargetRect(getScrollTarget(target));
    let shouldAffix = false;

    if (offsetTop !== undefined) {
      // Affix when element scrolls past the top offset
      shouldAffix = rect.top - targetRect.top <= offsetTop;
    } else if (offsetBottom !== undefined) {
      // Affix when element scrolls past the bottom offset
      shouldAffix = targetRect.bottom - rect.bottom <= offsetBottom;
    }

    if (shouldAffix !== prevAffixed.current) {
      prevAffixed.current = shouldAffix;
      setAffixed(shouldAffix);
      setPlaceholderSize({
        width: rect.width,
        height: rect.height,
      });
      onChange?.(shouldAffix);
    }
  }, [offsetTop, offsetBottom, onChange, target]);

  // Attach scroll and resize listeners
  useEffect(() => {
    const scrollTarget = getScrollTarget(target);

    checkPosition();
    scrollTarget.addEventListener('scroll', checkPosition, { passive: true });
    window.addEventListener('resize', checkPosition);

    return () => {
      scrollTarget.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
    };
  }, [checkPosition, target]);

  // Build the fixed positioning styles
  const fixedStyle: React.CSSProperties = affixed
    ? {
        position: 'fixed',
        zIndex: 100,
        ...(offsetTop !== undefined ? { top: offsetTop } : {}),
        ...(offsetBottom !== undefined ? { bottom: offsetBottom } : {}),
        width: placeholderSize.width || undefined,
        transition: reducedMotion ? 'none' : 'box-shadow 0.2s ease',
        boxShadow: `0 2px 8px ${theme.border}`,
      }
    : {};

  // Placeholder keeps the document flow intact when element is fixed
  const placeholderStyle: React.CSSProperties = affixed
    ? {
        height: placeholderSize.height,
        width: placeholderSize.width,
      }
    : {};

  return (
    <>
      <div
        ref={placeholderRef}
        aria-hidden={affixed}
        style={placeholderStyle}
      />
      <div
        ref={fixedRef}
        role="region"
        aria-label={_labelSafe}
        className={tkx(affixed ? 'tkx-affixed' : '')}
        style={fixedStyle}
      >
        {children}
      </div>
    </>
  );
}