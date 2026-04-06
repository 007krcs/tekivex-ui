import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxTable, TkxBadge, TkxButton, TkxAvatar,
} from '@tekivex/ui';
import type { ColumnDef } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';
import type { CSSProperties, ReactNode } from 'react';

interface Props { theme: ThemeTokens }

// ── Type definitions ──────────────────────────────────────────────────────────

interface UserRow extends Record<string, unknown> {
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

interface ProductRow extends Record<string, unknown> {
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
}

interface OrderRow extends Record<string, unknown> {
  orderId: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
}

// ── Sample data ───────────────────────────────────────────────────────────────

const USERS: UserRow[] = [
  { name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'Active', joined: 'Jan 12, 2023' },
  { name: 'Bob Martinez', email: 'bob@example.com', role: 'Editor', status: 'Active', joined: 'Mar 4, 2023' },
  { name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive', joined: 'Jun 21, 2023' },
  { name: 'David Kim', email: 'david@example.com', role: 'Editor', status: 'Active', joined: 'Aug 9, 2023' },
  { name: 'Elena Santos', email: 'elena@example.com', role: 'Admin', status: 'Suspended', joined: 'Oct 30, 2023' },
];

const PRODUCTS: ProductRow[] = [
  { name: 'Wireless Headphones', category: 'Electronics', price: 89.99, stock: 142, sku: 'WH-001' },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 149.00, stock: 58, sku: 'KB-042' },
  { name: 'Ergonomic Chair', category: 'Furniture', price: 399.00, stock: 12, sku: 'CH-088' },
  { name: 'Standing Desk Mat', category: 'Furniture', price: 49.95, stock: 0, sku: 'DM-013' },
  { name: 'USB-C Hub', category: 'Accessories', price: 34.99, stock: 230, sku: 'HB-007' },
];

const ORDERS: OrderRow[] = [
  { orderId: '#10034', customer: 'Alice Chen', date: 'Apr 1, 2026', amount: 238.97, status: 'Delivered' },
  { orderId: '#10035', customer: 'Bob Martinez', date: 'Apr 2, 2026', amount: 149.00, status: 'Processing' },
  { orderId: '#10036', customer: 'Carol White', date: 'Apr 3, 2026', amount: 89.99, status: 'Shipped' },
  { orderId: '#10037', customer: 'David Kim', date: 'Apr 4, 2026', amount: 484.94, status: 'Processing' },
  { orderId: '#10038', customer: 'Elena Santos', date: 'Apr 5, 2026', amount: 34.99, status: 'Cancelled' },
];

// ── Status badge helpers ──────────────────────────────────────────────────────

function UserStatusBadge({ status }: { status: string }) {
  const variant =
    status === 'Active' ? 'success' :
    status === 'Inactive' ? 'default' : 'danger';
  return <TkxBadge variant={variant} size="sm">{status}</TkxBadge>;
}

function OrderStatusBadge({ status }: { status: string }) {
  const variant =
    status === 'Delivered' ? 'success' :
    status === 'Shipped' ? 'info' :
    status === 'Processing' ? 'warning' : 'danger';
  return <TkxBadge variant={variant} size="sm">{status}</TkxBadge>;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <TkxBadge variant="danger" size="sm">Out of stock</TkxBadge>;
  if (stock < 20) return <TkxBadge variant="warning" size="sm">Low ({stock})</TkxBadge>;
  return <TkxBadge variant="success" size="sm">{stock} in stock</TkxBadge>;
}

// ── Column definitions ────────────────────────────────────────────────────────

const USER_COLUMNS: ColumnDef<UserRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'status', header: 'Status' },
  { key: 'joined', header: 'Joined', sortable: true },
];

const USER_COLUMNS_CUSTOM = (theme: ThemeTokens): ColumnDef<UserRow>[] => [
  {
    key: 'name',
    header: 'User',
    render: (_val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TkxAvatar
          alt={row.name as string}
          initials={(row.name as string).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          size="sm"
        />
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: theme.text }}>{row.name as string}</div>
          <div style={{ fontSize: '12px', color: theme.textMuted }}>{row.email as string}</div>
        </div>
      </div>
    ),
  },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    render: (val) => <UserStatusBadge status={val as string} />,
  },
  { key: 'joined', header: 'Joined' },
  {
    key: 'email',
    header: 'Actions',
    render: () => (
      <div style={{ display: 'flex', gap: 6 }}>
        <TkxButton variant="ghost" size="sm">Edit</TkxButton>
        <TkxButton variant="ghost" size="sm">View</TkxButton>
      </div>
    ),
  },
];

