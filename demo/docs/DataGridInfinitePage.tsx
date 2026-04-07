import { useState, useCallback } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxDataGrid } from '@tekivex/ui';
import type { DataGridColumn } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions (infinite-specific) ─────────────────────────────────────

const INFINITE_PROPS = [
  { name: 'onLoadMore', type: '() => void | Promise<void>', default: 'undefined', description: 'Called when the user scrolls near the bottom (within loadMoreThreshold px). Use to fetch the next page.' },
  { name: 'hasMore', type: 'boolean', default: 'undefined', description: 'When false the sentinel is hidden and onLoadMore is never called again.' },
  { name: 'loadingMore', type: 'boolean', default: 'false', description: 'Shows a skeleton row at the bottom while a page fetch is in progress.' },
  { name: 'loadMoreThreshold', type: 'number', default: '200', description: 'Pixels from the bottom of the scroll container at which onLoadMore is triggered.' },
  { name: 'maxHeight', type: 'number | string', default: 'undefined', description: 'Constrains the grid height and enables internal scrolling — required for infinite scroll to work.' },
  { name: 'virtualScroll', type: 'boolean', default: 'auto', description: 'Enable virtual scrolling. Defaults to auto (enabled when data ≥ 50 rows and maxHeight is set).' },
  { name: 'rowHeight', type: 'number', default: '40', description: 'Row height in px used by the virtual scroll engine to calculate visible range.' },
];

// ── Data generation ───────────────────────────────────────────────────────────

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
const ROLES = ['Admin', 'Editor', 'Viewer', 'Developer', 'Manager', 'Analyst', 'Support', 'Designer'];
const STATUSES = ['Active', 'Inactive', 'Pending', 'Suspended'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomEmail(first: string, last: string, id: number): string {
  return `${first.toLowerCase()}.${last.toLowerCase()}${id}@example.com`;
}

function randomDate(): string {
  const start = new Date(2020, 0, 1).getTime();
  const end = new Date(2025, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

function generateRows(startId: number, count: number): UserRow[] {
  return Array.from({ length: count }, (_, i) => {
    const id = startId + i;
    const first = randomItem(FIRST_NAMES);
    const last = randomItem(LAST_NAMES);
    return {
      id,
      name: `${first} ${last}`,
      email: randomEmail(first, last, id),
      role: randomItem(ROLES),
      status: randomItem(STATUSES),
      joinDate: randomDate(),
    };
  });
}

// ── Columns ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Active: '#10b981',
  Inactive: '#6b7280',
  Pending: '#f59e0b',
  Suspended: '#ef4444',
};

function makeColumns(theme: ThemeTokens): DataGridColumn<UserRow>[] {
  return [
    { key: 'id', header: 'ID', width: 60, sortable: true, align: 'right' },
    { key: 'name', header: 'Name', width: 160, sortable: true },
    { key: 'email', header: 'Email', width: 220, sortable: true },
    { key: 'role', header: 'Role', width: 120, sortable: true },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      sortable: true,
      renderCell: (value: string) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: `${STATUS_COLORS[value] ?? '#6b7280'}20`,
          color: STATUS_COLORS[value] ?? '#6b7280',
          border: `1px solid ${STATUS_COLORS[value] ?? '#6b7280'}40`,
        }}>
          {value}
        </span>
      ),
    },
    { key: 'joinDate', header: 'Join Date', width: 120, sortable: true },
  ];
}

const MAX_ROWS = 300;
const PAGE_SIZE = 25;
const FETCH_DELAY = 800;

// ── Page ──────────────────────────────────────────────────────────────────────

