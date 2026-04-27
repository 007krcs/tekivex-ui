import { TkxCarousel } from 'tekivex-ui';
import { Preview } from '../Preview';

// v3 API: TkxCarousel takes a `slides` array of { id, content }, not
// nested <TkxCarouselSlide> children. Re-shaped to match the published
// 3.0.x API.

const SLIDES = [
  { hue: 200, title: 'Mountain at dawn' },
  { hue: 130, title: 'Forest path' },
  { hue: 30,  title: 'Desert sunset' },
  { hue: 280, title: 'Twilight harbour' },
  { hue: 340, title: 'Spring blossoms' },
];

function SlidePlaceholder({ hue, title }: { hue: number; title: string }) {
  return (
    <div
      style={{
        height: 200,
        borderRadius: 12,
        background: `linear-gradient(135deg, hsl(${hue}, 60%, 40%), hsl(${hue + 30}, 70%, 55%))`,
        color: 'white',
        display: 'flex',
        alignItems: 'flex-end',
        padding: 20,
        fontWeight: 700,
        fontSize: 18,
      }}
    >
      {title}
    </div>
  );
}

const slideObjects = SLIDES.map((s, i) => ({
  id: `slide-${i}`,
  content: <SlidePlaceholder hue={s.hue} title={s.title} />,
}));

export function CarouselBasic() {
  return (
    <Preview label="Single slide with dots" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360, maxWidth: 480 }}>
        <TkxCarousel slides={slideObjects} />
      </div>
    </Preview>
  );
}

export function CarouselAutoplay() {
  return (
    <Preview label="Autoplay (pauses on hover/focus)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360, maxWidth: 480 }}>
        <TkxCarousel
          slides={slideObjects}
          autoPlay
          autoPlayInterval={3000}
          loop
          showDots
          pauseOnHover
        />
      </div>
    </Preview>
  );
}
