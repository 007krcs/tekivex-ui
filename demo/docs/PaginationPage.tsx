import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxPagination,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const PAGINATION_PROPS = [
  { name: 'total', type: 'number', required: true, description: 'Total number of items. Used with pageSize to compute total page count.' },
  { name: 'page', type: 'number', default: '1', description: 'Controlled current page (1-indexed).' },
  { name: 'onChange', type: '(page: number) => void', default: 'undefined', description: 'Callback fired when the user navigates to a different page.' },
  { name: 'pageSize', type: 'number', default: '10', description: 'Number of items per page. Changes the total page count.' },
  { name: 'onPageSizeChange', type: '(size: number) => void', default: 'undefined', description: 'Callback fired when the user selects a new page size. Enables the page size selector.' },
  { name: 'pageSizeOptions', type: 'number[]', default: '[10, 20, 50, 100]', description: 'Options shown in the page size dropdown when onPageSizeChange is provided.' },
  { name: 'siblingCount', type: 'number', default: '1', description: 'Number of page buttons shown on each side of the current page.' },
  { name: 'variant', type: "'default' | 'outline' | 'ghost'", default: "'default'", description: 'Visual style of the page buttons.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the pagination buttons.' },
  { name: 'showFirstLast', type: 'boolean', default: 'true', description: 'Show dedicated First and Last page buttons.' },
  { name: 'showPageInfo', type: 'boolean', default: 'false', description: 'Shows a "Page X of Y" label alongside the controls.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all pagination controls.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root nav element.' },
];

// ── Fake data helper ──────────────────────────────────────────────────────────

