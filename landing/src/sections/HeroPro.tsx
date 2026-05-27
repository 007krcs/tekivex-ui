/**
 * HeroPro — professional B2B hero (text-first, no 3D, no panoramas).
 *
 * Replaces the full-viewport 360° panorama Hero with a Linear / Vercel / Resend
 * style two-column layout: marketing copy on the left, syntax-highlighted code
 * snippet on the right. Designed for regulated-industry teams who land here from
 * an engineering blog or a procurement-driven evaluation, not from a launch demo.
 *
 * Accessibility:
 *   - Section is labelled by the H1 (id="hero-pro-heading")
 *   - CTAs are real <a> elements (anchor semantics, not button)
 *   - Code card has role="img" + aria-label summarising the snippet
 *   - All decorative pieces use aria-hidden
 *   - Hover micro-motion is 200ms ease-out and respects prefers-reduced-motion
 */

const ACCENT = '#00f5d4';
const BORDER = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.12)';
const SURFACE = 'rgba(255,255,255,0.03)';
const TEXT = '#ffffff';
const TEXT_MUTED = 'rgba(255,255,255,0.65)';
const TEXT_FAINT = 'rgba(255,255,255,0.45)';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// ── Syntax tokens — plain <span> colouring, no third-party highlighter ───────
const TOK = {
  keyword: '#c4a8ff',
  string: '#a3e9b3',
  comp: '#ffd166',
  attr: '#7dd3fc',
  punct: 'rgba(255,255,255,0.55)',
  text: '#e6e8ef',
  comment: 'rgba(255,255,255,0.40)',
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
              background: 'rgba(0, 245, 212, 0.08)',
              border: `1px solid ${ACCENT}33`,
              color: ACCENT,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              marginBottom: 24,
            }}
          >
            SECURITY-FIRST · WCAG 2.1 AAA TARGET
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
              color: TEXT_MUTED,
              margin: '0 0 32px',
              maxWidth: 560,
            }}
          >
            115 production components. Published security threat model. WCAG 2.1 AAA
            target with third-party audit-firm engagement open. Tamper-evident
            SHA-256 audit trail. Zero runtime dependencies in core.
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
                color: '#0a0a0f',
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
                background: 'transparent',
                color: TEXT,
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 8,
                border: `1px solid ${BORDER_STRONG}`,
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
            MIT licensed · 1,777 tests · 44 locales · SBOM published
          </p>
        </div>

        {/* ── Right column: code card ──────────────────────────────────── */}
        <div
          role="img"
          aria-label="Example React code importing ThemeProvider, TkxCard, and TkxButton from tekivex-ui"
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            background: SURFACE,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
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
              borderBottom: `1px solid ${BORDER}`,
              background: 'rgba(255,255,255,0.02)',
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
          box-shadow: 0 8px 24px rgba(0,245,212,0.25);
        }
        .hero-pro-cta-secondary:hover {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.03);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-pro-cta-primary, .hero-pro-cta-secondary { transition: none !important; }
          .hero-pro-cta-primary:hover { transform: none !important; }
        }
      `}</style>
    </section>
  );
}
