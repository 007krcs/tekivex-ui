import { useState } from 'react';
import { PREVIEWS } from '../component-previews';
import { RequestAccessDialog, type RequestTarget } from '../RequestAccessDialog';

// Map a component-display-name → preview slug. Tries common transformations:
//   TkxFlowChart       → flow-chart
//   TkxOrbitControls   → orbit-controls
//   TkxStarfield/TkxPlanet/TkxOrbitPath → starfield (first match wins)
//   "Holographic extras (Panel/Gauge/...)" → holographic-panel
function nameToSlug(name: string): string | null {
  // Strip everything after a slash or paren
  const head = name.split(/[\/(]/)[0].trim();
  // Drop the Tkx prefix, kebab-case
  const slug = head
    .replace(/^Tkx/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  if (slug in PREVIEWS) return slug;
  // Heuristic for "Holographic extras (Panel/Gauge/Progress/Terminal)" →
  // try the first child token.
  if (/holographic.*panel|panel.*holographic/i.test(name)) return 'holographic-panel';
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Roadmap — what's just shipped, what's in flight, what's next.
//
// Four statuses:
//   "shipped"     — published to npm, available now
//   "preview"     — code in repo, may have rough edges, ship-on-demand
//   "in progress" — actively being built right now
//   "planned"     — committed scope, not started
//
// Goal: zero "TBD" — every row is concrete enough that a contributor could
// pick it up and run with it.
// ─────────────────────────────────────────────────────────────────────────────

interface RoadmapItem {
  name: string;
  pkg: string;
  desc: string;
  release: string;
  status: 'shipped' | 'preview' | 'in progress' | 'planned';
}

const ITEMS: RoadmapItem[] = [
  // ── v3.6 → v3.13 — already shipped this quarter ──────────────────────
  { name: 'TkxKanban',                 pkg: 'tekivex-ui', release: 'v3.2',  status: 'shipped',
    desc: 'Drag-drop board with WAI-ARIA grid pattern. Keyboard reachable.' },
  { name: 'TkxRichEditor',             pkg: 'tekivex-ui', release: 'v3.3',  status: 'shipped',
    desc: 'contenteditable + custom HTML sanitiser. No Slate / TipTap dep.' },
  { name: 'TkxThemeStudio',            pkg: 'tekivex-ui', release: 'v3.4',  status: 'shipped',
    desc: 'Visual theme editor with WCAG-compliance badges per token pair.' },
  { name: 'TkxCalendarHeatmap',        pkg: 'tekivex-ui', release: 'v3.4',  status: 'shipped',
    desc: 'GitHub-style heatmap with programmable colour scale + tooltips.' },
  { name: 'TkxAccessibilityChecker',   pkg: 'tekivex-ui', release: 'v3.5',  status: 'shipped',
    desc: 'Floating axe-core widget. Live a11y violations on the current page.' },
  { name: 'TkxFormBuilder',            pkg: 'tekivex-ui', release: 'v3.6',  status: 'shipped',
    desc: 'Three-pane visual form designer. Live preview tab. JSON schema export.' },
  { name: 'TkxMindMap',                pkg: 'tekivex-ui', release: 'v3.7',  status: 'shipped',
    desc: 'Tidy-tree mind map. SVG cubic-Bezier links. Full keyboard nav.' },
  { name: 'TkxGantt',                  pkg: 'tekivex-ui', release: 'v3.8',  status: 'shipped',
    desc: 'Timeline with SVG dependency arrows. UTC-safe date math. Reschedule via keyboard.' },
  { name: 'TkxSpreadsheet',            pkg: 'tekivex-ui', release: 'v3.9',  status: 'shipped',
    desc: 'Real formula evaluator: SUM/AVG/MIN/MAX/COUNT/IF/ROUND, ranges, cycle detection.' },
  { name: 'TkxPivotTable',             pkg: 'tekivex-ui', release: 'v3.10', status: 'shipped',
    desc: 'Group + aggregate flat records. Multi-level row/col groups. Grand totals.' },
  { name: 'TkxDataExplorer',           pkg: 'tekivex-ui', release: 'v3.11', status: 'shipped',
    desc: 'Drop a CSV/JSON, preview, pick a chart, render. Bridges to TkxSpreadsheet.' },
  { name: 'Holographic extras (Panel/Gauge/Progress/Terminal)',
    pkg: 'tekivex-ui', release: 'v3.12', status: 'shipped',
    desc: 'Multi-section panels, ARIA meters, shimmer progress bars, scrolling terminals.' },
  { name: 'TkxCommandPalette',         pkg: 'tekivex-ui', release: 'v3.13', status: 'shipped',
    desc: 'Cmd-K palette. Built-in fuzzy matcher (no Fuse.js dep). Recents, sections, hotkeys.' },

  // ── tekivex-3d v0.2 → v0.5 — already shipped ───────────────────────
  { name: 'TkxModel3D',                pkg: 'tekivex-3d', release: 'v0.2', status: 'shipped',
    desc: 'glTF/GLB loader with auto-fit + cursor-tracked tilt + animation playback.' },
  { name: 'TkxLogo3D',                 pkg: 'tekivex-3d', release: 'v0.3', status: 'shipped',
    desc: 'Extruded-text 3D logo with iridescent material. Drop-in for hero text.' },
  { name: 'TkxParticleField',          pkg: 'tekivex-3d', release: 'v0.3', status: 'shipped',
    desc: 'GPU-instanced particle background — 5k particles at 60 FPS on M1+ phones.' },
  { name: 'TkxOrbitControls',          pkg: 'tekivex-3d', release: 'v0.4', status: 'shipped',
    desc: 'Three preset modes: free, showcase (auto-rotate), top-down (map-style).' },
  { name: 'TkxStarfield / TkxPlanet / TkxOrbitPath',
    pkg: 'tekivex-3d', release: 'v0.5', status: 'shipped',
    desc: 'Procedural galaxy primitives — no equirectangular photo required.' },

  { name: 'TkxFlowChart',              pkg: 'tekivex-ui', release: 'v3.15', status: 'shipped',
    desc: 'Node-edge graph editor. Drag/pinch/wheel, keyboard nav, custom renderers, ≥85% tests.' },
  { name: 'Resume + Biodata templates', pkg: 'tekivex-resume-templates / tekivex-biodata-templates', release: 'v3.16',  status: 'shipped',
    desc: '24 layouts + smart generator extracted into their own repos. Both declare tekivex-ui as a peer-dep.' },

  // ── what's actually next ────────────────────────────────────────────
  { name: 'TkxFormulaBar',             pkg: 'tekivex-ui', release: 'v3.14', status: 'planned',
    desc: 'Companion to TkxSpreadsheet. Shows raw cell content for the active cell, with name-box.' },
  { name: 'TkxPortal3D',               pkg: 'tekivex-3d', release: 'v0.6',  status: 'planned',
    desc: 'Clickable 3D portal that fades to a different scene. Pairs with the Galaxy Map.' },
  { name: 'TkxAvatar3D',               pkg: 'tekivex-3d', release: 'v0.7',  status: 'shipped',
    desc: 'Procedural avatar — idle / talk / cheer states. Zero asset bytes shipped.' },
  { name: 'TkxPDFViewer',              pkg: 'tekivex-content', release: 'v0.2', status: 'planned',
    desc: 'Embedded PDF reader. Pinch-zoom, text search, thumbnail strip, accessibility overlay.' },
  { name: 'BoardingPassTemplate',      pkg: 'tekivex-templates', release: 'v0.2', status: 'preview',
    desc: 'Polished boarding-pass PDF — barcode, gate, seat, perforation hint, GDS-importable layout.' },
  { name: 'PrescriptionTemplate',      pkg: 'tekivex-templates', release: 'v0.2', status: 'planned',
    desc: 'Doctor-prescription PDF — patient/doctor blocks, medications table, signature, MCI standard.' },
  { name: 'tekivex-server',            pkg: 'tekivex-server', release: 'v0.1', status: 'planned',
    desc: 'Optional Express/Hono middleware. Pre-renders TkxPDF templates to PDFs via HTTP.' },
];

const STATUS_STYLE: Record<RoadmapItem['status'], { bg: string; color: string; label: string }> = {
  shipped:       { bg: 'rgba(0, 245, 212, 0.14)',   color: '#00f5d4', label: 'shipped' },
  preview:       { bg: 'rgba(255, 190, 11, 0.14)',  color: '#ffbe0b', label: 'preview' },
  'in progress': { bg: 'rgba(123, 142, 255, 0.18)', color: '#7b8eff', label: 'in progress' },
  planned:       { bg: 'rgba(196, 168, 255, 0.14)', color: '#c4a8ff', label: 'planned' },
};

// Custom release ordering: shipped releases ascending, then future releases
const RELEASE_ORDER = [
  'v3.2', 'v3.3', 'v3.4', 'v3.5', 'v3.6', 'v3.7', 'v3.8', 'v3.9', 'v3.10',
  'v3.11', 'v3.12', 'v3.13', 'v3.15', 'v3.16',
  'v0.2', 'v0.3', 'v0.4', 'v0.5',
  'v0.7',
  'v3.14',
  'v0.6',
  'v0.1',
];

export function Roadmap() {
  const [requested, setRequested] = useState<RequestTarget | null>(null);

  const groupedByRelease = ITEMS.reduce<Record<string, RoadmapItem[]>>((acc, item) => {
    (acc[item.release] = acc[item.release] || []).push(item);
    return acc;
  }, {});
  const releases = RELEASE_ORDER.filter((r) => r in groupedByRelease);

  const shippedCount = ITEMS.filter((i) => i.status === 'shipped').length;
  const upcomingCount = ITEMS.filter((i) => i.status !== 'shipped').length;

  return (
    <section
      id="roadmap"
      style={{ padding: 'clamp(64px, 9vw, 120px) 24px 48px', maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}
    >
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 999,
            background: 'rgba(0,245,212,0.1)',
            border: '1px solid rgba(0,245,212,0.3)',
            color: '#00f5d4',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          Roadmap
        </div>
        <h2
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 14px',
            lineHeight: 1.05,
          }}
        >
          {shippedCount} shipped this quarter,{' '}
          <span className="tk-gradient-text">{upcomingCount} more on the way</span>
        </h2>
        <p style={{ color: '#b8b8d4', maxWidth: 660, margin: '0 auto', fontSize: 16, lineHeight: 1.65 }}>
          Concrete items only. Every line is scoped enough that a contributor could
          pick it up and ship it. Four honest statuses — <em>shipped</em>,{' '}
          <em>in progress</em>, <em>preview</em>, <em>planned</em> — no "TBD" or "future work".
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
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#c4a8ff',
                }}
              >
                {rel}
              </h3>
              <span style={{ color: '#888', fontSize: 12 }}>
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
                const slug = nameToSlug(item.name);
                const clickable = !!slug;
                const baseStyle: React.CSSProperties = {
                  padding: 18,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(18, 20, 38, 0.55)',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit',
                  color: 'inherit',
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'border-color 0.15s, transform 0.15s',
                };
                const inner = (
                  <>
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
                          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
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
                        color: '#b8b8d4',
                        fontSize: 13,
                        margin: '0 0 10px',
                        lineHeight: 1.55,
                      }}
                    >
                      {item.desc}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        color: '#888',
                        fontFamily: 'ui-monospace, monospace',
                      }}
                    >
                      <span>
                        ships in <span style={{ color: '#00f5d4' }}>{item.pkg}</span>
                      </span>
                      {clickable && (
                        <span style={{ color: '#c4a8ff', fontWeight: 700 }}>
                          live preview →
                        </span>
                      )}
                    </div>
                  </>
                );

                if (clickable && slug) {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() =>
                        setRequested({
                          name: item.name.startsWith('Tkx') ? item.name.split(/[\/(]/)[0].trim() : item.name,
                          slug,
                          pkg: item.pkg,
                        })
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(196,168,255,0.45)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      style={baseStyle}
                    >
                      {inner}
                    </button>
                  );
                }
                return (
                  <div key={item.name} style={baseStyle}>
                    {inner}
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
          color: '#888',
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

      <RequestAccessDialog target={requested} onClose={() => setRequested(null)} />
    </section>
  );
}
