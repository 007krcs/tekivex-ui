// ─────────────────────────────────────────────────────────────────────────────
// TemplatesDemo — landing section showcasing the Resume + Biodata generator
//
// Two sub-tabs: Resume (12 templates) / Biodata (12 templates). The
// embedded TkxTemplateGenerator handles everything — form, picker,
// preview, paywall gate, browser-print download.
//
// Demonstrates the paywall flow with one paid resume template ("Executive
// Classic" at ₹199) and one paid biodata template ("Royal" at ₹299) so
// visitors see the locked state. Click "Send my requirement →" if they
// want unlocked access.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { TkxTemplateGenerator } from 'tekivex-ui';

// One free + one paid example of each kind so the gate is visible
const PRICING_DEMO = {
  'resume-executive-classic': { priceCents: 19900, priceCurrency: '₹' },
  'resume-tech-stack':        { priceCents: 24900, priceCurrency: '₹' },
  'biodata-traditional-royal':{ priceCents: 29900, priceCurrency: '₹' },
  'biodata-saffron':          { priceCents: 19900, priceCurrency: '₹' },
};

export function TemplatesDemo() {
  const [kind, setKind] = useState<'resume' | 'biodata'>('resume');
  const [paidIds] = useState(new Set<string>());
  const [requested, setRequested] = useState<string | null>(null);

  return (
    <section
      id="templates-demo"
      style={{
        position: 'relative',
        padding: 'clamp(64px, 9vw, 120px) 24px',
        maxWidth: 1280,
        margin: '0 auto',
        zIndex: 1,
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={pillStyle}>Worked example · 24 templates</div>
        <h2 style={titleStyle}>
          <span className="tk-gradient-text">Resume + Biodata</span> generator
        </h2>
        <p style={subtitleStyle}>
          12 resume layouts, 12 marriage-biodata layouts (religion-agnostic). One smart
          generator: drop your data into the form, pick a template, preview live, download
          as PDF. Optional per-template paywall — set a price, the unlock button does the rest.
        </p>
      </header>

      {/* Kind switcher */}
      <div
        role="tablist"
        aria-label="Template kind"
        style={{
          display: 'inline-flex',
          gap: 4,
          padding: 4,
          borderRadius: 999,
          background: 'rgba(18, 20, 38, 0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          margin: '0 auto 18px',
          textAlign: 'center',
          width: 'fit-content',
          display: 'flex',
        }}
      >
        {(['resume', 'biodata'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            style={{
              padding: '8px 18px',
              minHeight: 36,
              borderRadius: 999,
              border: 'none',
              background: kind === k ? 'rgba(0,245,212,0.16)' : 'transparent',
              color:      kind === k ? '#00f5d4' : '#aaa',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}
          >
            {k} · 12 templates
          </button>
        ))}
      </div>

      <TkxTemplateGenerator
        key={kind}
        kind={kind}
        pricing={PRICING_DEMO}
        paidIds={paidIds}
        onPurchase={(info) => setRequested(info.name)}
        style={{ minHeight: 620 }}
      />

      {/* "Unlock" toast — replace with your real payment flow */}
      {requested && (
        <div
          role="alert"
          style={toastStyle}
        >
          <div style={{ marginRight: 'auto' }}>
            🔒 <strong>{requested}</strong> requires a one-time payment to download.
            Hook up Stripe / Razorpay <code>onPurchase</code> here, or click below to file a
            request.
          </div>
          <a
            href="https://github.com/novaai0401-ui/tekivex-issue-report/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setRequested(null)}
            style={ctaStyle}
          >
            Send my requirement →
          </a>
        </div>
      )}

      <p style={{ marginTop: 18, textAlign: 'center', color: '#888', fontSize: 12, fontStyle: 'italic' }}>
        Browser-only PDF: Chrome / Safari / Firefox "Save as PDF" produces the A4 output. No
        Puppeteer, no html2canvas, no extra deps.
      </p>
    </section>
  );
}

const pillStyle = {
  display: 'inline-block',
  padding: '4px 14px',
  borderRadius: 999,
  background: 'rgba(196,168,255,0.1)',
  border: '1px solid rgba(196,168,255,0.3)',
  color: '#c4a8ff',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  marginBottom: 18,
};

const titleStyle = {
  margin: '0 0 14px',
  fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  fontWeight: 800,
};

const subtitleStyle = {
  margin: '0 auto',
  maxWidth: 700,
  color: '#b8b8d4',
  fontSize: 'clamp(15px, 1.3vw, 17px)',
  lineHeight: 1.65,
};

const toastStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 10,
  background: 'rgba(196,168,255,0.08)',
  border: '1px solid rgba(196,168,255,0.3)',
  color: '#dcdce8',
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

const ctaStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #00f5d4, #7b8eff, #c4a8ff)',
  color: '#0a0a0f',
  fontWeight: 700,
  fontSize: 13,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};
