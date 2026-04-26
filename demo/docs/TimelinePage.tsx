import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxTimeline,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const TIMELINE_PROPS = [
  { name: 'items', type: 'TimelineItem[]', required: true, description: 'Array of timeline items to render.' },
  { name: 'direction', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout direction of the timeline.' },
  { name: 'variant', type: "'default' | 'alternating' | 'right'", default: "'default'", description: "Content position: default = left of connector, alternating = alternates sides, right = right of connector." },
  { name: 'connectorStyle', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'", description: 'Style of the line connecting timeline items.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles on the root wrapper.' },
];

const TIMELINE_ITEM_PROPS = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the timeline item.' },
  { name: 'title', type: 'string | ReactNode', required: true, description: 'Primary heading for the timeline event.' },
  { name: 'description', type: 'string | ReactNode', default: 'undefined', description: 'Supporting detail text for the event.' },
  { name: 'date', type: 'string | ReactNode', default: 'undefined', description: 'Date or time label shown alongside the event.' },
  { name: 'status', type: "'completed' | 'active' | 'pending' | 'error'", default: "'pending'", description: 'Visual status of the node dot (color and icon).' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Custom icon rendered inside the connector dot.' },
  { name: 'dotColor', type: 'string', default: 'undefined', description: 'Override the dot background color directly.' },
];

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconShip() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 21 9.5 21c2.6 0 2.4 1 5 1 2.5 0 2.5-1 5-1 1.3 0 1.9.5 2.5 1" />
      <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
      <path d="M19 13V7l-7-3-7 3v6" />
      <line x1="12" y1="10" x2="12" y2="14" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function TimelinePage({ theme }: { theme: ThemeTokens }) {
  const [activeStep, setActiveStep] = useState(2);

  const ORDER_ITEMS = [
    {
      id: 'placed',
      title: 'Order Placed',
      description: 'Your order #TKX-20240115 has been received and confirmed.',
      date: 'Jan 15, 2024 — 9:32 AM',
      status: 'completed' as const,
      icon: <IconCheck />,
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'We are preparing your items for shipment.',
      date: 'Jan 15, 2024 — 2:14 PM',
      status: 'completed' as const,
      icon: <IconCode />,
    },
    {
      id: 'shipped',
      title: 'Shipped',
      description: 'Package picked up by carrier. Tracking: 1Z9999W99999999999.',
      date: 'Jan 16, 2024 — 8:05 AM',
      status: 'active' as const,
      icon: <IconShip />,
    },
    {
      id: 'delivery',
      title: 'Out for Delivery',
      description: 'Your package is on the way.',
      date: 'Expected Jan 18, 2024',
      status: 'pending' as const,
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Package delivered successfully.',
      date: '—',
      status: 'pending' as const,
    },
  ];

  const RELEASE_ITEMS = [
    {
      id: 'v1',
      title: 'v1.0.0 — Initial Release',
      description: '15 core components, token-based theming, TypeScript support.',
      date: 'March 2023',
      status: 'completed' as const,
    },
    {
      id: 'v1-5',
      title: 'v1.5.0 — Accessibility Overhaul',
      description: 'WCAG 2.1 AA compliance across all components. Added focus management.',
      date: 'June 2023',
      status: 'completed' as const,
    },
    {
      id: 'v2',
      title: 'v2.0.0 — Design System Refresh',
      description: '40+ components, WCAG AAA, WAI-ARIA 1.2, new dark theme.',
      date: 'January 2024',
      status: 'active' as const,
      icon: <IconStar />,
    },
    {
      id: 'v2-5',
      title: 'v2.5.0 — AI Components',
      description: 'TkxChat, TkxThinkingIndicator, TkxChatBubble, voice input.',
      date: 'Q3 2024 (planned)',
      status: 'pending' as const,
    },
    {
      id: 'v3',
      title: 'v3.0.0 — Native & Cross-platform',
      description: 'React Native support, server components, Figma plugin.',
      date: '2025 (roadmap)',
      status: 'pending' as const,
    },
  ];

  const HORIZONTAL_ITEMS = [
    { id: 's1', title: 'Design', date: 'Week 1', status: 'completed' as const },
    { id: 's2', title: 'Develop', date: 'Week 2', status: 'completed' as const },
    { id: 's3', title: 'Review', date: 'Week 3', status: 'active' as const },
    { id: 's4', title: 'Test', date: 'Week 4', status: 'pending' as const },
    { id: 's5', title: 'Deploy', date: 'Week 5', status: 'pending' as const },
  ];

  const STEPS = ['Account', 'Billing', 'Review', 'Confirm'];
  const INTERACTIVE_ITEMS = STEPS.map((step, i) => ({
    id: `step-${i}`,
    title: step,
    status: (i < activeStep ? 'completed' : i === activeStep ? 'active' : 'pending') as 'completed' | 'active' | 'pending',
  }));

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
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxTimeline
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A semantic timeline component for visualizing chronological events, process steps, and progress flows.
        Supports vertical and horizontal directions, alternating layouts, four status types, and customizable
        connector styles. Built with an ordered list for proper screen reader semantics.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> The timeline renders as an{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<ol>'}</code>{' '}
        with each item as an{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<li>'}</code>.
        Status is conveyed via{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-label</code>{' '}
        on each dot, not color alone.
      </p>

      {/* ── 1. Vertical Timeline ── */}
      <DemoSection
        title="Vertical Timeline with Statuses"
        description="The default vertical layout. Four status values — completed, active, pending, error — control the dot color and icon. 'active' highlights the current position."
        theme={theme}
        code={`<TkxTimeline
  items={[
    { id: 'placed',    title: 'Order Placed',    status: 'completed', date: 'Jan 15', icon: <IconCheck /> },
    { id: 'shipped',   title: 'Shipped',          status: 'active',    date: 'Jan 16', icon: <IconShip /> },
    { id: 'delivery',  title: 'Out for Delivery', status: 'pending',   date: 'Jan 18' },
    { id: 'delivered', title: 'Delivered',         status: 'pending' },
  ]}
/>`}
      >
        <TkxTimeline items={ORDER_ITEMS} />
      </DemoSection>

      {/* ── 2. Horizontal Timeline ── */}
      <DemoSection
        title="Horizontal Timeline"
        description="Set direction='horizontal' for a left-to-right flow. Best for progress indicators, product roadmaps, and step-by-step processes with short labels."
        theme={theme}
        code={`<TkxTimeline
  direction="horizontal"
  items={[
    { id: 's1', title: 'Design',  date: 'Week 1', status: 'completed' },
    { id: 's2', title: 'Develop', date: 'Week 2', status: 'completed' },
    { id: 's3', title: 'Review',  date: 'Week 3', status: 'active'    },
    { id: 's4', title: 'Test',    date: 'Week 4', status: 'pending'   },
    { id: 's5', title: 'Deploy',  date: 'Week 5', status: 'pending'   },
  ]}
/>`}
      >
        <TkxTimeline direction="horizontal" items={HORIZONTAL_ITEMS} />
      </DemoSection>

      {/* ── 3. Alternating ── */}
      <DemoSection
        title="Alternating Variant"
        description="variant='alternating' places content on alternating sides of the connector. Great for release notes, histories, and timelines where each event needs more visual space."
        theme={theme}
        code={`<TkxTimeline
  variant="alternating"
  items={releaseHistory}
/>`}
      >
        <TkxTimeline variant="alternating" items={RELEASE_ITEMS} />
      </DemoSection>

      {/* ── 4. Connector Styles ── */}
      <DemoSection
        title="Connector Styles"
        description="Three connector styles — solid, dashed, and dotted — for different visual contexts. Dashed connectors visually suggest 'in progress'; dotted suggest 'planned'."
        theme={theme}
        code={`<TkxTimeline connectorStyle="solid"  items={items} />
<TkxTimeline connectorStyle="dashed" items={items} />
<TkxTimeline connectorStyle="dotted" items={items} />`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
          {(['solid', 'dashed', 'dotted'] as const).map((style) => (
            <div key={style}>
              <p style={{ fontSize: '11px', color: theme.textMuted, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{style}</p>
              <TkxTimeline
                connectorStyle={style}
                items={HORIZONTAL_ITEMS.slice(0, 3).map((item) => ({ ...item }))}
              />
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 5. Interactive stepper ── */}
      <DemoSection
        title="Interactive Stepper"
        description="TkxTimeline can drive a multi-step form. Toggle the active step using Previous/Next buttons. Status is updated reactively based on the current step index."
        theme={theme}
        code={`const [step, setStep] = useState(0);
const STEPS = ['Account', 'Billing', 'Review', 'Confirm'];

const items = STEPS.map((title, i) => ({
  id: \`step-\${i}\`,
  title,
  status: i < step ? 'completed' : i === step ? 'active' : 'pending',
}));

<TkxTimeline direction="horizontal" items={items} />

<TkxButton onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Previous</TkxButton>
<TkxButton onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>Next</TkxButton>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TkxTimeline direction="horizontal" items={INTERACTIVE_ITEMS} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              disabled={activeStep === 0}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: 'transparent',
                color: activeStep === 0 ? theme.textMuted : theme.text,
                cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={activeStep === STEPS.length - 1}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeStep === STEPS.length - 1 ? theme.border : theme.primary,
                color: activeStep === STEPS.length - 1 ? theme.textMuted : '#fff',
                cursor: activeStep === STEPS.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {activeStep === STEPS.length - 1 ? 'Complete' : 'Next'}
            </button>
            <span style={{ fontSize: '13px', color: theme.textMuted, alignSelf: 'center' }}>
              Step {activeStep + 1} of {STEPS.length}: <strong style={{ color: theme.text }}>{STEPS[activeStep]}</strong>
            </span>
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Tables */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxTimeline Props
      </h2>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={TIMELINE_PROPS} />
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TimelineItem Shape
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={TIMELINE_ITEM_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.1 Use of Color" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Color Is Not the Only Indicator</p>
        <p style={noteItemStyle}>Status is communicated through: (1) color, (2) icon shape (checkmark for completed, dot for active), and (3) <code>aria-label</code> on the dot element: "Completed: Order Placed", "Active: Shipped", "Pending: Delivered". This satisfies WCAG 1.4.1 Use of Color.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Ordered List Semantics</p>
        <p style={noteItemStyle}>The timeline renders as <code>{'<ol>'}</code> so screen readers convey the sequential nature of the items: "list of 5 items". Each <code>{'<li>'}</code> contains the full event title, date, and description in DOM order for correct reading sequence.</p>
      </div>
    </div>
  );
}
