'use client';

import { useState, useId } from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { tkx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';

export interface TkxPaginationProps {
  total: number;
  pageSize?: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  siblingCount?: number;
  showEdges?: boolean;
  showPageSize?: boolean;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const SIZE_MAP = {
  sm: { height: 28, minWidth: 28, fontSize: '0.75rem', px: 8 },
  md: { height: 36, minWidth: 36, fontSize: '0.875rem', px: 10 },
  lg: { height: 44, minWidth: 44, fontSize: '1rem', px: 12 },
};

const ELLIPSIS = '…';

function buildPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  showEdges: boolean,
): (number | typeof ELLIPSIS)[] {
  if (totalPages <= 1) return [1];

  const range = (lo: number, hi: number): number[] =>
    Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

  const siblingStart = Math.max(currentPage - siblingCount, 1);
  const siblingEnd = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = siblingStart > 2;
  const showRightEllipsis = siblingEnd < totalPages - 1;

  if (!showEdges) {
    const pages: (number | typeof ELLIPSIS)[] = [];
    if (showLeftEllipsis) pages.push(ELLIPSIS);
    pages.push(...range(siblingStart, siblingEnd));
    if (showRightEllipsis) pages.push(ELLIPSIS);
    return pages;
  }

  const pages: (number | typeof ELLIPSIS)[] = [1];

  if (showLeftEllipsis) {
    pages.push(ELLIPSIS);
  } else {
    for (let i = 2; i < siblingStart; i++) pages.push(i);
  }

  pages.push(...range(siblingStart, siblingEnd));

  if (showRightEllipsis) {
    pages.push(ELLIPSIS);
  } else {
    for (let i = siblingEnd + 1; i < totalPages; i++) pages.push(i);
  }

  if (totalPages > 1) pages.push(totalPages);

  // deduplicate preserving order
  const seen = new Set<number | typeof ELLIPSIS>();
  const result: (number | typeof ELLIPSIS)[] = [];
  for (const p of pages) {
    const key = p === ELLIPSIS ? `${ELLIPSIS}${result.length}` : p;
    if (!seen.has(p === ELLIPSIS ? (key as unknown as typeof ELLIPSIS) : p)) {
      seen.add(p === ELLIPSIS ? (key as unknown as typeof ELLIPSIS) : p);
      result.push(p);
    }
  }
  return result;
}

function buildPages(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  showEdges: boolean,
): (number | string)[] {
  if (totalPages <= 1) return [1];

  const range = (lo: number, hi: number): number[] =>
    Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => lo + i);

  const siblingStart = Math.max(currentPage - siblingCount, 1);
  const siblingEnd = Math.min(currentPage + siblingCount, totalPages);

  if (!showEdges) {
    const pages: (number | string)[] = [];
    if (siblingStart > 1) pages.push('...');
    pages.push(...range(siblingStart, siblingEnd));
    if (siblingEnd < totalPages) pages.push('...');
    return pages;
  }

  const leftBoundary = 1;
  const rightBoundary = totalPages;

  const showLeftEllipsis = siblingStart > leftBoundary + 2;
  const showRightEllipsis = siblingEnd < rightBoundary - 2;

  const result: (number | string)[] = [];
  result.push(1);

  if (showLeftEllipsis) {
    result.push('left-ellipsis');
  } else {
    result.push(...range(2, siblingStart - 1));
  }

  result.push(...range(Math.max(siblingStart, 2), Math.min(siblingEnd, totalPages - 1)));

  if (showRightEllipsis) {
    result.push('right-ellipsis');
  } else {
    result.push(...range(siblingEnd + 1, totalPages - 1));
  }

  if (totalPages > 1) result.push(totalPages);

  // deduplicate numbers
  const seen = new Set<number>();
  const deduped: (number | string)[] = [];
  for (const p of result) {
    if (typeof p === 'number') {
      if (!seen.has(p)) { seen.add(p); deduped.push(p); }
    } else {
      deduped.push(p);
    }
  }
  return deduped;
  void buildPageRange;
}

