/**
 * Design Partners section — landing page social proof slot.
 *
 * Each entry in PARTNERS is one design-partner logo + quote. Empty / placeholder
 * slots render as muted "Your logo here — slot reserved" cards so the section
 * always looks intentional, never empty.
 *
 * To land a real partner:
 *   1. Add an SVG logo to `landing/public/partners/<slug>.svg` (monochrome, 24px tall)
 *   2. Add an entry to PARTNERS below with logo path, name, vertical, quote, role
 *   3. Get written quote-permission email — store at `docs/design-partners/<slug>.eml`
 *
 * The outreach kit (templates + qualification rubric) is at:
 *   docs/design-partners/README.md
 */

interface Partner {
  /** Display name on the logo card. */
  name: string;
  /** Vertical/industry — drives the "trusted by [healthtech | fintech | gov]" caption. */
  vertical: 'healthtech' | 'fintech' | 'gov' | 'edtech' | 'enterprise';
  /** Path under landing/public/partners/ — e.g. '/partners/acme.svg'. */
  logo?: string;
  /** Pull-quote from a named decision-maker. Optional — logo alone is still valuable. */
  quote?: {
    text: string;
    author: string;
    role: string;
  };
  /** Optional link to case-study page. */
  caseStudy?: string;
}

// ── Real partners go here. Each non-placeholder needs written quote permission. ─
const PARTNERS: Partner[] = [
  // Example shape (delete the placeholders once 1+ real partner is signed):
  // {
  //   name: 'Acme Health',
  //   vertical: 'healthtech',
  //   logo: '/partners/acme-health.svg',
  //   quote: {
  //     text: 'TekiVex UI shipped with a threat model. Our security review took two days instead of two weeks.',
  //     author: 'Jane Smith',
  //     role: 'VP Engineering, Acme Health',
  //   },
  //   caseStudy: '/case-studies/acme-health',
  // },
];

// ── Placeholder slots — render until real partners are added ────────────────────
const PLACEHOLDER_SLOTS: Array<{ vertical: Partner['vertical']; label: string }> = [
  { vertical: 'healthtech', label: 'Healthtech partner' },
  { vertical: 'fintech', label: 'Fintech partner' },
  { vertical: 'gov', label: 'Public-sector partner' },
  { vertical: 'enterprise', label: 'Enterprise partner' },
];

const VERTICAL_COLOR: Record<Partner['vertical'], string> = {
  healthtech: '#00f5d4',
  fintech: '#7c5cff',
  gov: '#3da9fc',
  edtech: '#ff7eb6',
  enterprise: '#f5b700',
};

const cardBase: React.CSSProperties = {
  borderRadius: 12,
  padding: '24px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 120,
  textAlign: 'center',
  transition: 'transform 200ms ease, border-color 200ms ease',
};

const placeholderCardStyle: React.CSSProperties = {
  ...cardBase,
  background: 'rgba(255,255,255,0.02)',
  border: '1px dashed rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.55)',
};

const partnerCardStyle: React.CSSProperties = {
  ...cardBase,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

export function DesignPartners() {
  const hasRealPartners = PARTNERS.length > 0;
  const slotsToRender: Array<Partner | { placeholder: true; vertical: Partner['vertical']; label: string }> =
    hasRealPartners
      ? PARTNERS
      : PLACEHOLDER_SLOTS.map((p) => ({ placeholder: true as const, ...p }));

  return (
    <section
      id="design-partners"
      aria-labelledby="design-partners-heading"
      style={{
        padding: '80px 24px',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 999,
            background: 'rgba(0, 245, 212, 0.10)',
            border: '1px solid rgba(0, 245, 212, 0.30)',
            color: '#00f5d4',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          DESIGN PARTNERS
        </div>
        <h2
          id="design-partners-heading"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {hasRealPartners
            ? 'Trusted by regulated-industry teams'
            : 'Reserved for the first five design partners'}
        </h2>
        <p
          style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 640,
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          {hasRealPartners ? (
            <>
              Teams in healthtech, fintech, and the public sector use TekiVex UI because it ships
              with a threat model, a tamper-evident audit trail, and a path to WCAG 2.1 AAA
              compliance — not because the components are pretty.
            </>
          ) : (
            <>
              We&rsquo;re onboarding our first five design partners — healthtech, fintech, and
              public-sector teams that want a React component library with a threat model, a
              tamper-evident audit trail, and a path to WCAG 2.1 AAA. White-glove integration,
              direct line to maintainers, named in the case study. <a href="#contact" style={{ color: '#00f5d4' }}>Apply →</a>
            </>
          )}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: hasRealPartners ? 48 : 0,
        }}
      >
        {slotsToRender.map((slot, i) => {
          if ('placeholder' in slot) {
            return (
              <div key={`placeholder-${i}`} style={placeholderCardStyle}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: VERTICAL_COLOR[slot.vertical],
                    marginBottom: 8,
                    opacity: 0.7,
                  }}
                >
                  {slot.vertical.toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{slot.label}</div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Slot reserved</div>
              </div>
            );
          }
          return (
            <div key={slot.name} style={partnerCardStyle}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: VERTICAL_COLOR[slot.vertical],
                  marginBottom: 8,
                }}
              >
                {slot.vertical.toUpperCase()}
              </div>
              {slot.logo ? (
                <img
                  src={slot.logo}
                  alt={`${slot.name} logo`}
                  height={32}
                  style={{ filter: 'brightness(0) invert(1)', opacity: 0.92 }}
                />
              ) : (
                <div style={{ fontSize: 18, fontWeight: 700 }}>{slot.name}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Render the first real partner quote, if present */}
      {hasRealPartners && PARTNERS[0].quote && (
        <figure
          style={{
            maxWidth: 760,
            margin: '0 auto',
            padding: '32px 28px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <blockquote
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.92)',
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{PARTNERS[0].quote.text}&rdquo;
          </blockquote>
          <figcaption
            style={{
              marginTop: 16,
              fontSize: 14,
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            — <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{PARTNERS[0].quote.author}</strong>,{' '}
            {PARTNERS[0].quote.role}
            {PARTNERS[0].caseStudy && (
              <>
                {' · '}
                <a href={PARTNERS[0].caseStudy} style={{ color: '#00f5d4' }}>
                  Read the case study →
                </a>
              </>
            )}
          </figcaption>
        </figure>
      )}
    </section>
  );
}
