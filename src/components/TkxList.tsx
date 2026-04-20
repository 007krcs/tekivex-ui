'use client';

import { type ReactNode } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ListItem {
  key: string;
  title: string;
  description?: string;
  avatar?: ReactNode;
  actions?: ReactNode;
  extra?: ReactNode;
}

export interface TkxListProps {
  items: ListItem[];
  header?: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  emptyText?: string;
  grid?: { column?: number; gutter?: number };
}

// ── Size Tokens ──────────────────────────────────────────────────────────────

const SIZE_PADDING = {
  sm: '8px 12px',
  md: '12px 16px',
  lg: '16px 20px',
} as const;

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton({ theme, reducedMotion }: { theme: ReturnType<typeof useTheme>; reducedMotion: boolean }) {
  return (
    <div className={tkx('flex items-center gap-3 px-4 py-3')} aria-hidden="true">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: theme.surfaceAlt,
          animation: reducedMotion ? 'none' : 'tkxPulse 1.5s ease infinite',
        }}
      />
      <div className={tkx('flex-1')}>
        <div
          style={{
            width: '60%',
            height: 14,
            borderRadius: 4,
            backgroundColor: theme.surfaceAlt,
            marginBottom: 8,
            animation: reducedMotion ? 'none' : 'tkxPulse 1.5s ease infinite',
          }}
        />
        <div
          style={{
            width: '40%',
            height: 12,
            borderRadius: 4,
            backgroundColor: theme.surfaceAlt,
            animation: reducedMotion ? 'none' : 'tkxPulse 1.5s ease infinite',
          }}
        />
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxList({
  items,
  header,
  footer,
  bordered = true,
  size = 'md',
  loading = false,
  emptyText = 'No data',
  grid,
}: TkxListProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const safeEmptyText = sanitizeString(emptyText);
  const padding = SIZE_PADDING[size];

  const isGrid = !!grid;
  const columns = grid?.column ?? 1;
  const gutter = grid?.gutter ?? 16;

  return (
    <div
      role="list"
      aria-label="List"
      aria-busy={loading}
      className={tkx('font-sans rounded-lg overflow-hidden')}
      style={{
        border: bordered ? `1px solid ${theme.border}` : 'none',
        backgroundColor: theme.surface,
      }}
    >
      {/* Header */}
      {header && (
        <div
          className={tkx('font-semibold text-sm')}
          style={{
            padding,
            color: theme.text,
            borderBottom: `1px solid ${theme.border}`,
            backgroundColor: theme.surfaceAlt,
          }}
        >
          {header}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} theme={theme} reducedMotion={reducedMotion} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div
          role="status"
          className={tkx('text-center py-12 text-sm')}
          style={{ color: theme.textMuted }}
        >
          {safeEmptyText}
        </div>
      )}

      {/* Items */}
      {!loading && items.length > 0 && (
        <div
          style={
            isGrid
              ? {
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: gutter,
                  padding: gutter,
                }
              : undefined
          }
        >
          {items.map((item, idx) => {
            const safeTitle = sanitizeString(item.title);
            const safeDesc = item.description ? sanitizeString(item.description) : undefined;

            return (
              <div
                key={item.key}
                role="listitem"
                className={tkx('flex items-start gap-3')}
                style={{
                  padding: isGrid ? padding : padding,
                  borderBottom:
                    !isGrid && idx < items.length - 1
                      ? `1px solid ${theme.border}`
                      : 'none',
                  ...(isGrid
                    ? {
                        border: `1px solid ${theme.border}`,
                        borderRadius: 8,
                        backgroundColor: theme.surface,
                      }
                    : {}),
                  animation: reducedMotion ? 'none' : `tkxFadeIn 0.2s ease ${idx * 0.03}s both`,
                }}
              >
                {/* Avatar */}
                {item.avatar && (
                  <div aria-hidden="true" className={tkx('shrink-0')}>
                    {item.avatar}
                  </div>
                )}

                {/* Content */}
                <div className={tkx('flex-1 min-w-0')}>
                  <div
                    className={tkx('text-sm font-medium')}
                    style={{ color: theme.text }}
                  >
                    {safeTitle}
                  </div>
                  {safeDesc && (
                    <div
                      className={tkx('text-xs mt-1 leading-relaxed')}
                      style={{ color: theme.textMuted }}
                    >
                      {safeDesc}
                    </div>
                  )}
                </div>

                {/* Extra */}
                {item.extra && (
                  <div className={tkx('shrink-0 ml-auto')} style={{ color: theme.textMuted }}>
                    {item.extra}
                  </div>
                )}

                {/* Actions */}
                {item.actions && (
                  <div className={tkx('shrink-0 flex items-center gap-2')}>
                    {item.actions}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div
          className={tkx('text-sm')}
          style={{
            padding,
            color: theme.textMuted,
            borderTop: `1px solid ${theme.border}`,
            backgroundColor: theme.surfaceAlt,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}