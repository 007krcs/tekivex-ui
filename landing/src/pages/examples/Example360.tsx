// ─────────────────────────────────────────────────────────────────────────────
// /examples/360 — multi-scene 360° tour example.
//
// Demonstrates: TkxScene + TkxPanorama360 + TkxHotspot + TkxParticleField,
// gyro support on mobile, fullscreen toggle, scene switching via hotspots,
// and a thumbnail strip for direct navigation. The four equirectangular
// images are public-domain panoramas served from Wikimedia Commons.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { TkxScene, TkxPanorama360, TkxHotspot, TkxParticleField } from 'tekivex-3d';
import { ExampleShell } from './ExampleShell';
import { usePageMeta } from '../../use-page-meta';

interface Scene {
  id: string;
  title: string;
  blurb: string;
  src: string;
  thumb: string;
  hotspots: { to: string; label: string; pos: [number, number, number]; color: string }[];
}

const SCENES: Scene[] = [
  {
    id: 'cosmos',
    title: 'Open cosmos',
    blurb: 'A deep-field starscape — the "lobby" of the tour.',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Equirectangular_projection_SW.jpg/2560px-Equirectangular_projection_SW.jpg',
    thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Equirectangular_projection_SW.jpg/640px-Equirectangular_projection_SW.jpg',
    hotspots: [
      { to: 'beach',  label: '🏖️ Beach',     pos: [-22, 4, -10], color: '#00f5d4' },
      { to: 'forest', label: '🌲 Forest',    pos: [22, 4, -10],  color: '#06d6a0' },
      { to: 'space',  label: '🛰️ Space station', pos: [0, 6, 22], color: '#3a86ff' },
    ],
  },
  {
    id: 'beach',
    title: 'Tropical beach',
    blurb: 'Long sandy curve with palm trees — drag horizontally for the full panorama.',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Sayulita_Mexico_-_panoramio_%2814%29.jpg/2560px-Sayulita_Mexico_-_panoramio_%2814%29.jpg',
    thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Sayulita_Mexico_-_panoramio_%2814%29.jpg/640px-Sayulita_Mexico_-_panoramio_%2814%29.jpg',
    hotspots: [
      { to: 'cosmos', label: '↩ Lobby', pos: [0, 4, -22], color: '#c4a8ff' },
      { to: 'forest', label: '🌲 Forest', pos: [22, 4, -10], color: '#06d6a0' },
    ],
  },
  {
    id: 'forest',
    title: 'Forest clearing',
    blurb: 'Tall conifers around a quiet clearing — a calmer space inside the tour.',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/360_north_pond_panorama.jpg/2560px-360_north_pond_panorama.jpg',
    thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/360_north_pond_panorama.jpg/640px-360_north_pond_panorama.jpg',
    hotspots: [
      { to: 'cosmos', label: '↩ Lobby', pos: [0, 4, -22], color: '#c4a8ff' },
      { to: 'beach',  label: '🏖️ Beach', pos: [-22, 4, -10], color: '#00f5d4' },
    ],
  },
  {
    id: 'space',
    title: 'Space station',
    blurb: 'A celestial scene rendered as the equirectangular sky map of the Milky Way.',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESO_-_Milky_Way.jpg/2560px-ESO_-_Milky_Way.jpg',
    thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESO_-_Milky_Way.jpg/640px-ESO_-_Milky_Way.jpg',
    hotspots: [
      { to: 'cosmos', label: '↩ Lobby', pos: [0, 4, -22], color: '#c4a8ff' },
    ],
  },
];

