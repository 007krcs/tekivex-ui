import { useState } from 'react';
import { TkxScene, TkxPanorama360, TkxHotspot, TkxXRSession } from 'tekivex-3d';

// Public CC0 / Wikimedia equirectangular images — replace with your own
const ROOMS: Record<
  string,
  { src: string; label: string; hotspots: { pos: [number, number, number]; label: string; to: string }[] }
> = {
  beach: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/360-Degree-View-Wikipedia-Beach-Cove-Australia.jpg/2048px-360-Degree-View-Wikipedia-Beach-Cove-Australia.jpg',
    label: 'Beach cove',
    hotspots: [
      { pos: [-30, 5, 0], label: 'To forest →', to: 'forest' },
      { pos: [10, 0, -30], label: 'To desert →', to: 'desert' },
    ],
  },
  forest: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Equirectangular_projection_SW.jpg/2560px-Equirectangular_projection_SW.jpg',
    label: 'Forest path',
    hotspots: [{ pos: [30, 0, 0], label: '← Back to beach', to: 'beach' }],
  },
  desert: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Equirectangular_-_Wave_in_air.jpg/2560px-Equirectangular_-_Wave_in_air.jpg',
    label: 'Desert horizon',
    hotspots: [{ pos: [-30, 0, 0], label: '← Back to beach', to: 'beach' }],
  },
};

export function Tour360() {
  const [room, setRoom] = useState<keyof typeof ROOMS>('beach');
  const r = ROOMS[room];

  return (
    <section
      id="tour"
      style={{ padding: '88px 24px 48px', maxWidth: 1280, margin: '0 auto' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
          }}
        >
          Drag to look around · <span className="tk-gradient-text">360° tour</span>
        </h2>
        <p style={{ color: '#888', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
          A complete multi-scene immersive tour built with{' '}
          <code style={{ color: '#00f5d4', fontSize: 14 }}>{'<TkxPanorama360>'}</code> +{' '}
          <code style={{ color: '#00f5d4', fontSize: 14 }}>{'<TkxHotspot>'}</code>. Click hotspots
          to navigate. On Quest 3 / Vision Pro / ARCore phones, the entry buttons appear
          automatically.
        </p>
      </header>

      <div
        style={{
          position: 'relative',
          height: 'clamp(400px, 60vh, 600px)',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#000',
        }}
        aria-label={`Immersive 360-degree view of ${r.label}`}
      >
        <TkxScene fov={75} cameraPosition={[0, 0, 0.01]}>
          <TkxPanorama360 src={r.src} key={room} fadeMs={400} />
          {r.hotspots.map((h) => (
            <TkxHotspot
              key={h.to}
              position={h.pos}
              label={h.label}
              onClick={() => setRoom(h.to as keyof typeof ROOMS)}
              color="#00f5d4"
              size={1.2}
              pulseSpeed={2}
            />
          ))}
          <TkxXRSession />
        </TkxScene>

        {/* Scene name + scene picker */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            zIndex: 5,
          }}
        >
          {Object.entries(ROOMS).map(([id, info]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRoom(id as keyof typeof ROOMS)}
              style={{
                padding: '8px 14px',
                background: room === id ? 'rgba(0, 245, 212, 0.2)' : 'rgba(10, 10, 15, 0.7)',
                border: `1px solid ${room === id ? 'rgba(0, 245, 212, 0.6)' : 'rgba(255,255,255,0.1)'}`,
                color: room === id ? '#00f5d4' : '#ddd',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                minHeight: 36,
              }}
              aria-pressed={room === id}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>

      <p
        style={{
          textAlign: 'center',
          color: '#666',
          fontSize: 13,
          marginTop: 16,
          fontStyle: 'italic',
        }}
      >
        Built with ~30 lines using <code style={{ color: '#00f5d4' }}>tekivex-3d</code>. Replace
        Marzipano (~400 KB) and proprietary 360° SDKs.
      </p>
    </section>
  );
}
