// ─────────────────────────────────────────────────────────────────────────────
// /examples/ar-vr — WebXR (AR + VR) example.
//
// Demonstrates: TkxXRSession capability detection, AR pass-through entry,
// VR immersive entry, in-scene 3D content (Card3D + Logo3D + ParticleField),
// graceful fallback when neither AR nor VR is supported on the device.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  TkxScene,
  TkxXRSession,
  TkxCard3D,
  TkxLogo3D,
  TkxParticleField,
  TkxOrbitControls,
} from 'tekivex-3d';
import { ExampleShell } from './ExampleShell';
import { usePageMeta } from '../../use-page-meta';

interface XRSupport {
  ar: boolean;
  vr: boolean;
  checking: boolean;
}

function useXRSupport(): XRSupport {
  const [s, setS] = useState<XRSupport>({ ar: false, vr: false, checking: true });
  useEffect(() => {
    const xr = (navigator as Navigator & { xr?: { isSessionSupported(m: string): Promise<boolean> } }).xr;
    if (!xr || typeof xr.isSessionSupported !== 'function') {
      setS({ ar: false, vr: false, checking: false });
      return;
    }
    Promise.all([
      xr.isSessionSupported('immersive-ar').catch(() => false),
      xr.isSessionSupported('immersive-vr').catch(() => false),
    ]).then(([ar, vr]) => setS({ ar, vr, checking: false }));
  }, []);
  return s;
}

export function ExampleARVR() {
  usePageMeta(
    'AR / VR example — TekiVex UI',
    'A working WebXR demo built with tekivex-3d: enter AR pass-through on Quest 3 / Vision Pro / ARCore phones, enter immersive VR on Quest, or interact with the 3D scene from any browser.',
    { keywords: 'tekivex, tekivex-3d, webxr example, ar example, vr example, react three.js, quest, vision pro' },
  );

  const xr = useXRSupport();
  const [sessionMode, setSessionMode] = useState<'ar' | 'vr' | null>(null);

  return (
    <ExampleShell
      title="AR / VR scene"
      eyebrow="Examples · WebXR"
      description="A floating product card with a holographic logo and ambient particles. Tap one of the buttons to enter AR pass-through (Quest 3, Vision Pro, modern Android) or immersive VR (Quest, Pico). Drag to orbit the scene from any device."
      sourceUrl="https://github.com/007krcs/tekivex-ui/blob/master/landing/src/pages/examples/ExampleARVR.tsx"
      surface="dark"
    >
      <div
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
            background: 'radial-gradient(ellipse at center, #16182d 0%, #0a0b15 70%)',
          }}
        >
          <TkxScene fov={60} cameraPosition={[0, 1.6, 4]} background="transparent">
            <TkxParticleField count={2000} volume={[20, 15, 20]} driftSpeed={0.3} size={0.04} />
            <TkxLogo3D position={[0, 2.4, -2]} scale={1.6} text="TekiVex" />
            <TkxCard3D
              position={[0, 1.2, -1.5]}
              size={[2.4, 1.4]}
              color="#00f5d4"
              title="Hello, spatial web"
              subtitle="Enter AR or VR to place this card in your room"
            />
            <TkxOrbitControls preset="orbit" autoRotate />
            <TkxXRSession
              ar
              vr
              onSessionStart={(mode) => setSessionMode(mode as 'ar' | 'vr')}
              onSessionEnd={() => setSessionMode(null)}
            />
          </TkxScene>

          {/* Capability badges + entry buttons */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(10, 11, 21, 0.78)',
                backdropFilter: 'blur(10px)',
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 13,
                color: '#cbd5e1',
                maxWidth: 320,
              }}
            >
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Device support
              </div>
              <Capability label="AR pass-through" ok={xr.ar} checking={xr.checking} />
              <Capability label="Immersive VR" ok={xr.vr} checking={xr.checking} />
              {sessionMode && (
                <div style={{ marginTop: 8, color: '#00f5d4', fontWeight: 700 }}>
                  ● in {sessionMode.toUpperCase()} session
                </div>
              )}
            </div>
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(10, 11, 21, 0.78)',
                backdropFilter: 'blur(10px)',
                padding: 12,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 160,
              }}
            >
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Enter
              </div>
              <EnterButton mode="ar" enabled={xr.ar} active={sessionMode === 'ar'} />
              <EnterButton mode="vr" enabled={xr.vr} active={sessionMode === 'vr'} />
            </div>
          </div>

          {/* Bottom hint */}
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
              whiteSpace: 'nowrap',
              maxWidth: 'calc(100% - 32px)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            🖱️ drag to orbit · 🥽 enter VR/AR if your headset supports it
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          <FactCard
            title="Quest 3 / Quest Pro"
            body="Click 'Enter VR' for immersive mode, or 'Enter AR' for color pass-through. The scene renders into your headset; drag to orbit before entering."
          />
          <FactCard
            title="Vision Pro / Vision"
            body="Tap 'Enter AR'. Vision Pro reports as immersive-ar with full WebXR support. Hand tracking maps to standard pointer events."
          />
          <FactCard
            title="Android (Chrome + ARCore)"
            body="Tap 'Enter AR' on a recent Android. The phone lifts the WebXR session and the card anchors to a real-world surface."
          />
          <FactCard
            title="iPhone / iPad / Desktop"
            body="WebXR isn't available, but the scene still renders fully — drag to orbit, click the card. Identical geometry, no headset required."
          />
        </div>

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
          >{`import { TkxScene, TkxXRSession, TkxCard3D, TkxLogo3D, TkxParticleField, TkxOrbitControls } from 'tekivex-3d';

<TkxScene fov={60} cameraPosition={[0, 1.6, 4]} background="transparent">
  <TkxParticleField count={2000} volume={[20, 15, 20]} />
  <TkxLogo3D position={[0, 2.4, -2]} scale={1.6} text="TekiVex" />
  <TkxCard3D
    position={[0, 1.2, -1.5]}
    size={[2.4, 1.4]}
    color="#00f5d4"
    title="Hello, spatial web"
    subtitle="Enter AR or VR to place this card in your room"
  />
  <TkxOrbitControls preset="orbit" autoRotate />
  <TkxXRSession
    ar vr
    onSessionStart={(mode) => console.log('entered', mode)}
  />
</TkxScene>`}</pre>
        </details>
      </div>
      <div style={{ height: 48 }} />
    </ExampleShell>
  );
}

