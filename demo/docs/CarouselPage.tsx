import type { ThemeTokens } from 'tekivex-ui';
import { TkxCarousel } from 'tekivex-ui';
import type { CarouselSlide } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';

const SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', gap: 8 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Slide One</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Beautiful gradient background</p>
      </div>
    ),
  },
  {
    id: 'slide-2',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: '#fff', gap: 8 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Slide Two</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Warm sunset tones</p>
      </div>
    ),
  },
  {
    id: 'slide-3',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', color: '#1a2e1a', gap: 8 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Slide Three</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Fresh and vibrant</p>
      </div>
    ),
  },
  {
    id: 'slide-4',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', color: '#fff', gap: 8 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Slide Four</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Soft pastel palette</p>
      </div>
    ),
  },
];

export function CarouselPage({ theme }: { theme: ThemeTokens }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px', color: theme.text }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Carousel</h1>
      <p style={{ color: theme.textMuted, marginBottom: 32 }}>
        Touch-friendly carousel with drag support, auto-play, dot navigation, and arrow controls.
      </p>

      <DemoSection
        title="Basic Carousel"
        description="A carousel with arrow navigation and dot indicators."
        theme={theme}
        code={`import { TkxCarousel } from 'tekivex-ui';
import type { CarouselSlide } from 'tekivex-ui';

const slides: CarouselSlide[] = [
  { id: 'slide-1', content: <div>Slide One</div> },
  { id: 'slide-2', content: <div>Slide Two</div> },
  { id: 'slide-3', content: <div>Slide Three</div> },
];

<TkxCarousel slides={slides} height={240} showArrows showDots />`}
      >
        <TkxCarousel slides={SLIDES} height={240} showArrows showDots />
      </DemoSection>

      <DemoSection
        title="Auto-play"
        description="Automatically advances slides at a configurable interval."
        theme={theme}
        code={`<TkxCarousel
  slides={slides}
  height={200}
  autoPlay
  autoPlayInterval={2500}
  showDots
/>`}
      >
        <TkxCarousel slides={SLIDES} height={200} autoPlay autoPlayInterval={2500} showDots />
      </DemoSection>

      <DemoSection
        title="Arrows Only"
        description="Navigation using arrow buttons without dot indicators."
        theme={theme}
        code={`<TkxCarousel slides={slides} height={180} showArrows />`}
      >
        <TkxCarousel slides={SLIDES} height={180} showArrows />
      </DemoSection>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Props</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
            {['Prop', 'Type', 'Default', 'Description'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: theme.textMuted, fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['slides', 'CarouselSlide[]', '—', 'Array of slide objects with id and content'],
            ['height', 'number | string', '300', 'Height of the carousel'],
            ['showArrows', 'boolean', 'true', 'Show previous/next arrow buttons'],
            ['showDots', 'boolean', 'true', 'Show dot navigation indicators'],
            ['autoPlay', 'boolean', 'false', 'Auto-advance slides'],
            ['autoPlayInterval', 'number', '3000', 'Auto-play interval in milliseconds'],
            ['loop', 'boolean', 'true', 'Loop back to start after last slide'],
            ['defaultIndex', 'number', '0', 'Initial slide index'],
          ].map(([prop, type, def, desc]) => (
            <tr key={prop} style={{ borderBottom: `1px solid ${theme.border}` }}>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.primary }}>{prop}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.info }}>{type}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.textMuted }}>{def}</td>
              <td style={{ padding: '8px 12px', color: theme.text }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
