// ─────────────────────────────────────────────────────────────────────────────
// /examples — index card for every showcase example.
// ─────────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { usePageMeta } from '../../use-page-meta';
import { OpenSourceFooter } from './OpenSourceFooter';

interface ExampleCard {
  to: string;
  eyebrow: string;
  title: string;
  blurb: string;
  bullets: string[];
  hue: [string, string];
  group: 'use-case' | 'primitive';
}

const EXAMPLES: ExampleCard[] = [
  // ─── Use cases (commercial product surfaces) ──────────────────────────
  {
    to: '/examples/property-tour',
    eyebrow: 'Real estate · 360°',
    title: 'Property tour',
    blurb: 'A real-estate listing with an embedded 360° walkthrough. Drag through rooms, click hotspots to teleport, request a viewing, and run a mortgage calculator without leaving the page.',
    bullets: ['Multi-room 360° tour', 'Mortgage calculator', 'Schedule-a-visit form', 'Agent profile card'],
    hue: ['#06b6d4', '#3a86ff'],
    group: 'use-case',
  },
  {
    to: '/examples/ar-product',
    eyebrow: 'E-commerce · AR',
    title: 'AR product preview',
    blurb: 'A furniture product page where shoppers place the item in their real room with WebXR AR. Falls back to a draggable 3D viewer on devices without AR.',
    bullets: ['Variant swatches + qty', 'AR / VR session entry', 'Capability detection', 'Reviews + specs'],
    hue: ['#7c3aed', '#4f46e5'],
    group: 'use-case',
  },
  {
    to: '/examples/mission-control',
    eyebrow: 'Live ops · Holographic',
    title: 'Mission control',
    blurb: 'A NOC / SRE-style live operations dashboard. KPI tiles, holographic gauges, deploy pipeline, alert feed, regional capacity, commit stream — all updating in real time.',
    bullets: ['Real-time KPI tiles', 'Holographic gauges', 'Live deploy pipeline', 'Alert feed terminal'],
    hue: ['#c4a8ff', '#ec4899'],
    group: 'use-case',
  },
  {
    to: '/examples/blog',
    eyebrow: 'Publishing · Editor',
    title: 'Configurable blog',
    blurb: 'Medium-style block editor: title, cover image, paragraph + heading + image + code + quote + list + video + divider blocks. No backend needed.',
    bullets: ['Block editor (no markdown)', 'Image upload + code blocks', 'Tags + search + pagination', 'Live brand customisation'],
    hue: ['#4f46e5', '#06b6d4'],
    group: 'use-case',
  },

  // ─── Primitive showcase (the toolkit, side-by-side) ──────────────────
  {
    to: '/examples/holographic',
    eyebrow: 'Primitive · Holographic UI',
    title: 'Holographic surface gallery',
    blurb: 'Every holographic surface shipped in tekivex-ui — cards, badges, avatars, panels, gauges, terminals, progress — side by side with live controls.',
    bullets: ['9 surface variants', 'Live progress controls', 'Five tone palettes', 'Code snippets'],
    hue: ['#c4a8ff', '#ec4899'],
    group: 'primitive',
  },
  {
    to: '/examples/3d',
    eyebrow: 'Primitive · 3D · 360° · WebXR',
    title: '3D & immersive showcase',
    blurb: 'The full spatial-UI gallery: 360° panorama, holographic universe, galaxy map, and the live JSX playground. Used to live on the home page — now a dedicated destination.',
    bullets: ['360° panorama + hotspots', 'Holographic universe scene', 'Galaxy map navigation', 'Live JSX playground'],
    hue: ['#7c3aed', '#06b6d4'],
    group: 'primitive',
  },
];

export function ExamplesIndex() {
  usePageMeta(
    'Examples — TekiVex UI',
    'Working example applications built with TekiVex UI: 360° tours, WebXR AR/VR scenes, holographic UI surfaces, and a fully configurable static blog.',
    { keywords: 'tekivex examples, tekivex-ui examples, 360 tour, ar vr, holographic, blog example' },
  );

  return (
    <PageShell
      title="Examples"
      eyebrow="Showcase"
      subtitle="A few small examples I built while learning what TekiVex UI can do — four product-shaped pages plus a holographic primitives gallery. The source is open; feel free to copy or fork anything that's useful."
      breadcrumbs={[{ label: 'Examples' }]}
    >
      <p style={{ marginTop: 0 }}>
        Each example is a real React route that runs live in your browser, with the source linked on
        GitHub. <strong>Use cases</strong> are product-shaped pages stitched together while learning
        the library; <strong>Primitives</strong> are bare-toolkit demos that show what a single
        component does on its own. Everything is MIT-licensed and free to lift.
      </p>

      <h2 style={{ marginTop: 32, fontSize: 18, color: '#0f172a', fontWeight: 800 }}>
        Use cases
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
          marginTop: 12,
          marginBottom: 16,
        }}
      >
        {EXAMPLES.filter((e) => e.group === 'use-case').map((e) => renderCard(e))}
      </div>

      <h2 style={{ marginTop: 24, fontSize: 18, color: '#0f172a', fontWeight: 800 }}>
        Primitives
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
          marginTop: 12,
          marginBottom: 16,
        }}
      >
        {EXAMPLES.filter((e) => e.group === 'primitive').map((e) => renderCard(e))}
      </div>

      <OpenSourceFooter />
    </PageShell>
  );
}

function renderCard(e: ExampleCard) {
  return (
    <Link
      key={e.to}
      to={e.to}
      style={{
        textDecoration: 'none', color: 'inherit', padding: 22,
        borderRadius: 14, border: '1px solid #e6e8ef', background: '#ffffff',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.transform = 'translateY(-2px)';
        ev.currentTarget.style.boxShadow = '0 12px 32px rgba(15, 23, 42, 0.08)';
        ev.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.transform = 'translateY(0)';
        ev.currentTarget.style.boxShadow = 'none';
        ev.currentTarget.style.borderColor = '#e6e8ef';
      }}
    >
      <div
        aria-hidden="true"
        style={{
          height: 8, borderRadius: 999,
          background: `linear-gradient(90deg, ${e.hue[0]}, ${e.hue[1]})`,
          marginBottom: 4,
        }}
      />
      <div
        style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: e.hue[0],
        }}
      >
        {e.eyebrow}
      </div>
      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
        {e.title}
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.55 }}>
        {e.blurb}
      </p>
      <ul style={{ margin: '4px 0 0', padding: '0 0 0 18px', color: '#475569', fontSize: 13, lineHeight: 1.7 }}>
        {e.bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
      <span style={{ marginTop: 10, color: e.hue[1], fontWeight: 700, fontSize: 13 }}>
        Open the example →
      </span>
    </Link>
  );
}