function Capability({ label, ok, checking }: { label: string; ok: boolean; checking: boolean }) {
  const dot = checking ? '#94a3b8' : ok ? '#22c55e' : '#ef4444';
  const text = checking ? 'checking…' : ok ? 'available' : 'not available';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 2 }}>
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dot,
          boxShadow: `0 0 8px ${dot}`,
        }}
      />
      <span>{label}</span>
      <span style={{ color: '#94a3b8' }}>· {text}</span>
    </div>
  );
}

function EnterButton({ mode, enabled, active }: { mode: 'ar' | 'vr'; enabled: boolean; active: boolean }) {
  // The actual `requestSession` is wired by TkxXRSession — its UI button is
  // injected by the package. We expose a styled visual label here for parity.
  const label = mode === 'ar' ? '👓 Enter AR' : '🥽 Enter VR';
  return (
    <div
      data-tkx-xr-button={mode}
      aria-disabled={!enabled}
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        background: active
          ? 'linear-gradient(135deg, #00f5d4, #3a86ff)'
          : enabled
            ? 'linear-gradient(135deg, rgba(0,245,212,0.2), rgba(58,134,255,0.2))'
            : 'rgba(255,255,255,0.04)',
        border: enabled ? '1px solid rgba(0, 245, 212, 0.4)' : '1px solid rgba(255,255,255,0.08)',
        color: active ? '#0a0b15' : enabled ? '#00f5d4' : '#475569',
        fontWeight: 700,
        fontSize: 13,
        textAlign: 'center',
        cursor: enabled ? 'pointer' : 'not-allowed',
        userSelect: 'none',
      }}
    >
      {label}
    </div>
  );
}

function FactCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 12,
        background: 'rgba(18, 20, 38, 0.55)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}
