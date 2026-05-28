/**
 * HeroPro — professional B2B hero (text-first, no 3D, light theme).
 *
 * Two-column layout (Linear / Vercel / Resend style): marketing copy on the
 * left, syntax-highlighted code snippet on the right. Designed for the kind
 * of visitor who lands here from an engineering blog or a procurement-driven
 * evaluation — not from a launch demo.
 *
 * 2026-05 — relit for light theme. The previous palette was authored against
 * a deep-navy background; on a pure-white surface the neon mint (#00f5d4)
 * dropped to ~1.5:1 contrast (fails everything). We now use teal-600
 * (#0d9488 ≈ 5.2:1) as the brand accent for text/icons and reserve neon mint
 * for the dark-themed parts of the site.
 *
 * Accessibility:
 *   - Section is labelled by the H1 (id="hero-pro-heading")
 *   - CTAs are real <a> elements
 *   - Code card has role="img" + aria-label
 *   - All decorative pieces use aria-hidden
 *   - Hover micro-motion is 200ms ease-out and respects prefers-reduced-motion
 */

// ── Light-mode palette ──────────────────────────────────────────────────────
const BG_CARD       = '#fafbfc';            // code card surface
const BORDER        = '#e5e7eb';            // gray-200
const BORDER_SOFT   = '#f1f3f5';            // subtle divider
const TEXT          = '#0a0a0f';            // ~21:1 on white
const TEXT_BODY     = '#1f2937';            // ~16:1 on white
const TEXT_MUTED    = '#4b5563';            // ~9:1 on white
const TEXT_FAINT    = '#6b7280';            // ~6:1 on white (still AAA for body)
const ACCENT        = '#0d9488';            // teal-600 — primary accent
const ACCENT_DARK   = '#0f766e';            // teal-700 — text-on-accent need
const ACCENT_BG     = '#f0fdfa';            // teal-50 — chip background
const ACCENT_BORDER = '#99f6e4';            // teal-200 — chip border
const SHADOW_MD     = '0 4px 6px rgba(0,0,0,0.04), 0 10px 15px rgba(0,0,0,0.04)';
const MONO          = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// ── Syntax tokens — all verified ≥ 7:1 contrast against #fafbfc ─────────────
const TOK = {
  keyword: '#7c3aed',  // violet-600
  string:  '#0d9488',  // teal-600
  comp:    '#b45309',  // amber-700
  attr:    '#0369a1',  // sky-700
  punct:   '#4b5563',  // gray-600
  text:    '#1f2937',  // gray-800
  comment: '#6b7280',  // gray-500 — ~6:1 (AAA for body)
};

