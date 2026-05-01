import { useState } from 'react';
import {
  TkxScene,
  TkxStarfield,
  TkxParticleField,
  TkxPlanet,
  TkxOrbitPath,
  TkxAvatar3D,
  TkxHotspot,
  TkxOrbitControls,
  TkxXRSession,
} from 'tekivex-3d';

// ─────────────────────────────────────────────────────────────────────────────
// Tour360 — multi-scene immersive tour
//
// Three procedural scenes built from tekivex-3d primitives. No external
// equirectangular photos to fail to load, no asset bytes to ship. Each
// scene composes ~5-7 primitives differently to demonstrate the toolkit.
// ─────────────────────────────────────────────────────────────────────────────

type SceneId = 'earth-orbit' | 'mars-surface' | 'deep-space';

const SCENES: Record<SceneId, { label: string; emoji: string; tagline: string }> = {
  'earth-orbit':  { label: 'Earth orbit',     emoji: '🌍', tagline: 'Two satellites, one moon, blue marble below' },
  'mars-surface': { label: 'Mars surface',    emoji: '🚀', tagline: 'Surveyor at the survey site, rover orbiting overhead' },
  'deep-space':   { label: 'Deep space',      emoji: '✨', tagline: 'Three planets, drifting cosmic dust, 4000 stars' },
};

function SceneContent({ id, onJump }: { id: SceneId; onJump: (next: SceneId) => void }) {
  if (id === 'earth-orbit') {
    return (
      <>
        <TkxStarfield count={3500} radius={120} spinSpeed={0.005} />
        <TkxParticleField count={800} volume={[40, 20, 40]} driftSpeed={0.2} size={0.04} />
        <TkxPlanet position={[0, -1.5, -3]} radius={1.6} tint="#7ec8e3" glow glowColor="#3a86ff" />
        <TkxOrbitPath center={[0, -1.5, -3]} radius={2.6} bodyColor="#c4a8ff" speed={0.4} bodySize={0.18} inclination={0.15} />
        <TkxOrbitPath center={[0, -1.5, -3]} radius={3.4} bodyColor="#00f5d4" speed={0.25} bodySize={0.14} inclination={-0.25} />
        <TkxAvatar3D position={[2.4, 0.5, -1]} scale={0.6} state="idle" accent="#7b8eff" halo />
        <TkxHotspot position={[-1.8, 1.8, -2]} label="Mars surface →" color="#ff006e" onClick={() => onJump('mars-surface')} />
        <TkxHotspot position={[2.4, 1.8, -1]} label="Deep space →" color="#c4a8ff" onClick={() => onJump('deep-space')} />
      </>
    );
  }
  if (id === 'mars-surface') {
    return (
      <>
        <TkxStarfield count={2500} radius={120} spinSpeed={0.003} temperatureColors={false} />
        <TkxParticleField count={1500} volume={[30, 8, 30]} driftSpeed={0.4} size={0.05} />
        <TkxPlanet position={[0, -2.6, -2.5]} radius={2.2} tint="#d97757" glow glowColor="#ff006e" />
        <TkxOrbitPath center={[0, -2.6, -2.5]} radius={3.2} bodyColor="#ffbe0b" speed={0.6} bodySize={0.15} inclination={0.5} />
        <TkxAvatar3D position={[-1.4, -0.6, 0]} scale={0.7} state="talk" accent="#00f5d4" />
        <TkxAvatar3D position={[1.6, -0.6, 0]} scale={0.7} state="cheer" accent="#ffbe0b" halo />
        <TkxHotspot position={[-1.4, 1, 0]} label="← Earth orbit" onClick={() => onJump('earth-orbit')} />
        <TkxHotspot position={[1.8, 1.6, 0]} label="Deep space →" color="#c4a8ff" onClick={() => onJump('deep-space')} />
      </>
    );
  }
  // deep-space
  return (
    <>
      <TkxStarfield count={4000} radius={140} spinSpeed={0.008} />
      <TkxParticleField count={1800} volume={[60, 30, 60]} driftSpeed={0.3} size={0.045} />
      <TkxPlanet position={[-3.5, 0.5, -4]} radius={1.1} tint="#7ec8e3" glow glowColor="#3a86ff" />
      <TkxPlanet position={[3, -0.4, -5]} radius={1.4} tint="#ffd29c" ring glowColor="#ffbe0b" />
      <TkxPlanet position={[0, 1.8, -6]} radius={0.9} tint="#cfeaff" glow glowColor="#00f5d4" />
      <TkxOrbitPath center={[3, -0.4, -5]} radius={2.1} bodyColor="#3a86ff" speed={0.5} bodySize={0.13} inclination={0.3} />
      <TkxHotspot position={[-3.5, 2,    -4]} label="← Earth orbit"  onClick={() => onJump('earth-orbit')} />
      <TkxHotspot position={[3,    1.5,  -5]} label="← Mars surface" color="#ff006e" onClick={() => onJump('mars-surface')} />
    </>
  );
}

