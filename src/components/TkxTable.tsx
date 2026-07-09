'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { TkxSkeleton } from './TkxSkeleton';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | 'none';

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  width?: string;
  sortable?: boolean;
}

export interface TkxTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  caption?: string;
  sortable?: boolean;
  stickyHeader?: boolean;
  isLoading?: boolean;
  emptyState?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  striped?: boolean;
  // Virtual scroll
  maxHeight?: number | string;
  rowHeight?: number;
  virtualScroll?: boolean;
  // Infinite scroll
  onLoadMore?: () => void | Promise<void>;
  hasMore?: boolean;
  loadingMore?: boolean;
  // Row interaction
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: number[];
  // Appearance
  bordered?: boolean;
  compact?: boolean;
}

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir: SortDirection }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={tkx('shrink-0')}
    >
      {dir === 'asc' ? (
        <path d="M7 14l5-5 5 5H7z" />
      ) : dir === 'desc' ? (
        <path d="M7 10l5 5 5-5H7z" />
      ) : (
        <path d="M7 10l5 5 5-5H7zM7 14l5-5 5 5H7z" opacity="0.4" />
      )}
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxTable<T extends Record<string, unknown>>({
  columns: columns_,
  data: data_,
  caption,
  sortable,
  stickyHeader,
  isLoading,
  emptyState,
  style,
  className,
  striped,
  maxHeight,
  rowHeight = 44,
  virtualScroll,
  onLoadMore,
  hasMore,
  loadingMore = false,
  onRowClick,
  selectedRows,
  bordered,
  compact,
}: TkxTableProps<T>) {
  const theme = useTheme();

  // Guard against missing array props (e.g. mounted before data is wired).
  const columns = columns_ ?? [];
  const data = data_ ?? [];

  // ── Sort ───────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey || !sortable) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
      else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, sortable]);

  const handleSort = useCallback(
    (key: keyof T) => {
      if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      else { setSortKey(key); setSortDir('asc'); }
    },
    [sortKey],
  );

  function getDir(key: keyof T): SortDirection {
    return sortKey !== key ? 'none' : sortDir;
  }

  // ── Virtual scroll ─────────────────────────────────────────────────────
  const OVERSCAN = 5;
  const isVirtual =
    virtualScroll !== undefined
      ? virtualScroll
      : maxHeight !== undefined && sorted.length >= 50;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    if (!isVirtual || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    setContainerHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isVirtual]);

  const startIndex = isVirtual
    ? Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN)
    : 0;
  const endIndex = isVirtual
    ? Math.min(sorted.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + OVERSCAN)
    : sorted.length;

  const visibleRows = isVirtual ? sorted.slice(startIndex, endIndex) : sorted;

  // ── Infinite scroll ────────────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);

  // Reset debounce flag when data.length changes (new data arrived)
  useEffect(() => {
    loadingRef.current = false;
  }, [data.length]);

  useEffect(() => {
    if (!onLoadMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loadingRef.current && hasMore !== false) {
          loadingRef.current = true;
          onLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLoadMore, hasMore]);

  // ── Styles ─────────────────────────────────────────────────────────────
  const py = compact ? '4px' : '12px';
  const px = compact ? '8px' : '16px';
  const borderStyle = bordered ? `1px solid ${theme.border}` : 'none';
  const selectedSet = useMemo(() => new Set(selectedRows ?? []), [selectedRows]);

  return (
    <div
      className={tkx('w-full rounded-lg', className ?? '')}
      style={{ border: `1px solid ${theme.border}`, overflow: 'hidden', ...style }}
    >
      <div
        ref={scrollContainerRef}
        onScroll={isVirtual ? handleScroll : undefined}
        style={{
          overflowX: 'auto',
          overflowY: maxHeight ? 'auto' : 'visible',
          maxHeight: maxHeight ?? 'none',
        }}
      >
        <table
          className={tkx('w-full font-sans text-sm')}
          // In virtual mode off-window rows are removed from the DOM and the
          // rendered rows carry aria-rowindex, so declare the FULL row count
          // to let AT compute total size/position. Omitted when all rows are
          // in the DOM (no windowing → count is self-evident).
          aria-rowcount={isVirtual ? sorted.length : undefined}
          style={{ borderCollapse: 'collapse', color: theme.text }}
        >
          {caption && (
            <caption
              className={tkx('text-sm text-left p-2')}
              style={{ color: theme.textMuted }}
            >
              {sanitizeString(caption)}
            </caption>
          )}

          {/* ── Header ─────────────────────────────────────────────── */}
          <thead
            style={
              stickyHeader
                ? { position: 'sticky', top: 0, backgroundColor: theme.surfaceAlt, zIndex: 1 }
                : { backgroundColor: theme.surfaceAlt }
            }
          >
            <tr>
              {columns.map((col) => {
                const canSort = sortable && col.sortable !== false;
                const dir = getDir(col.key);
                return (
                  <th
                    key={String(col.key)}
                    scope="col"
                    aria-sort={
                      canSort
                        ? dir === 'none'
                          ? 'none'
                          : dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={tkx(
                      'text-left font-semibold whitespace-nowrap',
                      canSort ? 'cursor-pointer select-none' : '',
                    )}
                    style={{
                      padding: `${py} ${px}`,
                      color: theme.textMuted,
                      borderBottom: `2px solid ${theme.border}`,
                      borderRight: borderStyle,
                      width: col.width,
                    }}
                    onClick={() => canSort && handleSort(col.key)}
                    onKeyDown={(e) => {
                      if (canSort && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(col.key);
                      }
                    }}
                    tabIndex={canSort ? 0 : undefined}
                  >
                    <span className={tkx('inline-flex items-center gap-1.5')}>
                      {sanitizeString(col.header)}
                      {canSort && <SortIcon dir={dir} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Body ──────────────────────────────────────────────── */}
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col.key)} style={{ padding: `${py} ${px}` }}>
                      <TkxSkeleton variant="text" height="16px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={tkx('text-center')}
                  style={{ padding: '32px 16px', color: theme.textMuted }}
                >
                  {emptyState ?? 'No data available'}
                </td>
              </tr>
            ) : (
              <>
                {/* Top spacer for virtual scroll */}
                {isVirtual && startIndex > 0 && (
                  <tr aria-hidden="true" style={{ height: startIndex * rowHeight }}>
                    <td colSpan={columns.length} style={{ padding: 0, border: 'none' }} />
                  </tr>
                )}

                {visibleRows.map((row, i) => {
                  const rowIndex = startIndex + i;
                  const isSelected = selectedSet.has(rowIndex);
                  return (
                    <tr
                      key={rowIndex}
                      aria-rowindex={rowIndex + 1}
                      aria-selected={isSelected || undefined}
                      onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                      onKeyDown={
                        onRowClick
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onRowClick(row, rowIndex);
                              }
                            }
                          : undefined
                      }
                      tabIndex={onRowClick ? 0 : undefined}
                      className={tkx(onRowClick ? 'cursor-pointer' : '')}
                      style={{
                        backgroundColor: isSelected
                          ? `${theme.primary}22`
                          : striped && rowIndex % 2 === 1
                          ? theme.surfaceAlt
                          : 'transparent',
                        borderBottom: `1px solid ${theme.border}`,
                        ...(isVirtual ? { height: rowHeight, boxSizing: 'border-box' as const } : {}),
                      }}
                    >
                      {columns.map((col) => {
                        const raw = row[col.key];
                        const cell = col.render
                          ? col.render(raw, row)
                          : typeof raw === 'string'
                          ? sanitizeString(raw)
                          : String(raw ?? '');
                        return (
                          <td
                            key={String(col.key)}
                            style={{
                              padding: `${py} ${px}`,
                              color: theme.text,
                              borderRight: borderStyle,
                            }}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Bottom spacer for virtual scroll */}
                {isVirtual && endIndex < sorted.length && (
                  <tr
                    aria-hidden="true"
                    style={{ height: (sorted.length - endIndex) * rowHeight }}
                  >
                    <td colSpan={columns.length} style={{ padding: 0, border: 'none' }} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>

        {/* ── Infinite scroll sentinel ─────────────────────────────── */}
        {(hasMore || loadingMore) && (
          <div ref={sentinelRef} style={{ height: 1, width: '100%' }}>
            {loadingMore && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Array.from({ length: 3 }, (_, i) => (
                    <tr key={i}>
                      {columns.map((col) => (
                        <td key={String(col.key)} style={{ padding: '10px 16px' }}>
                          <TkxSkeleton variant="text" height="16px" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {!hasMore && onLoadMore && (
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              fontSize: 13,
              color: theme.textMuted,
            }}
          >
            ✓ All rows loaded
          </div>
        )}
      </div>
    </div>
  );
}