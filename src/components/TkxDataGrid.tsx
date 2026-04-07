import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useId,
  useEffect,
  type ReactNode,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { TkxSkeleton } from './TkxSkeleton';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DataGridColumn<T = any> {
  key: string;
  header: string;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  renderCell?: (value: any, row: T) => ReactNode;
  renderHeader?: (col: DataGridColumn<T>) => ReactNode;
  align?: 'left' | 'center' | 'right';
  pinned?: 'left' | 'right';
}

export interface TkxDataGridProps<T = any> {
  columns: DataGridColumn<T>[];
  data: T[];
  rowKey: string | ((row: T) => string);
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Enable column sorting. When true, clicks sort data client-side unless onSort is also provided. */
  sortable?: boolean;
  /** External sort handler. When provided, raw data is NOT sorted internally — you must pass pre-sorted data. */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  maxHeight?: number | string;
  onRowClick?: (row: T) => void;
  /** Enable virtual scrolling. Defaults to auto (enabled when data ≥ 50 rows and maxHeight is set). */
  virtualScroll?: boolean;
  /** Row height in pixels for virtual scrolling calculations. Default: 40 */
  rowHeight?: number;
  /** Show column filter inputs below the header row. */
  showFilters?: boolean;
  /** Controlled filter values keyed by column key. */
  filterValues?: Record<string, string>;
  /** Called when a column filter changes. */
  onFilterChange?: (key: string, value: string) => void;
  /** Rows per page for built-in pagination. Set to 0 to disable. Default: 0 (disabled). */
  pageSize?: number;
  /** Show a CSV export button in the toolbar. */
  showExport?: boolean;
  /** File name for CSV export (without .csv extension). Default: "export". */
  exportFileName?: string;
  /** Called when the user scrolls near the bottom. Use to fetch more data. */
  onLoadMore?: () => void | Promise<void>;
  /** Whether more data is available to load. When false, sentinel is hidden. */
  hasMore?: boolean;
  /** Show a loading skeleton at the bottom while fetching more data. */
  loadingMore?: boolean;
  /** How many pixels from the bottom to trigger onLoadMore. Default: 200 */
  loadMoreThreshold?: number;
}

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={tkx('shrink-0 ml-1')}
    >
      {direction === 'asc' ? (
        <path d="M7 14l5-5 5 5H7z" />
      ) : direction === 'desc' ? (
        <path d="M7 10l5 5 5-5H7z" />
      ) : (
        <path d="M7 10l5 5 5-5H7zM7 14l5-5 5 5H7z" opacity="0.35" />
      )}
    </svg>
  );
}

// ── Checkbox icon ─────────────────────────────────────────────────────────────

