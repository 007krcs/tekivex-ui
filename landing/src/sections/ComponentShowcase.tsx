/**
 * ComponentShowcase — visual proof-of-the-library on the homepage.
 *
 * v2 (2026-06-07): expanded from 8 → 24 components in 4 categories
 * (Primitives / Form inputs / Feedback / Composition). Each card has
 * a live render, a "View docs →" link, AND a "Try in playground →"
 * link so readers can land directly in the interactive sandbox.
 *
 * Consumer report (2026-06-07): "Browse all 141 components — all
 * should be visible in component section with look and feel with
 * proper playground so people can make some change and see how it
 * works."
 *
 * This section addresses the "look and feel" half. The 141-coverage
 * + per-component playground half is met by /playground/ (the
 * interactive demo SPA at /playground/#/components/<slug>) — readers
 * land there via the "Try in playground" link on each card and the
 * bottom CTA.
 *
 * Bundle: ~20 KB gzipped additional (still under 5% of the homepage
 * bundle). Vite tree-shakes individual Tkx* component implementations.
 */

import {
  TkxButton,
  TkxInput,
  TkxAlert,
  TkxBadge,
  TkxAvatar,
  TkxToggle,
  TkxProgress,
  TkxCard,
  TkxCardBody,
  TkxCheckbox,
  TkxRadio,
  TkxSelect,
  TkxSlider,
  TkxSkeleton,
  TkxSpin,
  TkxStatistic,
  TkxTag,
  TkxDivider,
  TkxTabs,
  TkxAccordion,
  TkxStepper,
  TkxPagination,
  TkxNumberInput,
  TkxBreadcrumb,
} from 'tekivex-ui';
import { useState } from 'react';

// ── Light-mode palette (AAA-verified) ───────────────────────────────────────
const BG          = '#ffffff';
const BG_CARD     = '#fafbfc';
const BORDER      = '#e5e7eb';
const TEXT        = '#0a0a0f';
const TEXT_BODY   = '#1f2937';
const TEXT_MUTED  = '#374151';
const ACCENT_TEXT = '#0f766e';
const ACCENT_TEXT_HOVER = '#115e59';
const SHADOW_SM   = '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)';

interface ShowcaseCardProps {
  name: string;
  slug: string;
  description: string;
  children: React.ReactNode;
}

function ShowcaseCard({ name, slug, description, children }: ShowcaseCardProps) {
  return (
    <article
      style={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: SHADOW_SM,
        transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = SHADOW_SM;
      }}
    >
      <header>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: 'ui-monospace, monospace' }}>
          {name}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: TEXT_MUTED, lineHeight: 1.5 }}>
          {description}
        </p>
      </header>

      <div
        style={{
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 80,
          flex: 1,
        }}
      >
        {children}
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 12.5, fontWeight: 600 }}>
        <a
          href={`/components/${slug}/`}
          style={{ color: ACCENT_TEXT, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT_TEXT_HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.color = ACCENT_TEXT)}
        >
          View docs →
        </a>
        <a
          href={`/playground/#/components/${slug}`}
          style={{ color: ACCENT_TEXT, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT_TEXT_HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.color = ACCENT_TEXT)}
        >
          Try in playground →
        </a>
      </div>
    </article>
  );
}

// ── Interactive demo wrappers (need useState for click/type responsiveness) ─

