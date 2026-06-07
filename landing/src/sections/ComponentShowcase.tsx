/**
 * ComponentShowcase — visual proof-of-the-library on the homepage.
 *
 * Why this exists: the AllComponents section below renders 116 chips
 * (component names only — text directory). Visitors couldn't see what
 * the components ACTUALLY look like without clicking into a docs page.
 * Consumer report (2026-06-07): "Why don't we have component section
 * on landing page? Component is just code written not visible how it
 * looks."
 *
 * This section renders 8 representative Tkx* components LIVE, in a
 * card grid. Each card shows:
 *   - Component name + one-line description
 *   - The actual rendered component (not a screenshot, not code)
 *   - "View docs →" link to /components/<slug>/
 *
 * Bundle-size note: importing 8 Tkx* components into the homepage's
 * eager bundle adds ~30-50 KB gzipped. Intentional trade-off — the
 * cost is justified by giving visitors a 5-second visual proof of
 * the library before they decide whether to click through.
 *
 * Accessibility: section labelled by the H2; each card is a real
 * <article> with <h3>; the live components keep their built-in
 * accessibility semantics.
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
} from 'tekivex-ui';
import { useState } from 'react';

// ── Light-mode palette (matches HeroPro tokens — all AAA on white) ──────────
const BG          = '#ffffff';
const BG_CARD     = '#fafbfc';
const BORDER      = '#e5e7eb';
const TEXT        = '#0a0a0f';            // ~21:1 on white
const TEXT_BODY   = '#1f2937';            // ~15:1
const TEXT_MUTED  = '#374151';            // ~11:1
const ACCENT_TEXT = '#0f766e';            // teal-700 — link colour
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
        gap: 16,
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
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT, fontFamily: 'ui-monospace, monospace' }}>
          {name}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: TEXT_MUTED, lineHeight: 1.5 }}>
          {description}
        </p>
      </header>

      {/* Live preview — give it room to breathe + a subtle inset background */}
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
        }}
      >
        {children}
      </div>

      <a
        href={`/components/${slug}/`}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: ACCENT_TEXT,
          textDecoration: 'none',
          alignSelf: 'flex-start',
        }}
      >
        View docs →
      </a>
    </article>
  );
}

// ── Inner live-demo components ──────────────────────────────────────────────
// Some Tkx components are stateful — we wrap them so the homepage stays
// idiomatically reactive without polluting the section component.

function ToggleDemo() {
  const [on, setOn] = useState(true);
  return <TkxToggle checked={on} onChange={setOn} label={on ? 'Notifications on' : 'Notifications off'} />;
}

function InputDemo() {
  const [v, setV] = useState('');
  return (
    <div style={{ width: '100%', maxWidth: 240 }}>
      <TkxInput value={v} onChange={setV} label="Email" placeholder="you@example.com" />
    </div>
  );
}

function ProgressDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 240 }}>
      <TkxProgress value={68} label="Uploading" showLabel />
    </div>
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
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: ACCENT_TEXT,
              fontWeight: 700,
              margin: 0,
            }}
          >
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
          <p
            style={{
              fontSize: 16,
              color: TEXT_BODY,
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Eight of the 116 production components, rendered with the
            same code you'd write. Hover each card for details, or open
            the docs for the full API.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          <ShowcaseCard
            name="TkxButton"
            slug="button"
            description="5 variants, 3 sizes, loading state, icon slots, AAA focus ring."
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TkxButton variant="primary">Primary</TkxButton>
              <TkxButton variant="outline">Outline</TkxButton>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            name="TkxInput"
            slug="input"
            description="Label, helper, error, prefix/suffix slots, all autoComplete tokens."
          >
            <InputDemo />
          </ShowcaseCard>

          <ShowcaseCard
            name="TkxAlert"
            slug="alert"
            description="info / success / warning / error. aria-live, dismissable, icon-prefixed."
          >
            <div style={{ width: '100%' }}>
              <TkxAlert variant="success" title="Saved">
                Your changes are live in 2.3s.
              </TkxAlert>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            name="TkxBadge"
            slug="badge"
            description="Status pills — solid, soft, dot, count. 8 colour schemes."
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TkxBadge variant="success">Active</TkxBadge>
              <TkxBadge variant="warning">Pending</TkxBadge>
              <TkxBadge variant="danger">Failed</TkxBadge>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            name="TkxAvatar"
            slug="avatar"
            description="Image + initials fallback + presence dot. Group, stack, ring variants."
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <TkxAvatar name="Priya Kumar" />
              <TkxAvatar name="Marcus Lee" />
              <TkxAvatar name="Sara Chen" />
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            name="TkxToggle"
            slug="toggle"
            description="On/off switch with built-in label association and keyboard support."
          >
            <ToggleDemo />
          </ShowcaseCard>

          <ShowcaseCard
            name="TkxProgress"
            slug="progress"
            description="Determinate / indeterminate, with value label, accessible role='progressbar'."
          >
            <ProgressDemo />
          </ShowcaseCard>

          <ShowcaseCard
            name="TkxCard"
            slug="card"
            description="Composable card with header / body / footer slots. 3 elevation levels."
          >
            <TkxCard style={{ width: '100%' }}>
              <TkxCardBody>
                <strong style={{ fontSize: 13 }}>Quarterly report</strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: TEXT_MUTED }}>
                  +18% YoY. Generated 2 minutes ago.
                </p>
              </TkxCardBody>
            </TkxCard>
          </ShowcaseCard>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a
            href="/components/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 22px',
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
            Browse all 116 components →
          </a>
        </div>
      </div>
    </section>
  );
}