const PRODUCT_COLUMNS = (theme: ThemeTokens): ColumnDef<ProductRow>[] => [
  {
    key: 'name',
    header: 'Product',
    render: (_val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}`, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: theme.text }}>{row.name as string}</div>
          <div style={{ fontSize: '11px', color: theme.textMuted }}>{row.sku as string}</div>
        </div>
      </div>
    ),
  },
  { key: 'category', header: 'Category' },
  {
    key: 'price',
    header: 'Price',
    sortable: true,
    render: (val) => <span style={{ fontWeight: 600 }}>${(val as number).toFixed(2)}</span>,
  },
  {
    key: 'stock',
    header: 'Stock',
    sortable: true,
    render: (val) => <StockBadge stock={val as number} />,
  },
  {
    key: 'sku',
    header: 'Actions',
    render: () => (
      <div style={{ display: 'flex', gap: 6 }}>
        <TkxButton variant="outline" size="sm">Edit</TkxButton>
        <TkxButton variant="ghost" size="sm">Delete</TkxButton>
      </div>
    ),
  },
];

const ORDER_COLUMNS: ColumnDef<OrderRow>[] = [
  { key: 'orderId', header: 'Order ID', sortable: true },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'date', header: 'Date', sortable: true },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    render: (val) => <span style={{ fontWeight: 600 }}>${(val as number).toFixed(2)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (val) => <OrderStatusBadge status={val as string} />,
  },
];

// ── Empty state example ───────────────────────────────────────────────────────

function EmptyStatePlaceholder({ theme }: { theme: ThemeTokens }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.border} strokeWidth={1.5} style={{ marginBottom: 12 }} aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px', color: theme.text }}>No results found</p>
      <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted }}>Try adjusting your filters or search terms.</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function TablePage({ theme }: Props) {
  const pageStyle: CSSProperties = { maxWidth: '860px', margin: '0 auto', padding: '48px 32px 80px' };
  const h1Style: CSSProperties = { fontSize: '2rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em' };
  const descStyle: CSSProperties = { fontSize: '15px', color: theme.textMuted, lineHeight: '1.7', maxWidth: '620px', margin: '0 0 24px' };
  const h2Style: CSSProperties = { fontSize: '1.2rem', fontWeight: 700, color: theme.text, margin: '48px 0 16px', letterSpacing: '-0.02em' };
  const noteStyle: CSSProperties = { fontSize: '13px', color: theme.textMuted, lineHeight: '1.7', padding: '16px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt + '50' };
  const badgeStyle: CSSProperties = {
    display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
    backgroundColor: theme.primary + '18', color: theme.primary,
    border: '1px solid ' + theme.primary + '35', marginBottom: '24px',
  };

  return (
    <div style={pageStyle}>
      {/* Hero */}
      <span style={badgeStyle}>Component Docs</span>
      <h1 style={h1Style}>TkxTable</h1>
      <p style={descStyle}>
        <strong>TkxTable</strong> is a fully-featured data table built on an accessible <code>table</code> element.
        It supports sortable columns with <code>aria-sort</code>, sticky headers, loading skeletons,
        custom cell rendering via render props, striped rows, and empty states.
      </p>
      <WCAGBadgeGroup
        label="WCAG Compliance"
        badges={[
          { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
          { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
        ]}
      />

      {/* 1. Basic Table */}
      <DemoSection
        theme={theme}
        title="Basic Table"
        description="A five-column users table with name, email, role, status, and join date. Data is passed as a typed array."
        code={`const columns: ColumnDef<UserRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
  { key: 'joined', header: 'Joined' },
];

<TkxTable columns={columns} data={users} />`}
      >
        <TkxTable columns={USER_COLUMNS} data={USERS} />
      </DemoSection>

      {/* 2. Sortable Columns */}
      <DemoSection
        theme={theme}
        title="Sortable Columns"
        description="Pass sortable=true on the table and mark individual columns as sortable. Click a header to sort ascending; click again for descending."
        code={`const columns: ColumnDef<UserRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'joined', header: 'Joined', sortable: true },
];