function ToggleDemo() {
  const [on, setOn] = useState(true);
  return <TkxToggle checked={on} onChange={setOn} label={on ? 'Email alerts on' : 'Email alerts off'} />;
}
function CheckboxDemo() {
  const [v, setV] = useState(true);
  return <TkxCheckbox checked={v} onChange={setV} label="Subscribe to updates" />;
}
function RadioDemo() {
  const [v, setV] = useState('std');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <TkxRadio name="speed" value="eco" checked={v === 'eco'} onChange={() => setV('eco')} label="Eco" />
      <TkxRadio name="speed" value="std" checked={v === 'std'} onChange={() => setV('std')} label="Standard" />
      <TkxRadio name="speed" value="exp" checked={v === 'exp'} onChange={() => setV('exp')} label="Express" />
    </div>
  );
}
function InputDemo() {
  const [v, setV] = useState('');
  return (
    <div style={{ width: '100%', maxWidth: 240 }}>
      <TkxInput value={v} onChange={setV} label="Email" placeholder="you@example.com" />
    </div>
  );
}
function NumberDemo() {
  const [v, setV] = useState(7);
  return (
    <div style={{ width: '100%', maxWidth: 200 }}>
      <TkxNumberInput value={v} onChange={setV} label="Quantity" min={0} max={99} />
    </div>
  );
}
function SelectDemo() {
  const [v, setV] = useState('in');
  return (
    <div style={{ width: '100%', maxWidth: 200 }}>
      <TkxSelect value={v} onChange={setV} label="Country" options={[
        { value: 'in', label: 'India' },
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
      ]} />
    </div>
  );
}
function SliderDemo() {
  const [v, setV] = useState(40);
  return (
    <div style={{ width: '100%', maxWidth: 220 }}>
      <TkxSlider value={v} onChange={setV} min={0} max={100} label={`Volume: ${v}%`} />
    </div>
  );
}
function TabsDemo() {
  const [t, setT] = useState('a');
  return (
    <TkxTabs value={t} onChange={setT} items={[
      { id: 'a', label: 'Overview', panel: <span style={{ fontSize: 12 }}>Overview content</span> },
      { id: 'b', label: 'Settings', panel: <span style={{ fontSize: 12 }}>Settings content</span> },
    ]} />
  );
}
function AccordionDemo() {
  return (
    <div style={{ width: '100%' }}>
      <TkxAccordion items={[
        { id: '1', title: 'What is shipped?', content: '116 components, plus 4 experimental.' },
      ]} />
    </div>
  );
}
function PaginationDemo() {
  const [p, setP] = useState(3);
  return <TkxPagination current={p} total={10} onChange={setP} />;
}
function StepperDemo() {
  return (
    <TkxStepper current={1} steps={[
      { title: 'Cart' },
      { title: 'Shipping' },
      { title: 'Pay' },
    ]} />
  );
}

// ── Category groups ─────────────────────────────────────────────────────────

interface CategoryProps {
  title: string;
  description: string;
  children: React.ReactNode;
}
function Category({ title, description, children }: CategoryProps) {
  return (
    <section style={{ marginTop: 48 }}>
      <header style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: TEXT_BODY }}>
          {description}
        </p>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {children}
      </div>
    </section>
  );
}

// ── Section ─────────────────────────────────────────────────────────────────

