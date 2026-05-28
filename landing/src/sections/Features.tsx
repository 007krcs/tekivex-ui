// Features — three primitives that earn their place on the landing page.
// Light-theme: plain white cards with subtle border + shadow. The holographic
// card variant was dark-only; for the professional landing we use a simple
// card so the content reads clearly on white.

interface Feature {
  emoji: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    emoji: '📊',
    title: 'TkxSpreadsheet + TkxFormulaBar',
    desc:
      'A real spreadsheet primitive — keyboard-driven cells, range selection, formula evaluation through TkxFormulaBar. Built for enterprise data-entry surfaces, not a demo toy.',
  },
  {
    emoji: '🔀',
    title: 'TkxFlowChart',
    desc:
      'Production diagram canvas with draggable nodes, connectable ports, and keyboard navigation. Same accessibility bar as every other primitive in the library.',
  },
  {
    emoji: '📎',
    title: 'TkxFileUpload — magic-byte verified',
    desc:
      'Most upload widgets trust the Content-Type header. Ours reads the actual file signature, so a .exe renamed to .png gets rejected before it reaches your server.',
  },
];

const BORDER      = '#e5e7eb';
const TEXT        = '#0a0a0f';
const TEXT_BODY   = '#1f2937';
const TEXT_MUTED  = '#4b5563';
const ACCENT_DARK = '#0f766e';
const ACCENT_BG   = '#f0fdfa';
const ACCENT_BORDER = '#99f6e4';
const SHADOW_SM   = '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)';

export function Features() {
  return (
    <section
      id="features"
      style={{
        padding: '88px 24px 48px',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 56 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 999,
            background: ACCENT_BG,
            border: `1px solid ${ACCENT_BORDER}`,
            color: ACCENT_DARK,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          Why TekiVex
        </div>
        <h2
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            margin: '0 0 14px',
            color: TEXT,
          }}
        >
          Three primitives that{' '}
          <span className="tk-gradient-text">earn their place</span>
        </h2>
        <p
          style={{
            color: TEXT_BODY,
            maxWidth: 660,
            margin: '0 auto',
            fontSize: 'clamp(15px, 1.3vw, 17px)',
            lineHeight: 1.65,
          }}
        >
          Each one held to the same accessibility bar and the same SecurityCore
          threat model as the other 112 components in the library.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {FEATURES.map((f) => (
          <article
            key={f.title}
            style={{
              padding: 22,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              background: '#ffffff',
              boxShadow: SHADOW_SM,
            }}
          >
            <header
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 24 }} aria-hidden="true">
                {f.emoji}
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: TEXT,
                  letterSpacing: '-0.01em',
                }}
              >
                {f.title}
              </h3>
            </header>
            <p
              style={{
                color: TEXT_MUTED,
                fontSize: 14,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {f.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
