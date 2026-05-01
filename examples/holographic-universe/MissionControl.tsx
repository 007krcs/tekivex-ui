// ─────────────────────────────────────────────────────────────────────────────
// Holographic Universe — Mission Control deck
//
// A fully-worked example of every piece of the tekivex-ui holographic family
// composed into a single HUD:
//
//   TkxHolographicCard    — system telemetry panels + crew bios
//   TkxHolographicAvatar  — circular crew portraits
//   TkxHolographicBadge   — status + signal-quality pills
//   TkxHolographicButton  — command actions
//   TkxHolographicSurface — primitive used for the central mission clock
//
// What makes it feel alive:
//   - Telemetry numbers animate via a 1Hz interval (oxygen, fuel, signal)
//   - Status badges flip colour when crossings thresholds (green→amber→red)
//   - Command buttons trigger an event log on the bottom-right
//   - Mission clock counts up from 00:00:00 on mount
//
// All values are deterministic locally so the demo is reproducible — it
// reads fine when paused, no random jitter that hides bugs.
//
// Drop this in as a route or section; no global state required.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  TkxHolographicCard,
  TkxHolographicAvatar,
  TkxHolographicBadge,
  TkxHolographicButton,
  TkxHolographicSurface,
  TkxHolographicPanel,
  TkxHolographicGauge,
  TkxHolographicProgress,
  TkxHolographicTerminal,
} from 'tekivex-ui';
import { TkxScene, TkxStarfield, TkxAvatar3D, TkxOrbitControls } from 'tekivex-3d';

// ── 1. Crew roster ─────────────────────────────────────────────────────────
//
// In a real app this would come from your backend. We keep it as a constant
// so the demo is reproducible and you can see exactly what state drives the
// avatars + badges.

const CREW = [
  { id: 'c1', name: 'Capt. Aria Solis',   role: 'Commander',     avatar: 'https://i.pravatar.cc/200?img=47', status: 'on duty' as const },
  { id: 'c2', name: 'Lt. Kenji Park',     role: 'Pilot',         avatar: 'https://i.pravatar.cc/200?img=33', status: 'on duty' as const },
  { id: 'c3', name: 'Dr. Idris Okafor',   role: 'Chief medical', avatar: 'https://i.pravatar.cc/200?img=15', status: 'sleep cycle' as const },
];

// ── 2. Telemetry animation ────────────────────────────────────────────────
//
// One interval drives every telemetry panel so they stay in sync — easier
// to reason about than per-card timers, and it parks all the clock work in
// one place if you later want to pause the demo.

interface Telemetry {
  oxygen: number;   // %
  fuel: number;     // %
  signal: number;   // 0..100
  hullTemp: number; // °C
  elapsedMs: number;
}

function useTelemetry(): Telemetry {
  const [t, set] = useState<Telemetry>({
    oxygen: 96, fuel: 78, signal: 84, hullTemp: 22, elapsedMs: 0,
  });
  useEffect(() => {
    let stop = false;
    const start = performance.now();
    const tick = () => {
      if (stop) return;
      const elapsed = performance.now() - start;
      // Cheap deterministic-looking noise using elapsed time:
      const wob = (period: number, amp: number) =>
        Math.sin(elapsed / period) * amp;
      set({
        oxygen:   Math.max(80, Math.min(100, 95 + wob(7000, 3))),
        fuel:     Math.max(0,  78 - elapsed / 60000),       // burn rate ~1%/min
        signal:   Math.max(40, Math.min(100, 80 + wob(3000, 18))),
        hullTemp: 20 + wob(11000, 6),
        elapsedMs: elapsed,
      });
    };
    const id = window.setInterval(tick, 1000);
    return () => { stop = true; window.clearInterval(id); };
  }, []);
  return t;
}

// ── 3. Helpers ────────────────────────────────────────────────────────────

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function levelColor(v: number, warn: number, alert: number, kind: 'high' | 'low'): string {
  // 'high' means HIGH is good (oxygen, fuel); 'low' means LOW is good (temp).
  const bad = kind === 'high' ? v <= alert : v >= alert;
  const warnHit = kind === 'high' ? v <= warn : v >= warn;
  if (bad)     return '#ff006e';
  if (warnHit) return '#ffbe0b';
  return '#00f5d4';
}

