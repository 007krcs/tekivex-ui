// ─────────────────────────────────────────────────────────────────────────────
// Immersive — 360° full-screen experience.
//
// Drop the user into a panoramic spherical environment where every section
// of the site lives as a floating hotspot. Drag/touch/gyroscope to look
// around, click hotspots to open content panels, press the WebXR button
// to step inside on Quest 3 / Vision Pro / ARCore phones.
//
// Works on every device:
//   - Desktop: mouse drag + scroll zoom
//   - Mobile: touch drag + pinch zoom + gyroscope (after permission)
//   - VR headset: Enter VR button → 6DoF immersive
//   - AR-capable phone: Enter AR button → passthrough overlay
//
// Activated from the landing page hero. Press ESC or click the close
// button to return to the regular scrollable site.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, type ReactNode } from 'react';
import { TkxScene, TkxPanorama360, TkxHotspot, TkxXRSession } from 'tekivex-3d';

// Equirectangular cosmic / aurora-style sky
const SKY_360 =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Equirectangular_projection_SW.jpg/2560px-Equirectangular_projection_SW.jpg';

// 8 hotspots arranged in a circle at user's eye level
const HOTSPOTS: {
  id: string;
  label: string;
  pos: [number, number, number];
  color: string;
  panel: { title: string; body: ReactNode };
}[] = [
  {
    id: 'components',
    label: '🧩 Components',
    pos: [-30, 0, 0],
    color: '#00f5d4',
    panel: {
      title: '102 components',
      body: (
        <p>
          Every Tkx* component grouped into 16 families — primitives, forms, KYC, layout,
          display, overlays, data, real-time, AI, charts, media, fintech, utility, holographic,
          and 3D.{' '}
          <a href="/playground/" style={linkStyle}>Browse them all →</a>
        </p>
      ),
    },
  },
  {
    id: 'playground',
    label: '🎮 Playground',
    pos: [-21, 0, -21],
    color: '#3a86ff',
    panel: {
      title: 'Live playground',
      body: (
        <p>
          Click any component to open it in the sandbox at <code>/playground/</code>. Tweak
          props, see the source, copy the code.{' '}
          <a href="/playground/" style={linkStyle}>Open playground →</a>
        </p>
      ),
    },
  },
  {
    id: 'book',
    label: '📖 Book',
    pos: [0, 0, -30],
    color: '#7b2ff7',
    panel: {
      title: 'Component catalog',
      body: (
        <p>
          Storybook-style controls + a11y panel + viewport toggles. No Storybook dependency.{' '}
          <a href="/book/" style={linkStyle}>Open catalog →</a>
        </p>
      ),
    },
  },
  {
    id: 'pdf',
    label: '📄 PDF',
    pos: [21, 0, -21],
    color: '#ff006e',
    panel: {
      title: 'React → PDF',
      body: (
        <p>
          Replace Puppeteer with one npm install. Same React tree drives browser AND downloaded
          PDF. ~50ms cold start, fits Vercel serverless.{' '}
          <code>npm install tekivex-pdf</code>
        </p>
      ),
    },
  },
  {
    id: 'security',
    label: '🛡️ Security',
    pos: [30, 0, 0],
    color: '#ffbe0b',
    panel: {
      title: 'Built-in security kernel',
      body: (
        <p>
          XSS, CSP, Trojan Source, clickjacking, PII redaction, rate-limit. Published threat
          model. The first React UI library that ships defense as defaults.
        </p>
      ),
    },
  },
  {
    id: 'install',
    label: '⚡ Install',
    pos: [21, 0, 21],
    color: '#00f5d4',
    panel: {
      title: 'Quick start',
      body: (
        <pre style={preStyle}>
          {`npm install tekivex-ui
npm install tekivex-3d three
npm install tekivex-pdf`}
        </pre>
      ),
    },
  },
  {
    id: 'roadmap',
    label: '🗺️ Roadmap',
    pos: [0, 0, 30],
    color: '#06d6a0',
    panel: {
      title: "What's next",
      body: (
        <p>
          v3.2 ships Kanban, RichEditor, FormBuilder, ThemeStudio. v0.2 of tekivex-3d ships
          Model3D, Logo3D, ParticleField. Concrete scope, no "TBD".
        </p>
      ),
    },
  },
  {
    id: 'support',
    label: '🐛 Support',
    pos: [-21, 0, 21],
    color: '#3a86ff',
    panel: {
      title: 'Report an issue',
      body: (
        <p>
          Public issue tracker. Bugs, feature requests, publish requests — all welcome.{' '}
          <a
            href="https://github.com/007krcs/tekivex-ui/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            File one →
          </a>
        </p>
      ),
    },
  },
];

