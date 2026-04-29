import { TkxHolographicCard, TkxHolographicBadge } from 'tekivex-ui';

interface Feature {
  emoji: string;
  title: string;
  desc: string;
  badge?: string;
}

const FEATURES: Feature[] = [
  {
    emoji: '✨',
    title: 'Holographic UI',
    desc: 'Pointer-tracked 3D tilt, iridescent foil, scan-lines, glass blur. Pure CSS, zero deps. Pokemon-card vibes for premium tiers.',
    badge: 'NEW v3.1',
  },
  {
    emoji: '🌐',
    title: 'Real WebGL 3D',
    desc: 'Vanilla three.js. Real geometry, real shadows, real PBR materials. Drop a TkxCard3D into any scene with one prop.',
    badge: 'NEW',
  },
  {
    emoji: '🌍',
    title: '360° + AR/VR',
    desc: 'Equirectangular panorama viewer with hotspots. Auto-detected WebXR for Quest, Vision Pro, and ARCore phones.',
    badge: 'NEW',
  },
  {
    emoji: '♿',
    title: 'WCAG 2.1 AAA',
    desc: '7:1 contrast, 44×44 touch targets, full keyboard nav, screen-reader matrix tested across NVDA / JAWS / VoiceOver / TalkBack.',
  },
  {
    emoji: '🛡️',
    title: 'Security kernel',
    desc: 'XSS, CSP, Trojan Source, clickjacking, PII redaction, rate-limiter. The first React UI library that publishes a threat model.',
  },
  {
    emoji: '📄',
    title: 'PDF without Puppeteer',
    desc: 'Same React tree → browser AND PDF. 50ms cold start. Fits on Vercel serverless. 7 ready templates included.',
  },
  {
    emoji: '🇮🇳',
    title: 'Indian-market built-in',
    desc: 'Aadhaar Verhoeff, PAN, Voter ID, INR lakh/crore grouping, India Post PIN lookup, Tithi/Nakshatra calendar.',
  },
  {
    emoji: '⚡',
    title: 'Zero runtime deps',
    desc: 'The supply-chain attacks of 2025 made this a board concern. We made it a non-issue. One folder added to node_modules.',
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
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
          }}
        >
          Eight reasons it's <span className="tk-gradient-text">different</span>
        </h2>
        <p style={{ color: '#888', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
          Hover any card to see it in action — that's the holographic effect itself.
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
            <p style={{ color: '#aaa', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
          </TkxHolographicCard>
        ))}
      </div>
    </section>
  );
}