// ── 4. Telemetry panel ────────────────────────────────────────────────────
//
// One TkxHolographicCard per metric. The big number is rendered with a
// monospaced font + tabular-nums so digits don't jiggle width on each tick.

function TelemetryCard({
  label, value, unit, accent, footnote,
}: {
  label: string;
  value: string;
  unit: string;
  accent: string;
  footnote: string;
}) {
  return (
    <TkxHolographicCard
      style={{
        padding: 16,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 800,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontVariantNumeric: 'tabular-nums',
          color: accent,
          lineHeight: 1,
          textShadow: `0 0 24px ${accent}66`,
        }}
      >
        {value}
        <span style={{ fontSize: 14, color: '#aaa', marginLeft: 4, fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>{footnote}</div>
    </TkxHolographicCard>
  );
}

// ── 5. Crew card ──────────────────────────────────────────────────────────

function CrewCard({ member }: { member: (typeof CREW)[number] }) {
  return (
    <TkxHolographicCard style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <TkxHolographicAvatar src={member.avatar} alt={member.name} size={56} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {member.name}
        </div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>{member.role}</div>
        <TkxHolographicBadge size="sm" tone={member.status === 'on duty' ? 'success' : 'neutral'}>
          {member.status === 'on duty' ? '● on duty' : '○ sleep cycle'}
        </TkxHolographicBadge>
      </div>
    </TkxHolographicCard>
  );
}

// ── 6. Mission Control deck ───────────────────────────────────────────────

export function MissionControl() {
  const t = useTelemetry();
  const [log, setLog] = useState<{ time: number; msg: string }[]>([
    { time: 0, msg: 'Mission clock started' },
  ]);

  const addLog = (msg: string) =>
    setLog((prev) => [{ time: t.elapsedMs, msg }, ...prev].slice(0, 5));

  return (
    <div
      style={{
        position: 'relative',
        padding: 'clamp(20px, 3vw, 32px)',
        background:
          'radial-gradient(ellipse at top, rgba(58,134,255,0.15), transparent 60%), radial-gradient(ellipse at bottom right, rgba(123,47,247,0.12), transparent 60%), #050510',
        borderRadius: 16,
        color: '#e8e8f4',
        fontFamily: 'inherit',
      }}
    >
      {/* ── Top: mission clock + status ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <TkxHolographicSurface
          style={{
            padding: '14px 24px',
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            T+
          </span>
          <span
            style={{
              fontSize: 'clamp(20px, 3vw, 28px)',
              fontWeight: 800,
              fontFamily: 'ui-monospace, monospace',
              fontVariantNumeric: 'tabular-nums',
              color: '#00f5d4',
              textShadow: '0 0 16px rgba(0,245,212,0.5)',
            }}
          >
            {formatClock(t.elapsedMs)}
          </span>
        </TkxHolographicSurface>

        <TkxHolographicBadge tone="success">● Nominal</TkxHolographicBadge>
        <TkxHolographicBadge tone="info">SOL-3 → MARS-1</TkxHolographicBadge>
        <TkxHolographicBadge tone="neutral">orbit-1 of 7</TkxHolographicBadge>

        {/* ── Captain feed (3D mini-scene) ── */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 14px 6px 6px',
            borderRadius: 999,
            background: 'rgba(8,10,25,0.7)',
            border: '1px solid rgba(196,168,255,0.28)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#060615',
              border: '1px solid rgba(0,245,212,0.4)',
              flex: '0 0 48px',
            }}
            aria-label="Captain Aria Solis live feed"
          >
            <TkxScene fov={32} cameraPosition={[0, 1.45, 1.6]} background="transparent">
              <TkxStarfield count={250} radius={20} />
              <TkxAvatar3D state={log.length > 1 ? 'talk' : 'idle'} accent="#00f5d4" scale={0.95} />
              <TkxOrbitControls preset="showcase" autoRotate autoRotateSpeed={0.3} enableZoom={false} enablePan={false} />
            </TkxScene>
          </div>
          <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', lineHeight: 1.3 }}>
            <div style={{ color: '#00f5d4', fontWeight: 700 }}>● LIVE</div>
            <div style={{ color: '#aaa' }}>Capt. Solis</div>
          </div>
        </div>
      </div>

      {/* ── Grid: telemetry (left+center) + crew (right) ── */}
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        }}
        className="tkx-mc-grid"
      >
        {/* Telemetry block */}
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <TelemetryCard
            label="Oxygen"
            value={t.oxygen.toFixed(1)}
            unit="%"
            accent={levelColor(t.oxygen, 90, 85, 'high')}
            footnote={`${(t.oxygen * 12).toFixed(0)} L recyclable`}
          />
          <TelemetryCard
            label="Fuel"
            value={t.fuel.toFixed(1)}
            unit="%"
            accent={levelColor(t.fuel, 30, 15, 'high')}
            footnote={`${(t.fuel * 1.4).toFixed(1)} t reserve`}
          />
          <TelemetryCard
            label="Signal"
            value={t.signal.toFixed(0)}
            unit="dB"
            accent={levelColor(t.signal, 60, 45, 'high')}
            footnote={`Deep-Space Network · 8.4 GHz`}
          />
          <TelemetryCard
            label="Hull temp"
            value={t.hullTemp.toFixed(1)}
            unit="°C"
            accent={levelColor(t.hullTemp, 28, 35, 'low')}
            footnote={`Shielding within tolerance`}
          />
        </div>

        {/* Crew block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CREW.map((c) => (
            <CrewCard key={c.id} member={c} />
          ))}
        </div>
      </div>

      {/* ── Reactor Core: Gauges + Progress (NEW components) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 16,
          marginTop: 24,
        }}
        className="tkx-mc-grid"
      >
        <TkxHolographicPanel
          accent="#00f5d4"
          header={
            <>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#e8e8f4' }}>
                Reactor core
              </div>
              <TkxHolographicBadge tone="success" size="sm">stable</TkxHolographicBadge>
            </>
          }
          footer={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <TkxHolographicButton onClick={() => addLog('Reactor SCRAM initiated')}>⛔ SCRAM</TkxHolographicButton>
              <TkxHolographicButton onClick={() => addLog('Coolant flow boosted')}>❄️ Boost coolant</TkxHolographicButton>
            </div>
          }
        >
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <TkxHolographicGauge
              value={Math.max(0, t.fuel)}
              size={120}
              accent={levelColor(t.fuel, 30, 15, 'high')}
              caption="fuel"
            />
            <TkxHolographicGauge
              value={Math.min(100, (t.signal + 30))}
              size={120}
              accent="#3a86ff"
              caption="output"
            />
            <TkxHolographicGauge
              value={Math.min(100, (t.hullTemp + 50) * 1.2)}
              size={120}
              accent={levelColor(t.hullTemp, 28, 35, 'low')}
              caption="thermal"
            />
          </div>
          <TkxHolographicProgress
            label="Coolant pressure"
            value={Math.max(0.1, Math.min(1, t.oxygen / 100))}
            valueLabel={`${(t.oxygen * 0.95).toFixed(1)} bar`}
          />
          <div style={{ height: 10 }} />
          <TkxHolographicProgress
            label="Shield integrity"
            value={Math.max(0.4, Math.min(1, (t.signal + 10) / 100))}
            accent="#7b2ff7"
          />
        </TkxHolographicPanel>

        <TkxHolographicPanel
          accent="#00f5d4"
          header={
            <>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#e8e8f4' }}>
                System log
              </div>
              <TkxHolographicBadge tone="info" size="sm">streaming</TkxHolographicBadge>
            </>
          }
        >
          <TkxHolographicTerminal
            lines={log.map((e) => `[${formatClock(e.time)}] ${e.msg}`)}
            height={232}
            typeSpeed={8}
          />
        </TkxHolographicPanel>
      </div>

      {/* ── Command bar ── */}
      <TkxHolographicCard style={{ padding: 16, marginTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
          Command
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <TkxHolographicButton onClick={() => addLog('Burn sequence armed')}>🔥 Arm burn</TkxHolographicButton>
          <TkxHolographicButton onClick={() => addLog('Manoeuvre committed')}>🚀 Manoeuvre</TkxHolographicButton>
          <TkxHolographicButton onClick={() => addLog('Comms boosted to 110%')}>📡 Boost comms</TkxHolographicButton>
          <TkxHolographicButton onClick={() => addLog('Hibernation cycle initiated')}>💤 Hibernate</TkxHolographicButton>
        </div>
      </TkxHolographicCard>

      <style>{`
        @media (max-width: 900px) {
          .tkx-mc-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