export function ComponentShowcase() {
  return (
    <section
      id="component-showcase"
      aria-labelledby="showcase-heading"
      style={{
        background: BG,
        padding: 'clamp(48px, 8vw, 96px) clamp(20px, 4vw, 48px)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_TEXT, fontWeight: 700, margin: 0 }}>
            See what you get
          </p>
          <h2
            id="showcase-heading"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: TEXT,
              margin: '12px 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            Real components, rendered live
          </h2>
          <p style={{ fontSize: 16, color: TEXT_BODY, maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            24 of the 141 production components rendered with the same code
            you'd write. Click <strong>"Try in playground"</strong> on any
            card to land in an interactive sandbox where you can change
            props and see live results.
          </p>
        </header>

        <Category title="Primitives" description="Single-purpose building blocks.">
          <ShowcaseCard name="TkxButton" slug="button" description="5 variants, 3 sizes, loading, icon slots, AAA focus ring.">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TkxButton variant="primary">Primary</TkxButton>
              <TkxButton variant="outline">Outline</TkxButton>
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxBadge" slug="badge" description="Status pills — solid, soft, dot, count. 8 colour schemes.">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TkxBadge variant="success">Active</TkxBadge>
              <TkxBadge variant="warning">Pending</TkxBadge>
              <TkxBadge variant="danger">Failed</TkxBadge>
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxAvatar" slug="avatar" description="Image + initials fallback + presence dot. Group, stack, ring.">
            <div style={{ display: 'flex', gap: 8 }}>
              <TkxAvatar name="Priya Kumar" />
              <TkxAvatar name="Marcus Lee" />
              <TkxAvatar name="Sara Chen" />
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxCard" slug="card" description="Composable card with header / body / footer slots.">
            <TkxCard style={{ width: '100%' }}>
              <TkxCardBody>
                <strong style={{ fontSize: 13 }}>Quarterly report</strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: TEXT_MUTED }}>+18% YoY</p>
              </TkxCardBody>
            </TkxCard>
          </ShowcaseCard>
          <ShowcaseCard name="TkxTag" slug="tag" description="Removable tags with colour, click, and onRemove handlers.">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TkxTag>react</TkxTag>
              <TkxTag>typescript</TkxTag>
              <TkxTag>wcag</TkxTag>
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxDivider" slug="divider" description="Horizontal or vertical, with optional label.">
            <div style={{ width: '100%' }}>
              <span style={{ fontSize: 12, color: TEXT_MUTED }}>Above</span>
              <TkxDivider label="Section break" />
              <span style={{ fontSize: 12, color: TEXT_MUTED }}>Below</span>
            </div>
          </ShowcaseCard>
        </Category>

        <Category title="Form inputs" description="Stateful, fully accessible, label-associated.">
          <ShowcaseCard name="TkxInput" slug="input" description="Label, helper, error, prefix/suffix slots.">
            <InputDemo />
          </ShowcaseCard>
          <ShowcaseCard name="TkxCheckbox" slug="checkbox" description="Indeterminate state, group support, fieldset legends.">
            <CheckboxDemo />
          </ShowcaseCard>
          <ShowcaseCard name="TkxRadio" slug="radio" description="Roving tab-index for keyboard nav within a group.">
            <RadioDemo />
          </ShowcaseCard>
          <ShowcaseCard name="TkxToggle" slug="toggle" description="On/off switch with built-in label and keyboard support.">
            <ToggleDemo />
          </ShowcaseCard>
          <ShowcaseCard name="TkxSelect" slug="select" description="Searchable, async, multi-select with chips and clear.">
            <SelectDemo />
          </ShowcaseCard>
          <ShowcaseCard name="TkxSlider" slug="slider" description="Single + range, step ticks, marks, vertical orientation.">
            <SliderDemo />
          </ShowcaseCard>
        </Category>

        <Category title="Feedback" description="Communicate state, progress, and outcome.">
          <ShowcaseCard name="TkxAlert" slug="alert" description="info / success / warning / error. aria-live, dismissable.">
            <div style={{ width: '100%' }}>
              <TkxAlert variant="success" title="Saved">Your changes are live in 2.3s.</TkxAlert>
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxProgress" slug="progress" description="Determinate / indeterminate, with value label.">
            <div style={{ width: '100%', maxWidth: 240 }}>
              <TkxProgress value={68} label="Uploading" showLabel />
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxSpin" slug="spin" description="Loading spinner — 5 sizes, custom colour, screen-reader text.">
            <TkxSpin size="lg" />
          </ShowcaseCard>
          <ShowcaseCard name="TkxSkeleton" slug="skeleton" description="Loading placeholder — rect, circle, lines, custom shapes.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <TkxSkeleton variant="rect" width="100%" height={12} />
              <TkxSkeleton variant="rect" width="80%" height={12} />
              <TkxSkeleton variant="rect" width="60%" height={12} />
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxStatistic" slug="statistic" description="KPI tile with value, label, delta, trend arrow.">
            <TkxStatistic label="Active users" value="1,247" change="+12%" />
          </ShowcaseCard>
          <ShowcaseCard name="TkxBreadcrumb" slug="breadcrumb" description="Hierarchical nav with separators and current-page marker.">
            <TkxBreadcrumb items={[
              { label: 'Home', href: '/' },
              { label: 'Components', href: '/components/' },
              { label: 'Breadcrumb' },
            ]} />
          </ShowcaseCard>
        </Category>

        <Category title="Composition" description="Compose more complex flows from atoms.">
          <ShowcaseCard name="TkxTabs" slug="tabs" description="Roving tab-index, lazy panels, keyboard arrows.">
            <div style={{ width: '100%' }}>
              <TabsDemo />
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxAccordion" slug="accordion" description="Single or multi-expand, custom icons, animated.">
            <AccordionDemo />
          </ShowcaseCard>
          <ShowcaseCard name="TkxStepper" slug="stepper" description="Linear progress through a multi-step flow.">
            <div style={{ width: '100%' }}>
              <StepperDemo />
            </div>
          </ShowcaseCard>
          <ShowcaseCard name="TkxPagination" slug="pagination" description="Page numbers + prev/next + jump-to-input.">
            <PaginationDemo />
          </ShowcaseCard>
          <ShowcaseCard name="TkxNumberInput" slug="number-input" description="Spinner, locale-aware formatting, min/max guard.">
            <NumberDemo />
          </ShowcaseCard>
          <ShowcaseCard
            name="…and 117 more"
            slug=""
            description="Address, KYC, DataGrid, Chat, Charts, 3D — see them all in the interactive playground."
          >
            <a
              href="/playground/"
              style={{
                padding: '10px 18px',
                background: TEXT,
                color: BG,
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 8,
                textDecoration: 'none',
                minHeight: 40,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Open playground →
            </a>
          </ShowcaseCard>
        </Category>

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <a
            href="/playground/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '14px 24px',
              background: TEXT,
              color: BG,
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 8,
              textDecoration: 'none',
              minHeight: 44,
              transition: 'transform 200ms ease-out',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Browse all 141 components in the interactive playground →
          </a>
          <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 12 }}>
            Every page in /playground/ lets you click, type, and change
            props in real time — no install, no setup.
          </p>
        </div>
      </div>
    </section>
  );
}