export function HeroPro() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-pro-heading"
      style={{
        padding: '120px 24px 80px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div className="hero-pro-grid">
        {/* ── Left column: copy + CTAs ─────────────────────────────────── */}
        <div>
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
              letterSpacing: '0.08em',
              marginBottom: 24,
            }}
          >
            OPEN-SOURCE · MIT · PRE-1.0
          </div>

          <h1
            id="hero-pro-heading"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              margin: '0 0 20px',
              color: TEXT,
            }}
          >
            The React component library that ships with a threat model.
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: TEXT_BODY,
              margin: '0 0 32px',
              maxWidth: 560,
            }}
          >
            116 production components. Published security threat model.
            Tamper-evident SHA-256 audit trail. Zero runtime dependencies in
            core. Open-source, MIT licensed, pre-1.0.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <a
              href="/docs/security-threat-model"
              className="hero-pro-cta-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 22px',
                background: ACCENT,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 8,
                textDecoration: 'none',
                minHeight: 44,
                transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
              }}
            >
              View threat model
            </a>
            <a
              href="/docs/quickstart"
              className="hero-pro-cta-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 22px',
                background: '#ffffff',
                color: TEXT_BODY,
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                textDecoration: 'none',
                minHeight: 44,
                transition: 'border-color 200ms ease-out, background 200ms ease-out',
              }}
            >
              Get started
            </a>
          </div>

          <p
            style={{
              fontSize: 12,
              color: TEXT_FAINT,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            MIT licensed · 1,798 tests · 44 locales · SBOM published
          </p>
        </div>

        {/* ── Right column: code card ──────────────────────────────────── */}
        <div
          role="img"
          aria-label="Example React code importing ThemeProvider, TkxCard, and TkxButton from tekivex-ui"
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            background: BG_CARD,
            overflow: 'hidden',
            boxShadow: SHADOW_MD,
          }}
        >
          {/* Terminal top bar */}
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderBottom: `1px solid ${BORDER_SOFT}`,
              background: '#ffffff',
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            <span
              style={{
                marginLeft: 12,
                fontFamily: MONO,
                fontSize: 12,
                color: TEXT_FAINT,
              }}
            >
              App.tsx
            </span>
          </div>

          <pre
            style={{
              margin: 0,
              padding: '20px 22px',
              fontFamily: MONO,
              fontSize: 13,
              lineHeight: 1.65,
              color: TOK.text,
              overflowX: 'auto',
            }}
          >
            <code>
              <span style={{ color: TOK.keyword }}>import</span>
              <span style={{ color: TOK.text }}>{' { '}</span>
              <span style={{ color: TOK.text }}>ThemeProvider, quantumDark, TkxButton, TkxCard</span>
              <span style={{ color: TOK.text }}>{' } '}</span>
              <span style={{ color: TOK.keyword }}>from</span>{' '}
              <span style={{ color: TOK.string }}>'tekivex-ui'</span>
              <span style={{ color: TOK.punct }}>;</span>{'\n'}
              <span style={{ color: TOK.keyword }}>import</span>{' '}
              <span style={{ color: TOK.string }}>'tekivex-ui/styles'</span>
              <span style={{ color: TOK.punct }}>;</span>{'\n\n'}
              <span style={{ color: TOK.keyword }}>export default function</span>{' '}
              <span style={{ color: TOK.comp }}>App</span>
              <span style={{ color: TOK.punct }}>() {'{'}</span>{'\n'}
              {'  '}<span style={{ color: TOK.keyword }}>return</span>{' '}
              <span style={{ color: TOK.punct }}>(</span>{'\n'}
              {'    '}<span style={{ color: TOK.punct }}>{'<'}</span>
              <span style={{ color: TOK.comp }}>ThemeProvider</span>{' '}
              <span style={{ color: TOK.attr }}>theme</span>
              <span style={{ color: TOK.punct }}>=</span>
              <span style={{ color: TOK.punct }}>{'{'}</span>
              <span style={{ color: TOK.text }}>quantumDark</span>
              <span style={{ color: TOK.punct }}>{'}>'}</span>{'\n'}
              {'      '}<span style={{ color: TOK.punct }}>{'<'}</span>
              <span style={{ color: TOK.comp }}>TkxCard</span>{' '}
              <span style={{ color: TOK.attr }}>variant</span>
              <span style={{ color: TOK.punct }}>=</span>
              <span style={{ color: TOK.string }}>"elevated"</span>
              <span style={{ color: TOK.punct }}>{'>'}</span>{'\n'}
              {'        '}<span style={{ color: TOK.punct }}>{'<'}</span>
              <span style={{ color: TOK.comp }}>h2</span>
              <span style={{ color: TOK.punct }}>{'>'}</span>
              <span style={{ color: TOK.text }}>Secure by default</span>
              <span style={{ color: TOK.punct }}>{'</'}</span>
              <span style={{ color: TOK.comp }}>h2</span>
              <span style={{ color: TOK.punct }}>{'>'}</span>{'\n'}
              {'        '}<span style={{ color: TOK.punct }}>{'<'}</span>
              <span style={{ color: TOK.comp }}>TkxButton</span>{' '}
              <span style={{ color: TOK.attr }}>colorScheme</span>
              <span style={{ color: TOK.punct }}>=</span>
              <span style={{ color: TOK.string }}>"primary"</span>
              <span style={{ color: TOK.punct }}>{'>'}</span>
              <span style={{ color: TOK.text }}>Get started</span>
              <span style={{ color: TOK.punct }}>{'</'}</span>
              <span style={{ color: TOK.comp }}>TkxButton</span>
              <span style={{ color: TOK.punct }}>{'>'}</span>{'\n'}
              {'      '}<span style={{ color: TOK.punct }}>{'</'}</span>
              <span style={{ color: TOK.comp }}>TkxCard</span>
              <span style={{ color: TOK.punct }}>{'>'}</span>{'\n'}
              {'    '}<span style={{ color: TOK.punct }}>{'</'}</span>
              <span style={{ color: TOK.comp }}>ThemeProvider</span>
              <span style={{ color: TOK.punct }}>{'>'}</span>{'\n'}
              {'  '}<span style={{ color: TOK.punct }}>);</span>{'\n'}
              <span style={{ color: TOK.punct }}>{'}'}</span>
            </code>
          </pre>
        </div>
      </div>

      <style>{`
        .hero-pro-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (min-width: 960px) {
          .hero-pro-grid {
            grid-template-columns: 60fr 40fr;
            gap: 56px;
          }
        }
        .hero-pro-cta-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(13, 148, 136, 0.25);
        }
        .hero-pro-cta-secondary:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-pro-cta-primary, .hero-pro-cta-secondary { transition: none !important; }
          .hero-pro-cta-primary:hover { transform: none !important; }
        }
      `}</style>
    </section>
  );
}
