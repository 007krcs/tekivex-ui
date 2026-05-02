// ─────────────────────────────────────────────────────────────────────────────
// /examples — index card for every showcase example.
// ─────────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { usePageMeta } from '../../use-page-meta';

interface ExampleCard {
  to: string;
  eyebrow: string;
  title: string;
  blurb: string;
  bullets: string[];
  hue: [string, string];
}

const EXAMPLES: ExampleCard[] = [
  {
    to: '/examples/360',
    eyebrow: '360°',
    title: 'Multi-scene 360° tour',
    blurb: 'A working interactive 360° tour. Drag to look, click hotspots to teleport between scenes, fullscreen on any device, gyroscope on mobile.',
    bullets: ['4 panorama scenes', 'Hotspot navigation', 'Gyroscope on mobile', 'Fullscreen toggle'],
    hue: ['#06b6d4', '#3a86ff'],
  },
  {
    to: '/examples/ar-vr',
    eyebrow: 'WebXR',
    title: 'AR / VR scene',
    blurb: 'Enter AR pass-through on Quest 3, Vision Pro, or any ARCore phone. Enter immersive VR on Quest. Fully interactive on every device that can run a browser.',
    bullets: ['AR + VR session entry', 'Capability detection', 'Floating 3D card + logo', 'Graceful desktop fallback'],
    hue: ['#7c3aed', '#3a86ff'],
  },
  {
    to: '/examples/holographic',
    eyebrow: 'Holographic UI',
    title: 'Holographic surface gallery',
    blurb: 'Every holographic primitive shipped in tekivex-ui — cards, badges, avatars, panels, gauges, terminals, and progress with live prismatic effects.',
    bullets: ['9 surface variants', 'Live progress controls', 'Five tone palettes', 'Copy-paste props table'],
    hue: ['#c4a8ff', '#ec4899'],
  },
  {
    to: '/examples/blog',
    eyebrow: 'Blog',
    title: 'Configurable blog',
    blurb: 'Full editorial blog: write posts with a markdown editor, upload cover images, drop in syntax-highlighted code blocks, organise by category and tags. No backend required.',
    bullets: ['Full markdown editor', 'Image upload + code blocks', 'Tags + search + pagination', 'Live brand customisation'],
    hue: ['#4f46e5', '#06b6d4'],
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
      subtitle="Four working applications built on the TekiVex UI stack — copy any of them as the starting point for your project."
      breadcrumbs={[{ label: 'Examples' }]}
    >
      <p style={{ marginTop: 0 }}>
        Every example is a real React route that runs live in your browser, with full source linked
        on GitHub. Pick one to launch the interactive demo, or read the source to lift the bits you need.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
          marginTop: 24,
          marginBottom: 16,
        }}
      >
        {EXAMPLES.map((e) => (
          <Link
            key={e.to}
            to={e.to}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              padding: 22,
              borderRadius: 14,
              border: '1px solid #e6e8ef',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
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
                height: 8,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${e.hue[0]}, ${e.hue[1]})`,
                marginBottom: 4,
              }}
            />
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: e.hue[0],
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
        ))}
      </div>
    </PageShell>
  );
}
