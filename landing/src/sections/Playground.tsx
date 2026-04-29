import { useState } from 'react';
import { TkxHolographicCard, TkxHolographicBadge, TkxHolographicButton } from 'tekivex-ui';

// ── Component menu ──────────────────────────────────────────────────────────

type Demo = 'holo-card' | 'holo-badge' | 'holo-button';

const DEMOS: { id: Demo; label: string; emoji: string }[] = [
  { id: 'holo-card', label: 'TkxHolographicCard', emoji: '🪪' },
  { id: 'holo-badge', label: 'TkxHolographicBadge', emoji: '🏷️' },
  { id: 'holo-button', label: 'TkxHolographicButton', emoji: '🔘' },
];

// ── Generic prop-controls ──────────────────────────────────────────────────

interface NumberControl {
  type: 'number';
  min: number;
  max: number;
  step: number;
}
interface BooleanControl { type: 'boolean'; }
interface SelectControl { type: 'select'; options: string[]; }
type Control = NumberControl | BooleanControl | SelectControl;

function PropControl({
  label,
  ctrl,
  value,
  onChange,
}: {
  label: string;
  ctrl: Control;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#888',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  };

  if (ctrl.type === 'number') {
    return (
      <div>
        <label style={labelStyle}>
          {label} <span style={{ color: '#00f5d4', fontFamily: 'monospace' }}>{value as number}</span>
        </label>
        <input
          type="range"
          min={ctrl.min}
          max={ctrl.max}
          step={ctrl.step}
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#00f5d4' }}
        />
      </div>
    );
  }
  if (ctrl.type === 'boolean') {
    return (
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          style={{ accentColor: '#00f5d4', width: 18, height: 18 }}
        />
        <span style={{ fontSize: 14, color: '#ddd' }}>{label}</span>
      </label>
    );
  }
  // select
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 14,
        }}
      >
        {ctrl.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Code panel ─────────────────────────────────────────────────────────────

function CodePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{
        background: '#06060a',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '16px 18px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 13,
        color: '#e8e8f4',
        overflowX: 'auto',
        position: 'relative',
        whiteSpace: 'pre',
        lineHeight: 1.6,
      }}
    >
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '4px 10px',
          background: copied ? '#00f5d4' : 'rgba(255,255,255,0.08)',
          color: copied ? '#0a0a0f' : '#aaa',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <code>{code}</code>
    </div>
  );
}

// ── Per-demo state shapes + renderers ──────────────────────────────────────

