import { TkxScene, TkxCard3D } from 'tekivex-3d';
import { TkxHolographicBadge } from 'tekivex-ui';
import { useImmersive } from '../App';

export function Hero() {
  const { open: openImmersive } = useImmersive();
  return (
    <section
      id="top"
      style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'grid',
        gridTemplateColumns: '1fr',
        alignItems: 'center',
        padding: 'clamp(48px, 8vh, 120px) 24px 48px',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)',
          gap: 'clamp(24px, 4vw, 64px)',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        {/* ── Left: copy + CTAs ───────────────────────────────────────────── */}
        <div>
          <div style={{ display: 'inline-flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <TkxHolographicBadge size="sm">v3.1.0</TkxHolographicBadge>
            <TkxHolographicBadge size="sm">12 packages</TkxHolographicBadge>
            <TkxHolographicBadge size="sm">99 components</TkxHolographicBadge>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              margin: '0 0 18px',
            }}
          >
            <span className="tk-gradient-text">Production-grade</span>
            <br />
            React. <em style={{ fontStyle: 'normal', color: '#fff' }}>Now in 3D.</em>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 1.4vw, 18px)',
              color: '#aaa',
              maxWidth: 520,
              lineHeight: 1.65,
              margin: '0 0 32px',
            }}
          >
            12 npm packages. 99 WCAG 2.1 AAA components. Real WebGL 3D, 360° viewers, AR/VR
            support, holographic UI, built-in security kernel, Puppeteer-free PDF rendering.
            Zero runtime dependencies in the core.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: 24,
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
                letterSpacing: '0.01em',
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(0, 245, 212, 0.3)',
                cursor: 'pointer',
              }}
            >
              🌐 Enter 360° mode →
            </button>

            <a
              href="#playground"
              style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 999,
                fontSize: 15,
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Try the playground
            </a>

            <a
              href="https://www.npmjs.com/package/tekivex-ui"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 28px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#aaa',
                fontWeight: 600,
                borderRadius: 999,
                fontSize: 14,
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              View on npm
            </a>
          </div>

          <style>{`
            @keyframes tk-shimmer {
              0%, 100% { background-position: 0% 50%; }
              50%      { background-position: 100% 50%; }
            }
          `}</style>

          <div
            className="tk-glass"
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 14,
              color: '#00f5d4',
              maxWidth: 520,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ color: '#666' }}>$</span>
            <span style={{ color: '#fff' }}>npm install</span>
            <span>tekivex-ui</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText('npm install tekivex-ui');
              }}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                color: '#00f5d4',
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
              }}
              aria-label="Copy install command"
            >
              copy
            </button>
          </div>
        </div>

        {/* ── Right: live 3D scene with floating cards ──────────────────── */}
        <div
          style={{
            height: 'clamp(380px, 60vh, 560px)',
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background:
              'radial-gradient(circle at 30% 20%, rgba(0,245,212,0.1), transparent 50%), radial-gradient(circle at 70% 80%, rgba(123,47,247,0.1), transparent 50%), #0d0d14',
          }}
          aria-label="Interactive 3D card showcase"
        >
          <TkxScene background="transparent" fov={45} cameraPosition={[0, 0, 7]}>
            <TkxCard3D
              position={[-1.6, 0.4, 0]}
              size={[1.8, 2.4]}
              color="#00f5d4"
              roughness={0.2}
              metalness={0.8}
              autoRotate={0.3}
              maxTilt={0.4}
            />
            <TkxCard3D
              position={[0, -0.2, 0.5]}
              size={[1.8, 2.4]}
              color="#7b2ff7"
              roughness={0.2}
              metalness={0.8}
              autoRotate={0.4}
              maxTilt={0.4}
            />
            <TkxCard3D
              position={[1.6, 0.4, 0]}
              size={[1.8, 2.4]}
              color="#3a86ff"
              roughness={0.2}
              metalness={0.8}
              autoRotate={0.3}
              maxTilt={0.4}
            />
          </TkxScene>

          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(10, 10, 15, 0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 12,
              color: '#bbb',
              textAlign: 'center',
            }}
          >
            ← Move your cursor across the cards →
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
