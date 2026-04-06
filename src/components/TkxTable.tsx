import { useState, useMemo, type ReactNode } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { TkxSkeleton } from './TkxSkeleton';
import { tkx } from '../engine/tkx';

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
}

function SortIcon({ dir }: { dir: SortDirection }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={tkx('shrink-0')}>
      {dir === 'asc' ? <path d="M7 14l5-5 5 5H7z" /> : dir === 'desc' ? <path d="M7 10l5 5 5-5H7z" /> : <path d="M7 10l5 5 5-5H7zM7 14l5-5 5 5H7z" opacity="0.4" />}
    </svg>
  );
}

export function TkxTable<T extends Record<string, unknown>>({
  columns, data, caption, sortable, stickyHeader, isLoading, emptyState, style, className, striped,
}: TkxTableProps<T>) {
  const theme = useTheme();
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey || !sortable) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      let cmp = 0;
      if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
      else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, sortable]);

  function handleSort(key: keyof T) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function getDir(key: keyof T): SortDirection {
    return sortKey !== key ? 'none' : sortDir;
  }

  return (
    <div
      className={tkx('w-full overflow-x-auto rounded-lg', className ?? '')}
      style={{ border: `1px solid ${theme.border}`, ...style }}
    >
      <table
        className={tkx('w-full font-sans text-sm')}
        style={{ borderCollapse: 'collapse', color: theme.text }}
      >
        {caption && (
          <caption className={tkx('text-sm text-left p-2')} style={{ color: theme.textMuted }}>
            {sanitizeString(caption)}
          </caption>
        )}

        <thead style={stickyHeader ? { position: 'sticky', top: 0, backgroundColor: theme.surfaceAlt, zIndex: 1 } : { backgroundColor: theme.surfaceAlt }}>
          <tr>
            {columns.map((col) => {
              const canSort = sortable && col.sortable !== false;
              const dir = getDir(col.key);
              return (
                <th
                  key={String(col.key)}
                  scope="col"
                  aria-sort={canSort ? (dir === 'none' ? 'none' : dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={tkx('px-4 py-3 text-left font-semibold whitespace-nowrap', canSort ? 'cursor-pointer select-none focus-visible:focus-ring' : '')}
                  style={{ color: theme.textMuted, borderBottom: `2px solid ${theme.border}`, width: col.width }}
                  onClick={() => canSort && handleSort(col.key)}
                  onKeyDown={(e) => { if (canSort && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleSort(col.key); } }}
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

        <tbody>
          {isLoading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className={tkx('px-4 py-3')}>
                      <TkxSkeleton variant="text" height="16px" />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className={tkx('px-4 py-8 text-center')} style={{ color: theme.textMuted }}>
                    {emptyState ?? 'No data available'}
                  </td>
                </tr>
              )
              : sorted.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    backgroundColor: striped && ri % 2 === 1 ? theme.surfaceAlt : 'transparent',
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >
                  {columns.map((col) => {
                    const raw = row[col.key];
                    const cell = col.render ? col.render(raw, row) : (typeof raw === 'string' ? sanitizeString(raw) : String(raw ?? ''));
                    return (
                      <td key={String(col.key)} className={tkx('px-4 py-3')} style={{ color: theme.text }}>
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