function HoloCardDemo() {
  const [maxTilt, setMaxTilt] = useState(14);
  const [scanLines, setScanLines] = useState(true);
  const [foil, setFoil] = useState<'strong' | 'soft' | 'none'>('strong');
  const [radius, setRadius] = useState(16);

  const code = `import { TkxHolographicCard, TkxHolographicBadge } from 'tekivex-ui';

<TkxHolographicCard
  title="Premium tier"
  subtitle="Unlocked features · Priority support"
  badge={<TkxHolographicBadge size="sm">NEW</TkxHolographicBadge>}
  maxTilt={${maxTilt}}
  scanLines={${scanLines}}
  foilIntensity="${foil}"
  radius={${radius}}
>
  Hover this card to see the iridescent foil follow your cursor.
</TkxHolographicCard>`;

  return (
    <PlaygroundShell
      controls={
        <>
          <PropControl
            label="maxTilt (deg)"
            ctrl={{ type: 'number', min: 0, max: 30, step: 1 }}
            value={maxTilt}
            onChange={(v) => setMaxTilt(v as number)}
          />
          <PropControl
            label="radius (px)"
            ctrl={{ type: 'number', min: 0, max: 48, step: 1 }}
            value={radius}
            onChange={(v) => setRadius(v as number)}
          />
          <PropControl
            label="foilIntensity"
            ctrl={{ type: 'select', options: ['strong', 'soft', 'none'] }}
            value={foil}
            onChange={(v) => setFoil(v as 'strong' | 'soft' | 'none')}
          />
          <PropControl
            label="scanLines"
            ctrl={{ type: 'boolean' }}
            value={scanLines}
            onChange={(v) => setScanLines(v as boolean)}
          />
        </>
      }
      preview={
        <TkxHolographicCard
          title="Premium tier"
          subtitle="Unlocked features · Priority support"
          badge={<TkxHolographicBadge size="sm">NEW</TkxHolographicBadge>}
          maxTilt={maxTilt}
          scanLines={scanLines}
          foilIntensity={foil}
          radius={radius}
          style={{ minWidth: 280, maxWidth: 360 }}
        >
          <p style={{ color: '#bbb', fontSize: 14, margin: 0 }}>
            Hover this card to see the iridescent foil follow your cursor.
          </p>
        </TkxHolographicCard>
      }
      code={code}
      apiRows={[
        ['title', 'ReactNode', '— · slot for the heading'],
        ['subtitle', 'ReactNode', '— · second-line description'],
        ['badge', 'ReactNode', '— · top-right slot (e.g. NEW pill)'],
        ['maxTilt', 'number', '14 · max tilt in degrees'],
        ['scanLines', 'boolean', 'true · show scan-line overlay'],
        ['foilIntensity', "'strong' | 'soft' | 'none'", "'strong'"],
        ['radius', 'number | string', '16 · border-radius'],
        ['padding', 'number | string', '24'],
      ]}
    />
  );
}

function HoloBadgeDemo() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [text, setText] = useState('HOLO');

  const code = `import { TkxHolographicBadge } from 'tekivex-ui';

<TkxHolographicBadge size="${size}">${text}</TkxHolographicBadge>`;

  return (
    <PlaygroundShell
      controls={
        <>
          <PropControl
            label="size"
            ctrl={{ type: 'select', options: ['sm', 'md', 'lg'] }}
            value={size}
            onChange={(v) => setSize(v as 'sm' | 'md' | 'lg')}
          />
          <div>
            <label
              style={{
                fontSize: 12,
                color: '#888',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}
            >
              text
            </label>
            <input
              type="text"
              value={text}
              maxLength={16}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'monospace',
              }}
            />
          </div>
        </>
      }
      preview={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <TkxHolographicBadge size={size}>{text || '—'}</TkxHolographicBadge>
        </div>
      }
      code={code}
      apiRows={[
        ['size', "'sm' | 'md' | 'lg'", "'md'"],
        ['scanLines', 'boolean', 'false (off by default for badges)'],
        ['foilIntensity', "'strong' | 'soft' | 'none'", "'strong'"],
      ]}
    />
  );
}

function HoloButtonDemo() {
  const [maxTilt, setMaxTilt] = useState(8);
  const [isDisabled, setIsDisabled] = useState(false);
  const [clicks, setClicks] = useState(0);

  const code = `import { TkxHolographicButton } from 'tekivex-ui';

<TkxHolographicButton
  maxTilt={${maxTilt}}
  isDisabled={${isDisabled}}
  onClick={() => console.log('clicked!')}
>
  Subscribe →
</TkxHolographicButton>`;

  return (
    <PlaygroundShell
      controls={
        <>
          <PropControl
            label="maxTilt (deg)"
            ctrl={{ type: 'number', min: 0, max: 20, step: 1 }}
            value={maxTilt}
            onChange={(v) => setMaxTilt(v as number)}
          />
          <PropControl
            label="isDisabled"
            ctrl={{ type: 'boolean' }}
            value={isDisabled}
            onChange={(v) => setIsDisabled(v as boolean)}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            Clicks: <span style={{ color: '#00f5d4', fontWeight: 700 }}>{clicks}</span>
          </div>
        </>
      }
      preview={
        <TkxHolographicButton
          maxTilt={maxTilt}
          isDisabled={isDisabled}
          onClick={() => setClicks((c) => c + 1)}
        >
          Subscribe →
        </TkxHolographicButton>
      }
      code={code}
      apiRows={[
        ['maxTilt', 'number', '8'],
        ['isDisabled', 'boolean', 'false'],
        ['onClick', '(e) => void', '— · button click handler'],
        ['type', "'button' | 'submit' | 'reset'", "'button'"],
      ]}
    />
  );
}

