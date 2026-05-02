// ─────────────────────────────────────────────────────────────────────────────
// /examples/holographic — gallery of every holographic surface in tekivex-ui.
//
// Demonstrates: TkxHolographicSurface, TkxHolographicCard, TkxHolographicBadge,
// TkxHolographicButton, TkxHolographicAvatar, TkxHolographicPanel,
// TkxHolographicGauge, TkxHolographicProgress, TkxHolographicTerminal.
//
// The gallery uses a deep-violet "stage" backdrop so the prismatic effects
// have something to glow against, but the surrounding shell stays light.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  TkxHolographicSurface,
  TkxHolographicCard,
  TkxHolographicBadge,
  TkxHolographicButton,
  TkxHolographicAvatar,
  TkxHolographicPanel,
  TkxHolographicGauge,
  TkxHolographicProgress,
  TkxHolographicTerminal,
} from 'tekivex-ui';
import { ExampleShell } from './ExampleShell';
import { usePageMeta } from '../../use-page-meta';

const TONES = ['success', 'info', 'warning', 'danger', 'neutral'] as const;

export function ExampleHolographic() {
  usePageMeta(
    'Holographic UI example — TekiVex UI',
    'A working gallery of every holographic surface in tekivex-ui: cards, badges, avatars, gauges, terminals, and progress with live prismatic effects.',
    { keywords: 'tekivex, tekivex-ui, holographic ui, react components, glowing ui, prismatic, sci-fi ui' },
  );

  const [progress, setProgress] = useState(62);

  return (
    <ExampleShell
      title="Holographic UI gallery"
      eyebrow="Examples · Holographic"
      description="Every holographic surface shipped in tekivex-ui, side-by-side with the props that control them. The deep-violet stage isolates the prismatic glow; the rest of the page stays in the clean light theme."
      sourceUrl="https://github.com/007krcs/tekivex-ui/blob/master/landing/src/pages/examples/ExampleHolographic.tsx"
      surface="light"
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 64px' }}>
        {/* Stage — local dark island just for the holographic showcase */}
        <Stage title="Cards & surfaces">
          <Grid min={300}>
            <TkxHolographicCard
              title="Quarterly metrics"
              subtitle="Q3 2026"
              tone="success"
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>$1.42M</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>+18.4% vs last quarter</div>
            </TkxHolographicCard>
            <TkxHolographicCard title="Active sessions" subtitle="Live" tone="info">
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>2,418</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>across 38 regions</div>
            </TkxHolographicCard>
            <TkxHolographicCard title="Capacity warning" subtitle="us-east-1" tone="warning">
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>87%</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>scaling up next replica</div>
            </TkxHolographicCard>
          </Grid>
          <Spacer />
          <TkxHolographicSurface tone="info" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 6px', color: '#fff', fontSize: 18 }}>Holographic surface</h3>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
              The base component. Wraps any content in a glowing prismatic container with a
              configurable tone. Cards, panels, terminals all extend it.
            </p>
          </TkxHolographicSurface>
        </Stage>

        <Stage title="Badges">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {TONES.map((t) => (
              <TkxHolographicBadge key={t} size="md" tone={t}>
                {t}
              </TkxHolographicBadge>
            ))}
          </div>
          <Spacer height={12} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <TkxHolographicBadge size="sm" tone="success">v3.15 GA</TkxHolographicBadge>
            <TkxHolographicBadge size="md" tone="info">113 components</TkxHolographicBadge>
            <TkxHolographicBadge size="lg" tone="warning">beta route</TkxHolographicBadge>
          </div>
        </Stage>

        <Stage title="Buttons">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {TONES.map((t) => (
              <TkxHolographicButton key={t} tone={t} onClick={() => setProgress((p) => Math.min(100, p + 5))}>
                {t} +5
              </TkxHolographicButton>
            ))}
          </div>
        </Stage>

        <Stage title="Avatars">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
            {[
              { name: 'Aarav', tone: 'success' as const, status: 'online' },
              { name: 'Mei',   tone: 'info' as const,    status: 'busy'   },
              { name: 'Kabir', tone: 'warning' as const, status: 'away'   },
              { name: 'Jin',   tone: 'danger' as const,  status: 'offline' },
            ].map((p) => (
              <div key={p.name} style={{ textAlign: 'center', color: '#cbd5e1' }}>
                <TkxHolographicAvatar
                  name={p.name}
                  size={80}
                  tone={p.tone}
                  status={p.status}
                />
                <div style={{ fontSize: 12, marginTop: 6 }}>{p.name}</div>
              </div>
            ))}
          </div>
        </Stage>

        <Stage title="Panels & gauges">
          <Grid min={280}>
            <TkxHolographicPanel
              title="System diagnostics"
              tone="info"
              footer={<span style={{ color: '#cbd5e1', fontSize: 12 }}>uptime 99.982%</span>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Row label="CPU"      value="34%" />
                <Row label="Memory"   value="61%" />
                <Row label="Network"  value="118 Mb/s" />
                <Row label="Errors"   value="0" />
              </div>
            </TkxHolographicPanel>
            <TkxHolographicPanel title="Live capacity" tone="warning">
              <TkxHolographicGauge value={progress} max={100} tone="warning" size={180} />
            </TkxHolographicPanel>
            <TkxHolographicPanel title="Build pipeline" tone="success">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <Step label="Lint" value={100} />
                <Step label="Test" value={100} />
                <Step label="Build" value={progress} />
                <Step label="Deploy" value={Math.max(0, progress - 20)} />
              </div>
            </TkxHolographicPanel>
          </Grid>
        </Stage>

        <Stage title="Terminal">
          <TkxHolographicTerminal
            tone="success"
            lines={[
              { type: 'cmd',    text: 'npm install tekivex-ui tekivex-3d' },
              { type: 'output', text: 'added 113 packages, audited 113 packages in 4.2s' },
              { type: 'output', text: 'found 0 vulnerabilities' },
              { type: 'cmd',    text: 'npm run dev' },
              { type: 'output', text: '> vite dev' },
              { type: 'output', text: '  ➜  Local:   http://localhost:5173/' },
              { type: 'output', text: '  ➜  Network: http://10.0.1.42:5173/' },
              { type: 'cmd',    text: 'tkx ship' },
              { type: 'success',text: '✓ deployed to https://your-app.tekivex.dev' },
            ]}
          />
        </Stage>

        <Stage title="Progress">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TkxHolographicProgress value={progress} max={100} tone="info" label="Sync" />
            <TkxHolographicProgress value={progress * 0.6} max={100} tone="success" label="Backup" />
            <TkxHolographicProgress value={progress * 0.3} max={100} tone="warning" label="Reindex" />
          </div>
          <Spacer height={12} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setProgress((p) => Math.max(0, p - 10))}
              style={btn}
            >
              − 10
            </button>
            <button
              type="button"
              onClick={() => setProgress((p) => Math.min(100, p + 10))}
              style={btn}
            >
              + 10
            </button>
            <span style={{ color: '#475569', fontSize: 13, alignSelf: 'center' }}>
              progress = {progress}
            </span>
          </div>
        </Stage>

        <details
          style={{
            marginTop: 24,
            background: '#f8fafc',
            border: '1px solid #e6e8ef',
            borderRadius: 12,
            padding: '12px 16px',
            color: '#1a1f2e',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Show the code</summary>
          <pre
            style={{
              margin: '12px 0 0',
              padding: 16,
              background: '#0f172a',
              borderRadius: 8,
              fontSize: 12.5,
              lineHeight: 1.6,
              fontFamily: 'ui-monospace, monospace',
              overflowX: 'auto',
              color: '#dcdce8',
            }}
          >{`import { TkxHolographicCard, TkxHolographicGauge, TkxHolographicTerminal } from 'tekivex-ui';

<TkxHolographicCard title="Live capacity" subtitle="us-east-1" tone="warning">
  <TkxHolographicGauge value={87} max={100} tone="warning" size={180} />
</TkxHolographicCard>

<TkxHolographicTerminal
  tone="success"
  lines={[
    { type: 'cmd',    text: 'npm install tekivex-ui' },
    { type: 'output', text: 'added 113 packages' },
    { type: 'success',text: '✓ ready' },
  ]}
/>`}</pre>
        </details>
      </div>
    </ExampleShell>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────

function Stage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        marginTop: 32,
        borderRadius: 20,
        padding: 'clamp(20px, 3vw, 32px)',
        background: 'radial-gradient(ellipse at top, #1a1633 0%, #0a0b1e 70%)',
        border: '1px solid rgba(196, 168, 255, 0.18)',
        boxShadow: '0 12px 40px rgba(124, 58, 237, 0.15)',
      }}
    >
      <h2
        style={{
          margin: '0 0 18px',
          fontSize: 18,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children, min = 280 }: { children: React.ReactNode; min?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function Spacer({ height = 16 }: { height?: number }) {
  return <div style={{ height }} />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color: '#fff', fontFamily: 'ui-monospace, monospace' }}>{value}</span>
    </div>
  );
}

function Step({ label, value }: { label: string; value: number }) {
  const done = value >= 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            height: '100%',
            background: done
              ? 'linear-gradient(90deg, #22c55e, #84cc16)'
              : 'linear-gradient(90deg, #00f5d4, #3a86ff)',
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: '8px 14px',
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};
