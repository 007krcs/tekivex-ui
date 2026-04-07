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
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  maxHeight?: number | string;
  onRowClick?: (row: T) => void;
  /** Enable virtual scrolling. Defaults to auto (enabled when data has 50+ rows and maxHeight is set). */
  virtualScroll?: boolean;
  /** Row height in pixels for virtual scrolling calculations. Default: 40 */
  rowHeight?: number;
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
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        fill={checked || indeterminate ? theme.primary : 'transparent'}
        stroke={checked || indeterminate ? theme.primary : theme.border}
        strokeWidth="1.5"
      />
      {indeterminate && (
        <line x1="4" y1="8" x2="12" y2="8" stroke={theme.bg} strokeWidth="2" />
      )}
      {checked && !indeterminate && (
        <path d="M4.5 8L7 10.5L11.5 5.5" fill="none" stroke={theme.bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

// ── Loading skeleton ────────────────────────────────────────────────────────

function LoadingOverlay({ colCount }: { colCount: number }) {
  const theme = useTheme();
  const rows = Array.from({ length: 5 }, (_, i) => i);
  return (
    <tbody>
      {rows.map((r) => (
        <tr key={r}>
          {Array.from({ length: colCount }, (_, c) => (
            <td
              key={c}
              className={tkx('px-3 py-2')}
              style={{ borderBottom: `1px solid ${theme.border}` }}
            >
              <TkxSkeleton height={16} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
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
}: TkxDataGridProps<T>) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const gridId = useId();

  // ── Virtual scroll ────────────────────────────────────────────────────

  const OVERSCAN = 10;
  const isVirtual =
    virtualScroll !== undefined
      ? virtualScroll
      : maxHeight !== undefined && data.length >= 50;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    setScrollTop(scrollContainerRef.current.scrollTop);
  }, []);

  useEffect(() => {
    if (!isVirtual || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    setContainerHeight(el.clientHeight);
    const ro = new ResizeObserver(() => {
      setContainerHeight(el.clientHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isVirtual]);

  const totalHeight = data.length * rowHeight;
  const startIndex = isVirtual
    ? Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN)
    : 0;
  const endIndex = isVirtual
    ? Math.min(data.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + OVERSCAN)
    : data.length;
  const visibleData = isVirtual ? data.slice(startIndex, endIndex) : data;
  const offsetY = startIndex * rowHeight;

  // ── Sort state ──────────────────────────────────────────────────────────

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback(
    (key: string) => {
      let nextDir: 'asc' | 'desc' = 'asc';
      if (sortKey === key) {
        nextDir = sortDir === 'asc' ? 'desc' : 'asc';
      }
      setSortKey(key);
      setSortDir(nextDir);
      onSort?.(key, nextDir);
    },
    [sortKey, sortDir, onSort],
  );

  // ── Selection logic ─────────────────────────────────────────────────────

  const selectedSet = useMemo(() => new Set(selectedRows), [selectedRows]);
  const allIds = useMemo(
    () => data.map((row) => getRowId(row, rowKey)),
    [data, rowKey],
  );
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = allIds.some((id) => selectedSet.has(id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(allIds);
    }
  }, [allSelected, allIds, onSelectionChange]);

  const toggleRow = useCallback(
    (id: string) => {
      const next = selectedSet.has(id)
        ? selectedRows.filter((r) => r !== id)
        : [...selectedRows, id];
      onSelectionChange?.(next);
    },
    [selectedSet, selectedRows, onSelectionChange],
  );

  // ── Column resize ─────────────────────────────────────────────────────

  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
  } | null>(null);

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
        const diff = ev.clientX - resizeRef.current.startX;
        const newWidth = Math.max(50, resizeRef.current.startWidth + diff);
        setColWidths((prev) => ({ ...prev, [resizeRef.current!.key]: newWidth }));
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

  // ── Cell sizing ─────────────────────────────────────────────────────────

  const py = compact ? '4px' : '8px';
  const px = compact ? '8px' : '12px';

  const getColStyle = (col: DataGridColumn<T>): CSSProperties => {
    const w = colWidths[col.key] || col.width;
    return {
      width: w ? (typeof w === 'number' ? w : w) : undefined,
      minWidth: w ? (typeof w === 'number' ? w : w) : 80,
      textAlign: col.align ?? 'left',
      padding: `${py} ${px}`,
    };
  };

  // ── Render helpers ────────────────────────────────────────────────────

  const borderStyle = bordered
    ? `1px solid ${theme.border}`
    : 'none';

  const safeEmpty = sanitizeString(emptyMessage);

  const totalCols = columns.length + (selectable ? 1 : 0);

  return (
    <div
      role="grid"
      aria-label="Data grid"
      id={gridId}
      className={tkx('font-sans rounded-lg overflow-hidden')}
      style={{
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.bg,
      }}
    >
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
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
            tableLayout: 'auto',
          }}
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <thead>
            <tr>
              {/* Selection header */}
              {selectable && (
                <th
                  scope="col"
                  className={tkx('shrink-0')}
                  style={{
                    position: stickyHeader ? 'sticky' : 'static',
                    top: 0,
                    zIndex: 2,
                    backgroundColor: theme.surface,
                    borderBottom: `2px solid ${theme.border}`,
                    borderRight: bordered ? borderStyle : 'none',
                    padding: `${py} ${px}`,
                    width: 40,
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={toggleAll}
                    aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                    className={tkx(
                      'bg-transparent border-none cursor-pointer p-0',
                      'flex items-center justify-center',
                      'focus-visible:focus-ring',
                    )}
                    style={{ margin: '0 auto' }}
                  >
                    <CheckboxIcon
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                    />
                  </button>
                </th>
              )}

              {/* Column headers */}
              {columns.map((col) => {
                const isSortable = (col.sortable ?? sortable) && col.sortable !== false;
                const isSorted = sortKey === col.key;
                const safeHeader = sanitizeString(col.header);

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      isSorted
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={tkx('text-xs font-semibold uppercase tracking-wider')}
                    style={{
                      ...getColStyle(col),
                      position: stickyHeader ? 'sticky' : 'static',
                      top: 0,
                      zIndex: 2,
                      backgroundColor: theme.surface,
                      color: theme.textMuted,
                      borderBottom: `2px solid ${theme.border}`,
                      borderRight: bordered ? borderStyle : 'none',
                      cursor: isSortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      transition: reduced ? 'none' : 'background-color 150ms ease',
                    }}
                    onClick={isSortable ? () => handleSort(col.key) : undefined}
                    onKeyDown={
                      isSortable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort(col.key);
                            }
                          }
                        : undefined
                    }
                    tabIndex={isSortable ? 0 : undefined}
                    role={isSortable ? 'columnheader button' : 'columnheader'}
                  >
                    <div className={tkx('flex items-center gap-1')}>
                      {col.renderHeader ? col.renderHeader(col) : safeHeader}
                      {isSortable && (
                        <SortIcon direction={isSorted ? sortDir : null} />
                      )}

                      {/* Resize handle */}
                      {col.resizable && (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize column ${safeHeader}`}
                          className={tkx('cursor-col-resize shrink-0')}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            backgroundColor: 'transparent',
                          }}
                          onMouseDown={(e) => handleResizeStart(col.key, e)}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Loading ───────────────────────────────────────────── */}
          {loading && <LoadingOverlay colCount={totalCols} />}

          {/* ── Body ──────────────────────────────────────────────── */}
          {!loading && (
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalCols}
                    className={tkx('text-center py-10')}
                    style={{ color: theme.textMuted }}
                  >
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
                  if (isSelected) rowBg = `${theme.primary}15`;
                  else if (isStriped) rowBg = theme.surfaceAlt;

                  return (
                    <tr
                      key={id}
                      role="row"
                      aria-selected={selectable ? isSelected : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={tkx(onRowClick ? 'cursor-pointer' : '')}
                      style={{
                        backgroundColor: rowBg,
                        transition: reduced
                          ? 'none'
                          : 'background-color 120ms ease',
                        ...(isVirtual ? { height: rowHeight, boxSizing: 'border-box' } : {}),
                      }}
                      onMouseEnter={
                        onRowClick
                          ? (e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor =
                                isSelected
                                  ? `${theme.primary}22`
                                  : `${theme.surfaceAlt}`;
                            }
                          : undefined
                      }
                      onMouseLeave={
                        onRowClick
                          ? (e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = rowBg;
                            }
                          : undefined
                      }
                    >
                      {/* Selection checkbox */}
                      {selectable && (
                        <td
                          style={{
                            borderBottom: `1px solid ${theme.border}`,
                            borderRight: bordered ? borderStyle : 'none',
                            padding: `${py} ${px}`,
                            textAlign: 'center',
                            width: 40,
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(id);
                            }}
                            aria-label={
                              isSelected
                                ? `Deselect row ${id}`
                                : `Select row ${id}`
                            }
                            className={tkx(
                              'bg-transparent border-none cursor-pointer p-0',
                              'flex items-center justify-center',
                              'focus-visible:focus-ring',
                            )}
                            style={{ margin: '0 auto' }}
                          >
                            <CheckboxIcon checked={isSelected} />
                          </button>
                        </td>
                      )}

                      {/* Data cells */}
                      {columns.map((col) => {
                        const value = getCellValue(row, col.key);
                        const cellContent = col.renderCell
                          ? col.renderCell(value, row)
                          : typeof value === 'string'
                            ? sanitizeString(value)
                            : String(value ?? '');

                        return (
                          <td
                            key={col.key}
                            className={tkx('text-sm')}
                            style={{
                              ...getColStyle(col),
                              borderBottom: `1px solid ${theme.border}`,
                              borderRight: bordered ? borderStyle : 'none',
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
                {isVirtual && endIndex < data.length && (
                  <tr aria-hidden="true">
                    <td colSpan={totalCols} style={{ height: (data.length - endIndex) * rowHeight, padding: 0, border: 'none' }} />
                  </tr>
                )}
                </>
              )}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