export function DataGridInfinitePage({ theme }: { theme: ThemeTokens }) {
  const columns = makeColumns(theme);

  // Demo 1: Infinite scroll
  const [rows1, setRows1] = useState<UserRow[]>(() => generateRows(1, 50));
  const [loading1, setLoading1] = useState(false);
  const [hasMore1, setHasMore1] = useState(true);

  const handleLoadMore1 = useCallback(() => {
    if (loading1) return;
    setLoading1(true);
    setTimeout(() => {
      setRows1((prev) => {
        const next = [...prev, ...generateRows(prev.length + 1, PAGE_SIZE)];
        if (next.length >= MAX_ROWS) setHasMore1(false);
        return next;
      });
      setLoading1(false);
    }, FETCH_DELAY);
  }, [loading1]);

  // Demo 2: Virtual + Infinite
  const [rows2, setRows2] = useState<UserRow[]>(() => generateRows(1, 50));
  const [loading2, setLoading2] = useState(false);
  const [hasMore2, setHasMore2] = useState(true);

  const handleLoadMore2 = useCallback(() => {
    if (loading2) return;
    setLoading2(true);
    setTimeout(() => {
      setRows2((prev) => {
        const next = [...prev, ...generateRows(prev.length + 1, PAGE_SIZE)];
        if (next.length >= MAX_ROWS) setHasMore2(false);
        return next;
      });
      setLoading2(false);
    }, FETCH_DELAY);
  }, [loading2]);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>
      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxDataGrid — Infinite Scroll
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        Demonstrates the onLoadMore / hasMore / loadingMore props for infinite scroll pagination.
        The grid calls onLoadMore when the user scrolls within loadMoreThreshold pixels of the bottom.
        Rows accumulate up to 300 before hasMore is set to false.
      </p>

      {/* ── 1. Infinite Scroll ── */}
      <DemoSection
        title="Infinite Scroll DataGrid"
        description="Starts with 50 rows. Scroll to the bottom to trigger onLoadMore which appends 25 rows after an 800ms simulated network delay. loadingMore=true shows a skeleton row while fetching. Stops at 300 rows (hasMore=false)."
        theme={theme}
        code={`const [rows, setRows] = useState(initialRows); // 50 rows
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

const handleLoadMore = () => {
  setLoading(true);
  setTimeout(() => {
    setRows(prev => {
      const next = [...prev, ...fetchNextPage(25)];
      if (next.length >= 300) setHasMore(false);
      return next;
    });
    setLoading(false);
  }, 800);
};

<TkxDataGrid
  columns={columns}
  data={rows}
  rowKey="id"
  maxHeight={500}
  stickyHeader={true}
  sortable={true}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
  loadingMore={loading}
/>`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>
              {rows1.length} rows loaded
              {!hasMore1 && ' — all rows loaded'}
              {loading1 && ' — fetching...'}
            </span>
            {!hasMore1 && (
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: `${theme.success}20`,
                color: theme.success,
                border: `1px solid ${theme.success}40`,
                fontWeight: 600,
              }}>
                All {MAX_ROWS} rows loaded
              </span>
            )}
          </div>
          <TkxDataGrid
            columns={columns}
            data={rows1}
            rowKey="id"
            maxHeight={500}
            stickyHeader={true}
            sortable={true}
            striped={true}
            onLoadMore={handleLoadMore1}
            hasMore={hasMore1}
            loadingMore={loading1}
          />
        </div>
      </DemoSection>

      {/* ── 2. Virtual + Infinite ── */}
      <DemoSection
        title="Virtual Scroll + Infinite Scroll"
        description="Same infinite scroll behavior but with virtualScroll=true and rowHeight=44 set explicitly. Virtual scrolling only renders visible rows in the DOM, making it efficient for thousands of items."
        theme={theme}
        code={`<TkxDataGrid
  columns={columns}
  data={rows}
  rowKey="id"
  maxHeight={500}
  stickyHeader={true}
  sortable={true}
  virtualScroll={true}
  rowHeight={44}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
  loadingMore={loading}
/>`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>
              {rows2.length} rows loaded (virtual DOM)
              {!hasMore2 && ' — all rows loaded'}
              {loading2 && ' — fetching...'}
            </span>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: `${theme.primary}20`,
              color: theme.primary,
              border: `1px solid ${theme.primary}40`,
              fontWeight: 600,
            }}>
              virtualScroll=true
            </span>
          </div>
          <TkxDataGrid
            columns={columns}
            data={rows2}
            rowKey="id"
            maxHeight={500}
            stickyHeader={true}
            sortable={true}
            striped={true}
            virtualScroll={true}
            rowHeight={44}
            onLoadMore={handleLoadMore2}
            hasMore={hasMore2}
            loadingMore={loading2}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Infinite Scroll Props
      </h2>
      <PropTable props={INFINITE_PROPS} />
    </div>
  );
}
