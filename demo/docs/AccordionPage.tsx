import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxAccordion,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const ACCORDION_PROPS = [
  { name: 'items', type: 'AccordionItem[]', required: true, description: 'Array of accordion items. Each item has id, title, content, and optional icon/disabled.' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'When true, multiple panels can be open simultaneously.' },
  { name: 'defaultOpen', type: 'string | string[]', default: 'undefined', description: 'Id(s) of panels open on initial render (uncontrolled).' },
  { name: 'value', type: 'string | string[]', default: 'undefined', description: 'Controlled open panel id(s). Use with onChange.' },
  { name: 'onChange', type: '(value: string | string[]) => void', default: 'undefined', description: 'Callback fired when the open panels change.' },
  { name: 'variant', type: "'default' | 'bordered' | 'separated'", default: "'default'", description: 'Visual treatment: default is flush, bordered adds a border wrapper, separated adds gaps between items.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles on the root wrapper.' },
];

const ACCORDION_ITEM_PROPS = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier used for controlling open/close state.' },
  { name: 'title', type: 'string | ReactNode', required: true, description: 'Header text or custom node rendered in the accordion button.' },
  { name: 'content', type: 'string | ReactNode', required: true, description: 'Content rendered inside the collapsible panel.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Icon rendered to the left of the title in the header button.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents the item from being expanded. Sets aria-disabled on the button.' },
];

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function AccordionPage({ theme }: { theme: ThemeTokens }) {
  const [controlled, setControlled] = useState<string>('item-1');

  const BASIC_ITEMS = [
    {
      id: 'item-1',
      title: 'What is TekiVex UI?',
      content: 'TekiVex UI is a fully accessible, theme-aware React component library built to WCAG 2.1 AAA standards. Every component ships with WAI-ARIA compliant markup, keyboard navigation, and screen reader support out of the box.',
    },
    {
      id: 'item-2',
      title: 'How does theming work?',
      content: 'TekiVex uses a token-based theming system. You call createTheme() with your brand colors and pass the result to ThemeProvider. Every component reads from the theme context, so swapping themes rebrands your entire app instantly.',
    },
    {
      id: 'item-3',
      title: 'Is TypeScript supported?',
      content: 'Yes — TekiVex UI is written entirely in TypeScript. All components export their prop types and the ThemeTokens interface is fully typed, providing autocomplete for every token in your editor.',
    },
    {
      id: 'item-4',
      title: 'What browsers are supported?',
      content: 'TekiVex targets all evergreen browsers: Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Internet Explorer is not supported.',
    },
  ];

  const ICON_ITEMS = [
    {
      id: 'about',
      title: 'About this project',
      icon: <IconInfo />,
      content: 'This is a demonstration of the TkxAccordion with custom icons in the header. Icons help users scan accordion sections faster.',
    },
    {
      id: 'security',
      title: 'Security & encryption',
      icon: <IconKey />,
      content: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). API keys are hashed with bcrypt before storage and never logged.',
    },
    {
      id: 'notifications',
      title: 'Notification settings',
      icon: <IconBell />,
      content: 'Configure your notification preferences here. You can choose email, SMS, or push notifications for different event types.',
    },
  ];

  const DISABLED_ITEMS = [
    {
      id: 'available',
      title: 'Available Feature',
      content: 'This accordion item is enabled and can be toggled normally by keyboard and mouse.',
    },
    {
      id: 'locked',
      title: 'Pro Feature (Upgrade Required)',
      content: 'This content is hidden because the item is disabled.',
      disabled: true,
    },
    {
      id: 'also-available',
      title: 'Another Available Feature',
      content: 'This item is also enabled and works normally.',
    },
  ];

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
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxAccordion
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        An accessible accordion built on the WAI-ARIA Accordion pattern. Each header is a{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<button>'}</code>{' '}
        with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-expanded</code>{' '}
        and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-controls</code>{' '}
        pointing to the panel. Panels are collapsible with smooth CSS transitions that respect{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>prefers-reduced-motion</code>.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Keyboard:</strong> Tab/Shift+Tab moves between accordion headers.
        Enter or Space toggles the focused item.
      </p>

      {/* ── 1. Basic ── */}
      <DemoSection
        title="Basic Accordion"
        description="Default single-open mode. Opening one panel automatically closes the currently open one. Pass defaultOpen with an item id to start with a panel expanded."
        theme={theme}
        code={`<TkxAccordion
  items={[
    { id: 'q1', title: 'What is TekiVex UI?', content: '…' },
    { id: 'q2', title: 'How does theming work?', content: '…' },
    { id: 'q3', title: 'Is TypeScript supported?', content: '…' },
  ]}
  defaultOpen="q1"
/>`}
      >
        <TkxAccordion items={BASIC_ITEMS} defaultOpen="item-1" />
      </DemoSection>

      {/* ── 2. Multiple ── */}
      <DemoSection
        title="Multiple Open Panels"
        description="Set multiple to allow any number of panels to be open at once. Individual panels are still independently togglable."
        theme={theme}
        code={`<TkxAccordion
  items={faqItems}
  multiple
  defaultOpen={['item-1', 'item-3']}
/>`}
      >
        <TkxAccordion items={BASIC_ITEMS} multiple defaultOpen={['item-1', 'item-3']} />
      </DemoSection>

      {/* ── 3. Bordered ── */}
      <DemoSection
        title="Bordered Variant"
        description="variant='bordered' wraps the entire accordion in a rounded border. Clean for settings panels and sidebar widgets where visual containment is needed."
        theme={theme}
        code={`<TkxAccordion items={items} variant="bordered" />`}
      >
        <TkxAccordion items={BASIC_ITEMS.slice(0, 3)} variant="bordered" />
      </DemoSection>

      {/* ── 4. Separated ── */}
      <DemoSection
        title="Separated Variant"
        description="variant='separated' adds visual spacing between each item, giving each panel a card-like appearance. Good for feature lists and pricing FAQs."
        theme={theme}
        code={`<TkxAccordion items={items} variant="separated" />`}
      >
        <TkxAccordion items={BASIC_ITEMS.slice(0, 3)} variant="separated" />
      </DemoSection>

      {/* ── 5. Disabled Item ── */}
      <DemoSection
        title="Disabled Item"
        description="Set disabled on individual AccordionItem entries. Disabled items are visually muted, cannot be toggled, and their buttons receive aria-disabled='true'."
        theme={theme}
        code={`<TkxAccordion
  items={[
    { id: 'available', title: 'Available Feature', content: '…' },
    { id: 'locked', title: 'Pro Feature (Upgrade Required)', content: '…', disabled: true },
    { id: 'also-available', title: 'Another Available Feature', content: '…' },
  ]}
/>`}
      >
        <TkxAccordion items={DISABLED_ITEMS} />
      </DemoSection>

      {/* ── 6. With Icons ── */}
      <DemoSection
        title="With Icons"
        description="Pass an icon to any AccordionItem to display it to the left of the title. Icons are aria-hidden — the title text carries the accessible name."
        theme={theme}
        code={`const items = [
  { id: 'about',    icon: <IconInfo />, title: 'About this project',     content: '…' },
  { id: 'security', icon: <IconKey />,  title: 'Security & encryption',  content: '…' },
  { id: 'notifs',   icon: <IconBell />, title: 'Notification settings',  content: '…' },
];

<TkxAccordion items={items} variant="bordered" />`}
      >
        <TkxAccordion items={ICON_ITEMS} variant="bordered" />
      </DemoSection>

      {/* ── 7. Controlled ── */}
      <DemoSection
        title="Controlled Mode"
        description="Use value and onChange to control the open state externally. This enables syncing accordion state with URL params, parent state, or analytics events."
        theme={theme}
        code={`const [open, setOpen] = useState('item-1');

<TkxAccordion
  items={items}
  value={open}
  onChange={(v) => setOpen(v as string)}
/>

<p>Currently open: {open}</p>`}
      >
        <div>
          <TkxAccordion
            items={BASIC_ITEMS.slice(0, 3)}
            value={controlled}
            onChange={(v) => setControlled(v as string)}
          />
          <p style={{ marginTop: '12px', fontSize: '12px', color: theme.textMuted }}>
            Controlled open panel: <strong style={{ color: theme.text }}>{controlled || 'none'}</strong>
          </p>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Tables */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxAccordion Props
      </h2>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={ACCORDION_PROPS} />
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        AccordionItem Shape
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={ACCORDION_ITEM_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>WAI-ARIA Accordion Pattern</p>
        <p style={noteItemStyle}>Each header is a <code>{'<button>'}</code> with <code>aria-expanded</code> indicating panel state and <code>aria-controls</code> pointing to the panel's id. The panel has a matching <code>id</code> and <code>aria-labelledby</code> pointing back to the button.</p>
        <p style={noteItemStyle}>This bidirectional linking satisfies WCAG 4.1.2 and enables screen reader users to navigate between header and content reliably.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Animations &amp; Reduced Motion</p>
        <p style={noteItemStyle}>Panel expand/collapse uses a CSS height transition. When <code>prefers-reduced-motion: reduce</code> is set, transitions are removed and panels snap open/closed instantly.</p>
      </div>
    </div>
  );
}
