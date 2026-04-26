import { TkxCarousel, TkxCarouselSlide } from 'tekivex-ui';
import { Preview } from '../Preview';

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

export function CarouselBasic() {
  return (
    <Preview label="Single slide with dots" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360, maxWidth: 480 }}>
        <TkxCarousel>
          {SLIDES.map((s, i) => (
            <TkxCarouselSlide key={i}>
              <SlidePlaceholder hue={s.hue} title={s.title} />
            </TkxCarouselSlide>
          ))}
        </TkxCarousel>
      </div>
    </Preview>
  );
}

export function CarouselAutoplay() {
  return (
    <Preview label="Autoplay (pauses on hover/focus)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360, maxWidth: 480 }}>
        <TkxCarousel autoplay autoplayInterval={3000} loop indicators="bars">
          {SLIDES.map((s, i) => (
            <TkxCarouselSlide key={i}>
              <SlidePlaceholder hue={s.hue} title={s.title} />
            </TkxCarouselSlide>
          ))}
        </TkxCarousel>
      </div>
    </Preview>
  );
}
