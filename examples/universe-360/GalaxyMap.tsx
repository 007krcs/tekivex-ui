// ─────────────────────────────────────────────────────────────────────────────
// 360° Universe — Galaxy Map
//
// A worked example combining every piece of tekivex-3d's "in-space" toolkit:
//
//   TkxScene          — root WebGL canvas
//   TkxStarfield      — procedural star sphere around the camera
//   TkxParticleField  — drifting cosmic dust
//   TkxPlanet         — six destinations (some with rings, all with glow)
//   TkxOrbitPath      — animated orbital paths around two of the planets
//   TkxHotspot        — clickable label per planet, opens an info panel
//   TkxOrbitControls  — "showcase" preset (slow auto-orbit + drag to look)
//   TkxXRSession      — VR / AR entry button
//
// Combined with a holographic info panel (TkxHolographicPanel) that opens
// on the right whenever the visitor clicks a planet hotspot. The same
// keyboard model works: ESC closes the panel.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  TkxScene,
  TkxStarfield,
  TkxParticleField,
  TkxPlanet,
  TkxOrbitPath,
  TkxHotspot,
  TkxOrbitControls,
  TkxXRSession,
} from 'tekivex-3d';
import {
  TkxHolographicPanel,
  TkxHolographicBadge,
  TkxHolographicProgress,
  TkxHolographicGauge,
  TkxHolographicButton,
} from 'tekivex-ui';

// ── Destination catalog ────────────────────────────────────────────────────

interface Destination {
  id: string;
  name: string;
  classification: string;
  /** 3D position relative to the camera. */
  position: [number, number, number];
  radius: number;
  /** Surface tint applied on top of the procedural texture. */
  tint: string;
  /** Atmospheric glow color. */
  glow: string;
  /** Saturn-style ring? */
  ring?: boolean;
  /** Companion bodies orbiting this planet. */
  satellites?: { color: string; radius: number; speed: number; size: number; phase?: number }[];

  // Holographic info-panel content
  description: string;
  /** 0..100 — visualised as a TkxHolographicGauge in the panel. */
  habitability: number;
  /** 0..1 — visualised as TkxHolographicProgress bars in the panel. */
  metrics: { label: string; value: number; accent?: string }[];
  tags: string[];
}

