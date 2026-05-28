/**
 * TrustBar — regulated-industry framework alignment.
 *
 * Six common compliance frameworks (HIPAA, PCI-DSS, SOC 2, Section 508 / EAA,
 * GDPR, FedRAMP), each mapped to specific TekiVex UI primitives that help an
 * application clear the framework's review.
 *
 * IMPORTANT — the disclaimer below the grid is non-negotiable:
 *   TekiVex UI is NOT a certified product. Certification belongs to the
 *   organisation that ships the application. The framework chips claim
 *   "alignment with primitives", not "certified compliance".
 *   Removing the disclaimer would make this section legally indefensible.
 */

const ACCENT = '#00f5d4';
const BORDER = 'rgba(255,255,255,0.10)';
const SURFACE = 'rgba(255,255,255,0.04)';
const TEXT = '#ffffff';
const TEXT_MUTED = 'rgba(255,255,255,0.78)';
// Used for the section eyebrow + the legal disclaimer — boosted to AAA
// (≈ 9.8:1 on #0f1117) because the disclaimer is a legal-ish notice.
const TEXT_FAINT = 'rgba(255,255,255,0.72)';

interface Framework {
  name: string;
  region: string;
  mapping: string;
}

const FRAMEWORKS: Framework[] = [
  {
    name: 'HIPAA',
    region: 'US healthcare',
    mapping:
      'Magic-byte file MIME · tamper-evident audit trail · PII scrubber (Luhn-validated)',
  },
  {
    name: 'PCI-DSS',
    region: 'Payment cards',
    mapping:
      'Luhn-validated card redaction · CSP builder · Trusted Types · no third-party trackers',
  },
  {
    name: 'SOC 2',
    region: 'Security operations',
    mapping:
      'SHA-256 hash-chained audit log · published threat model · SBOM · signed releases',
  },
  {
    name: 'Section 508 / EAA',
    region: 'Accessibility',
    mapping:
      'WCAG 2.1 AAA contrast target · keyboard-first primitives · ARIA-complete components',
  },
  {
    name: 'GDPR',
    region: 'EU privacy',
    mapping:
      'PII scrubber for logs/LLM input · no runtime telemetry in core · explicit consent primitives',
  },
  {
    name: 'FedRAMP',
    region: 'US gov cloud',
    mapping:
      'Zero runtime deps in core · supply-chain SBOM · sigstore signatures · Trojan-Source defense',
  },
];

export function TrustBar() {
  return (
    <section
      id="trust-bar"
      aria-labelledby="trust-bar-heading"
      style={{
        padding: '64px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        borderTop: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: TEXT_FAINT,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Built for regulated industries
        </div>
        <h2
          id="trust-bar-heading"
          style={{
            fontSize: 'clamp(1.4rem, 2.6vw, 1.75rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            margin: '0 auto',
            maxWidth: 720,
            color: TEXT,
          }}
        >
          Components designed to clear common compliance reviews. Your organization
          brings the certification &mdash; TekiVex provides the primitives.
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {FRAMEWORKS.map((f) => (
          <div
            key={f.name}
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              padding: 16,
              background: SURFACE,
              transition: 'border-color 200ms ease-out, background 200ms ease-out',
            }}
            className="trust-chip"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: TEXT,
                  letterSpacing: '-0.005em',
                }}
              >
                {f.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: ACCENT,
                  textTransform: 'uppercase',
                }}
              >
                {f.region}
              </span>
            </div>
            <p
              style={{
                fontSize: 12.5,
                lineHeight: 1.55,
                color: TEXT_MUTED,
                margin: 0,
              }}
            >
              {f.mapping}
            </p>
          </div>
        ))}
      </div>

      {/* ── Legal disclaimer ────────────────────────────────────────────── */}
      <p
        role="note"
        style={{
          fontSize: 12.5,
          lineHeight: 1.65,
          color: TEXT_FAINT,
          textAlign: 'center',
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        These primitives help your application meet framework requirements. TekiVex
        UI itself is not certified &mdash; certification is your organization&apos;s
        responsibility.
      </p>

      <style>{`
        .trust-chip:hover {
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.06);
        }
        @media (prefers-reduced-motion: reduce) {
          .trust-chip { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
