'use client';

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
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { TkxSkeleton } from './TkxSkeleton';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Custom cell editor render contract. The editor owns its own input element
 * and signals completion via the supplied callbacks.
 */
export interface CellEditorRenderArgs<T = any> {
  value: any;
  row: T;
  onCommit: (v: any) => void;
  onCancel: () => void;
}

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
  /**
   * Aggregation rendered in the group header row when `groupBy` is set on
   * the grid. Built-in numeric aggregates ('sum' | 'avg' | 'min' | 'max')
   * silently skip non-numeric values. 'count' works on any column. Pass a
   * function for custom logic.
   */
  aggregate?:
    | 'sum'
    | 'avg'
    | 'count'
    | 'min'
    | 'max'
    | ((rows: T[]) => string | number);
  /**
   * Enable cell-level editing on this column. Pass a predicate to allow
   * editing on a per-row basis (e.g. `editable: row => !row.locked`).
   */
  editable?: boolean | ((row: T) => boolean);
  /**
   * Editor variant. Defaults to `'text'`. `'number'` renders an
   * `<input type="number">`. `'select'` renders a native `<select>` whose
   * options come from `editorOptions.options`. A function lets you render
   * a fully custom editor — call `onCommit(value)` or `onCancel()` to
   * leave edit mode.
   */
  editor?:
    | 'text'
    | 'number'
    | 'select'
    | ((args: CellEditorRenderArgs<T>) => ReactNode);
  editorOptions?: {
    options?: Array<{ value: any; label: string }>;
  };
  /**
   * Validate a candidate value on commit. Return an error message string
   * to block the commit, or `null` to accept. The error is surfaced via
   * a small inline message and `aria-describedby` on the editor.
   */
  validateCell?: (value: any, row: T) => string | null;
  /**
   * When `childRowsKey` is set on the grid, mark exactly one column with
   * `tree: true`. That column renders the disclosure caret (▶ / ▼) and
   * indents content by depth. If multiple columns set `tree: true`, the
   * FIRST one in column order wins.
   */
  tree?: boolean;
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
  /**
   * Column key to group rows by. Group header rows render between detail
   * rows; each group is collapsible. When undefined, the grid renders
   * exactly as without grouping (zero-cost no-op).
   */
  groupBy?: string;
  /**
   * Which groups start expanded. `'all'` (default) opens everything,
   * `'none'` collapses everything, or pass an explicit array of group
   * keys.
   */
  defaultExpandedGroups?: 'all' | 'none' | string[];
  /** Fired when a group header is toggled. */
  onGroupToggle?: (groupKey: string, expanded: boolean) => void;
  /**
   * Fired when a cell edit commits (after passing `validateCell`). May
   * return a Promise; the cell shows a loading state until it resolves.
   */
  onCellEdit?: (params: {
    rowId: string | number;
    columnKey: string;
    newValue: any;
    oldValue: any;
    row: T;
  }) => void | Promise<void>;
  /** Fired when a cell enters edit mode. */
  onCellEditStart?: (params: {
    rowId: string | number;
    columnKey: string;
    row: T;
  }) => void;
  /** Fired when a cell edit is cancelled (Escape / programmatic cancel). */
  onCellEditCancel?: (params: {
    rowId: string | number;
    columnKey: string;
    row: T;
  }) => void;
  /**
   * Enable tree-data / hierarchical rows. Pass the name of the field on
   * each row that holds its child rows (e.g. `'children'`). The grid then
   * does a depth-first traversal honouring per-row expansion state, marks
   * exactly one column with `tree: true` as the disclosure column, and
   * switches the table role to `treegrid`.
   *
   * Tree-data is IGNORED when `groupBy` is set (groupBy wins; a dev
   * warning is logged once).
   */
  childRowsKey?: string;
  /**
   * Which rows start expanded. `'all'` recursively expands every parent,
   * `'none'` collapses everything (default), or pass an explicit array of
   * row IDs to expand.
   */
  defaultExpandedRows?: 'all' | 'none' | (string | number)[];
  /** Fired when a tree-data row is toggled. */
  onRowExpand?: (rowId: string | number, expanded: boolean) => void;
  /** Pixels of indent per depth level for tree-data rows. Default: 24 */
  indentSize?: number;
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

// ── Group caret ──────────────────────────────────────────────────────────────

function GroupCaret({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      style={{
        display: 'inline-block',
        marginRight: 6,
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 120ms ease',
      }}
    >
      <path d="M2 1l6 4-6 4z" fill="currentColor" />
    </svg>
  );
}

// ── Tree caret ────────────────────────────────────────────────────────────────

const TREE_CARET_BOX = 16; // px — matches caret + spacing so leaf placeholders align