const DESTINATIONS: Destination[] = [
  {
    id: 'kepler-22b',
    name: 'Kepler-22b',
    classification: 'Super-Earth · habitable zone',
    position: [-9, 1.5, -14],
    radius: 1.4,
    tint: '#7ec8e3',
    glow: '#3a86ff',
    description:
      'A super-Earth orbiting in the habitable zone of its sun-like host. Surface largely unexplored; signal-return is consistent with a deep ocean covering most of the visible hemisphere.',
    habitability: 78,
    metrics: [
      { label: 'Atmospheric pressure', value: 0.82 },
      { label: 'Magnetic shielding', value: 0.61, accent: '#7b2ff7' },
      { label: 'Hydrosphere coverage', value: 0.95 },
    ],
    tags: ['water world', 'temperate', 'main mission'],
  },
  {
    id: 'cygnus-prime',
    name: 'Cygnus Prime',
    classification: 'Gas giant · ringed',
    position: [12, -1, -16],
    radius: 1.9,
    tint: '#ffd29c',
    glow: '#ffbe0b',
    ring: true,
    satellites: [
      { color: '#3a86ff', radius: 3.2, speed: 0.5, size: 0.2 },
      { color: '#ff006e', radius: 4.6, speed: 0.32, size: 0.16, phase: 1.4 },
    ],
    description:
      'Methane-banded gas giant with a complex ring system harvesting ice particles from its inner shepherd moons. Three confirmed moons, two in orbital resonance.',
    habitability: 12,
    metrics: [
      { label: 'Wind shear (relative)', value: 0.95, accent: '#ff006e' },
      { label: 'Ring stability',       value: 0.82 },
      { label: 'Moon resonance',       value: 0.66, accent: '#7b2ff7' },
    ],
    tags: ['gas giant', 'ringed', 'observation only'],
  },
  {
    id: 'tau-ceti-e',
    name: 'Tau Ceti e',
    classification: 'Iron-rich rocky world',
    position: [3, 4, -22],
    radius: 1.0,
    tint: '#d97757',
    glow: '#ff006e',
    description:
      'Compact iron-rich body with extensive volcanic plains. Day-side temperatures approach the upper bound for organic chemistry; survey teams operate from terminator outposts.',
    habitability: 28,
    metrics: [
      { label: 'Day-side temperature', value: 0.92, accent: '#ff006e' },
      { label: 'Mineral density',      value: 0.88 },
      { label: 'Crustal age',          value: 0.34 },
    ],
    tags: ['rocky', 'volcanic', 'mining-suitable'],
  },
  {
    id: 'proxima-station',
    name: 'Proxima Station',
    classification: 'Orbital relay · staffed',
    position: [-4, -3, -10],
    radius: 0.7,
    tint: '#a8edff',
    glow: '#00f5d4',
    description:
      'Crewed deep-space comms relay. Forty-eight permanent staff. Last resupply T-12 days; consumables nominal, life-support redundancy at full capacity.',
    habitability: 95,
    metrics: [
      { label: 'Comms throughput',  value: 0.91 },
      { label: 'Crew capacity',     value: 0.50 },
      { label: 'Supply runway (d)', value: 0.72, accent: '#00f5d4' },
    ],
    tags: ['relay', 'crewed', 'core network'],
  },
  {
    id: 'wolf-1061-c',
    name: 'Wolf 1061 c',
    classification: 'Tidally-locked dwarf',
    position: [9, 3, -10],
    radius: 0.85,
    tint: '#9bc7ff',
    glow: '#7b2ff7',
    satellites: [{ color: '#c4a8ff', radius: 2.1, speed: 0.7, size: 0.13 }],
    description:
      'One face permanently solar, the other permanently shadowed. Survey teams have flagged the terminator ring as the most viable surface for long-duration habitats.',
    habitability: 41,
    metrics: [
      { label: 'Terminator zone width', value: 0.42, accent: '#7b2ff7' },
      { label: 'Solar flux (sub-stellar point)', value: 0.96, accent: '#ff006e' },
      { label: 'Magnetic dipole', value: 0.55 },
    ],
    tags: ['tidally-locked', 'survey', 'long-shot'],
  },
  {
    id: 'gliese-581-g',
    name: 'Gliese 581 g',
    classification: 'Frozen ocean',
    position: [-10, -2, -22],
    radius: 1.2,
    tint: '#cfeaff',
    glow: '#00f5d4',
    description:
      'Surface ice crust kilometres thick, with strong evidence of a liquid sub-surface ocean and convective plumes near the poles. Candidate for next-generation drill missions.',
    habitability: 62,
    metrics: [
      { label: 'Ice thickness',     value: 0.78 },
      { label: 'Sub-surface ocean', value: 0.85, accent: '#3a86ff' },
      { label: 'Plume frequency',   value: 0.41 },
    ],
    tags: ['icy', 'ocean below', 'priority drill'],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export function GalaxyMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = DESTINATIONS.find((d) => d.id === selectedId) ?? null;

  // ESC closes the info panel
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <div
      style={{
        position: 'relative',
        height: 'min(720px, 80vh)',
        borderRadius: 18,
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse at 50% 35%, rgba(123,142,255,0.15), transparent 65%), #060615',
        border: '1px solid rgba(123,142,255,0.25)',
      }}
    >
      {/* ── 3D scene fills the container ── */}
      <TkxScene
        fov={62}
        cameraPosition={[0, 0, 0.01]}
        background="transparent"
      >
        <TkxStarfield count={4000} radius={140} spinSpeed={0.003} />
        <TkxParticleField count={1500} volume={[60, 30, 60]} driftSpeed={0.2} size={0.045} />

        {/* Planets, hotspots, satellites */}
        {DESTINATIONS.map((d) => (
          <TkxPlanet
            key={`planet-${d.id}`}
            position={d.position}
            radius={d.radius}
            tint={d.tint}
            glow
            glowColor={d.glow}
            ring={d.ring}
            spinSpeed={0.05 + (d.radius * 0.04)}
          />
        ))}
        {DESTINATIONS.flatMap((d) =>
          (d.satellites ?? []).map((s, i) => (
            <TkxOrbitPath
              key={`orbit-${d.id}-${i}`}
              center={d.position}
              radius={s.radius}
              ringColor={s.color}
              ringOpacity={0.35}
              bodyColor={s.color}
              bodySize={s.size}
              speed={s.speed}
              phase={s.phase}
              inclination={0.15 + i * 0.2}
            />
          )),
        )}
        {DESTINATIONS.map((d) => (
          <TkxHotspot
            key={`hot-${d.id}`}
            position={[
              d.position[0],
              d.position[1] + d.radius + 0.6,
              d.position[2],
            ]}
            label={d.name}
            color={d.glow}
            size={0.5}
            pulseSpeed={1.6}
            onClick={() => setSelectedId(d.id)}
          />
        ))}

        <TkxOrbitControls preset="showcase" autoRotate autoRotateSpeed={0.4} enableZoom={false} />
        <TkxXRSession />
      </TkxScene>

      {/* ── Drag-to-look hint (top-left) ── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          padding: '8px 14px',
          borderRadius: 999,
          background: 'rgba(8,10,25,0.7)',
          border: '1px solid rgba(123,142,255,0.3)',
          color: '#c4a8ff',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      >
        🖱️ drag to look · 📱 tilt phone · click any hotspot
      </div>

      {/* ── Holographic info panel (right side, slides in on selection) ── */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            bottom: 16,
            width: 'min(380px, calc(100% - 32px))',
            zIndex: 5,
          }}
        >
          <TkxHolographicPanel
            accent={selected.glow}
            style={{ height: '100%' }}
            header={
              <>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                    {selected.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                    {selected.classification}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close info panel"
                  onClick={() => setSelectedId(null)}
                  style={{
                    width: 32, height: 32, borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent', color: '#c4a8ff',
                    cursor: 'pointer', fontSize: 16, lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </>
            }
            footer={
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <TkxHolographicButton onClick={() => setSelectedId(null)}>Close</TkxHolographicButton>
                <TkxHolographicButton>Plot course →</TkxHolographicButton>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <TkxHolographicGauge
                  value={selected.habitability}
                  size={96}
                  accent={selected.glow}
                  caption="habitability"
                />
                <p style={{ margin: 0, fontSize: 13, color: '#dcdce8', lineHeight: 1.55 }}>
                  {selected.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selected.metrics.map((m, i) => (
                  <TkxHolographicProgress
                    key={i}
                    label={m.label}
                    value={m.value}
                    accent={m.accent ?? selected.glow}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selected.tags.map((t) => (
                  <TkxHolographicBadge key={t} size="sm" tone="neutral">
                    {t}
                  </TkxHolographicBadge>
                ))}
              </div>
            </div>
          </TkxHolographicPanel>
        </div>
      )}
    </div>
  );
}
