/**
 * VerifyThis — "Don't trust us, check it yourself."
 *
 * Replaces the old TrustBar (HIPAA / PCI / SOC 2 / FedRAMP framework chips).
 * Trust chips imply alignment we cannot prove for a pre-1.0, single-maintainer
 * library; this section flips the contract — every card surfaces a claim that
 * a procurement engineer can verify on their own machine inside 5 minutes
 * (GitHub link, npm link, SBOM URL, MIT license text, etc.).
 *
 * No framework logos. No "trusted by". No reserved-slot placeholders. Just
 * a checklist with a direct link to the artifact behind each line.
 */

// Light-theme palette — same tokens as HeroPro / SecurityDeepDive.
const BG_CARD       = '#ffffff';
const BORDER        = '#e5e7eb';
const TEXT          = '#0a0a0f';
const TEXT_BODY     = '#1f2937';
const TEXT_MUTED    = '#4b5563';
const ACCENT_DARK   = '#0f766e';   // teal-700, ~6:1 on white
const ACCENT_BG     = '#f0fdfa';   // teal-50
const ACCENT_BORDER = '#99f6e4';   // teal-200
const SHADOW_SM     = '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)';
const MONO          = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

interface VerifiableClaim {
  claim: string;
  explain: string;
  /** Plain-text "how to verify" line, often a shell command. */
  how: string;
  /** Direct link to the artifact behind the claim. */
  href: string;
  /** Label for the link, e.g. "View on GitHub", "Open SBOM". */
  cta: string;
}

const CLAIMS: VerifiableClaim[] = [
  {
    claim: '116 production components',
    explain:
      'Count the files yourself — every component lives under one directory in the public source tree.',
    how: 'find src/components -name "Tkx*.tsx" | wc -l',
    href: 'https://github.com/007krcs/tekivex-ui/tree/master/src/components',
    cta: 'Browse component source',
  },
  {
    claim: '1,798 tests passing at v3.18.0',
    explain:
      'Clone the repo and run the suite. The pipeline is plain vitest — no hidden CI-only steps.',
    how: 'git clone https://github.com/007krcs/tekivex-ui && cd tekivex-ui && npm i && npm test',
    href: 'https://github.com/007krcs/tekivex-ui/tree/master/src',
    cta: 'View tests on GitHub',
  },
  {
    claim: 'Zero runtime dependencies in core',
    explain:
      'We publish a CycloneDX SBOM with every release. Open it and confirm the dependency list for tekivex-ui core is empty.',
    how: 'curl https://ui.tekivex.com/security/sbom.json | jq ".dependencies"',
    href: 'https://ui.tekivex.com/security/sbom.json',
    cta: 'Open the SBOM',
  },
  {
    claim: 'Published security threat model',
    explain:
      '15 STRIDE threats with CWE references, kept in the repo so it shows up in your security review as a normal markdown file.',
    how: 'Read docs/SECURITY-THREAT-MODEL.md on the master branch.',
    href: 'https://github.com/007krcs/tekivex-ui/blob/master/docs/SECURITY-THREAT-MODEL.md',
    cta: 'Read the threat model',
  },
  {
    claim: 'Works in Next.js / RSC (v3.18+)',
    explain:
      'Package built without Vite chunk runtime, with `use client` directives on every hook-using component. Install it and try.',
    how: 'npm install tekivex-ui@3.18.0 inside a Next.js 14 app router project.',
    href: 'https://www.npmjs.com/package/tekivex-ui',
    cta: 'See the package on npm',
  },
  {
    claim: 'MIT licensed',
    explain:
      'Commercial use, modification, and redistribution all allowed without royalties. Read the licence text directly.',
    how: 'cat LICENSE  (or read it on GitHub)',
    href: 'https://github.com/007krcs/tekivex-ui/blob/master/LICENSE',
    cta: 'Read the LICENSE',
  },
];

export function VerifyThis() {
  return (
    <section
      id="verify-this"
      aria-labelledby="verify-this-heading"
      style={{
        padding: '96px 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 999,
            background: ACCENT_BG,
            border: `1px solid ${ACCENT_BORDER}`,
            color: ACCENT_DARK,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}
        >
          NO TRUST THEATER
        </div>
        <h2
          id="verify-this-heading"
          style={{
            fontSize: 'clamp(1.9rem, 3.8vw, 2.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            margin: '0 auto 14px',
            maxWidth: 760,
            color: TEXT,
          }}
        >
          What you can verify yourself
        </h2>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: TEXT_BODY,
            maxWidth: 640,
            margin: '0 auto',
          }}
        >
          Open-source means the claims on this page are checkable. Here are
          the receipts &mdash; one card per claim, with the exact command or
          URL you need.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {CLAIMS.map((c) => (
          <article
            key={c.claim}
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              background: BG_CARD,
              boxShadow: SHADOW_SM,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: '-0.01em',
              }}
            >
              {c.claim}
            </h3>
            <p
              style={{
                margin: 0,
                color: TEXT_BODY,
                fontSize: 13.5,
                lineHeight: 1.6,
              }}
            >
              {c.explain}
            </p>
            <div
              style={{
                padding: '8px 10px',
                background: '#fafbfc',
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                fontFamily: MONO,
                fontSize: 11.5,
                color: TEXT_MUTED,
                wordBreak: 'break-word',
              }}
            >
              {c.how}
            </div>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 'auto',
                color: ACCENT_DARK,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {c.cta} →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
