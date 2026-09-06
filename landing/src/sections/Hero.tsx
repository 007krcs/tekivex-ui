// ─────────────────────────────────────────────────────────────────────────────
// Hero — full-viewport 360° experience (the default first impression)
//
// First-of-its-kind: visitors don't click a CTA to enter 360° mode — they
// land directly inside the sphere. Scroll past the hero to reach the
// traditional sections (stats, features, etc.) for SEO and a11y.
//
// Composition:
//   - TkxScene fills 100vh
//   - TkxPanorama360 as the backdrop (cosmic equirectangular)
//   - TkxParticleField on top for depth + motion
//   - 6 TkxHotspots arranged around the user — each opens a quick info card
//   - HTML overlay (gradient title, badges, install snippet) sits in front
//     using pointerEvents: 'none' on the wrapper + 'auto' on interactive bits
//     so the canvas underneath still receives drag/zoom events outside the
//     content boxes
//   - "↓ Scroll to explore" indicator at bottom
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { TkxScene, TkxPanorama360, TkxHotspot, TkxParticleField, TkxXRSession } from 'tekivex-3d';
import { TkxHolographicBadge } from 'tekivex-ui';
import { useImmersive } from '../immersive-context';
import { withBase } from '../base';

const SKY_360 =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Equirectangular_projection_SW.jpg/2560px-Equirectangular_projection_SW.jpg';

const HOTSPOTS: { id: string; label: string; pos: [number, number, number]; color: string; href: string }[] = [
  { id: 'components', label: '🧩 102 components', pos: [-22, 6, -12], color: '#00f5d4', href: '#components' },
  { id: 'playground', label: '🎮 Playground',     pos: [-12, -3, -22], color: '#3a86ff', href: withBase('/playground/') },
  { id: 'pdf',        label: '📄 PDF · no Puppeteer', pos: [12, 4, -22], color: '#ff006e', href: '#packages' },
  { id: 'security',   label: '🛡️ Security kernel', pos: [22, -2, -10], color: '#ffbe0b', href: '#features' },
  { id: 'roadmap',    label: '🗺️ Roadmap',         pos: [12, 6, 18], color: '#06d6a0', href: '#roadmap' },
  { id: 'book',       label: '📖 Catalog',         pos: [-14, -2, 18], color: '#7b2ff7', href: withBase('/book/') },
];

export function Hero() {
  const { open: openImmersive } = useImmersive();
  const [hint, setHint] = useState(true);

  function navigate(href: string) {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = href;
    }
  }

  return (
    <section
      id="top"
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: 600,
        width: '100%',
        overflow: 'hidden',
        marginTop: -56, // pull under the sticky nav
        background: '#0a0b15', // dark island regardless of page theme — the
                                // 360° panorama, particles, and white text
                                // overlay are designed for a dark backdrop
        color: '#ffffff',
        isolation: 'isolate', // create a stacking context so the global
                              // .tk-aurora / .tk-grid-bg / .tk-vignette
                              // (z-index:0, position:fixed) don't bleed
                              // through and wash out the edges
      }}
      onPointerDown={() => setHint(false)}
    >
      {/* ── Full-viewport WebGL layer (drag/zoom/gyro are handled here) ─── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <TkxScene
          fov={75}
          cameraPosition={[0, 0, 0.01]}
          background="transparent"
        >
          <TkxPanorama360 src={SKY_360} fadeMs={600} gyro />
          <TkxParticleField count={3000} volume={[40, 20, 40]} driftSpeed={0.3} size={0.05} />
          {HOTSPOTS.map((h) => (
            <TkxHotspot
              key={h.id}
              position={h.pos}
              label={h.label}
              color={h.color}
              size={1.6}
              pulseSpeed={2}
              onClick={() => navigate(h.href)}
            />
          ))}
          <TkxXRSession />
        </TkxScene>
      </div>

      {/* ── Vignette gradient for text legibility ──────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(12,13,26,0.65) 70%, rgba(10,11,21,0.92) 100%)',
        }}
      />

      {/* ── HTML overlay: title + CTAs + install snippet ───────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none', // drag-through to canvas by default
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px, 5vh, 56px) 24px',
          textAlign: 'center',
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            gap: 8,
            marginBottom: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <TkxHolographicBadge size="sm" tone="success">114 components · published threat model</TkxHolographicBadge>
          <TkxHolographicBadge size="sm" tone="info">SHA-256 audit trail</TkxHolographicBadge>
          <TkxHolographicBadge size="sm" tone="neutral">zero runtime deps</TkxHolographicBadge>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 7vw, 5.5rem)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            margin: '0 0 16px',
            color: '#fff',
            textShadow: '0 4px 32px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'none',
          }}
        >
          The <span className="tk-gradient-text">React component library</span>{' '}
          that ships with a <em style={{ fontStyle: 'normal', color: '#fff' }}>threat model</em>.
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 1.4vw, 18px)',
            color: '#dcdce8',
            maxWidth: 720,
            lineHeight: 1.6,
            margin: '0 auto 28px',
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none',
          }}
        >
          116 production components. WCAG 2.1 AAA target (third-party audit on roadmap, not completed). Zero runtime dependencies in core.
          Tamper-evident SHA-256 audit trail. <strong>SecurityCore:</strong> XSS sanitization,
          Trojan Source defense, magic-byte MIME verification, CSP builder, Trusted Types,
          PII redaction with Luhn-validated credit cards. The threat model is published —
          every other major React UI library expects you to write your own.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 24,
            pointerEvents: 'auto',
          }}
        >
          <button
            type="button"
            onClick={openImmersive}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #00f5d4, #3a86ff, #7b2ff7)',
              backgroundSize: '200% 200%',
              animation: 'tk-shimmer 8s ease infinite',
              color: '#0a0a0f',
              fontWeight: 700,
              borderRadius: 999,
              border: 'none',
              fontSize: 15,
              minHeight: 44,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 245, 212, 0.4)',
            }}
          >
            🌐 Fullscreen 360° →
          </button>

          <a
            href="https://www.npmjs.com/package/tekivex-ui"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '14px 28px',
              background: 'rgba(10, 10, 15, 0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 999,
              fontSize: 15,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            View on npm
          </a>
        </div>

        <code
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: 'rgba(10, 10, 15, 0.75)',
            border: '1px solid rgba(0, 245, 212, 0.3)',
            borderRadius: 8,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 13,
            color: '#00f5d4',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'auto',
            cursor: 'copy',
          }}
          onClick={() => {
            navigator.clipboard?.writeText('npm install tekivex-ui');
          }}
        >
          $ npm install tekivex-ui
        </code>
      </div>

      {/* ── Drag-to-look hint (auto-dismisses on first interaction) ──────── */}
      {hint && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '14px 22px',
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 999,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
            pointerEvents: 'none',
            zIndex: 6,
            opacity: 0.85,
            animation: 'tk-bob 3s ease-in-out infinite',
          }}
        >
          🖱️ click + drag · 📱 tilt your phone · 🥽 enter VR
        </div>
      )}

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          color: '#888',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 700,
          pointerEvents: 'none',
          zIndex: 5,
          animation: 'tk-bob 2.4s ease-in-out infinite',
        }}
      >
        <span>Scroll for more</span>
        <span style={{ fontSize: 18 }}>↓</span>
      </div>

      <style>{`
        @keyframes tk-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes tk-bob {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50%      { transform: translate(-50%, -50%) translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="tk-shimmer"], [style*="tk-bob"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
