// ─────────────────────────────────────────────────────────────────────────────
// GalaxyMap360 — landing section
//
// Wraps the worked Galaxy Map example from
// examples/universe-360/GalaxyMap.tsx with a section header and an
// implementation snippet.
// ─────────────────────────────────────────────────────────────────────────────

import { GalaxyMap } from '../../../examples/universe-360/GalaxyMap';

const SNIPPET = `import {
  TkxScene, TkxStarfield, TkxParticleField,
  TkxPlanet, TkxOrbitPath, TkxHotspot,
  TkxOrbitControls, TkxXRSession,
} from 'tekivex-3d';
import { TkxHolographicPanel, TkxHolographicGauge } from 'tekivex-ui';

<TkxScene fov={62} cameraPosition={[0, 0, 0.01]}>
  <TkxStarfield count={4000} radius={140} />
  <TkxParticleField count={1500} volume={[60, 30, 60]} />

  <TkxPlanet position={[12, -1, -16]} radius={1.9} ring tint="#ffd29c" glow glowColor="#ffbe0b" />
  <TkxOrbitPath center={[12, -1, -16]} radius={3.2} bodyColor="#3a86ff" speed={0.5} />
  <TkxHotspot position={[12, 1, -16]} label="Cygnus Prime" onClick={...} />

  <TkxOrbitControls preset="showcase" autoRotate />
  <TkxXRSession />
</TkxScene>

{/* Hotspot click → opens this holographic panel */}
<TkxHolographicPanel header={...}>
  <TkxHolographicGauge value={habitability} caption="habitability" />
</TkxHolographicPanel>`;

export function GalaxyMap360() {
  return (
    <section
      id="galaxy-map"
      style={{
        position: 'relative',
        padding: 'clamp(64px, 9vw, 120px) 24px',
        maxWidth: 1280,
        margin: '0 auto',
        zIndex: 1,
      }}
    >
      <Header />
      <GalaxyMap />
      <Snippet code={SNIPPET} />
    </section>
  );
}

function Header() {
  return (
    <header style={{ textAlign: 'center', marginBottom: 32 }}>
      <div
        style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: 999,
          background: 'rgba(0,245,212,0.1)',
          border: '1px solid rgba(0,245,212,0.3)',
          color: '#00f5d4',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 18,
        }}
      >
        Worked example
      </div>
      <h2
        style={{
          margin: '0 0 14px',
          fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          fontWeight: 800,
        }}
      >
        <span className="tk-gradient-text">360°</span> Universe
      </h2>
      <p
        style={{
          margin: '0 auto',
          maxWidth: 680,
          color: '#b8b8d4',
          fontSize: 'clamp(15px, 1.3vw, 17px)',
          lineHeight: 1.65,
        }}
      >
        Six destinations, full WebGL, no panorama photo required. Everything
        is procedural — the starfield, the planet surfaces, the orbit paths,
        the cosmic dust. Click any planet to open a holographic info panel.
        Tap the headset icon to step into VR or AR.
      </p>
    </header>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <details style={{ marginTop: 24 }}>
      <summary
        style={{
          cursor: 'pointer',
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(18, 20, 38, 0.55)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#00f5d4',
          fontWeight: 600,
          fontSize: 13,
          backdropFilter: 'blur(8px)',
          listStyle: 'none',
        }}
      >
        📜 See the implementation
      </summary>
      <pre
        style={{
          marginTop: 12,
          padding: 20,
          background: 'rgba(8, 10, 25, 0.85)',
          border: '1px solid rgba(0,245,212,0.18)',
          borderRadius: 10,
          color: '#dcdce8',
          fontSize: 13,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          lineHeight: 1.55,
          overflow: 'auto',
        }}
      >
        <code>{code}</code>
      </pre>
    </details>
  );
}