<TkxTable columns={columns} data={users} sortable />`}
      >
        <TkxTable
          columns={USER_COLUMNS}
          data={USERS}
          sortable
        />
      </DemoSection>

      {/* 3. Striped Rows */}
      <DemoSection
        theme={theme}
        title="Striped Rows"
        description="Pass striped=true to alternate the background colour of even/odd rows. Improves readability for wide tables."
        code={`<TkxTable columns={columns} data={users} striped />`}
      >
        <TkxTable columns={USER_COLUMNS} data={USERS} striped />
      </DemoSection>

      {/* 4. Sticky Header */}
      <DemoSection
        theme={theme}
        title="Sticky Header"
        description="stickyHeader=true makes the thead stick to the top when the table overflows its container. Wrap in a height-constrained div."
        code={`<div style={{ maxHeight: 220, overflowY: 'auto' }}>
  <TkxTable
    columns={columns}
    data={users}
    stickyHeader
  />
</div>`}
      >
        <div style={{ maxHeight: 220, overflowY: 'auto', borderRadius: 8, border: `1px solid ${theme.border}` }}>
          <TkxTable
            columns={USER_COLUMNS}
            data={[...USERS, ...USERS]}
            stickyHeader
            style={{ border: 'none' }}
          />
        </div>
      </DemoSection>

      {/* 5. Loading State */}
      <DemoSection
        theme={theme}
        title="Loading State"
        description="Pass isLoading=true to replace table rows with animated skeleton cells. The header remains visible so the layout stays stable."
        code={`<TkxTable
  columns={columns}
  data={[]}
  isLoading
/>`}
      >
        <TkxTable columns={USER_COLUMNS} data={[]} isLoading />
      </DemoSection>

      {/* 6. Empty State */}
      <DemoSection
        theme={theme}
        title="Empty State"
        description="When data is an empty array and isLoading is false, the emptyState ReactNode is rendered in a full-width cell."
        code={`<TkxTable
  columns={columns}
  data={[]}
  emptyState={<EmptyStatePlaceholder />}
/>`}
      >
        <TkxTable
          columns={USER_COLUMNS}
          data={[]}
          emptyState={<EmptyStatePlaceholder theme={theme} />}
        />
      </DemoSection>

      {/* 7. Custom Cell Rendering */}
      <DemoSection
        theme={theme}
        title="Custom Cell Rendering"
        description="Use the render prop on any ColumnDef to return arbitrary JSX — avatars, badges, action buttons, links, anything."
        code={`const columns: ColumnDef<UserRow>[] = [
  {
    key: 'name',
    header: 'User',
    render: (_val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TkxAvatar alt={row.name} initials={getInitials(row.name)} size="sm" />
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: 12, color: theme.textMuted }}>{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (val) => <TkxBadge variant={val === 'Active' ? 'success' : 'danger'}>{val}</TkxBadge>,
  },
  {
    key: 'email',
    header: 'Actions',
    render: () => (
      <div style={{ display: 'flex', gap: 6 }}>
        <TkxButton variant="ghost" size="sm">Edit</TkxButton>
        <TkxButton variant="ghost" size="sm">View</TkxButton>
      </div>
    ),
  },
];`}
      >
        <TkxTable columns={USER_COLUMNS_CUSTOM(theme)} data={USERS} />
      </DemoSection>

      {/* 8. Products Table */}
      <DemoSection
        theme={theme}
        title="Products Table"
        description="E-commerce product table with image placeholder, name+SKU, price, stock badge, and action buttons. Price and stock are sortable."
        code={`<TkxTable columns={productColumns} data={products} sortable />`}
      >
        <TkxTable columns={PRODUCT_COLUMNS(theme)} data={PRODUCTS} sortable />
      </DemoSection>

      {/* 9. Orders Table */}
      <DemoSection
        theme={theme}
        title="Orders Table"
        description="Order management table with ID, customer, date, amount (formatted), and status badge. All columns are sortable."
        code={`const orderColumns: ColumnDef<OrderRow>[] = [
  { key: 'orderId', header: 'Order ID', sortable: true },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'date', header: 'Date', sortable: true },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    render: (val) => <span style={{ fontWeight: 600 }}>\${val.toFixed(2)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (val) => <OrderStatusBadge status={val} />,
  },
];`}
      >
        <TkxTable columns={ORDER_COLUMNS} data={ORDERS} sortable striped />
      </DemoSection>

      {/* 10. With Caption */}
      <DemoSection
        theme={theme}
        title="With Caption"
        description="The caption prop renders a visible caption above the table. Captions provide screen reader users with context about the table's purpose."
        code={`<TkxTable
  columns={columns}
  data={users}
  caption="Active users in the workspace — April 2026"
