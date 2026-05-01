// ─────────────────────────────────────────────────────────────────────────────
// Roadmap — what's next, with target releases and honest status flags.
//
// Three statuses:
//   "preview"   — code in repo, may have rough edges, ship-on-demand
//   "in progress" — actively being built right now
//   "planned"   — committed scope, not started
//
// Each item lists which package it'll ship in. Goal: zero "TBD" — every
// row is concrete enough that a contributor could pick it up and run with it.
// ─────────────────────────────────────────────────────────────────────────────

interface RoadmapItem {
  name: string;
  pkg: string;
  desc: string;
  release: string;
  status: 'preview' | 'in progress' | 'planned';
}

const ITEMS: RoadmapItem[] = [
  // ── tekivex-3d v0.2 — finishing the WebGL family ──────────────────────
  {
    name: 'TkxModel3D',
    pkg: 'tekivex-3d',
    desc: 'glTF/GLB model loader with Draco compression support and PBR auto-tone-mapping.',
    release: 'v0.2',
    status: 'in progress',
  },
  {
    name: 'TkxLogo3D',
    pkg: 'tekivex-3d',
    desc: 'Extruded-text 3D logo with theme-token gradient material. Drop-in replacement for hero text.',
    release: 'v0.2',
    status: 'in progress',
  },
  {
    name: 'TkxOrbitControls',
    pkg: 'tekivex-3d',
    desc: 'Wraps three/examples OrbitControls with sensible defaults + theme-aware focus ring.',
    release: 'v0.2',
    status: 'planned',
  },
  {
    name: 'TkxParticleField',
    pkg: 'tekivex-3d',
    desc: 'Animated particle background — 10k particles, GPU instancing, 60 FPS on M1+ phones.',
    release: 'v0.2',
    status: 'planned',
  },
  {
    name: 'TkxAvatar3D',
    pkg: 'tekivex-3d',
    desc: 'Animated 3D avatar — idle blink, talk, cheer states. ~80 KB FBX.',
    release: 'v0.3',
    status: 'planned',
  },

  // ── tekivex-ui v3.2 — high-impact new components ──────────────────────
  {
    name: 'TkxKanban',
    pkg: 'tekivex-ui',
    desc: 'Drag-drop board with column virtualization. Keyboard-accessible (WAI-ARIA grid pattern).',
    release: 'v3.2',
    status: 'planned',
  },
  {
    name: 'TkxRichEditor',
    pkg: 'tekivex-ui',
    desc: 'Slate-based rich-text editor — bold, italic, link, image, code blocks, mentions, sanitised on output.',
    release: 'v3.2',
    status: 'planned',
  },
  {
    name: 'TkxFormBuilder',
    pkg: 'tekivex-ui',
    desc: 'Visual form designer. Drag inputs onto a canvas → produces JSON schema → renders with TkxForm.',
    release: 'v3.2',
    status: 'planned',
  },
  {
    name: 'TkxCalendarHeatmap',
    pkg: 'tekivex-ui',
    desc: 'GitHub-style contribution heatmap. 365-day view, 12-month view, programmable colour scale.',
    release: 'v3.2',
    status: 'planned',
  },
  {
    name: 'TkxMindMap',
    pkg: 'tekivex-ui',
    desc: 'Interactive radial mind map. Pan, zoom, collapse subtrees, keyboard navigate.',
    release: 'v3.3',
    status: 'planned',
  },
  {
    name: 'TkxGantt',
    pkg: 'tekivex-ui',
    desc: 'Gantt timeline. Resizable bars, dependencies, critical-path highlight, CSV export.',
    release: 'v3.3',
    status: 'planned',
  },
  {
    name: 'TkxSpreadsheet',
    pkg: 'tekivex-ui',
    desc: 'Excel-like grid. Formula evaluation (SUM/AVG/IF), virtualized 100k+ rows, paste-from-clipboard.',
    release: 'v3.4',
    status: 'planned',
  },

  // ── tekivex-pdf — finishing the templates ──────────────────────────────
  {
    name: 'TkxPDFViewer',
    pkg: 'tekivex-content',
    desc: 'Embedded PDF reader. Pinch-zoom, text search, thumbnail strip, accessibility overlay.',
    release: 'v0.2',
    status: 'planned',
  },
  {
    name: 'BoardingPassTemplate',
    pkg: 'tekivex-templates',
    desc: 'Polished boarding-pass PDF — barcode, gate, seat, perforation hint, GDS-importable layout.',
    release: 'v0.2',
    status: 'preview',
  },
  {
    name: 'PrescriptionTemplate',
    pkg: 'tekivex-templates',
    desc: 'Doctor-prescription PDF — patient/doctor blocks, medications table, signature, MCI standard.',
    release: 'v0.2',
    status: 'planned',
  },

  // ── Cross-cutting / dev experience ────────────────────────────────────
  {
    name: 'TkxThemeStudio',
    pkg: 'tekivex-ui',
    desc: 'Visual theme editor — pick palette, see live preview across 102 components, export tokens.',
    release: 'v3.2',
    status: 'in progress',
  },
  {
    name: 'TkxAccessibilityChecker',
    pkg: 'tekivex-ui',
    desc: 'Runtime axe-core badge. Floating widget shows live a11y violations on the current page.',
    release: 'v3.2',
    status: 'planned',
  },
  {
    name: 'tekivex-server',
    pkg: 'tekivex-server',
    desc: 'Optional Express/Hono middleware. Pre-renders TkxPDF templates to PDFs via HTTP, signed URLs.',
    release: 'v0.1',
    status: 'planned',
  },
];

