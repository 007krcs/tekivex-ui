import { useState, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxTransferList } from 'tekivex-ui';
import type { TransferItem } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Sample data ──────────────────────────────────────────────────────────────

const FRUITS: TransferItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
];

const SELECTED_FRUITS: TransferItem[] = [
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
];

const PERMISSIONS: TransferItem[] = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'delete', label: 'Delete' },
  { value: 'admin', label: 'Admin', disabled: true },
  { value: 'export', label: 'Export' },
  { value: 'import', label: 'Import' },
  { value: 'audit', label: 'Audit Log' },
  { value: 'billing', label: 'Billing' },
  { value: 'settings', label: 'Settings' },
  { value: 'users', label: 'User Management' },
];

const ASSIGNED_PERMS: TransferItem[] = [
  { value: 'view', label: 'View Dashboard' },
];

// ── Basic Demo ───────────────────────────────────────────────────────────────

function BasicDemo({ theme }: Props) {
  const [source, setSource] = useState<TransferItem[]>(FRUITS);
  const [target, setTarget] = useState<TransferItem[]>(SELECTED_FRUITS);

  return (
    <TkxTransferList
      sourceItems={source}
      targetItems={target}
      onTransfer={(s, t) => { setSource(s); setTarget(t); }}
      sourceTitle="Available"
      targetTitle="Selected"
    />
  );
}

// ── Searchable Demo ──────────────────────────────────────────────────────────

function SearchableDemo({ theme }: Props) {
  const [source, setSource] = useState<TransferItem[]>(PERMISSIONS);
  const [target, setTarget] = useState<TransferItem[]>(ASSIGNED_PERMS);

  return (
    <TkxTransferList
      sourceItems={source}
      targetItems={target}
      onTransfer={(s, t) => { setSource(s); setTarget(t); }}
      sourceTitle="Available Permissions"
      targetTitle="Assigned Permissions"
      searchable
    />
  );
}

// ── Custom Height Demo ───────────────────────────────────────────────────────

function CustomHeightDemo({ theme }: Props) {
  const [source, setSource] = useState<TransferItem[]>(FRUITS);
  const [target, setTarget] = useState<TransferItem[]>([]);

  return (
    <TkxTransferList
      sourceItems={source}
      targetItems={target}
      onTransfer={(s, t) => { setSource(s); setTarget(t); }}
      sourceTitle="Items"
      targetTitle="Cart"
      height={400}
    />
  );
}

// ── TransferListPage ─────────────────────────────────────────────────────────

export function TransferListPage({ theme }: Props) {
  const pageStyle: CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
    padding: '48px 32px 80px',
  };

  const h1Style: CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: theme.text,
    margin: '0 0 12px',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  };

  const leadStyle: CSSProperties = {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 1.75,
    maxWidth: 640,
    margin: '0 0 48px',
  };

  const dividerStyle: CSSProperties = {
    border: 'none',
    borderTop: `1px solid ${theme.border}`,
    margin: '40px 0',
  };

  const sectionHeadStyle: CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
  };

  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <h1 style={h1Style}>TkxTransferList</h1>
      <p style={leadStyle}>
        A dual-list component for moving items between a source and target
        collection. Supports search filtering, custom heights, and disabled items
        with full keyboard navigation.
      </p>

      {/* ── Basic ── */}
      <DemoSection
        title="Basic Transfer List"
        description="A minimal transfer list with two columns. Select items on either side and use the arrow buttons to move them."
        theme={theme}
        code={`const [source, setSource] = useState(fruits);
const [target, setTarget] = useState(selected);

<TkxTransferList
  sourceItems={source}
  targetItems={target}
  onTransfer={(s, t) => { setSource(s); setTarget(t); }}
  sourceTitle="Available"
  targetTitle="Selected"
/>`}
      >
        <BasicDemo theme={theme} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Searchable ── */}
      <DemoSection
        title="With Search"
        description="Enable the searchable prop to add a filter input above each list. Useful when dealing with large item sets."
        theme={theme}
        code={`<TkxTransferList
  sourceItems={source}
  targetItems={target}
  onTransfer={(s, t) => { setSource(s); setTarget(t); }}
  sourceTitle="Available Permissions"
  targetTitle="Assigned Permissions"
  searchable
/>`}
      >
        <SearchableDemo theme={theme} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Custom Height ── */}
      <DemoSection
        title="Custom Height"
        description="Use the height prop to control the list container height in pixels. The list scrolls when items exceed the available space."
        theme={theme}
        code={`<TkxTransferList
  sourceItems={source}
  targetItems={target}
  onTransfer={(s, t) => { setSource(s); setTarget(t); }}
  sourceTitle="Items"
  targetTitle="Cart"
  height={400}
/>`}
      >
        <CustomHeightDemo theme={theme} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'sourceItems', type: 'TransferItem[]', required: true, description: 'Array of items displayed in the source (left) list.' },
            { name: 'targetItems', type: 'TransferItem[]', required: true, description: 'Array of items displayed in the target (right) list.' },
            { name: 'onTransfer', type: '(source: TransferItem[], target: TransferItem[]) => void', required: true, description: 'Callback fired when items are moved. Receives the updated source and target arrays.' },
            { name: 'sourceTitle', type: 'string', description: 'Heading displayed above the source list.' },
            { name: 'targetTitle', type: 'string', description: 'Heading displayed above the target list.' },
            { name: 'searchable', type: 'boolean', default: 'false', description: 'Renders a search input above each list for filtering items by label.' },
            { name: 'height', type: 'number', description: 'Fixed height in pixels for the list containers. Lists scroll when content overflows.' },
            { name: 'className', type: 'string', description: 'Additional CSS class names forwarded to the root element.' },
            { name: 'style', type: 'CSSProperties', description: 'Inline styles forwarded to the root element.' },
          ]}
        />
      </section>
    </div>
  );
}
