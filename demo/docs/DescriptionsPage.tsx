import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxDescriptions,
  TkxBadge,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const DESCRIPTIONS_PROPS = [
  { name: 'items', type: 'TkxDescriptionsItem[]', default: '[]', description: 'The key/value entries: { key?, label, children, span? }. span stretches an item across N columns (clamped to what remains in the row).' },
  { name: 'title', type: 'ReactNode', default: 'undefined', description: 'Header title rendered above the list (and as a visually-hidden <caption> in bordered mode).' },
  { name: 'extra', type: 'ReactNode', default: 'undefined', description: 'Right-aligned header slot, e.g. an Edit button.' },
  { name: 'column', type: 'number | { xs?, sm?, md?, lg? }', default: '3', description: 'Columns per row, or a responsive map keyed by breakpoint resolved via window.matchMedia (largest defined value on the server).' },
  { name: 'bordered', type: 'boolean', default: 'false', description: 'Render as a real <table> grid with <th scope="row"> label cells on a theme.border grid.' },
  { name: 'layout', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: "'horizontal' = label beside value; 'vertical' = label above value." },
  { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: 'Cell padding / grid gap scale.' },
  { name: 'colon', type: 'boolean', default: 'true', description: "Append ':' after labels in the horizontal non-bordered layout." },
  { name: 'labelStyle', type: 'CSSProperties', default: 'undefined', description: 'Extra styles for every label cell.' },
  { name: 'contentStyle', type: 'CSSProperties', default: 'undefined', description: 'Extra styles for every value cell.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root wrapper div.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function DescriptionsPage({ theme }: { theme: ThemeTokens }) {
  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const orderItems = [
    { key: 'id', label: 'Order ID', children: 'TKX-2026-004821' },
    { key: 'status', label: 'Status', children: <TkxBadge variant="success">Shipped</TkxBadge> },
    { key: 'placed', label: 'Placed', children: '02 Jul 2026, 14:32 IST' },
    { key: 'customer', label: 'Customer', children: 'Asha Patel' },
    { key: 'email', label: 'Email', children: 'asha.patel@example.com' },
    { key: 'phone', label: 'Phone', children: '+91 98765 43210' },
    { key: 'payment', label: 'Payment', children: 'UPI · ₹4,299.00' },
    { key: 'courier', label: 'Courier', children: 'BlueDart · AWB 7743 2210 45' },
    { key: 'eta', label: 'ETA', children: '09 Jul 2026' },
    {
      key: 'address',
      label: 'Shipping address',
      span: 3,
      children: '42, MG Road, Indiranagar, Bengaluru, Karnataka 560038, India',
    },
  ];

  const userItems = [
    { key: 'name', label: 'Name', children: 'Ravi Kumar' },
    { key: 'role', label: 'Role', children: 'Maintainer' },
    { key: 'team', label: 'Team', children: 'Design Systems' },
    { key: 'location', label: 'Location', children: 'Hyderabad, IN' },
    { key: 'joined', label: 'Joined', children: 'March 2024' },
    { key: 'mfa', label: '2FA', children: 'Enabled' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '1.4.3 Contrast', level: 'AA', status: 'PASS' },
            { criterion: '1.4.10 Reflow', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxDescriptions
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A read-only key/value detail list for record-detail views — the component that stops
        every admin app from hand-rolling its "view record" screen. Two render modes: a bordered
        real-table grid, or a plain semantic description list on a CSS grid.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Semantics:</strong> bordered mode is a real{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<table>'}</code>{' '}
        with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<th scope="row">'}</code>{' '}
        label cells and a visually-hidden caption; plain mode is a semantic{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<dl>'}</code>{' '}
        so screen readers announce term/definition pairs.
      </p>

      {/* ── 1. Bordered order detail ── */}
      <DemoSection
        title="Bordered Table — Order Detail"
        description="bordered renders a real table on a theme.border grid with theme.surfaceAlt label cells. The shipping address uses span={3} to stretch across the full row; string values are sanitised, and any ReactNode (like the status badge) passes through."
        theme={theme}
        code={`<TkxDescriptions
  title="Order #TKX-2026-004821"
  extra={<a href="#/components/descriptions">Edit</a>}
  bordered
  column={3}
  items={[
    { label: 'Order ID',  children: 'TKX-2026-004821' },
    { label: 'Status',    children: <TkxBadge variant="success">Shipped</TkxBadge> },
    { label: 'Placed',    children: '02 Jul 2026, 14:32 IST' },
    { label: 'Customer',  children: 'Asha Patel' },
    { label: 'Email',     children: 'asha.patel@example.com' },
    { label: 'Phone',     children: '+91 98765 43210' },
    { label: 'Payment',   children: 'UPI · ₹4,299.00' },
    { label: 'Courier',   children: 'BlueDart · AWB 7743 2210 45' },
    { label: 'ETA',       children: '09 Jul 2026' },
    { label: 'Shipping address', span: 3,
      children: '42, MG Road, Indiranagar, Bengaluru, Karnataka 560038, India' },
  ]}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxDescriptions
            title="Order #TKX-2026-004821"
            extra={
              <a href="#/components/descriptions" style={{ fontSize: '13px', color: theme.primary, textDecoration: 'none', fontWeight: 600 }}>
                Edit
              </a>
            }
            bordered
            column={3}
            items={orderItems}
          />
        </div>
      </DemoSection>

      {/* ── 2. Plain dl ── */}
      <DemoSection
        title="Plain <dl> Variant"
        description="The default (non-bordered) mode lays label/value pairs out on a CSS grid inside a semantic <dl>. colon (default true) appends ':' after each label in the horizontal layout."
        theme={theme}
        code={`<TkxDescriptions
  title="Member profile"
  column={2}
  items={[
    { label: 'Name',     children: 'Ravi Kumar' },
    { label: 'Role',     children: 'Maintainer' },
    { label: 'Team',     children: 'Design Systems' },
    { label: 'Location', children: 'Hyderabad, IN' },
    { label: 'Joined',   children: 'March 2024' },
    { label: '2FA',      children: 'Enabled' },
  ]}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxDescriptions title="Member profile" column={2} items={userItems} />
        </div>
      </DemoSection>

      {/* ── 3. Responsive column map ── */}
      <DemoSection
        title="Responsive Column Map"
        description="Pass column as a breakpoint map — { xs: 1, sm: 2, lg: 3 } — and the count resolves via window.matchMedia, re-resolving live as the viewport crosses 576px and 992px. Resize the window to watch the columns reflow. The vertical layout puts each label above its value."
        theme={theme}
        code={`<TkxDescriptions
  bordered
  layout="vertical"
  column={{ xs: 1, sm: 2, lg: 3 }}
  items={userItems}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxDescriptions
            bordered
            layout="vertical"
            column={{ xs: 1, sm: 2, lg: 3 }}
            items={userItems}
          />
          <p style={{ margin: '10px 0 0', fontSize: '12px', color: theme.textMuted }}>
            xs (&lt;576px): 1 column · sm (≥576px): 2 columns · lg (≥992px): 3 columns
          </p>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={DESCRIPTIONS_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.10 Reflow" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={{ borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, padding: '20px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 12px' }}>Real Semantics, Not Divs</p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: '0 0 6px' }}>
          Bordered mode emits a genuine <code>{'<table>'}</code> — labels are <code>{'<th scope="row">'}</code> (or <code>scope="col"</code> in the vertical layout) so screen readers announce the label with each value, and the title doubles as a visually-hidden <code>{'<caption>'}</code>.
        </p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: 0 }}>
          Plain mode uses <code>{'<dl>'}</code> / <code>{'<dt>'}</code> / <code>{'<dd>'}</code>. String labels and values pass through <code>sanitizeString</code>; ReactNode children render as-is, so you own their accessibility.
        </p>
      </div>
    </div>
  );
}