const STATUS_STYLE: Record<RoadmapItem['status'], { bg: string; color: string; label: string }> = {
  preview: { bg: 'rgba(255, 190, 11, 0.15)', color: '#ffbe0b', label: 'preview' },
  'in progress': { bg: 'rgba(0, 245, 212, 0.15)', color: '#00f5d4', label: 'in progress' },
  planned: { bg: 'rgba(123, 47, 247, 0.15)', color: '#7b2ff7', label: 'planned' },
};

export function Roadmap() {
  const groupedByRelease = ITEMS.reduce<Record<string, RoadmapItem[]>>((acc, item) => {
    (acc[item.release] = acc[item.release] || []).push(item);
    return acc;
  }, {});
  const releases = Object.keys(groupedByRelease).sort();

  return (
    <section
      id="roadmap"
      style={{ padding: '88px 24px 48px', maxWidth: 1280, margin: '0 auto' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
          }}
        >
          What's <span className="tk-gradient-text">next</span>
        </h2>
        <p style={{ color: '#888', maxWidth: 660, margin: '0 auto', fontSize: 16 }}>
          Concrete roadmap. Every line is scoped enough that a contributor could pick it up and
          ship it. Three honest statuses — <em>preview</em>, <em>in progress</em>,{' '}
          <em>planned</em> — no "TBD" or "future work".
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {releases.map((rel) => (
          <div key={rel}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#aaa',
                }}
              >
                {rel}
              </h3>
              <span style={{ color: '#666', fontSize: 12 }}>
                {groupedByRelease[rel].length} item{groupedByRelease[rel].length === 1 ? '' : 's'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 12,
              }}
            >
              {groupedByRelease[rel].map((item) => {
                const s = STATUS_STYLE[item.status];
                return (
                  <div
                    key={item.name}
                    style={{
                      padding: 18,
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(18,18,26,0.55)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <header
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <code
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#fff',
                          fontFamily: 'monospace',
                        }}
                      >
                        {item.name}
                      </code>
                      <span
                        style={{
                          padding: '2px 8px',
                          background: s.bg,
                          color: s.color,
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 999,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          marginLeft: 'auto',
                        }}
                      >
                        {s.label}
                      </span>
                    </header>
                    <p
                      style={{
                        color: '#bbb',
                        fontSize: 13,
                        margin: '0 0 10px',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </p>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#666',
                        fontFamily: 'monospace',
                      }}
                    >
                      ships in <span style={{ color: '#00f5d4' }}>{item.pkg}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          textAlign: 'center',
          color: '#666',
          fontSize: 13,
          marginTop: 36,
          fontStyle: 'italic',
        }}
      >
        Want something on this list sooner?{' '}
        <a
          href="https://github.com/novaai0401-ui/tekivex-issue-report/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#00f5d4', fontWeight: 600 }}
        >
          File a request →
        </a>
      </p>
    </section>
  );
}
