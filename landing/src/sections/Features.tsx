import { TkxHolographicCard, TkxHolographicBadge } from 'tekivex-ui';

interface Feature {
  emoji: string;
  title: string;
  desc: string;
  badge?: string;
}

const FEATURES: Feature[] = [
  {
    emoji: '📊',
    title: 'TkxSpreadsheet + TkxFormulaBar',
    desc: 'A real spreadsheet primitive — keyboard-driven cells, range selection, formula evaluation through TkxFormulaBar. Built for enterprise data-entry surfaces, not a demo toy.',
  },
  {
    emoji: '🔀',
    title: 'TkxFlowChart',
    desc: 'Production diagram canvas with draggable nodes, connectable ports, and keyboard navigation. Same WCAG 2.1 AAA bar as every other primitive in the library.',
  },
  {
    emoji: '📎',
    title: 'TkxFileUpload — magic-byte verified',
    desc: 'Most upload widgets trust the Content-Type header. Ours reads the actual file signature, so a .exe renamed to .png gets rejected before it reaches your server.',
  },
];

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
            background: 'rgba(196,168,255,0.1)',
            border: '1px solid rgba(196,168,255,0.3)',
            color: '#c4a8ff',
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
          }}
        >
          Three primitives that <span className="tk-gradient-text">earn their place</span>
        </h2>
        <p
          style={{
            color: '#b8b8d4',
            maxWidth: 660,
            margin: '0 auto',
            fontSize: 'clamp(15px, 1.3vw, 17px)',
            lineHeight: 1.65,
          }}
        >
          Each one held to the same WCAG 2.1 AAA bar and the same SecurityCore threat model
          as the other 111 components in the library.
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
          <TkxHolographicCard
            key={f.title}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17 }}>
                <span style={{ fontSize: 24 }} aria-hidden="true">
                  {f.emoji}
                </span>
                {f.title}
              </span>
            }
            badge={f.badge ? <TkxHolographicBadge size="sm">{f.badge}</TkxHolographicBadge> : undefined}
            maxTilt={10}
            foilIntensity="soft"
          >
            <p style={{ color: '#b8b8d4', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
          </TkxHolographicCard>
        ))}
      </div>
    </section>
  );
}