function FakeTable({ page, pageSize, theme }: { page: number; pageSize: number; theme: ThemeTokens }) {
  const items = Array.from({ length: pageSize }, (_, i) => {
    const index = (page - 1) * pageSize + i + 1;
    return { id: index, name: `Record #${String(index).padStart(4, '0')}`, status: index % 3 === 0 ? 'Active' : index % 3 === 1 ? 'Pending' : 'Inactive' };
  });

  return (
    <div style={{
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px',
      fontSize: '13px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 100px',
        backgroundColor: theme.surfaceAlt,
        padding: '8px 16px',
        borderBottom: `1px solid ${theme.border}`,
        fontWeight: 700,
        color: theme.textMuted,
        fontSize: '11px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
      }}>
        <span>ID</span><span>Name</span><span>Status</span>
      </div>
      {items.map((item) => (
        <div key={item.id} style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 100px',
          padding: '10px 16px',
          borderBottom: `1px solid ${theme.border}`,
          color: theme.text,
        }}>
          <span style={{ color: theme.textMuted }}>{item.id}</span>
          <span>{item.name}</span>
          <span style={{ color: item.status === 'Active' ? theme.success : item.status === 'Pending' ? theme.warning : theme.textMuted }}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function PaginationPage({ theme }: { theme: ThemeTokens }) {
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(1);
  const [pageSize2, setPageSize2] = useState(10);
  const [page3, setPage3] = useState(1);
  const [page4, setPage4] = useState(1);

  const TOTAL = 100;

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '2.4.6 Labels', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxPagination
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A semantic pagination component using{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<nav aria-label="Pagination">'}</code>{' '}
        with individual page buttons that carry{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-label="Page N"</code>{' '}
        and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-current="page"</code>{' '}
        on the active page. Supports page size selectors, three visual variants, and three sizes.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Ellipsis:</strong> Page numbers are automatically truncated with an
        ellipsis (…) when the total page count exceeds the visible window. The ellipsis element has{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-hidden="true"</code>{' '}
        since it carries no navigational information.
      </p>

      {/* ── 1. Basic (total=100) ── */}
      <DemoSection
        title="Basic Pagination"
        description="Provide total (item count) and page. The component calculates total pages from total / pageSize (default 10). Click any page number or use Previous/Next."
        theme={theme}
        code={`const [page, setPage] = useState(1);

<TkxPagination
  total={100}
  page={page}
  onChange={setPage}
/>`}
      >
        <div>
          <FakeTable page={page1} pageSize={10} theme={theme} />
          <TkxPagination
            total={TOTAL}
            page={page1}
            onChange={setPage1}
            showPageInfo
          />
        </div>
      </DemoSection>

      {/* ── 2. With Page Size Selector ── */}
      <DemoSection
        title="With Page Size Selector"
        description="Provide onPageSizeChange to enable a 'Rows per page' dropdown. When the page size changes, the component resets to page 1 to avoid out-of-range states."
        theme={theme}
        code={`const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<TkxPagination
  total={100}
  page={page}
  onChange={setPage}
  pageSize={pageSize}
  onPageSizeChange={(size) => {
    setPageSize(size);
    setPage(1); // reset to first page
  }}
  pageSizeOptions={[5, 10, 20, 50]}
  showPageInfo
/>`}
      >
        <div>
          <FakeTable page={page2} pageSize={pageSize2} theme={theme} />
          <TkxPagination
            total={TOTAL}
            page={page2}
            onChange={setPage2}
            pageSize={pageSize2}
            onPageSizeChange={(size) => { setPageSize2(size); setPage2(1); }}
            pageSizeOptions={[5, 10, 20, 50]}
            showPageInfo
          />
        </div>
      </DemoSection>

      {/* ── 3. Variants ── */}
      <DemoSection
        title="Variants"
        description="Three visual variants — default (solid active page), outline (bordered buttons), and ghost (minimal) — for different UI contexts."
        theme={theme}
        code={`<TkxPagination total={100} page={page} onChange={setPage} variant="default" />
<TkxPagination total={100} page={page} onChange={setPage} variant="outline" />
<TkxPagination total={100} page={page} onChange={setPage} variant="ghost" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 8px', fontWeight: 600 }}>Default</p>
            <TkxPagination total={TOTAL} page={page3} onChange={setPage3} variant="default" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 8px', fontWeight: 600 }}>Outline</p>
            <TkxPagination total={TOTAL} page={page3} onChange={setPage3} variant="outline" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 8px', fontWeight: 600 }}>Ghost</p>
            <TkxPagination total={TOTAL} page={page3} onChange={setPage3} variant="ghost" />
          </div>
        </div>
      </DemoSection>

      {/* ── 4. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes adjust button dimensions and font size for compact tables (sm), standard layouts (md), and prominent navigation (lg)."
        theme={theme}
        code={`<TkxPagination total={50} page={page} onChange={setPage} size="sm" />
<TkxPagination total={50} page={page} onChange={setPage} size="md" />
<TkxPagination total={50} page={page} onChange={setPage} size="lg" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 8px', fontWeight: 600 }}>Small</p>
            <TkxPagination total={50} page={page4} onChange={setPage4} size="sm" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 8px', fontWeight: 600 }}>Medium</p>
            <TkxPagination total={50} page={page4} onChange={setPage4} size="md" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 8px', fontWeight: 600 }}>Large</p>
            <TkxPagination total={50} page={page4} onChange={setPage4} size="lg" />
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={PAGINATION_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="2.4.6 Headings and Labels" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Navigation Landmark</p>
        <p style={noteItemStyle}>TkxPagination renders a <code>{'<nav aria-label="Pagination navigation">'}</code> element. Screen reader users can navigate directly to this landmark from the page outline or via shortcut keys (R in NVDA, N in VoiceOver quick nav).</p>
        <p style={noteItemStyle}>Each page number button has <code>aria-label="Page N"</code> and the current page has <code>aria-current="page"</code>, announced as "current page" by screen readers.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Page Size Selector</p>
        <p style={noteItemStyle}>The page size dropdown uses a native <code>{'<select>'}</code> for maximum browser and AT compatibility. When the selection changes, a live region announces the new page count so screen reader users know the table has been updated.</p>
      </div>
    </div>
  );
}
