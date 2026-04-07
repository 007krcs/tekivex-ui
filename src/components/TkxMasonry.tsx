import {
  useState,
  useEffect,
  useMemo,
  Children,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TkxMasonryProps {
  columns?: number | { sm?: number; md?: number; lg?: number };
  gap?: number;
  children: ReactNode;
}

// ── Breakpoint constants ────────────────────────────────────────────────────

const BREAKPOINTS = {
  sm: 0,
  md: 768,
  lg: 1024,
};

// ── Breakpoint hook ─────────────────────────────────────────────────────────

function useBreakpoint(): 'sm' | 'md' | 'lg' {
  const [bp, setBp] = useState<'sm' | 'md' | 'lg'>(() => {
    if (typeof window === 'undefined') return 'lg';
    const w = window.innerWidth;
    if (w >= BREAKPOINTS.lg) return 'lg';
    if (w >= BREAKPOINTS.md) return 'md';
    return 'sm';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = () => {
      const w = window.innerWidth;
      if (w >= BREAKPOINTS.lg) setBp('lg');
      else if (w >= BREAKPOINTS.md) setBp('md');
      else setBp('sm');
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return bp;
}

// ── Resolve column count ────────────────────────────────────────────────────

function resolveColumns(
  columns: number | { sm?: number; md?: number; lg?: number } | undefined,
  breakpoint: 'sm' | 'md' | 'lg',
): number {
  if (columns === undefined) return 3;
  if (typeof columns === 'number') return Math.max(1, columns);

  // Resolve responsive: fall back from current breakpoint to smaller ones
  if (breakpoint === 'lg') {
    return columns.lg ?? columns.md ?? columns.sm ?? 3;
  }
  if (breakpoint === 'md') {
    return columns.md ?? columns.sm ?? 2;
  }
  return columns.sm ?? 1;
}

// ── Keyframe injection ──────────────────────────────────────────────────────

let injected = false;
function injectKeyframes() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.id = 'tkx-masonry-kf';
  style.textContent = `
    @keyframes tkx-masonry-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxMasonry({
  columns,
  gap = 16,
  children,
}: TkxMasonryProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const breakpoint = useBreakpoint();

  // Inject keyframes once
  useEffect(() => {
    injectKeyframes();
  }, []);

  const colCount = resolveColumns(columns, breakpoint);

  // ── Distribute children into columns ────────────────────────────────────

  const childArray = Children.toArray(children);

  const columnBuckets = useMemo(() => {
    const buckets: ReactNode[][] = Array.from({ length: colCount }, () => []);

    childArray.forEach((child, i) => {
      // Round-robin distribution to approximate masonry layout
      buckets[i % colCount].push(child);
    });

    return buckets;
  }, [childArray, colCount]);

  // ── Animation style per item ────────────────────────────────────────────

  const itemAnimation = (index: number): CSSProperties => {
    if (reduced) return {};
    return {
      animation: `tkx-masonry-fade-in 300ms cubic-bezier(0.16,1,0.3,1) both`,
      animationDelay: `${Math.min(index * 40, 400)}ms`,
    };
  };

  // ── CSS-columns approach ────────────────────────────────────────────────
  // Using a flex-based column approach for more predictable layout

  return (
    <div
      role="list"
      aria-label="Masonry grid"
      className={tkx('flex w-full')}
      style={{
        gap,
        alignItems: 'flex-start',
      }}
    >
      {columnBuckets.map((bucket, colIndex) => (
        <div
          key={colIndex}
          className={tkx('flex flex-col')}
          style={{
            flex: 1,
            gap,
            minWidth: 0,
          }}
        >
          {bucket.map((child, itemIndex) => {
            const globalIndex = itemIndex * colCount + colIndex;
            return (
              <div
                key={itemIndex}
                role="listitem"
                style={itemAnimation(globalIndex)}
              >
                {child}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