export function Tour360() {
  const [scene, setScene] = useState<SceneId>('earth-orbit');
  const meta = SCENES[scene];

  return (
    <section
      id="tour"
      style={{
        position: 'relative',
        padding: 'clamp(64px, 9vw, 120px) 24px 48px',
        maxWidth: 1280,
        margin: '0 auto',
        zIndex: 1,
      }}
    >
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
          Drag to look around
        </div>
        <h2
          style={{
            margin: '0 0 14px',
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
          }}
        >
          A <span className="tk-gradient-text">three-scene galaxy tour</span>
        </h2>
        <p style={{ color: '#b8b8d4', maxWidth: 680, margin: '0 auto', fontSize: 16, lineHeight: 1.65 }}>
          Earth orbit → Mars surface → deep space. Composes <code style={code}>{'<TkxStarfield>'}</code>,{' '}
          <code style={code}>{'<TkxPlanet>'}</code>, <code style={code}>{'<TkxOrbitPath>'}</code>,{' '}
          <code style={code}>{'<TkxAvatar3D>'}</code>, and <code style={code}>{'<TkxHotspot>'}</code>{' '}
          — all procedural, zero asset bytes shipped. Click any hotspot to navigate. WebXR entry buttons appear
          on Quest 3 / Vision Pro / ARCore phones automatically.
        </p>
      </header>

      <div
        style={{
          position: 'relative',
          height: 'clamp(480px, 70vh, 720px)',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(123,142,255,0.2)',
          background:
            'radial-gradient(ellipse at center, rgba(123,142,255,0.12), transparent 60%), #060615',
        }}
        aria-label={`Immersive 360-degree view of ${meta.label}`}
      >
        <TkxScene fov={70} cameraPosition={[0, 0.4, 1.2]} background="transparent">
          <SceneContent id={scene} onJump={setScene} />
          <TkxOrbitControls preset="showcase" autoRotate autoRotateSpeed={0.5} enableZoom={false} />
          <TkxXRSession />
        </TkxScene>

        {/* Scene picker */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            zIndex: 5,
          }}
        >
          {(Object.entries(SCENES) as [SceneId, typeof SCENES[SceneId]][]).map(([id, info]) => (
            <button
              key={id}
              type="button"
              onClick={() => setScene(id)}
              style={{
                padding: '8px 14px',
                background: scene === id ? 'rgba(0,245,212,0.18)' : 'rgba(8,10,25,0.7)',
                border: `1px solid ${scene === id ? 'rgba(0,245,212,0.6)' : 'rgba(255,255,255,0.12)'}`,
                color: scene === id ? '#00f5d4' : '#dcdce8',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                minHeight: 36,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              aria-pressed={scene === id}
            >
              <span aria-hidden="true">{info.emoji}</span>
              {info.label}
            </button>
          ))}
        </div>

        {/* Tagline strip */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 5,
            padding: '10px 16px',
            borderRadius: 12,
            background: 'rgba(8,10,25,0.7)',
            border: '1px solid rgba(123,142,255,0.25)',
            backdropFilter: 'blur(8px)',
            color: '#dcdce8',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span>
            <span style={{ color: '#c4a8ff', fontWeight: 700, marginRight: 8 }}>{meta.label}</span>
            <span style={{ color: '#888' }}>{meta.tagline}</span>
          </span>
          <span style={{ color: '#888', fontSize: 12 }}>
            🖱️ drag to look · 🥽 enter VR
          </span>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: 16, fontStyle: 'italic' }}>
        Built with ~80 lines of <code style={code}>tekivex-3d</code>. Replaces Marzipano (~400 KB) and
        proprietary 360° SDKs.
      </p>
    </section>
  );
}

const code: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85em',
  padding: '1px 6px',
  borderRadius: 4,
  background: 'rgba(0,245,212,0.1)',
  color: '#00f5d4',
};