export function Example360() {
  usePageMeta(
    '360° tour example — TekiVex UI',
    'A working multi-scene 360° tour built with tekivex-3d: drag to look, click hotspots to teleport between scenes, optional fullscreen and gyroscope.',
    { keywords: 'tekivex, tekivex-3d, 360 tour example, equirectangular, react webgl, three.js panorama' },
  );

  const [activeId, setActiveId] = useState<string>('cosmos');
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = SCENES.find((s) => s.id === activeId)!;

  function go(id: string) {
    const found = SCENES.find((s) => s.id === id);
    if (found) setActiveId(found.id);
  }

  function fullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }

  return (
    <ExampleShell
      title="360° multi-scene tour"
      eyebrow="Examples · 360°"
      description="Drag to look around. Click any glowing hotspot to teleport to another scene. On mobile, tilt your phone to control the camera. Press fullscreen to fill the screen."
      sourceUrl="https://github.com/007krcs/tekivex-ui/blob/master/landing/src/pages/examples/Example360.tsx"
      surface="dark"
    >
      <div
        ref={wrapRef}
        style={{
          position: 'relative',
          height: 'min(78vh, 720px)',
          margin: '24px auto 0',
          maxWidth: 1280,
          padding: '0 24px',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '100%',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: '#000',
          }}
        >
          <TkxScene fov={75} cameraPosition={[0, 0, 0.01]} background="transparent">
            <TkxPanorama360 src={active.src} fadeMs={500} gyro />
            <TkxParticleField count={1500} volume={[40, 20, 40]} driftSpeed={0.25} size={0.04} />
            {active.hotspots.map((h) => (
              <TkxHotspot
                key={`${active.id}-${h.to}`}
                position={h.pos}
                label={h.label}
                color={h.color}
                size={1.4}
                pulseSpeed={2}
                onClick={() => go(h.to)}
              />
            ))}
          </TkxScene>

          {/* HUD: scene title + fullscreen */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(10, 11, 21, 0.75)',
                backdropFilter: 'blur(10px)',
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                maxWidth: 360,
              }}
            >
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Scene
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 2 }}>
                {active.title}
              </div>
              <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4, lineHeight: 1.5 }}>
                {active.blurb}
              </div>
            </div>
            <button
              type="button"
              onClick={fullscreen}
              style={{
                pointerEvents: 'auto',
                padding: '8px 14px',
                background: 'rgba(10, 11, 21, 0.8)',
                color: '#00f5d4',
                border: '1px solid rgba(0, 245, 212, 0.4)',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ⛶ Fullscreen
            </button>
          </div>

          {/* Hint pill, bottom-center */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 18,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 16px',
              background: 'rgba(10, 11, 21, 0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999,
              color: '#dcdce8',
              fontSize: 12,
              pointerEvents: 'none',
            }}
          >
            🖱️ click + drag · 📱 tilt your phone · 🎯 click a hotspot to teleport
          </div>
        </div>

        {/* Thumbnail strip */}
        <div
          role="tablist"
          aria-label="Scenes"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${SCENES.length}, 1fr)`,
            gap: 12,
            marginTop: 16,
          }}
        >
          {SCENES.map((s) => {
            const isActive = s.id === activeId;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => go(s.id)}
                style={{
                  position: 'relative',
                  padding: 0,
                  border: isActive ? '2px solid #00f5d4' : '2px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#000',
                  aspectRatio: '16/9',
                  transition: 'border-color 0.15s, transform 0.15s',
                  transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                <img
                  src={s.thumb}
                  alt={s.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isActive ? 1 : 0.7 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'flex-end',
                    background: 'linear-gradient(to top, rgba(10,11,21,0.85), transparent 60%)',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Code snippet */}
        <details
          style={{
            marginTop: 24,
            background: 'rgba(18, 20, 38, 0.55)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '12px 16px',
            color: '#dcdce8',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#fff', fontSize: 14 }}>
            Show the code
          </summary>
          <pre
            style={{
              margin: '12px 0 0',
              padding: 16,
              background: 'rgba(8, 10, 25, 0.85)',
              borderRadius: 8,
              fontSize: 12.5,
              lineHeight: 1.6,
              fontFamily: 'ui-monospace, monospace',
              overflowX: 'auto',
              color: '#dcdce8',
            }}
          >{`import { TkxScene, TkxPanorama360, TkxHotspot, TkxParticleField } from 'tekivex-3d';

<TkxScene fov={75} cameraPosition={[0, 0, 0.01]} background="transparent">
  <TkxPanorama360 src={panoramaUrl} fadeMs={500} gyro />
  <TkxParticleField count={1500} volume={[40, 20, 40]} driftSpeed={0.25} size={0.04} />
  <TkxHotspot
    position={[-22, 4, -10]}
    label="🏖️ Beach"
    color="#00f5d4"
    size={1.4}
    pulseSpeed={2}
    onClick={() => setScene('beach')}
  />
</TkxScene>`}</pre>
        </details>
      </div>
      <div style={{ height: 48 }} />
    </ExampleShell>
  );
}
