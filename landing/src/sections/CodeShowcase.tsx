import { useState } from 'react';

const TABS = [
  {
    id: 'install',
    label: 'Install',
    code: `# Pick what you need
npm install tekivex-ui              # core: 99 components
npm install tekivex-pdf             # React → PDF, no Puppeteer
npm install tekivex-3d three        # WebGL 3D + 360° + AR/VR
npm install tekivex-form            # form-only slim install
npm install tekivex-india           # Aadhaar, PAN, INR lakh/crore`,
  },
  {
    id: 'holographic',
    label: 'Holographic',
    code: `import { ThemeProvider, quantumDark, TkxHolographicCard } from 'tekivex-ui';
import 'tekivex-ui/styles';

export function PremiumCard() {
  return (
    <ThemeProvider theme={quantumDark}>
      <TkxHolographicCard
        title="Premium tier"
        subtitle="Unlimited PDFs · Priority support"
        maxTilt={18}
      >
        Move your cursor across this card.
      </TkxHolographicCard>
    </ThemeProvider>
  );
}`,
  },
  {
    id: '3d',
    label: '3D scene',
    code: `import { TkxScene, TkxCard3D } from 'tekivex-3d';

export function Hero3D() {
  return (
    <div style={{ height: 600 }}>
      <TkxScene fov={45} cameraPosition={[0, 0, 6]}>
        <TkxCard3D
          texture="/poster.jpg"
          autoRotate={0.4}
          maxTilt={0.4}
          metalness={0.8}
          roughness={0.2}
          onClick={() => console.log('clicked!')}
        />
      </TkxScene>
    </div>
  );
}`,
  },
  {
    id: '360',
    label: '360° tour',
    code: `import { useState } from 'react';
import { TkxScene, TkxPanorama360, TkxHotspot } from 'tekivex-3d';

const ROOMS = {
  lobby:  { src: '/360/lobby.jpg',  hotspots: [
    { label: 'Living →', pos: [10,0,0] as const, to: 'living' },
  ]},
  living: { src: '/360/living.jpg', hotspots: [
    { label: '← Back', pos: [-10,0,0] as const, to: 'lobby' },
  ]},
};

export function VirtualTour() {
  const [room, setRoom] = useState<keyof typeof ROOMS>('lobby');
  return (
    <TkxScene fov={75}>
      <TkxPanorama360 src={ROOMS[room].src} gyro />
      {ROOMS[room].hotspots.map((h) => (
        <TkxHotspot
          key={h.to}
          position={h.pos}
          label={h.label}
          onClick={() => setRoom(h.to)}
        />
      ))}
    </TkxScene>
  );
}`,
  },
  {
    id: 'pdf',
    label: 'PDF (no Puppeteer)',
    code: `import { renderToPDF, BiodataTemplate } from 'tekivex-pdf';

export async function GET() {
  const buffer = await renderToPDF(
    <BiodataTemplate data={{
      name: 'Aisha Verma',
      personal:  [{ label: 'DOB',     value: '14 Mar 2002' }],
      education: [{ label: 'Degree',  value: 'B.Tech CSE' }],
      family:    [{ label: 'Father',  value: 'Govt. service' }],
    }} />
  );
  // ~50ms cold-start. Fits Vercel serverless. No 200MB Chromium.
  return new Response(buffer, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}`,
  },
];

export function CodeShowcase() {
  const [tab, setTab] = useState(TABS[0].id);
  const [copied, setCopied] = useState(false);
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <section style={{ padding: '88px 24px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
          }}
        >
          Five recipes, <span className="tk-gradient-text">copy-paste</span>
        </h2>
        <p style={{ color: '#888', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
          Realistic code that runs as-is. No "configure your bundler first" footnotes.
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'rgba(18,18,26,0.65)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 16,
          overflowX: 'auto',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 8,
              background: tab === t.id ? 'rgba(0,245,212,0.15)' : 'transparent',
              color: tab === t.id ? '#00f5d4' : '#aaa',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 36,
            }}
            aria-pressed={tab === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: '#06060a',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '20px 24px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 13,
          color: '#e8e8f4',
          overflowX: 'auto',
          position: 'relative',
          whiteSpace: 'pre',
          lineHeight: 1.65,
        }}
      >
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(active.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 12px',
            background: copied ? '#00f5d4' : 'rgba(255,255,255,0.08)',
            color: copied ? '#0a0a0f' : '#aaa',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <code>{active.code}</code>
      </div>
    </section>
  );
}
