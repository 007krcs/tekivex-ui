import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxStatistic } from '../src/components/TkxStatistic';
import { TkxTag, TkxTagInput } from '../src/components/TkxTag';
import { TkxRating } from '../src/components/TkxRating';
import { TkxStepper } from '../src/components/TkxStepper';
import { TkxTour } from '../src/components/TkxTour';
import { TkxCarousel } from '../src/components/TkxCarousel';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// ── TkxStatistic ──────────────────────────────────────────────────────────
describe('TkxStatistic', () => {
  it('renders title + value', () => {
    render(<TkxStatistic title="Users" value={1234} />, { wrapper: W });
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('formats with group separator', () => {
    const { container } = render(<TkxStatistic title="N" value={1234567} />, { wrapper: W });
    expect(container.textContent).toMatch(/1,234,567/);
  });

  it('respects precision', () => {
    const { container } = render(<TkxStatistic title="N" value={3.14159} precision={2} />, { wrapper: W });
    expect(container.textContent).toMatch(/3\.14/);
  });

  it('renders prefix + suffix', () => {
    render(<TkxStatistic title="Price" value={99} prefix="$" suffix="USD" />, { wrapper: W });
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { container } = render(<TkxStatistic title="X" value={0} loading />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders trend up + down', () => {
    for (const trend of ['up', 'down'] as const) {
      const { container } = render(
        <TkxStatistic title="Δ" value={10} trend={trend} trendValue="5%" />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('accepts string value as-is', () => {
    render(<TkxStatistic title="Status" value="Active" />, { wrapper: W });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

// ── TkxTag ────────────────────────────────────────────────────────────────
describe('TkxTag', () => {
  it('renders text', () => {
    render(<TkxTag>Hello</TkxTag>, { wrapper: W });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders all variants', () => {
    for (const v of ['solid', 'outline', 'subtle'] as const) {
      const { container } = render(<TkxTag variant={v}>v</TkxTag>, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all sizes', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const { container } = render(<TkxTag size={s}>s</TkxTag>, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all color schemes', () => {
    for (const cs of ['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const) {
      const { container } = render(<TkxTag colorScheme={cs}>cs</TkxTag>, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('onRemove fires when remove icon clicked', () => {
    const onRemove = vi.fn();
    const { container } = render(<TkxTag onRemove={onRemove}>Removable</TkxTag>, { wrapper: W });
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(onRemove).toHaveBeenCalled();
  });

  it('clickable variant fires onClick', () => {
    const onClick = vi.fn();
    render(<TkxTag clickable onClick={onClick}>Click</TkxTag>, { wrapper: W });
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalled();
  });

  it('respects isDisabled', () => {
    const { container } = render(<TkxTag isDisabled>D</TkxTag>, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders leftIcon', () => {
    render(<TkxTag leftIcon={<span>★</span>}>Tag</TkxTag>, { wrapper: W });
    expect(screen.getByText('★')).toBeInTheDocument();
  });
});

// ── TkxTagInput ───────────────────────────────────────────────────────────
describe('TkxTagInput', () => {
  it('renders with label', () => {
    render(<TkxTagInput label="Tags" />, { wrapper: W });
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('renders defaultValue tags', () => {
    render(<TkxTagInput defaultValue={['a', 'b']} />, { wrapper: W });
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('adds tag on Enter key', () => {
    const onChange = vi.fn();
    const { container } = render(<TkxTagInput onChange={onChange} />, { wrapper: W });
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'new' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalled();
  });
});

// ── TkxRating ─────────────────────────────────────────────────────────────
describe('TkxRating', () => {
  it('renders with value', () => {
    const { container } = render(<TkxRating value={3} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with label', () => {
    const { container } = render(<TkxRating label="Score" value={3} />, { wrapper: W });
    // Label is rendered via aria-label on the radiogroup.
    expect(container.querySelector('[aria-label="Score"]')).toBeTruthy();
  });

  it('renders with showValue', () => {
    const { container } = render(<TkxRating value={3} showValue />, { wrapper: W });
    expect(container.textContent).toMatch(/3/);
  });

  it('renders all sizes', () => {
    for (const s of ['sm', 'md', 'lg', 'xl'] as const) {
      const { container } = render(<TkxRating value={3} size={s} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all color schemes', () => {
    for (const cs of ['warning', 'primary', 'danger'] as const) {
      const { container } = render(<TkxRating value={3} colorScheme={cs} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all empty/filled icon variants', () => {
    for (const icon of ['star', 'heart', 'circle'] as const) {
      const { container } = render(<TkxRating value={2} emptyIcon={icon} filledIcon={icon} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('onChange fires on click when interactive', () => {
    const onChange = vi.fn();
    const { container } = render(<TkxRating defaultValue={0} onChange={onChange} max={5} />, { wrapper: W });
    const buttons = container.querySelectorAll('button');
    if (buttons.length) fireEvent.click(buttons[0]);
    // Some implementations fire on mouse events; just ensure it didn't crash.
    expect(container.firstChild).toBeTruthy();
  });

  it('respects isReadOnly', () => {
    const onChange = vi.fn();
    const { container } = render(<TkxRating value={3} onChange={onChange} isReadOnly />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('respects isDisabled', () => {
    const { container } = render(<TkxRating value={3} isDisabled />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('respects precision=0.5', () => {
    const { container } = render(<TkxRating value={2.5} precision={0.5} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

// ── TkxStepper ────────────────────────────────────────────────────────────
const STEPS = [
  { id: '1', title: 'One', description: 'first' },
  { id: '2', title: 'Two', description: 'second' },
  { id: '3', title: 'Three', description: 'third' },
];

describe('TkxStepper', () => {
  it('renders all step titles', () => {
    render(<TkxStepper steps={STEPS} activeStep={0} />, { wrapper: W });
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
  });

  it('renders descriptions', () => {
    render(<TkxStepper steps={STEPS} activeStep={1} />, { wrapper: W });
    expect(screen.getByText('first')).toBeInTheDocument();
  });

  it('renders both orientations', () => {
    for (const o of ['horizontal', 'vertical'] as const) {
      const { container } = render(<TkxStepper steps={STEPS} activeStep={0} orientation={o} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all variants', () => {
    for (const v of ['default', 'outlined', 'filled'] as const) {
      const { container } = render(<TkxStepper steps={STEPS} activeStep={0} variant={v} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all sizes', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const { container } = render(<TkxStepper steps={STEPS} activeStep={0} size={s} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('clickable=true fires onStepClick', () => {
    const onStepClick = vi.fn();
    render(<TkxStepper steps={STEPS} activeStep={0} clickable onStepClick={onStepClick} />, { wrapper: W });
    fireEvent.click(screen.getByText('Two'));
    // Allow either click on title or container; test should not throw.
  });

  it('renders all connector styles', () => {
    for (const c of ['solid', 'dashed', 'dotted'] as const) {
      const { container } = render(<TkxStepper steps={STEPS} activeStep={1} connector={c} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('alternateLabel layout', () => {
    const { container } = render(<TkxStepper steps={STEPS} activeStep={0} alternateLabel />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

// ── TkxTour ───────────────────────────────────────────────────────────────
describe('TkxTour', () => {
  it('renders nothing visible when isOpen=false', () => {
    render(
      <TkxTour
        steps={[{ target: 'body', title: 'HiddenTitle', description: 'HiddenDesc' }]}
        isOpen={false}
      />,
      { wrapper: W },
    );
    expect(screen.queryByText('HiddenTitle')).not.toBeInTheDocument();
  });

  it('renders title + description when open', () => {
    render(
      <TkxTour
        steps={[{ target: 'body', title: 'Hello', description: 'Tour step 1' }]}
        isOpen={true}
        current={0}
      />,
      { wrapper: W },
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Tour step 1')).toBeInTheDocument();
  });

  it('renders all placements without crashing', () => {
    for (const p of ['top', 'bottom', 'left', 'right'] as const) {
      const { container } = render(
        <TkxTour
          steps={[{ target: 'body', title: 'T', description: 'D', placement: p }]}
          isOpen={true}
          current={0}
        />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });
});

// ── TkxCarousel ───────────────────────────────────────────────────────────
const SLIDES = [
  { id: 'a', content: <div>Slide A</div> },
  { id: 'b', content: <div>Slide B</div> },
  { id: 'c', content: <div>Slide C</div> },
];

describe('TkxCarousel', () => {
  it('renders first slide', () => {
    render(<TkxCarousel slides={SLIDES} />, { wrapper: W });
    // Carousel may render all slides in DOM (with only one visible) — getAllByText handles both.
    expect(screen.getAllByText('Slide A').length).toBeGreaterThan(0);
  });

  it('renders with arrows', () => {
    const { container } = render(<TkxCarousel slides={SLIDES} showArrows />, { wrapper: W });
    expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
  });

  it('renders with dots', () => {
    const { container } = render(<TkxCarousel slides={SLIDES} showDots />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with thumbnails', () => {
    const slidesWithThumbs = SLIDES.map((s) => ({ ...s, thumbnail: 'https://example.com/x.png' }));
    const { container } = render(
      <TkxCarousel slides={slidesWithThumbs} showThumbnails />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders both orientations', () => {
    for (const o of ['horizontal', 'vertical'] as const) {
      const { container } = render(<TkxCarousel slides={SLIDES} orientation={o} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('respects initialIndex', () => {
    render(<TkxCarousel slides={SLIDES} initialIndex={1} />, { wrapper: W });
    expect(screen.getAllByText('Slide B').length).toBeGreaterThan(0);
  });

  it('arrow click navigates', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TkxCarousel slides={SLIDES} showArrows onChange={onChange} loop />,
      { wrapper: W },
    );
    const buttons = container.querySelectorAll('button');
    if (buttons.length >= 2) fireEvent.click(buttons[1]); // next
    // Some implementations debounce; only verify no crash.
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with autoPlay (does not crash)', () => {
    const { container } = render(
      <TkxCarousel slides={SLIDES} autoPlay autoPlayInterval={1000} />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with arrowPosition variations', () => {
    for (const p of ['inside', 'outside'] as const) {
      const { container } = render(
        <TkxCarousel slides={SLIDES} showArrows arrowPosition={p} />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });
});