export function TkxPagination({
  total,
  pageSize: pageSizeProp = 10,
  page,
  defaultPage = 1,
  onChange,
  siblingCount = 1,
  showEdges = true,
  showPageSize = false,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  size = 'md',
  variant = 'default',
}: TkxPaginationProps) {
  const theme = useTheme();
  const t = useLocale();
  const selectId = useId();

  // i18n strings with English fallbacks. The optional locale fields
  // (firstPage, lastPage, etc.) land gradually across the 44 locales —
  // until then, fall back to the existing strings or English.
  // Individual page buttons keep the "Page N" pattern for screen-reader
  // brevity (saying "Page 1 of 5" on every button is too noisy).
  const labels = {
    pagination: 'Pagination',
    firstPage: t.firstPage ?? 'First page',
    lastPage: t.lastPage ?? 'Last page',
    previousPage: t.previousPage ?? 'Previous page',
    nextPage: t.nextPage ?? 'Next page',
    pageN: (n: number) => `Page ${n}`,
    showing: (s: number, e: number, total: number) =>
      t.showingRange ? t.showingRange(s, e, total) : `Showing ${s}–${e} of ${total} items`,
  };

  const isControlled = page !== undefined;
  const [internalPage, setInternalPage] = useState(defaultPage);
  const currentPage = isControlled ? page! : internalPage;

  const [internalPageSize, setInternalPageSize] = useState(pageSizeProp);
  const pageSize = pageSizeProp;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goTo = (p: number) => {
    const next = Math.min(Math.max(p, 1), totalPages);
    if (next === currentPage) return;
    if (!isControlled) setInternalPage(next);
    onChange?.(next);
  };

  const handlePageSizeChange = (newSize: number) => {
    setInternalPageSize(newSize);
    onPageSizeChange?.(newSize);
    goTo(1);
  };

  const pages = buildPages(currentPage, totalPages, siblingCount, showEdges);
  const s = SIZE_MAP[size];

  const itemStart = Math.min((currentPage - 1) * pageSize + 1, total);
  const itemEnd = Math.min(currentPage * pageSize, total);

  const getButtonStyle = (isActive: boolean, isDisabled: boolean) => {
    const base: React.CSSProperties = {
      height: s.height,
      minWidth: s.minWidth,
      paddingLeft: s.px,
      paddingRight: s.px,
      fontSize: s.fontSize,
      borderRadius: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      border: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      transition: 'background 120ms ease, color 120ms ease',
      opacity: isDisabled ? 0.4 : 1,
    };

    if (isActive) {
      return {
        ...base,
        backgroundColor: theme.primary,
        color: theme.bg,
        fontWeight: 600,
        boxShadow: `0 0 0 2px ${theme.primary}44`,
      };
    }

    if (variant === 'default') {
      return {
        ...base,
        backgroundColor: theme.surface,
        color: theme.text,
        border: `1px solid ${theme.border}`,
      };
    }
    if (variant === 'outline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        color: theme.text,
        border: `1px solid ${theme.border}`,
      };
    }
    // ghost
    return {
      ...base,
      backgroundColor: 'transparent',
      color: theme.text,
    };
  };

  const NavIcon = ({ d }: { d: string }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points={d} />
    </svg>
  );

  return (
    <nav aria-label={labels.pagination} className={tkx('flex flex-col gap-2')}>
      {/* Showing X-Y of Z */}
      {total > 0 && (
        <p className={tkx('text-sm')} style={{ color: theme.textMuted, fontSize: s.fontSize }}>
          {sanitizeString(labels.showing(itemStart, itemEnd, total))}
        </p>
      )}

      <div className={tkx('flex items-center gap-1 flex-wrap')}>
        {/* First */}
        {showEdges && (
          <button
            type="button"
            aria-label={labels.firstPage}
            disabled={currentPage === 1}
            onClick={() => goTo(1)}
            style={getButtonStyle(false, currentPage === 1)}
          >
            <NavIcon d="15 18 9 12 15 6" />
            <NavIcon d="20 18 14 12 20 6" />
          </button>
        )}

        {/* Prev */}
        <button
          type="button"
          aria-label={labels.previousPage}
          disabled={currentPage === 1}
          onClick={() => goTo(currentPage - 1)}
          style={getButtonStyle(false, currentPage === 1)}
        >
          <NavIcon d="15 18 9 12 15 6" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) => {
          const isEllipsis = typeof p === 'string';
          if (isEllipsis) {
            return (
              <span
                key={`${p}-${idx}`}
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: s.minWidth,
                  height: s.height,
                  fontSize: s.fontSize,
                  color: theme.textMuted,
                  userSelect: 'none',
                }}
              >
                …
              </span>
            );
          }
          const pageNum = p as number;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              aria-label={labels.pageN(pageNum)}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => goTo(pageNum)}
              style={getButtonStyle(isActive, false)}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          aria-label={labels.nextPage}
          disabled={currentPage === totalPages}
          onClick={() => goTo(currentPage + 1)}
          style={getButtonStyle(false, currentPage === totalPages)}
        >
          <NavIcon d="9 18 15 12 9 6" />
        </button>

        {/* Last */}
        {showEdges && (
          <button
            type="button"
            aria-label={labels.lastPage}
            disabled={currentPage === totalPages}
            onClick={() => goTo(totalPages)}
            style={getButtonStyle(false, currentPage === totalPages)}
          >
            <NavIcon d="4 18 10 12 4 6" />
            <NavIcon d="14 18 20 12 14 6" />
          </button>
        )}

        {/* Page size selector */}
        {showPageSize && (
          <div className={tkx('flex items-center gap-2 ml-2')}>
            <label
              htmlFor={selectId}
              className={tkx('text-sm')}
              style={{ color: theme.textMuted, fontSize: s.fontSize, whiteSpace: 'nowrap' }}
            >
              Rows per page
            </label>
            <select
              id={selectId}
              value={internalPageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              style={{
                height: s.height,
                paddingLeft: s.px,
                paddingRight: s.px,
                fontSize: s.fontSize,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                color: theme.text,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </nav>
  );
}

TkxPagination.displayName = 'TkxPagination';