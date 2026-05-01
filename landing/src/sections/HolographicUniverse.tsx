// ─────────────────────────────────────────────────────────────────────────────
// HolographicUniverse — landing section
//
// Wraps the worked Mission Control example from
// examples/holographic-universe/MissionControl.tsx with a section header
// and a side-by-side code snippet showing what's running.
// ─────────────────────────────────────────────────────────────────────────────

import { MissionControl } from '../../../examples/holographic-universe/MissionControl';

const SNIPPET = `import {
  TkxHolographicPanel,
  TkxHolographicGauge,
  TkxHolographicProgress,
  TkxHolographicTerminal,
  TkxHolographicCard,
  TkxHolographicAvatar,
  TkxHolographicBadge,
  TkxHolographicButton,
} from 'tekivex-ui';

<TkxHolographicPanel
  header={<><h3>Reactor core</h3><TkxHolographicBadge tone="success">stable</TkxHolographicBadge></>}
  footer={<TkxHolographicButton>SCRAM</TkxHolographicButton>}
>
  <TkxHolographicGauge value={fuel} caption="fuel" />
  <TkxHolographicProgress label="Coolant pressure" value={oxygen / 100} />
  <TkxHolographicProgress label="Shield integrity" value={shield} accent="#7b2ff7" />
</TkxHolographicPanel>

<TkxHolographicTerminal lines={log} typeSpeed={8} />`;

export function HolographicUniverse() {
  return (
    <section
      id="holographic-universe"
      style={{
        position: 'relative',
        padding: 'clamp(64px, 9vw, 120px) 24px',
        maxWidth: 1280,
        margin: '0 auto',
        zIndex: 1,
      }}
    >
      <SectionHeader
        eyebrow="Worked example"
        title={<><span className="tk-gradient-text">Holographic</span> Universe</>}
        subtitle={
          <>
            A complete mission-control HUD assembled from nine holographic
            primitives — gauges, progress bars, panels, terminals, cards,
            avatars, badges, and buttons. Live telemetry, live event log,
            real keyboard interactions. Drop the file in, get the deck.
          </>
        }
      />

      {/* Live demo */}
      <MissionControl />

      {/* Implementation snippet */}
      <details style={{ marginTop: 24 }}>
        <summary
          style={{
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(18, 20, 38, 0.55)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#c4a8ff',
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
            border: '1px solid rgba(123,142,255,0.18)',
            borderRadius: 10,
            color: '#dcdce8',
            fontSize: 13,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            lineHeight: 1.55,
            overflow: 'auto',
          }}
        >
          <code>{SNIPPET}</code>
        </pre>
      </details>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
}) {
  return (
    <header style={{ textAlign: 'center', marginBottom: 40 }}>
      <div
        style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: 999,
          background: 'rgba(196,168,255,0.1)',
          border: '1px solid rgba(196,168,255,0.3)',
          color: '#c4a8ff',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 18,
        }}
      >
        {eyebrow}
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
        {title}
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
        {subtitle}
      </p>
    </header>
  );
}