const linkStyle: React.CSSProperties = { color: '#00f5d4', fontWeight: 600 };
const preStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 12,
  background: '#06060a',
  padding: '10px 14px',
  borderRadius: 8,
  color: '#00f5d4',
  margin: 0,
  whiteSpace: 'pre',
};

interface ImmersiveProps {
  open: boolean;
  onClose: () => void;
}

export function Immersive({ open, onClose }: ImmersiveProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // ESC closes the experience
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePanel) setActivePanel(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, activePanel, onClose]);

  // Lock background scroll while immersive is open
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  if (!open) return null;

  const active = HOTSPOTS.find((h) => h.id === activePanel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Immersive 360-degree TekiVex UI experience"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#000',
      }}
    >
      <TkxScene fov={75} cameraPosition={[0, 0, 0.01]} xr>
        <TkxPanorama360 src={SKY_360} fadeMs={800} gyro />
        {HOTSPOTS.map((h) => (
          <TkxHotspot
            key={h.id}
            position={h.pos}
            label={h.label}
            color={h.color}
            size={2}
            pulseSpeed={2}
            onClick={() => setActivePanel(h.id)}
          />
        ))}
        <TkxXRSession />
      </TkxScene>

      {/* Top bar: brand + close */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#fff',
            fontWeight: 700,
            pointerEvents: 'auto',
          }}
        >
          <span style={{ fontSize: 22 }} aria-hidden="true">⚡</span>
          <span className="tk-gradient-text" style={{ fontSize: 18 }}>TekiVex UI</span>
          <span
            style={{
              fontSize: 11,
              padding: '2px 8px',
              background: 'rgba(0, 245, 212, 0.15)',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              borderRadius: 999,
              color: '#00f5d4',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginLeft: 8,
            }}
          >
            360° MODE
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Exit immersive mode"
          style={{
            pointerEvents: 'auto',
            padding: '8px 18px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
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
        >
          ✕ Exit
        </button>
      </header>

      {/* Bottom hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 88,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 18px',
          background: 'rgba(10,10,15,0.65)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 999,
          color: '#bbb',
          fontSize: 13,
          fontWeight: 500,
          backdropFilter: 'blur(8px)',
          zIndex: 5,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        🖱️ drag to look · 📱 tilt your phone · 🥽 enter VR/AR · ⎋ ESC to exit
      </div>

      {/* Active hotspot panel */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.panel.title}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 30,
            padding: 20,
          }}
          onClick={() => setActivePanel(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 560,
              width: '100%',
              padding: 32,
              borderRadius: 20,
              background: 'rgba(18, 18, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${active.color}`,
              boxShadow: `0 0 60px ${active.color}33`,
              color: '#e8e8f4',
              animation: 'tk-panel-in 200ms ease-out',
            }}
          >
            <header style={{ marginBottom: 16 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: active.color,
                }}
              >
                {active.panel.title}
              </h2>
            </header>

            <div style={{ fontSize: 15, lineHeight: 1.65, color: '#ddd' }}>
              {active.panel.body}
            </div>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              style={{
                marginTop: 24,
                padding: '10px 20px',
                background: active.color,
                color: '#0a0a0f',
                border: 'none',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                minHeight: 40,
              }}
            >
              ← Back to the sphere
            </button>
          </div>

          <style>{`
            @keyframes tk-panel-in {
              from { opacity: 0; transform: scale(0.95); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