function CheckboxIcon({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  const theme = useTheme();
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="1" y="1" width="14" height="14" rx="2"
        fill={checked || indeterminate ? theme.primary : 'transparent'}
        stroke={checked || indeterminate ? theme.primary : theme.border}
        strokeWidth="1.5"
      />
      {indeterminate && (
        <line x1="4" y1="8" x2="12" y2="8" stroke={theme.bg} strokeWidth="2" />
      )}
      {checked && !indeterminate && (
        <path d="M4.5 8L7 10.5L11.5 5.5" fill="none" stroke={theme.bg} strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRowId<T>(row: T, rowKey: string | ((row: T) => string)): string {
  if (typeof rowKey === 'function') return rowKey(row);
  return String((row as Record<string, unknown>)[rowKey]);
}

function getCellValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function escapeCSV(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ── Loading skeleton ────────────────────────────────────────────────────────

function LoadingOverlay({ colCount }: { colCount: number }) {
  const theme = useTheme();
  return (
    <tbody>
      {Array.from({ length: 5 }, (_, r) => (
        <tr key={r}>
          {Array.from({ length: colCount }, (_, c) => (
            <td key={c} className={tkx('px-3 py-2')}
              style={{ borderBottom: `1px solid ${theme.border}` }}>
              <TkxSkeleton height={16} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

function GridToolbar({
  label,
  showExport,
  onExport,
  totalRows,
  selectedCount,
  theme,
}: {
  label: string;
  showExport: boolean;
  onExport: () => void;
  totalRows: number;
  selectedCount: number;
  theme: ReturnType<typeof useTheme>;
}) {
  if (!showExport && selectedCount === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.surface,
        gap: 8,
      }}
    >
      <span style={{ fontSize: 13, color: theme.textMuted }}>
        {selectedCount > 0
          ? `${selectedCount} of ${totalRows} row${totalRows !== 1 ? 's' : ''} selected`
          : `${totalRows} row${totalRows !== 1 ? 's' : ''}`}
      </span>
      {showExport && (
        <button
          onClick={onExport}
          aria-label={`Export ${label} as CSV`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 6,
            border: `1px solid ${theme.border}`,
            backgroundColor: 'transparent',
            color: theme.text,
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      )}
    </div>
  );
}

// ── Pagination Bar ────────────────────────────────────────────────────────────

function PaginationBar({
  page,
  totalPages,
  pageSize,
  totalRows,
  onPageChange,
  theme,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (p: number) => void;
  theme: ReturnType<typeof useTheme>;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalRows);
  const btnBase: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 6, border: `1px solid ${theme.border}`,
    backgroundColor: 'transparent', color: theme.text, cursor: 'pointer',
    fontSize: 13, fontWeight: 500,
  };
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme.surface, gap: 8, flexWrap: 'wrap',
      }}
      role="navigation"
      aria-label="Pagination"
    >
      <span style={{ fontSize: 13, color: theme.textMuted }}>
        {totalRows === 0 ? '0 rows' : `${start}–${end} of ${totalRows}`}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="First page"
          style={{ ...btnBase, opacity: page === 1 ? 0.4 : 1 }}
        >
          «
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          style={{ ...btnBase, opacity: page === 1 ? 0.4 : 1 }}
        >
          ‹
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 5) {
            const half = Math.floor(5 / 2);
            const start2 = Math.max(1, Math.min(page - half, totalPages - 4));
            p = start2 + i;
          }
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              style={{
                ...btnBase,
                backgroundColor: p === page ? theme.primary : 'transparent',
                color: p === page ? theme.bg : theme.text,
                borderColor: p === page ? theme.primary : theme.border,
              }}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          style={{ ...btnBase, opacity: page === totalPages ? 0.4 : 1 }}
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
          style={{ ...btnBase, opacity: page === totalPages ? 0.4 : 1 }}
        >
          »
        </button>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxDataGrid<T = any>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = false,
  onSort,
  loading = false,
  emptyMessage = 'No data to display',
  stickyHeader = false,
  striped = false,
  bordered = false,
  compact = false,
  maxHeight,
  onRowClick,
  virtualScroll,
  rowHeight = 40,
  showFilters = false,
  filterValues: externalFilterValues,
  onFilterChange,
  pageSize = 0,
  showExport = false,
  exportFileName = 'export',
  onLoadMore,
  hasMore,
  loadingMore = false,
  loadMoreThreshold = 200,
}: TkxDataGridProps<T>) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const gridId = useId();

  // ── Internal sort state ─────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback(
    (key: string) => {
      const nextDir: 'asc' | 'desc' = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      setSortKey(key);
      setSortDir(nextDir);
      onSort?.(key, nextDir);
    },
    [sortKey, sortDir, onSort],
  );

  // ── Client-side sort (when no external onSort handler) ──────────────────
  const sortedData = useMemo<T[]>(() => {
    // If consumer handles sorting externally, trust the data order
    if (onSort || !sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = getCellValue(a, sortKey);
      const bVal = getCellValue(b, sortKey);
      const cmp = compareValues(aVal, bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, onSort]);

  // ── Internal filter state ───────────────────────────────────────────────
  const [internalFilters, setInternalFilters] = useState<Record<string, string>>({});
  const filters = externalFilterValues ?? internalFilters;

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (onFilterChange) {
        onFilterChange(key, value);
      } else {
        setInternalFilters(prev => ({ ...prev, [key]: value }));
      }
    },
    [onFilterChange],
  );

  // ── Client-side filter ──────────────────────────────────────────────────
  const filteredData = useMemo<T[]>(() => {
    const activeFilters = Object.entries(filters).filter(([, v]) => v.trim() !== '');
    if (activeFilters.length === 0) return sortedData;
    return sortedData.filter(row =>
      activeFilters.every(([key, filterVal]) => {
        const cell = getCellValue(row, key);
        return String(cell ?? '').toLowerCase().includes(filterVal.toLowerCase());
      }),
    );
  }, [sortedData, filters]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const isPaginated = pageSize > 0;
  const totalRows = filteredData.length;
  const totalPages = isPaginated ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1;

  // Reset to page 1 when filters/sort change
  useEffect(() => { setPage(1); }, [filters, sortKey, sortDir]);

  const pagedData = useMemo<T[]>(() => {
    if (!isPaginated) return filteredData;
    return filteredData.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredData, isPaginated, page, pageSize]);

  // ── Virtual scroll ─────────────────────────────────────────────────────
  const OVERSCAN = 10;
  const isVirtual =
    virtualScroll !== undefined
      ? virtualScroll
      : !isPaginated && maxHeight !== undefined && pagedData.length >= 50;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) setScrollTop(scrollContainerRef.current.scrollTop);
  }, []);

  useEffect(() => {
    if (!isVirtual || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    setContainerHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isVirtual]);

  const totalHeight = pagedData.length * rowHeight;
  const startIndex = isVirtual
    ? Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN)
    : 0;
  const endIndex = isVirtual
    ? Math.min(pagedData.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + OVERSCAN)
    : pagedData.length;
  const visibleData = isVirtual ? pagedData.slice(startIndex, endIndex) : pagedData;
  const offsetY = startIndex * rowHeight;

  // ── Infinite scroll ─────────────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);

  // Reset the debounce flag whenever data.length changes (new data arrived)
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
        rootMargin: `0px 0px ${loadMoreThreshold}px 0px`,
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLoadMore, hasMore, loadMoreThreshold]);

  // ── Selection logic ─────────────────────────────────────────────────────
  const selectedSet = useMemo(() => new Set(selectedRows), [selectedRows]);
  const allIds = useMemo(() => filteredData.map(row => getRowId(row, rowKey)), [filteredData, rowKey]);
  const allSelected = allIds.length > 0 && allIds.every(id => selectedSet.has(id));
  const someSelected = allIds.some(id => selectedSet.has(id));

  const toggleAll = useCallback(() => {
    onSelectionChange?.(allSelected ? [] : allIds);
  }, [allSelected, allIds, onSelectionChange]);

  const toggleRow = useCallback((id: string) => {
    const next = selectedSet.has(id)
      ? selectedRows.filter(r => r !== id)
      : [...selectedRows, id];
    onSelectionChange?.(next);
  }, [selectedSet, selectedRows, onSelectionChange]);

  // ── Column resize ─────────────────────────────────────────────────────
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const handleResizeStart = useCallback(
    (key: string, e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const th = (e.target as HTMLElement).closest('th');
      if (!th) return;
      const startWidth = colWidths[key] || th.getBoundingClientRect().width;
      resizeRef.current = { key, startX: e.clientX, startWidth };

      const handleMouseMove = (ev: globalThis.MouseEvent) => {
        if (!resizeRef.current) return;
        const newWidth = Math.max(50, resizeRef.current.startWidth + ev.clientX - resizeRef.current.startX);
        setColWidths(prev => ({ ...prev, [resizeRef.current!.key]: newWidth }));
      };
      const handleMouseUp = () => {
        resizeRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [colWidths],
  );

  // ── CSV Export ──────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const header = columns.map(c => escapeCSV(c.header)).join(',');
    const rows = filteredData.map(row =>
      columns.map(col => {
        const raw = getCellValue(row, col.key);
        // Skip custom renderers for CSV — export raw values
        return escapeCSV(raw);
      }).join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [columns, filteredData, exportFileName]);

  // ── Cell sizing ─────────────────────────────────────────────────────────
  const py = compact ? '4px' : '8px';
  const px = compact ? '8px' : '12px';

  const getColStyle = (col: DataGridColumn<T>): CSSProperties => {
    const w = colWidths[col.key] || col.width;
    return {
      width: w != null ? (typeof w === 'number' ? w : w) : undefined,
      minWidth: w != null ? (typeof w === 'number' ? w : w) : 80,
      textAlign: col.align ?? 'left',
      padding: `${py} ${px}`,
    };
  };

  const borderRight = bordered ? `1px solid ${theme.border}` : 'none';
  const safeEmpty = sanitizeString(emptyMessage);
  const totalCols = columns.length + (selectable ? 1 : 0);

  const hasFilterableColumns = columns.some(c => c.filterable);

  return (
    <div
      role="grid"
      aria-label="Data grid"
      aria-rowcount={totalRows}
      id={gridId}
      className={tkx('font-sans rounded-lg overflow-hidden')}
      style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.bg }}
    >
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <GridToolbar
        label="data grid"
        showExport={showExport}
        onExport={handleExport}
        totalRows={totalRows}
        selectedCount={selectedRows.length}
        theme={theme}
      />

      <div
        ref={scrollContainerRef}
        onScroll={isVirtual ? handleScroll : undefined}
        style={{
          maxHeight: maxHeight ?? 'none',
          overflowX: 'auto',
          overflowY: maxHeight ? 'auto' : 'visible',
        }}
      >
        <table
          className={tkx('w-full')}
          style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'auto' }}
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <thead>
            <tr role="row">
              {/* Select-all */}
              {selectable && (
                <th
                  scope="col"
                  role="columnheader"
                  style={{
                    position: stickyHeader ? 'sticky' : 'static',
                    top: 0, zIndex: 2,
                    backgroundColor: theme.surface,
                    borderBottom: `2px solid ${theme.border}`,
                    borderRight,
                    padding: `${py} ${px}`,
                    width: 40,
                    textAlign: 'center',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto', width: 16 }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                      onChange={toggleAll}
                      aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                      style={{ position: 'absolute', opacity: 0, width: 16, height: 16, cursor: 'pointer', margin: 0 }}
                    />
                    <CheckboxIcon checked={allSelected} indeterminate={someSelected && !allSelected} />
                  </label>
                </th>
              )}

              {/* Column headers */}
              {columns.map(col => {
                const isSortable = (col.sortable ?? sortable) && col.sortable !== false;
                const isSorted = sortKey === col.key;
                const safeHeader = sanitizeString(col.header);

                return (
                  <th
                    key={col.key}
                    scope="col"
                    role="columnheader"
                    aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : (isSortable ? 'none' : undefined)}
                    className={tkx('text-xs font-semibold uppercase tracking-wider')}
                    style={{
                      ...getColStyle(col),
                      position: stickyHeader ? 'sticky' : 'static',
                      top: 0, zIndex: 2,
                      backgroundColor: theme.surface,
                      color: theme.textMuted,
                      borderBottom: `2px solid ${theme.border}`,
                      borderRight,
                      cursor: isSortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      transition: reduced ? 'none' : 'background-color 150ms ease',
                    }}
                    onClick={isSortable ? () => handleSort(col.key) : undefined}
                    onKeyDown={isSortable ? e => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); }
                    } : undefined}
                    tabIndex={isSortable ? 0 : undefined}
                  >
                    <div className={tkx('flex items-center gap-1')} style={{ position: 'relative' }}>
                      {col.renderHeader ? col.renderHeader(col) : safeHeader}
                      {isSortable && <SortIcon direction={isSorted ? sortDir : null} />}

                      {/* Resize handle */}
                      {col.resizable && (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize column ${safeHeader}`}
                          className={tkx('cursor-col-resize shrink-0')}
                          style={{
                            position: 'absolute', right: 0, top: 0, bottom: 0,
                            width: 4, backgroundColor: 'transparent',
                          }}
                          onMouseDown={e => handleResizeStart(col.key, e)}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* ── Filter row ──────────────────────────────────────── */}
            {(showFilters || hasFilterableColumns) && (
              <tr role="row" aria-label="Column filters">
                {selectable && (
                  <th
                    scope="col"
                    style={{
                      backgroundColor: theme.surfaceAlt,
                      borderBottom: `1px solid ${theme.border}`,
                      borderRight,
                      padding: `4px ${px}`,
                      width: 40,
                    }}
                  />
                )}
                {columns.map(col => (
                  <th
                    key={col.key}
                    scope="col"
                    style={{
                      backgroundColor: theme.surfaceAlt,
                      borderBottom: `1px solid ${theme.border}`,
                      borderRight,
                      padding: `4px ${px}`,
                    }}
                  >
                    {(col.filterable || showFilters) && (
                      <input
                        type="text"
                        value={filters[col.key] ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleFilterChange(col.key, e.target.value)
                        }
                        placeholder={`Filter ${col.header}…`}
                        aria-label={`Filter by ${col.header}`}
                        style={{
                          width: '100%',
                          padding: '3px 8px',
                          fontSize: 12,
                          borderRadius: 4,
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.bg,
                          color: theme.text,
                          outline: 'none',
                        }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          {/* ── Loading ───────────────────────────────────────────── */}
          {loading && <LoadingOverlay colCount={totalCols} />}

          {/* ── Body ──────────────────────────────────────────────── */}
          {!loading && (
            <tbody>
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className={tkx('text-center py-10')}
                    style={{ color: theme.textMuted }}>
                    {safeEmpty}
                  </td>
                </tr>
              ) : (
                <>
                  {/* Top spacer for virtual scrolling */}
                  {isVirtual && offsetY > 0 && (
                    <tr aria-hidden="true">
                      <td colSpan={totalCols} style={{ height: offsetY, padding: 0, border: 'none' }} />
                    </tr>
                  )}

                  {visibleData.map((row, i) => {
                    const rowIndex = startIndex + i;
                    const id = getRowId(row, rowKey);
                    const isSelected = selectedSet.has(id);
                    const isStriped = striped && rowIndex % 2 === 1;

                    let rowBg = 'transparent';
                    if (isSelected) rowBg = `${theme.primary}22`;
                    else if (isStriped) rowBg = theme.surfaceAlt;

                    return (
                      <tr
                        key={id}
                        role="row"
                        aria-rowindex={rowIndex + 1}
                        aria-selected={selectable ? isSelected : undefined}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        onKeyDown={onRowClick ? e => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(row); }
                        } : undefined}
                        tabIndex={onRowClick ? 0 : undefined}
                        className={tkx(onRowClick ? 'cursor-pointer' : '')}
                        style={{
                          backgroundColor: rowBg,
                          transition: reduced ? 'none' : 'background-color 120ms ease',
                          ...(isVirtual ? { height: rowHeight, boxSizing: 'border-box' } : {}),
                        }}
                        onMouseEnter={onRowClick ? e => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            isSelected ? `${theme.primary}30` : theme.surfaceAlt;
                        } : undefined}
                        onMouseLeave={onRowClick ? e => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = rowBg;
                        } : undefined}
                      >
                        {/* Selection checkbox */}
                        {selectable && (
                          <td
                            role="gridcell"
                            style={{
                              borderBottom: `1px solid ${theme.border}`,
                              borderRight,
                              padding: `${py} ${px}`,
                              textAlign: 'center',
                              width: 40,
                            }}
                          >
                            <label
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto', width: 16 }}
                              onClick={e => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRow(id)}
                                aria-label={isSelected ? `Deselect row ${id}` : `Select row ${id}`}
                                style={{ position: 'absolute', opacity: 0, width: 16, height: 16, cursor: 'pointer', margin: 0 }}
                              />
                              <CheckboxIcon checked={isSelected} />
                            </label>
                          </td>
                        )}

                        {/* Data cells */}
                        {columns.map(col => {
                          const value = getCellValue(row, col.key);
                          const cellContent = col.renderCell
                            ? col.renderCell(value, row)
                            : typeof value === 'string'
                              ? sanitizeString(value)
                              : String(value ?? '');

                          return (
                            <td
                              key={col.key}
                              role="gridcell"
                              className={tkx('text-sm')}
                              style={{
                                ...getColStyle(col),
                                borderBottom: `1px solid ${theme.border}`,
                                borderRight,
                                color: theme.text,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {cellContent}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Bottom spacer for virtual scrolling */}
                  {isVirtual && endIndex < pagedData.length && (
                    <tr aria-hidden="true">
                      <td colSpan={totalCols}
                        style={{ height: (pagedData.length - endIndex) * rowHeight, padding: 0, border: 'none' }} />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          )}
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
                        <td key={col.key} style={{ padding: '10px 16px' }}>
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
          <div style={{ padding: '16px', textAlign: 'center', fontSize: 13, color: theme.textMuted }}>
            ✓ All rows loaded
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {isPaginated && !loading && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRows={totalRows}
          onPageChange={setPage}
          theme={theme}
        />
      )}
    </div>
  );
}