/>`}
      >
        <TkxTable
          columns={USER_COLUMNS}
          data={USERS}
          caption="Active users in the workspace — April 2026"
          striped
        />
      </DemoSection>

      {/* Props */}
      <h2 style={h2Style}>TkxTable Props</h2>
      <PropTable props={[
        { name: 'columns', type: 'ColumnDef<T>[]', required: true, description: 'Array of column definitions. Each definition describes the key, header, optional render function, and optional width.' },
        { name: 'data', type: 'T[]', required: true, description: 'Array of row data. T must extend Record<string, unknown>. An empty array triggers the empty state.' },
        { name: 'caption', type: 'string', description: 'Table caption rendered above the data. Improves accessibility by identifying the table to screen readers.' },
        { name: 'sortable', type: 'boolean', default: 'false', description: 'Enables column sorting. Only columns with sortable: true (or not set to false) in their ColumnDef will be clickable.' },
        { name: 'striped', type: 'boolean', default: 'false', description: 'Alternates row background colours for easier row scanning.' },
        { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Fixes the thead to the top of the container when scrolling. Use inside a height-constrained wrapper.' },
        { name: 'isLoading', type: 'boolean', default: 'false', description: 'Replaces table body rows with animated skeleton cells while data is loading.' },
        { name: 'emptyState', type: 'ReactNode', default: "'No data available'", description: 'Content to render in a full-width cell when data is empty and isLoading is false.' },
        { name: 'style', type: 'CSSProperties', description: 'Inline styles for the table wrapper div.' },
        { name: 'className', type: 'string', description: 'Additional class names for the table wrapper div.' },
      ]} />

      <h2 style={{ ...h2Style, marginTop: 32 }}>ColumnDef Props</h2>
      <PropTable props={[
        { name: 'key', type: 'keyof T', required: true, description: 'The data key to read from each row object.' },
        { name: 'header', type: 'string', required: true, description: 'Column header text rendered in the thead.' },
        { name: 'render', type: '(value: T[keyof T], row: T) => ReactNode', description: 'Custom render function. Receives the cell value and the full row. Return any valid JSX.' },
        { name: 'width', type: 'string', description: 'CSS width for the column (e.g. "120px" or "20%").' },
        { name: 'sortable', type: 'boolean', description: 'Set to false to prevent this column from being sortable even when the table has sortable=true.' },
      ]} />

      {/* WCAG Notes */}
      <h2 style={h2Style}>Accessibility Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={noteStyle}><strong>aria-sort:</strong> Sortable column headers receive <code>aria-sort="ascending"</code>, <code>aria-sort="descending"</code>, or <code>aria-sort="none"</code> to communicate the current sort state to assistive technologies.</div>
        <div style={noteStyle}><strong>scope="col":</strong> All <code>th</code> elements in the header row have <code>scope="col"</code>, allowing screen readers to associate header cells with their data cells correctly.</div>
        <div style={noteStyle}><strong>caption:</strong> The optional <code>caption</code> prop renders a native HTML <code>&lt;caption&gt;</code> element. This is the recommended way to label a table for screen readers and is preferred over <code>aria-label</code>.</div>
        <div style={noteStyle}><strong>Keyboard navigation:</strong> Sortable headers are focusable (tabIndex=0) and respond to <kbd>Enter</kbd> and <kbd>Space</kbd> to toggle sort direction.</div>
      </div>
    </div>
  );
}