function TreeCaret({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      style={{
        display: 'inline-block',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 120ms ease',
      }}
    >
      <path d="M2 1l6 4-6 4z" fill="currentColor" />
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

function computeAggregate<T>(
  col: DataGridColumn<T>,
  rows: T[],
): string | number | undefined {
  const agg = col.aggregate;
  if (agg == null) return undefined;
  if (typeof agg === 'function') {
    try {
      return agg(rows);
    } catch {
      return undefined;
    }
  }
  if (agg === 'count') return rows.length;
  // Built-in numeric aggregates: only consider rows whose value coerces to
  // a finite number. If none qualify, return undefined (don't crash).
  const nums: number[] = [];
  for (const r of rows) {
    const v = (r as Record<string, unknown>)[col.key];
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) nums.push(n);
  }
  if (nums.length === 0) return undefined;
  switch (agg) {
    case 'sum': return nums.reduce((a, b) => a + b, 0);
    case 'avg': return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'min': return Math.min(...nums);
    case 'max': return Math.max(...nums);
    default: return undefined;
  }
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

// ── Cell editor ───────────────────────────────────────────────────────────────

interface CellEditorProps<T> {
  col: DataGridColumn<T>;
  row: T;
  initialValue: unknown;
  onCommit: (newValue: unknown) => void;
  onCancel: () => void;
}

function CellEditor<T>({
  col,
  row,
  initialValue,
  onCommit,
  onCancel,
}: CellEditorProps<T>) {
  const theme = useTheme();
  const [value, setValue] = useState<unknown>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const errorId = useId();
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (
        'select' in inputRef.current &&
        typeof (inputRef.current as HTMLInputElement).select === 'function'
      ) {
        try {
          (inputRef.current as HTMLInputElement).select();
        } catch {
          /* not all input types support select() */
        }
      }
    }
  }, []);

  const tryCommit = useCallback(
    (candidate: unknown) => {
      if (col.validateCell) {
        const err = col.validateCell(candidate, row);
        if (err) {
          setError(err);
          return false;
        }
      }
      setError(null);
      onCommit(candidate);
      return true;
    },
    [col, row, onCommit],
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        tryCommit(value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        skipBlurCommitRef.current = true;
        onCancel();
      }
    },
    [value, tryCommit, onCancel],
  );

  const handleBlur = useCallback(() => {
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false;
      return;
    }
    tryCommit(value);
  }, [tryCommit, value]);

  // Custom editor function — delegate fully.
  if (typeof col.editor === 'function') {
    return (
      <>
        {col.editor({
          value: initialValue,
          row,
          onCommit: (v: unknown) => tryCommit(v),
          onCancel,
        })}
        {error && (
          <span
            id={errorId}
            role="alert"
            style={{
              display: 'block',
              marginTop: 2,
              fontSize: 11,
              color: '#dc2626',
            }}
          >
            {error}
          </span>
        )}
      </>
    );
  }

  const ariaLabel = `Edit ${col.header}`;
  const commonStyle: CSSProperties = {
    width: '100%',
    padding: '3px 6px',
    fontSize: 13,
    borderRadius: 4,
    border: `1px solid ${error ? '#dc2626' : theme.primary}`,
    backgroundColor: theme.bg,
    color: theme.text,
    outline: 'none',
    boxSizing: 'border-box',
  };

  let editorEl: ReactNode;
  if (col.editor === 'select') {
    const options = col.editorOptions?.options ?? [];
    editorEl = (
      <select
        ref={el => {
          inputRef.current = el;
        }}
        value={value as string}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-label={ariaLabel}
        aria-describedby={error ? errorId : undefined}
        style={commonStyle}
      >
        {options.map(opt => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  } else if (col.editor === 'number') {
    editorEl = (
      <input
        ref={el => {
          inputRef.current = el;
        }}
        type="number"
        value={value == null ? '' : String(value)}
        onChange={e => {
          const raw = e.target.value;
          setValue(raw === '' ? '' : Number(raw));
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-label={ariaLabel}
        aria-describedby={error ? errorId : undefined}
        style={commonStyle}
      />
    );
  } else {
    editorEl = (
      <input
        ref={el => {
          inputRef.current = el;
        }}
        type="text"
        value={value == null ? '' : String(value)}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-label={ariaLabel}
        aria-describedby={error ? errorId : undefined}
        style={commonStyle}
      />
    );
  }

  return (
    <>
      {editorEl}
      {error && (
        <span
          id={errorId}
          role="alert"
          data-cell-error=""
          style={{
            display: 'block',
            marginTop: 2,
            fontSize: 11,
            color: '#dc2626',
          }}
        >
          {error}
        </span>
      )}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxDataGrid<T = any>({
  columns = [],
  data = [],
  rowKey,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = false,
  onSort,
  loading = false,
  emptyMessage,
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
  groupBy,
  defaultExpandedGroups = 'all',
  onGroupToggle,
  onCellEdit,
  onCellEditStart,
  onCellEditCancel,
  childRowsKey,
  defaultExpandedRows = 'none',
  onRowExpand,
  indentSize = 24,
}: TkxDataGridProps<T>) {
  const theme = useTheme();
  const t = useLocale();
  const resolvedEmpty = emptyMessage ?? t.noRows ?? t.noData ?? 'No data to display';
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

  // ── Grouping ────────────────────────────────────────────────────────────
  // Validate `groupBy` once and warn if it doesn't match any column. Treat
  // an unknown key as ungrouped so the grid keeps rendering.
  const validGroupBy = useMemo<string | undefined>(() => {
    if (!groupBy) return undefined;
    const exists = columns.some(c => c.key === groupBy);
    if (!exists) {
      // eslint-disable-next-line no-console
      console.warn(
        `[TkxDataGrid] groupBy="${groupBy}" does not match any column key — rendering ungrouped.`,
      );
      return undefined;
    }
    return groupBy;
  }, [groupBy, columns]);

  // Buckets are built off the filtered+sorted set so sort order is
  // preserved within each group. Map insertion order also preserves the
  // order groups first appear in the sorted list.
  const groups = useMemo<Array<{ key: string; rows: T[] }>>(() => {
    if (!validGroupBy) return [];
    const buckets = new Map<string, T[]>();
    for (const row of filteredData) {
      const raw = (row as Record<string, unknown>)[validGroupBy];
      const k = String(raw ?? '');
      const arr = buckets.get(k);
      if (arr) arr.push(row);
      else buckets.set(k, [row]);
    }
    return Array.from(buckets.entries()).map(([key, rows]) => ({ key, rows }));
  }, [filteredData, validGroupBy]);

  // Expansion state. Initialised from `defaultExpandedGroups` on first
  // render, then user toggles take over.
  const initialExpanded = useMemo<Set<string>>(() => {
    if (defaultExpandedGroups === 'none') return new Set();
    if (Array.isArray(defaultExpandedGroups)) return new Set(defaultExpandedGroups);
    // 'all' — populated lazily when groups appear (see effect below).
    return new Set();
  }, [defaultExpandedGroups]);
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  // When defaultExpandedGroups='all', expand any new group keys that
  // appear (e.g. after data load). Existing user toggles are preserved.
  const seenGroupsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!validGroupBy || defaultExpandedGroups !== 'all') return;
    let dirty = false;
    setExpanded(prev => {
      const next = new Set(prev);
      for (const g of groups) {
        if (!seenGroupsRef.current.has(g.key)) {
          seenGroupsRef.current.add(g.key);
          next.add(g.key);
          dirty = true;
        }
      }
      return dirty ? next : prev;
    });
  }, [groups, validGroupBy, defaultExpandedGroups]);

  const toggleGroup = useCallback(
    (key: string) => {
      setExpanded(prev => {
        const next = new Set(prev);
        const willExpand = !next.has(key);
        if (willExpand) next.add(key);
        else next.delete(key);
        onGroupToggle?.(key, willExpand);
        return next;
      });
    },
    [onGroupToggle],
  );

  // Flatten groups into a render plan: a single list of "row items" that
  // is either a group header or a detail row. Detail rows from collapsed
  // groups are skipped entirely.
  type RowItem =
    | { type: 'group'; key: string; rows: T[] }
    | { type: 'row'; row: T };
  const rowItems = useMemo<RowItem[]>(() => {
    if (!validGroupBy) {
      return filteredData.map(row => ({ type: 'row' as const, row }));
    }
    const items: RowItem[] = [];
    for (const g of groups) {
      items.push({ type: 'group', key: g.key, rows: g.rows });
      if (expanded.has(g.key)) {
        for (const row of g.rows) items.push({ type: 'row', row });
      }
    }
    return items;
  }, [validGroupBy, filteredData, groups, expanded]);

  // ── Tree data ───────────────────────────────────────────────────────────
  // Tree-data is mutually exclusive with groupBy. groupBy WINS (logged once).
  const treeGroupConflictWarnedRef = useRef(false);
  const treeMissingKeyWarnedRef = useRef(false);
  const treeCycleWarnedRef = useRef(false);

  const isTreeMode = useMemo(() => {
    if (!childRowsKey) return false;
    if (validGroupBy) {
      if (!treeGroupConflictWarnedRef.current) {
        treeGroupConflictWarnedRef.current = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[TkxDataGrid] childRowsKey is ignored when groupBy is set — groupBy wins.',
        );
      }
      return false;
    }
    return true;
  }, [childRowsKey, validGroupBy]);

  // First column with `tree: true` is the disclosure column.
  const treeColumnKey = useMemo<string | undefined>(() => {
    if (!isTreeMode) return undefined;
    const col = columns.find(c => c.tree);
    return col?.key;
  }, [columns, isTreeMode]);

  // Recursively collect all parent IDs (used for defaultExpandedRows: 'all').
  const collectAllParentIds = useCallback(
    (rows: T[], depth: number, out: Set<string>) => {
      if (depth > 32) return; // cycle guard
      for (const row of rows) {
        const kids = (row as Record<string, unknown>)[childRowsKey ?? ''];
        if (Array.isArray(kids) && kids.length > 0) {
          const id = getRowId(row, rowKey);
          if (id && id !== 'undefined' && id !== 'null') out.add(id);
          collectAllParentIds(kids as T[], depth + 1, out);
        }
      }
    },
    [childRowsKey, rowKey],
  );

  const initialExpandedRows = useMemo<Set<string>>(() => {
    if (!isTreeMode) return new Set();
    if (defaultExpandedRows === 'none') return new Set();
    if (defaultExpandedRows === 'all') {
      const s = new Set<string>();
      collectAllParentIds(data, 0, s);
      return s;
    }
    return new Set(defaultExpandedRows.map(String));
  }, [isTreeMode, defaultExpandedRows, data, collectAllParentIds]);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(initialExpandedRows);

  // Re-seed expansion when switching between tree/non-tree modes, or when
  // data identity changes under 'all' mode (new parents appear). User
  // toggles are otherwise preserved.
  const seenTreeDataRef = useRef<T[] | null>(null);
  useEffect(() => {
    if (!isTreeMode) return;
    if (defaultExpandedRows !== 'all') return;
    if (seenTreeDataRef.current === data) return;
    seenTreeDataRef.current = data;
    const next = new Set<string>();
    collectAllParentIds(data, 0, next);
    setExpandedRows(prev => {
      // Union: keep existing user-toggled state, add any new parents.
      const merged = new Set(prev);
      for (const id of next) merged.add(id);
      return merged;
    });
  }, [isTreeMode, defaultExpandedRows, data, collectAllParentIds]);

  const toggleRowExpand = useCallback(
    (id: string) => {
      setExpandedRows(prev => {
        const next = new Set(prev);
        const willExpand = !next.has(id);
        if (willExpand) next.add(id);
        else next.delete(id);
        onRowExpand?.(id, willExpand);
        return next;
      });
    },
    [onRowExpand],
  );

  // Flatten tree → linear list of { row, depth, hasChildren, isExpanded,
  // siblingCount, siblingIndex }. Respects collapsed state recursively.
  // Sorts within each depth level: top-level rows are already sorted via
  // `filteredData`; child rows are sorted in-place per parent.
  interface TreeRowEntry {
    row: T;
    depth: number;
    hasChildren: boolean;
    isExpanded: boolean;
    siblingCount: number;
    siblingIndex: number;
    id: string;
  }

  const visibleTreeRows = useMemo<TreeRowEntry[]>(() => {
    if (!isTreeMode || !childRowsKey) return [];
    const out: TreeRowEntry[] = [];
    let cycle = false;

    // Resolve any rowId issue once per render. If rowKey is missing or
    // produces unstable IDs, disable tree mode (return []).
    let anyMissingId = false;

    const sortChildren = (rows: T[]): T[] => {
      // Only re-sort if user has an active sort key. Children stay
      // attached to their parent regardless.
      if (onSort || !sortKey) return rows;
      return [...rows].sort((a, b) => {
        const aVal = getCellValue(a, sortKey);
        const bVal = getCellValue(b, sortKey);
        const cmp = compareValues(aVal, bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    };

    const walk = (rows: T[], depth: number) => {
      if (depth > 32) {
        cycle = true;
        return;
      }
      const ordered = depth === 0 ? rows : sortChildren(rows);
      for (let i = 0; i < ordered.length; i++) {
        const row = ordered[i];
        const id = getRowId(row, rowKey);
        if (!id || id === 'undefined' || id === 'null') {
          anyMissingId = true;
          continue;
        }
        const kidsRaw = (row as Record<string, unknown>)[childRowsKey];
        const kids = Array.isArray(kidsRaw) ? (kidsRaw as T[]) : [];
        const hasChildren = kids.length > 0;
        const isExpanded = hasChildren && expandedRows.has(id);
        out.push({
          row,
          depth,
          hasChildren,
          isExpanded,
          siblingCount: ordered.length,
          siblingIndex: i,
          id,
        });
        if (isExpanded) walk(kids, depth + 1);
      }
    };

    walk(filteredData, 0);

    if (anyMissingId && !treeMissingKeyWarnedRef.current) {
      treeMissingKeyWarnedRef.current = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[TkxDataGrid] Tree mode requires a stable rowKey for every row. Rows without one are skipped.',
      );
    }
    if (cycle && !treeCycleWarnedRef.current) {
      treeCycleWarnedRef.current = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[TkxDataGrid] Tree depth exceeded 32 — possible circular reference. Truncated.',
      );
    }
    return out;
  }, [isTreeMode, childRowsKey, filteredData, expandedRows, rowKey, sortKey, sortDir, onSort]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const isPaginated = pageSize > 0;
  // Pagination is applied to the FLAT post-grouping row list so a single
  // group can span multiple pages. In tree mode, pagination applies to
  // the flat visible-row list (collapsed children do NOT count).
  const totalRows = isTreeMode ? visibleTreeRows.length : rowItems.length;
  const totalPages = isPaginated ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1;

  // Reset to page 1 when filters/sort change
  useEffect(() => { setPage(1); }, [filters, sortKey, sortDir]);

  // When grouping is OFF, pagedData stays a plain T[] (existing semantics).
  // When grouping is ON, the render path consumes `pagedItems` instead and
  // pagedData collapses to an empty array (kept only for downstream type
  // compatibility of legacy code paths like virtual scroll).
  const pagedItems = useMemo<RowItem[]>(() => {
    if (!isPaginated) return rowItems;
    return rowItems.slice((page - 1) * pageSize, page * pageSize);
  }, [rowItems, isPaginated, page, pageSize]);

  const pagedTreeRows = useMemo<TreeRowEntry[]>(() => {
    if (!isTreeMode) return [];
    if (!isPaginated) return visibleTreeRows;
    return visibleTreeRows.slice((page - 1) * pageSize, page * pageSize);
  }, [isTreeMode, visibleTreeRows, isPaginated, page, pageSize]);

  const pagedData = useMemo<T[]>(() => {
    // Used by the virtual-scroll branch (which only fires when grouping
    // and tree-mode are off — see render path) so it stays the flat T[]
    // it always was.
    if (validGroupBy || isTreeMode) return [];
    if (!isPaginated) return filteredData;
    return filteredData.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredData, isPaginated, page, pageSize, validGroupBy, isTreeMode]);

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

  const virtualSource = isTreeMode ? pagedTreeRows : pagedData;
  const totalHeight = virtualSource.length * rowHeight;
  const startIndex = isVirtual
    ? Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN)
    : 0;
  const endIndex = isVirtual
    ? Math.min(virtualSource.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + OVERSCAN)
    : virtualSource.length;
  const visibleData = isVirtual ? pagedData.slice(startIndex, endIndex) : pagedData;
  const visibleTreeSlice = isTreeMode
    ? (isVirtual ? pagedTreeRows.slice(startIndex, endIndex) : pagedTreeRows)
    : [];
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

  // ── Column pinning ────────────────────────────────────────────────────
  // Compute cumulative left/right offsets for sticky positioning. Pinned
  // columns stay in their logical DOM position; CSS sticky handles visual
  // placement so a11y row/col indices remain correct.
  const pinnedOffsets = useMemo(() => {
    const map: Record<
      string,
      { side: 'left' | 'right'; offset: number; isEdge: boolean }
    > = {};
    const leftCols = columns.filter(c => c.pinned === 'left');
    const rightCols = columns.filter(c => c.pinned === 'right');
    const widthOf = (c: DataGridColumn<T>): number => {
      const w = colWidths[c.key] ?? c.width;
      if (typeof w === 'number') return w;
      // Width may be a string like "120px" or undefined — fall back to a
      // sensible default that matches getColStyle's minWidth (80).
      if (typeof w === 'string') {
        const px = parseFloat(w);
        if (!Number.isNaN(px)) return px;
      }
      return 150;
    };
    // Selection checkbox column (when selectable) sits before pinned-left
    // columns, occupying 40px. Pinned-left offsets start after it.
    let leftOffset = selectable ? 40 : 0;
    leftCols.forEach((c, i) => {
      map[c.key] = {
        side: 'left',
        offset: leftOffset,
        isEdge: i === leftCols.length - 1,
      };
      leftOffset += widthOf(c);
    });
    let rightOffset = 0;
    // Walk right-pinned columns from rightmost → leftmost so cumulative
    // offsets accumulate against the right edge correctly.
    for (let i = rightCols.length - 1; i >= 0; i--) {
      const c = rightCols[i];
      map[c.key] = {
        side: 'right',
        offset: rightOffset,
        isEdge: i === 0,
      };
      rightOffset += widthOf(c);
    }
    return map;
  }, [columns, colWidths, selectable]);

  const hasPinned = Object.keys(pinnedOffsets).length > 0;

  // ── Pinned-column scroll-shadow detection ─────────────────────────────
  // Track horizontal scroll position on the scroll container; expose state
  // via data-attrs so CSS can paint a subtle shadow on the boundary column.
  const [scrolledLeft, setScrolledLeft] = useState(false);
  const [scrolledRight, setScrolledRight] = useState(false);
  const scrollRafRef = useRef<number | null>(null);

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // "scrolled left" = content has been scrolled toward the right, i.e.
    // there is content hidden behind the left-pinned columns.
    setScrolledLeft(el.scrollLeft > 0);
    setScrolledRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const handleHorizontalScroll = useCallback(() => {
    if (scrollRafRef.current != null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      updateScrollState();
    });
  }, [updateScrollState]);

  useEffect(() => {
    if (!hasPinned) return;
    // Run once on mount/columns-change so initial scrolledRight reflects
    // whether the table is wider than the container.
    updateScrollState();
    return () => {
      if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [hasPinned, updateScrollState, columns.length]);

  // Build the sticky CSS for a pinned cell. Shared between header and body.
  const getPinnedStyle = useCallback(
    (col: DataGridColumn<T>, isHeader: boolean): CSSProperties => {
      const pin = pinnedOffsets[col.key];
      if (!pin) return {};
      const showLeftShadow =
        pin.side === 'left' && pin.isEdge && scrolledLeft;
      const showRightShadow =
        pin.side === 'right' && pin.isEdge && scrolledRight;
      const shadow = showLeftShadow
        ? '2px 0 4px rgba(0,0,0,0.15)'
        : showRightShadow
          ? '-2px 0 4px rgba(0,0,0,0.15)'
          : undefined;
      return {
        position: 'sticky',
        [pin.side]: pin.offset,
        // Header pinned cells need a higher z-index so they stay above body
        // pinned cells when the header is also sticky.
        zIndex: isHeader ? 3 : 2,
        backgroundColor: theme.surface,
        boxShadow: shadow,
      };
    },
    [pinnedOffsets, scrolledLeft, scrolledRight, theme.surface],
  );

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

  // ── Cell editing ────────────────────────────────────────────────────────
  // Tracks which (rowId, columnKey) cell is currently being edited and any
  // in-flight async commit. Editing one cell while another is active forces
  // a commit of the previous one first.
  const [editing, setEditing] = useState<
    { rowId: string; columnKey: string } | null
  >(null);
  const [savingCell, setSavingCell] = useState<
    { rowId: string; columnKey: string } | null
  >(null);
  const focusCellRef = useRef<{ rowId: string; columnKey: string } | null>(null);
  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());
  // Warn once per session about rows missing a stable rowId.
  const missingRowIdWarnedRef = useRef(false);

  const isColumnEditable = useCallback(
    (col: DataGridColumn<T>, row: T): boolean => {
      if (col.editable == null || col.editable === false) return false;
      if (typeof col.editable === 'function') {
        try {
          return col.editable(row);
        } catch {
          return false;
        }
      }
      return col.editable === true;
    },
    [],
  );

  const enterEdit = useCallback(
    (rowId: string, col: DataGridColumn<T>, row: T) => {
      // If rowId looks bogus (e.g. "undefined"/"null") warn and bail.
      if (rowId === 'undefined' || rowId === 'null' || rowId === '') {
        if (!missingRowIdWarnedRef.current) {
          missingRowIdWarnedRef.current = true;
          // eslint-disable-next-line no-console
          console.warn(
            '[TkxDataGrid] Cannot edit cell — row has no stable rowId. Editing disabled for this row.',
          );
        }
        return;
      }
      setEditing({ rowId, columnKey: col.key });
      onCellEditStart?.({ rowId, columnKey: col.key, row });
    },
    [onCellEditStart],
  );

  const exitEditWithFocus = useCallback(
    (rowId: string, columnKey: string) => {
      focusCellRef.current = { rowId, columnKey };
      setEditing(null);
    },
    [],
  );

  // Restore focus to the cell after the editor unmounts.
  useEffect(() => {
    if (editing !== null || !focusCellRef.current) return;
    const { rowId, columnKey } = focusCellRef.current;
    const key = `${rowId}::${columnKey}`;
    const el = cellRefs.current.get(key);
    if (el) el.focus();
    focusCellRef.current = null;
  }, [editing]);

  const handleCellCommit = useCallback(
    (row: T, col: DataGridColumn<T>, newValue: unknown) => {
      const rowId = getRowId(row, rowKey);
      const oldValue = getCellValue(row, col.key);
      if (oldValue === newValue) {
        exitEditWithFocus(rowId, col.key);
        return;
      }
      const result = onCellEdit?.({
        rowId,
        columnKey: col.key,
        newValue,
        oldValue,
        row,
      });
      if (result && typeof (result as Promise<void>).then === 'function') {
        setSavingCell({ rowId, columnKey: col.key });
        exitEditWithFocus(rowId, col.key);
        (result as Promise<void>)
          .catch(() => {
            /* surface via consumer's own error handling */
          })
          .finally(() => {
            setSavingCell(prev =>
              prev && prev.rowId === rowId && prev.columnKey === col.key
                ? null
                : prev,
            );
          });
      } else {
        exitEditWithFocus(rowId, col.key);
      }
    },
    [rowKey, onCellEdit, exitEditWithFocus],
  );

  const handleCellCancel = useCallback(
    (row: T, col: DataGridColumn<T>) => {
      const rowId = getRowId(row, rowKey);
      onCellEditCancel?.({ rowId, columnKey: col.key, row });
      exitEditWithFocus(rowId, col.key);
    },
    [rowKey, onCellEditCancel, exitEditWithFocus],
  );

  // ── Grid keyboard navigation (partial APG grid/treegrid model) ─────────
  // The grid container is a single Tab stop that forwards focus into the
  // last-focused (or first) gridcell; Arrow keys then move cell focus,
  // Home/End jump to row start/end, Ctrl+Home/Ctrl+End to the grid corners,
  // and in treegrid mode ArrowRight/ArrowLeft on the tree column expand/
  // collapse the focused row. All gridcells are programmatically focusable
  // (tabIndex=-1; editable cells keep tabIndex=0).
  //
  // DEFERRED (honest scope note, tracked in docs/A11Y-AUDIT.md MEDIUM #22):
  // a full per-cell roving-tabindex model (one cell with tabIndex=0 instead
  // of a focusable container), PageUp/PageDown paging, and
  // virtualization-aware navigation beyond the rendered row window are left
  // for a follow-up cycle. The model shipped here is complete and
  // self-consistent for the rendered rows — no half-broken states.
  const gridRootRef = useRef<HTMLDivElement>(null);
  const lastFocusedCellRef = useRef<HTMLTableCellElement | null>(null);

  const getNavigableCells = useCallback(
    (tr: HTMLTableRowElement): HTMLTableCellElement[] =>
      Array.from(
        tr.querySelectorAll<HTMLTableCellElement>(
          'td[role="gridcell"], td[role="rowheader"]',
        ),
      ),
    [],
  );

  const getNavigableRows = useCallback((): HTMLTableRowElement[] => {
    const root = gridRootRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLTableRowElement>('tbody tr')).filter(
      tr =>
        !tr.hasAttribute('aria-hidden') &&
        tr.querySelector('td[role="gridcell"], td[role="rowheader"]') != null,
    );
  }, []);

  const focusCell = useCallback((cell: HTMLTableCellElement | null | undefined) => {
    if (!cell) return;
    lastFocusedCellRef.current = cell;
    cell.focus();
  }, []);

  const handleGridFocus = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      // Only forward when the container ITSELF receives focus (Tab into the
      // grid) — not when focus lands on inner controls (React onFocus bubbles).
      if (e.target !== gridRootRef.current) return;
      const remembered = lastFocusedCellRef.current;
      if (remembered && gridRootRef.current?.contains(remembered)) {
        remembered.focus();
        return;
      }
      const rows = getNavigableRows();
      if (rows.length > 0) focusCell(getNavigableCells(rows[0])[0]);
    },
    [getNavigableRows, getNavigableCells, focusCell],
  );

  const handleGridKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      // Only act when focus is on a grid cell itself — not on editors,
      // carets, checkboxes, filter inputs or other interactive descendants.
      if (target.tagName !== 'TD') return;
      const role = target.getAttribute('role');
      if (role !== 'gridcell' && role !== 'rowheader') return;
      const cell = target as HTMLTableCellElement;
      const tr = cell.closest('tr') as HTMLTableRowElement | null;
      if (!tr) return;

      const rows = getNavigableRows();
      const rowIdx = rows.indexOf(tr);
      if (rowIdx === -1) return;
      const cells = getNavigableCells(tr);
      const colIdx = cells.indexOf(cell);
      if (colIdx === -1) return;

      const treeRowId = tr.getAttribute('data-row-id');
      const expandedAttr = tr.getAttribute('aria-expanded');
      const isTreeCell = cell.hasAttribute('data-tree-cell');

      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault();
          // Treegrid: expand a collapsed parent row before moving right.
          if (isTreeMode && isTreeCell && treeRowId && expandedAttr === 'false') {
            toggleRowExpand(treeRowId);
            return;
          }
          focusCell(cells[Math.min(colIdx + 1, cells.length - 1)]);
          return;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          // Treegrid: collapse an expanded parent row before moving left.
          if (isTreeMode && isTreeCell && treeRowId && expandedAttr === 'true') {
            toggleRowExpand(treeRowId);
            return;
          }
          focusCell(cells[Math.max(colIdx - 1, 0)]);
          return;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const nextRow = rows[rowIdx + 1];
          if (!nextRow) return;
          const nc = getNavigableCells(nextRow);
          focusCell(nc[Math.min(colIdx, nc.length - 1)]);
          return;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevRow = rows[rowIdx - 1];
          if (!prevRow) return;
          const pc = getNavigableCells(prevRow);
          focusCell(pc[Math.min(colIdx, pc.length - 1)]);
          return;
        }
        case 'Home': {
          e.preventDefault();
          if (e.ctrlKey) {
            const first = rows[0];
            if (first) focusCell(getNavigableCells(first)[0]);
          } else {
            focusCell(cells[0]);
          }
          return;
        }
        case 'End': {
          e.preventDefault();
          if (e.ctrlKey) {
            const last = rows[rows.length - 1];
            if (last) {
              const lc = getNavigableCells(last);
              focusCell(lc[lc.length - 1]);
            }
          } else {
            focusCell(cells[cells.length - 1]);
          }
          return;
        }
        default:
          return;
      }
    },
    [isTreeMode, toggleRowExpand, getNavigableRows, getNavigableCells, focusCell],
  );

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
  const safeEmpty = sanitizeString(resolvedEmpty);
  const totalCols = columns.length + (selectable ? 1 : 0);

  const hasFilterableColumns = columns.some(c => c.filterable);

  return (
    <div
      ref={gridRootRef}
      role={isTreeMode ? 'treegrid' : 'grid'}
      aria-label={t.dataGrid ?? 'Data grid'}
      aria-rowcount={totalRows}
      aria-colcount={totalCols}
      id={gridId}
      // Single Tab stop for the grid: focusing the container forwards focus
      // into the last-focused (or first) cell; arrow keys then navigate.
      tabIndex={0}
      onFocus={handleGridFocus}
      onKeyDown={handleGridKeyDown}
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
        data-scrolled-left={hasPinned && scrolledLeft ? '' : undefined}
        data-scrolled-right={hasPinned && scrolledRight ? '' : undefined}
        onScroll={(e) => {
          if (isVirtual) handleScroll();
          if (hasPinned) handleHorizontalScroll();
          // suppress unused
          void e;
        }}
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
                    position: stickyHeader || hasPinned ? 'sticky' : 'static',
                    top: 0,
                    left: hasPinned ? 0 : undefined,
                    zIndex: 3,
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
                const pinnedHeaderStyle = getPinnedStyle(col, true);
                const isPinned = !!pinnedOffsets[col.key];

                return (
                  <th
                    key={col.key}
                    scope="col"
                    role="columnheader"
                    data-pinned={pinnedOffsets[col.key]?.side}
                    aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : (isSortable ? 'none' : undefined)}
                    className={tkx('text-xs font-semibold uppercase tracking-wider')}
                    style={{
                      ...getColStyle(col),
                      position: stickyHeader || isPinned ? 'sticky' : 'static',
                      top: 0,
                      zIndex: isPinned ? (pinnedHeaderStyle.zIndex as number) : 2,
                      backgroundColor: theme.surface,
                      color: theme.textMuted,
                      borderBottom: `2px solid ${theme.border}`,
                      borderRight,
                      cursor: isSortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      transition: reduced ? 'none' : 'background-color 150ms ease',
                      // Pinned-cell overrides (left/right offset + box-shadow).
                      // Spread AFTER base so sticky offset & shadow win.
                      ...pinnedHeaderStyle,
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
                      ...(hasPinned
                        ? { position: 'sticky', left: 0, zIndex: 2 }
                        : {}),
                    }}
                  />
                )}
                {columns.map(col => {
                  const pinned = pinnedOffsets[col.key];
                  return (
                  <th
                    key={col.key}
                    scope="col"
                    data-pinned={pinned?.side}
                    style={{
                      backgroundColor: theme.surfaceAlt,
                      borderBottom: `1px solid ${theme.border}`,
                      borderRight,
                      padding: `4px ${px}`,
                      ...(pinned
                        ? {
                            position: 'sticky',
                            [pinned.side]: pinned.offset,
                            zIndex: 2,
                          }
                        : {}),
                    }}
                  >
                    {(col.filterable || showFilters) && (
                      <input
                        type="text"
                        value={filters[col.key] ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleFilterChange(col.key, e.target.value)
                        }
                        placeholder={`${t.filterPlaceholder.replace(/[.…]+$/, '')} ${col.header}…`}
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
                  );
                })}
              </tr>
            )}
          </thead>

          {/* ── Loading ───────────────────────────────────────────── */}
          {loading && <LoadingOverlay colCount={totalCols} />}

          {/* ── Body ──────────────────────────────────────────────── */}
          {!loading && (
            <tbody>
              {(isTreeMode ? visibleTreeRows.length === 0 : pagedItems.length === 0) ? (
                <tr>
                  <td colSpan={totalCols} className={tkx('text-center py-10')}
                    style={{ color: theme.textMuted }}>
                    {safeEmpty}
                  </td>
                </tr>
              ) : isTreeMode ? (
                <>
                  {visibleTreeSlice.map((entry) => {
                    const { row, depth, hasChildren, isExpanded, siblingCount, siblingIndex, id } = entry;
                    const isSelected = selectedSet.has(id);
                    const isStriped = striped && siblingIndex % 2 === 1;
                    let rowBg = 'transparent';
                    if (isSelected) rowBg = `${theme.primary}22`;
                    else if (isStriped) rowBg = theme.surfaceAlt;
                    return (
                      <tr
                        key={id}
                        role="row"
                        data-tree-row=""
                        data-row-id={id}
                        data-tree-depth={depth}
                        aria-level={depth + 1}
                        aria-setsize={siblingCount}
                        aria-posinset={siblingIndex + 1}
                        aria-expanded={hasChildren ? isExpanded : undefined}
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
                        }}
                      >
                        {selectable && (
                          <td
                            role="gridcell"
                            tabIndex={-1}
                            style={{
                              borderBottom: `1px solid ${theme.border}`,
                              borderRight,
                              padding: `${py} ${px}`,
                              textAlign: 'center',
                              width: 40,
                              ...(hasPinned
                                ? { position: 'sticky', left: 0, zIndex: 2, backgroundColor: theme.surface }
                                : {}),
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
                        {columns.map(col => {
                          const value = getCellValue(row, col.key);
                          const cellContent = col.renderCell
                            ? col.renderCell(value, row)
                            : typeof value === 'string'
                              ? sanitizeString(value)
                              : String(value ?? '');
                          const pinnedCellStyle = getPinnedStyle(col, false);
                          const editableHere = isColumnEditable(col, row);
                          const isEditing =
                            editing?.rowId === id && editing.columnKey === col.key;
                          const isSaving =
                            savingCell?.rowId === id &&
                            savingCell.columnKey === col.key;
                          const cellKey = `${id}::${col.key}`;
                          const isTreeCol = col.key === treeColumnKey;
                          const caretLabelBase =
                            typeof value === 'string' && value
                              ? value
                              : String(id);
                          return (
                            <td
                              key={col.key}
                              role="gridcell"
                              data-pinned={pinnedOffsets[col.key]?.side}
                              data-tree-cell={isTreeCol ? '' : undefined}
                              data-editing={isEditing ? '' : undefined}
                              data-saving={isSaving ? '' : undefined}
                              aria-readonly={editableHere ? 'false' : undefined}
                              tabIndex={editableHere ? 0 : -1}
                              ref={el => {
                                if (el) cellRefs.current.set(cellKey, el);
                                else cellRefs.current.delete(cellKey);
                              }}
                              onDoubleClick={
                                editableHere && !isEditing
                                  ? e => {
                                      e.stopPropagation();
                                      enterEdit(id, col, row);
                                    }
                                  : undefined
                              }
                              onKeyDown={
                                editableHere && !isEditing
                                  ? e => {
                                      if (e.key === 'Enter' || e.key === 'F2') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        enterEdit(id, col, row);
                                      }
                                    }
                                  : undefined
                              }
                              className={tkx('text-sm')}
                              style={{
                                ...getColStyle(col),
                                borderBottom: `1px solid ${theme.border}`,
                                borderRight,
                                color: theme.text,
                                overflow: isEditing ? 'visible' : 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: isEditing ? 'normal' : 'nowrap',
                                opacity: isSaving ? 0.6 : 1,
                                cursor: editableHere && !isEditing ? 'text' : undefined,
                                ...pinnedCellStyle,
                              }}
                            >
                              {isEditing ? (
                                <CellEditor
                                  col={col}
                                  row={row}
                                  initialValue={value}
                                  onCommit={v => handleCellCommit(row, col, v)}
                                  onCancel={() => handleCellCancel(row, col)}
                                />
                              ) : isTreeCol ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
                                  <span
                                    aria-hidden="true"
                                    style={{ display: 'inline-block', width: depth * indentSize, flexShrink: 0 }}
                                  />
                                  {hasChildren ? (
                                    <button
                                      type="button"
                                      data-tree-caret=""
                                      aria-label={isExpanded
                                        ? `Collapse ${caretLabelBase}`
                                        : `Expand ${caretLabelBase}`}
                                      onClick={e => {
                                        e.stopPropagation();
                                        toggleRowExpand(id);
                                      }}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleRowExpand(id);
                                        }
                                      }}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: TREE_CARET_BOX,
                                        height: TREE_CARET_BOX,
                                        marginRight: 6,
                                        padding: 0,
                                        border: 'none',
                                        background: 'transparent',
                                        color: theme.text,
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <TreeCaret expanded={isExpanded} />
                                    </button>
                                  ) : (
                                    <span
                                      data-tree-leaf=""
                                      aria-hidden="true"
                                      style={{
                                        display: 'inline-block',
                                        width: TREE_CARET_BOX,
                                        height: TREE_CARET_BOX,
                                        marginRight: 6,
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  <span>{cellContent}</span>
                                </span>
                              ) : (
                                cellContent
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              ) : validGroupBy ? (
                <>
                  {pagedItems.map((item, i) => {
                    if (item.type === 'group') {
                      const isExpanded = expanded.has(item.key);
                      const groupRowsId = `${gridId}-group-${item.key}`;
                      return (
                        <tr
                          key={`group:${item.key}`}
                          role="row"
                          data-group-row=""
                          data-group-key={item.key}
                          tabIndex={0}
                          onClick={() => toggleGroup(item.key)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleGroup(item.key);
                            }
                          }}
                          style={{
                            backgroundColor: theme.surfaceAlt,
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {selectable && (
                            <td
                              style={{
                                borderBottom: `1px solid ${theme.border}`,
                                borderRight,
                                padding: `${py} ${px}`,
                                width: 40,
                                backgroundColor: theme.surfaceAlt,
                                ...(hasPinned
                                  ? { position: 'sticky', left: 0, zIndex: 2 }
                                  : {}),
                              }}
                            />
                          )}
                          {columns.map((col, ci) => {
                            const pinnedCellStyle = getPinnedStyle(col, false);
                            // Override pinned background to surfaceAlt so
                            // the group row reads as a single band even
                            // across pinned columns.
                            const pinned = !!pinnedOffsets[col.key];
                            const aggValue = computeAggregate(col, item.rows);
                            const isFirstCol = ci === 0;
                            return (
                              <td
                                key={col.key}
                                role={isFirstCol ? 'rowheader' : 'gridcell'}
                                tabIndex={-1}
                                data-pinned={pinnedOffsets[col.key]?.side}
                                aria-expanded={isFirstCol ? isExpanded : undefined}
                                aria-controls={isFirstCol ? groupRowsId : undefined}
                                className={tkx('text-sm')}
                                style={{
                                  ...getColStyle(col),
                                  borderBottom: `1px solid ${theme.border}`,
                                  borderRight,
                                  color: theme.text,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  ...pinnedCellStyle,
                                  ...(pinned
                                    ? { backgroundColor: theme.surfaceAlt }
                                    : {}),
                                }}
                              >
                                {isFirstCol ? (
                                  <span>
                                    <GroupCaret expanded={isExpanded} />
                                    {sanitizeString(item.key) || '(empty)'}
                                    <span
                                      style={{
                                        marginLeft: 8,
                                        fontWeight: 400,
                                        color: theme.textMuted,
                                        fontSize: 12,
                                      }}
                                    >
                                      ({item.rows.length} row{item.rows.length !== 1 ? 's' : ''})
                                    </span>
                                    {aggValue !== undefined && col.key !== validGroupBy && (
                                      <span
                                        style={{
                                          marginLeft: 12,
                                          fontWeight: 400,
                                          color: theme.textMuted,
                                          fontSize: 12,
                                        }}
                                        data-group-agg={col.key}
                                      >
                                        {String(aggValue)}
                                      </span>
                                    )}
                                  </span>
                                ) : aggValue !== undefined ? (
                                  <span data-group-agg={col.key}>
                                    {String(aggValue)}
                                  </span>
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    }
                    // Detail row
                    const row = item.row;
                    const rowIndex = i;
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
                        data-group-key={String((row as Record<string, unknown>)[validGroupBy] ?? '')}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        onKeyDown={onRowClick ? e => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(row); }
                        } : undefined}
                        tabIndex={onRowClick ? 0 : undefined}
                        className={tkx(onRowClick ? 'cursor-pointer' : '')}
                        style={{
                          backgroundColor: rowBg,
                          transition: reduced ? 'none' : 'background-color 120ms ease',
                        }}
                      >
                        {selectable && (
                          <td
                            role="gridcell"
                            tabIndex={-1}
                            style={{
                              borderBottom: `1px solid ${theme.border}`,
                              borderRight,
                              padding: `${py} ${px}`,
                              textAlign: 'center',
                              width: 40,
                              ...(hasPinned
                                ? {
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 2,
                                    backgroundColor: theme.surface,
                                  }
                                : {}),
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
                        {columns.map(col => {
                          const value = getCellValue(row, col.key);
                          const cellContent = col.renderCell
                            ? col.renderCell(value, row)
                            : typeof value === 'string'
                              ? sanitizeString(value)
                              : String(value ?? '');
                          const pinnedCellStyle = getPinnedStyle(col, false);
                          const editableHere = isColumnEditable(col, row);
                          const isEditing =
                            editing?.rowId === id && editing.columnKey === col.key;
                          const isSaving =
                            savingCell?.rowId === id &&
                            savingCell.columnKey === col.key;
                          const cellKey = `${id}::${col.key}`;
                          return (
                            <td
                              key={col.key}
                              role="gridcell"
                              data-pinned={pinnedOffsets[col.key]?.side}
                              data-editing={isEditing ? '' : undefined}
                              data-saving={isSaving ? '' : undefined}
                              aria-readonly={editableHere ? 'false' : undefined}
                              tabIndex={editableHere ? 0 : -1}
                              ref={el => {
                                if (el) cellRefs.current.set(cellKey, el);
                                else cellRefs.current.delete(cellKey);
                              }}
                              onDoubleClick={
                                editableHere && !isEditing
                                  ? e => {
                                      e.stopPropagation();
                                      enterEdit(id, col, row);
                                    }
                                  : undefined
                              }
                              onKeyDown={
                                editableHere && !isEditing
                                  ? e => {
                                      if (e.key === 'Enter' || e.key === 'F2') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        enterEdit(id, col, row);
                                      }
                                    }
                                  : undefined
                              }
                              className={tkx('text-sm')}
                              style={{
                                ...getColStyle(col),
                                borderBottom: `1px solid ${theme.border}`,
                                borderRight,
                                color: theme.text,
                                overflow: isEditing ? 'visible' : 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: isEditing ? 'normal' : 'nowrap',
                                opacity: isSaving ? 0.6 : 1,
                                cursor: editableHere && !isEditing ? 'text' : undefined,
                                ...pinnedCellStyle,
                              }}
                            >
                              {isEditing ? (
                                <CellEditor
                                  col={col}
                                  row={row}
                                  initialValue={value}
                                  onCommit={v => handleCellCommit(row, col, v)}
                                  onCancel={() => handleCellCancel(row, col)}
                                />
                              ) : (
                                cellContent
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
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
                            tabIndex={-1}
                            style={{
                              borderBottom: `1px solid ${theme.border}`,
                              borderRight,
                              padding: `${py} ${px}`,
                              textAlign: 'center',
                              width: 40,
                              ...(hasPinned
                                ? {
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 2,
                                    backgroundColor: theme.surface,
                                  }
                                : {}),
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

                          const pinnedCellStyle = getPinnedStyle(col, false);
                          const editableHere = isColumnEditable(col, row);
                          const isEditing =
                            editing?.rowId === id && editing.columnKey === col.key;
                          const isSaving =
                            savingCell?.rowId === id &&
                            savingCell.columnKey === col.key;
                          const cellKey = `${id}::${col.key}`;
                          return (
                            <td
                              key={col.key}
                              role="gridcell"
                              data-pinned={pinnedOffsets[col.key]?.side}
                              data-editing={isEditing ? '' : undefined}
                              data-saving={isSaving ? '' : undefined}
                              aria-readonly={editableHere ? 'false' : undefined}
                              tabIndex={editableHere ? 0 : -1}
                              ref={el => {
                                if (el) cellRefs.current.set(cellKey, el);
                                else cellRefs.current.delete(cellKey);
                              }}
                              onDoubleClick={
                                editableHere && !isEditing
                                  ? e => {
                                      e.stopPropagation();
                                      enterEdit(id, col, row);
                                    }
                                  : undefined
                              }
                              onKeyDown={
                                editableHere && !isEditing
                                  ? e => {
                                      if (e.key === 'Enter' || e.key === 'F2') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        enterEdit(id, col, row);
                                      }
                                    }
                                  : undefined
                              }
                              className={tkx('text-sm')}
                              style={{
                                ...getColStyle(col),
                                borderBottom: `1px solid ${theme.border}`,
                                borderRight,
                                color: theme.text,
                                overflow: isEditing ? 'visible' : 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: isEditing ? 'normal' : 'nowrap',
                                opacity: isSaving ? 0.6 : 1,
                                cursor: editableHere && !isEditing ? 'text' : undefined,
                                ...pinnedCellStyle,
                              }}
                            >
                              {isEditing ? (
                                <CellEditor
                                  col={col}
                                  row={row}
                                  initialValue={value}
                                  onCommit={v => handleCellCommit(row, col, v)}
                                  onCancel={() => handleCellCancel(row, col)}
                                />
                              ) : (
                                cellContent
                              )}
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