// ── Shared shell ───────────────────────────────────────────────────────────

function PlaygroundShell({
  controls,
  preview,
  code,
  apiRows,
}: {
  controls: React.ReactNode;
  preview: React.ReactNode;
  code: string;
  apiRows: [string, string, string][];
}) {
  return (
    <div className="play-shell">
      <div className="play-controls tk-glass">
        <div
          style={{
            fontSize: 11,
            color: '#888',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Controls
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{controls}</div>
      </div>

      <div
        className="play-preview tk-glass"
        style={{
          padding: 32,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
        }}
      >
        {preview}
      </div>

      <div className="play-code">
        <CodePanel code={code} />
      </div>

      <div className="play-api tk-glass">
        <div
          style={{
            fontSize: 11,
            color: '#888',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Props
        </div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px', color: '#888', fontWeight: 600 }}>
                name
              </th>
              <th style={{ textAlign: 'left', padding: '6px 4px', color: '#888', fontWeight: 600 }}>
                type / default
              </th>
            </tr>
          </thead>
          <tbody>
            {apiRows.map(([name, type, desc]) => (
              <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td
                  style={{
                    padding: '8px 4px',
                    fontFamily: 'monospace',
                    color: '#00f5d4',
                    verticalAlign: 'top',
                  }}
                >
                  {name}
                </td>
                <td style={{ padding: '8px 4px', color: '#bbb' }}>
                  <code style={{ color: '#7b2ff7', fontSize: 12 }}>{type}</code>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{desc}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .play-shell {
          display: grid;
          grid-template-columns: 280px 1fr;
          grid-template-rows: minmax(320px, auto) auto;
          grid-template-areas:
            "controls preview"
            "code     api";
          gap: 16px;
        }
        .play-controls { grid-area: controls; padding: 24px; border-radius: 16px; }
        .play-preview  { grid-area: preview; }
        .play-code     { grid-area: code; }
        .play-api      { grid-area: api; padding: 16px; border-radius: 16px; }
        @media (max-width: 920px) {
          .play-shell {
            grid-template-columns: 1fr;
            grid-template-areas:
              "preview"
              "controls"
              "code"
              "api";
          }
        }
      `}</style>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────

export function Playground() {
  const [active, setActive] = useState<Demo>('holo-card');

  return (
    <section
      id="playground"
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
          Live <span className="tk-gradient-text">playground</span>
        </h2>
        <p style={{ color: '#888', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
          Tweak the props on the new v3.1 holographic components. The code below updates in real
          time — copy it into your project.
        </p>
      </header>

      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 32,
          padding: 6,
          background: 'rgba(18,18,26,0.65)',
          backdropFilter: 'blur(12px)',
          borderRadius: 999,
          width: 'fit-content',
          margin: '0 auto 32px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={active === d.id}
            onClick={() => setActive(d.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 999,
              background:
                active === d.id ? 'linear-gradient(135deg, #00f5d4, #3a86ff)' : 'transparent',
              color: active === d.id ? '#0a0a0f' : '#aaa',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s',
              minHeight: 36,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span aria-hidden="true">{d.emoji}</span>
            <span>{d.label}</span>
          </button>
        ))}
      </div>

      {active === 'holo-card' && <HoloCardDemo />}
      {active === 'holo-badge' && <HoloBadgeDemo />}
      {active === 'holo-button' && <HoloButtonDemo />}
    </section>
  );
}
