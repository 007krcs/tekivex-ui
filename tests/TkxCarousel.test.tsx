import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxCarousel } from '../src/components/TkxCarousel';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const slides = [
  { id: 's1', content: <div><a href="#one">Link one</a></div> },
  { id: 's2', content: <div><a href="#two">Link two</a></div> },
  { id: 's3', content: <div><a href="#three">Link three</a></div> },
];

function getSlideEls(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]'),
  );
}

describe('TkxCarousel', () => {
  it('renders all slides and the carousel container', () => {
    render(<TkxCarousel slides={slides} loop={false} />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Content carousel')).toBeInTheDocument();
    expect(getSlideEls()).toHaveLength(3);
  });

  // Regression (a11y MEDIUM): aria-hidden slides kept focusable descendants in
  // the tab order (axe aria-hidden-focus). Hidden AND cloned slides must be
  // inert so keyboard focus skips them entirely.
  it('marks non-current slides inert as well as aria-hidden', () => {
    render(<TkxCarousel slides={slides} loop={false} />, { wrapper: Wrapper });
    const slideEls = getSlideEls();
    const hidden = slideEls.filter((el) => el.getAttribute('aria-hidden') === 'true');
    const visible = slideEls.filter((el) => el.getAttribute('aria-hidden') !== 'true');

    expect(hidden).toHaveLength(2);
    expect(visible).toHaveLength(1);
    hidden.forEach((el) => expect(el.hasAttribute('inert')).toBe(true));
    visible.forEach((el) => expect(el.hasAttribute('inert')).toBe(false));
  });

  it('marks loop clone slides inert too', () => {
    render(<TkxCarousel slides={slides} loop />, { wrapper: Wrapper });
    const slideEls = getSlideEls();
    // 3 real slides + cloned last (front) + cloned first (back)
    expect(slideEls).toHaveLength(5);
    // Every aria-hidden slide (off-screen slides AND loop clones of
    // non-current slides) must also be inert so its focusables leave the tab
    // order. Clones sharing the current index stay exposed for the seamless
    // loop snap, mirroring the pre-existing aria-hidden logic.
    const hidden = slideEls.filter((el) => el.getAttribute('aria-hidden') === 'true');
    expect(hidden.length).toBeGreaterThanOrEqual(3);
    hidden.forEach((el) => expect(el.hasAttribute('inert')).toBe(true));
    // inert is applied exactly where aria-hidden is — never on a visible slide.
    slideEls
      .filter((el) => el.getAttribute('aria-hidden') !== 'true')
      .forEach((el) => expect(el.hasAttribute('inert')).toBe(false));
  });

  // Regression (a11y MEDIUM): the thumbnail strip declared role="tablist"/"tab"
  // + aria-selected without implementing the Tabs keyboard pattern. The roles
  // were dropped in favour of a plain labelled button group with aria-current
  // (mirroring the dot indicators).
  it('thumbnail strip is a plain button group with aria-current, not a tablist', () => {
    render(<TkxCarousel slides={slides} loop={false} showThumbnails />, { wrapper: Wrapper });

    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);

    const group = screen.getByRole('group', { name: 'Slide thumbnails' });
    expect(group).toBeInTheDocument();

    const thumbs = slides.map((_, i) =>
      screen.getByRole('button', { name: `Thumbnail for slide ${i + 1}` }),
    );
    expect(thumbs[0]).toHaveAttribute('aria-current', 'true');
    expect(thumbs[1]).not.toHaveAttribute('aria-current');
    expect(thumbs[2]).not.toHaveAttribute('aria-current');
    thumbs.forEach((t) => expect(t).not.toHaveAttribute('aria-selected'));
  });
});
